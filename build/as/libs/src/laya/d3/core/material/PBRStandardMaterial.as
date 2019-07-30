package laya.d3.core.material {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.core.material.BaseMaterial;

	/*
	 * <code>PBRStandardMaterial</code> 类用于实现PBR(Standard)材质。
	 */
	public class PBRStandardMaterial extends laya.d3.core.material.BaseMaterial {

		/*
		 * 光滑度数据源_金属度贴图的Alpha通道。
		 */
		public static var SmoothnessSource_MetallicGlossTexture_Alpha:Number;

		/*
		 * 光滑度数据源_反射率贴图的Alpha通道。
		 */
		public static var SmoothnessSource_AlbedoTexture_Alpha:Number;

		/*
		 * 渲染状态_不透明。
		 */
		public static var RENDERMODE_OPAQUE:Number;

		/*
		 * 渲染状态_透明测试。
		 */
		public static var RENDERMODE_CUTOUT:Number;

		/*
		 * 渲染状态_透明混合_游戏中经常使用的透明。
		 */
		public static var RENDERMODE_FADE:Number;

		/*
		 * 渲染状态_透明混合_物理上看似合理的透明。
		 */
		public static var RENDERMODE_TRANSPARENT:Number;
		public static var SHADERDEFINE_ALBEDOTEXTURE:Number;
		public static var SHADERDEFINE_NORMALTEXTURE:Number;
		public static var SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA:Number;
		public static var SHADERDEFINE_METALLICGLOSSTEXTURE:Number;
		public static var SHADERDEFINE_OCCLUSIONTEXTURE:Number;
		public static var SHADERDEFINE_PARALLAXTEXTURE:Number;
		public static var SHADERDEFINE_EMISSION:Number;
		public static var SHADERDEFINE_EMISSIONTEXTURE:Number;
		public static var SHADERDEFINE_REFLECTMAP:Number;
		public static var SHADERDEFINE_TILINGOFFSET:Number;
		public static var SHADERDEFINE_ALPHAPREMULTIPLY:Number;
		public static var ALBEDOTEXTURE:Number;
		public static var METALLICGLOSSTEXTURE:Number;
		public static var NORMALTEXTURE:Number;
		public static var PARALLAXTEXTURE:Number;
		public static var OCCLUSIONTEXTURE:Number;
		public static var EMISSIONTEXTURE:Number;
		public static var ALBEDOCOLOR:Number;
		public static var EMISSIONCOLOR:Number;
		public static var METALLIC:Number;
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

		/*
		 * 默认材质，禁止修改
		 */
		public static var defaultMaterial:PBRStandardMaterial;
		private var _albedoColor:*;
		private var _emissionColor:*;

		/*
		 * 获取反射率颜色R分量。
		 * @return 反射率颜色R分量。
		 */

		/*
		 * 设置反射率颜色R分量。
		 * @param value 反射率颜色R分量。
		 */
		public var albedoColorR:Number;

		/*
		 * 获取反射率颜色G分量。
		 * @return 反射率颜色G分量。
		 */

		/*
		 * 设置反射率颜色G分量。
		 * @param value 反射率颜色G分量。
		 */
		public var albedoColorG:Number;

		/*
		 * 获取反射率颜色B分量。
		 * @return 反射率颜色B分量。
		 */

		/*
		 * 设置反射率颜色B分量。
		 * @param value 反射率颜色B分量。
		 */
		public var albedoColorB:Number;

		/*
		 * 获取反射率颜色Z分量。
		 * @return 反射率颜色Z分量。
		 */

		/*
		 * 设置反射率颜色alpha分量。
		 * @param value 反射率颜色alpha分量。
		 */
		public var albedoColorA:Number;

		/*
		 * 获取漫反射颜色。
		 * @return 漫反射颜色。
		 */

		/*
		 * 设置漫反射颜色。
		 * @param value 漫反射颜色。
		 */
		public var albedoColor:Vector4;

		/*
		 * 获取漫反射贴图。
		 * @return 漫反射贴图。
		 */

		/*
		 * 设置漫反射贴图。
		 * @param value 漫反射贴图。
		 */
		public var albedoTexture:BaseTexture;

		/*
		 * 获取法线贴图。
		 * @return 法线贴图。
		 */

		/*
		 * 设置法线贴图。
		 * @param value 法线贴图。
		 */
		public var normalTexture:BaseTexture;

		/*
		 * 获取法线贴图缩放系数。
		 * @return 法线贴图缩放系数。
		 */

		/*
		 * 设置法线贴图缩放系数。
		 * @param value 法线贴图缩放系数。
		 */
		public var normalTextureScale:Number;

		/*
		 * 获取视差贴图。
		 * @return 视察贴图。
		 */

		/*
		 * 设置视差贴图。
		 * @param value 视察贴图。
		 */
		public var parallaxTexture:BaseTexture;

		/*
		 * 获取视差贴图缩放系数。
		 * @return 视差缩放系数。
		 */

		/*
		 * 设置视差贴图缩放系数。
		 * @param value 视差缩放系数。
		 */
		public var parallaxTextureScale:Number;

		/*
		 * 获取遮挡贴图。
		 * @return 遮挡贴图。
		 */

		/*
		 * 设置遮挡贴图。
		 * @param value 遮挡贴图。
		 */
		public var occlusionTexture:BaseTexture;

		/*
		 * 获取遮挡贴图强度。
		 * @return 遮挡贴图强度,范围为0到1。
		 */

		/*
		 * 设置遮挡贴图强度。
		 * @param value 遮挡贴图强度,范围为0到1。
		 */
		public var occlusionTextureStrength:Number;

		/*
		 * 获取金属光滑度贴图。
		 * @return 金属光滑度贴图。
		 */

		/*
		 * 设置金属光滑度贴图。
		 * @param value 金属光滑度贴图。
		 */
		public var metallicGlossTexture:BaseTexture;

		/*
		 * 获取金属度。
		 * @return 金属度,范围为0到1。
		 */

		/*
		 * 设置金属度。
		 * @param value 金属度,范围为0到1。
		 */
		public var metallic:Number;

		/*
		 * 获取光滑度。
		 * @return 光滑度,范围为0到1。
		 */

		/*
		 * 设置光滑度。
		 * @param value 光滑度,范围为0到1。
		 */
		public var smoothness:Number;

		/*
		 * 获取光滑度缩放系数。
		 * @return 光滑度缩放系数,范围为0到1。
		 */

		/*
		 * 设置光滑度缩放系数。
		 * @param value 光滑度缩放系数,范围为0到1。
		 */
		public var smoothnessTextureScale:Number;

		/*
		 * 获取光滑度数据源
		 * @return 光滑滑度数据源,0或1。
		 */

		/*
		 * 设置光滑度数据源。
		 * @param value 光滑滑度数据源,0或1。
		 */
		public var smoothnessSource:Number;

		/*
		 * 获取是否激活放射属性。
		 * @return 是否激活放射属性。
		 */

		/*
		 * 设置是否激活放射属性。
		 * @param value 是否激活放射属性
		 */
		public var enableEmission:Boolean;

		/*
		 * 获取放射颜色R分量。
		 * @return 放射颜色R分量。
		 */

		/*
		 * 设置放射颜色R分量。
		 * @param value 放射颜色R分量。
		 */
		public var emissionColorR:Number;

		/*
		 * 获取放射颜色G分量。
		 * @return 放射颜色G分量。
		 */

		/*
		 * 设置放射颜色G分量。
		 * @param value 放射颜色G分量。
		 */
		public var emissionColorG:Number;

		/*
		 * 获取放射颜色B分量。
		 * @return 放射颜色B分量。
		 */

		/*
		 * 设置放射颜色B分量。
		 * @param value 放射颜色B分量。
		 */
		public var emissionColorB:Number;

		/*
		 * 获取放射颜色A分量。
		 * @return 放射颜色A分量。
		 */

		/*
		 * 设置放射颜色A分量。
		 * @param value 放射颜色A分量。
		 */
		public var emissionColorA:Number;

		/*
		 * 获取放射颜色。
		 * @return 放射颜色。
		 */

		/*
		 * 设置放射颜色。
		 * @param value 放射颜色。
		 */
		public var emissionColor:Vector4;

		/*
		 * 获取放射贴图。
		 * @return 放射贴图。
		 */

		/*
		 * 设置放射贴图。
		 * @param value 放射贴图。
		 */
		public var emissionTexture:BaseTexture;

		/*
		 * 获取是否开启反射。
		 * @return 是否开启反射。
		 */

		/*
		 * 设置是否开启反射。
		 * @param value 是否开启反射。
		 */
		public var enableReflection:Boolean;

		/*
		 * 获取纹理平铺和偏移X分量。
		 * @return 纹理平铺和偏移X分量。
		 */

		/*
		 * 获取纹理平铺和偏移X分量。
		 * @param x 纹理平铺和偏移X分量。
		 */
		public var tilingOffsetX:Number;

		/*
		 * 获取纹理平铺和偏移Y分量。
		 * @return 纹理平铺和偏移Y分量。
		 */

		/*
		 * 获取纹理平铺和偏移Y分量。
		 * @param y 纹理平铺和偏移Y分量。
		 */
		public var tilingOffsetY:Number;

		/*
		 * 获取纹理平铺和偏移Z分量。
		 * @return 纹理平铺和偏移Z分量。
		 */

		/*
		 * 获取纹理平铺和偏移Z分量。
		 * @param z 纹理平铺和偏移Z分量。
		 */
		public var tilingOffsetZ:Number;

		/*
		 * 获取纹理平铺和偏移W分量。
		 * @return 纹理平铺和偏移W分量。
		 */

		/*
		 * 获取纹理平铺和偏移W分量。
		 * @param w 纹理平铺和偏移W分量。
		 */
		public var tilingOffsetW:Number;

		/*
		 * 获取纹理平铺和偏移。
		 * @return 纹理平铺和偏移。
		 */

		/*
		 * 获取纹理平铺和偏移。
		 * @param value 纹理平铺和偏移。
		 */
		public var tilingOffset:Vector4;

		/*
		 * 设置渲染模式。
		 * @return 渲染模式。
		 */
		public var renderMode:Number;

		/*
		 * 设置是否写入深度。
		 * @param value 是否写入深度。
		 */

		/*
		 * 获取是否写入深度。
		 * @return 是否写入深度。
		 */
		public var depthWrite:Boolean;

		/*
		 * 设置剔除方式。
		 * @param value 剔除方式。
		 */

		/*
		 * 获取剔除方式。
		 * @return 剔除方式。
		 */
		public var cull:Number;

		/*
		 * 设置混合方式。
		 * @param value 混合方式。
		 */

		/*
		 * 获取混合方式。
		 * @return 混合方式。
		 */
		public var blend:Number;

		/*
		 * 设置混合源。
		 * @param value 混合源
		 */

		/*
		 * 获取混合源。
		 * @return 混合源。
		 */
		public var blendSrc:Number;

		/*
		 * 设置混合目标。
		 * @param value 混合目标
		 */

		/*
		 * 获取混合目标。
		 * @return 混合目标。
		 */
		public var blendDst:Number;

		/*
		 * 设置深度测试方式。
		 * @param value 深度测试方式
		 */

		/*
		 * 获取深度测试方式。
		 * @return 深度测试方式。
		 */
		public var depthTest:Number;

		/*
		 * 创建一个 <code>PBRStandardMaterial</code> 实例。
		 */

		public function PBRStandardMaterial(){}

		/*
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}

		/*
		 * @inheritDoc 
		 * @override 
		 */
		override public function cloneTo(destObject:*):void{}
	}

}
