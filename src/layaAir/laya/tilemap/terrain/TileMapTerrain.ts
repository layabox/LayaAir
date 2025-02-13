import { TileSetTerrainSet } from "../layers/TileSetTerrainSet";
import { ChunkCellInfo } from "../TileMapChunkData";
import { TileMapCellNeighbor } from "../TileMapEnum";
import { TileMapLayer } from "../TileMapLayer";
import { TileSet } from "../TileSet";
import { TileSetCellData } from "../TileSetCellData";
import { NeighborObject, TerrainRuleSet, TerrainVector2Set, TileMapTerrainRule, TileMapTerrainUtil, TTerrainVector2 } from "./TileMapTerrainUtils";

export class TileMapTerrain {

   static fill(tileMapLayer: TileMapLayer, list: { x: number, y: number }[], terrainSetId: number, terrainId: number, ignoreEmpty = true): void {
      let tileset = tileMapLayer.tileSet;
      let terrainSet = tileset.getTerrainSet(terrainSetId);
      if (!terrainSet) return;

      let terrains = terrainSet.terrains;
      let terrain = terrains[terrainId];
      if (!terrain) return;

      let neighborObject = TileMapTerrainUtil.getNeighborObject(tileset.tileShape);
      let links = neighborObject.links;
      let linksLen = links.length;

      let temp_vec2 = TileMapTerrainUtil.temp_vec2;

      //尽可能减少内存开销
      let vec2Map = new TerrainVector2Set();

      let allSet = new TerrainVector2Set();
      //ready to fill
      let r2fSet = new TerrainVector2Set();
      // let shadowList = [];


      let listLength = list.length;
      for (let i = 0; i < listLength; i++) {
         let x = list[i].x, y = list[i].y;
         let iv2 = vec2Map.get(x, y, true);

         if (!allSet.get(x, y)) {
            allSet.add(iv2);
         }
         r2fSet.add(iv2);//实际需要绘制的

         //包含边角
         for (let k = 0; k < linksLen; k++) {
            let neighbor = links[k];
            neighborObject.getNeighborGird(x, y, neighbor, temp_vec2);
            let nx = temp_vec2.x, ny = temp_vec2.y;
            if (!allSet.get(nx, ny)) {
               allSet.add(vec2Map.get(nx, ny, true));
            }
         }
      }

      let checkSet = new TerrainVector2Set();

      allSet.list.forEach(item => {
         let x = item.x, y = item.y;
         let real = r2fSet.get(x, y);
         if (real) {
            checkSet.add(vec2Map.get(x, y, true));
         }
         else {
            let chunkCellInfo = TileMapTerrainUtil.getChunkCellInfo(tileMapLayer, item);
            if (chunkCellInfo) {
               let celldata = chunkCellInfo.cell;
               if (celldata.terrainSet == terrainSetId && celldata.terrain == terrainId) {
                  checkSet.add(vec2Map.get(x, y, true));
               }
            }
         }
      })

      let ruleSet = new TerrainVector2Set();
      let neighbors = terrainSet._neighbors;
      let nlen = neighbors.length;

      for (let i = 0; i < listLength; i++) {
         let x = list[i].x, y = list[i].y;
         let rulebase = new TileMapTerrainRule(x, y, terrainId, neighborObject);
         rulebase.priority = 10;
         ruleSet.add(rulebase);
         
         for (let k = 0; k < nlen; k++) {
            let neighbor = neighbors[k];
            let ruleNeighbor = rulebase.clone();
            ruleNeighbor.setCellNeighbor(neighbor);
            if (neighbor % 2 == 0) {
               neighborObject.getNeighborGird(x, y, neighbor, temp_vec2);
               if (
                  checkSet.get(temp_vec2.x, temp_vec2.y)
                  && ruleSet.get(ruleNeighbor.x, ruleNeighbor.y)
               ) {
                  ruleSet.add(ruleNeighbor);
               }
            } else {
               let outs: TTerrainVector2[] = [];
               neighborObject.getOverlap(ruleNeighbor.x, ruleNeighbor.y, ruleNeighbor.data, vec2Map, outs);
               let need = true;
               for (let j = 0, outLen = outs.length; j < outLen; j++) {
                  let vec2 = outs[j];
                  if (vec2 && !checkSet.get(vec2.x, vec2.y)) {
                     need = false;
                     break;
                  }
               }
               if (need) {
                  ruleSet.add(ruleNeighbor);
               }
            }
         }
      }

      //
      let fillRule = this.getReady2FillRule(tileMapLayer, neighborObject , terrainSetId , neighbors  , r2fSet , vec2Map , ignoreEmpty);
      fillRule.list.forEach(rule =>{
         ruleSet.add(rule);
      });

   }

