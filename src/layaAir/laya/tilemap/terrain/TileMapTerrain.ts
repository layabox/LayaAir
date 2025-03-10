import { IV2 } from "../../maths/Vector2";
import { TileMapCellNeighbor } from "../TileMapEnum";
import { TileMapLayer } from "../TileMapLayer";
import { TileSetCellData } from "../TileSetCellData";
import { NeighborObject, TerrainRuleSet, TerrainVector2Set, TileMapTerrainRule, TileMapTerrainUtil, TTerrainVector2 } from "./TileMapTerrainUtils";

export class TileMapTerrain {

   static fillConnect(tileMapLayer: TileMapLayer, list: IV2[], terrainSetId: number, terrainId: number, ignoreEmpty = true) {
      let tileset = tileMapLayer.tileSet;
      let terrainSet = tileset.getTerrainSet(terrainSetId);
      if (!terrainSet) return null;

      let terrain = terrainSet.getTerrain(terrainId);
      if (!terrain) return null;

      let neighborObject = TileMapTerrainUtil.getNeighborObject(tileset.tileShape);
      let links = neighborObject.links;
      let linksLen = links.length;

      let temp_vec2 = TileMapTerrainUtil.temp_vec2;

      //尽可能减少内存开销
      let vec2Map = new TerrainVector2Set();

      let allSet = new TerrainVector2Set();
      //ready to fill
      let r2fSet = new TerrainVector2Set();

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

      let ruleSet = new TerrainRuleSet();
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
               if (checkSet.get(temp_vec2.x, temp_vec2.y)) {
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
      let fillRule = this.getReady2FillRule(tileMapLayer, neighborObject, terrainSetId, neighbors, r2fSet, vec2Map, ignoreEmpty);
      fillRule.list.forEach(rule => {
         ruleSet.add(rule);
      });

      let out = this._fillRules(tileMapLayer, terrainSetId, neighborObject, allSet, ruleSet);
      return out;
   }

   private static getReady2FillRule(
      tileMapLayer: TileMapLayer, neighborObject: NeighborObject, terrainSetId: number, neighbors: TileMapCellNeighbor[],
      r2fSet: TerrainVector2Set, vec2Map: TerrainVector2Set, ignoreEmpty = true
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
         let chunkCellInfo = TileMapTerrainUtil.getChunkCellInfo(tileMapLayer, vec2);
         if (chunkCellInfo) {
            let cellData = chunkCellInfo.cell;
            if (
               cellData.terrainSet == terrainSetId
               && (
                  !ignoreEmpty
                  || cellData.terrain > -1
               )
            ) {
               let rule = new TileMapTerrainRule(vec2.x, vec2.y, cellData.terrain, neighborObject);
               outSet.add(rule);
            }
         }
      });

      // fill

