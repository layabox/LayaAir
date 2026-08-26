import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
import { InputManager } from "../events/InputManager";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { Texture } from "../resource/Texture";
import { AlignType, LoaderFitMode, VAlignType } from "./Const";
import { GLoader } from "./GLoader";
import { GRoot } from "./GRoot";

/**
 * @en The DragDropManager class is used to manage drag-and-drop operations in the UI.
 * @zh DragDropManager 类用于管理 UI 中的拖放操作。
 * @blueprintable
 */
export class DragDropManager {
    /**
     * @en A loader used to display a drag image.
     * @zh 用于显示一个拖动图像的加载器。
     */
    readonly agent: GLoader;

    /**
     * @en The default width of the drag image.
     * @zh 拖动图像的默认宽度。
     */
    iconWidth = 200;

    /**
     * @en The default height of the drag image.
     * @zh 拖动图像的默认高度。
     */
    iconHeight = 200;

    private _source: Sprite;
    private _rt: Texture;

    private static _inst: DragDropManager;
    /**
     * @en Gets the singleton instance of DragDropManager.
     * @zh 获取 DragDropManager 的单例实例。
     */
    static get inst(): DragDropManager {
        return DragDropManager._inst || (DragDropManager._inst = new DragDropManager());
    }

    /** @ignore @blueprintIgnore */
    constructor() {
        let agent = this.agent = new GLoader();
        agent.name = "dragAgent";
        agent.anchor(0.5, 0.5);
        agent.mouseEnabled = false;
        agent.draggable = true;
        agent.fitMode = LoaderFitMode.Contain;
        agent.shrinkOnly = true;
        agent.align = AlignType.Center;
        agent.valign = VAlignType.Middle;
        agent.zOrder = Number.POSITIVE_INFINITY;
        agent.on(Event.DRAG_END, this, this._dragEnd);
    }

    /**
     * @en Indicates whether any object is currently dragging.
     * @zh 表示当前是否有对象正在拖动。
     */
    get dragging(): boolean {
        return this.agent.parent != null;
    }

    /**
     * @en Starts dragging an object. The object is not actually dragged, but a drag image is displayed. You can specify an icon resource or pass a sprite, in which case a screenshot is generated to create the image.
     * @param source The source object to be dragged as a icon.
     * @param icon The icon resource to be used as the drag image.
     * @param data (Optional) The data to be passed to the event handler.
     * @param iconWidth (Optional) The width of the drag image. Defaults to `iconWidth`.
     * @param iconHeight (Optional) The height of the drag image. Defaults to `iconHeight`.
     * @zh 开始拖动一个对象，对象并不会实际并拖动，而是显示一个拖动图像，这个图像可以通过制定一个图标资源，也可以传入一个sprite，这时会通过截图的方式生成一个图像。
     * @param source 要拖动的源对象。
     * @param icon 用作拖动图像的图标资源。
     * @param data （可选）要传递给事件处理程序的数据。
     * @param iconWidth （可选）拖动图像的宽度。默认为 `iconWidth`。
     * @param iconHeight （可选）拖动图像的高度。默认为 `iconHeight`。
     */
    start(source: Sprite, icon: string, data: any, iconWidth?: number, iconHeight?: number): void;
    /**
     * @en Starts dragging an object. The object is not actually dragged, but a drag image is displayed. You can specify an icon resource or pass a sprite, in which case a screenshot is generated to create the image.
     * @param source The source object to be dragged as a icon.
     * @param iconSource The sprite whose snapshot will be used as the drag image icon resource.
     * @param data (Optional) The data to be passed to the event handler.
     * @param iconWidth (Optional) The width of the drag image. Defaults to `iconWidth`.
     * @param iconHeight (Optional) The height of the drag image. Defaults to `iconHeight`.
     * @zh 开始拖动一个对象，对象并不会实际并拖动，而是显示一个拖动图像，这个图像可以通过制定一个图标资源，也可以传入一个sprite，这时会通过截图的方式生成一个图像。
     * @param source 要拖动的源对象。
     * @param iconSource 将用此Sprite的快照作为拖动图像的图标资源。
     * @param data （可选）要传递给事件处理程序的数据。
     * @param iconWidth （可选）拖动图像的宽度。默认为 `iconWidth`。
     * @param iconHeight （可选）拖动图像的高度。默认为 `iconHeight`。
     */
    start(source: Sprite, iconSource: Sprite, data: any, iconWidth?: number, iconHeight?: number): void;
    start(source: Sprite, icon: string | Sprite, data: any, iconWidth?: number, iconHeight?: number): void {
        if (this.agent.parent != null)
            return;

        this._source = source;

        let pt = InputManager.getTouchPos();
        this.agent.pos(pt.x, pt.y);
        if (typeof (icon) === 'string')
            this.agent.src = icon;
        else if (icon != null) {
            if (this._rt == null) {
                let rt = new RenderTexture2D(this.iconWidth, this.iconHeight, RenderTargetFormat.R8G8B8A8);
                this._rt = new Texture(rt);
            }
            icon.drawToRenderTexture2D(this._rt.width, this._rt.height, 0, 0, this._rt.bitmap as RenderTexture2D, true, true);
            this.agent.texture = this._rt;
        }
        this.agent.size(iconWidth || this.iconWidth, iconHeight || this.iconHeight);
        GRoot.inst.addChild(this.agent);
        this.agent.startDrag(null, false, null, null, data);
    }

    /**
     * @en Cancels the current drag operation.
     * @zh 取消当前的拖动操作。
     */
    stop(): void {
        if (this.agent.parent != null) {
            this.agent.src = null;
            this.agent.stopDrag();
            this.agent.removeSelf();
            this._source = null;
        }
    }

    private _dragEnd(data: any, cancelled: boolean): void {
        if (this.agent.parent == null) //cancelled
            return;

        this.agent.src = null;
        this.agent.removeSelf();
        let source = this._source;
        this._source = null;

        if (!cancelled) {
            let obj = InputManager.touchTarget;
            while (obj != null) {
                if (obj.hasListener(Event.DROP)) {
                    obj.event(Event.DROP, [source, data]);
                    return;
                }
                obj = obj.parent;
            }
        }
    }
}