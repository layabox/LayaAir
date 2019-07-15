/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.d3.component.PostProcess;
	improt laya.d3.math.BoundFrustum;
	improt laya.d3.math.Matrix4x4;
	improt laya.d3.math.Ray;
	improt laya.d3.math.Vector2;
	improt laya.d3.math.Vector3;
	improt laya.d3.math.Viewport;
	improt laya.d3.resource.RenderTexture;
	improt laya.d3.shader.Shader3D;
	improt laya.d3.core.BaseCamera;
	improt laya.d3.core.render.command.CommandBuffer;
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
		public var enableRender:Boolean;
		public var aspectRatio:Number;
		public var viewport:Viewport;
		public var normalizedViewport:Viewport;
		public function get viewMatrix():Matrix4x4{};
		public var projectionMatrix:Matrix4x4;
		public function get projectionViewMatrix():Matrix4x4{};
		public function get boundFrustum():BoundFrustum{};
		public var renderTarget:RenderTexture;
		public var postProcess:PostProcess;
		public var enableHDR:Boolean;

		public function Camera(aspectRatio:Number = null,nearPlane:Number = null,farPlane:Number = null){}
		public function _isLayerVisible(layer:Number):Boolean{}
		private var _calculationViewport:*;
		public function _parse(data:*,spriteMap:*):void{}
		protected function _calculateProjectionMatrix():void{}
		public function render(shader:Shader3D = null,replacementTag:String = null):void{}
		public function viewportPointToRay(point:Vector2,out:Ray):void{}
		public function normalizedViewportPointToRay(point:Vector2,out:Ray):void{}
		public function worldToViewportPoint(position:Vector3,out:Vector3):void{}
		public function worldToNormalizedViewportPoint(position:Vector3,out:Vector3):void{}
		public function convertScreenCoordToOrthographicCoord(source:Vector3,out:Vector3):Boolean{}
		public function destroy(destroyChild:Boolean = null):void{}
		public function addCommandBuffer(event:Number,commandBuffer:CommandBuffer):void{}
		public function removeCommandBuffer(event:Number,commandBuffer:CommandBuffer):void{}
		public function removeCommandBuffers(event:Number):void{}
	}

}