      return outSet;
   }

   /** @internal */
   private static _fillRules(tileMapLayer: TileMapLayer, terrainSetId: number, neighborObject: NeighborObject, allSet: TerrainVector2Set, ruleSet: TerrainRuleSet) {

      let out = new Map<TTerrainVector2, TerrainsParams>();

      allSet.list.forEach(vec2 => {
         let params = this._getBestTerrainParams(tileMapLayer, vec2, terrainSetId ,neighborObject , ruleSet);
         let nRuleSet = this._getRulesByParams(tileMapLayer, params, vec2, terrainSetId, neighborObject);
         for (let i = 0 , len = nRuleSet.list.length; i < len; i++) {
            let nRule = nRuleSet.list[i];
            ruleSet.delete(nRule.x, nRule.y , nRule.terrain);
            nRule.priority = 5;
            ruleSet.add(nRule);
         }

   		out.set(vec2 , params);
      });

      return out;
   }

   /**
    *  @internal
    *  按这个块本身是否匹配，这个块周围是否匹配，不匹配就加分，取分值最小的地块
    */
   private static _getBestTerrainParams(
      tileMapLayer: TileMapLayer, pos: TTerrainVector2, terrainSetId: number, terrainObject: NeighborObject,
      ruleSet: TerrainRuleSet
   ) {
      let terrainSet = tileMapLayer.tileSet.getTerrainSet(terrainSetId);
      if (!terrainSet) return null;

      let chunkCellInfo = TileMapTerrainUtil.getChunkCellInfo(tileMapLayer, pos);
      let currentParams: TerrainsParams;
      if (chunkCellInfo && chunkCellInfo.cell && chunkCellInfo.cell.terrainSet == terrainSetId) {
         currentParams = chunkCellInfo.cell.getTerrainsParams();
      } else {
         currentParams = new TerrainsParams();
         currentParams.terrainSet = terrainSetId;
      }

      let neighbors = terrainSet._neighbors;
      let nLen = neighbors.length;
      let paramsList = tileMapLayer.tileSet._getParamsList(terrainSetId);
      let sorceMap = new Map<TerrainsParams, number>();

      for (let list of paramsList) {
         let plen = list.length;
         for (let index = 0; index < plen; index++) {
            let score = 0;

            let params = list[index];
            let tempRule = new TileMapTerrainRule(pos.x, pos.y, params.terrain, terrainObject);
            let rule = ruleSet.get(pos.x, pos.y, tempRule.data);
            if (rule) {
               if (rule.terrain != params.terrain) {
                  score += rule.data;
               }
            } else if (params.terrain != currentParams.terrain) {
               continue
            }

            let check = false;
            for (let i = 0; i < nLen; i++) {
               let neighbor = neighbors[i];
               let neighborTerrain = params.terrain_peering_bits[neighbor];
               let tempNeighborRule = new TileMapTerrainRule(pos.x, pos.y, neighborTerrain, terrainObject);
               tempNeighborRule.setCellNeighbor(neighbor);
               let rule = ruleSet.get(pos.x, pos.y, tempNeighborRule.data);
               if (rule) {
                  if (rule.terrain != neighborTerrain) {
                     score += rule.data;
                  }
               } else if (neighborTerrain != currentParams.terrain_peering_bits[neighbor]) {
                  check = true;
                  break
               }
            }

            if (check) continue

            sorceMap.set(params, score);
         }
      }

      let minScore = Number.MAX_VALUE;
      let minParams: TerrainsParams;
      sorceMap.forEach((value, key) => {
         if (value < minScore) {
            minScore = value;
            minParams = key;
         }
      });

      return minParams;
   }

   /** @internal */
   private static _getRulesByParams( tileMapLayer: TileMapLayer, params: TerrainsParams, pos: TTerrainVector2, terrainSetId: number , neighborObject: NeighborObject) {
      let outSet = new TerrainRuleSet();
      let baseRule = new TileMapTerrainRule(pos.x, pos.y, params.terrain, neighborObject);
      outSet.add(baseRule);
      let terrainSet = tileMapLayer.tileSet.getTerrainSet(terrainSetId);
      let len = terrainSet._neighbors.length;
      for (let i = 0; i < len; i++) {
         let rule = baseRule.clone();
         rule.terrain = params.terrain_peering_bits[terrainSet._neighbors[i]];
         rule.setCellNeighbor(terrainSet._neighbors[i]);
         outSet.add(rule);         
      }

      return outSet;
   }
}

export class TerrainsParams {
   terrainSet: number;
   terrain: number = -1;
   terrain_peering_bits = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];

   links: Set<TileSetCellData> = new Set;
   
   private _modified = false;
   private _arr:TileSetCellData[];

   link(cellData: TileSetCellData) {
      this.links.add(cellData);
      this._modified = true;
   }

   get arr(){
      if (this._modified) {
         this._arr = Array.from(this.links);
      }
      return this._arr;
   }

   clearLinks() {
      this.links.clear();
   }
}