/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen.module {
	improt laya.d3.core.particleShuriKen.module.GradientDataNumber;
	improt laya.d3.core.IClone;
	improt laya.d3.math.Vector3;
	public class GradientAngularVelocity implements laya.d3.core.IClone {
		public static function createByConstant(constant:Number):GradientAngularVelocity{}
		public static function createByConstantSeparate(separateConstant:Vector3):GradientAngularVelocity{}
		public static function createByGradient(gradient:GradientDataNumber):GradientAngularVelocity{}
		public static function createByGradientSeparate(gradientX:GradientDataNumber,gradientY:GradientDataNumber,gradientZ:GradientDataNumber):GradientAngularVelocity{}
		public static function createByRandomTwoConstant(constantMin:Number,constantMax:Number):GradientAngularVelocity{}
		public static function createByRandomTwoConstantSeparate(separateConstantMin:Vector3,separateConstantMax:Vector3):GradientAngularVelocity{}
		public static function createByRandomTwoGradient(gradientMin:GradientDataNumber,gradientMax:GradientDataNumber):GradientAngularVelocity{}
		public static function createByRandomTwoGradientSeparate(gradientXMin:GradientDataNumber,gradientXMax:GradientDataNumber,gradientYMin:GradientDataNumber,gradientYMax:GradientDataNumber,gradientZMin:GradientDataNumber,gradientZMax:GradientDataNumber,gradientWMin:GradientDataNumber,gradientWMax:GradientDataNumber):GradientAngularVelocity{}
		private var _type:*;
		private var _separateAxes:*;
		private var _constant:*;
		private var _constantSeparate:*;
		private var _gradient:*;
		private var _gradientX:*;
		private var _gradientY:*;
		private var _gradientZ:*;
		private var _gradientW:*;
		private var _constantMin:*;
		private var _constantMax:*;
		private var _constantMinSeparate:*;
		private var _constantMaxSeparate:*;
		private var _gradientMin:*;
		private var _gradientMax:*;
		private var _gradientXMin:*;
		private var _gradientXMax:*;
		private var _gradientYMin:*;
		private var _gradientYMax:*;
		private var _gradientZMin:*;
		private var _gradientZMax:*;
		private var _gradientWMin:*;
		private var _gradientWMax:*;
		public function get type():Number{};
		public function get separateAxes():Boolean{};
		public function get constant():Number{};
		public function get constantSeparate():Vector3{};
		public function get gradient():GradientDataNumber{};
		public function get gradientX():GradientDataNumber{};
		public function get gradientY():GradientDataNumber{};
		public function get gradientZ():GradientDataNumber{};
		public function get gradientW():GradientDataNumber{};
		public function get constantMin():Number{};
		public function get constantMax():Number{};
		public function get constantMinSeparate():Vector3{};
		public function get constantMaxSeparate():Vector3{};
		public function get gradientMin():GradientDataNumber{};
		public function get gradientMax():GradientDataNumber{};
		public function get gradientXMin():GradientDataNumber{};
		public function get gradientXMax():GradientDataNumber{};
		public function get gradientYMin():GradientDataNumber{};
		public function get gradientYMax():GradientDataNumber{};
		public function get gradientZMin():GradientDataNumber{};
		public function get gradientZMax():GradientDataNumber{};
		public function get gradientWMin():GradientDataNumber{};
		public function get gradientWMax():GradientDataNumber{};

		public function GradientAngularVelocity(){}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
