/*[IF-FLASH]*/
package laya.d3.component {
	improt laya.components.Component;
	improt laya.d3.physics.Collision;
	improt laya.d3.physics.PhysicsComponent;
	improt laya.events.Event;
	public class Script3D extends laya.components.Component {
		public function get isSingleton():Boolean{};
		private var _checkProcessTriggers:*;
		private var _checkProcessCollisions:*;
		protected function _onAwake():void{}
		protected function _onEnable():void{}
		protected function _onDisable():void{}
		public function _isScript():Boolean{}
		public function _onAdded():void{}
		protected function _onDestroy():void{}
		public function onAwake():void{}
		public function onEnable():void{}
		public function onStart():void{}
		public function onTriggerEnter(other:PhysicsComponent):void{}
		public function onTriggerStay(other:PhysicsComponent):void{}
		public function onTriggerExit(other:PhysicsComponent):void{}
		public function onCollisionEnter(collision:Collision):void{}
		public function onCollisionStay(collision:Collision):void{}
		public function onCollisionExit(collision:Collision):void{}
		public function onMouseDown():void{}
		public function onMouseDrag():void{}
		public function onMouseClick():void{}
		public function onMouseUp():void{}
		public function onMouseEnter():void{}
		public function onMouseOver():void{}
		public function onMouseOut():void{}
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
