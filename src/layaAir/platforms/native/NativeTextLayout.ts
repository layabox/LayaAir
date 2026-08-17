import { Input } from "../../laya/display/Input";
import type { ITextCmd, ITextLine } from "../../laya/display/Text";
import { Browser } from "../../laya/utils/Browser";
import { Rectangle } from "../../laya/maths/Rectangle";

interface IndexedCommand {
    command: ITextCmd;
    start: number;
    end: number;
}

interface IndexedLine {
    line: ITextLine;
    start: number;
    end: number;
    commands: IndexedCommand[];
}

/**
 * Windows-native input layout view. It derives UTF-16 ranges from Text's
 * existing public line layout without changing Text or its render pipeline.
 * @internal
 */
export class NativeTextLayout {
    private readonly _target: Input;
    private _text: string = "";
    private _lines: IndexedLine[] = [];

    constructor(target: Input) {
        this._target = target;
    }

    refresh(text: string): void {
        this._text = text == null ? "" : String(text);
        this._target.typeset();

        const sourceLines = this._target.lines;
        const lines: IndexedLine[] = [];
        let textIndex = 0;
        for (let i = 0, n = sourceLines.length; i < n; i++) {
            const sourceLine = sourceLines[i];
            const indexedLine: IndexedLine = {
                line: sourceLine,
                start: textIndex,
                end: textIndex,
                commands: []
            };

            // Input is plain text. Text's word wrapping may split or move
            // commands, but their traversal order and UTF-16 lengths remain
            // the same as the visible source string.
            let command = sourceLine.cmd;
            while (command) {
                if (!command.obj && typeof command.text === "string") {
                    const length = Math.min(command.text.length, this._text.length - textIndex);
                    if (length > 0) {
                        indexedLine.commands.push({
                            command,
                            start: textIndex,
                            end: textIndex + length
                        });
                        textIndex += length;
                    }
                }
                command = command.next;
            }

            indexedLine.end = textIndex;
            lines.push(indexedLine);
            if (i !== n - 1)
                textIndex = this.skipLineBreak(textIndex);
        }
        this._lines = lines;
    }

    ensureCurrent(): void {
        if ((this._target as any)._isChanged)
            this.refresh(this._text);
    }

    getCaretRect(index: number, out: Rectangle = new Rectangle()): Rectangle {
        const target = this._target;
        const textLength = this._text.length;
        const normalizedIndex = this.normalizeIndex(index, textLength);
        const padding = target.padding;
        const scrollX = target.scrollX;
        const scrollY = target.scrollY;

        if (this._lines.length === 0 || textLength === 0) {
            const targetInternal = target as any;
            const fontScale = Number.isFinite(targetInternal._fontSizeScale)
                ? targetInternal._fontSizeScale
                : 1;
            const height = Math.max(1, Math.floor(target.fontSize * fontScale) + 1);
            return out.setTo(padding[3] - scrollX, padding[0] - scrollY, 0, height);
        }

        let fallback = this._lines[0];
        let fallbackX = padding[3] + fallback.line.x - scrollX;
        for (const line of this._lines) {
            const lineX = padding[3] + line.line.x - scrollX;
            const lineY = padding[0] + line.line.y - scrollY;
            if (line.commands.length === 0 && normalizedIndex === line.start)
                return out.setTo(lineX, lineY, 0, line.line.height);

            for (const item of line.commands) {
                const command = item.command;
                if (normalizedIndex === item.start)
                    return out.setTo(lineX + command.x, lineY, 0, line.line.height);
                if (normalizedIndex > item.start && normalizedIndex < item.end) {
                    const prefixLength = normalizedIndex - item.start;
                    return out.setTo(
                        lineX + command.x + this.measureCommandPrefix(command, prefixLength),
                        lineY,
                        0,
                        line.line.height);
                }
                if (normalizedIndex === item.end) {
                    fallback = line;
                    fallbackX = lineX + command.x + command.width;
                }
            }

            if (normalizedIndex > line.end) {
                fallback = line;
                fallbackX = lineX + line.line.width;
            }
        }

        return out.setTo(
            fallbackX,
            padding[0] + fallback.line.y - scrollY,
            0,
            fallback.line.height);
    }

