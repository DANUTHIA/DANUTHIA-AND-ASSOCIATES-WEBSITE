import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    console.log('Generating image...');
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: 'A 3D architectural master plan rendering of the Kisumu waterfront in Kenya. Modern urban planning, geometric grid layout, sustainable infrastructure, parks, and water edge. Professional architectural visualization, dark background, steel blue and bronze accents, highly detailed, 8k resolution.',
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        fs.mkdirSync('public', { recursive: true });
        fs.writeFileSync('public/kisumu-waterfront.png', Buffer.from(base64Data, 'base64'));
        console.log('Image generated successfully at public/kisumu-waterfront.png');
        return;
      }
    }
    console.log('No image data found in response.');
  } catch (e) {
    console.error('Error generating image:', e);
  }
}
run();
