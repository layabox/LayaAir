package laya.effect {
	import laya.display.Sprite;

	/**
	 * ...
	 * @author ww
	 */
	public class FilterSetterBase {
		public var _filter:*;

		public function FilterSetterBase(){}
		public function paramChanged():void{}
		protected function buildFilter():void{}
		protected function addFilter(sprite:Sprite):void{}
		protected function removeFilter(sprite:Sprite):void{}
		private var _target:*;
		public var target:*;
	}

}
