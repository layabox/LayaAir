/**
     * <code>Mouse</code> 类用于控制鼠标光标样式。
     */
export declare class Mouse {
    /**@private */
    private static _style;
    /**@private */
    private static _preCursor;
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
    static cursor: string;
    /**
     * 隐藏鼠标
     */
    static hide(): void;
    /**
     * 显示鼠标
     */
    static show(): void;
}
