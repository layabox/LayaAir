/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen.module {
	improt laya.d3.core.particleShuriKen.module.GradientDataNumber;
	improt laya.d3.core.IClone;
	improt laya.d3.math.Vector3;
	public class GradientVelocity implements laya.d3.core.IClone {
		public static function createByConstant(constant:Vector3):GradientVelocity{}
		public static function createByGradient(gradientX:GradientDataNumber,gradientY:GradientDataNumber,gradientZ:GradientDataNumber):GradientVelocity{}
		public static function createByRandomTwoConstant(constantMin:Vector3,constantMax:Vector3):GradientVelocity{}
		public static function createByRandomTwoGradient(gradientXMin:GradientDataNumber,gradientXMax:GradientDataNumber,gradientYMin:GradientDataNumber,gradientYMax:GradientDataNumber,gradientZMin:GradientDataNumber,gradientZMax:GradientDataNumber):GradientVelocity{}
		private var _type:*;
		private var _constant:*;
		private var _gradientX:*;
		private var _gradientY:*;
		private var _gradientZ:*;
		private var _constantMin:*;
		private var _constantMax:*;
		private var _gradientXMin:*;
		private var _gradientXMax:*;
		private var _gradientYMin:*;
		private var _gradientYMax:*;
		private var _gradientZMin:*;
		private var _gradientZMax:*;
		public function get type():Number{};
		public function get constant():Vector3{};
		public function get gradientX():GradientDataNumber{};
		public function get gradientY():GradientDataNumber{};
		public function get gradientZ():GradientDataNumber{};
		public function get constantMin():Vector3{};
		public function get constantMax():Vector3{};
		public function get gradientXMin():GradientDataNumber{};
		public function get gradientXMax():GradientDataNumber{};
		public function get gradientYMin():GradientDataNumber{};
		public function get gradientYMax():GradientDataNumber{};
		public function get gradientZMin():GradientDataNumber{};
		public function get gradientZMax():GradientDataNumber{};

		public function GradientVelocity(){}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
