import { UIComponent } from "./UIComponent";
import { Stage } from "../display/Stage";
import { Texture } from "../resource/Texture";
import { Texture2D } from "../resource/Texture2D";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";

/**
 * 微信开放数据展示组件，直接实例本组件，即可根据组件宽高，位置，以最优的方式显示开放域数据
 */
export class OpenDataContextView extends UIComponent {

    /**@internal */
    private _fps: number = 30;

    /**
     * @override
     */
    set x(value: number) {
        super.x = value;
        this.callLater(this.updateViewPort);
    }

    /**
     * @override
     */
    get x() {
        return super.x;
    }

    /**
     * @override
     */
    set y(value: number) {
        super.y = value;
        this.callLater(this.updateViewPort);
    }

    /**
     * @override
     */
    get y() {
        return super.y;
    }

    get fps() {
        return this._fps;
    }

    set fps(value: number) {
        if (this._fps != value) {
            this._fps = value;
            if (LayaEnv.isPlaying && this.activeInHierarchy
                && (window as any).wx && (window as any).sharedCanvas) {
                ILaya.timer.clear(this, this._onLoop);
                ILaya.timer.loop(1000 / value, this, this._onLoop);
            }
        }
    }

    constructor() {
        super();
        this._width = this._height = 200;
        let tex: Texture = new Texture(new Texture2D(this._width, this._height, TextureFormat.R8G8B8A8, false, false, true));
        tex.bitmap.lock = true;
        this.texture = tex;
    }

    /**
     * @internal
     */
    _onActive(): void {
        if (!LayaEnv.isPlaying)
            return;

        if ((window as any).wx && (window as any).sharedCanvas)
            ILaya.timer.loop(1000 / this._fps, this, this._onLoop);
    }
    /**
     * @internal
     */
    _onInActive(): void {
        if (!LayaEnv.isPlaying)
            return;

        this.postMsg({ type: "close" });
        ILaya.timer.clear(this, this._onLoop);
    }

    /**
     * @internal
     * @override
     */
    _setWidth(value: number) {
        super._setWidth(value);
        if ((window as any).sharedCanvas) (window as any).sharedCanvas.width = value;
        this.callLater(this.updateViewPort);
    }

    /**
     * @internal
     * @override
     */
    _setHeight(value: number) {
        super._setHeight(value);
        if ((window as any).sharedCanvas) (window as any).sharedCanvas.height = value;
        this.callLater(this.updateViewPort);
    }

    /**@internal  */
    private _onLoop(): void {
        let tex = this.texture;
        let canvas: HTMLCanvasElement = (window as any).sharedCanvas;
        if (tex.width != canvas.width || tex.height != canvas.height) {
            tex.bitmap.destroy();
            tex.bitmap = new Texture2D(canvas.width, canvas.height, TextureFormat.R8G8B8A8, false, false, true, true);
            tex.bitmap.lock = true;
        }
        (<Texture2D>tex.bitmap).setImageData(canvas, true, false);
    }

    /**
     * @internal
     */
    private updateViewPort(): void {
        let stage: Stage = ILaya.stage;
        let sx = stage._canvasTransform.getScaleX() * this.globalScaleX * stage.transform.getScaleX();
        let sy = stage._canvasTransform.getScaleY() * this.globalScaleY * stage.transform.getScaleY();

        this.postMsg({
            type: "updateViewPort",
            box: {
                x: this.x * sx,
                y: this.y * sy,
                width: this.width * sx,
                height: this.height * sy,
            }
        });
    }

    /**向开放数据域发送消息*/
    postMsg(msg: any): void {
        if ((window as any).wx && (window as any).wx.getOpenDataContext) {
            var openDataContext: any = (window as any).wx.getOpenDataContext();
            openDataContext.postMessage(msg);
        }
    }
}