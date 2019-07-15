/*[IF-FLASH]*/
package laya.effect {
	improt laya.effect.FilterSetterBase;
	public class GlowFilterSetter extends laya.effect.FilterSetterBase {
		private var _color:*;
		private var _blur:*;
		private var _offX:*;
		private var _offY:*;

		public function GlowFilterSetter(){}
		protected function buildFilter():void{}
		public var color:String;
		public var blur:Number;
		public var offX:Number;
		public var offY:Number;
	}

}
