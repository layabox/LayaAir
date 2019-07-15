/*[IF-FLASH]*/
package laya.d3.core.light {
	improt laya.d3.core.light.LightSprite;
	public class PointLight extends laya.d3.core.light.LightSprite {
		private static var _tempMatrix0:*;
		private var _range:*;
		private var _lightMatrix:*;

		public function PointLight(){}
		public var range:Number;
		protected function _onActive():void{}
		protected function _onInActive():void{}
		public function _prepareToScene():Boolean{}
		public function _parse(data:*,spriteMap:*):void{}
	}

}
