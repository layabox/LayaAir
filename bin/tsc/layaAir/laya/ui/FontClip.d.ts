import { Clip } from "./Clip";
/**
 * 字体切片，简化版的位图字体，只需设置一个切片图片和文字内容即可使用，效果同位图字体
 * 使用方式：设置位图字体皮肤skin，设置皮肤对应的字体内容sheet（如果多行，可以使用空格换行），示例：
 * fontClip.skin = "font1.png";//设置皮肤
 * fontClip.sheet = "abc123 456";//设置皮肤对应的内容，空格换行。此皮肤为2行5列（显示时skin会被等分为2行5列），第一行对应的文字为"abc123"，第二行为"456"
 * fontClip.value = "a1326";//显示"a1326"文字
 */
export declare class FontClip extends Clip {
    /**数值*/
    protected _valueArr: string;
    /**文字内容数组**/
    protected _indexMap: any;
    /**位图字体内容**/
    protected _sheet: string;
    /**@private */
    protected _direction: string;
    /**X方向间隙*/
    protected _spaceX: number;
    /**Y方向间隙*/
    protected _spaceY: number;
    /**@private 水平对齐方式*/
    private _align;
    /**@private 显示文字宽*/
    private _wordsW;
    /**@private 显示文字高*/
    private _wordsH;
    /**
     * @param skin 位图字体皮肤
     * @param sheet 位图字体内容，空格代表换行
     */
    constructor(skin?: string, sheet?: string);
    protected createChildren(): void;
    /**
     * 资源加载完毕
     */
    private _onClipLoaded;
    /**
     * 设置位图字体内容，空格代表换行。比如"abc123 456"，代表第一行对应的文字为"abc123"，第二行为"456"
     */
    sheet: string;
    /**
     * 设置位图字体的显示内容
     */
    value: string;
    /**
     * 布局方向。
     * <p>默认值为"horizontal"。</p>
     * <p><b>取值：</b>
     * <li>"horizontal"：表示水平布局。</li>
     * <li>"vertical"：表示垂直布局。</li>
     * </p>
     */
    direction: string;
    /**X方向文字间隙*/
    spaceX: number;
    /**Y方向文字间隙*/
    spaceY: number;
    /**水平对齐方式*/
    align: string;
    /**渲染数值*/
    protected changeValue(): void;
    width: number;
    height: number;
    protected measureWidth(): number;
    protected measureHeight(): number;
    destroy(destroyChild?: boolean): void;
}
