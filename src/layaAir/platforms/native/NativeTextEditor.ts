import { NativeTextInputSnapshot, NativeTextInputState, NativeTextRange } from "./NativeTextInputTypes";

interface NativeTextHistoryEntry {
    text: string;
    selectionStart: number;
    selectionEnd: number;
}

/**
 * Native-only text editing state. It owns the editing snapshot while a native
 * text input session is active, but does not dispatch public Laya events.
 * @internal
 */
export class NativeTextEditor {
    private _sessionId: number = 0;
    private _revision: number = 0;
    private _state: NativeTextInputState = NativeTextInputState.Inactive;
    private _text: string = "";
    private _selectionStart: number = 0;
    private _selectionEnd: number = 0;
    private _compositionText: string = "";
    private _compositionBaseStart: number = -1;
    private _compositionBaseEnd: number = -1;
    private _compositionSelectionStart: number = 0;
    private _compositionSelectionEnd: number = 0;
    private _undoHistory: NativeTextHistoryEntry[] = [];
    private _redoHistory: NativeTextHistoryEntry[] = [];

    private static readonly MAX_HISTORY_LENGTH: number = 100;

    get sessionId(): number {
        return this._sessionId;
    }

    get revision(): number {
        return this._revision;
    }

    get state(): NativeTextInputState {
        return this._state;
    }

    get active(): boolean {
        return this._state !== NativeTextInputState.Inactive;
    }

    get composing(): boolean {
        return this._compositionBaseStart !== -1;
    }

    get committedText(): string {
        return this._text;
    }

    get displayText(): string {
        if (!this.composing)
            return this._text;

        return this._text.substring(0, this._compositionBaseStart)
            + this._compositionText
            + this._text.substring(this._compositionBaseEnd);
    }

    begin(sessionId: number, text: string, selectionStart: number, selectionEnd: number): NativeTextInputSnapshot {
        if (sessionId <= 0)
            throw new Error("Native text input sessionId must be greater than zero.");

        this._sessionId = sessionId;
        this._text = text == null ? "" : String(text);
        const selection = this.normalizeRange(selectionStart, selectionEnd, this._text.length);
        this._selectionStart = selection.start;
        this._selectionEnd = selection.end;
        this.clearComposition();
        this.clearHistory();
        this._state = NativeTextInputState.Active;
        this.touch();
        return this.snapshot();
    }

    end(sessionId: number, commitComposition: boolean): NativeTextInputSnapshot | null {
        if (!this.accepts(sessionId))
            return null;

        if (this.composing) {
            if (commitComposition)
                this.commitCompositionInternal(this._compositionText);
            else
                this.cancelCompositionInternal();
        }

        this._state = NativeTextInputState.Inactive;
        this._sessionId = 0;
        this.clearHistory();
        this.touch();
        return this.snapshot();
    }

    suspend(sessionId: number): NativeTextInputSnapshot | null {
        if (!this.accepts(sessionId) || this._state === NativeTextInputState.Suspended)
            return null;

        this._state = NativeTextInputState.Suspended;
        this.touch();
        return this.snapshot();
    }

    resume(sessionId: number): NativeTextInputSnapshot | null {
        if (!this.accepts(sessionId) || this._state !== NativeTextInputState.Suspended)
            return null;

        this._state = this.composing ? NativeTextInputState.Composing : NativeTextInputState.Active;
        this.touch();
        return this.snapshot();
    }

    setText(sessionId: number, text: string, selectionStart?: number, selectionEnd?: number): NativeTextInputSnapshot | null {
        if (!this.accepts(sessionId))
            return null;

        const value = text == null ? "" : String(text);
        const start = selectionStart == null ? value.length : selectionStart;
        const end = selectionEnd == null ? start : selectionEnd;
        const selection = this.normalizeRange(start, end, value.length);

        if (this._text === value
            && !this.composing
            && this._selectionStart === selection.start
            && this._selectionEnd === selection.end)
            return this.snapshot();

        const textChanged = this._text !== value;
        this._text = value;
        this._selectionStart = selection.start;
        this._selectionEnd = selection.end;
        this.clearComposition();
        if (textChanged)
            this.clearHistory();
        this._state = NativeTextInputState.Active;
        this.touch();
        return this.snapshot();
    }

