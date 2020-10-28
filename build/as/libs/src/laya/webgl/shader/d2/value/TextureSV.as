package laya.webgl.shader.d2.value {
	import laya.webgl.shader.d2.value.Value2D;
	public class TextureSV extends Value2D {
		public var u_colorMatrix:Array;
		public var strength:Number;
		public var blurInfo:Array;
		public var colorMat:Float32Array;
		public var colorAlpha:Float32Array;

		public function TextureSV(subID:Number = undefined){}

		/**
		 * @override 
		 */
		override public function clear():void{}
	}

}
