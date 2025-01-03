import { Light2DManager } from "../../../Light2D/Light2DManager";
import { PolygonPoint2D } from "../../../Light2D/PolygonPoint2D";
import { TileMapOccluder } from "./light/TileMapOccluder";
import { TileMapLayer } from "./TileMapLayer";

/**
 * TileMap的遮光器管理器
 * 负责管理和维护TileMap层级的遮光器,提供统一的添加和移除接口
 */
export class TileMapOccluderAgent {
   /** 当前绑定的TileMap层 */
   private _layer: TileMapLayer;
   
   private _manager: Light2DManager;
 
   /** 遮光功能是否启用 */
   enable: boolean = false;

   private _occluders:TileMapOccluder[] = [];

   /**
     * 创建TileMap遮光器管理器
     * @param layer 关联的TileMap层级
     */
   constructor(layer: TileMapLayer) {
      this._layer = layer;
   }

   _updateManager() {
      let manager = this._layer.owner.scene._light2DManager as Light2DManager;
      this._manager = manager;
   }

   /**
    * 更新状态
    * @param bool 设置状态
    * @returns 
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
      for (let i = 0 , len = this._occluders.length ; i < len; i++){
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
      for (let i = 0 , len = this._occluders.length ; i < len; i++)
         this._occluders[i]._onDisable();       
   }

   _removeAllOccluders() {
      if (!this._manager) return;
      for (let i = this._occluders.length - 1; i > -1; i--)
         this.removeOccluder(this._occluders[i]);
   }

   /**
     * 添加一个遮光器
     * @param poly 遮光多边形顶点数组
     * @param layerMask 遮光层掩码
     * @returns 返回遮光器ID,失败返回-1
     */
   addOccluder(poly: PolygonPoint2D, layerMask: number) {
      //TODO 改成逐chunk的
      let occluder = new TileMapOccluder();
      occluder.owner = this._layer.owner;
      occluder.manager = this._manager;
      occluder.polygonPoint = poly;
      occluder.layerMask = layerMask;
      occluder._onEnable();
      return occluder
   }

   /**
     * 移除指定ID的遮光器
     * @param id 遮光器ID
     * @returns 是否成功移除
     */
   removeOccluder( occluder: TileMapOccluder): boolean {
      if (!occluder ) return false;
      let index = this._occluders.indexOf(occluder);
      this._occluders.splice(index, 1);
      occluder.destroy();
      return true;
   }

 
   /**
     * 清理所有遮光器
     */
   destroy(): void {
      this._removeAllOccluders();
   }

}