    setSelection(sessionId: number, start: number, end: number): NativeTextInputSnapshot | null {
        if (!this.accepts(sessionId))
            return null;

        const committedComposition = this.composing;
        if (committedComposition) {
            this.recordUndo();
            this.commitCompositionInternal(this._compositionText);
        }

        const selection = this.normalizeRange(start, end, this._text.length);
        if (this._selectionStart === selection.start && this._selectionEnd === selection.end) {
            if (committedComposition)
                this.touch();
            return this.snapshot();
        }

        this._selectionStart = selection.start;
        this._selectionEnd = selection.end;
        this.touch();
        return this.snapshot();
    }

    setComposition(sessionId: number, text: string, selectionStart?: number, selectionEnd?: number): NativeTextInputSnapshot | null {
        if (!this.accepts(sessionId))
            return null;

        const value = text == null ? "" : String(text);
        const wasComposing = this.composing;
        if (!wasComposing) {
            this._compositionBaseStart = this._selectionStart;
            this._compositionBaseEnd = this._selectionEnd;
        }

        const start = selectionStart == null ? value.length : selectionStart;
        const end = selectionEnd == null ? start : selectionEnd;
        const selection = this.normalizeRange(start, end, value.length);

        if (wasComposing
            && this._compositionText === value
            && this._compositionSelectionStart === selection.start
            && this._compositionSelectionEnd === selection.end)
            return this.snapshot();

        this._compositionText = value;
        this._compositionSelectionStart = selection.start;
        this._compositionSelectionEnd = selection.end;
        this._state = NativeTextInputState.Composing;
        this.touch();
        return this.snapshot();
    }

    commitText(sessionId: number, text: string): NativeTextInputSnapshot | null {
        if (!this.accepts(sessionId))
            return null;

        const value = text == null ? "" : String(text);
        if (this.composing) {
            this.recordUndo();
            this.commitCompositionInternal(value);
        }
        else {
            if (this.rangeReplacementChanges(
                this._selectionStart, this._selectionEnd, value))
                this.recordUndo();
            this.replaceRangeInternal(this._selectionStart, this._selectionEnd, value);
        }

        this.touch();
        return this.snapshot();
    }

    finishComposition(sessionId: number): NativeTextInputSnapshot | null {
        if (!this.accepts(sessionId) || !this.composing)
            return null;

        this.recordUndo();
        this.commitCompositionInternal(this._compositionText);
        this.touch();
        return this.snapshot();
    }

    cancelComposition(sessionId: number): NativeTextInputSnapshot | null {
        if (!this.accepts(sessionId) || !this.composing)
            return null;

        this.cancelCompositionInternal();
        this.touch();
        return this.snapshot();
    }

    replaceText(sessionId: number, start: number, end: number, text: string): NativeTextInputSnapshot | null {
        if (!this.accepts(sessionId))
            return null;

        let historyRecorded = false;
        if (this.composing) {
            this.recordUndo();
            historyRecorded = true;
            this.commitCompositionInternal(this._compositionText);
        }

        if (!historyRecorded
            && this.rangeReplacementChanges(start, end, text == null ? "" : String(text)))
            this.recordUndo();
        this.replaceRangeInternal(start, end, text == null ? "" : String(text));
        this.touch();
        return this.snapshot();
    }

    deleteSurroundingText(sessionId: number, before: number, after: number): NativeTextInputSnapshot | null {
        if (!this.accepts(sessionId))
            return null;

        let historyRecorded = false;
        if (this.composing) {
            this.recordUndo();
            historyRecorded = true;
            this.commitCompositionInternal(this._compositionText);
        }

        if (this._selectionStart !== this._selectionEnd) {
            if (!historyRecorded)
                this.recordUndo();
            this.replaceRangeInternal(this._selectionStart, this._selectionEnd, "");
        }
        else {
            const safeBefore = Math.max(0, before | 0);
            const safeAfter = Math.max(0, after | 0);
            const start = Math.max(0, this._selectionStart - safeBefore);
            const end = Math.min(this._text.length, this._selectionEnd + safeAfter);
            if (start !== end) {
                if (!historyRecorded)
                    this.recordUndo();
                this.replaceRangeInternal(start, end, "");
            }
        }

        this.touch();
        return this.snapshot();
    }

    undo(sessionId: number): NativeTextInputSnapshot | null {
        if (!this.accepts(sessionId) || this._undoHistory.length === 0)
            return null;

        if (this.composing)
            this.cancelCompositionInternal();
        this.pushHistory(this._redoHistory, this.captureHistory());
        this.restoreHistory(this._undoHistory.pop()!);
        this.touch();
        return this.snapshot();
    }

