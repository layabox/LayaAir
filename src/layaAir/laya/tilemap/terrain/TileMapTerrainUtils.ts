import { IV2, Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { TileMapChunk } from "../TileMapChunk";
import { TileMapCellNeighbor, TileMapTerrainMode, TileShape } from "../TileMapEnum";
import { TileMapLayer } from "../TileMapLayer";
import { TileSet } from "../TileSet";
import { TileSetCellData } from "../TileSetCellData";

export type TTerrainVector2 = {
   x: number;
   y: number;
   chunkX?: number;
   chunkY?: number;
   index?: number;
}

export type NeighborObject = {
   getNeighborGird: (x: number, y: number, neighbor: TileMapCellNeighbor, out: IV2) => void;
   getRuleInfo: (rule: TileMapTerrainRule, neighbor: TileMapCellNeighbor) => void;
   getOverlap:(x :number , y:number , data:number , vec2Map:TerrainVector2Set , outs:TTerrainVector2[]) => void;
   neighbors: Map<TileMapTerrainMode, TileMapCellNeighbor[]>;
   links:TileMapCellNeighbor[];
}

export class TileMapTerrainUtil{
   static shape_mode_map: Map<TileShape, NeighborObject> = new Map;
   /** @internal */
   private static initSquare() {

      //   __|_____|__
      //     |     |
      //   __|_____|__
      //     |     |
   
      let neighbors: Map<TileMapTerrainMode, TileMapCellNeighbor[]> = new Map;
      let arr: TileMapCellNeighbor[] = [
         TileMapCellNeighbor.TOP_SIDE,
         TileMapCellNeighbor.TOP_RIGHT_CORNER,
         TileMapCellNeighbor.RIGHT_SIDE,
         TileMapCellNeighbor.BOTTOM_RIGHT_CORNER,
         TileMapCellNeighbor.BOTTOM_SIDE,
         TileMapCellNeighbor.BOTTOM_LEFT_CORNER,
         TileMapCellNeighbor.LEFT_SIDE,
         TileMapCellNeighbor.TOP_LEFT_CORNER,
      ];
      
      let links = arr;
   
      neighbors.set(TileMapTerrainMode.MATCH_CORNERS_AND_SIDES, arr);
   
      arr = [
         TileMapCellNeighbor.TOP_SIDE,
         TileMapCellNeighbor.RIGHT_SIDE,
         TileMapCellNeighbor.BOTTOM_SIDE,
         TileMapCellNeighbor.LEFT_SIDE,
      ];
      neighbors.set(TileMapTerrainMode.MATCH_SIDES, arr);
      
      arr = [
         TileMapCellNeighbor.TOP_RIGHT_CORNER,
         TileMapCellNeighbor.BOTTOM_RIGHT_CORNER,
         TileMapCellNeighbor.BOTTOM_LEFT_CORNER,
         TileMapCellNeighbor.TOP_LEFT_CORNER,
      ];
      neighbors.set(TileMapTerrainMode.MATCH_CORNERS, arr);
      
      this.shape_mode_map.set(TileShape.TILE_SHAPE_SQUARE, {
         neighbors,
         getOverlap: TileMapTerrainUtil.getOverlap_Square,
         getNeighborGird: TileMapTerrainUtil.getNeighborGird_Square,
         getRuleInfo: TileMapTerrainUtil.getRuleInfo_Square,
         links
      });
   }
   /** @internal */
   private static initIsometric() {//菱形
   
      //    \/
      //    /\
      //  \/  \/
      //  /\  /\   
      //    \/
      //    /\
   
      let neighbors: Map<TileMapTerrainMode, TileMapCellNeighbor[]> = new Map;
      let arr: TileMapCellNeighbor[] = [
         TileMapCellNeighbor.TOP_CORNER,
         TileMapCellNeighbor.TOP_RIGHT_SIDE,
         TileMapCellNeighbor.RIGHT_CORNER,
         TileMapCellNeighbor.BOTTOM_RIGHT_SIDE,
         TileMapCellNeighbor.BOTTOM_CORNER,
         TileMapCellNeighbor.BOTTOM_LEFT_SIDE,
         TileMapCellNeighbor.LEFT_CORNER,
         TileMapCellNeighbor.TOP_LEFT_SIDE,
      ];
   
      let links = arr;
   
      neighbors.set(TileMapTerrainMode.MATCH_CORNERS_AND_SIDES, arr);
   
      arr = [
         TileMapCellNeighbor.TOP_RIGHT_SIDE,
         TileMapCellNeighbor.BOTTOM_RIGHT_SIDE,
         TileMapCellNeighbor.BOTTOM_LEFT_SIDE,
         TileMapCellNeighbor.TOP_LEFT_SIDE,
      ];
      neighbors.set(TileMapTerrainMode.MATCH_SIDES, arr);
   
      arr = [
         TileMapCellNeighbor.TOP_CORNER,
         TileMapCellNeighbor.RIGHT_CORNER,
         TileMapCellNeighbor.BOTTOM_CORNER,
         TileMapCellNeighbor.LEFT_CORNER,
      ];
      neighbors.set(TileMapTerrainMode.MATCH_CORNERS, arr);
      this.shape_mode_map.set(TileShape.TILE_SHAPE_ISOMETRIC, {
         neighbors,
         getNeighborGird: TileMapTerrainUtil.getNeighborGird_Isometric,
         getRuleInfo: TileMapTerrainUtil.getRuleInfo_Isometric,
         getOverlap:TileMapTerrainUtil.getOverlap_Isometric,
         links
      });
   }
   /** @internal */
   private static initHalfOffset() {//错位矩形与六边形
   
      //       |
      // --------------
      //    |     |
      //    |     |
      // --------------
      //       |
   
      //       |    
      //      / \
      //   \ /   \ / 
      //    |     |
      //    |     |
      //   / \   / \
      //      \ /
      //       |
   
      let neighbors: Map<TileMapTerrainMode, TileMapCellNeighbor[]> = new Map;
      let arr: TileMapCellNeighbor[] = [
         TileMapCellNeighbor.TOP_CORNER,
         TileMapCellNeighbor.TOP_RIGHT_SIDE,
         TileMapCellNeighbor.TOP_RIGHT_CORNER,
         TileMapCellNeighbor.RIGHT_SIDE,
         TileMapCellNeighbor.BOTTOM_RIGHT_CORNER,
         TileMapCellNeighbor.BOTTOM_RIGHT_SIDE,
         TileMapCellNeighbor.BOTTOM_CORNER,
         TileMapCellNeighbor.BOTTOM_LEFT_SIDE,
         TileMapCellNeighbor.BOTTOM_LEFT_CORNER,
         TileMapCellNeighbor.LEFT_SIDE,
         TileMapCellNeighbor.TOP_LEFT_CORNER,
         TileMapCellNeighbor.TOP_LEFT_SIDE,
      ];
   
      neighbors.set(TileMapTerrainMode.MATCH_CORNERS_AND_SIDES, arr);
   
      arr = [
         TileMapCellNeighbor.TOP_RIGHT_SIDE,
         TileMapCellNeighbor.RIGHT_SIDE,
         TileMapCellNeighbor.BOTTOM_RIGHT_SIDE,
         TileMapCellNeighbor.BOTTOM_LEFT_SIDE,
         TileMapCellNeighbor.LEFT_SIDE,
         TileMapCellNeighbor.TOP_LEFT_SIDE,
      ];
      neighbors.set(TileMapTerrainMode.MATCH_SIDES, arr);
      let links = arr;
   
      arr = [
         TileMapCellNeighbor.TOP_CORNER,
         TileMapCellNeighbor.TOP_RIGHT_CORNER,
         TileMapCellNeighbor.BOTTOM_RIGHT_CORNER,
         TileMapCellNeighbor.BOTTOM_CORNER,
         TileMapCellNeighbor.BOTTOM_LEFT_CORNER,
         TileMapCellNeighbor.TOP_LEFT_CORNER,
      ];
      neighbors.set(TileMapTerrainMode.MATCH_CORNERS, arr);
   
      this.shape_mode_map.set(TileShape.TILE_SHAPE_HALF_OFFSET_SQUARE, {
         neighbors,
         getNeighborGird: TileMapTerrainUtil.getNeighborGird_HalfOffset,
         getRuleInfo: TileMapTerrainUtil.getRuleInfo_HalfOffset,
         getOverlap:TileMapTerrainUtil.getOverlap_HalfOffset,
         links
      });
   
      this.shape_mode_map.set(TileShape.TILE_SHAPE_HEXAGON, {
         getNeighborGird: TileMapTerrainUtil.getNeighborGird_HalfOffset,
         getRuleInfo: TileMapTerrainUtil.getRuleInfo_HalfOffset,
         getOverlap:TileMapTerrainUtil.getOverlap_HalfOffset,
         neighbors,
         links
      });
   }
   /** @internal */
   static __init__() {
      this.initSquare();
      this.initIsometric();
      this.initHalfOffset();
   }

   static temp_vec2 = new Vector2();
   static temp_vec3 = new Vector3();
   
   static getNeighborObject(shape: TileShape): NeighborObject {
      return TileMapTerrainUtil.shape_mode_map.get(shape);
   }

   static getNeighborGird_Isometric(x: number, y: number, neighbor: TileMapCellNeighbor, out: IV2): void {
      let isOffset = !!(y & 1);
      if (neighbor == TileMapCellNeighbor.TOP_CORNER) {
         out.x = x;
         out.y = y - 2;
      }
      else if (neighbor == TileMapCellNeighbor.TOP_RIGHT_SIDE) {
         out.x = x + (isOffset ? 1 : 0);
         out.y = y - 1;
      }
      else if (neighbor == TileMapCellNeighbor.RIGHT_CORNER) {
         out.x = x + 1;
         out.y = y;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_RIGHT_SIDE) {
         out.x = x + (isOffset ? 1 : 0);
         out.y = y + 1;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_CORNER) {
         out.x = x;
         out.y = y + 2;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_LEFT_SIDE) {
         out.x = x - (isOffset ? 0 : 1);
         out.y = y + 1;
      }
      else if (neighbor == TileMapCellNeighbor.LEFT_CORNER) {
         out.x = x - 1;
         out.y = y;
      }
      else if (neighbor == TileMapCellNeighbor.TOP_LEFT_SIDE) {
         out.x = x - (isOffset ? 0 : 1);
         out.y = y - 1;
      }
   }

   static getNeighborGird_Square(x: number, y: number, neighbor: TileMapCellNeighbor, out: IV2 ): void {
      if (neighbor == TileMapCellNeighbor.TOP_SIDE) {
         out.x = x;
         out.y = y - 1;
      }
      else if (neighbor == TileMapCellNeighbor.TOP_RIGHT_CORNER) {
         out.x = x + 1;
         out.y = y - 1;
      }
      else if (neighbor == TileMapCellNeighbor.RIGHT_SIDE) {
         out.x = x + 1;
         out.y = y;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_RIGHT_CORNER) {
         out.x = x + 1;
         out.y = y + 1;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_SIDE) {
         out.x = x;
         out.y = y + 1;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_LEFT_CORNER) {
         out.x = x - 1;
         out.y = y + 1;
      }
      else if (neighbor == TileMapCellNeighbor.LEFT_SIDE) {
         out.x = x - 1;
         out.y = y;
      }
      else if (neighbor == TileMapCellNeighbor.TOP_LEFT_CORNER) {
         out.x = x - 1;
         out.y = y - 1;
      }
   }

   static getNeighborGird_HalfOffset(x: number, y: number, neighbor: TileMapCellNeighbor, out: IV2): void {
      let isOffset = !!(y & 1);

      if (neighbor == TileMapCellNeighbor.RIGHT_SIDE) {
         out.x = x + 1;
         out.y = y;
      }
      else if (neighbor == TileMapCellNeighbor.LEFT_SIDE) {
         out.x = x - 1;
         out.y = y;
      }
      else if (neighbor == TileMapCellNeighbor.TOP_RIGHT_SIDE) {
         out.x = x + (isOffset ? 1 : 0);
         out.y = y - 1;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_RIGHT_SIDE) {
         out.x = x + (isOffset ? 1 : 0);
         out.y = y + 1;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_LEFT_SIDE) {
         out.x = x - (isOffset ? 0 : 1);
         out.y = y + 1;
      }
      else if (neighbor == TileMapCellNeighbor.TOP_LEFT_SIDE) {
         out.x = x - (isOffset ? 0 : 1);
         out.y = y - 1;
      }
   }

   static getRuleInfo_Square( rule:TileMapTerrainRule , neighbor:TileMapCellNeighbor){
      // 上边 右上角 检查上边
      // 右边 右下角 底边 检查自己
      // 左边 左下角 检查左边
      // 左上角 检查左上角
      if (neighbor == TileMapCellNeighbor.TOP_SIDE) {
         rule.data = 3;
         TileMapTerrainUtil.getNeighborGird_Square(rule.x, rule.y, neighbor, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_RIGHT_CORNER) {
         rule.data = 2;
         TileMapTerrainUtil.getNeighborGird_Square(rule.x, rule.y, TileMapCellNeighbor.TOP_SIDE, rule);
      }
      else if (neighbor == TileMapCellNeighbor.RIGHT_SIDE) {
         rule.data = 1;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_RIGHT_CORNER) {
         rule.data = 2;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_SIDE) {
         rule.data = 3;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_LEFT_CORNER) {
         rule.data = 2;
         TileMapTerrainUtil.getNeighborGird_Square(rule.x, rule.y, TileMapCellNeighbor.LEFT_SIDE, rule);
      }
      else if (neighbor == TileMapCellNeighbor.LEFT_SIDE) {
         rule.data = 1;
         TileMapTerrainUtil.getNeighborGird_Square(rule.x, rule.y, neighbor, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_LEFT_CORNER) {
         rule.data = 2;
         TileMapTerrainUtil.getNeighborGird_Square(rule.x, rule.y, TileMapCellNeighbor.TOP_LEFT_CORNER, rule);
      }
   }

   static getRuleInfo_Isometric(rule:TileMapTerrainRule , neighbor:TileMapCellNeighbor){
      // 上角 检查上角
      // 右上边 右角 检查右上边
      // 右下边 下角 下左边 检查自己
      // 左角 左上边 检查右上边
      if (neighbor == TileMapCellNeighbor.TOP_CORNER) {
         rule.data = 2;
         TileMapTerrainUtil.getNeighborGird_Isometric(rule.x, rule.y, neighbor, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_RIGHT_SIDE) {
         rule.data = 3;
         TileMapTerrainUtil.getNeighborGird_Isometric(rule.x, rule.y, neighbor, rule);
      }
      else if (neighbor == TileMapCellNeighbor.RIGHT_CORNER) {
         rule.data = 2;
         TileMapTerrainUtil.getNeighborGird_Isometric(rule.x, rule.y, TileMapCellNeighbor.TOP_RIGHT_SIDE, rule);
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_RIGHT_SIDE) {
         rule.data = 1;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_CORNER) {
         rule.data = 2;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_LEFT_SIDE) {
         rule.data = 3;
      }
      else if (neighbor == TileMapCellNeighbor.LEFT_CORNER) {
         rule.data = 2;
         TileMapTerrainUtil.getNeighborGird_Isometric(rule.x, rule.y, TileMapCellNeighbor.TOP_LEFT_SIDE, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_LEFT_SIDE) {
         rule.data = 1;
         TileMapTerrainUtil.getNeighborGird_Isometric(rule.x, rule.y, neighbor, rule);
      }
   }

   static getRuleInfo_HalfOffset(rule:TileMapTerrainRule , neighbor:TileMapCellNeighbor){
      if (neighbor == TileMapCellNeighbor.RIGHT_SIDE) {
         rule.data = 1;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_RIGHT_CORNER) {
         rule.data = 2;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_RIGHT_SIDE) {
         rule.data = 3;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_CORNER) {
         rule.data = 4;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_LEFT_SIDE) {
         rule.data = 5;
      }
      else if (neighbor == TileMapCellNeighbor.BOTTOM_LEFT_CORNER) {
         rule.data = 2;
         TileMapTerrainUtil.getNeighborGird_HalfOffset(rule.x, rule.y, TileMapCellNeighbor.LEFT_SIDE, rule);
      }
      else if (neighbor == TileMapCellNeighbor.LEFT_SIDE) {
         rule.data = 1;
         TileMapTerrainUtil.getNeighborGird_HalfOffset(rule.x, rule.y, neighbor, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_LEFT_CORNER) {
         rule.data = 4;
         TileMapTerrainUtil.getNeighborGird_HalfOffset(rule.x, rule.y, TileMapCellNeighbor.TOP_LEFT_SIDE, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_LEFT_SIDE) {
         rule.data = 3;
         TileMapTerrainUtil.getNeighborGird_HalfOffset(rule.x, rule.y, neighbor, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_CORNER) {
         rule.data = 2;
         TileMapTerrainUtil.getNeighborGird_HalfOffset(rule.x, rule.y, TileMapCellNeighbor.TOP_LEFT_SIDE, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_RIGHT_SIDE) {
         rule.data = 5;
         TileMapTerrainUtil.getNeighborGird_HalfOffset(rule.x, rule.y, neighbor, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_RIGHT_CORNER) {
         rule.data = 4;
         TileMapTerrainUtil.getNeighborGird_HalfOffset(rule.x, rule.y, TileMapCellNeighbor.TOP_RIGHT_SIDE, rule);
      }
   }

   static getOverlap_Square( x : number , y: number, data:number , vec2Map:TerrainVector2Set , outs: TTerrainVector2[]): void {
      let temp_vec2 = TileMapTerrainUtil.temp_vec2;
      if (data == 1) {
         outs[TileMapCellNeighbor.RIGHT_SIDE] = vec2Map.get(x , y , true);

         TileMapTerrainUtil.getNeighborGird_Square(x, y, TileMapCellNeighbor.LEFT_SIDE, temp_vec2);
         outs[TileMapCellNeighbor.LEFT_SIDE] = vec2Map.get(temp_vec2.x, temp_vec2.y , true);
      }else if (data == 2) {
         outs[TileMapCellNeighbor.BOTTOM_RIGHT_CORNER] = vec2Map.get(x , y , true);
         
         TileMapTerrainUtil.getNeighborGird_Square(x, y, TileMapCellNeighbor.RIGHT_SIDE, temp_vec2);
         outs[TileMapCellNeighbor.BOTTOM_LEFT_CORNER] = vec2Map.get(temp_vec2.x , temp_vec2.y , true);

         TileMapTerrainUtil.getNeighborGird_Square(x, y, TileMapCellNeighbor.BOTTOM_RIGHT_CORNER, temp_vec2);
         outs[TileMapCellNeighbor.TOP_LEFT_CORNER] = vec2Map.get(temp_vec2.x , temp_vec2.y , true);
         
         TileMapTerrainUtil.getNeighborGird_Square(x, y, TileMapCellNeighbor.BOTTOM_SIDE, temp_vec2);
         outs[TileMapCellNeighbor.TOP_RIGHT_CORNER] = vec2Map.get(temp_vec2.x , temp_vec2.y , true);

      }else{
         outs[TileMapCellNeighbor.BOTTOM_SIDE] = vec2Map.get(x , y , true);

         TileMapTerrainUtil.getNeighborGird_Square(x , y , TileMapCellNeighbor.BOTTOM_SIDE , temp_vec2);
         outs[TileMapCellNeighbor.TOP_SIDE] = vec2Map.get(temp_vec2.x , temp_vec2.y , true);
      }
   }

   static getOverlap_Isometric(x : number , y: number, data:number ,vec2Map:TerrainVector2Set , outs:TTerrainVector2[]){
      let temp_vec2 = TileMapTerrainUtil.temp_vec2;
      if (data == 1) {
         outs[TileMapCellNeighbor.BOTTOM_RIGHT_SIDE] = vec2Map.get(x , y ,true);

         TileMapTerrainUtil.getNeighborGird_Isometric(x , y , TileMapCellNeighbor.BOTTOM_RIGHT_SIDE , temp_vec2);
         outs[TileMapCellNeighbor.TOP_LEFT_SIDE] = vec2Map.get(temp_vec2.x , temp_vec2.y ,true);
      }
		else if(data == 2){
         outs[TileMapCellNeighbor.BOTTOM_CORNER] = vec2Map.get(x , y ,true);
         
         TileMapTerrainUtil.getNeighborGird_Isometric(x , y , TileMapCellNeighbor.BOTTOM_RIGHT_SIDE , temp_vec2);
         outs[TileMapCellNeighbor.LEFT_CORNER] = vec2Map.get(temp_vec2.x , temp_vec2.y ,true);
         
         TileMapTerrainUtil.getNeighborGird_Isometric(x , y , TileMapCellNeighbor.BOTTOM_CORNER , temp_vec2);
         outs[TileMapCellNeighbor.TOP_CORNER] = vec2Map.get(temp_vec2.x , temp_vec2.y ,true);

         TileMapTerrainUtil.getNeighborGird_Isometric(x , y , TileMapCellNeighbor.BOTTOM_LEFT_SIDE , temp_vec2);
         outs[TileMapCellNeighbor.RIGHT_CORNER] = vec2Map.get(temp_vec2.x , temp_vec2.y ,true);

      }
		else{
         outs[TileMapCellNeighbor.BOTTOM_LEFT_SIDE] = vec2Map.get(x , y ,true);

         TileMapTerrainUtil.getNeighborGird_Isometric(x , y , TileMapCellNeighbor.BOTTOM_LEFT_SIDE , temp_vec2);
         outs[TileMapCellNeighbor.TOP_RIGHT_SIDE] = vec2Map.get(temp_vec2.x , temp_vec2.y ,true);
      }
   }

   static getOverlap_HalfOffset(x : number , y: number, data:number , vec2Map:TerrainVector2Set , outs:TTerrainVector2[]){
      let temp_vec2 = TileMapTerrainUtil.temp_vec2;

      if (data == 1) {
         
         outs[TileMapCellNeighbor.RIGHT_SIDE] = vec2Map.get(x , y ,true);

         TileMapTerrainUtil.getNeighborGird_HalfOffset(x , y , TileMapCellNeighbor.RIGHT_SIDE , temp_vec2);
         outs[TileMapCellNeighbor.LEFT_SIDE] = vec2Map.get(temp_vec2.x , temp_vec2.y ,true); 
      }else if (data == 2) {
         outs[TileMapCellNeighbor.BOTTOM_RIGHT_CORNER] = vec2Map.get(x , y ,true);

         TileMapTerrainUtil.getNeighborGird_HalfOffset(x , y , TileMapCellNeighbor.RIGHT_SIDE , temp_vec2);
         outs[TileMapCellNeighbor.BOTTOM_LEFT_CORNER] = vec2Map.get(temp_vec2.x , temp_vec2.y ,true); 

         TileMapTerrainUtil.getNeighborGird_HalfOffset(x , y , TileMapCellNeighbor.BOTTOM_RIGHT_SIDE , temp_vec2);
         outs[TileMapCellNeighbor.TOP_CORNER] = vec2Map.get(temp_vec2.x , temp_vec2.y ,true); 

      }else if (data == 3) {
         outs[TileMapCellNeighbor.BOTTOM_RIGHT_SIDE] = vec2Map.get(x , y ,true);

         TileMapTerrainUtil.getNeighborGird_HalfOffset(x , y , TileMapCellNeighbor.BOTTOM_RIGHT_SIDE , temp_vec2);
         outs[TileMapCellNeighbor.TOP_LEFT_SIDE] = vec2Map.get(temp_vec2.x , temp_vec2.y ,true); 
      }else if (data == 4) {
         outs[TileMapCellNeighbor.BOTTOM_CORNER] = vec2Map.get(x , y ,true);

         TileMapTerrainUtil.getNeighborGird_HalfOffset(x , y , TileMapCellNeighbor.BOTTOM_RIGHT_SIDE , temp_vec2);
         outs[TileMapCellNeighbor.TOP_LEFT_CORNER] = vec2Map.get(temp_vec2.x , temp_vec2.y ,true); 

         TileMapTerrainUtil.getNeighborGird_HalfOffset(x , y , TileMapCellNeighbor.BOTTOM_LEFT_SIDE , temp_vec2);
         outs[TileMapCellNeighbor.TOP_RIGHT_CORNER] = vec2Map.get(temp_vec2.x , temp_vec2.y ,true); 
         
      }else {
         outs[TileMapCellNeighbor.BOTTOM_LEFT_SIDE] = vec2Map.get(x , y ,true);

         TileMapTerrainUtil.getNeighborGird_HalfOffset(x , y , TileMapCellNeighbor.BOTTOM_LEFT_SIDE , temp_vec2);
         outs[TileMapCellNeighbor.TOP_RIGHT_SIDE] = vec2Map.get(temp_vec2.x , temp_vec2.y ,true); 
      }
   }

   static getChunkCellInfo(layer:TileMapLayer , vec2:TTerrainVector2){
      if (vec2.index == -1) {
         layer._chunk._getChunkPosByCell(vec2.x, vec2.y, TileMapTerrainUtil.temp_vec3);
         vec2.chunkX = TileMapTerrainUtil.temp_vec3.x;
         vec2.chunkY = TileMapTerrainUtil.temp_vec3.y;
         vec2.index = TileMapTerrainUtil.temp_vec3.z;
      }

      let datas = layer.chunkDatas[vec2.chunkY];
      if (datas) {
         let data = datas[vec2.chunkX];
         if (data) {
            return data.getCell(vec2.index);
         }
      }
      return null
   }
}

export class TileMapTerrainRule{
   data:number = 0;
   x:number = 0;
   y:number = 0;
   terrain:number = 0;
   neighborObject:NeighborObject;
   priority = -1;

   constructor(x:number , y:number , terrain:number , neighborObject:NeighborObject){
      this.x = x;
      this.y = y;
      this.terrain = terrain;
      this.neighborObject = neighborObject;
   }

   setCellNeighbor(cellNeighbor:TileMapCellNeighbor){
      this.neighborObject.getRuleInfo(this,cellNeighbor);
   }

   clone():TileMapTerrainRule{
      let rule = new TileMapTerrainRule(this.x,this.y,this.terrain , this.neighborObject);
      rule.data = this.data;
      rule.priority = this.priority;
      return rule;
   }

}

export abstract class Vector2LikeSet<T extends IV2> {
   /** 无序表 */
   map: any;
   /** 快速查找 */
   list:T[] = [];

   abstract add( ele:T ):T;
   abstract get(...argv: (number | boolean | T)[]):T;
   abstract delete(...argv: (number | boolean | T)[]):T;
}

export class TerrainRuleSet extends Vector2LikeSet<TileMapTerrainRule>{
   
   
   /** 无序表 */
   map: TileMapTerrainRule[][][] = [];

   add( ele:TileMapTerrainRule ) {
      let one = this.map[ele.y];
      if (!one) {
         one = this.map[ele.y] = [];
      }
      
      let two = one[ele.x];
      if (!two) {
         two = one[ele.x] = [];
      }

      if (two[ele.data]) {
         return two[ele.data];
      }
      two[ele.data] = ele;
      this.list.push(ele);
      return ele;
   }
   
   get(x: number, y: number , data:number): TileMapTerrainRule {
      return this.map[y] ? (this.map[y][x] ? this.map[y][x][data] : null) :null
   }

   delete(x: number, y: number , data:number): TileMapTerrainRule {
      let result = this.map[y] ? (this.map[y][x] ? this.map[y][x][data] : null) :null;
      if (result) {
         delete this.map[y][x][data];
         this.list.splice(this.list.indexOf(result),1);
      }
      return result
   }
}

export class TerrainVector2Set extends Vector2LikeSet<TTerrainVector2>{
   /** 无序表 */
   map: TTerrainVector2[][] = [];
   /** 快速查找 */
   list:TTerrainVector2[] = [];

   add(ele: TTerrainVector2): TTerrainVector2 {
      let one = this.map[ele.y];
      if (!one) {
         one = this.map[ele.y] = [];
      }
      let two = one[ele.x];
      if (two) {
         return two
      }
      one[ele.x] = ele;      
      this.list.push(ele);
      return ele;
   }

   get(x: number, y: number , create = false): TTerrainVector2 {
      let result = this.map[y] ? this.map[y][x] : null;
      if (!result && create) {
         result = { x, y , index : -1};
         this.add(result);
      }
      return result;
   }

   delete(x:number , y:number): TTerrainVector2 {
      let result = this.map[y] ? this.map[y][x] : null;
      if (result) {
         delete this.map[y][x];
         this.list.splice(this.list.indexOf(result),1);
      }
      return result
   }
}
