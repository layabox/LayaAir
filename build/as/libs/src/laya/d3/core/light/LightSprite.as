/*[IF-FLASH]*/
package laya.d3.core.light {
	improt laya.d3.core.Sprite3D;
	improt laya.d3.math.Vector3;
	public class LightSprite extends laya.d3.core.Sprite3D {
		public static var LIGHTMAPBAKEDTYPE_REALTIME:Number;
		public static var LIGHTMAPBAKEDTYPE_MIXED:Number;
		public static var LIGHTMAPBAKEDTYPE_BAKED:Number;
		public var color:Vector3;
		public var intensity:Number;
		public var shadow:Boolean;
		public var shadowDistance:Number;
		public var shadowResolution:Number;
		public var shadowPSSMCount:Number;
		public var shadowPCFType:Number;
		public var lightmapBakedType:Number;

		public function LightSprite(){}
		public function _parse(data:*,spriteMap:*):void{}
		protected function _onActive():void{}
		protected function _onInActive():void{}
		public function _prepareToScene():Boolean{}
		public var diffuseColor:Vector3;
	}

}
