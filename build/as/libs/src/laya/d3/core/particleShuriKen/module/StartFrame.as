/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen.module {
	improt laya.d3.core.IClone;
	public class StartFrame implements laya.d3.core.IClone {
		public static function createByConstant(constant:Number):StartFrame{}
		public static function createByRandomTwoConstant(constantMin:Number,constantMax:Number):StartFrame{}
		private var _type:*;
		private var _constant:*;
		private var _constantMin:*;
		private var _constantMax:*;
		public function get type():Number{};
		public function get constant():Number{};
		public function get constantMin():Number{};
		public function get constantMax():Number{};

		public function StartFrame(){}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
