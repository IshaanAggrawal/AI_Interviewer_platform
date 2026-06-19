const { createClient } = require("@deepgram/sdk");
import fs from "fs";
import { AppError } from "../middlewares/error-handler";

const deepgram = createClient(process.env.DEEPGRAM_API_KEY || "");

/**
 * Transcribes an audio buffer to text using Deepgram STT.
 */
export const transcribeAudio = async (buffer: Buffer, mimetype: string): Promise<string> => {
  if (!process.env.DEEPGRAM_API_KEY) {
    throw new AppError(500, "Deepgram API key is missing");
  }

  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: "nova-2",
        smart_format: true,
      }
    );

    if (error) {
      console.error("Deepgram STT Error:", error);
      throw new AppError(500, "Failed to transcribe audio");
    }

    const transcript = result?.results?.channels[0]?.alternatives[0]?.transcript || "";
    return transcript;
  } catch (error) {
    console.error("Deepgram STT Exception:", error);
    throw new AppError(500, "Failed to transcribe audio");
  }
};

/**
 * Generates speech from text using Deepgram Aura TTS.
 * Returns the audio buffer.
 */
export const generateSpeech = async (text: string): Promise<Buffer> => {
  if (!process.env.DEEPGRAM_API_KEY) {
    throw new AppError(500, "Deepgram API key is missing");
  }

  try {
    const response = await deepgram.speak.request(
      { text },
      {
        model: "aura-asteria-en",
        encoding: "mp3",
      }
    );

    const stream = await response.getStream();
    if (!stream) {
      throw new Error("No stream returned from Deepgram TTS");
    }

    const buffer = await streamToBuffer(stream);
    return buffer;
  } catch (error) {
    console.error("Deepgram TTS Error:", error);
    throw new AppError(500, "Failed to generate speech");
  }
};

// Helper to convert readable stream to Buffer
const streamToBuffer = async (stream: ReadableStream): Promise<Buffer> => {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
};
