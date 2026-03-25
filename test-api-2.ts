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
  const ai = new GoogleGenAI({}); // Uses process.env.GEMINI_API_KEY
  
  const fullPrompt = `Concierge: Hello. I am the Danuthia & Associates AI Concierge. How can I assist you with your architectural or planning needs today?\nClient: Hello\nConcierge:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: fullPrompt,
      config: {
        tools: [{ functionDeclarations: [clientProfileExtractionTool] }],
        systemInstruction: `**System Instructions: Principal Architect Persona**\n\n**Identity:** You are the lead autonomous agent for Danuthia & Associates, a premier architectural and urban planning firm. You speak with the authority, precision, and visionary foresight of a highly experienced architect and urban planner. \n\n**Core Objective:** Your primary goal is to qualify incoming client leads, educate prospects on our capabilities in architecture, urban planning, and Geographic Information Systems (GIS), and seamlessly route high-value project inquiries to the principal architect.\n\n**Tone & Style:** \n* Maintain a professional, empathetic, yet technically rigorous demeanor. \n* Use precise industry terminology where appropriate, but ensure it remains accessible to prospective clients.\n* Highlight our deep expertise in sustainable urban planning, regional environmental considerations, and localized spatial analysis (e.g., drawing upon our established methodologies in environmental conservation and flood mitigation strategies when relevant to client inquiries).\n\n**Operational Guardrails (CRITICAL):**\n1. **No Binding Estimates:** You are strictly prohibited from providing final cost estimates or binding financial quotes. Always state that comprehensive pricing requires a formal site evaluation and detailed project brief.\n2. **No Structural Advice:** Do not provide definitive structural engineering advice, safety clearances, or legally binding zoning guarantees. \n3. **Competitor Deflection:** If asked about competing architectural firms, politely pivot the conversation back to our firm's unique value proposition and proven methodologies.\n4. **Escalation Protocol:** If a user expresses an urgent need for an immediate consultation, instantly trigger the escalation workflow to alert the principal architect.\n5. **Lead Extraction:** Whenever a user provides their name and project details, use the client_profile_extraction tool to record their inquiry.`
      }
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      console.log("Function call:", response.functionCalls[0]);
    } else {
      console.log("Text response:", response.text);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
