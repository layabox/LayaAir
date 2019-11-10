package laya.d3.core.material {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.core.material.Material;
	import laya.d3.shader.ShaderDefine;

	/**
	 * <code>PBRSpecularMaterial</code> 类用于实现PBR(Specular)材质。
	 */
	public class PBRSpecularMaterial extends Material {

		/**
		 * 光滑度数据源_高光贴图的Alpha通道。
		 */
		public static var SmoothnessSource_SpecularTexture_Alpha:Number;

		/**
		 * 光滑度数据源_反射率贴图的Alpha通道。
		 */
		public static var SmoothnessSource_AlbedoTexture_Alpha:Number;

		/**
		 * 渲染状态_不透明。
		 */
		public static var RENDERMODE_OPAQUE:Number;

		/**
		 * 渲染状态_透明测试。
		 */
		public static var RENDERMODE_CUTOUT:Number;

		/**
		 * 渲染状态_透明混合_游戏中经常使用的透明。
		 */
		public static var RENDERMODE_FADE:Number;

		/**
		 * 渲染状态_透明混合_物理上看似合理的透明。
		 */
		public static var RENDERMODE_TRANSPARENT:Number;
		public static var SHADERDEFINE_ALBEDOTEXTURE:ShaderDefine;
		public static var SHADERDEFINE_NORMALTEXTURE:ShaderDefine;
		public static var SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA:ShaderDefine;
		public static var SHADERDEFINE_SPECULARTEXTURE:ShaderDefine;
		public static var SHADERDEFINE_OCCLUSIONTEXTURE:ShaderDefine;
		public static var SHADERDEFINE_PARALLAXTEXTURE:ShaderDefine;
		public static var SHADERDEFINE_EMISSION:ShaderDefine;
		public static var SHADERDEFINE_EMISSIONTEXTURE:ShaderDefine;
		public static var SHADERDEFINE_TILINGOFFSET:ShaderDefine;
		public static var SHADERDEFINE_ALPHAPREMULTIPLY:ShaderDefine;
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

		/**
		 * 默认材质，禁止修改
		 */
		public static var defaultMaterial:PBRSpecularMaterial;

		/**
		 * 反射率颜色R分量。
		 */
		public var albedoColorR:Number;

		/**
		 * 反射率颜色G分量。
		 */
		public var albedoColorG:Number;

		/**
		 * 反射率颜色B分量。
		 */
		public var albedoColorB:Number;

		/**
		 * 反射率颜色A分量。
		 */
		public var albedoColorA:Number;

		/**
		 * 反射率颜色。
		 */
		public var albedoColor:Vector4;

		/**
		 * 漫反射贴图。
		 */
		public var albedoTexture:BaseTexture;

		/**
		 * 法线贴图。
		 */
		public var normalTexture:BaseTexture;

		/**
		 * 法线贴图缩放系数。
		 */
		public var normalTextureScale:Number;

		/**
		 * 视差贴图。
		 */
		public var parallaxTexture:BaseTexture;

		/**
		 * 视差贴图缩放系数。
		 */
		public var parallaxTextureScale:Number;

		/**
		 * 遮挡贴图。
		 */
		public var occlusionTexture:BaseTexture;

		/**
		 * 遮挡贴图强度,范围为0到1。
		 */
		public var occlusionTextureStrength:Number;

		/**
		 * 高光贴图。
		 */
		public var specularTexture:BaseTexture;

		/**
		 * 高光颜色R分量。
		 */
		public var specularColorR:Number;

		/**
		 * 高光颜色G分量。
		 */
		public var specularColorG:Number;

		/**
		 * 高光颜色B分量。
		 */

		/**
		 * 高光颜色B分量。
		 */
		public var specularColorB:Number;

		/**
		 * 高光颜色A分量。
		 */
		public var specularColorA:Number;

		/**
		 * 高光颜色。
		 */
		public var specularColor:Vector4;

		/**
		 * 光滑度,范围为0到1。
		 */
		public var smoothness:Number;

		/**
		 * 光滑度缩放系数,范围为0到1。
		 */
		public var smoothnessTextureScale:Number;

		/**
		 * 光滑度数据源,0或1
		 */
		public var smoothnessSource:Number;

		/**
		 * 是否激活放射属性。
		 */
		public var enableEmission:Boolean;

		/**
		 * 放射颜色。
		 */
		public var emissionColor:Vector4;

		/**
		 * 获取放射贴图。
		 */
		public var emissionTexture:BaseTexture;

		/**
		 * 是否开启反射。
		 */
		public var enableReflection:Boolean;

		/**
		 * 纹理平铺和偏移X分量。
		 */
		public var tilingOffsetX:Number;

		/**
		 * 纹理平铺和偏移Y分量。
		 */
		public var tilingOffsetY:Number;

		/**
		 * 纹理平铺和偏移Z分量。
		 */
		public var tilingOffsetZ:Number;

		/**
		 * 纹理平铺和偏移W分量。
		 */
		public var tilingOffsetW:Number;

		/**
		 * 纹理平铺和偏移。
		 */
		public var tilingOffset:Vector4;

		/**
		 * 设置渲染模式。
		 */
		public var renderMode:Number;

		/**
		 * 是否写入深度。
		 */
		public var depthWrite:Boolean;

		/**
		 * 剔除方式。
		 */
		public var cull:Number;

		/**
		 * 混合方式。
		 */
		public var blend:Number;

		/**
		 * 混合源。
		 */
		public var blendSrc:Number;

		/**
		 * 混合目标。
		 */
		public var blendDst:Number;

		/**
		 * 深度测试方式。
		 */
		public var depthTest:Number;

		/**
		 * 创建一个 <code>PBRSpecularMaterial</code> 实例。
		 */

		public function PBRSpecularMaterial(){}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function cloneTo(destObject:*):void{}
	}

}
