/*[IF-FLASH]*/
package laya.d3.shadowMap {
	improt laya.d3.core.BaseCamera;
	improt laya.d3.core.scene.Scene3D;
	improt laya.d3.math.Matrix4x4;
	improt laya.d3.math.Vector3;
	public class ParallelSplitShadowMap {

		public function ParallelSplitShadowMap(){}
		public function setInfo(scene:Scene3D,maxDistance:Number,globalParallelDir:Vector3,shadowMapTextureSize:Number,numberOfPSSM:Number,PCFType:Number):void{}
		public function setPCFType(PCFtype:Number):void{}
		public function getPCFType():Number{}
		public function setFarDistance(value:Number):void{}
		public function getFarDistance():Number{}
		public var shadowMapCount:Number;
		private var _beginSampler:*;
		public function calcSplitFrustum(sceneCamera:BaseCamera):void{}
		public static function multiplyMatrixOutFloat32Array(left:Matrix4x4,right:Matrix4x4,out:Float32Array):void{}
		public function setShadowMapTextureSize(size:Number):void{}
		public function disposeAllRenderTarget():void{}
	}

}
