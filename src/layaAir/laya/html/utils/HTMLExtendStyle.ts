import { Pool } from "../../utils/Pool";
import { ClassUtils } from "../../utils/ClassUtils";

/**
 * @private
 */
export class HTMLExtendStyle {

    static EMPTY: HTMLExtendStyle = new HTMLExtendStyle();
    /**
     * <p>描边宽度（以像素为单位）。</p>
     * 默认值0，表示不描边。
     * @default 0
     */
    stroke: number;
    /**
     * <p>描边颜色，以字符串表示。</p>
     * @default "#000000";
     */
    strokeColor: string;
    /**
     * <p>垂直行间距（以像素为单位）</p>
     */
    leading: number;
    /**行高。 */
    lineHeight: number;
    letterSpacing: number;
    href: string;
    constructor() {
        this.reset();
    }
    reset(): HTMLExtendStyle {
        this.stroke = 0;
        this.strokeColor = "#000000";
        this.leading = 0;
        this.lineHeight = 0;
        this.letterSpacing = 0;
        this.href = null;
        return this;
    }

    recover(): void {
        if (this == HTMLExtendStyle.EMPTY) return;
        Pool.recover("HTMLExtendStyle", this.reset());
    }

    /**
     * 从对象池中创建
     */
    //TODO:coverage
    static create(): HTMLExtendStyle {
        return Pool.getItemByClass("HTMLExtendStyle", HTMLExtendStyle);
    }
}

ClassUtils.regClass("laya.html.utils.HTMLExtendStyle", HTMLExtendStyle);
ClassUtils.regClass("Laya.HTMLExtendStyle", HTMLExtendStyle);


