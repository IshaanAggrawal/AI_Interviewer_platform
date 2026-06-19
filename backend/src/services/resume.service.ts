import pdfParse from "pdf-parse";

/**
 * Extracts text from a PDF buffer in-memory.
 */
export const extractTextFromPdf = async (buffer: Buffer): Promise<string> => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    throw new Error("Failed to parse PDF document");
  }
};
