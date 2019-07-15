/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.display.Node;
	improt laya.d3.component.Animator;
	improt laya.d3.math.Vector4;
	improt laya.d3.shader.ShaderDefines;
	improt laya.d3.core.Sprite3D;
	public class RenderableSprite3D extends laya.d3.core.Sprite3D {
		public static var SHADERDEFINE_RECEIVE_SHADOW:Number;
		public static var SHADERDEFINE_SCALEOFFSETLIGHTINGMAPUV:Number;
		public static var SAHDERDEFINE_LIGHTMAP:Number;
		public static var LIGHTMAPSCALEOFFSET:Number;
		public static var LIGHTMAP:Number;
		public static var PICKCOLOR:Number;
		public var pickColor:Vector4;
		public static var shaderDefines:ShaderDefines;

		public function RenderableSprite3D(name:String){}
		protected function _onInActive():void{}
		protected function _onActive():void{}
		protected function _onActiveInScene():void{}
		public function _setBelongScene(scene:Node):void{}
		public function _setUnBelongScene():void{}
		protected function _changeHierarchyAnimator(animator:Animator):void{}
		public function destroy(destroyChild:Boolean = null):void{}
	}

}
