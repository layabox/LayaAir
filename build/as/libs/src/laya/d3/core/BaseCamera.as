/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.d3.math.Matrix4x4;
	improt laya.d3.math.Vector4;
	improt laya.d3.resource.models.SkyRenderer;
	improt laya.d3.shader.Shader3D;
	improt laya.d3.core.Sprite3D;
	public class BaseCamera extends laya.d3.core.Sprite3D {
		public static var _tempMatrix4x40:Matrix4x4;
		public static var CAMERAPOS:Number;
		public static var VIEWMATRIX:Number;
		public static var PROJECTMATRIX:Number;
		public static var VIEWPROJECTMATRIX:Number;
		public static var CAMERADIRECTION:Number;
		public static var CAMERAUP:Number;
		public static var RENDERINGTYPE_DEFERREDLIGHTING:String;
		public static var RENDERINGTYPE_FORWARDRENDERING:String;
		public static var CLEARFLAG_SOLIDCOLOR:Number;
		public static var CLEARFLAG_SKY:Number;
		public static var CLEARFLAG_DEPTHONLY:Number;
		public static var CLEARFLAG_NONE:Number;
		protected static var _invertYScaleMatrix:Matrix4x4;
		protected static var _invertYProjectionMatrix:Matrix4x4;
		protected static var _invertYProjectionViewMatrix:Matrix4x4;
		private var _nearPlane:*;
		private var _farPlane:*;
		private var _fieldOfView:*;
		private var _orthographicVerticalSize:*;
		private var _skyRenderer:*;
		private var _forward:*;
		private var _up:*;
		public var clearFlag:Number;
		public var clearColor:Vector4;
		public var cullingMask:Number;
		public var useOcclusionCulling:Boolean;
		public function get skyRenderer():SkyRenderer{};
		public var fieldOfView:Number;
		public var nearPlane:Number;
		public var farPlane:Number;
		public var orthographic:Boolean;
		public var orthographicVerticalSize:Number;
		public var renderingOrder:Number;

		public function BaseCamera(nearPlane:Number = null,farPlane:Number = null){}
		public function _sortCamerasByRenderingOrder():void{}
		public function render(shader:Shader3D = null,replacementTag:String = null):void{}
		public function addLayer(layer:Number):void{}
		public function removeLayer(layer:Number):void{}
		public function addAllLayers():void{}
		public function removeAllLayers():void{}
		public function resetProjectionMatrix():void{}
		protected function _onActive():void{}
		protected function _onInActive():void{}
		public function _parse(data:*,spriteMap:*):void{}
		public function destroy(destroyChild:Boolean = null):void{}
	}

}
