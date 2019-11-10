package laya.d3.core {
	import laya.d3.math.Matrix4x4;
	import laya.d3.math.Vector4;
	import laya.d3.resource.models.SkyRenderer;
	import laya.d3.shader.Shader3D;
	import laya.d3.core.Sprite3D;

	/**
	 * <code>BaseCamera</code> 类用于创建摄像机的父类。
	 */
	public class BaseCamera extends Sprite3D {
		public static var _tempMatrix4x40:Matrix4x4;
		public static var CAMERAPOS:Number;
		public static var VIEWMATRIX:Number;
		public static var PROJECTMATRIX:Number;
		public static var VIEWPROJECTMATRIX:Number;
		public static var CAMERADIRECTION:Number;
		public static var CAMERAUP:Number;
		public static var VIEWPORT:Number;
		public static var PROJECTION_PARAMS:Number;

		/**
		 * 渲染模式,延迟光照渲染，暂未开放。
		 */
		public static var RENDERINGTYPE_DEFERREDLIGHTING:String;

		/**
		 * 渲染模式,前向渲染。
		 */
		public static var RENDERINGTYPE_FORWARDRENDERING:String;
		protected static var _invertYScaleMatrix:Matrix4x4;
		protected static var _invertYProjectionMatrix:Matrix4x4;
		protected static var _invertYProjectionViewMatrix:Matrix4x4;

		/**
		 * 近裁剪面。
		 */
		protected var _nearPlane:Number;

		/**
		 * 远裁剪面。
		 */
		protected var _farPlane:Number;

		/**
		 * 视野。
		 */
		private var _fieldOfView:*;

		/**
		 * 正交投影的垂直尺寸。
		 */
		private var _orthographicVerticalSize:*;
		private var _skyRenderer:*;
		private var _forward:*;
		private var _up:*;

		/**
		 * 摄像机的清除颜色,默认颜色为CornflowerBlue。
		 */
		public var clearColor:Vector4;

		/**
		 * 可视层位标记遮罩值,支持混合 例:cullingMask=Math.pow(2,0)|Math.pow(2,1)为第0层和第1层可见。
		 */
		public var cullingMask:Number;

		/**
		 * 渲染时是否用遮挡剔除。
		 */
		public var useOcclusionCulling:Boolean;

		/**
		 * 天空渲染器。
		 */
		public function get skyRenderer():SkyRenderer{
				return null;
		}

		/**
		 * 视野。
		 */
		public var fieldOfView:Number;

		/**
		 * 近裁面。
		 */
		public var nearPlane:Number;

		/**
		 * 远裁面。
		 */
		public var farPlane:Number;

		/**
		 * 是否正交投影矩阵。
		 */
		public var orthographic:Boolean;

		/**
		 * 正交投影垂直矩阵尺寸。
		 */
		public var orthographicVerticalSize:Number;
		public var renderingOrder:Number;

		/**
		 * 创建一个 <code>BaseCamera</code> 实例。
		 * @param fieldOfView 视野。
		 * @param nearPlane 近裁面。
		 * @param farPlane 远裁面。
		 */

		public function BaseCamera(nearPlane:Number = undefined,farPlane:Number = undefined){}

		/**
		 * 通过RenderingOrder属性对摄像机机型排序。
		 */
		public function _sortCamerasByRenderingOrder():void{}

		/**
		 * 相机渲染。
		 * @param shader 着色器。
		 * @param replacementTag 着色器替换标记。
		 */
		public function render(shader:Shader3D = null,replacementTag:String = null):void{}

		/**
		 * 增加可视图层,layer值为0到31层。
		 * @param layer 图层。
		 */
		public function addLayer(layer:Number):void{}

		/**
		 * 移除可视图层,layer值为0到31层。
		 * @param layer 图层。
		 */
		public function removeLayer(layer:Number):void{}

		/**
		 * 增加所有图层。
		 */
		public function addAllLayers():void{}

		/**
		 * 移除所有图层。
		 */
		public function removeAllLayers():void{}
		public function resetProjectionMatrix():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _onActive():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _onInActive():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		/**
		 * @deprecated plaease use CameraClearFlags.SolidColor instead.
		 */
		public static var CLEARFLAG_SOLIDCOLOR:Number;

		/**
		 * @deprecated plaease use CameraClearFlags.Sky instead.
		 */
		public static var CLEARFLAG_SKY:Number;

		/**
		 * @deprecated plaease use CameraClearFlags.DepthOnly instead.
		 */
		public static var CLEARFLAG_DEPTHONLY:Number;

		/**
		 * @deprecated plaease use CameraClearFlags.Nothing instead.
		 */
		public static var CLEARFLAG_NONE:Number;
	}

}
