import { PAL } from "../platform/PlatformAdapters";

/**
 * @en The `Mouse` class is used to control the style of the mouse cursor.
 * @zh `Mouse` 类用于控制鼠标光标的样式。
 */
export class Mouse {
    private static _cursor: string = "auto";
    private static _hidden: boolean = false;

    /**
     * @en Sets the style of the mouse cursor.
     * @param value The cursor style string.
     * For example: auto | move | no-drop | col-resize | all-scroll | pointer | not-allowed | row-resize | crosshair | progress | e-resize | ne-resize | default | text | n-resize | nw-resize | help | vertical-text | s-resize | se-resize | inherit | wait | w-resize | sw-resize
     * @zh 设置鼠标样式
     * @param value 光标样式字符串。
     * 例如：auto | move | no-drop | col-resize | all-scroll | pointer | not-allowed | row-resize | crosshair | progress | e-resize | ne-resize | default | text | n-resize | nw-resize | help | vertical-text | s-resize | se-resize | inherit | wait | w-resize | sw-resize
     */
    static set cursor(value: string) {
        this._cursor = value;
        if (this._hidden) return;
        PAL.browser.setCursor(value);
    }

    /**
     * @en The current style of the mouse cursor.
     * @zh 当前鼠标光标的样式。
     */
    static get cursor(): string {
        return this._cursor;
    }

    /**
     * @en Hides the mouse cursor.
     * @zh 隐藏鼠标光标。
     */
    static hide(): void {
        this._hidden = true;
        PAL.browser.setCursor("none");
    }

    /**
     * @en Shows the mouse cursor.
     * @zh 显示鼠标光标。
     */
    static show(): void {
        this._hidden = false;
        PAL.browser.setCursor(this._cursor);
    }
}

