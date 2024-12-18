import { Light2DManager } from "../Light2D/Light2DManager";
import { Occluder2DAgent } from "../Light2D/Occluder2DAgent";
import { DirtyFlagType, TileMapDirtyFlag } from "./TileMapEnum";
import { TileMapLayer } from "./TileMapLayer";

/**
 * TileMap的遮光器管理器
 * 负责管理和维护TileMap层级的遮光器,提供统一的添加和移除接口
 */
export class TileMapOccluder {
   /** 当前绑定的TileMap层 */
   private _layer: TileMapLayer;
   /** 遮光器代理对象 */
   private _agent: Occluder2DAgent;
   /** 记录已使用的遮光器ID */
   private _usedIds: number[] = [];
   /** 下一个可用ID */
   private _nextId: number = 1;
   /** 遮光功能是否启用 */
   enable: boolean = false;


   /**
     * 创建TileMap遮光器管理器
     * @param layer 关联的TileMap层级
     */
   constructor(layer: TileMapLayer) {
      this._layer = layer;
      let manager = layer.owner.scene._light2DManager as Light2DManager;
      this._agent = manager ? manager.occluderAgent as Occluder2DAgent : null;
   }


   updateState(bool:boolean){
      let result = bool && !!this._agent;
      if (result) this._activeAllOccluders();
      else this._removeAllOccluders();
      this.enable = result;
   }
   
   _activeAllOccluders(){
      let chunks = this._layer.chunkDatas;
      for (const cdkey in chunks) {
         let chunkdatas = chunks[cdkey];
         for (const key in chunkdatas) {
            let data = chunkdatas[key];
            let cellDataRefMap = data.cellDataRefMap;
            cellDataRefMap.forEach((value,gid)=>{
               data._setDirtyFlag( gid ,TileMapDirtyFlag.CELL_LIGHTSHADOW , DirtyFlagType.OCCLUSION);                  
            })
         }
      }
   }

   _removeAllOccluders(){
      this._agent.clearOccluder();
      this._usedIds.length = 0;
      this._nextId = 1;
   }
   /**
     * 添加一个遮光器
     * @param poly 遮光多边形顶点数组
     * @param layerMask 遮光层掩码
     * @returns 返回遮光器ID,失败返回-1
     */
   addOccluder(poly: number[], layerMask: number): number {
      if (!this.enable || !poly || poly.length < 6) return -1;

      const id = this._getNextId();
      this._agent.addOccluder(id, {
         layerMask,
         poly
      });
      return id;

   }

   /**
     * 移除指定ID的遮光器
     * @param id 遮光器ID
     * @returns 是否成功移除
     */
   removeOccluder(id: number): boolean {
      if (!this.enable || id < 0) return false;

      const result = this._agent.removeOccluder(id);
      if (result) {
         this._usedIds.push(id);
      }
      return result;

   }

   /**
     * 获取下一个可用的遮光器ID
     */
   private _getNextId(): number {
      if (this._usedIds.length) return this._usedIds.pop();
      return this._nextId++;
   }

   /**
     * 清理所有遮光器
     */
   destroy(): void {
      if (!this.enable) return;
      this._removeAllOccluders();
      this._agent = null;
   }

}
