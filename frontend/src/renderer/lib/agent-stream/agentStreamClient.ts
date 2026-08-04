/**
 * HTTP client helpers for the provisional agent-stream control plane.
 * SSE is handled by agentStreamTransport; this module covers prompt / cancel.
 */

export const AGENT_STREAM_PROMPT_PATH = "/api/v1/sessions/{sessionId}/agent-stream/prompt" as const;
export const AGENT_STREAM_CANCEL_PATH = "/api/v1/sessions/{sessionId}/agent-stream/cancel" as const;

async function readErrorMessage(res: Response): Promise<string> {
	let detail = res.statusText;
	try {
		const body = (await res.json()) as { error?: { message?: string }; message?: string };
		detail = body.error?.message ?? body.message ?? detail;
	} catch {
		// ignore JSON parse failures
	}
	return detail || `Request failed (${res.status})`;
}

function sessionUrl(baseUrl: string | undefined, sessionId: string, suffix: string): string {
	const root = (baseUrl ?? "").replace(/\/+$/, "");
	const path = `/api/v1/sessions/${encodeURIComponent(sessionId)}${suffix}`;
	return root ? `${root}${path}` : path;
}

export async function sendAgentStreamPrompt(
	sessionId: string,
	text: string,
	fetchImpl: typeof fetch = fetch,
	baseUrl?: string,
): Promise<void> {
	const res = await fetchImpl(sessionUrl(baseUrl, sessionId, "/agent-stream/prompt"), {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		body: JSON.stringify({ text }),
	});
	if (!res.ok) throw new Error(await readErrorMessage(res));
}

export async function cancelAgentStream(
	sessionId: string,
	fetchImpl: typeof fetch = fetch,
	baseUrl?: string,
): Promise<void> {
	const res = await fetchImpl(sessionUrl(baseUrl, sessionId, "/agent-stream/cancel"), {
		method: "POST",
		headers: { Accept: "application/json" },
	});
	if (!res.ok) throw new Error(await readErrorMessage(res));
}
