package laya.d3.core.particleShuriKen {
	import laya.d3.core.material.Material;
	import laya.d3.math.Vector4;
	import laya.resource.BaseTexture;
	import laya.d3.shader.ShaderDefine;

	/**
	 * <code>ShurikenParticleMaterial</code> 类用于实现粒子材质。
	 */
	public class ShurikenParticleMaterial extends Material {

		/**
		 * 渲染状态_透明混合。
		 */
		public static var RENDERMODE_ALPHABLENDED:Number;

		/**
		 * 渲染状态_加色法混合。
		 */
		public static var RENDERMODE_ADDTIVE:Number;
		public static var SHADERDEFINE_DIFFUSEMAP:ShaderDefine;
		public static var SHADERDEFINE_TINTCOLOR:ShaderDefine;
		public static var SHADERDEFINE_TILINGOFFSET:ShaderDefine;
		public static var SHADERDEFINE_ADDTIVEFOG:ShaderDefine;
		public static var DIFFUSETEXTURE:Number;
		public static var TINTCOLOR:Number;
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
		public static var defaultMaterial:ShurikenParticleMaterial;

		/**
		 * 渲染模式。
		 */
		public var renderMode:Number;

		/**
		 * 颜色R分量。
		 */
		public var colorR:Number;

		/**
		 * 颜色G分量。
		 */
		public var colorG:Number;

		/**
		 * 颜色B分量。
		 */
		public var colorB:Number;

		/**
		 * 颜色Z分量。
		 */
		public var colorA:Number;

		/**
		 * 颜色。
		 */
		public var color:Vector4;

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
		 * 漫反射贴图。
		 */
		public var texture:BaseTexture;

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

		public function ShurikenParticleMaterial(){}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}
	}

}
