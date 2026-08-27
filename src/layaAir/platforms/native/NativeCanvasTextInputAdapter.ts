import { ILaya, Mutable } from "../../ILaya";
import { Input } from "../../laya/display/Input";
import { Text } from "../../laya/display/Text";
import { Event } from "../../laya/events/Event";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { TextInputAdapter } from "../../laya/platform/TextInputAdapter";
import { SpriteUtils } from "../../laya/utils/SpriteUtils";
import { DesktopNativeTextInputContext } from "./DesktopNativeTextInputContext";
import { NativeTextInputBridge } from "./NativeTextInputBridge";
import {
    NativeTextInputAction,
    NativeTextInputEndPolicy,
    NativeTextInputSessionConfig
} from "./NativeTextInputContext";
import { NativeTextInputSnapshot, NativeTextInputState } from "./NativeTextInputTypes";
import { NativeTextInputVisual } from "./NativeTextInputVisual";

const setCanvasText = Object.getOwnPropertyDescriptor(Text.prototype, "text")!.set!;

/**
 * Native-only Input adapter that keeps all visible text, selection,
 * composition and caret rendering in LayaAir.
 * @internal
 */
export class NativeCanvasTextInputAdapter extends TextInputAdapter {
    private readonly _bridge: NativeTextInputBridge;
    private _visual: NativeTextInputVisual;
    private _activeTarget: Input;
    private _snapshot: NativeTextInputSnapshot;
    private _lastCommittedText: string = "";
    private _programmaticUpdate: boolean = false;
    private _normalizingText: boolean = false;
    private _compositionTextExposed: boolean = false;
    private _previousOverflow: string;
    private _beginFromPointer: boolean = false;
    private _pointerSelecting: boolean = false;
    private _selectionAnchor: number = 0;
    private _verticalCaretX: number = NaN;
    private _caretVisible: boolean = true;
    private _lastCaretX: number = NaN;
    private _lastCaretY: number = NaN;
    private _lastCaretWidth: number = NaN;
    private _lastCaretHeight: number = NaN;
    private _pendingSelectionStart: number = NaN;
    private _pendingSelectionEnd: number = NaN;

    constructor() {
        super();
        this._editInline = false;
        this._bridge = new NativeTextInputBridge(new DesktopNativeTextInputContext());
        this._bridge.onSnapshotChanged = this.onSnapshotChanged;
        this._bridge.onAction = this.onPlatformAction;
    }

    begin(target: Input, fromTouchBegin?: boolean): Promise<void> {
        this._beginFromPointer = !!fromTouchBegin;
        return super.begin(target, fromTouchBegin);
    }

    syncText(): void {
        // DOM Input exposes the current preedit string through Input.text.
        // Preserve that observable behavior without making preedit part of
        // the authoritative committed value or emitting Event.INPUT.
        const target = this._activeTarget;
        if (target && this._bridge.editor.composing) {
            this.updateCanvasTargetText(target, this._bridge.editor.displayText);
            this._compositionTextExposed = true;
        }
    }

    setText(value: string): void {
        if (!this._bridge.editor.active)
            return;

        this._programmaticUpdate = true;
        try {
            this._bridge.updateText(value, value.length, value.length);
        }
        finally {
            this._programmaticUpdate = false;
        }
    }

    setSelection(startIndex: number, endIndex: number): void {
        if (!this._bridge.editor.active) {
            this._pendingSelectionStart = startIndex;
            this._pendingSelectionEnd = endIndex;
            return;
        }
        this._bridge.updateSelection(startIndex, endIndex);
        this.resetCaretBlink();
    }

