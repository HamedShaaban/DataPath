import { createApp } from "./_core/app";
import { Sentry } from "./_core/instrument.js";

// Vercel owns the HTTP listener. Static assets are served separately by its CDN.
const app = createApp();
app.use((_req, res) => res.status(404).json({ error: "Not found" }));
Sentry.setupExpressErrorHandler(app);
export default app;
