import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';

const clientProfileExtractionTool: FunctionDeclaration = {
  name: "client_profile_extraction",
  description: "Extracts highly structured data from a prospective client inquiry regarding an architectural or urban planning project.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      client: {
        type: Type.OBJECT,
        properties: {
          full_name: {
            type: Type.STRING,
            description: "The prospective client's full name."
          },
          contact_preference: {
            type: Type.STRING,
            enum: ["email", "phone", "unspecified"],
            description: "How the client prefers to be contacted."
          }
        },
        required: ["full_name"]
      },
      project: {
        type: Type.OBJECT,
        properties: {
          scope: {
            type: Type.STRING,
            description: "A brief summary of the project (e.g., residential design, commercial development, regional GIS mapping)."
          },
          location: {
            type: Type.STRING,
            description: "The geographical location or site of the proposed project."
          },
          budget_tier: {
            type: Type.STRING,
            enum: ["low", "medium", "high", "enterprise", "undecided"],
            description: "The client's indicated budget range or tier."
          },
          urgency_flag: {
            type: Type.BOOLEAN,
            description: "True if the client requires immediate consultation or has an expedited, high-priority timeline."
          }
        },
        required: ["scope", "location", "urgency_flag"]
      }
    },
    required: ["client", "project"]
  }
};

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Hello",
      config: {
        tools: [{ functionDeclarations: [clientProfileExtractionTool] }],
        systemInstruction: "Test"
      }
    });
    console.log("Success:", response.text);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

test();
