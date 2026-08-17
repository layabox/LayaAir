import { NativeTextEditor } from "./NativeTextEditor";
import {
    INativeTextInputClient,
    INativeTextInputContext,
    NativeTextInputAction,
    NativeTextInputEndPolicy,
    NativeTextInputRect,
    NativeTextInputSessionConfig
} from "./NativeTextInputContext";
import { NativeTextInputSnapshot, NativeTextInputState, NativeTextRange } from "./NativeTextInputTypes";

/**
 * Coordinates the authoritative TS editor with a headless platform context.
 * Public Input events remain the responsibility of NativeCanvasTextInputAdapter.
 * @internal
 */
export class NativeTextInputBridge implements INativeTextInputClient {
    readonly editor: NativeTextEditor = new NativeTextEditor();

    onSnapshotChanged?: (snapshot: NativeTextInputSnapshot, committedText: string) => void;
    onAction?: (action: NativeTextInputAction) => void;

    private readonly _context: INativeTextInputContext;
    private _nextSessionId: number = 0;
    private _initialized: boolean = false;

    constructor(context: INativeTextInputContext) {
        this._context = context;
    }

    initialize(): boolean {
        if (!this._initialized)
            this._initialized = this._context.initialize(this);
        return this._initialized;
    }

    shutdown(): void {
        if (!this._initialized)
            return;

        if (this.editor.active)
            this.end(NativeTextInputEndPolicy.CancelComposition);
        this._context.shutdown();
        this._initialized = false;
    }

    begin(config: NativeTextInputSessionConfig, text: string, selectionStart: number, selectionEnd: number): NativeTextInputSnapshot {
        if (!this.initialize())
            throw new Error("Native text input context initialization failed.");
        if (this.editor.active)
            this.end(NativeTextInputEndPolicy.CommitComposition);

        const sessionId = ++this._nextSessionId;
        const snapshot = this.editor.begin(sessionId, text, selectionStart, selectionEnd);
        this._context.beginSession(sessionId, config, snapshot);
        this.notify(snapshot);
        return snapshot;
    }

    end(policy: NativeTextInputEndPolicy): NativeTextInputSnapshot | null {
        const sessionId = this.editor.sessionId;
        if (!sessionId)
            return null;

        const snapshot = this.editor.end(sessionId, policy === NativeTextInputEndPolicy.CommitComposition);
        this._context.endSession(sessionId, policy);
        if (snapshot)
            this.notify(snapshot);
        return snapshot;
    }

    suspend(): NativeTextInputSnapshot | null {
        const sessionId = this.editor.sessionId;
        const snapshot = this.editor.suspend(sessionId);
        if (snapshot) {
            this._context.suspendSession(sessionId);
            this.notify(snapshot);
        }
        return snapshot;
    }

    resume(): NativeTextInputSnapshot | null {
        const sessionId = this.editor.sessionId;
        const snapshot = this.editor.resume(sessionId);
        if (snapshot) {
            this._context.resumeSession(sessionId);
            this.publish(snapshot);
        }
        return snapshot;
    }

    updateCaretRect(rect: NativeTextInputRect): void {
        if (this.editor.active)
            this._context.updateCaretRect(this.editor.sessionId, rect);
    }

    showKeyboard(): void {
        if (this.editor.active)
            this._context.showKeyboard(this.editor.sessionId);
    }

    hideKeyboard(): void {
        if (this.editor.active)
            this._context.hideKeyboard(this.editor.sessionId);
    }

    getClipboardText(): string {
        return this._context.capabilities.clipboard && this._context.getClipboardText
            ? this._context.getClipboardText()
            : "";
    }

    setClipboardText(text: string): boolean {
        return this._context.capabilities.clipboard && this._context.setClipboardText
            ? this._context.setClipboardText(text)
            : false;
    }

    updateText(text: string, selectionStart?: number, selectionEnd?: number): NativeTextInputSnapshot | null {
        if (!this.editor.active)
            return null;
        const snapshot = this.editor.setText(this.editor.sessionId, text, selectionStart, selectionEnd);
        this.publish(snapshot);
        return snapshot;
    }

    updateSelection(start: number, end: number): NativeTextInputSnapshot | null {
        if (!this.editor.active)
            return null;
        const snapshot = this.editor.setSelection(this.editor.sessionId, start, end);
        this.publish(snapshot);
        return snapshot;
    }

