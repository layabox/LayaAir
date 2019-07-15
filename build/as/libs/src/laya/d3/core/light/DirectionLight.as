/*[IF-FLASH]*/
package laya.d3.core.light {
	improt laya.d3.core.light.LightSprite;
	public class DirectionLight extends laya.d3.core.light.LightSprite {
		private var _direction:*;
		public var shadow:Boolean;

		public function DirectionLight(){}
		private var _initShadow:*;
		protected function _onActive():void{}
		protected function _onInActive():void{}
		public function _prepareToScene():Boolean{}
	}

}
