/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen.module {
	improt laya.d3.core.Gradient;
	improt laya.d3.core.IClone;
	improt laya.d3.math.Vector4;
	public class GradientColor implements laya.d3.core.IClone {
		public static function createByConstant(constant:Vector4):GradientColor{}
		public static function createByGradient(gradient:Gradient):GradientColor{}
		public static function createByRandomTwoConstant(minConstant:Vector4,maxConstant:Vector4):GradientColor{}
		public static function createByRandomTwoGradient(minGradient:Gradient,maxGradient:Gradient):GradientColor{}
		private var _type:*;
		private var _constant:*;
		private var _constantMin:*;
		private var _constantMax:*;
		private var _gradient:*;
		private var _gradientMin:*;
		private var _gradientMax:*;
		public function get type():Number{};
		public function get constant():Vector4{};
		public function get constantMin():Vector4{};
		public function get constantMax():Vector4{};
		public function get gradient():Gradient{};
		public function get gradientMin():Gradient{};
		public function get gradientMax():Gradient{};

		public function GradientColor(){}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
