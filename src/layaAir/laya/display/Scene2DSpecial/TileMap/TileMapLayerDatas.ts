import { Resource } from "../../../resource/Resource";

/**  
 * TileMap原始数据资源  
 * 用于存储和管理TileMap的序列化数据  
 */
export class TileMapLayerDatas extends Resource {

   chunks:{
      x:number;
      y:number;
      length:number;
      tiles:number[];
   }[];

   constructor(){
      super();
   }

   /**  
    * @internal  
    * @override  
    */
   protected _disposeResource(): void {
      this.chunks = [];
   }
}  