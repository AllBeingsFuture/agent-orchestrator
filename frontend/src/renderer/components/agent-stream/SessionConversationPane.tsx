/**
 * Primary session center surface: ACP stream conversation (not xterm/tmux).
 *
 * Agent output is read from sequenced AgentStreamEvent frames. The legacy
 * terminal mux attach path is intentionally not mounted here.
 */

import type { ReactNode } from "react";
import { AgentStreamComposer } from "./AgentStreamComposer";
import { AgentStreamSurface } from "./AgentStreamSurface";
import { useAgentStream } from "../../hooks/useAgentStream";
import { SessionTopbarPortal } from "../SessionTopbarPortal";
import type { WorkspaceSession } from "../../types/workspace";
import { isOrchestratorSession } from "../../types/workspace";
import { cn } from "../../lib/utils";

export interface SessionConversationPaneProps {
	session: WorkspaceSession;
	/** Session actions (ShellTopbar embedded cluster). */
	topbarActions?: ReactNode;
	className?: string;
}

export function SessionConversationPane({
	session,
	topbarActions,
	className,
}: SessionConversationPaneProps) {
	const agentStream = useAgentStream({ sessionId: session.id, connect: true });
	const title = isOrchestratorSession(session)
		? "Orchestrator"
		: session.title || "Session";

	return (
		<div
			className={cn("flex h-full min-h-0 min-w-flex-min flex-col bg-background", className)}
			data-testid="session-conversation-pane"
			data-session-id={session.id}
		>
			{topbarActions ? (
				<SessionTopbarPortal>
					<div
						className="flex h-toolbar shrink-0 items-center justify-end border-b border-border px-3"
						data-testid="session-action-region"
					>
						{topbarActions}
					</div>
				</SessionTopbarPortal>
			) : null}

			<div className="min-h-0 flex-1">
				<AgentStreamSurface
					agentStream={agentStream}
					title={title}
					className="h-full"
					composer={
						<AgentStreamComposer
							onSend={agentStream.sendPrompt}
							busy={agentStream.streaming}
							disabled={!session.id}
							placeholder={
								agentStream.connection === "unavailable"
									? "Stream API not ready — compose still posts when the daemon route lands…"
									: "Message the agent…"
							}
						/>
					}
				/>
			</div>
		</div>
	);
}
