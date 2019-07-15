/*[IF-FLASH]*/
package laya.components {
	improt laya.display.Node;
	improt laya.resource.IDestroy;
	improt laya.resource.ISingletonElement;
	public class Component implements laya.resource.ISingletonElement,laya.resource.IDestroy {
		private var _indexInList:*;
		private var _awaked:*;
		public var owner:Node;

		public function Component(){}
		public function get id():Number{};
		public var enabled:Boolean;
		public function get isSingleton():Boolean{};
		public function get destroyed():Boolean{};
		private var _resetComp:*;
		public function _getIndexInList():Number{}
		public function _setIndexInList(index:Number):void{}
		protected function _onAwake():void{}
		protected function _onEnable():void{}
		protected function _onDisable():void{}
		protected function _onDestroy():void{}
		public function onReset():void{}
		public function destroy():void{}
	}

}
