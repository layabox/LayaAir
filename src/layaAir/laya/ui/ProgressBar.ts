import { Event } from "../events/Event"
import { UIComponent } from "./UIComponent"
import { Image } from "./Image"
import { Handler } from "../utils/Handler"
import { HideFlags } from "../Const"
import { URL } from "../net/URL"
import { Utils } from "../utils/Utils"
import { AssetDb } from "../resource/AssetDb"

/**
 * @en The `ProgressBar` component displays the loading progress of content.
 * change event is dispatched when the value changes.
 * @zh `ProgressBar` 组件用于显示内容的加载进度。
 * change事件用于值发生改变后调度。
 */
export class ProgressBar extends UIComponent {
    protected _bg: Image;
    protected _bar: Image;
    protected _skin: string;
    protected _value: number = 0.5;
    /**
     * @en The handler function that is called when the value of the `ProgressBar` instance's `value` property changes.The progress value. Default to return the `value` property.
     * @zh 当 `ProgressBar` 实例的 `value` 属性发生变化时的函数处理器。默认返回参数 `value` 属性（进度值）。
     */
    changeHandler: Handler;

    /**
     * @en The skin of the progress bar.
     * @zh 进度条的皮肤资源路径。
     */
    get skin(): string {
        return this._skin;
    }

    set skin(value: string) {
        if (this._skin == value)
            return;

        this._setSkin(value);
    }

    /**
     * @en The current progress value, range from 0 to 1.
     * @zh 当前的进度量，取值范围为 0 到 1 之间。
     */
    get value(): number {
        return this._value;
    }

    set value(num: number) {
        if (this._value != num) {
            num = num > 1 ? 1 : num < 0 ? 0 : num;
            this._value = num;
            this.callLater(this.changeValue);
            this.event(Event.CHANGE);
            this.changeHandler && this.changeHandler.runWith(num);
        }
    }

    /**
     * @en The progress bar object.
     * @zh 进度条对象。
     */
    get bar(): Image {
        return this._bar;
    }

    /**
     * @en The background bar object.
     * @zh 进度背景条对象。
     */
    get bg(): Image {
        return this._bg;
    }

    /**
      * @en The size grid of the texture.
      * The size grid is a 3x3 division of the texture, allowing it to be scaled without distorting the corners and edges. 
      * The array contains five values representing the top, right, bottom, and left margins, and whether to repeat the fill (0: no repeat, 1: repeat). 
      * The values are separated by commas. For example: "6,6,6,6,1".
      * @zh 纹理的九宫格数据。
      * 九宫格是一种将纹理分成3x3格的方式，使得纹理缩放时保持角和边缘不失真。
      * 数组包含五个值，分别代表上边距、右边距、下边距、左边距以及是否重复填充（0：不重复填充，1：重复填充）。
      * 值以逗号分隔。例如："6,6,6,6,1"。
      */
    get sizeGrid(): string {
        return this._bg.sizeGrid;
    }

    set sizeGrid(value: string) {
        this._bg.sizeGrid = this._bar.sizeGrid = value;
    }

    /**
     * @ignore
     * @en creates an instance of ProgressBar.
     * @param skin The skin URL.
     * @zh 创建一个 ProgresBar 的实例。
     * @param skin 皮肤地址。
     */
    constructor(skin: string = null) {
        super();
        this.skin = skin;
    }

    protected createChildren(): void {
        this._bg = new Image();
        this._bg.left = 0;
        this._bg.right = 0;
        this._bg.top = 0;
        this._bg.bottom = 0;
        this._bg.hideFlags = HideFlags.HideAndDontSave;
        this.addChild(this._bg);

        this._bar = new Image();
        this._bar.hideFlags = HideFlags.HideAndDontSave;
        this._bar.top = 0;
        this._bar.bottom = 0;
        this.addChild(this._bar);
    }

    /**@internal */
    _setSkin(url: string): Promise<void> {
        this._skin = url;

        if (url) {
            return AssetDb.inst.resolveURL(url).then(url => {
                if (this._destroyed)
                    return null;

                if (this._skinBaseUrl)
                    url = URL.formatURL(url, this._skinBaseUrl);

                return Promise.all([
                    this._bg._setSkin(url),
                    this._bar._setSkin(Utils.replaceFileExtension(url, "$bar.png", true))
                ]).then(() => this._skinLoaded());
            });
        }
        else {
            this._bg.skin = null;
            this._bar.skin = null;
            this._skinLoaded();
            return Promise.resolve();
        }
    }
    
    protected _skinLoaded(): void {
        if (this._destroyed)
            return;

        this.callLater(this.changeValue);
        this._sizeChanged();
        this.event(Event.LOADED);
    }

    protected measureWidth(): number {
        return this._bg.width;
    }
    protected measureHeight(): number {
        return this._bg.height;
    }

    /**
     * @en Changes the progress value.
     * @zh 更改进度值的显示。
     */
    protected changeValue(): void {
        if (this.sizeGrid) {
            let grid = this.sizeGrid.split(",");
            let left = parseInt(grid[3]);
            if (isNaN(left))
                left = 0;
            let right = parseInt(grid[1]);
            if (isNaN(right))
                right = 0;
            let max = this.width - left - right;
            let sw = max * this._value;
            this._bar.width = left + right + sw;
            this._bar.visible = this._bar.width > left + right;
        } else {
            this._bar.width = this.width * this._value;
        }
    }

    /**
     * @en Sets the width of the component.
     * @param value The width value to set.
     * @zh 设置组件的宽度。
     * @param value 要设置的宽度值。
     */
    set_width(value: number): void {
        super.set_width(value);
        this.callLater(this.changeValue);
    }

    /**
     * @en Sets the data source for the component.
     * @param value The data source to set. If it's a number or string, it will be converted to a number and set as the component's value.
     * @zh 设置组件的数据源。
     * @param value 要设置的数据源。如果是数字或字符串，将被转换为数字并设置为组件的值。
     */
    set_dataSource(value: any): void {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.value = Number(value);
        else
            super.set_dataSource(value);
    }

    /**
     * @en Destroys the component and its child elements.
     * @param destroyChild Whether to destroy child elements. Default is true.
     * @zh 销毁组件及其子元素。
     * @param destroyChild 是否销毁子元素。默认为 true。
     */
    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._bg && this._bg.destroy(destroyChild);
        this._bar && this._bar.destroy(destroyChild);
        this._bg = this._bar = null;
        this.changeHandler = null;
    }

}