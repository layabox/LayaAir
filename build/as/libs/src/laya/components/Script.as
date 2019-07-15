/*[IF-FLASH]*/
package laya.components {
	improt laya.components.Component;
	improt laya.events.Event;
	public class Script extends laya.components.Component {
		public function get isSingleton():Boolean{};
		protected function _onAwake():void{}
		protected function _onEnable():void{}
		protected function _onDisable():void{}
		protected function _onDestroy():void{}
		public function onAwake():void{}
		public function onEnable():void{}
		public function onStart():void{}
		public function onTriggerEnter(other:*,self:*,contact:*):void{}
		public function onTriggerStay(other:*,self:*,contact:*):void{}
		public function onTriggerExit(other:*,self:*,contact:*):void{}
		public function onMouseDown(e:Event):void{}
		public function onMouseUp(e:Event):void{}
		public function onClick(e:Event):void{}
		public function onStageMouseDown(e:Event):void{}
		public function onStageMouseUp(e:Event):void{}
		public function onStageClick(e:Event):void{}
		public function onStageMouseMove(e:Event):void{}
		public function onDoubleClick(e:Event):void{}
		public function onRightClick(e:Event):void{}
		public function onMouseMove(e:Event):void{}
		public function onMouseOver(e:Event):void{}
		public function onMouseOut(e:Event):void{}
		public function onKeyDown(e:Event):void{}
		public function onKeyPress(e:Event):void{}
		public function onKeyUp(e:Event):void{}
		public function onUpdate():void{}
		public function onLateUpdate():void{}
		public function onPreRender():void{}
		public function onPostRender():void{}
		public function onDisable():void{}
		public function onDestroy():void{}
	}

}
