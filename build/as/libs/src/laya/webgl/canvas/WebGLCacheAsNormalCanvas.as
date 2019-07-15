/*[IF-FLASH]*/
package laya.webgl.canvas {
	improt laya.display.Sprite;
	improt laya.maths.Matrix;
	improt laya.resource.Context;
	public class WebGLCacheAsNormalCanvas {
		public var submitStartPos:Number;
		public var submitEndPos:Number;
		public var context:Context;
		public var touches:Array;
		public var submits:Array;
		public var sprite:Sprite;
		private var _pathMesh:*;
		private var _triangleMesh:*;
		public var meshlist:Array;
		private var _oldMesh:*;
		private var _oldPathMesh:*;
		private var _oldTriMesh:*;
		private var _oldMeshList:*;
		private var cachedClipInfo:*;
		private var oldTx:*;
		private var oldTy:*;
		private static var matI:*;
		public var invMat:Matrix;

		public function WebGLCacheAsNormalCanvas(ctx:Context,sp:Sprite){}
		public function startRec():void{}
		public function endRec():void{}
		public function isCacheValid():Boolean{}
		public function flushsubmit():void{}
		public function releaseMem():void{}
	}

}
