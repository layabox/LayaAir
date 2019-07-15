/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen.module {
	improt laya.d3.core.IClone;
	public class GradientDataNumber implements laya.d3.core.IClone {
		private var _currentLength:*;
		public function get gradientCount():Number{};

		public function GradientDataNumber(){}
		public function add(key:Number,value:Number):void{}
		public function getKeyByIndex(index:Number):Number{}
		public function getValueByIndex(index:Number):Number{}
		public function getAverageValue():Number{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
