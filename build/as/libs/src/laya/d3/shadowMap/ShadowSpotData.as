package laya.d3.shadowMap {
	import laya.d3.math.Matrix4x4;
	import laya.d3.math.Vector3;
	import laya.d3.shader.ShaderData;
	import laya.d3.graphics.FrustumCulling;
	public class ShadowSpotData {
		public var cameraShaderValue:ShaderData;
		public var position:Vector3;
		public var offsetX:Number;
		public var offsetY:Number;
		public var resolution:Number;
		public var viewMatrix:Matrix4x4;
		public var projectionMatrix:Matrix4x4;
		public var viewProjectMatrix:Matrix4x4;
		public var cameraCullInfo:CameraCullInfo;
	}

}
