/*[IF-FLASH]*/
package laya.d3.math {
	improt laya.d3.math.Matrix4x4;
	improt laya.d3.math.Vector3;
	public class Viewport {
		private static var _tempMatrix4x4:*;
		public var x:Number;
		public var y:Number;
		public var width:Number;
		public var height:Number;
		public var minDepth:Number;
		public var maxDepth:Number;

		public function Viewport(x:Number,y:Number,width:Number,height:Number){}
		public function project(source:Vector3,matrix:Matrix4x4,out:Vector3):void{}
		public function unprojectFromMat(source:Vector3,matrix:Matrix4x4,out:Vector3):void{}
		public function unprojectFromWVP(source:Vector3,projection:Matrix4x4,view:Matrix4x4,world:Matrix4x4,out:Vector3):void{}
		public function cloneTo(out:Viewport):void{}
	}

}
