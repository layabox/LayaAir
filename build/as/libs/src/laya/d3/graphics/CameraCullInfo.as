package laya.d3.graphics {
	import laya.d3.math.BoundFrustum;
	import laya.d3.math.Plane;
	import laya.d3.math.Vector3;
	import laya.d3.math.BoundSphere;
	public class CameraCullInfo {
		public var position:Vector3;
		public var useOcclusionCulling:Boolean;
		public var boundFrustum:BoundFrustum;
		public var cullingMask:Number;
	}

}
