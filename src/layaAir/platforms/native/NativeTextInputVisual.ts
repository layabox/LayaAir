import { Input } from "../../laya/display/Input";
import { Sprite } from "../../laya/display/Sprite";
import { Rectangle } from "../../laya/maths/Rectangle";
import { NativeTextEditor } from "./NativeTextEditor";
import { NativeTextInputSnapshot, NativeTextInputState } from "./NativeTextInputTypes";
import { NativeTextLayout } from "./NativeTextLayout";

/**
 * Draws native input decorations through the existing LayaAir Text/Graphics
 * pipeline. It never creates a platform view or changes Input.text.
 * @internal
 */
export class NativeTextInputVisual {
    private readonly _target: Input;
    private readonly _overlay: Sprite;
    private readonly _layout: NativeTextLayout;
    private _snapshot: NativeTextInputSnapshot;
    private _caretVisible: boolean = true;
    private readonly _caretRect: Rectangle = new Rectangle();

    selectionColor: string = "rgba(51, 153, 255, 0.35)";
    compositionColor: string = "#4A90E2";
    caretColor: string = "#000000";
    caretWidth: number = 1;

    constructor(target: Input, initialText: string) {
        this._target = target;
        this._layout = new NativeTextLayout(target);
        this._overlay = new Sprite();
        this._overlay.name = "__windowsNativeInputOverlay";
        this._overlay.mouseEnabled = false;
        target.addChild(this._overlay);
        this._layout.refresh(initialText);
    }

    update(editor: NativeTextEditor): void {
        const snapshot = editor.snapshot();
        this._snapshot = snapshot;
        this._layout.refresh(snapshot.text);
        this.redraw();
    }

    setCaretVisible(value: boolean): void {
        if (this._caretVisible === value)
            return;
        this._caretVisible = value;
        if (this._snapshot)
            this.redraw();
    }

    dispose(): void {
        this._snapshot = null;
        this._overlay.removeSelf();
        this._overlay.destroy();
    }

    getCaretRect(index: number) {
        this._layout.ensureCurrent();
        return this._layout.getCaretRect(index, this._caretRect);
    }

    getIndexAtPoint(x: number, y: number): number {
        this._layout.ensureCurrent();
        return this._layout.getIndexAtPoint(x, y);
    }

    refresh(): void {
        this._layout.ensureCurrent();
        this.redraw();
    }

    private redraw(): void {
        const graphics = this._overlay.graphics;
        graphics.clear();
        this.drawSelection();
        this.drawCompositionAndCaret();
        if (this._overlay.parent === this._target)
            this._target.setChildIndex(this._overlay, this._target.numChildren - 1);
    }

    private drawSelection(): void {
        const snapshot = this._snapshot;
        if (!snapshot || snapshot.state === NativeTextInputState.Inactive || snapshot.state === NativeTextInputState.Suspended)
            return;
        if (snapshot.selectionStart === snapshot.selectionEnd)
            return;

        const graphics = this._overlay.graphics;
        const rects = this._layout.getRangeRects(snapshot.selectionStart, snapshot.selectionEnd);
        for (let rect of rects) {
            if (rect.width > 0 && rect.height > 0)
                graphics.drawRect(rect.x, rect.y, rect.width, rect.height, this.selectionColor);
        }
    }

    private drawCompositionAndCaret(): void {
        const snapshot = this._snapshot;
        if (!snapshot || snapshot.state === NativeTextInputState.Inactive || snapshot.state === NativeTextInputState.Suspended)
            return;

        const graphics = this._overlay.graphics;
        if (snapshot.compositionStart >= 0 && snapshot.compositionEnd > snapshot.compositionStart) {
            const rects = this._layout.getRangeRects(snapshot.compositionStart, snapshot.compositionEnd);
            for (let rect of rects) {
                const y = rect.y + rect.height - 1;
                graphics.drawLine(rect.x, y, rect.x + rect.width, y, this.compositionColor, 1);
            }
        }

        if (!this._caretVisible || snapshot.selectionStart !== snapshot.selectionEnd)
            return;

        const caret = this._layout.getCaretRect(snapshot.selectionEnd);
        graphics.drawLine(
            caret.x,
            caret.y,
            caret.x,
            caret.y + caret.height,
            this.caretColor,
            Math.max(1, this.caretWidth));
    }
}
