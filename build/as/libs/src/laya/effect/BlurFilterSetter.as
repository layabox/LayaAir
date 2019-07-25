package laya.effect {
	import laya.effect.FilterSetterBase;

	/*
	 * ...
	 * @author ww
	 */
	public class BlurFilterSetter extends laya.effect.FilterSetterBase {
		private var _strength:*;

		public function BlurFilterSetter(){}

		/*
		 * @override 
		 */
		override protected function buildFilter():void{}
		public var strength:Number;
	}

}
