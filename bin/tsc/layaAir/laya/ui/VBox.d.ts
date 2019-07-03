import { LayoutBox } from "./LayoutBox";
/**
     * <code>VBox</code> 是一个垂直布局容器类。
     */
export declare class VBox extends LayoutBox {
    /**
     * 无对齐。
     */
    static NONE: string;
    /**
     * 左对齐。
     */
    static LEFT: string;
    /**
     * 居中对齐。
     */
    static CENTER: string;
    /**
     * 右对齐。
     */
    static RIGHT: string;
    width: number;
    /** @inheritDoc	*/
    protected changeItems(): void;
}
