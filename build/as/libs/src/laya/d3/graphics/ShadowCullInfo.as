package laya.d3.graphics {
	import laya.d3.math.BoundSphere;
	import laya.d3.math.Vector3;
	public class ShadowCullInfo {
		public var position:Vector3;
		public var cullPlanes:Array;
		public var cullSphere:BoundSphere;
		public var cullPlaneCount:Number;
		public var direction:Vector3;
	}

}
