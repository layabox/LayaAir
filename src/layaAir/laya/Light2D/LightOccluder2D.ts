import { Component } from "../components/Component";
import { Event } from "../events/Event";
import { Sprite } from "../display/Sprite";
import { Light2DManager } from "./Light2DManager";
import { LightOccluder2DCore } from "./LightOccluder2DCore";
import { PolygonPoint2D } from "./PolygonPoint2D";

/**
 * 2D灯光遮挡器（遮光器）
 */
export class LightOccluder2D extends Component {
    private _core: LightOccluder2DCore; //遮光器内核
    declare owner: Sprite;

    /**
     * @en the layer mask
     * @zh 遮光器层遮罩（遮光器影响哪些层）
     */
    get layerMask(): number {
        return this._core.layerMask;
    }
    set layerMask(value: number) {
        this._core.layerMask = value;
    }

    /**
     * @en Can in light boolean value
     * @zh 灯光在内部时是否挡光
     */
    get canInLight(): boolean {
        return this._core.canInLight;
    }
    set canInLight(value: boolean) {
        this._core.canInLight = value;
    }

    /**
     * @en Only outside shadow the light
     * @zh 是否只是外圈遮挡光线
     */
    get outside(): boolean {
        return this._core.outside;
    }
    set outside(value: boolean) {
        this._core.outside = value;
    }

    /**
     * @en Get polygon endpoint data
     * @zh 获取多边形端点数据
     */
    get polygonPoint() {
        return this._core.polygonPoint;
    }
    set polygonPoint(poly: PolygonPoint2D) {
        this._core.polygonPoint = poly;
    }

    /**
     * @ignore
     */
    constructor() {
        super();
        this._core = new LightOccluder2DCore();
    }

    protected _onEnable(): void {
        super._onEnable();
        this.owner.on(Event.TRANSFORM_CHANGED, this._core, this._core._transformChange);
        this._core.owner = this.owner;
        this._core.manager = this.owner.scene?._light2DManager as Light2DManager;
        this._core._onEnable();
    }

    protected _onDisable(): void {
        super._onDisable();
        this.owner.off(Event.TRANSFORM_CHANGED, this._core, this._core._transformChange);
        this._core._onDisable();
    }
}