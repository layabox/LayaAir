import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { TileMapCellNeighbor, TileMapTerrainMode, TileShape } from "../TileMapEnum";

type Vector2Like = { x: number, y: number };

type NeighborObject = {
   getNeighborGird: (x: number, y: number, neighbor: TileMapCellNeighbor, out: Vector2Like) => void;
   getRuleInfo: (rule: TileMapTerrainRule, neighbor: TileMapCellNeighbor) => void;
   neighbors: Map<TileMapTerrainMode, TileMapCellNeighbor[]>;
   links:TileMapCellNeighbor[];
}

export var shape_mode_map: Map<TileShape, NeighborObject> = new Map;


function initSquare() {

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
   
   shape_mode_map.set(TileShape.TILE_SHAPE_SQUARE, {
      neighbors,
      getNeighborGird: TileMapTerrainUtil.getNeighborGird_Square,
      getRuleInfo: TileMapTerrainUtil.getRuleInfo_Square,
      links
   });
}

function initIsometric() {//菱形

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
   shape_mode_map.set(TileShape.TILE_SHAPE_ISOMETRIC, {
      neighbors,
      getNeighborGird: TileMapTerrainUtil.getNeighborGird_Isometric,
      getRuleInfo: TileMapTerrainUtil.getRuleInfo_Isometric,
      links
   });
}

function initHalfOffset() {//错位矩形与六边形

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

   shape_mode_map.set(TileShape.TILE_SHAPE_HALF_OFFSET_SQUARE, {
      neighbors,
      getNeighborGird: TileMapTerrainUtil.getNeighborGird_HalfOffset,
      getRuleInfo: TileMapTerrainUtil.getRuleInfo_HalfOffset,
      links
   });

   shape_mode_map.set(TileShape.TILE_SHAPE_HEXAGON, {
      getNeighborGird: TileMapTerrainUtil.getNeighborGird_HalfOffset,
      getRuleInfo: TileMapTerrainUtil.getRuleInfo_HalfOffset,
      neighbors,
      links
   });
}
export class TileMapTerrainUtil{

   static temp_vec2 = new Vector2();
   static temp_vec3 = new Vector3();
   
   static getNeighbors(shape: TileShape): NeighborObject {
      return shape_mode_map.get(shape);
   }

   static getNeighborGird_Isometric(x: number, y: number, neighbor: TileMapCellNeighbor, out: Vector2Like): void {
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

   static getNeighborGird_Square(x: number, y: number, neighbor: TileMapCellNeighbor, out: Vector2Like ): void {
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

   static getNeighborGird_HalfOffset(x: number, y: number, neighbor: TileMapCellNeighbor, out: Vector2Like): void {
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
         rule.neighborObject.getNeighborGird(rule.x, rule.y, neighbor, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_RIGHT_CORNER) {
         rule.data = 2;
         rule.neighborObject.getNeighborGird(rule.x, rule.y, TileMapCellNeighbor.TOP_SIDE, rule);
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
         rule.neighborObject.getNeighborGird(rule.x, rule.y, TileMapCellNeighbor.LEFT_SIDE, rule);
      }
      else if (neighbor == TileMapCellNeighbor.LEFT_SIDE) {
         rule.data = 1;
         rule.neighborObject.getNeighborGird(rule.x, rule.y, neighbor, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_LEFT_CORNER) {
         rule.data = 2;
         rule.neighborObject.getNeighborGird(rule.x, rule.y, TileMapCellNeighbor.TOP_LEFT_CORNER, rule);
      }
   }

   static getRuleInfo_Isometric(rule:TileMapTerrainRule , neighbor:TileMapCellNeighbor){
      // 上角 检查上角
      // 右上边 右角 检查右上边
      // 右下边 下角 下左边 检查自己
      // 左角 左上边 检查右上边
      if (neighbor == TileMapCellNeighbor.TOP_CORNER) {
         rule.data = 2;
         rule.neighborObject.getNeighborGird(rule.x, rule.y, neighbor, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_RIGHT_SIDE) {
         rule.data = 3;
         rule.neighborObject.getNeighborGird(rule.x, rule.y, neighbor, rule);
      }
      else if (neighbor == TileMapCellNeighbor.RIGHT_CORNER) {
         rule.data = 2;
         rule.neighborObject.getNeighborGird(rule.x, rule.y, TileMapCellNeighbor.TOP_RIGHT_SIDE, rule);
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
         rule.neighborObject.getNeighborGird(rule.x, rule.y, TileMapCellNeighbor.TOP_LEFT_SIDE, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_LEFT_SIDE) {
         rule.data = 1;
         rule.neighborObject.getNeighborGird(rule.x, rule.y, neighbor, rule);
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
         rule.neighborObject.getNeighborGird(rule.x, rule.y, TileMapCellNeighbor.LEFT_SIDE, rule);
      }
      else if (neighbor == TileMapCellNeighbor.LEFT_SIDE) {
         rule.data = 1;
         rule.neighborObject.getNeighborGird(rule.x, rule.y, neighbor, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_LEFT_CORNER) {
         rule.data = 4;
         rule.neighborObject.getNeighborGird(rule.x, rule.y, TileMapCellNeighbor.TOP_LEFT_SIDE, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_LEFT_SIDE) {
         rule.data = 3;
         rule.neighborObject.getNeighborGird(rule.x, rule.y, neighbor, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_CORNER) {
         rule.data = 2;
         rule.neighborObject.getNeighborGird(rule.x, rule.y, TileMapCellNeighbor.TOP_LEFT_SIDE, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_RIGHT_SIDE) {
         rule.data = 5;
         rule.neighborObject.getNeighborGird(rule.x, rule.y, neighbor, rule);
      }
      else if (neighbor == TileMapCellNeighbor.TOP_RIGHT_CORNER) {
         rule.data = 4;
         rule.neighborObject.getNeighborGird(rule.x, rule.y, TileMapCellNeighbor.TOP_RIGHT_SIDE, rule);
      }
   }
}

export class TileMapTerrainRule{
   data:number = 0;
   x:number = 0;
   y:number = 0;
   terrain:number = 0;
   neighborObject:NeighborObject;

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
      return rule;
   }
}

export class Vector2LikeSet<T extends Vector2Like> {
   list: T[] = [];

   add( one:T ) {
      this.list.push(one);
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

(function () {
   initSquare();
   initIsometric();
   initHalfOffset();
})();