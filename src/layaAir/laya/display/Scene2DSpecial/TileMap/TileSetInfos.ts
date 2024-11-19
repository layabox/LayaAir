import { Color } from "../../../maths/Color";


export class TileSet_PhysicsLayerInfo {
   layer: number;
   mask: number;

   /**
    * @internal
    */
   _setTileSet() {

   }
}


export class TileSet_TerrainSetInfo {
   name: string;
   EditorColor: Color;

   /**
    * @internal
    */
   _setTileSet() {

   }
}

export class TileSet_LightOcclusionInfo {
   lightMask: number;

   /**
    * @internal
    */
   _setTileSet() {

   }
}

export class TileMap_NavigationInfo {
   /**
    * @internal
    */
   _setTileSet() {

   }
}

export class TileMap_CustomDataLayer {
   name: string;

   variant: string;
   /**
    * @internal
    */
   _setTileSet() {

   }
};


export class TileSetCell_LightInfo {
   //根据light功能定义
}

export class TileSetCell_PhysicsInfo{
   shape:number[];
   layerIndex:number;
}

export class TileSetCell_NavigationInfo {
   //根据想实现的Navigation定义
}

export class TileSetCell_CustomDataInfo {
   type: string;
   value: any;
}

