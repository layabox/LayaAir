/*[IF-FLASH]*/
package laya.map {
	improt laya.map.TileTexSet;
	improt laya.display.Sprite;
	public class TileAniSprite extends laya.display.Sprite {
		private var _tileTextureSet:*;
		private var _aniName:*;
		public function setTileTextureSet(aniName:String,tileTextureSet:TileTexSet):void{}
		public function show():void{}
		public function hide():void{}
		public function clearAll():void{}
	}

}
