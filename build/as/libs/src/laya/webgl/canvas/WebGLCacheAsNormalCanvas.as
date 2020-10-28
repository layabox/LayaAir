package laya.webgl.canvas {
	import laya.display.Sprite;
	import laya.maths.Matrix;
	import laya.resource.Context;

	/**
	 * 对象 cacheas normal的时候，本质上只是想把submit缓存起来，以后直接执行
	 * 为了避免各种各样的麻烦，这里采用复制相应部分的submit的方法。执行环境还是在原来的context中
	 * 否则包括clip等都非常难以处理
	 */
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

		public function WebGLCacheAsNormalCanvas(ctx:Context = undefined,sp:Sprite = undefined){}
		public function startRec():void{}
		public function endRec():void{}

		/**
		 * 当前缓存是否还有效。例如clip变了就失效了，因为clip太难自动处理
		 * @return 
		 */
		public function isCacheValid():Boolean{
			return null;
		}
		public function flushsubmit():void{}
		public function releaseMem():void{}
	}

}
