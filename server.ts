import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes

  // HTTP Tarpit Defense Endpoint
  // This intentionally holds the connection open and replies very slowly 
  // to frustrate bot scanners and brute-force attacks
  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    
    // Tarpit logic: Instead of rejecting immediately, we trap the request
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Transfer-Encoding", "chunked");
    res.status(401);

    let chunkCount = 0;
    const maxChunks = 20; // Hold connection for 20 seconds
    
    // Send initial padding so client doesn't time out immediately
    res.write('{"status": "processing" ');

    const interval = setInterval(() => {
      res.write(' '); // Send whitespace to keep connection alive
      chunkCount++;
      
      if (chunkCount >= maxChunks) {
        clearInterval(interval);
        res.end(', "error": "Invalid credentials"}');
      }
    }, 1000);

    // Clear interval if hacker gives up and closes connection early
    req.on("close", () => {
      clearInterval(interval);
    });
  });

  app.post("/api/notify", async (req, res) => {
    const { fullName, projectScale, preferredDate } = req.body;
    
    if (!resend) {
      console.warn("RESEND_API_KEY is not set. Skipping email notification.");
      return res.json({ success: true, note: "No API key, email skipped." });
    }

    try {
      await resend.emails.send({
        from: "Danuthia Associates Construction LLc <onboarding@resend.dev>",
        to: "machariag605@gmail.com",
        subject: `New Booking Request: ${fullName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #B08D57;">New Consultation Request</h2>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Project Scale:</strong> ${projectScale}</p>
            <p><strong>Preferred Date:</strong> ${preferredDate}</p>
            <br/>
            <p>Log in to your Admin Dashboard to view and manage this request.</p>
          </div>
        `
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to send email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  app.post("/api/send-thank-you", async (req, res) => {
    const { email, name } = req.body;
    if (!resend) return res.json({ success: true });

    try {
      await resend.emails.send({
        from: "Danuthia Associates Construction LLc <onboarding@resend.dev>",
        to: email,
        subject: "Thank You for Your Booking",
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h1 style="color: #B08D57;">Thank You, ${name}!</h1>
            <p>We've received your booking request and our team will review it shortly.</p>
            <p>We'll be in touch soon to confirm the details of your consultation.</p>
            <br/>
            <p>Best regards,<br/>The Danuthia Associates Construction LLc Team</p>
          </div>
        `
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  app.post("/api/send-reminder", async (req, res) => {
    const { email, name, projectTitle } = req.body;
    if (!resend) return res.json({ success: true });

    try {
      await resend.emails.send({
        from: "Danuthia Associates Construction LLc <onboarding@resend.dev>",
        to: email,
        subject: `Project Update: ${projectTitle}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h1 style="color: #B08D57;">Hello ${name},</h1>
            <p>There's a new update available for your project: <strong>${projectTitle}</strong>.</p>
            <p>Log in to your Client Portal to view the latest blueprints and project milestones.</p>
            <br/>
            <a href="${req.headers.origin}/portal" style="background-color: #B08D57; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Client Portal</a>
            <br/><br/>
            <p>Best regards,<br/>The Danuthia Associates Construction LLc Team</p>
          </div>
        `
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    const { invoiceId, amount, description, clientId } = req.body;

    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Invoice: ${description}`,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/portal?payment=success&invoiceId=${invoiceId}`,
        cancel_url: `${req.headers.origin}/portal?payment=cancelled`,
        metadata: {
          invoiceId,
          clientId,
        },
      });

      res.json({ id: session.id, url: session.url });
    } catch (error) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
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
