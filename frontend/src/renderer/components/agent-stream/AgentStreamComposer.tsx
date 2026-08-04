/**
 * Minimal composer for the stream conversation surface.
 * Enter sends; Shift+Enter inserts a newline. Disabled while streaming unless
 * the parent allows steer-style sends (not yet).
 */

import { ArrowUp, LoaderCircle } from "lucide-react";
import { useCallback, useState, type FormEvent, type KeyboardEvent } from "react";
import { cn } from "../../lib/utils";

export interface AgentStreamComposerProps {
	onSend: (text: string) => void | Promise<void>;
	disabled?: boolean;
	busy?: boolean;
	placeholder?: string;
	className?: string;
}

export function AgentStreamComposer({
	onSend,
	disabled,
	busy,
	placeholder = "Message the agent…",
	className,
}: AgentStreamComposerProps) {
	const [text, setText] = useState("");
	const [sending, setSending] = useState(false);
	const [error, setError] = useState("");

	const canSend = text.trim().length > 0 && !disabled && !busy && !sending;

	const submit = useCallback(async () => {
		const value = text.trim();
		if (!value || disabled || busy || sending) return;
		setSending(true);
		setError("");
		try {
			await onSend(value);
			setText("");
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setSending(false);
		}
	}, [text, disabled, busy, sending, onSend]);

	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		void submit();
	};

	const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
			event.preventDefault();
			void submit();
		}
	};

	return (
		<form
			className={cn("flex flex-col gap-1.5", className)}
			onSubmit={onSubmit}
			data-testid="agent-stream-composer"
		>
			<div
				className={cn(
					"flex items-end gap-2 rounded-xl border border-border bg-muted/20 p-2 focus-within:border-accent/45",
					(disabled || busy) && "opacity-70",
				)}
			>
				<textarea
					aria-label="Message the agent"
					className="max-h-40 min-h-[2.5rem] flex-1 resize-none bg-transparent px-1.5 py-1.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-passive"
					disabled={disabled || sending}
					placeholder={placeholder}
					rows={2}
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={onKeyDown}
				/>
				<button
					type="submit"
					disabled={!canSend}
					aria-label="Send message"
					className={cn(
						"inline-flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
						canSend
							? "border-accent bg-accent text-accent-foreground hover:bg-accent/90"
							: "border-border bg-muted text-passive",
					)}
				>
					{sending || busy ? (
						<LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
					) : (
						<ArrowUp className="size-3.5" aria-hidden="true" />
					)}
				</button>
			</div>
			{error ? (
				<p className="px-1 text-xs text-destructive" role="alert">
					{error}
				</p>
			) : null}
		</form>
	);
}
