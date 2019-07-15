/*[IF-FLASH]*/
package laya.d3.core.light {
	improt laya.d3.core.light.LightSprite;
	public class SpotLight extends laya.d3.core.light.LightSprite {
		private static var _tempMatrix0:*;
		private static var _tempMatrix1:*;
		private var _direction:*;
		private var _spotAngle:*;
		private var _range:*;
		public var spotAngle:Number;
		public var range:Number;
		protected function _onActive():void{}
		protected function _onInActive():void{}
		public function _prepareToScene():Boolean{}
		public function _parse(data:*,spriteMap:*):void{}
	}

}
