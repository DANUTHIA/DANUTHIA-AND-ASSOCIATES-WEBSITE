import { loadEnv } from 'vite';

const env = loadEnv('development', '.', '');
console.log("GEMINI_API_KEY from loadEnv:", !!env.GEMINI_API_KEY);
console.log("GEMINI_API_KEY from process.env:", !!process.env.GEMINI_API_KEY);
