import type { Express, Request, Response } from "express";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type PublicProof = NonNullable<
  Awaited<
    ReturnType<ReturnType<typeof appRouter.createCaller>["proof"]["getPublic"]>
  >
>;

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    character =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!
  );
}

export function renderPublicProofPage(
  proof: PublicProof,
  handle: string,
  canonicalUrl: string
) {
  const safeName = escapeHtml(proof.displayName);
  const safeHandle = escapeHtml(handle);
  const description = `Server-verified DataPath credentials for ${proof.displayName}.`;
  const credentials = proof.credentials
    .map(
      credential => `<article class="credential">
        <span>${escapeHtml(
          credential.type === "skill_cert"
            ? "Verified skill"
            : credential.type === "lab_pass"
              ? "Verified SQL lab"
              : "Verified project"
        )}</span>
        <h2>${escapeHtml(credential.title)}</h2>
        <p>Verified ${new Date(credential.verifiedAt).toLocaleDateString("en", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        })}</p>
      </article>`
    )
    .join("");
  const targets = [proof.targetRole, proof.industry]
    .filter(Boolean)
    .map(value => `<span class="tag">${escapeHtml(value!)}</span>`)
    .join("");
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${safeName} · Verified DataPath proof</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:type" content="profile"><meta property="og:title" content="${safeName} · Verified DataPath proof">
<meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonicalUrl)}">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${safeName} · Verified DataPath proof">
<meta name="twitter:description" content="${escapeHtml(description)}">
<style>
:root{color-scheme:light;background:#f4f7f5;color:#16251e;font-family:Inter,ui-sans-serif,system-ui,sans-serif}*{box-sizing:border-box}body{margin:0}main{max-width:960px;margin:auto;padding:64px 24px 96px}.brand{font-weight:800;letter-spacing:.08em;color:#176b4d}.hero{padding:48px;border-radius:28px;background:#123c2f;color:white;box-shadow:0 22px 60px #123c2f22}.hero h1{font-size:clamp(2.2rem,7vw,4.8rem);line-height:1;margin:14px 0}.handle{color:#b9dbce}.targets,.grid{display:flex;gap:12px;flex-wrap:wrap}.tag{padding:8px 12px;border-radius:999px;background:#ffffff1c}.trust{margin:28px 0;padding:18px 22px;border-left:4px solid #31a879;background:white;border-radius:12px;line-height:1.6}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-top:24px}.credential{background:white;border:1px solid #dce8e1;border-radius:18px;padding:24px}.credential span{color:#176b4d;font-size:.76rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.credential h2{margin:10px 0 22px}.credential p{color:#62736b;margin:0}.empty{padding:48px;text-align:center;background:white;border-radius:18px;color:#62736b}footer{margin-top:42px;color:#62736b}@media(max-width:600px){main{padding:28px 16px}.hero{padding:30px 24px}}
</style></head><body><main>
<div class="brand">DATAPATH · PROOF</div>
<section class="hero"><p class="handle">@${safeHandle}</p><h1>${safeName}</h1>${targets ? `<div class="targets">${targets}</div>` : ""}</section>
<p class="trust"><strong>Server-verified evidence.</strong> Submitted answers or SQL were checked by the server when earned. Practice questions and solutions are available in the app; these results are not proctored or independent certification.</p>
${credentials ? `<section class="grid" aria-label="Verified credentials">${credentials}</section>` : '<p class="empty">No public credentials yet.</p>'}
<footer>Only credentials this learner chose to show are listed.</footer>
</main></body></html>`;
}

export function registerProofPage(app: Express) {
  app.get("/p/:handle", async (req: Request, res: Response, next) => {
    res.set("Cache-Control", "no-store");
    try {
      const caller = appRouter.createCaller({
        req,
        res,
        user: null,
      } as TrpcContext);
      const proof = await caller.proof.getPublic({ handle: req.params.handle });
      if (!proof) {
        res
          .status(404)
          .type("html")
          .send(
            "<!doctype html><title>Proof page not found</title><main><h1>Proof page not found</h1><p>This page is unavailable or private.</p></main>"
          );
        return;
      }
      const canonicalUrl = `${req.protocol}://${req.get("host")}/p/${encodeURIComponent(req.params.handle)}`;
      res
        .status(200)
        .set("Cache-Control", "no-store")
        .type("html")
        .send(renderPublicProofPage(proof, req.params.handle, canonicalUrl));
    } catch (error) {
      if (error instanceof TRPCError && error.code === "TOO_MANY_REQUESTS") {
        res.status(429).send("Too many requests");
        return;
      }
      if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
        res.status(404).send("Proof page not found");
        return;
      }
      next(error);
    }
  });
}
