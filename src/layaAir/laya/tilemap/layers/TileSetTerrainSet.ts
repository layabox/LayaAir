import { Color } from "../../maths/Color";
import { TileMapTerrainUtil } from "../terrain/TileMapTerrainUtils";
import { TileMapCellNeighbor, TileMapTerrainMode, TileShape } from "../TileMapEnum";

export class TileSetTerrainSet {
   /** 识别用索引 */
   id:number;

   private _terrainBatchMode = TileMapTerrainMode.MATCH_CORNERS_AND_SIDES;

   //Terrain  
   set terrainPatchMode(value) {//需要刷新
      this._terrainBatchMode = value;
   }

   get terrainPatchMode() {
      return this._terrainBatchMode;
   }


   _neighbors:TileMapCellNeighbor[];

   updateShape(shape:TileShape){
      let obj = TileMapTerrainUtil.getNeighborObject(shape);
      this._neighbors = obj.neighbors.get(this._terrainBatchMode);
   }

   private _terrains:TileSetTerrain[];

   getTerrain(id:number){
      for (let i = 0 , len = this._terrains.length; i < len ; i++) {
         if (id == this._terrains[i].id) {
            return this._terrains[i];
         }         
      }
      return null;
   }

   get terrains(){
      return this._terrains;
   }

   set terrains(value){
      this._terrains = value;
   }
}

export class TileSetTerrain{
   name: string;

   color: Color;

   id:number;
}