    protected onBegin(): Promise<void> {
        const target = this.target;
        this._activeTarget = target;
        this._lastCommittedText = target.text;
        this._previousOverflow = target.overflow;
        if (target.overflow !== Text.SCROLL)
            target.overflow = Text.SCROLL;
        this._visual = new NativeTextInputVisual(target, this._lastCommittedText);
        this._visual.caretColor = target.color;

        target.on(Event.MOUSE_DOWN, this, this.onPointerDown);
        target.on(Event.DOUBLE_CLICK, this, this.onDoubleClick);
        ILaya.stage.on(Event.MOUSE_MOVE, this, this.onPointerMove);
        ILaya.stage.on(Event.MOUSE_UP, this, this.onPointerUp);
        ILaya.stage.on(Event.KEY_DOWN, this, this.onCanvasKeyDown);
        PAL.browser.on(Event.BLUR, this, this.onWindowBlur);
        PAL.browser.on(Event.FOCUS, this, this.onWindowFocus);
        PAL.browser.on(Event.RESIZE, this, this.onBrowserResize);
        ILaya.stage.on(Event.RESIZE, this, this.onViewportResize);
        ILaya.systemTimer.loop(500, this, this.toggleCaret);
        ILaya.systemTimer.frameLoop(1, this, this.syncCaretRect);

        let selection = this._lastCommittedText.length;
        let selectionEnd = selection;
        if (this._beginFromPointer) {
            const point = target.getMousePoint();
            selection = this._visual.getIndexAtPoint(point.x, point.y);
            selectionEnd = selection;
        }
        else if (Number.isFinite(this._pendingSelectionStart)) {
            selection = this._pendingSelectionStart;
            selectionEnd = Number.isFinite(this._pendingSelectionEnd)
                ? this._pendingSelectionEnd
                : selection;
        }
        this._beginFromPointer = false;
        this._pendingSelectionStart = NaN;
        this._pendingSelectionEnd = NaN;

        const snapshot = this._bridge.begin(
            this.createSessionConfig(target),
            this._lastCommittedText,
            selection,
            selectionEnd);
        this._snapshot = snapshot;
        this.resetCaretBlink();
        this.syncCaretRect();
        return Promise.resolve();
    }

    protected onCanShowKeyboard(): Promise<void> {
        if (this.target?.editable)
            this._bridge.showKeyboard();
        return Promise.resolve();
    }

    protected onEnd(target: Input, _complete: boolean, _switching: boolean): Promise<void> {
        this._bridge.finishPendingComposition();
        this._bridge.end(NativeTextInputEndPolicy.CommitComposition);

        target.off(Event.MOUSE_DOWN, this, this.onPointerDown);
        target.off(Event.DOUBLE_CLICK, this, this.onDoubleClick);
        ILaya.stage.off(Event.MOUSE_MOVE, this, this.onPointerMove);
        ILaya.stage.off(Event.MOUSE_UP, this, this.onPointerUp);
        ILaya.stage.off(Event.KEY_DOWN, this, this.onCanvasKeyDown);
        PAL.browser.off(Event.BLUR, this, this.onWindowBlur);
        PAL.browser.off(Event.FOCUS, this, this.onWindowFocus);
        PAL.browser.off(Event.RESIZE, this, this.onBrowserResize);
        ILaya.stage.off(Event.RESIZE, this, this.onViewportResize);
        ILaya.systemTimer.clear(this, this.toggleCaret);
        ILaya.systemTimer.clear(this, this.syncCaretRect);
        ILaya.systemTimer.clear(this, this.refreshAfterViewportResize);

        this._visual?.dispose();
        if (target.overflow !== this._previousOverflow)
            target.overflow = this._previousOverflow;
        this._previousOverflow = null;
        this._compositionTextExposed = false;
        this._visual = null;
        this._snapshot = null;
        this._activeTarget = null;
        this._pointerSelecting = false;
        return Promise.resolve();
    }

    private readonly onSnapshotChanged = (snapshot: NativeTextInputSnapshot, committedText: string): void => {
        const target = this._activeTarget;
        if (!target)
            return;

        this._snapshot = snapshot;

        if (!this._programmaticUpdate && !this._normalizingText) {
            let normalized = this.validateTargetText(target, committedText);
            if (target.maxChars > 0 && normalized.length > target.maxChars)
                normalized = normalized.substring(0, target.maxChars);

            if (normalized !== committedText) {
                const previousText = this._lastCommittedText;
                const caret = Math.min(normalized.length, snapshot.selectionEnd);
                this._normalizingText = true;
                try {
                    this._bridge.updateText(normalized, caret, caret);
                }
                finally {
                    this._normalizingText = false;
                }
                if (previousText !== this._lastCommittedText)
                    target.event(Event.INPUT);
                return;
            }
        }

        const committedTextChanged = committedText !== this._lastCommittedText;
        // The Windows editor owns the visible canvas value while focused.
        // During IME composition snapshot.text includes the preedit string;
        // the authoritative committed value remains in NativeTextEditor.
        this.updateCanvasTargetText(target, snapshot.text);
        this._compositionTextExposed = this._bridge.editor.composing;

        if (committedTextChanged) {
            this._lastCommittedText = committedText;
            if (!this._programmaticUpdate && !this._normalizingText)
                target.event(Event.INPUT);
        }

        // Synchronize Input.text before forcing the decoration redraw.  In
        // particular, deleting a select-all range produces an empty string.
        // Redrawing first would typeset the old target text and leave those
        // glyph commands visible while the editor snapshot already held an
        // empty value (the caret therefore moved, but the text appeared not
        // to be deleted).
        this._visual?.update(this._bridge.editor);
        this.ensureCaretVisible();
        this.resetCaretBlink();
        this.syncCaretRect();
    };

