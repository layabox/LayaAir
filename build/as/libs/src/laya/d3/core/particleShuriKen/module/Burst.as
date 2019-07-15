/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen.module {
	improt laya.d3.core.IClone;
	public class Burst implements laya.d3.core.IClone {
		private var _time:*;
		private var _minCount:*;
		private var _maxCount:*;
		public function get time():Number{};
		public function get minCount():Number{};
		public function get maxCount():Number{};

		public function Burst(time:Number,minCount:Number,maxCount:Number){}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
