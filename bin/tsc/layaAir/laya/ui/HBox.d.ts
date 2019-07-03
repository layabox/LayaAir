import { LayoutBox } from "./LayoutBox";
/**
     * <code>HBox</code> 是一个水平布局容器类。
     */
export declare class HBox extends LayoutBox {
    /**
     * 无对齐。
     */
    static NONE: string;
    /**
     * 居顶部对齐。
     */
    static TOP: string;
    /**
     * 居中对齐。
     */
    static MIDDLE: string;
    /**
     * 居底部对齐。
     */
    static BOTTOM: string;
    /** @inheritDoc	*/
    protected sortItem(items: any[]): void;
    height: number;
    /** @inheritDoc	*/
    protected changeItems(): void;
}
