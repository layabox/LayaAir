package laya.d3.shadowMap {
	import laya.d3.core.BaseCamera;
	import laya.d3.core.scene.Scene3D;
	import laya.d3.math.Matrix4x4;
	import laya.d3.math.Vector3;

	/**
	 * ...
	 * @author ...
	 */
	public class ParallelSplitShadowMap {

		public function ParallelSplitShadowMap(){}
		public function setInfo(scene:Scene3D,maxDistance:Number,globalParallelDir:Vector3,shadowMapTextureSize:Number,numberOfPSSM:Number,PCFType:Number):void{}
		public function setPCFType(PCFtype:Number):void{}
		public function getPCFType():Number{
			return null;
		}
		public function setFarDistance(value:Number):void{}
		public function getFarDistance():Number{
			return null;
		}
		public var shadowMapCount:Number;
		private var _beginSampler:*;
		public function calcSplitFrustum(sceneCamera:BaseCamera):void{}

		/**
		 * 计算两个矩阵的乘法
		 * @param left left矩阵
		 * @param right right矩阵
		 * @param out 输出矩阵
		 */
		public static function multiplyMatrixOutFloat32Array(left:Matrix4x4,right:Matrix4x4,out:Float32Array):void{}
		public function setShadowMapTextureSize(size:Number):void{}
		public function disposeAllRenderTarget():void{}
	}

}
