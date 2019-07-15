/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.d3.core.IClone;
	improt laya.d3.math.Color;
	public class Gradient implements laya.d3.core.IClone {
		private var _mode:*;
		private var _maxColorRGBKeysCount:*;
		private var _maxColorAlphaKeysCount:*;
		private var _colorRGBKeysCount:*;
		private var _colorAlphaKeysCount:*;
		public var mode:Number;
		public function get colorRGBKeysCount():Number{};
		public function get colorAlphaKeysCount():Number{};
		public function get maxColorRGBKeysCount():Number{};
		public function get maxColorAlphaKeysCount():Number{};

		public function Gradient(maxColorRGBKeyCount:Number,maxColorAlphaKeyCount:Number){}
		public function addColorRGB(key:Number,value:Color):void{}
		public function addColorAlpha(key:Number,value:Number):void{}
		public function updateColorRGB(index:Number,key:Number,value:Color):void{}
		public function updateColorAlpha(index:Number,key:Number,value:Number):void{}
		public function evaluateColorRGB(lerpFactor:Number,out:Color,startSearchIndex:Number = null,reverseSearch:Boolean = null):Number{}
		public function evaluateColorAlpha(lerpFactor:Number,outColor:Color,startSearchIndex:Number = null,reverseSearch:Boolean = null):Number{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
