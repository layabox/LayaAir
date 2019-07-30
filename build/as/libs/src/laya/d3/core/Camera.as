package laya.d3.core {
	import laya.d3.component.PostProcess;
	import laya.d3.math.BoundFrustum;
	import laya.d3.math.Matrix4x4;
	import laya.d3.math.Ray;
	import laya.d3.math.Vector2;
	import laya.d3.math.Vector3;
	import laya.d3.math.Viewport;
	import laya.d3.resource.RenderTexture;
	import laya.d3.core.BaseCamera;
	import laya.d3.core.render.command.CommandBuffer;

	/*
	 * <code>Camera</code> 类用于创建摄像机。
	 */
	public class Camera extends laya.d3.core.BaseCamera {
		private var _aspectRatio:*;
		private var _viewport:*;
		private var _normalizedViewport:*;
		private var _viewMatrix:*;
		private var _projectionMatrix:*;
		private var _projectionViewMatrix:*;
		private var _boundFrustum:*;
		private var _updateViewMatrix:*;
		private var _postProcess:*;
		private var _enableHDR:*;

		/*
		 * 是否允许渲染。
		 */
		public var enableRender:Boolean;

		/*
		 * 获取横纵比。
		 * @return 横纵比。
		 */

		/*
		 * 设置横纵比。
		 * @param value 横纵比。
		 */
		public var aspectRatio:Number;

		/*
		 * 获取屏幕像素坐标的视口。
		 * @return 屏幕像素坐标的视口。
		 */

		/*
		 * 设置屏幕像素坐标的视口。
		 * @param 屏幕像素坐标的视口 。
		 */
		public var viewport:Viewport;

		/*
		 * 获取裁剪空间的视口。
		 * @return 裁剪空间的视口。
		 */

		/*
		 * 设置裁剪空间的视口。
		 * @return 裁剪空间的视口。
		 */
		public var normalizedViewport:Viewport;

		/*
		 * 获取视图矩阵。
		 * @return 视图矩阵。
		 */
		public function get viewMatrix():Matrix4x4{
				return null;
		}

		/*
		 * 获取投影矩阵。
		 */

		/*
		 * 设置投影矩阵。
		 */
		public var projectionMatrix:Matrix4x4;

		/*
		 * 获取视图投影矩阵。
		 * @return 视图投影矩阵。
		 */
		public function get projectionViewMatrix():Matrix4x4{
				return null;
		}

		/*
		 * 获取摄像机视锥。
		 */
		public function get boundFrustum():BoundFrustum{
				return null;
		}

		/*
		 * 获取自定义渲染场景的渲染目标。
		 * @return 自定义渲染场景的渲染目标。
		 */

		/*
		 * 设置自定义渲染场景的渲染目标。
		 * @param value 自定义渲染场景的渲染目标。
		 */
		public var renderTarget:RenderTexture;

		/*
		 * 获取后期处理。
		 * @return 后期处理。
		 */

		/*
		 * 设置后期处理。
		 * @param value 后期处理。
		 */
		public var postProcess:PostProcess;

		/*
		 * 获取是否开启HDR。
		 */

		/*
		 * 设置是否开启HDR。
		 */
		public var enableHDR:Boolean;

		/*
		 * 创建一个 <code>Camera</code> 实例。
		 * @param aspectRatio 横纵比。
		 * @param nearPlane 近裁面。
		 * @param farPlane 远裁面。
		 */

		public function Camera(aspectRatio:Number = undefined,nearPlane:Number = undefined,farPlane:Number = undefined){}

		/*
		 * 通过蒙版值获取蒙版是否显示。
		 * @param layer 层。
		 * @return 是否显示。
		 */
		public function _isLayerVisible(layer:Number):Boolean{
			return null;
		}
		private var _calculationViewport:*;

		/*
		 * 计算从屏幕空间生成的射线。
		 * @param point 屏幕空间的位置位置。
		 * @return out  输出射线。
		 */
		public function viewportPointToRay(point:Vector2,out:Ray):void{}

		/*
		 * 计算从裁切空间生成的射线。
		 * @param point 裁切空间的位置。。
		 * @return out  输出射线。
		 */
		public function normalizedViewportPointToRay(point:Vector2,out:Ray):void{}

		/*
		 * 计算从世界空间准换三维坐标到屏幕空间。
		 * @param position 世界空间的位置。
		 * @return out  输出位置。
		 */
		public function worldToViewportPoint(position:Vector3,out:Vector3):void{}

		/*
		 * 计算从世界空间准换三维坐标到裁切空间。
		 * @param position 世界空间的位置。
		 * @return out  输出位置。
		 */
		public function worldToNormalizedViewportPoint(position:Vector3,out:Vector3):void{}

		/*
		 * 转换2D屏幕坐标系统到3D正交投影下的坐标系统，注:只有正交模型下有效。
		 * @param source 源坐标。
		 * @param out 输出坐标。
		 * @return 是否转换成功。
		 */
		public function convertScreenCoordToOrthographicCoord(source:Vector3,out:Vector3):Boolean{
			return null;
		}

		/*
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		/*
		 * 在特定渲染管线阶段添加指令缓存。
		 */
		public function addCommandBuffer(event:Number,commandBuffer:CommandBuffer):void{}

		/*
		 * 在特定渲染管线阶段移除指令缓存。
		 */
		public function removeCommandBuffer(event:Number,commandBuffer:CommandBuffer):void{}

		/*
		 * 在特定渲染管线阶段移除所有指令缓存。
		 */
		public function removeCommandBuffers(event:Number):void{}
	}

}
