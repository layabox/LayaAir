import { Event } from "../../../../events/Event";
import { Sprite } from "../../../Sprite";
import { Light2DManager } from "../../Light2D/Light2DManager";
import { LightOccluder2DCore } from "../../Light2D/LightOccluder2DCore";
import { PolygonPoint2D } from "../../Light2D/PolygonPoint2D";

/**
 * 2D灯光遮挡器（遮光器）
 */
export class TileMapOccluder {
   private _core: LightOccluder2DCore; //遮光器内核

   owner: Sprite;

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

   set manager(value: Light2DManager) {
      this._core.manager = value;
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
     * @en Set polygon endpoint data
     * @param poly Polygon data
     * @zh 设置多边形端点数据
     * @param poly 多边形数据
     */
   public get polygonPoint(): PolygonPoint2D {
      return this._core.polygonPoint;
   }

   public set polygonPoint(value: PolygonPoint2D) {
      this._core.polygonPoint = value;
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

   constructor() {
      this._core = new LightOccluder2DCore();
   }

   _onEnable(): void {
      this._core.owner = this.owner;
      this.owner.on(Event.TRANSFORM_CHANGED, this._core, this._core._transformChange);
      this._core._onEnable();
   }

   _onDisable(): void {
      this.owner.off(Event.TRANSFORM_CHANGED, this._core, this._core._transformChange);
      this._core._onDisable();
   }

   /**
     * 销毁
     */
   destroy() {
      this._onDisable();
      this._core.destroy();
      this._core = null;
   }

}