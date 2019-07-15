/*[IF-FLASH]*/
package laya.effect {
	improt laya.effect.FilterSetterBase;
	public class ColorFilterSetter extends laya.effect.FilterSetterBase {
		private var _brightness:*;
		private var _contrast:*;
		private var _saturation:*;
		private var _hue:*;
		private var _red:*;
		private var _green:*;
		private var _blue:*;
		private var _alpha:*;

		public function ColorFilterSetter(){}
		protected function buildFilter():void{}
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
