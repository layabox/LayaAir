/*[IF-FLASH]*/
package laya.d3.core.pixelLine {
	improt laya.d3.math.Vector4;
	improt laya.d3.core.material.BaseMaterial;
	public class PixelLineMaterial extends laya.d3.core.material.BaseMaterial {
		public static var COLOR:Number;
		public static var defaultMaterial:PixelLineMaterial;
		public static var CULL:Number;
		public static var BLEND:Number;
		public static var BLEND_SRC:Number;
		public static var BLEND_DST:Number;
		public static var DEPTH_TEST:Number;
		public static var DEPTH_WRITE:Number;
		public var color:Vector4;
		public var depthWrite:Boolean;
		public var cull:Number;
		public var blend:Number;
		public var blendSrc:Number;
		public var blendDst:Number;
		public var depthTest:Number;

		public function PixelLineMaterial(){}
		public function clone():*{}
	}

}
