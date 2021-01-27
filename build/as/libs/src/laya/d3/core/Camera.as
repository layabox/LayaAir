package laya.d3.core {
	import laya.d3.core.render.command.CommandBuffer;
	import laya.d3.math.Vector4;
	import laya.d3.math.Vector3;
	import laya.d3.math.Ray;
	import laya.d3.math.Vector2;
	import laya.d3.shader.Shader3D;
	import laya.d3.core.render.RenderContext3D;
	import laya.d3.component.PostProcess;
	import laya.d3.math.BoundFrustum;
	import laya.d3.math.Matrix4x4;
	import laya.d3.math.Viewport;
	import laya.d3.resource.RenderTexture;
	import laya.d3.core.scene.Scene3D;
	import laya.d3.component.PostProcess;
	import laya.d3.math.BoundFrustum;
	import laya.d3.math.Matrix4x4;
	import laya.d3.math.Ray;
	import laya.d3.math.Vector2;
	import laya.d3.math.Vector3;
	import laya.d3.math.Vector4;
	import laya.d3.math.Viewport;
	import laya.d3.resource.RenderTexture;
	import laya.d3.shader.Shader3D;
	import laya.d3.core.BaseCamera;
	import laya.d3.core.render.command.CommandBuffer;
	import laya.d3.core.render.RenderContext3D;
	import laya.d3.core.scene.Scene3D;

	/**
	 * <code>Camera</code> 类用于创建摄像机。
	 */
	public class Camera extends BaseCamera {

		/**
		 * 根据相机、scene信息获得scene中某一位置的渲染结果
		 * @param camera 
		 * @param scene 
		 */
		public static function drawRenderTextureByScene(camera:Camera,scene:Scene3D,renderTexture:RenderTexture):RenderTexture{
			return null;
		}

		/**
		 * 深度贴图
		 */
		private var _depthTexture:*;

		/**
		 * 深度法线贴图
		 */
		private var _depthNormalsTexture:*;
		private var _cameraEventCommandBuffer:*;

		/**
		 * 是否允许渲染。
		 */
		public var enableRender:Boolean;

		/**
		 * 清除标记。
		 */
		public var clearFlag:*;

		/**
		 * 横纵比。
		 */
		public function get aspectRatio():Number{return null;}
		public function set aspectRatio(value:Number):void{}

		/**
		 * 获取屏幕像素坐标的视口。
		 */
		public function get viewport():Viewport{return null;}
		public function set viewport(value:Viewport):void{}

		/**
		 * 裁剪空间的视口。
		 */
		public function get normalizedViewport():Viewport{return null;}
		public function set normalizedViewport(value:Viewport):void{}

		/**
		 * 获取视图矩阵。
		 */
		public function get viewMatrix():Matrix4x4{return null;}

		/**
		 * 投影矩阵。
		 */
		public function get projectionMatrix():Matrix4x4{return null;}
		public function set projectionMatrix(value:Matrix4x4):void{}

		/**
		 * 获取视图投影矩阵。
		 */
		public function get projectionViewMatrix():Matrix4x4{return null;}

		/**
		 * 获取摄像机视锥。
		 */
		public function get boundFrustum():BoundFrustum{return null;}

		/**
		 * 自定义渲染场景的渲染目标。
		 */
		public function get renderTarget():RenderTexture{return null;}
		public function set renderTarget(value:RenderTexture):void{}

		/**
		 * 后期处理。
		 */
		public function get postProcess():PostProcess{return null;}
		public function set postProcess(value:PostProcess):void{}

		/**
		 * 是否开启HDR。
		 * 开启后对性能有一定影响。
		 */
		public function get enableHDR():Boolean{return null;}
		public function set enableHDR(value:Boolean):void{}

		/**
		 * 是否使用正在渲染的RenderTexture为CommandBuffer服务，设置为true
		 * 一般和CommandBuffer一起使用
		 */
		public function get enableBuiltInRenderTexture():Boolean{return null;}
		public function set enableBuiltInRenderTexture(value:Boolean):void{}

		/**
		 * 深度贴图模式
		 */
		public function get depthTextureMode():Number{return null;}
		public function set depthTextureMode(value:Number):void{}

		/**
		 * 创建一个 <code>Camera</code> 实例。
		 * @param aspectRatio 横纵比。
		 * @param nearPlane 近裁面。
		 * @param farPlane 远裁面。
		 */

		public function Camera(aspectRatio:Number = undefined,nearPlane:Number = undefined,farPlane:Number = undefined){}

		/**
		 * 通过蒙版值获取蒙版是否显示。
		 * @param layer 层。
		 * @return 是否显示。
		 */
		public function _isLayerVisible(layer:Number):Boolean{
			return null;
		}

		/**
		 * 调用渲染命令流
		 * @param event 
		 * @param renderTarget 
		 * @param context 
		 */
		public function _applyCommandBuffer(event:Number,context:RenderContext3D):void{}
		public function set depthTexture(value:RenderTexture):void{}
		public function set depthNormalTexture(value:RenderTexture):void{}

		/**
		 * @override 
		 * @param shader 着色器
		 * @param replacementTag 替换标记。
		 */
		override public function render(shader:Shader3D = null,replacementTag:String = null):void{}

		/**
		 * 计算从屏幕空间生成的射线。
		 * @param point 屏幕空间的位置位置。
		 * @param out 输出射线。
		 */
		public function viewportPointToRay(point:Vector2,out:Ray):void{}

		/**
		 * 计算从裁切空间生成的射线。
		 * @param point 裁切空间的位置。
		 * @param out 输出射线。
		 */
		public function normalizedViewportPointToRay(point:Vector2,out:Ray):void{}

		/**
		 * 将一个点从世界空间转换到视口空间。
		 * @param position 世界空间的坐标。
		 * @param out x、y、z为视口空间坐标,w为相对于摄像机的z轴坐标。
		 */
		public function worldToViewportPoint(position:Vector3,out:Vector4):void{}

		/**
		 * 将一个点从世界空间转换到归一化视口空间。
		 * @param position 世界空间的坐标。
		 * @param out x、y、z为归一化视口空间坐标,w为相对于摄像机的z轴坐标。
		 */
		public function worldToNormalizedViewportPoint(position:Vector3,out:Vector4):void{}

		/**
		 * 转换2D屏幕坐标系统到3D正交投影下的坐标系统，注:只有正交模型下有效。
		 * @param source 源坐标。
		 * @param out 输出坐标。
		 * @return 是否转换成功。
		 */
		public function convertScreenCoordToOrthographicCoord(source:Vector3,out:Vector3):Boolean{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		/**
		 * 增加camera渲染节点渲染缓存
		 * @param event 相机事件标志
		 * @param commandBuffer 渲染命令流
		 */
		public function addCommandBuffer(event:*,commandBuffer:CommandBuffer):void{}

		/**
		 * 移除camera渲染节点渲染缓存
		 * @param event 相机事件标志
		 * @param commandBuffer 渲染命令流
		 */
		public function removeCommandBuffer(event:*,commandBuffer:CommandBuffer):void{}

		/**
		 * 移除camera相机节点的所有渲染缓存
		 * @param event 相机事件标志
		 */
		public function removeCommandBuffers(event:*):void{}
	}

}
