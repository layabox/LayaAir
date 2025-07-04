import { Stage } from "./Stage";
import { Texture } from "../resource/Texture";
import { Texture2D } from "../resource/Texture2D";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { TransformKind } from "./SpriteConst";
import { Sprite } from "./Sprite";
import { Widget } from "../components/Widget";
import { PAL } from "../platform/PlatformAdapters";

/**
 * @en OpenDataContext component for displaying OpenData in WeChat mini-games. Instantiate this component directly to optimally display OpenData based on the component's width, height, and position.
 * @zh 微信小游戏开放数据域显示组件，直接实例化本组件，即可根据组件宽高和位置，以最优的方式显示开放数据域数据。
 */
export class OpenDataContextView extends Sprite {
    private _fps: number = 30;
    private _widget: Widget;
    private _canvas: HTMLCanvasElement;

    /** @ignore */
    constructor() {
        super();

        this._width = this._height = 200;
        this._widget = Widget.EMPTY;
        let tex: Texture = new Texture(new Texture2D(this._width, this._height, TextureFormat.R8G8B8A8, false, false, true));
        tex.bitmap.lock = true;
        this.texture = tex;

        this._canvas = PAL.browser.getOpenDataContextCanvas();
    }

    /**
     * @en The frame rate.
     * @zh 帧率。
     */
    get fps() {
        return this._fps;
    }

    set fps(value: number) {
        if (this._fps != value) {
            this._fps = value;
            if (LayaEnv.isPlaying && this.activeInHierarchy && this._canvas) {
                ILaya.timer.clear(this, this._onLoop);
                ILaya.timer.loop(1000 / value, this, this._onLoop);
            }
        }
    }

    /**
     * @ignore
     */
    _onActive(): void {
        if (!LayaEnv.isPlaying)
            return;

        if (this._canvas)
            ILaya.timer.loop(1000 / this._fps, this, this._onLoop);
    }
    /**
     * @ignore
     */
    _onInActive(): void {
        if (!LayaEnv.isPlaying)
            return;

        this.postMsg({ type: "close" });
        ILaya.timer.clear(this, this._onLoop);
    }

    /**
     * @en The vertical distance (in pixels) between the top edge of the component and the top edge of its content area.
     * @zh 从组件顶边到其内容区域顶边之间的垂直距离（以像素为单位）。
     */
    get top(): number {
        return this._widget.top;
    }

    set top(value: number) {
        if (value != this._widget.top) {
            this._getWidget().top = value;
        }
    }

    /**
     * @en The vertical distance (in pixels) between the bottom edge of the component and the bottom edge of its content area.
     * @zh 从组件底边到其内容区域底边之间的垂直距离（以像素为单位）。
     */
    get bottom(): number {
        return this._widget.bottom;
    }

    set bottom(value: number) {
        if (value != this._widget.bottom) {
            this._getWidget().bottom = value;
        }
    }

    /**
     * @en The horizontal distance (in pixels) between the left edge of the component and the left edge of its content area.
     * @zh 从组件左边到其内容区域左边之间的水平距离（以像素为单位）。
     */
    get left(): number {
        return this._widget.left;
    }

    set left(value: number) {
        if (value != this._widget.left) {
            this._getWidget().left = value;
        }
    }

    /**
     * @en The horizontal distance (in pixels) between the right edge of the component and the right edge of its content area.
     * @zh 从组件右边到其内容区域右边之间的水平距离（以像素为单位）。
     */
    get right(): number {
        return this._widget.right;
    }

    set right(value: number) {
        if (value != this._widget.right) {
            this._getWidget().right = value;
        }
    }

    /**
     * @en The distance (in pixels) between the horizontal axis of this object and the horizontal center line of its parent container.
     * @zh 在父容器中，此对象的水平方向中轴线与父容器的水平方向中心线的距离（以像素为单位）。
     */
    get centerX(): number {
        return this._widget.centerX;
    }

    set centerX(value: number) {
        if (value != this._widget.centerX) {
            this._getWidget().centerX = value;
        }
    }

    /**
     * @en The distance (in pixels) between the vertical axis of this object and the vertical center line of its parent container.
     * @zh 在父容器中，此对象的垂直方向中轴线与父容器的垂直方向中心线的距离（以像素为单位）。
     */
    get centerY(): number {
        return this._widget.centerY;
    }

    set centerY(value: number) {
        if (value != this._widget.centerY) {
            this._getWidget().centerY = value;
        }
    }

    private _getWidget(): Widget {
        this._widget === Widget.EMPTY && (this._widget = this.addComponent(Widget));
        return this._widget;
    }

    private _onLoop(): void {
        let tex = this.texture;
        let canvas = this._canvas;
        if (tex.width != canvas.width || tex.height != canvas.height) {
            tex.bitmap.destroy();
            tex.bitmap = new Texture2D(canvas.width, canvas.height, TextureFormat.R8G8B8A8, false, false, true, true);
            tex.bitmap.lock = true;
        }

        if (this._canvas)
            (<Texture2D>tex.bitmap).setImageData(canvas, true, false);
    }

    /**
     * @ignore
     */
    protected _transChanged(kind: TransformKind) {
        super._transChanged(kind);

        if ((kind & TransformKind.Size) != 0) {
            if (this._canvas) {
                this._canvas.width = this._width;
                this._canvas.height = this._height;
            }
            if (this._widget !== Widget.EMPTY) this._widget.resetLayout();
            this.callLater(this.updateViewPort);
        }

        if ((kind & TransformKind.Pos) != 0)
            this.callLater(this.updateViewPort);
    }

    updateViewPort(): void {
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

    /**
     * @en Send a message to the OpenData context.
     * @param msg Message to send.
     * @zh 向开放数据域发送消息。
     * @param msg 要发送的消息。
     */
    postMsg(msg: any): void {
        PAL.browser.postMessageToOpenDataContext(msg);
    }
}