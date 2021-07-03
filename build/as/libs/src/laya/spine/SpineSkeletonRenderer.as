package laya.spine {
	import laya.spine.SpineSkeleton;
	import laya.spine.SpineSkeleton;
	public class SpineSkeletonRenderer {
		public static var QUAD_TRIANGLES:Array;
		public var premultipliedAlpha:Boolean;
		public var vertexEffect:spine.VertexEffect;
		private var tempColor:*;
		private var tempColor2:*;
		private var vertices:*;
		private var vertexSize:*;
		private var twoColorTint:*;
		private var renderable:*;
		private var clipper:*;
		private var temp:*;
		private var temp2:*;
		private var temp3:*;
		private var temp4:*;

		public function SpineSkeletonRenderer(twoColorTint:Boolean = undefined){}
		public function draw(skeleton:*,slotRangeStart:Number,slotRangeEnd:Number,spineSkeletonIns:SpineSkeleton,textureList:*):void{}
	}

}
