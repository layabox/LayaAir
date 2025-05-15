import { SaveBase } from "./SaveBase";
import { ISaveData } from "./ISaveData";
import { GraphicsRunner } from "../../../display/Scene2DSpecial/GraphicsRunner";

export class SaveStyle implements ISaveData {
   private static POOL: any = SaveBase._createArray();

   private _fillStyle: any;
   
   private _other: number;

   private _key: "fillStyle" | "strokeStyle";

   constructor() {
   }
   isSaveMark(): boolean {
      return false;
   }
   restore(runner: GraphicsRunner): void {
      //@ts-ignore
      runner["_" + this._key] = this._fillStyle;
      runner._submitKey.other = this._other;
      SaveStyle.POOL[SaveStyle.POOL._length++] = this;
   }

   static save(runner: GraphicsRunner , key: "fillStyle" | "strokeStyle"): void {
      let _saveMark: any = runner._saveMark;
      if ((_saveMark._saveuse & SaveBase.TYPE_STYLE) === SaveBase.TYPE_STYLE) return;
      _saveMark._saveuse |= SaveBase.TYPE_STYLE;
      let no: any = SaveStyle.POOL;
      let o: SaveStyle = no._length > 0 ? no[--no._length] : (new SaveStyle());
      o._fillStyle = runner[key];
      o._other = runner._submitKey.other;
      o._key = key;
   }
}


