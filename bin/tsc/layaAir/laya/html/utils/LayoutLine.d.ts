import { ILayout } from "./ILayout";
/**
 * @private
 */
export declare class LayoutLine {
    elements: ILayout[];
    x: number;
    y: number;
    w: number;
    h: number;
    wordStartIndex: number;
    minTextHeight: number;
    mWidth: number;
    /**
     * 底对齐（默认）
     * @param	left
     * @param	width
     * @param	dy
     * @param	align		水平
     * @param	valign		垂直
     * @param	lineHeight	行高
     */
    updatePos(left: number, width: number, lineNum: number, dy: number, align: string, valign: string, lineHeight: number): void;
}
