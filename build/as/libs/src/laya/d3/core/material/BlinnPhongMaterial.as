package laya.d3.core.material {
	import laya.d3.math.Vector4;
	import laya.d3.core.material.Material;
	import laya.resource.BaseTexture;
	import laya.d3.shader.ShaderDefine;

	/**
	 * <code>BlinnPhongMaterial</code> 类用于实现Blinn-Phong材质。
	 */
	public class BlinnPhongMaterial extends Material {

		/**
		 * 高光强度数据源_漫反射贴图的Alpha通道。
		 */
		public static var SPECULARSOURCE_DIFFUSEMAPALPHA:Number;

		/**
		 * 高光强度数据源_高光贴图的RGB通道。
		 */
		public static var SPECULARSOURCE_SPECULARMAP:Number;

		/**
		 * 渲染状态_不透明。
		 */
		public static var RENDERMODE_OPAQUE:Number;

		/**
		 * 渲染状态_阿尔法测试。
		 */
		public static var RENDERMODE_CUTOUT:Number;

		/**
		 * 渲染状态_透明混合。
		 */
		public static var RENDERMODE_TRANSPARENT:Number;
		public static var SHADERDEFINE_DIFFUSEMAP:ShaderDefine;
		public static var SHADERDEFINE_NORMALMAP:ShaderDefine;
		public static var SHADERDEFINE_SPECULARMAP:ShaderDefine;
		public static var SHADERDEFINE_TILINGOFFSET:ShaderDefine;
		public static var SHADERDEFINE_ENABLEVERTEXCOLOR:ShaderDefine;
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

		/**
		 * 默认材质，禁止修改
		 */
		public static var defaultMaterial:BlinnPhongMaterial;
		private var _albedoColor:*;
		private var _albedoIntensity:*;
		private var _enableLighting:*;
		private var _enableVertexColor:*;

		/**
		 * 设置渲染模式。
		 */
		public var renderMode:Number;

		/**
		 * 是否支持顶点色。
		 */
		public var enableVertexColor:Boolean;

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
		 * 反照率颜色R分量。
		 */
		public var albedoColorR:Number;

		/**
		 * 反照率颜色G分量。
		 */
		public var albedoColorG:Number;

		/**
		 * 反照率颜色B分量。
		 */
		public var albedoColorB:Number;

		/**
		 * 反照率颜色Z分量。
		 */
		public var albedoColorA:Number;

		/**
		 * 反照率颜色。
		 */
		public var albedoColor:Vector4;

		/**
		 * 反照率强度。
		 */
		public var albedoIntensity:Number;

		/**
		 * 高光颜色R轴分量。
		 */
		public var specularColorR:Number;

		/**
		 * 高光颜色G分量。
		 */
		public var specularColorG:Number;

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
		 * 高光强度,范围为0到1。
		 */
		public var shininess:Number;

		/**
		 * 反照率贴图。
		 */
		public var albedoTexture:BaseTexture;

		/**
		 * 法线贴图。
		 */
		public var normalTexture:BaseTexture;

		/**
		 * 高光贴图。
		 */
		public var specularTexture:BaseTexture;

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
		 * 创建一个 <code>BlinnPhongMaterial</code> 实例。
		 */

		public function BlinnPhongMaterial(){}

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
