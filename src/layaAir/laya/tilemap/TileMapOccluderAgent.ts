import { Light2DManager } from "../Light2D/Light2DManager";
import { PolygonPoint2D } from "../Light2D/PolygonPoint2D";
import { TileMapOccluder } from "./light/TileMapOccluder";
import { TileMapLayer } from "./TileMapLayer";

/**
 * @en TileMap occluder manager.
 * Manages and maintains occluders for the TileMap layer, providing unified interfaces for adding and removing occluders.
 * @zh 瓦片地图遮光器管理器。
 * 负责管理和维护瓦片地图层的遮光器，提供统一的添加和移除接口。
 */
export class TileMapOccluderAgent {
   /** 当前绑定的TileMap层 */
   private _layer: TileMapLayer;

   private _manager: Light2DManager;

   /** 
    * @en Whether the occlusion function is enabled. 
    * @zh 遮光功能是否启用。 
    */
   enable: boolean = false;

   private _occluders: TileMapOccluder[] = [];

   /**
    * @en Create a TileMap occluder manager.
    * @param layer The associated TileMap layer.
    * @zh 创建 TileMap 遮光器管理器。
    * @param layer 关联的 TileMap 层级。
    */
   constructor(layer: TileMapLayer) {
      this._layer = layer;
   }

   /**
    * @en Update the Light2D manager instance.
    * @zh 更新 Light2D 管理器实例。
    */
   _updateManager() {
      let manager = this._layer.owner.scene._light2DManager as Light2DManager;
      this._manager = manager;
   }

   /**
    * @en Update the occlusion state.
    * @param bool The new state to set.
    * @zh 更新遮光状态。
    * @param bool 要设置的新状态。
    */
   updateState(bool: boolean) {
      if (bool != this.enable) {
         this.enable = bool;
         if (bool) this.enableAllOccluders();
         else this.disableAllOccluders();
      }
   }

   /**
    * @en Enable all occluders
    * @zh 激活所有遮光器
    */
   enableAllOccluders() {
      if (!this._manager || !this._occluders.length) return;
      for (let i = 0, len = this._occluders.length; i < len; i++) {
         this._occluders[i].manager = this._manager;
         this._occluders[i]._onEnable();
      }
   }

   /**
    * @en Disable all occluders
    * @zh 禁用所有遮光器 
    */
   disableAllOccluders() {
      if (!this._manager || !this._occluders.length) return;
      for (let i = 0, len = this._occluders.length; i < len; i++)
         this._occluders[i]._onDisable();
   }

   /**
    * @en Remove all occluders.
    * @zh 移除所有遮光器。
    */
   _removeAllOccluders() {
      if (!this._manager) return;
      for (let i = this._occluders.length - 1; i > -1; i--)
         this.removeOccluder(this._occluders[i]);
   }

   /**
    * @en Add an occluder.
    * @param poly The occlusion polygon points.
    * @param layerMask The occlusion layer mask.
    * @returns Returns the occluder instance.
    * @zh 添加一个遮光器。
    * @param poly 遮光多边形顶点数组。
    * @param layerMask 遮光层掩码。
    * @returns 返回遮光器实例。
    */
   addOccluder(poly: PolygonPoint2D, layerMask: number) {
      //TODO 改成逐chunk的
      let occluder = new TileMapOccluder();
      occluder.owner = this._layer.owner;
      occluder.manager = this._manager;
      occluder.polygonPoint = poly;
      occluder.layerMask = layerMask;
      occluder._onEnable();
      this._occluders.push(occluder);
      return occluder;
   }

   /**
    * @en Remove the specified occluder.
    * @param occluder The occluder instance to remove.
    * @returns Returns whether the removal was successful.
    * @zh 移除指定的遮光器。
    * @param occluder 要移除的遮光器实例。
    * @returns 是否成功移除。
    */
   removeOccluder(occluder: TileMapOccluder): boolean {
      if (!occluder) return false;
      let index = this._occluders.indexOf(occluder);
      this._occluders.splice(index, 1);
      occluder.destroy();
      return true;
   }


   /**
    * @en Destroy all occluders.
    * @zh 清理所有遮光器。
    */
   destroy(): void {
      this._removeAllOccluders();
   }

}
