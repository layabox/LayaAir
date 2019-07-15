/*[IF-FLASH]*/
package laya.effect {
	improt laya.display.Sprite;
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
