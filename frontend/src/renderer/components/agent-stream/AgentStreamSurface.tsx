/**
 * Stream conversation chrome: timeline + activity + optional composer.
 * Primary agent UX — not an xterm/tmux attach surface.
 */

import type { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { AgentActivityPanel } from "./AgentActivityPanel";
import { AgentStreamTimeline } from "./AgentStreamTimeline";
import type { UseAgentStreamResult } from "../../hooks/useAgentStream";
import { cn } from "../../lib/utils";

export interface AgentStreamSurfaceProps {
	agentStream: UseAgentStreamResult;
	className?: string;
	/** Optional header label */
	title?: string;
	/** Composer slot (send prompt). */
	composer?: ReactNode;
}

export function AgentStreamSurface({
	agentStream,
	className,
	title = "Agent stream",
	composer,
}: AgentStreamSurfaceProps) {
	const { messages, stream, streaming, error, connection, respondToPermission, requestCancel } = agentStream;

	return (
		<section
			aria-label={title}
			className={cn("flex h-full min-h-0 flex-col bg-background", className)}
			data-testid="agent-stream-surface"
			data-connection={connection}
		>
			<header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-2">
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					{streaming ? (
						<LoaderCircle className="size-3.5 animate-spin text-status-working" aria-hidden="true" />
					) : null}
					<span className="font-medium text-foreground">{title}</span>
					<span className="text-passive">·</span>
					<span className="capitalize">{stream.phase}</span>
					{connection !== "idle" && connection !== "open" ? (
						<>
							<span className="text-passive">·</span>
							<span className="text-passive">{connection}</span>
						</>
					) : null}
				</div>
				{streaming ? (
					<button
						type="button"
						className="rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-interactive-hover disabled:opacity-50"
						onClick={() => void requestCancel()}
						disabled={stream.phase === "cancelling"}
					>
						{stream.phase === "cancelling" ? "Cancelling…" : "Stop"}
					</button>
				) : null}
			</header>

			<div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
				<AgentStreamTimeline messages={messages} streaming={streaming} />
			</div>

			<div className="shrink-0 space-y-2 border-t border-border px-4 py-3">
				{error ? (
					<p className="text-xs text-destructive" role="alert">
						{error}
					</p>
				) : null}
				<AgentActivityPanel stream={stream} onPermissionResponse={respondToPermission} />
				{composer}
			</div>
		</section>
	);
}
