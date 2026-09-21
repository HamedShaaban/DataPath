import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAIJson, invokeLLM } from "./_core/llm";
import { reserveAI, settleAI } from "./ai-budget";
vi.mock("./_core/env", () => ({
  ENV: { forgeApiKey: "test-only", forgeApiUrl: "https://provider.example" },
}));
vi.mock("./ai-budget", () => ({ reserveAI: vi.fn(), settleAI: vi.fn() }));
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  vi.stubEnv("AI_MODEL", "test-model-v1");
  vi.stubEnv("AI_INPUT_USD_PER_MILLION", "1");
  vi.stubEnv("AI_OUTPUT_USD_PER_MILLION", "2");
  vi.stubEnv("AI_MONTHLY_CAP_USD", "10");
  vi.stubEnv("AI_TIMEOUT_MS", "100");
  vi.mocked(reserveAI).mockResolvedValue({ id: "reservation" } as any);
  vi.mocked(settleAI).mockResolvedValue();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
const params = {
  userId: 1,
  messages: [{ role: "user" as const, content: "Hello" }],
  max_tokens: 100,
};
describe("AI provider hardening", () => {
  it("pins the configured model and records successful usage", async () => {
    const usage = {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30,
    };
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ choices: [], usage })));
    vi.stubGlobal("fetch", fetcher);
    await invokeLLM(params);
    expect(JSON.parse(fetcher.mock.calls[0][1].body).model).toBe(
      "test-model-v1"
    );
    expect(reserveAI).toHaveBeenCalledWith(1, expect.any(Number), 100);
    expect(settleAI).toHaveBeenCalledWith({ id: "reservation" }, 1, usage);
  });
  it("retries a transient response once, then succeeds", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response("busy", { status: 429 }))
      .mockResolvedValueOnce(new Response('{"choices":[]}'));
    vi.stubGlobal("fetch", fetcher);
    const pending = invokeLLM(params);
    await vi.runAllTimersAsync();
    await pending;
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(settleAI).toHaveBeenCalledWith({ id: "reservation" }, 2, undefined);
  });
  it("stops after the single retry and retains unknown usage", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response("private provider text", { status: 503 })
      );
    vi.stubGlobal("fetch", fetcher);
    const assertion = expect(invokeLLM(params)).rejects.toThrow("HTTP 503");
    await vi.runAllTimersAsync();
    await assertion;
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(settleAI).toHaveBeenCalledWith({ id: "reservation" }, 2, undefined);
  });
  it("does not retry authentication failures", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response("secret", { status: 401 }));
    vi.stubGlobal("fetch", fetcher);
    await expect(invokeLLM(params)).rejects.toThrow("HTTP 401");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("times out a stalled body and allows only one retry", async () => {
    const fetcher = vi
      .fn()
      .mockImplementation((_url, init) =>
        Promise.resolve({
          ok: true,
          json: () =>
            new Promise((_resolve, reject) =>
              init.signal.addEventListener("abort", () =>
                reject(new DOMException("Aborted", "AbortError"))
              )
            ),
        })
      );
    vi.stubGlobal("fetch", fetcher);
    const assertion = expect(
      fetchAIJson("https://provider.example", {})
    ).rejects.toThrow("Aborted");
    await vi.runAllTimersAsync();
    await assertion;
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("does not call a provider when budget reservation fails", async () => {
    vi.mocked(reserveAI).mockRejectedValueOnce(new Error("Budget exhausted"));
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(invokeLLM(params)).rejects.toThrow("Budget exhausted");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("rejects a model override or unbounded output", async () => {
    await expect(invokeLLM({ ...params, model: "other" })).rejects.toThrow(
      "configured model"
    );
    await expect(invokeLLM({ ...params, max_tokens: 999999 })).rejects.toThrow(
      "bounded"
    );
    expect(reserveAI).not.toHaveBeenCalled();
  });
});
