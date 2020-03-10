package laya.d3.core.material {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.core.material.Material;
	import laya.d3.shader.ShaderDefine;

	/**
	 * ...
	 * @author ...
	 */
	public class ExtendTerrainMaterial extends Material {

		/**
		 * 渲染状态_不透明。
		 */
		public static var RENDERMODE_OPAQUE:Number;

		/**
		 * 渲染状态_透明混合。
		 */
		public static var RENDERMODE_TRANSPARENT:Number;

		/**
		 * 渲染状态_透明混合。
		 */
		public static var SPLATALPHATEXTURE:Number;
		public static var DIFFUSETEXTURE1:Number;
		public static var DIFFUSETEXTURE2:Number;
		public static var DIFFUSETEXTURE3:Number;
		public static var DIFFUSETEXTURE4:Number;
		public static var DIFFUSETEXTURE5:Number;
		public static var DIFFUSESCALEOFFSET1:Number;
		public static var DIFFUSESCALEOFFSET2:Number;
		public static var DIFFUSESCALEOFFSET3:Number;
		public static var DIFFUSESCALEOFFSET4:Number;
		public static var DIFFUSESCALEOFFSET5:Number;
		public static var CULL:Number;
		public static var BLEND:Number;
		public static var BLEND_SRC:Number;
		public static var BLEND_DST:Number;
		public static var DEPTH_TEST:Number;
		public static var DEPTH_WRITE:Number;

		/**
		 * 地形细节宏定义。
		 */
		public static var SHADERDEFINE_DETAIL_NUM1:ShaderDefine;
		public static var SHADERDEFINE_DETAIL_NUM2:ShaderDefine;
		public static var SHADERDEFINE_DETAIL_NUM3:ShaderDefine;
		public static var SHADERDEFINE_DETAIL_NUM4:ShaderDefine;
		public static var SHADERDEFINE_DETAIL_NUM5:ShaderDefine;

		/**
		 * splatAlpha贴图。
		 */
		public var splatAlphaTexture:BaseTexture;

		/**
		 * 第一层贴图。
		 */
		public var diffuseTexture1:BaseTexture;

		/**
		 * 第二层贴图。
		 */
		public var diffuseTexture2:BaseTexture;

		/**
		 * 第三层贴图。
		 */
		public var diffuseTexture3:BaseTexture;

		/**
		 * 第四层贴图。
		 */
		public var diffuseTexture4:BaseTexture;

		/**
		 * 第五层贴图。
		 */
		public var diffuseTexture5:BaseTexture;

		/**
		 * 第一层贴图缩放偏移。
		 */
		public var diffuseScaleOffset1:Vector4;

		/**
		 * 第二层贴图缩放偏移。
		 */
		public var diffuseScaleOffset2:Vector4;

		/**
		 * 第三层贴图缩放偏移。
		 */
		public var diffuseScaleOffset3:Vector4;

		/**
		 * 第四层贴图缩放偏移。
		 */
		public var diffuseScaleOffset4:Vector4;

		/**
		 * 第五层贴图缩放偏移。
		 */
		public var diffuseScaleOffset5:Vector4;

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

		public function ExtendTerrainMaterial(){}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}
	}

}
