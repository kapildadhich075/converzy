"use server";
import { generateEmbeddingsInPineconeVectorStore } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";
// update here if gemini is added
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { revalidatePath } from "next/cache";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

export async function generateEmbeddings(
  docId: string,
  openApiKey?: string,
  isGemini?: boolean
) {
  try {
    auth().protect();
    // turn a PDF into embeddings [0.012345, 0.2324242, ...]

    // update here
    const { embeddings, model } = await getOpenAiModel(openApiKey, isGemini);

    await generateEmbeddingsInPineconeVectorStore(docId, model, embeddings);

    revalidatePath("/dashboard");

    return { compiled: true };
  } catch (err: any) {
    console.log(err);
    return { compiled: false, error: JSON.stringify(err.message) };
  }
}

export async function getOpenAiModel(openApiKey?: string, isGemini?: boolean) {
  let model;
  let embeddings;
  if (isGemini) {
    model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: "gemini-1.5-pro",
      maxOutputTokens: 2048,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
      ],
    });
    embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: "embedding-001",
    });
  } else if (openApiKey) {
    model = new ChatOpenAI({
      apiKey: openApiKey,
      modelName: "gpt-4o",
    });
    embeddings = new OpenAIEmbeddings({
      apiKey: openApiKey,
    });
  } else {
    model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o",
    });
    embeddings = new OpenAIEmbeddings();
  }
  return { model, embeddings };
}
