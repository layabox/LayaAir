package laya.webgl.canvas {
	public class Path {
		public var paths:Array;
		private var _curPath:*;

		public function Path(){}
		public function beginPath(convex:Boolean):void{}
		public function closePath():void{}
		public function newPath():void{}
		public function addPoint(pointX:Number,pointY:Number):void{}
		public function push(points:Array,convex:Boolean):void{}
		public function reset():void{}
	}

}
