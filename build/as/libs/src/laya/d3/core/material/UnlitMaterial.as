package laya.d3.core.material {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.shader.ShaderDefine;
	import laya.d3.core.material.Material;

	/**
	 * <code>UnlitMaterial</code> 类用于实现不受光照影响的材质。
	 */
	public class UnlitMaterial extends Material {

		/**
		 * 渲染状态_不透明。
		 */
		public static var RENDERMODE_OPAQUE:Number;

		/**
		 * 渲染状态_阿尔法测试。
		 */
		public static var RENDERMODE_CUTOUT:Number;

		/**
		 * 渲染状态__透明混合。
		 */
		public static var RENDERMODE_TRANSPARENT:Number;

		/**
		 * 渲染状态__加色法混合。
		 */
		public static var RENDERMODE_ADDTIVE:Number;
		public static var SHADERDEFINE_ALBEDOTEXTURE:ShaderDefine;
		public static var SHADERDEFINE_TILINGOFFSET:ShaderDefine;
		public static var SHADERDEFINE_ENABLEVERTEXCOLOR:ShaderDefine;
		public static var ALBEDOTEXTURE:Number;
		public static var ALBEDOCOLOR:Number;
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
		public static var defaultMaterial:UnlitMaterial;
		private var _albedoColor:*;
		private var _albedoIntensity:*;
		private var _enableVertexColor:*;

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
		 * 反照率贴图。
		 */
		public var albedoTexture:BaseTexture;

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
		 * 是否支持顶点色。
		 */
		public var enableVertexColor:Boolean;

		/**
		 * 渲染模式。
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

		public function UnlitMaterial(){}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}
	}

}