   private static getReady2FillRule(
      tileMapLayer: TileMapLayer , neighborObject: NeighborObject, terrainSetId: number, neighbors:TileMapCellNeighbor[],
      r2fSet: TerrainVector2Set, vec2Map: TerrainVector2Set , ignoreEmpty = true
   ) {

      let nlen = neighbors.length;
      let vRuleSet = new TerrainRuleSet;
      r2fSet.list.forEach(vec2 => {
         for (let i = 0; i < nlen; i++) {
            let rule = new TileMapTerrainRule(vec2.x, vec2.y, -1, neighborObject);
            rule.setCellNeighbor(neighbors[i])
            vRuleSet.add(rule);
         }
      });

      let outSet = new TerrainRuleSet;

      vRuleSet.list.forEach(rule => {
         let mark: number[] = [];
         let outs: TTerrainVector2[] = [];
         neighborObject.getOverlap(rule.x, rule.y, rule.data, vec2Map, outs);

         let nCell: TileSetCellData;
         for (let j = 0, len = outs.length; j < len; j++) {
            let vec2 = outs[j];
            if (!vec2) continue;
           
            let chunkCellInfo = TileMapTerrainUtil.getChunkCellInfo(tileMapLayer, vec2);
            if (chunkCellInfo) {
               let cellData = chunkCellInfo.cell;
               if (cellData.terrainSet == terrainSetId) {
                  nCell = cellData;
               }
            }

            if (!ignoreEmpty || (nCell && nCell.terrain > -1)) {
               if (!mark[nCell.terrain]) {
                  mark[nCell.terrain] = 0;
               }
               mark[nCell.terrain]++;
            }
         }

         let maxCount = 0;
         let maxCountTerrian = -1;
         for (let i = -1, len = mark.length; i < len; i++) {
            if (mark[i] > maxCount) {
               maxCount = mark[i];
               maxCountTerrian = i;
            }
         }

         if (maxCount > 0) {
            rule.terrain = maxCountTerrian;
            outSet.add(rule);
         }
      });

      r2fSet.list.forEach(vec2 => {
         let chunkCellInfo = TileMapTerrainUtil.getChunkCellInfo(tileMapLayer , vec2);
         if (chunkCellInfo) {
            let cellData = chunkCellInfo.cell;
            if (
               cellData.terrainSet == terrainSetId
               && (
                  !ignoreEmpty
                  || cellData.terrain > -1
               )
            ) {
               let rule = new TileMapTerrainRule(vec2.x , vec2.y , cellData.terrain , neighborObject);
               outSet.add(rule);
            }
         }
      });

      // fill

      return outSet;
   }

   /** @internal */
   private static _parseRule(tileMapLayer:TileMapLayer, terrainSetId:number , neighborObject:NeighborObject , allSet: TerrainVector2Set , ruleSet:TerrainRuleSet){

      allSet.list.forEach(vec2=>{
         let data = this._getBestTerrain(tileMapLayer, vec2 , terrainSetId , ruleSet);
      })
   }

   /** @internal */
   private static _getBestTerrain(
      tileMapLayer:TileMapLayer , pos:TTerrainVector2 ,terrainSetId:number ,
      ruleSet: TerrainRuleSet
   ){
      let mark = 0;
      let terrainSet = tileMapLayer.tileSet.getTerrainSet(terrainSetId);
      if (!terrainSet) {
         return
      }

      let cTerrainId = -1;

      let chunkCellInfo = TileMapTerrainUtil.getChunkCellInfo(tileMapLayer , pos);
      if (chunkCellInfo && chunkCellInfo.cell && chunkCellInfo.cell.terrainSet == terrainSetId) {
         cTerrainId = chunkCellInfo.cell.terrain;
      }

      let neighbors = terrainSet._neighbors;
      let nLen = neighbors.length;
      let terrains = terrainSet.terrains;
      for (const id in terrains) {//这里应该是遍历所有相关地形块
         let terrain = terrains[id];
         let rule = ruleSet.get(pos.x , pos.y , 0);
         if (rule) {
            if (rule.terrain == terrain.id) {
               mark += rule.data;
            }
         }else if (terrain.id != cTerrainId) {
            continue
         }

         for (let i = 0; i < nLen; i++) {
            // let rule = new TileMapTerrainRule(pos.x , pos.y ,  ,neighborObject);
         }

      }


   }
}

export class TerrainsParams{
   terrainSet:number;
   terrain:number;
   terrain_peering_bits = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];

   links:Set<TileSetCellData> = new Set;

   link(cellData:TileSetCellData){
      this.links.add(cellData);
   }

   clearLinks(){
      this.links.clear();
   }
}