/*[IF-FLASH]*/
package laya.components {
	improt laya.components.Component;
	public class CommonScript extends laya.components.Component {
		public function get isSingleton():Boolean{};

		public function CommonScript(){}
		public function onAwake():void{}
		public function onEnable():void{}
		public function onStart():void{}
		public function onUpdate():void{}
		public function onLateUpdate():void{}
		public function onDisable():void{}
		public function onDestroy():void{}
	}

}
