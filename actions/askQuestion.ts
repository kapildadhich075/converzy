// actions/askQuestion.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { generateLangchainCompletion } from "@/lib/langchain";

import { getOpenAiModel } from "./generateEmbeddings";
import { Message } from "@/components/Chat";
import { adminDb } from "@/firebaseAdmin";

const PRO_LIMIT = 20;
const FREE_LIMIT = 2;

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

    const chatRef = adminDb
      .collection("users")
      .doc(userId!)
      .collection("files")
      .doc(id)
      .collection("chat");

    const openApiConfig = {}; // Define or import the openApiConfig variable appropriately
    if (openApiConfig === undefined) {
      // check how manu user messages are in the chat
      const chatSnapshot = await chatRef.get();
      const userMessages = chatSnapshot.docs.filter(
        (doc) => doc.data().role === "human"
      );
      const aiMessages = chatSnapshot.docs.filter(
        (doc) => doc.data().role === "ai"
      );

      // check membership limits for messages in a document
      const userRef = await adminDb.collection("users").doc(userId!).get();

      if (!userRef.data()?.hasActiveMembership) {
        if (
          userMessages.length === aiMessages.length &&
          userMessages.length >= FREE_LIMIT
        ) {
          return {
            success: false,
            message: `You'll need to upgrade to PRO to ask more than ${FREE_LIMIT} questions!`,
          };
        }
      }

      // check if user is on PRO plan and has asked more than 100 questions
      if (userRef.data()?.hasActiveMembership) {
        if (
          userMessages.length === aiMessages.length &&
          userMessages.length >= PRO_LIMIT
        ) {
          return {
            success: false,
            message: `You've reached the PRO limit of ${PRO_LIMIT} questions per document!`,
          };
        }
      }
    }

    const userMessage: Message = {
      role: "human",
      message: question,
      createdAt: new Date(),
    };

    await chatRef.add(userMessage);

    // update here
    const { embeddings, model } = await getOpenAiModel(openApiKey, isGemini);

    // Generate AI Response
    const reply = await generateLangchainCompletion(
      id,
      question,
      model,
      embeddings
    );

    console.log(reply);

    const aiMessage: Message = {
      role: "ai",
      message: reply,
      createdAt: new Date(),
    };

    await chatRef.add(aiMessage);

    return { success: true, message: null };
  } catch (err: any) {
    return { success: false, message: JSON.stringify(err.message) };
  }
}
