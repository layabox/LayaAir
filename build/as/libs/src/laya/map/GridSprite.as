/*[IF-FLASH]*/
package laya.map {
	improt laya.map.TiledMap;
	improt laya.map.TileAniSprite;
	improt laya.display.Sprite;
	public class GridSprite extends laya.display.Sprite {
		public var relativeX:Number;
		public var relativeY:Number;
		public var isAloneObject:Boolean;
		public var isHaveAnimation:Boolean;
		public var aniSpriteArray:Array;
		public var drawImageNum:Number;
		private var _map:*;
		public function initData(map:TiledMap,objectKey:Boolean = null):void{}
		public function addAniSprite(sprite:TileAniSprite):void{}
		public function show():void{}
		public function hide():void{}
		public function updatePos():void{}
		public function clearAll():void{}
	}

}