    redo(sessionId: number): NativeTextInputSnapshot | null {
        if (!this.accepts(sessionId) || this._redoHistory.length === 0)
            return null;

        if (this.composing)
            this.cancelCompositionInternal();
        this.pushHistory(this._undoHistory, this.captureHistory());
        this.restoreHistory(this._redoHistory.pop()!);
        this.touch();
        return this.snapshot();
    }

    snapshot(): NativeTextInputSnapshot {
        const composing = this.composing;
        const compositionStart = composing ? this._compositionBaseStart : -1;
        const compositionEnd = composing ? compositionStart + this._compositionText.length : -1;
        const selectionStart = composing
            ? compositionStart + this._compositionSelectionStart
            : this._selectionStart;
        const selectionEnd = composing
            ? compositionStart + this._compositionSelectionEnd
            : this._selectionEnd;

        return {
            sessionId: this._sessionId,
            revision: this._revision,
            state: this._state,
            text: this.displayText,
            selectionStart,
            selectionEnd,
            compositionStart,
            compositionEnd
        };
    }

    private accepts(sessionId: number): boolean {
        return sessionId > 0 && sessionId === this._sessionId && this._state !== NativeTextInputState.Inactive;
    }

    private normalizeRange(start: number, end: number, textLength: number): NativeTextRange {
        let rangeStart = Math.max(0, Math.min(textLength, Number.isFinite(start) ? Math.trunc(start) : 0));
        // Input.select() preserves the existing adapter convention of using
        // -1 as the end-of-text sentinel.
        let rangeEnd = end === -1
            ? textLength
            : Math.max(0, Math.min(textLength, Number.isFinite(end) ? Math.trunc(end) : rangeStart));
        if (rangeStart > rangeEnd) {
            const tmp = rangeStart;
            rangeStart = rangeEnd;
            rangeEnd = tmp;
        }
        return { start: rangeStart, end: rangeEnd };
    }

    private replaceRangeInternal(start: number, end: number, value: string): void {
        const range = this.normalizeRange(start, end, this._text.length);
        this._text = this._text.substring(0, range.start) + value + this._text.substring(range.end);
        this._selectionStart = this._selectionEnd = range.start + value.length;
        this.clearComposition();
        this._state = NativeTextInputState.Active;
    }

    private rangeReplacementChanges(start: number, end: number, value: string): boolean {
        const range = this.normalizeRange(start, end, this._text.length);
        const nextText = this._text.substring(0, range.start)
            + value
            + this._text.substring(range.end);
        const nextSelection = range.start + value.length;
        return nextText !== this._text
            || this._selectionStart !== nextSelection
            || this._selectionEnd !== nextSelection;
    }

    private commitCompositionInternal(value: string): void {
        this.replaceRangeInternal(this._compositionBaseStart, this._compositionBaseEnd, value);
    }

    private cancelCompositionInternal(): void {
        this._selectionStart = this._compositionBaseStart;
        this._selectionEnd = this._compositionBaseEnd;
        this.clearComposition();
        this._state = NativeTextInputState.Active;
    }

    private clearComposition(): void {
        this._compositionText = "";
        this._compositionBaseStart = -1;
        this._compositionBaseEnd = -1;
        this._compositionSelectionStart = 0;
        this._compositionSelectionEnd = 0;
    }

    private captureHistory(): NativeTextHistoryEntry {
        return {
            text: this._text,
            selectionStart: this._selectionStart,
            selectionEnd: this._selectionEnd
        };
    }

    private recordUndo(): void {
        this.pushHistory(this._undoHistory, this.captureHistory());
        this._redoHistory.length = 0;
    }

    private pushHistory(history: NativeTextHistoryEntry[], entry: NativeTextHistoryEntry): void {
        const last = history[history.length - 1];
        if (last
            && last.text === entry.text
            && last.selectionStart === entry.selectionStart
            && last.selectionEnd === entry.selectionEnd)
            return;
        history.push(entry);
        if (history.length > NativeTextEditor.MAX_HISTORY_LENGTH)
            history.shift();
    }

    private restoreHistory(entry: NativeTextHistoryEntry): void {
        this._text = entry.text;
        this._selectionStart = entry.selectionStart;
        this._selectionEnd = entry.selectionEnd;
        this.clearComposition();
        this._state = NativeTextInputState.Active;
    }

    private clearHistory(): void {
        this._undoHistory.length = 0;
        this._redoHistory.length = 0;
    }

    private touch(): void {
        this._revision++;
    }
}
