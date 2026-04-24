import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async getMedicineSuggestions(query: string) {
    if (!query || query.length < 2) return [];
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a list of common medicine names matching the query: "${query}". 
        Include popular brand names used in Bangladesh or internationally. 
        Format as a simple JSON array of strings: ["Name 1", "Name 2"].`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
      return [];
    } catch (error) {
      console.error("Gemini Error:", error);
      return [];
    }
  },

  async getMedicineInteractions(medicines: string[]) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze potential drug interactions or general warnings for this list of medicines: ${medicines.join(', ')}. 
        Provide a professional summary suitable for a pharmacist's dashboard.`,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Interaction Error:", error);
      return "Unable to fetch AI insights at this time.";
    }
  },

  async getBusinessInsights(stats: any, inventory: any[]) {
    try {
      const lowStock = inventory.filter(m => m.stock <= m.minStockAlert).map(m => m.name);
      const expired = inventory.filter(m => new Date(m.expiryDate) < new Date()).map(m => m.name);
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `As a professional pharmacy business consultant, analyze these shop statistics:
        Total Sales: ${stats.totalSales}
        Total Profit: ${stats.totalProfit}
        Low Stock Items: ${lowStock.join(', ')}
        Expired Items: ${expired.join(', ')}
        
        Provide 3-4 concise, actionable "Pro Level" tips for the owner to increase profit or improve efficiency. 
        Focus on inventory rotation, sales trends, and customer safety. 
        Format as a short list of bullet points.`,
      });
      return response.text;
    } catch (error) {
       console.error("Gemini Insight Error:", error);
       return "Focus on restock of top selling items and check for expired stock regularly.";
    }
  }
};
