import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Basic HTML sanitizer to prevent XSS in emails
const sanitizeHtml = (str: string) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Rate limiter: max 5 requests per IP per hour
const notifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: "Too many requests from this IP, please try again after an hour" },
  standardHeaders: true,
  legacyHeaders: false,
});

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/notify", notifyLimiter, async (req, res) => {
    const { fullName, projectScale, preferredDate } = req.body;
    
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Skipping email notification.");
      return res.json({ success: true, note: "No API key, email skipped." });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Sanitize inputs
    const safeName = sanitizeHtml(fullName);
    const safeScale = sanitizeHtml(projectScale);
    const safeDate = sanitizeHtml(preferredDate);

    try {
      await resend.emails.send({
        from: "Danuthia & Co. <onboarding@resend.dev>",
        to: "machariag605@gmail.com",
        subject: `New Booking Request: ${safeName}`,
        html: `
          <h2>New Consultation Request</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Project Scale:</strong> ${safeScale}</p>
          <p><strong>Preferred Date:</strong> ${safeDate}</p>
          <br/>
          <p>Log in to your Admin Dashboard to view and manage this request.</p>
        `
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to send email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