    private readonly onPlatformAction = (action: NativeTextInputAction): void => {
        if (action === NativeTextInputAction.Enter
            || action === NativeTextInputAction.Done
            || action === NativeTextInputAction.Search
            || action === NativeTextInputAction.Send)
            this.submitSingleLine();
    };

    private onCanvasKeyDown(event: Event): void {
        const target = this._activeTarget;
        const snapshot = this._snapshot;
        if (!target || !snapshot
            || snapshot.state === NativeTextInputState.Suspended
            || snapshot.state === NativeTextInputState.Inactive)
            return;

        const keyCode = event.keyCode;
        const clipboardCommand = event.ctrlKey && !event.altKey;
        if (clipboardCommand
            && (keyCode === 65 || keyCode === 67 || keyCode === 86
                || keyCode === 88 || keyCode === 89 || keyCode === 90)) {
            // Readonly inputs still own a logical selection even though they
            // do not start an SDL text-input session. Keep non-mutating
            // shortcuts available and consume all mutating edit shortcuts.
            if (!target.editable && keyCode !== 65 && keyCode !== 67) {
                event.preventDefault();
                return;
            }

            this._bridge.finishPendingComposition();
            const current = this._bridge.editor.snapshot();
            if (keyCode === 65) {
                this._bridge.updateSelection(0, -1);
            }
            else if (keyCode === 67) {
                this.copySelection(current.selectionStart, current.selectionEnd);
            }
            else if (keyCode === 88) {
                if (this.copySelection(current.selectionStart, current.selectionEnd)
                    && current.selectionStart !== current.selectionEnd)
                    this._bridge.insertText("");
            }
            else if (keyCode === 90) {
                if (event.shiftKey)
                    this._bridge.redo();
                else
                    this._bridge.undo();
            }
            else if (keyCode === 89) {
                this._bridge.redo();
            }
            else {
                const text = this._bridge.getClipboardText();
                if (text)
                    this._bridge.insertText(text);
            }

            event.preventDefault();
            this._verticalCaretX = NaN;
            this.resetCaretBlink();
            return;
        }

        if (!target.editable)
            return;

        if (this._bridge.editor.composing) {
            // SDL/IME owns navigation and deletion while composition is active.
            return;
        }

        let verticalMove = false;
        if (keyCode === 8) {
            this._bridge.deleteAroundSelection(1, 0);
        }
        else if (keyCode === 46) {
            this._bridge.deleteAroundSelection(0, 1);
        }
        else if (keyCode === 37) {
            const index = snapshot.selectionStart !== snapshot.selectionEnd
                ? snapshot.selectionStart
                : Math.max(0, snapshot.selectionStart - 1);
            this._bridge.updateSelection(index, index);
        }
        else if (keyCode === 39) {
            const index = snapshot.selectionStart !== snapshot.selectionEnd
                ? snapshot.selectionEnd
                : Math.min(this._bridge.editor.committedText.length, snapshot.selectionEnd + 1);
            this._bridge.updateSelection(index, index);
        }
        else if ((keyCode === 38 || keyCode === 40) && target.multiline) {
            const movingUp = keyCode === 38;
            const index = snapshot.selectionStart !== snapshot.selectionEnd
                ? (movingUp ? snapshot.selectionStart : snapshot.selectionEnd)
                : snapshot.selectionEnd;
            const caret = this._visual.getCaretRect(index);
            if (!Number.isFinite(this._verticalCaretX))
                this._verticalCaretX = caret.x;
            const y = movingUp
                // Move above the inter-line leading gap so hit testing lands
                // on the previous visual line rather than the current one.
                ? caret.y - Math.max(1, target.leading + 1)
                : caret.y + caret.height + 1;
            const nextIndex = this._visual.getIndexAtPoint(this._verticalCaretX, y);
            this._bridge.updateSelection(nextIndex, nextIndex);
            verticalMove = true;
        }
        else if (keyCode === 36) {
            this._bridge.updateSelection(0, 0);
        }
        else if (keyCode === 35) {
            const index = this._bridge.editor.committedText.length;
            this._bridge.updateSelection(index, index);
        }
        else if (keyCode === 13) {
            if (target.multiline)
                this._bridge.insertText("\n");
            else
                this.submitSingleLine();
        }
        else {
            return;
        }

        event.preventDefault();
        if (!verticalMove)
            this._verticalCaretX = NaN;
        this.resetCaretBlink();
    }

