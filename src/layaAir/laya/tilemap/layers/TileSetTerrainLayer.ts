import { Color } from "../../maths/Color";
import { TileMapTerrainMode } from "../TileMapEnum";

export class TileSetTerrainLayer {
   /** 识别用索引 */
   id:number;

   private _terrainBatchMode: TileMapTerrainMode;

   //Terrain  
   set terrainPatchMode(value: TileMapTerrainMode) {//需要刷新
      this._terrainBatchMode = value;
   }

   get terrainPatchMode(): TileMapTerrainMode {
      return this._terrainBatchMode;
   }

   private _terrains:TileSetTerrain[];

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
