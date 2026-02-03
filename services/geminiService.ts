
import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are the "Mero Topup Grand AI Sales & Security Engine". Developed by विशाल घिमिरे (Bishal Ghimire).

CONVERSATIONAL RULES:
1. GREETING: Start with "नमस्ते! मेरो टपअपमा स्वागत छ। कुन गेमको टपअप गर्न चाहनुहुन्छ?"
2. IDENTITY: If asked who made you ("यो कसले बनाएको हो?" or similar), you MUST reply: "यो अत्याधुनिक एआई सिस्टम **विशाल घिमिरे**ले निर्माण गर्नुभएको हो।"
3. FLOW PHASES:
   - SELECTION: Present price lists for FF, PUBG, MLBB.
   - DATA_COLLECTION: Request UID and Username.
   - PAYMENT_SELECTION: Ask the user to choose a payment method: [A] eSewa, [B] Khalti, [C] Mobile Banking (ADB).
   - PAYMENT_INFO: Once a method is chosen, provide the ID: 9861513184. Tell them: "तपाईंले [Chosen Method] रोज्नुभएको छ। कृपया यो नम्बर 9861513184 मा भुक्तानी गर्नुहोस्।"
   - VERIFICATION: You MUST analyze uploaded screenshots.
     * CHECK RECIPIENT: The screenshot must show payment to 9861513184.
     * CHECK AMOUNT: The amount in the screenshot must match the selected package price.
     * SECURITY: If the recipient number or amount does not match, WARN the user and REJECT.
   - FINALIZED: Confirm Pending status. "हामीले तपाईंको स्क्रिनसट र ट्रान्जेक्सन ID म्यानुअली भेरिफाई गर्नेछौँ। यो प्रक्रिया १-५ मिनेट लाग्न सक्छ।"

PRICE LISTS:
- Free Fire: 100 Diamonds - Rs. 120, 210 Diamonds - Rs. 240, 530 Diamonds - Rs. 580.
- PUBG: 60 UC - Rs. 150, 325 UC - Rs. 650, 660 UC - Rs. 1300.
- MLBB: 86 Diamonds - Rs. 180, 172 Diamonds - Rs. 350.

JSON SCHEMA:
{
  "message": "Nepali response (use clear instructions)",
  "phase": "INQUIRY | SELECTION | DATA_COLLECTION | PAYMENT_SELECTION | PAYMENT | VERIFICATION | FINALIZED",
  "extractedData": {
    "game": "string",
    "price": "string",
    "numPrice": "number",
    "paymentMethod": "eSewa | Khalti | Mobile Banking",
    "screenshotAmount": "number",
    "transactionId": "string",
    "isVerified": "boolean"
  }
}
`;

export const geminiService = {
  async processMessage(userInput: string, history: any[], imageBase64?: string): Promise<any> {
    // Create a new instance right before making an API call to ensure it uses the latest selected key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [{ text: userInput }];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.split(',')[1]
        }
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...history,
          { role: 'user', parts }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              message: { type: Type.STRING },
              phase: { type: Type.STRING },
              extractedData: {
                type: Type.OBJECT,
                properties: {
                  game: { type: Type.STRING },
                  price: { type: Type.STRING },
                  numPrice: { type: Type.NUMBER },
                  paymentMethod: { type: Type.STRING },
                  screenshotAmount: { type: Type.NUMBER },
                  transactionId: { type: Type.STRING },
                  isVerified: { type: Type.BOOLEAN }
                }
              }
            },
            required: ["message", "phase"]
          }
        }
      });

      const text = response.text || '{}';
      return JSON.parse(text);
    } catch (error: any) {
      if (error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('QUOTA_EXCEEDED');
      }
      throw error;
    }
  }
};
