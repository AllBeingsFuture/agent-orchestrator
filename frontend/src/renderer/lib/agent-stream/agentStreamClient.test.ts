import { describe, expect, it, vi } from "vitest";
import { cancelAgentStream, sendAgentStreamPrompt } from "./agentStreamClient";

describe("agentStreamClient", () => {
	it("POSTs prompt text", async () => {
		const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
		await sendAgentStreamPrompt("s1", "hello", fetchImpl as unknown as typeof fetch, "http://127.0.0.1:3001");
		expect(fetchImpl).toHaveBeenCalledWith(
			"http://127.0.0.1:3001/api/v1/sessions/s1/agent-stream/prompt",
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({ text: "hello" }),
			}),
		);
	});

	it("POSTs cancel", async () => {
		const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
		await cancelAgentStream("s1", fetchImpl as unknown as typeof fetch, "http://127.0.0.1:3001");
		expect(fetchImpl).toHaveBeenCalledWith(
			"http://127.0.0.1:3001/api/v1/sessions/s1/agent-stream/cancel",
			expect.objectContaining({ method: "POST" }),
		);
	});
});
