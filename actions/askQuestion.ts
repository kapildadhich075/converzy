// actions/askQuestion.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { generateLangchainCompletion } from "@/lib/langchain";
import { getOpenAiModel } from "./generateEmbeddings";
import { Message } from "@/components/Chat";
import { adminDb } from "@/firebaseAdmin";
import { PineconeBadRequestError } from "@pinecone-database/pinecone/dist/errors";

const PRO_LIMIT = 30;
const FREE_LIMIT = 15;

export async function askQuestion({
  id,
  question,
  openApiKey,
  isGemini,
}: {
  id: string;
  question: string;
  openApiKey?: string;
  isGemini?: boolean;
}) {
  try {
    auth().protect();
    const { userId } = await auth();

    if (!userId) {
      return { success: false, message: "User not authenticated" };
    }

    const chatRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("files")
      .doc(id)
      .collection("chat");

    // Check user limits
    if (!openApiKey) {
      const { userMessageCount, aiMessageCount } = await getChatMessageCounts(
        chatRef
      );
      const userRef = await adminDb.collection("users").doc(userId).get();
      const hasActiveMembership = userRef.data()?.hasActiveMembership;

      if (!hasActiveMembership && userMessageCount >= FREE_LIMIT) {
        return {
          success: false,
          message: `You'll need to upgrade to PRO to ask more than ${FREE_LIMIT} questions!`,
        };
      }

      if (hasActiveMembership && userMessageCount >= PRO_LIMIT) {
        return {
          success: false,
          message: `You've reached the PRO limit of ${PRO_LIMIT} questions per document!`,
        };
      }
    }

    // Add user message to chat
    const userMessage: Message = {
      role: "human",
      message: question,
      createdAt: new Date(),
    };
    await chatRef.add(userMessage);

    // Get model and embeddings
    let embeddings, model;
    try {
      ({ embeddings, model } = await getOpenAiModel(openApiKey, isGemini));
    } catch (error: any) {
      console.error("Error getting OpenAI model:", error);
      return {
        success: false,
        message: "Failed to initialize AI model. Please try again.",
      };
    }

    // Generate AI Response
    let reply;
    try {
      reply = await generateLangchainCompletion(
        id,
        question,
        model,
        embeddings
      );
    } catch (error: any) {
      console.error("Error generating completion:", error);
      if (
        error instanceof PineconeBadRequestError &&
        error.message.includes("Vector dimension")
      ) {
        const currentDimension = error.message.match(
          /Vector dimension (\d+)/
        )?.[1];
        const expectedDimension = error.message.match(
          /dimension of the index (\d+)/
        )?.[1];
        return {
          success: false,
          message: `There's a mismatch in vector dimensions. Current: ${currentDimension}, Expected: ${expectedDimension}. Please contact support to update the index configuration.`,
        };
      }
      return {
        success: false,
        message: "Failed to generate response. Please try again.",
      };
    }

    // Add AI response to chat
    const aiMessage: Message = {
      role: "ai",
      message: reply,
      createdAt: new Date(),
    };
    await chatRef.add(aiMessage);

    return { success: true, message: null };
  } catch (err: any) {
    console.error("Unexpected error in askQuestion:", err);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

async function getChatMessageCounts(
  chatRef: FirebaseFirestore.CollectionReference
) {
  const chatSnapshot = await chatRef.get();
  const userMessages = chatSnapshot.docs.filter(
    (doc) => doc.data().role === "human"
  );
  const aiMessages = chatSnapshot.docs.filter(
    (doc) => doc.data().role === "ai"
  );
  return {
    userMessageCount: userMessages.length,
    aiMessageCount: aiMessages.length,
  };
}
