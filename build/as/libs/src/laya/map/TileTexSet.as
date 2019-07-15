/*[IF-FLASH]*/
package laya.map {
	improt laya.resource.Texture;
	improt laya.map.TileAniSprite;
	public class TileTexSet {
		public var gid:Number;
		public var texture:Texture;
		public var offX:Number;
		public var offY:Number;
		public var textureArray:Array;
		public var durationTimeArray:Array;
		public var animationTotalTime:Number;
		public var isAnimation:Boolean;
		private var _spriteNum:*;
		private var _aniDic:*;
		private var _frameIndex:*;
		private var _time:*;
		private var _interval:*;
		private var _preFrameTime:*;
		public function addAniSprite(aniName:String,sprite:TileAniSprite):void{}
		private var animate:*;
		private var drawTexture:*;
		public function removeAniSprite(_name:String):void{}
		public function showDebugInfo():String{}
		public function clearAll():void{}
	}

}
