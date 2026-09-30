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
:root{color-scheme:light;--page:#f5f6f6;--surface:#ffffff;--text:#202725;--muted:#555e5c;--line:#c8cecc;--accent:#236657;--radius:8px;background:var(--page);color:var(--text);font:16px/1.6 Inter,ui-sans-serif,system-ui,sans-serif}
*{box-sizing:border-box}body{margin:0}main{max-width:1120px;margin:auto;padding:64px 24px 96px;overflow-wrap:anywhere}
.brand{font-weight:600;color:var(--accent);margin-bottom:24px}.hero{padding:24px 0;border-bottom:1px solid var(--line)}.hero h1{font-size:48px;line-height:1.2;margin:16px 0}.handle{color:var(--muted)}
.targets{display:flex;gap:16px;flex-wrap:wrap}.tag{color:var(--muted)}.trust{max-width:68ch;margin:32px 0;line-height:1.6}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));gap:16px;margin-top:24px;align-items:start}
.credential{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:24px}.credential span{color:var(--accent);font-size:14px;font-weight:600}.credential h2{font-size:20px;margin:12px 0 24px}.credential p{color:var(--muted);margin:0}
.empty{padding:24px 0;color:var(--muted)}footer{margin-top:40px;color:var(--muted);font-size:14px}
@media(max-width:600px){main{padding:40px 16px}.hero h1{font-size:32px}}
</style></head><body><main>
<div class="brand">DataPath · Public proof</div>
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
