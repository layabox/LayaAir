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
		public function get brightness():Number{return null;}
		public function set brightness(value:Number):void{}
		public function get contrast():Number{return null;}
		public function set contrast(value:Number):void{}
		public function get saturation():Number{return null;}
		public function set saturation(value:Number):void{}
		public function get hue():Number{return null;}
		public function set hue(value:Number):void{}
		public function get red():Number{return null;}
		public function set red(value:Number):void{}
		public function get green():Number{return null;}
		public function set green(value:Number):void{}
		public function get blue():Number{return null;}
		public function set blue(value:Number):void{}
		private var _color:*;
		public function get color():String{return null;}
		public function set color(value:String):void{}
		public function get alpha():Number{return null;}
		public function set alpha(value:Number):void{}
	}

}
