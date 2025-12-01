import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MathResponseData } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    theory: {
      type: Type.STRING,
      description: "Nhắc lại các kiến thức toán học, định lý, công thức liên quan cần thiết để giải bài toán này. Trình bày rõ ràng, dùng LaTeX cho công thức.",
    },
    hint: {
      type: Type.STRING,
      description: "Hướng dẫn giải ngắn gọn, tóm tắt các bước tiếp cận vấn đề mà không đi sâu vào chi tiết tính toán.",
    },
    solution: {
      type: Type.STRING,
      description: "Lời giải chi tiết từng bước (step-by-step), bao gồm cả phép tính và kết quả cuối cùng. Sử dụng LaTeX cho công thức toán học.",
    },
  },
  required: ["theory", "hint", "solution"],
};

export const solveMathProblem = async (
  prompt: string,
  fileBase64?: string,
  mimeType?: string
): Promise<MathResponseData> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });

    const parts: any[] = [];
    
    // Add file part if exists
    if (fileBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: fileBase64,
          mimeType: mimeType,
        },
      });
    }

    // Add text prompt
    const finalPrompt = prompt 
      ? prompt 
      : "Hãy giải bài toán trong hình/tài liệu này. Nếu không thấy bài toán cụ thể, hãy tóm tắt nội dung toán học chính.";
      
    parts.push({
      text: finalPrompt
    });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        role: "user",
        parts: parts
      },
      config: {
        systemInstruction: "Bạn là 'ĐM Bài tập về nhà', một trợ lý AI chuyên nghiệp hỗ trợ học sinh học Toán, được thiết kế bởi Chân Đức. Nhiệm vụ của bạn là giải bài tập toán một cách sư phạm, dễ hiểu. Bạn PHẢI trả lời bằng tiếng Việt. Mọi công thức toán học phải được viết dưới dạng LaTeX, bọc trong cặp dấu $ (ví dụ $x^2 + 2x + 1 = 0$). Đảm bảo JSON trả về hợp lệ.",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for precise math
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    const data = JSON.parse(responseText) as MathResponseData;
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};