/*[IF-FLASH]*/
package laya.effect {
	improt laya.effect.FilterSetterBase;
	public class BlurFilterSetter extends laya.effect.FilterSetterBase {
		private var _strength:*;

		public function BlurFilterSetter(){}
		protected function buildFilter():void{}
		public var strength:Number;
	}

}
