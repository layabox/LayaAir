/*[IF-FLASH]*/
package laya.webgl.text {
	improt laya.maths.Point;
	public class AtlasGrid {
		public var atlasID:Number;
		private var _width:*;
		private var _height:*;
		private var _texCount:*;
		private var _rowInfo:*;
		private var _cells:*;
		public var _used:Number;

		public function AtlasGrid(width:Number = null,height:Number = null,id:Number = null){}
		public function addRect(type:Number,width:Number,height:Number,pt:Point):Boolean{}
		private var _release:*;
		private var _init:*;
		private var _get:*;
		private var _fill:*;
		private var _check:*;
		private var _clear:*;
	}

}
