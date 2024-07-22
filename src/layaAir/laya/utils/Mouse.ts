import { Browser } from "./Browser";
/**
 * @en The `Mouse` class is used to control the style of the mouse cursor.
 * @zh `Mouse` 类用于控制鼠标光标的样式。
 */
export class Mouse {
    /**@private */
    private static _style: any;
    /**@private */
    private static _preCursor: string;

/**
 * @en Sets the style of the mouse cursor.
 * @param cursorStr The cursor style string.
 * For example: auto | move | no-drop | col-resize | all-scroll | pointer | not-allowed | row-resize | crosshair | progress | e-resize | ne-resize | default | text | n-resize | nw-resize | help | vertical-text | s-resize | se-resize | inherit | wait | w-resize | sw-resize
 * @zh 设置鼠标样式
 * @param cursorStr 光标样式字符串。
 * 例如：auto | move | no-drop | col-resize | all-scroll | pointer | not-allowed | row-resize | crosshair | progress | e-resize | ne-resize | default | text | n-resize | nw-resize | help | vertical-text | s-resize | se-resize | inherit | wait | w-resize | sw-resize
 */
    static set cursor(cursorStr: string) {
        Mouse._style.cursor = cursorStr;
    }

    /**
     * @en The current style of the mouse cursor.
     * @zh 当前鼠标光标的样式。
     */
    static get cursor(): string {
        return Mouse._style.cursor;
    }

    /**@internal */
    static __init__(): any {
        Mouse._style = Browser.document.body.style;
    }

    /**
     * @en Hides the mouse cursor.
     * @zh 隐藏鼠标光标。
     */
    static hide(): void {
        if (Mouse.cursor != "none") {
            Mouse._preCursor = Mouse.cursor;
            Mouse.cursor = "none";
        }
    }

    /**
     * @en Shows the mouse cursor.
     * @zh 显示鼠标光标。
     */
    static show(): void {
        if (Mouse.cursor == "none") {
            if (Mouse._preCursor) {
                Mouse.cursor = Mouse._preCursor;
            } else {
                Mouse.cursor = "auto";
            }
        }
    }
}

