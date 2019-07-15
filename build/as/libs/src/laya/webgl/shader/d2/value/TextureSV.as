/*[IF-FLASH]*/
package laya.webgl.shader.d2.value {
	improt laya.webgl.shader.d2.value.Value2D;
	public class TextureSV extends laya.webgl.shader.d2.value.Value2D {
		public var u_colorMatrix:Array;
		public var strength:Number;
		public var blurInfo:Array;
		public var colorMat:Float32Array;
		public var colorAlpha:Float32Array;

		public function TextureSV(subID:Number = null){}
		public function clear():void{}
	}

}