    deleteAroundSelection(before: number, after: number): NativeTextInputSnapshot | null {
        if (!this.editor.active)
            return null;
        const snapshot = this.editor.deleteSurroundingText(this.editor.sessionId, before, after);
        this.publish(snapshot);
        return snapshot;
    }

    insertText(text: string): NativeTextInputSnapshot | null {
        if (!this.editor.active)
            return null;
        const snapshot = this.editor.commitText(this.editor.sessionId, text);
        this.publish(snapshot);
        return snapshot;
    }

    undo(sessionId: number = this.editor.sessionId): NativeTextInputSnapshot | null {
        if (!this.acceptsEdit(sessionId))
            return null;
        const snapshot = this.editor.undo(sessionId);
        this.publish(snapshot);
        return snapshot;
    }

    redo(sessionId: number = this.editor.sessionId): NativeTextInputSnapshot | null {
        if (!this.acceptsEdit(sessionId))
            return null;
        const snapshot = this.editor.redo(sessionId);
        this.publish(snapshot);
        return snapshot;
    }

    finishPendingComposition(): NativeTextInputSnapshot | null {
        if (!this.editor.active || !this.editor.composing)
            return null;
        const snapshot = this.editor.finishComposition(this.editor.sessionId);
        this.publish(snapshot);
        return snapshot;
    }

    querySnapshot(sessionId: number): NativeTextInputSnapshot | null {
        return this.accepts(sessionId) ? this.editor.snapshot() : null;
    }

    setComposition(sessionId: number, text: string, selection: NativeTextRange): void {
        if (!this.acceptsEdit(sessionId))
            return;
        this.publish(this.editor.setComposition(sessionId, text, selection.start, selection.end));
    }

    commitText(sessionId: number, text: string): void {
        if (!this.acceptsEdit(sessionId))
            return;
        this.publish(this.editor.commitText(sessionId, text));
    }

    finishComposition(sessionId: number): void {
        if (!this.acceptsEdit(sessionId))
            return;
        this.publish(this.editor.finishComposition(sessionId));
    }

    cancelComposition(sessionId: number): void {
        if (!this.acceptsEdit(sessionId))
            return;
        this.publish(this.editor.cancelComposition(sessionId));
    }

    replaceText(sessionId: number, range: NativeTextRange, text: string): void {
        if (!this.acceptsEdit(sessionId))
            return;
        this.publish(this.editor.replaceText(sessionId, range.start, range.end, text));
    }

    setSelection(sessionId: number, selection: NativeTextRange): void {
        if (!this.acceptsEdit(sessionId))
            return;
        this.publish(this.editor.setSelection(sessionId, selection.start, selection.end));
    }

    deleteSurroundingText(sessionId: number, before: number, after: number): void {
        if (!this.acceptsEdit(sessionId))
            return;
        this.publish(this.editor.deleteSurroundingText(sessionId, before, after));
    }

    performAction(sessionId: number, action: NativeTextInputAction): void {
        if (this.acceptsEdit(sessionId) && this.onAction)
            this.onAction(action);
    }

    platformSuspended(sessionId: number): void {
        if (!this.acceptsEdit(sessionId))
            return;
        if (this.editor.composing)
            this.editor.cancelComposition(sessionId);
        const snapshot = this.editor.suspend(sessionId);
        if (snapshot)
            this.notify(snapshot);
    }

    platformResumed(sessionId: number): void {
        if (!this.accepts(sessionId) || this.editor.state !== NativeTextInputState.Suspended)
            return;
        const snapshot = this.editor.resume(sessionId);
        if (snapshot) {
            this._context.updateState(sessionId, snapshot);
            this.notify(snapshot);
        }
    }

    private accepts(sessionId: number): boolean {
        return sessionId > 0 && sessionId === this.editor.sessionId && this.editor.active;
    }

    private acceptsEdit(sessionId: number): boolean {
        return this.accepts(sessionId) && this.editor.state !== NativeTextInputState.Suspended;
    }

    private publish(snapshot: NativeTextInputSnapshot | null): void {
        if (!snapshot)
            return;
        this._context.updateState(this.editor.sessionId, snapshot);
        this.notify(snapshot);
    }

    private notify(snapshot: NativeTextInputSnapshot): void {
        if (this.onSnapshotChanged)
            this.onSnapshotChanged(snapshot, this.editor.committedText);
    }
}
