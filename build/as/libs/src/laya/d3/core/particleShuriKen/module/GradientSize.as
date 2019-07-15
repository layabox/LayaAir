/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen.module {
	improt laya.d3.core.particleShuriKen.module.GradientDataNumber;
	improt laya.d3.core.IClone;
	improt laya.d3.math.Vector3;
	public class GradientSize implements laya.d3.core.IClone {
		public static function createByGradient(gradient:GradientDataNumber):GradientSize{}
		public static function createByGradientSeparate(gradientX:GradientDataNumber,gradientY:GradientDataNumber,gradientZ:GradientDataNumber):GradientSize{}
		public static function createByRandomTwoConstant(constantMin:Number,constantMax:Number):GradientSize{}
		public static function createByRandomTwoConstantSeparate(constantMinSeparate:Vector3,constantMaxSeparate:Vector3):GradientSize{}
		public static function createByRandomTwoGradient(gradientMin:GradientDataNumber,gradientMax:GradientDataNumber):GradientSize{}
		public static function createByRandomTwoGradientSeparate(gradientXMin:GradientDataNumber,gradientXMax:GradientDataNumber,gradientYMin:GradientDataNumber,gradientYMax:GradientDataNumber,gradientZMin:GradientDataNumber,gradientZMax:GradientDataNumber):GradientSize{}
		private var _type:*;
		private var _separateAxes:*;
		private var _gradient:*;
		private var _gradientX:*;
		private var _gradientY:*;
		private var _gradientZ:*;
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
		public function get type():Number{};
		public function get separateAxes():Boolean{};
		public function get gradient():GradientDataNumber{};
		public function get gradientX():GradientDataNumber{};
		public function get gradientY():GradientDataNumber{};
		public function get gradientZ():GradientDataNumber{};
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

		public function GradientSize(){}
		public function getMaxSizeInGradient():Number{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
