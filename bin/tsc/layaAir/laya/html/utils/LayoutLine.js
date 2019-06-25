import { HTMLStyle } from "././HTMLStyle";
import { IHtml } from "./IHtml";
/**
 * @private
 */
export class LayoutLine {
    constructor() {
        this.elements = [];
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.wordStartIndex = 0;
        this.minTextHeight = 99999;
        this.mWidth = 0;
    }
    //注释：垂直居中对齐是以最小的文字单位为中心点对齐(如果没有文字，就以上对齐)
    //如果计算的坐标小于高度，那么以高度为主
    /**
     * 底对齐（默认）
     * @param	left
     * @param	width
     * @param	dy
     * @param	align		水平
     * @param	valign		垂直
     * @param	lineHeight	行高
     */
    updatePos(left, width, lineNum, dy, align, valign, lineHeight) {
        var w = 0;
        //重新计算宽度，因为上层的排序跟分段规则导致宽度计算不正确，把宽度计算放到这里，后面看情况再去优化
        var one;
        if (this.elements.length > 0) {
            one = this.elements[this.elements.length - 1];
            w = one.x + one.width - this.elements[0].x;
        }
        lineHeight = lineHeight || this.h;
        var dx = 0, ddy;
        if (align === HTMLStyle.ALIGN_CENTER)
            dx = (width - w) / 2;
        if (align === HTMLStyle.ALIGN_RIGHT)
            dx = (width - w);
        //lineHeight === 0 || valign != 0 || (valign = 1);
        for (var i = 0, n = this.elements.length; i < n; i++) {
            one = this.elements[i];
            var tCSSStyle = one._getCSSStyle();
            dx !== 0 && (one.x += dx);
            switch (tCSSStyle.valign) {
                case "top":
                    one.y = dy;
                    break;
                case "middle":
                    var tMinTextHeight = 0;
                    if (this.minTextHeight != 99999)
                        tMinTextHeight = this.minTextHeight;
                    var tBottomLineY = (tMinTextHeight + lineHeight) / 2;
                    tBottomLineY = Math.max(tBottomLineY, this.h); //如果实际行高大于一半行高，用实际行高对齐
                    if (one.eletype == IHtml.HTMLElementType.IMAGE)
                        ddy = dy + tBottomLineY - one.height;
                    else
                        ddy = dy + tBottomLineY - one.height;
                    one.y = ddy;
                    break;
                case "bottom":
                    one.y = dy + (lineHeight - one.height);
                    break;
            }
        }
    }
}
