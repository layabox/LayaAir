import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { TileShape, TileMapTerrainMode, TileMapCellNeighbor } from "../TileMapEnum";
import { TileMapLayer } from "../TileMapLayer";
import { TileMapTerrainRule, TileMapTerrainUtil } from "./TileMapTerrainUtils";

type TTerrainVector2 = {
   x: number;
   y: number;
   chunkX?: number;
   chunkY?: number;
   index?: number;
}

class Vector2Set {
   list: TTerrainVector2[] = [];

   add(x: number, y: number ) {
      let data = { x, y , index: -1 };
      this.list.push(data);
      return data;
   }

   remove(x: number, y: number): void {
      let len = this.list.length;
      for (let i = 0; i < len; i++) {
         let item = this.list[i];
         if (item.x == x && item.y == y) {
            this.list.splice(i, 1);
            return;
         }
      }
   }

   get(x: number, y: number) {
      let len = this.list.length;
      for (let i = 0; i < len; i++) {
         let item = this.list[i];
         if (item.x == x && item.y == y) {
            return item;
         }
      }
      return null;
   }
}

export class TileMapTerrain {
   
   static fill(tileMapLayer: TileMapLayer, list:{ x:number , y : number }[], terrainSetId: number, terrainId: number): void {
      let tileset = tileMapLayer.tileSet;
      let terrainLayer = tileset.getTerrainSet(terrainSetId);
      if (!terrainLayer) return;

      let terrains = terrainLayer.terrains;
      let terrain = terrains[terrainId];
      if (!terrain) return;

      let neighborObject = TileMapTerrainUtil.getNeighbors(tileset.tileShape);
      let links = neighborObject.links;
      let chunk = tileMapLayer._chunk;
      let chunkDatas = tileMapLayer.chunkDatas;

      let temp_vec2 = TileMapTerrainUtil.temp_vec2;
      let temp_vec3 = TileMapTerrainUtil.temp_vec3;

      let result = new Vector2Set();
      let allSet = new Vector2Set();
      let realSet = new Vector2Set();
      let shadowList = [];

      let linksLen = links.length;

      let listLength = list.length;
      for (let i = 0; i < listLength; i++) {
         let x = list[i].x , y = list[i].y;

         if (!allSet.get(x, y)) {
            shadowList.push({ x, y });
            allSet.add(x, y);
         }
         realSet.add(x, y);//实际需要绘制的

         //包含边角
         for (let k = 0; k < linksLen; k++) {
            let neighbor = links[k];
            neighborObject.getNeighborGird(x, y, neighbor, temp_vec2);
            let nx = temp_vec2.x, ny = temp_vec2.y;
            if (!allSet.get(nx, ny)) {
               shadowList.push({ x: nx, y: ny });
               allSet.add(nx, ny);
            }
         }    
      }
      
      let checkSet = new Vector2Set();
      let asLength = allSet.list.length;
      for (let i = 0; i < asLength; i++) {
         let item = allSet.list[i];
         let x = item.x, y = item.y;
         let real = realSet.get(x, y);
         if (real) {
            checkSet.add(x, y);
         }
         else {
            if (item.index == -1) {
               chunk._getChunkPosByCell(item.x, item.y, temp_vec3);
               item.chunkX = temp_vec3.x;
               item.chunkY = temp_vec3.y;
               item.index = temp_vec3.z;
            }

            let datas = chunkDatas[item.chunkY];
            if (datas) {
               let data = datas[item.chunkX];
               if (data) {
                  let chunkCellInfo = data.getCell(item.index);
                  if (chunkCellInfo) {
                     let celldata = chunkCellInfo.cell;
                     if (celldata.terrainSet == terrainSetId && celldata.terrain == terrainId) {
                        checkSet.add(x, y);
                     }
                  }
               }
            }
         }
      }

      for (let i = 0; i < listLength; i++) {
         let x = list[i].x, y = list[i].y;
         let rulebase = new TileMapTerrainRule(x , y, terrainId , neighborObject);
         for (let k = 0; k < linksLen; k++) {
            let neighbor = links[k];
            let ruleNeighbor = rulebase.clone();
            ruleNeighbor.setCellNeighbor(neighbor);
         }
      }

   }
}
