import { Browser } from "./Browser";
/**
	 * <code>Mouse</code> 类用于控制鼠标光标样式。
	 */
export class Mouse {
    /**@private */
    private static _style: any;
    /**@private */
    private static _preCursor: string;

    /**
     * 设置鼠标样式
     * @param cursorStr
     * 例如auto move no-drop col-resize
     * all-scroll pointer not-allowed row-resize
     * crosshair progress e-resize ne-resize
     * default text n-resize nw-resize
     * help vertical-text s-resize se-resize
     * inherit wait w-resize sw-resize
     */
    static set cursor(cursorStr: string) {
        Mouse._style.cursor = cursorStr;
    }

    static get cursor(): string {
        return Mouse._style.cursor;
    }

    /**@internal */
    static __init__(): any {
        Mouse._style = Browser.document.body.style;
    }

    /**
     * 隐藏鼠标
     */
    static hide(): void {
        if (Mouse.cursor != "none") {
            Mouse._preCursor = Mouse.cursor;
            Mouse.cursor = "none";
        }
    }

    /**
     * 显示鼠标
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

