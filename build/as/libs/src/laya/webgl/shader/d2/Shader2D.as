package laya.webgl.shader.d2 {
	import laya.webgl.shader.d2.ShaderDefines2D;
	import laya.webgl.canvas.DrawStyle;
	import laya.webgl.shader.Shader;
	public class Shader2D {
		public var ALPHA:Number;
		public var shader:Shader;
		public var filters:Array;
		public var defines:ShaderDefines2D;
		public var shaderType:Number;
		public var colorAdd:Array;
		public var fillStyle:DrawStyle;
		public var strokeStyle:DrawStyle;
		public function destroy():void{}
		public static function __init__():void{}
	}

}
