/**
 * @private
 */
export declare class HTMLExtendStyle {
    static EMPTY: HTMLExtendStyle;
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
    constructor();
    reset(): HTMLExtendStyle;
    recover(): void;
    /**
     * 从对象池中创建
     */
    static create(): HTMLExtendStyle;
}
