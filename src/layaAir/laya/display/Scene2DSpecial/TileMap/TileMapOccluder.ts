import { Light2DManager } from "../Light2D/Light2DManager";
import { TileMapLayer } from "./TileMapLayer";

export class TileMapOccluder {

   private _layer: TileMapLayer;

   private _agent: any;

   constructor(layer: TileMapLayer) {
      this._layer = layer;
      // let agent = layer.owner.scene._light2DManager.occluderAgent;
   }

   
}