    getIndexAtPoint(x: number, y: number): number {
        if (this._lines.length === 0 || this._text.length === 0)
            return 0;

        const target = this._target;
        const padding = target.padding;
        const scrollX = target.scrollX;
        const scrollY = target.scrollY;
        const layoutY = y - padding[0] + scrollY;
        let line = this._lines[0];
        for (const candidate of this._lines) {
            line = candidate;
            if (layoutY < candidate.line.y + candidate.line.height)
                break;
        }

        const lineX = padding[3] + line.line.x - scrollX;
        const localX = x - lineX;
        if (line.commands.length === 0 || localX <= 0)
            return line.start;

        for (const item of line.commands) {
            const command = item.command;
            if (localX <= command.x)
                return item.start;
            if (localX < command.x + command.width) {
                return item.start + this.getCommandIndexAtX(
                    command,
                    localX - command.x,
                    item.end - item.start);
            }
        }
        return line.end;
    }

    getRangeRects(start: number, end: number, result: Rectangle[] = []): Rectangle[] {
        result.length = 0;
        let rangeStart = this.normalizeIndex(start, this._text.length);
        let rangeEnd = this.normalizeIndex(end, this._text.length);
        if (rangeStart > rangeEnd) {
            const temporary = rangeStart;
            rangeStart = rangeEnd;
            rangeEnd = temporary;
        }
        if (rangeStart === rangeEnd)
            return result;

        const target = this._target;
        const padding = target.padding;
        const scrollX = target.scrollX;
        const scrollY = target.scrollY;
        for (const line of this._lines) {
            const selectionStart = Math.max(rangeStart, line.start);
            const selectionEnd = Math.min(rangeEnd, line.end);
            if (selectionStart >= selectionEnd)
                continue;

            const lineX = padding[3] + line.line.x - scrollX;
            const x1 = lineX + this.getLineCaretX(line, selectionStart);
            const x2 = lineX + this.getLineCaretX(line, selectionEnd);
            result.push(new Rectangle(
                Math.min(x1, x2),
                padding[0] + line.line.y - scrollY,
                Math.abs(x2 - x1),
                line.line.height));
        }
        return result;
    }

    private getLineCaretX(line: IndexedLine, index: number): number {
        let fallback = 0;
        for (const item of line.commands) {
            const command = item.command;
            if (index <= item.start)
                return command.x;
            if (index < item.end)
                return command.x + this.measureCommandPrefix(command, index - item.start);
            fallback = command.x + command.width;
        }
        return fallback;
    }

    private getCommandIndexAtX(command: ITextCmd, x: number, textLength: number): number {
        let low = 0;
        let high = textLength;
        while (low < high) {
            const middle = Math.floor((low + high) * 0.5);
            if (this.measureCommandPrefix(command, middle) < x)
                low = middle + 1;
            else
                high = middle;
        }

        if (low <= 0)
            return 0;
        const previousWidth = this.measureCommandPrefix(command, low - 1);
        const currentWidth = this.measureCommandPrefix(command, low);
        return x - previousWidth <= currentWidth - x ? low - 1 : low;
    }

    private measureCommandPrefix(command: ITextCmd, length: number): number {
        const prefixLength = Math.max(0, Math.min(command.text.length, length));
        if (prefixLength === 0)
            return 0;
        if (prefixLength === command.text.length)
            return command.width;

        const text = command.text.substring(0, prefixLength);
        const targetInternal = this._target as any;
        const spacing = this._target.letterSpacing;
        const bitmapFont = targetInternal._bitmapFont;
        if (bitmapFont)
            return bitmapFont.getTextWidth(text, command.fontSize) + spacing * text.length;

        const oldFont = Browser.context.font;
        Browser.context.font = command.ctxFont;
        const width = Browser.context.measureText(text).width + spacing * text.length;
        Browser.context.font = oldFont;
        return width;
    }

    private skipLineBreak(index: number): number {
        if (this._text.charCodeAt(index) === 13)
            index++;
        if (this._text.charCodeAt(index) === 10)
            index++;
        return index;
    }

    private normalizeIndex(index: number, textLength: number): number {
        return Math.max(0, Math.min(
            textLength,
            Number.isFinite(index) ? Math.trunc(index) : 0));
    }
}
