/*[IF-FLASH]*/
package laya.d3.core.material {
	improt laya.resource.BaseTexture;
	improt laya.d3.math.Vector4;
	improt laya.d3.core.material.BaseMaterial;
	public class PBRSpecularMaterial extends laya.d3.core.material.BaseMaterial {
		public static var SmoothnessSource_SpecularTexture_Alpha:Number;
		public static var SmoothnessSource_AlbedoTexture_Alpha:Number;
		public static var RENDERMODE_OPAQUE:Number;
		public static var RENDERMODE_CUTOUT:Number;
		public static var RENDERMODE_FADE:Number;
		public static var RENDERMODE_TRANSPARENT:Number;
		public static var SHADERDEFINE_ALBEDOTEXTURE:Number;
		public static var SHADERDEFINE_NORMALTEXTURE:Number;
		public static var SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA:Number;
		public static var SHADERDEFINE_SPECULARTEXTURE:Number;
		public static var SHADERDEFINE_OCCLUSIONTEXTURE:Number;
		public static var SHADERDEFINE_PARALLAXTEXTURE:Number;
		public static var SHADERDEFINE_EMISSION:Number;
		public static var SHADERDEFINE_EMISSIONTEXTURE:Number;
		public static var SHADERDEFINE_TILINGOFFSET:Number;
		public static var SHADERDEFINE_ALPHAPREMULTIPLY:Number;
		public static var ALBEDOTEXTURE:Number;
		public static var SPECULARTEXTURE:Number;
		public static var NORMALTEXTURE:Number;
		public static var PARALLAXTEXTURE:Number;
		public static var OCCLUSIONTEXTURE:Number;
		public static var EMISSIONTEXTURE:Number;
		public static var ALBEDOCOLOR:Number;
		public static var SPECULARCOLOR:Number;
		public static var EMISSIONCOLOR:Number;
		public static var SMOOTHNESS:Number;
		public static var SMOOTHNESSSCALE:Number;
		public static var SMOOTHNESSSOURCE:Number;
		public static var OCCLUSIONSTRENGTH:Number;
		public static var NORMALSCALE:Number;
		public static var PARALLAXSCALE:Number;
		public static var ENABLEEMISSION:Number;
		public static var ENABLEREFLECT:Number;
		public static var TILINGOFFSET:Number;
		public static var CULL:Number;
		public static var BLEND:Number;
		public static var BLEND_SRC:Number;
		public static var BLEND_DST:Number;
		public static var DEPTH_TEST:Number;
		public static var DEPTH_WRITE:Number;
		public static var defaultMaterial:PBRSpecularMaterial;
		private var _albedoColor:*;
		private var _specularColor:*;
		private var _emissionColor:*;
		public var albedoColorR:Number;
		public var albedoColorG:Number;
		public var albedoColorB:Number;
		public var albedoColorA:Number;
		public var albedoColor:Vector4;
		public var albedoTexture:BaseTexture;
		public var normalTexture:BaseTexture;
		public var normalTextureScale:Number;
		public var parallaxTexture:BaseTexture;
		public var parallaxTextureScale:Number;
		public var occlusionTexture:BaseTexture;
		public var occlusionTextureStrength:Number;
		public var specularTexture:BaseTexture;
		public var specularColorR:Number;
		public var specularColorG:Number;
		public var specularColorB:Number;
		public var specularColorA:Number;
		public var specularColor:Vector4;
		public var smoothness:Number;
		public var smoothnessTextureScale:Number;
		public var smoothnessSource:Number;
		public var enableEmission:Boolean;
		public var emissionColor:Vector4;
		public var emissionTexture:BaseTexture;
		public var enableReflection:Boolean;
		public var tilingOffsetX:Number;
		public var tilingOffsetY:Number;
		public var tilingOffsetZ:Number;
		public var tilingOffsetW:Number;
		public var tilingOffset:Vector4;
		public var renderMode:Number;
		public var depthWrite:Boolean;
		public var cull:Number;
		public var blend:Number;
		public var blendSrc:Number;
		public var blendDst:Number;
		public var depthTest:Number;

		public function PBRSpecularMaterial(){}
		public function clone():*{}
		public function cloneTo(destObject:*):void{}
	}

}
