package laya.d3.core.material {
	import laya.d3.math.Vector4;
	import laya.d3.core.material.BaseMaterial;
	import laya.resource.BaseTexture;

	/*
	 * <code>BlinnPhongMaterial</code> 类用于实现Blinn-Phong材质。
	 */
	public class BlinnPhongMaterial extends BaseMaterial {

		/*
		 * 高光强度数据源_漫反射贴图的Alpha通道。
		 */
		public static var SPECULARSOURCE_DIFFUSEMAPALPHA:Number;

		/*
		 * 高光强度数据源_高光贴图的RGB通道。
		 */
		public static var SPECULARSOURCE_SPECULARMAP:Number;

		/*
		 * 渲染状态_不透明。
		 */
		public static var RENDERMODE_OPAQUE:Number;

		/*
		 * 渲染状态_阿尔法测试。
		 */
		public static var RENDERMODE_CUTOUT:Number;

		/*
		 * 渲染状态_透明混合。
		 */
		public static var RENDERMODE_TRANSPARENT:Number;
		public static var SHADERDEFINE_DIFFUSEMAP:Number;
		public static var SHADERDEFINE_NORMALMAP:Number;
		public static var SHADERDEFINE_SPECULARMAP:Number;
		public static var SHADERDEFINE_TILINGOFFSET:Number;
		public static var SHADERDEFINE_ENABLEVERTEXCOLOR:Number;
		public static var ALBEDOTEXTURE:Number;
		public static var NORMALTEXTURE:Number;
		public static var SPECULARTEXTURE:Number;
		public static var ALBEDOCOLOR:Number;
		public static var MATERIALSPECULAR:Number;
		public static var SHININESS:Number;
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
		public static var defaultMaterial:BlinnPhongMaterial;
		private var _albedoColor:*;
		private var _albedoIntensity:*;
		private var _enableLighting:*;
		private var _enableVertexColor:*;

		/*
		 * 设置渲染模式。
		 * @return 渲染模式。
		 */
		public var renderMode:Number;

		/*
		 * 获取是否支持顶点色。
		 * @return 是否支持顶点色。
		 */

		/*
		 * 设置是否支持顶点色。
		 * @param value 是否支持顶点色。
		 */
		public var enableVertexColor:Boolean;

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
		 * 获取反照率颜色R分量。
		 * @return 反照率颜色R分量。
		 */

		/*
		 * 设置反照率颜色R分量。
		 * @param value 反照率颜色R分量。
		 */
		public var albedoColorR:Number;

		/*
		 * 获取反照率颜色G分量。
		 * @return 反照率颜色G分量。
		 */

		/*
		 * 设置反照率颜色G分量。
		 * @param value 反照率颜色G分量。
		 */
		public var albedoColorG:Number;

		/*
		 * 获取反照率颜色B分量。
		 * @return 反照率颜色B分量。
		 */

		/*
		 * 设置反照率颜色B分量。
		 * @param value 反照率颜色B分量。
		 */
		public var albedoColorB:Number;

		/*
		 * 获取反照率颜色Z分量。
		 * @return 反照率颜色Z分量。
		 */

		/*
		 * 设置反照率颜色alpha分量。
		 * @param value 反照率颜色alpha分量。
		 */
		public var albedoColorA:Number;

		/*
		 * 获取反照率颜色。
		 * @return 反照率颜色。
		 */

		/*
		 * 设置反照率颜色。
		 * @param value 反照率颜色。
		 */
		public var albedoColor:Vector4;

		/*
		 * 获取反照率强度。
		 * @return 反照率强度。
		 */

		/*
		 * 设置反照率强度。
		 * @param value 反照率强度。
		 */
		public var albedoIntensity:Number;

		/*
		 * 获取高光颜色R轴分量。
		 * @return 高光颜色R轴分量。
		 */

		/*
		 * 设置高光颜色R分量。
		 * @param value 高光颜色R分量。
		 */
		public var specularColorR:Number;

		/*
		 * 获取高光颜色G分量。
		 * @return 高光颜色G分量。
		 */

		/*
		 * 设置高光颜色G分量。
		 * @param value 高光颜色G分量。
		 */
		public var specularColorG:Number;

		/*
		 * 获取高光颜色B分量。
		 * @return 高光颜色B分量。
		 */

		/*
		 * 设置高光颜色B分量。
		 * @param value 高光颜色B分量。
		 */
		public var specularColorB:Number;

		/*
		 * 获取高光颜色A分量。
		 * @return 高光颜色A分量。
		 */

		/*
		 * 设置高光颜色A分量。
		 * @param value 高光颜色A分量。
		 */
		public var specularColorA:Number;

		/*
		 * 获取高光颜色。
		 * @return 高光颜色。
		 */

		/*
		 * 设置高光颜色。
		 * @param value 高光颜色。
		 */
		public var specularColor:Vector4;

		/*
		 * 获取高光强度,范围为0到1。
		 * @return 高光强度。
		 */

		/*
		 * 设置高光强度,范围为0到1。
		 * @param value 高光强度。
		 */
		public var shininess:Number;

		/*
		 * 获取反照率贴图。
		 * @return 反照率贴图。
		 */

		/*
		 * 设置反照率贴图。
		 * @param value 反照率贴图。
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
		 * 获取高光贴图。
		 * @return 高光贴图。
		 */

		/*
		 * 设置高光贴图，高光强度则从该贴图RGB值中获取,如果该值为空则从漫反射贴图的Alpha通道获取。
		 * @param value 高光贴图。
		 */
		public var specularTexture:BaseTexture;

		/*
		 * 获取是否启用光照。
		 * @return 是否启用光照。
		 */

		/*
		 * 设置是否启用光照。
		 * @param value 是否启用光照。
		 */
		public var enableLighting:Boolean;

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
		 * 创建一个 <code>BlinnPhongMaterial</code> 实例。
		 */

		public function BlinnPhongMaterial(){}

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
