package laya.d3.graphics {
	import laya.d3.math.BoundFrustum;
	import laya.d3.math.Vector3;
	import laya.d3.math.BoundFrustum;
	import laya.d3.math.Plane;
	import laya.d3.math.Vector3;
	import laya.d3.math.BoundSphere;

	/**
	 * camera裁剪数据
	 */
	public class CameraCullInfo {

		/**
		 * 位置
		 */
		public var position:Vector3;

		/**
		 * 是否遮挡剔除
		 */
		public var useOcclusionCulling:Boolean;

		/**
		 * 锥体包围盒
		 */
		public var boundFrustum:BoundFrustum;

		/**
		 * 遮挡标记
		 */
		public var cullingMask:Number;
	}

}
