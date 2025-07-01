import { ILaya } from "../../ILaya";
import { NodeFlags } from "../Const";
import { Event } from "../events/Event";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { Loader } from "../net/Loader";
import { Texture } from "../resource/Texture";
import { GWidget } from "./GWidget";
import { ImageRenderer } from "./ImageRenderer";
import { IMeshFactory } from "../display/mesh/MeshFactory";

/**
 * @en GImage is a widget that displays an image resource.
 * @zh GImage 是一个显示图像资源的小部件。
 * @blueprintInheritable
 */
export class GImage extends GWidget {
    private _src: string = "";
    private _color: string;
    private _autoSize: boolean;
    private _loadId: number = 0;

    private _renderer: ImageRenderer;

    constructor() {
        super();

        this._color = "#ffffff";
        this._autoSize = true;
        this._renderer = new ImageRenderer(this);
        this._renderer._onReload = () => this.onTextureReload();
    }

    /**
     * @en The source URL of the image resource.
     * @zh 图像资源的源 URL。
     */
    get src(): string {
        return this._src;
    }

    set src(value: string) {
        if (value == null)
            value = "";
        if (this._src == value)
            return;

        this._src = value;
        let loadID = ++this._loadId;
        if (value) {
            //在反序列化时，禁止立刻设置texture，因为autoSize值还没反序列化
            let tex = SerializeUtil.isDeserializing ? null : Loader.getRes(value);
            if (tex)
                this.onLoaded(tex, loadID);
            else
                ILaya.loader.load(value, Loader.IMAGE).then(res => this.onLoaded(res, loadID));
        }
        else
            this.onLoaded(null, loadID);
    }

    /**
     * @en The texture of the image.
     * @zh 图像的纹理。
     */
    get texture(): Texture {
        return this._renderer._tex;
    }

    set texture(value: Texture) {
        this._src = "instance-0";
        this.onLoaded(value, ++this._loadId);
    }

    /**
     * @en The mesh factory used for customizing the mesh of the image.
     * @zh 用于自定义图像网格的网格工厂。
     */
    get mesh(): IMeshFactory {
        return this._renderer._meshFactory;
    }

    set mesh(value: IMeshFactory) {
        this._renderer.setMesh(value);
    }

    /** @ignore */
    get icon(): string {
        return this.src;
    }

    set icon(value: string) {
        this.src = value;
    }

    /**
     * @en Whether to use the original size of the resource.
     * @zh 是否使用资源的原始大小。
     */
    get autoSize(): boolean {
        return this._autoSize;
    }

    set autoSize(value: boolean) {
        if (this._autoSize != value) {
            if (value && this._renderer._tex)
                this.size(this._renderer._tex.sourceWidth, this._renderer._tex.sourceHeight);
            this._autoSize = value; //放最后，因为size会改变autoSize的值
        }
    }

    /**
     * @en The color of the object.
     * @zh 对象的颜色。
     */
    get color() {
        return this._color;
    }

    set color(value: string) {
        this._color = value;
        this._renderer.setColor(value);
    }

    protected onLoaded(tex: Texture, loadID: number) {
        if (this._loadId != loadID || this.destroyed)
            return;

        this._renderer.setTexture(tex);

        if (this._autoSize) {
            if (tex)
                this.size(tex.sourceWidth, tex.sourceHeight);
            else if (!this._getBit(NodeFlags.EDITING_NODE))
                this.size(0, 0);
            this._autoSize = true;
        }

        this.event(Event.LOADED);
    }

    private onTextureReload() {
        if (this._autoSize) {
            let tex = this._renderer._tex;
            this.size(tex.sourceWidth, tex.sourceHeight);
            this._autoSize = true;
        }

        this.event(Event.LOADED);
    }

    protected _sizeChanged(changeByLayout?: boolean): void {
        super._sizeChanged();

        if (!changeByLayout && !SerializeUtil.isDeserializing)
            this._autoSize = false;
    }

    /** @ignore */
    destroy(): void {
        super.destroy();

        this._renderer.destroy();
    }

    /** @internal @blueprintEvent */
    GImage_bpEvent: {
        [Event.LOADED]: () => void;
    };
}
