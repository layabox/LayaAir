package laya.effect {
	import laya.effect.FilterSetterBase;

	/**
	 * ...
	 * @author ww
	 */
	public class ColorFilterSetter extends FilterSetterBase {

		/**
		 * brightness 亮度,范围:-100~100
		 */
		private var _brightness:*;

		/**
		 * contrast 对比度,范围:-100~100
		 */
		private var _contrast:*;

		/**
		 * saturation 饱和度,范围:-100~100
		 */
		private var _saturation:*;

		/**
		 * hue 色调,范围:-180~180
		 */
		private var _hue:*;

		/**
		 * red red增量,范围:0~255
		 */
		private var _red:*;

		/**
		 * green green增量,范围:0~255
		 */
		private var _green:*;

		/**
		 * blue blue增量,范围:0~255
		 */
		private var _blue:*;

		/**
		 * alpha alpha增量,范围:0~255
		 */
		private var _alpha:*;

		public function ColorFilterSetter(){}

		/**
		 * @override 
		 */
		override protected function buildFilter():void{}
		public var brightness:Number;
		public var contrast:Number;
		public var saturation:Number;
		public var hue:Number;
		public var red:Number;
		public var green:Number;
		public var blue:Number;
		private var _color:*;
		public var color:String;
		public var alpha:Number;
	}

}
