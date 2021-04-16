package laya.effect {
	import laya.effect.FilterSetterBase;

	/**
	 * ...
	 * @author ww
	 */
	public class BlurFilterSetter extends FilterSetterBase {
		private var _strength:*;

		public function BlurFilterSetter(){}

		/**
		 * @override 
		 */
		override protected function buildFilter():void{}
		public function get strength():Number{return null;}
		public function set strength(value:Number):void{}
	}

}
