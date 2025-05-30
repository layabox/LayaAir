import { Styles } from "./Styles";
import { Event } from "../events/Event"
import { Loader } from "../net/Loader"
import { Texture } from "../resource/Texture"
import { AutoBitmap } from "./AutoBitmap"
import { UIComponent } from "./UIComponent"
import { UIUtils } from "./UIUtils"
import { ILaya } from "../../ILaya";
import { URL } from "../net/URL";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { TransformKind } from "../display/SpriteConst";

/**
 * @en The Image class represents a bitmap image or drawing graphics display object.
 * Image and Clip are the only two components that support asynchronous loading. For example, `img.skin = "abc/xxx.png"`, other UI components do not support asynchronous loading.
 * Event.LOADED: When the resource is loaded.
 *  @zh Image类是用于表示位图图像或绘制图形的显示对象。
 * Image和Clip组件是唯一支持异步加载的两个组件，比如`img.skin = "abc/xxx.png"`，其他UI组件均不支持异步加载。
 * Event.LOADED：资源加载完成后调度。
 * @blueprintInheritable
 */
export class Image extends UIComponent {
    protected _skin: string;
    protected _group: string;
    protected _useSourceSize: boolean;
    /**@internal */
    declare _graphics: AutoBitmap;

    /**
     * @en The skin address of the object, represented as a string.
     * If the resource is not loaded, it will be loaded first and then applied to this object after loading is complete.
     * Note: After the resource is loaded, it will be automatically cached in the resource library.
     * @zh 图片对象的皮肤纹理资源地址，以字符串表示。
     * 如果资源未加载，则先自动加载资源，加载完成后应用于此对象。
     * 注意：资源加载完成后，会自动缓存至资源库中。
     */
    get skin(): string {
        return this._skin;
    }

    set skin(value: string) {
        if (value == "")
            value = null;
        if (this._skin == value)
            return;

        this._setSkin(value);
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
        if (this._graphics.sizeGrid) return this._graphics.sizeGrid.join(",");
        return null;
    }

    set sizeGrid(value: string) {
        if (value)
            this._graphics.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
        else
            this._graphics.sizeGrid = null;
    }

    /**
     * @en The texture of the object.
     * Note, this is not the image URL, but the image texture. It is recommended to use the skin property to avoid directly using the texture when the image resource has not finished loading.
     * @zh 图片对象的纹理。
     * 注意，这里不是图片的地址，而是图片的纹理。建议使用skin属性，避免图片资源未加载完成时，直接使用texture。
     */
    get source(): Texture {
        return this._graphics.source;
    }
    set source(value: Texture) {
        if (!this._graphics) return;
        this._graphics.source = value;
        this.event(Event.LOADED);
        this.repaint();

        if (this._useSourceSize && value) {
            this.size(value.sourceWidth, value.sourceHeight);
            this._useSourceSize = true; //重置，因为size会改变
        }
        else
            this._sizeChanged();
    }

    /**
     * @en The color of the Image.
     * @zh 图片的纹理颜色。
     */
    get color() {
        return this._graphics.color;
    }

    set color(value: string) {
        this._graphics.color = value;
    }

    /**
     * @en The resource group.
     * @zh 资源分组。
     */
    get group(): string {
        return this._group;
    }

    set group(value: string) {
        if (value && this._skin) Loader.setGroup(this._skin, value);
        this._group = value;
    }

    /**
     * @en Whether to use the original size of the resource.
     * @zh 是否使用资源的原始大小。
     */
    get useSourceSize(): boolean {
        return this._useSourceSize;
    }

    set useSourceSize(value: boolean) {
        if (this._useSourceSize != value) {
            if (value && this._graphics.source)
                this.size(this._graphics.source.sourceWidth, this._graphics.source.sourceHeight);
            this._useSourceSize = value; //放最后，因为size会改变autoSize的值
        }
    }

    /**
     * @en consruct method.
     * @param skin The skin resource address.
     * @zh 构造方法
     * @param skin 皮肤资源地址。
     */
    constructor(skin: string | null = null) {
        super();
        this.skin = skin;
    }

    /**
     * @internal
     */
    _setSkin(url: string): Promise<void> {
        this._skin = url;
        if (url) {
            if (this._skinBaseUrl)
                url = URL.formatURL(url, this._skinBaseUrl);
            let source = Loader.getRes(url);
            if (source) {
                this.source = source;
                return Promise.resolve();
            }
            else {
                let sk = this._skin;
                return ILaya.loader.load(url, { type: Loader.IMAGE, group: this._group }).then(tex => {
                    if (sk == this._skin && !this.destroyed)
                        this.source = tex;
                });
            }
        }
        else {
            this.source = null;
            return Promise.resolve();
        }
    }

    /**
     * @ignore
     */
    protected _transChanged(kind: TransformKind) {
        super._transChanged(kind);

        if ((kind & TransformKind.Width) != 0)
            this._graphics.width = this._width;

        if ((kind & TransformKind.Height) != 0)
            this._graphics.height = this._height;

        if ((kind & TransformKind.Size) != 0) {
            if (!SerializeUtil.isDeserializing)
                this._useSourceSize = false;
        }
    }

    protected measureWidth(): number {
        return this._graphics.width;
    }

    protected measureHeight(): number {
        return this._graphics.height;
    }

    protected createChildren(): void {
        this.setGraphics(new AutoBitmap(), true);
    }

    /**
     * @en Set the data source of the object.
     * @param value The data source.
     * @zh 设置对象的数据源。
     * @param value 数据源。
     */
    set_dataSource(value: any): void {
        this._dataSource = value;
        if (typeof (value) == 'string')
            this.skin = value as string;
        else
            super.set_dataSource(value);
    }

    /**
     * @en Destroy the object and release the loaded skin resources.
     * @zh 销毁对象并释放加载的皮肤资源。
     */
    dispose(): void {
        this.destroy(true);
        ILaya.loader.clearRes(this._skin);
    }

    /** @internal @blueprintEvent */
    Image_bpEvent: {
        [Event.LOADED]: () => void;
    };
}