import { ILaya } from "../../ILaya";
import { NodeFlags } from "../Const";
import { TransformKind } from "../display/SpriteConst";
import { Event } from "../events/Event";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { Loader } from "../net/Loader";
import { Texture } from "../resource/Texture";
import { GWidget } from "./GWidget";
import { ImageRenderer } from "./render/ImageRenderer";
import { IMeshFactory } from "./render/MeshFactory";

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

    public get src(): string {
        return this._src;
    }

    public set src(value: string) {
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
                ILaya.loader.load(value).then(res => this.onLoaded(res, loadID));
        }
        else
            this.onLoaded(null, loadID);
    }

    public get texture(): Texture {
        return this._renderer._tex;
    }

    public set texture(value: Texture) {
        this._src = "";
        this.onLoaded(value, ++this._loadId);
    }

    public get mesh(): IMeshFactory {
        return this._renderer._meshFactory;
    }

    public set mesh(value: IMeshFactory) {
        this._renderer.setMesh(value);
    }

    public updateMesh() {
        this._renderer.updateMesh();
    }

    public get icon(): string {
        return this.src;
    }

    public set icon(value: string) {
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

        this._renderer.updateMesh();
    }

    protected _transChanged(kind: TransformKind): void {
        super._transChanged(kind);

        if (kind & TransformKind.Anchor)
            this._renderer.updateMesh();
    }

    destroy(): void {
        super.destroy();

        this._renderer.destroy();
    }
}
