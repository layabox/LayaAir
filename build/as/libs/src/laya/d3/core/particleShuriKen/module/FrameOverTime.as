/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen.module {
	improt laya.d3.core.particleShuriKen.module.GradientDataInt;
	improt laya.d3.core.IClone;
	public class FrameOverTime implements laya.d3.core.IClone {
		public static function createByConstant(constant:Number):FrameOverTime{}
		public static function createByOverTime(overTime:GradientDataInt):FrameOverTime{}
		public static function createByRandomTwoConstant(constantMin:Number,constantMax:Number):FrameOverTime{}
		public static function createByRandomTwoOverTime(gradientFrameMin:GradientDataInt,gradientFrameMax:GradientDataInt):FrameOverTime{}
		private var _type:*;
		private var _constant:*;
		private var _overTime:*;
		private var _constantMin:*;
		private var _constantMax:*;
		private var _overTimeMin:*;
		private var _overTimeMax:*;
		public function get type():Number{};
		public function get constant():Number{};
		public function get frameOverTimeData():GradientDataInt{};
		public function get constantMin():Number{};
		public function get constantMax():Number{};
		public function get frameOverTimeDataMin():GradientDataInt{};
		public function get frameOverTimeDataMax():GradientDataInt{};

		public function FrameOverTime(){}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