    private submitSingleLine(): void {
        const target = this._activeTarget;
        if (!target)
            return;

        this._enterEvent.setTo(Event.ENTER, target, target);
        target.event(Event.ENTER, this._enterEvent);
        if (!this._enterEvent._defaultPrevented && this._activeTarget === target)
            this.end();
    }

    private onPointerDown(event: Event): void {
        const target = this._activeTarget;
        if (!target || !this._snapshot)
            return;
        if (target.editable) {
            if (this._bridge.editor.state === NativeTextInputState.Suspended)
                this._bridge.resume();
            this._bridge.showKeyboard();
        }
        if (!this._snapshot || this._snapshot.state === NativeTextInputState.Inactive)
            return;
        this._pointerSelecting = true;
        this._verticalCaretX = NaN;
        const index = this.getIndexAtPointerEvent(event);
        this._selectionAnchor = index;
        this._bridge.updateSelection(index, index);
        this.resetCaretBlink();
    }

    private onPointerMove(event: Event): void {
        if (!this._pointerSelecting || !this._snapshot)
            return;
        const index = this.getIndexAtPointerEvent(event);
        this._verticalCaretX = NaN;
        this._bridge.updateSelection(this._selectionAnchor, index);
        this.resetCaretBlink();
    }

    private onPointerUp(): void {
        this._pointerSelecting = false;
    }

    private onDoubleClick(event: Event): void {
        if (!this._activeTarget || !this._snapshot)
            return;
        this._bridge.finishPendingComposition();
        this._bridge.updateSelection(0, -1);
        this._pointerSelecting = false;
        this._verticalCaretX = NaN;
        event.preventDefault();
        this.resetCaretBlink();
    }

    private getIndexAtPointerEvent(_event: Event): number {
        const target = this._activeTarget;

        // Use Sprite's canonical Stage-to-local mouse conversion for both the
        // initial focus click and every later click/drag. This keeps picking
        // on the exact same path after Stage/Canvas resize transforms change.
        const point = target.getMousePoint();
        return this._visual.getIndexAtPoint(point.x, point.y);
    }

    private onWindowBlur(): void {
        if (this._bridge.editor.active)
            this._bridge.suspend();
    }

    private onWindowFocus(): void {
        if (this._bridge.editor.state === NativeTextInputState.Suspended)
            this._bridge.resume();
        this.invalidateCaretRect();
        ILaya.systemTimer.frameOnce(1, this, this.refreshAfterViewportResize);
    }

    private onBrowserResize(): void {
        // NativeBrowserAdapter only publishes the platform resize event.
        // While an Input owns focus, keep the Stage adaptation path used by
        // the legacy native adapter so rendering and hit testing cannot keep
        // the pre-resize clientScale values.
        if (ILaya.stage.screenAdaptationEnabled) {
            ILaya.stage.event(Event.WILL_RESIZE);
            ILaya.stage.updateCanvasSize(true);
        }
        this.onViewportResize();
    }

    private onViewportResize(): void {
        this._pointerSelecting = false;
        this.invalidateCaretRect();
        ILaya.systemTimer.clear(this, this.refreshAfterViewportResize);
        ILaya.systemTimer.frameOnce(1, this, this.refreshAfterViewportResize);
    }

    private refreshAfterViewportResize(): void {
        if (!this._activeTarget || !this._snapshot)
            return;
        this._visual?.update(this._bridge.editor);
        this.ensureCaretVisible();
        this.invalidateCaretRect();
        this.syncCaretRect();
    }

    private toggleCaret(): void {
        this._caretVisible = !this._caretVisible;
        this._visual?.setCaretVisible(this._caretVisible);
    }

    private resetCaretBlink(): void {
        this._caretVisible = true;
        this._visual?.setCaretVisible(true);
    }

