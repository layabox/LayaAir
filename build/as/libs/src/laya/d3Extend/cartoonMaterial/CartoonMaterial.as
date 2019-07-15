/*[IF-FLASH]*/
package laya.d3Extend.cartoonMaterial {
	improt laya.d3.core.material.BaseMaterial;
	improt laya.d3.math.Vector4;
	improt laya.d3.shader.ShaderDefines;
	improt laya.resource.BaseTexture;
	public class CartoonMaterial extends laya.d3.core.material.BaseMaterial {
		public static var ALBEDOTEXTURE:Number;
		public static var BLENDTEXTURE:Number;
		public static var OUTLINETEXTURE:Number;
		public static var SHADOWCOLOR:Number;
		public static var SHADOWRANGE:Number;
		public static var SHADOWINTENSITY:Number;
		public static var SPECULARRANGE:Number;
		public static var SPECULARINTENSITY:Number;
		public static var OUTLINEWIDTH:Number;
		public static var OUTLINELIGHTNESS:Number;
		public static var TILINGOFFSET:Number;
		public static var SHADERDEFINE_ALBEDOTEXTURE:Number;
		public static var SHADERDEFINE_BLENDTEXTURE:Number;
		public static var SHADERDEFINE_OUTLINETEXTURE:Number;
		public static var SHADERDEFINE_TILINGOFFSET:Number;
		public static var shaderDefines:ShaderDefines;
		public static function __init__():void{}
		public static function initShader():void{}
		public var albedoTexture:BaseTexture;
		public var blendTexture:BaseTexture;
		public var outlineTexture:BaseTexture;
		public var shadowColor:Vector4;
		public var shadowRange:Number;
		public var shadowIntensity:Number;
		public var specularRange:Number;
		public var specularIntensity:Number;
		public var outlineWidth:Number;
		public var outlineLightness:Number;
		public var tilingOffset:Vector4;

		public function CartoonMaterial(){}
		public function clone():*{}
	}

}
