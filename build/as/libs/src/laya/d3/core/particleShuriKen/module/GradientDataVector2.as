/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen.module {
	improt laya.d3.core.IClone;
	improt laya.d3.math.Vector2;
	public class GradientDataVector2 implements laya.d3.core.IClone {
		private var _currentLength:*;
		public function get gradientCount():Number{};

		public function GradientDataVector2(){}
		public function add(key:Number,value:Vector2):void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