    private syncCaretRect(): void {
        const target = this._activeTarget;
        const snapshot = this._snapshot;
        if (!target || !snapshot
            || snapshot.state === NativeTextInputState.Inactive
            || snapshot.state === NativeTextInputState.Suspended)
            return;

        const caret = this._visual.getCaretRect(snapshot.selectionEnd);
        const transform = SpriteUtils.getTransformRelativeToWindow(target, caret.x, caret.y);
        const x = transform.x;
        const y = transform.y;
        const width = Math.max(1, Math.abs(transform.scaleX));
        const height = Math.max(1, caret.height * Math.abs(transform.scaleY));
        if (x === this._lastCaretX && y === this._lastCaretY
            && width === this._lastCaretWidth && height === this._lastCaretHeight)
            return;

        this._lastCaretX = x;
        this._lastCaretY = y;
        this._lastCaretWidth = width;
        this._lastCaretHeight = height;
        this._bridge.updateCaretRect({ x, y, width, height });
    }

    private ensureCaretVisible(): void {
        const target = this._activeTarget;
        const snapshot = this._snapshot;
        if (!target || !snapshot || snapshot.state === NativeTextInputState.Inactive)
            return;

        const padding = target.padding;
        const caret = this._visual.getCaretRect(snapshot.selectionEnd);
        const left = padding[3];
        const right = Math.max(left, target.width - padding[1] - 1);
        const top = padding[0];
        const bottom = Math.max(top, target.height - padding[2] - 1);

        let scrollX = target.scrollX;
        let scrollY = target.scrollY;
        if (caret.x < left)
            scrollX += caret.x - left;
        else if (caret.x > right)
            scrollX += caret.x - right;
        if (caret.y < top)
            scrollY += caret.y - top;
        else if (caret.y + caret.height > bottom)
            scrollY += caret.y + caret.height - bottom;

        let scrolled = false;
        if (scrollX !== target.scrollX) {
            target.scrollX = scrollX;
            scrolled = true;
        }
        if (scrollY !== target.scrollY) {
            target.scrollY = scrollY;
            scrolled = true;
        }
        if (scrolled)
            this._visual?.refresh();
    }

    private invalidateCaretRect(): void {
        this._lastCaretX = NaN;
        this._lastCaretY = NaN;
        this._lastCaretWidth = NaN;
        this._lastCaretHeight = NaN;
    }

    private copySelection(start: number, end: number): boolean {
        if (start === end)
            return false;
        const text = this._bridge.editor.committedText.substring(
            Math.min(start, end), Math.max(start, end));
        return this._bridge.setClipboardText(text);
    }

    private createSessionConfig(target: Input): NativeTextInputSessionConfig {
        return {
            multiline: target.multiline,
            editable: target.editable,
            password: target.type === Input.TYPE_PASSWORD,
            wordWrap: target.wordWrap,
            inputType: target.type,
            action: this.getInputAction(target.confirmType),
            // NativeTextInputAdapter uses 1E5 for an unset maxChars value.
            // Keep the Windows canvas editor on the same practical limit.
            maxLength: target.maxChars <= 0 ? 1E5 : target.maxChars
        };
    }

    private updateCanvasTargetText(target: Input, value: string): void {
        // Invoke Text's original setter directly. This keeps the Windows-only
        // adapter from feeding its snapshot back through Input.setText while
        // leaving the shared Input class byte-for-byte unchanged.
        let normalized = value == null ? "" : String(value);
        if (!target.multiline)
            normalized = normalized.replace(/\r?\n/g, "");
        setCanvasText.call(target, normalized);
    }

    private validateTargetText(target: Input, value: string): string {
        // TextInputAdapter.end intentionally clears this.target before
        // onEnd. The bridge still publishes its final snapshot during that
        // teardown, so validateText must use the stable active Input rather
        // than dereferencing the temporarily-null public target.
        const adapterTarget = this.target;
        (<Mutable<this>>this).target = target;
        try {
            return this.validateText(value);
        }
        finally {
            (<Mutable<this>>this).target = adapterTarget;
        }
    }

    private getInputAction(confirmType: Input["confirmType"]): NativeTextInputAction {
        switch (confirmType) {
            case "next": return NativeTextInputAction.Next;
            case "search": return NativeTextInputAction.Search;
            case "go": return NativeTextInputAction.Enter;
            case "send": return NativeTextInputAction.Send;
            default: return NativeTextInputAction.Done;
        }
    }
}
