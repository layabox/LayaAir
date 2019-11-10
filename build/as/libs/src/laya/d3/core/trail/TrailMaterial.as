package laya.d3.core.trail {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.core.material.Material;
	import laya.d3.shader.ShaderDefine;

	/**
	 * <code>TrailMaterial</code> 类用于实现拖尾材质。
	 */
	public class TrailMaterial extends Material {

		/**
		 * 渲染状态_透明混合。
		 */
		public static var RENDERMODE_ALPHABLENDED:Number;

		/**
		 * 渲染状态_加色法混合。
		 */
		public static var RENDERMODE_ADDTIVE:Number;

		/**
		 * 默认材质，禁止修改
		 */
		public static var defaultMaterial:TrailMaterial;
		public static var SHADERDEFINE_MAINTEXTURE:ShaderDefine;
		public static var SHADERDEFINE_TILINGOFFSET:ShaderDefine;
		public static var SHADERDEFINE_ADDTIVEFOG:ShaderDefine;
		public static var MAINTEXTURE:Number;
		public static var TINTCOLOR:Number;
		public static var TILINGOFFSET:Number;
		public static var CULL:Number;
		public static var BLEND:Number;
		public static var BLEND_SRC:Number;
		public static var BLEND_DST:Number;
		public static var DEPTH_TEST:Number;
		public static var DEPTH_WRITE:Number;

		/**
		 * 设置渲染模式。
		 * @return 渲染模式。
		 */
		public var renderMode:Number;

		/**
		 * 获取颜色R分量。
		 * @return 颜色R分量。
		 */

		/**
		 * 设置颜色R分量。
		 * @param value 颜色R分量。
		 */
		public var colorR:Number;

		/**
		 * 获取颜色G分量。
		 * @return 颜色G分量。
		 */

		/**
		 * 设置颜色G分量。
		 * @param value 颜色G分量。
		 */
		public var colorG:Number;

		/**
		 * 获取颜色B分量。
		 * @return 颜色B分量。
		 */

		/**
		 * 设置颜色B分量。
		 * @param value 颜色B分量。
		 */
		public var colorB:Number;

		/**
		 * 获取颜色Z分量。
		 * @return 颜色Z分量。
		 */

		/**
		 * 设置颜色alpha分量。
		 * @param value 颜色alpha分量。
		 */
		public var colorA:Number;

		/**
		 * 获取颜色。
		 * @return 颜色。
		 */

		/**
		 * 设置颜色。
		 * @param value 颜色。
		 */
		public var color:Vector4;

		/**
		 * 获取贴图。
		 * @return 贴图。
		 */

		/**
		 * 设置贴图。
		 * @param value 贴图。
		 */
		public var texture:BaseTexture;

		/**
		 * 获取纹理平铺和偏移X分量。
		 * @return 纹理平铺和偏移X分量。
		 */

		/**
		 * 获取纹理平铺和偏移X分量。
		 * @param x 纹理平铺和偏移X分量。
		 */
		public var tilingOffsetX:Number;

		/**
		 * 获取纹理平铺和偏移Y分量。
		 * @return 纹理平铺和偏移Y分量。
		 */

		/**
		 * 获取纹理平铺和偏移Y分量。
		 * @param y 纹理平铺和偏移Y分量。
		 */
		public var tilingOffsetY:Number;

		/**
		 * 获取纹理平铺和偏移Z分量。
		 * @return 纹理平铺和偏移Z分量。
		 */

		/**
		 * 获取纹理平铺和偏移Z分量。
		 * @param z 纹理平铺和偏移Z分量。
		 */
		public var tilingOffsetZ:Number;

		/**
		 * 获取纹理平铺和偏移W分量。
		 * @return 纹理平铺和偏移W分量。
		 */

		/**
		 * 获取纹理平铺和偏移W分量。
		 * @param w 纹理平铺和偏移W分量。
		 */
		public var tilingOffsetW:Number;

		/**
		 * 获取纹理平铺和偏移。
		 * @return 纹理平铺和偏移。
		 */

		/**
		 * 设置纹理平铺和偏移。
		 * @param value 纹理平铺和偏移。
		 */
		public var tilingOffset:Vector4;

		/**
		 * 设置是否写入深度。
		 * @param value 是否写入深度。
		 */

		/**
		 * 获取是否写入深度。
		 * @return 是否写入深度。
		 */
		public var depthWrite:Boolean;

		/**
		 * 设置剔除方式。
		 * @param value 剔除方式。
		 */

		/**
		 * 获取剔除方式。
		 * @return 剔除方式。
		 */
		public var cull:Number;

		/**
		 * 设置混合方式。
		 * @param value 混合方式。
		 */

		/**
		 * 获取混合方式。
		 * @return 混合方式。
		 */
		public var blend:Number;

		/**
		 * 设置混合源。
		 * @param value 混合源
		 */

		/**
		 * 获取混合源。
		 * @return 混合源。
		 */
		public var blendSrc:Number;

		/**
		 * 设置混合目标。
		 * @param value 混合目标
		 */

		/**
		 * 获取混合目标。
		 * @return 混合目标。
		 */
		public var blendDst:Number;

		/**
		 * 设置深度测试方式。
		 * @param value 深度测试方式
		 */

		/**
		 * 获取深度测试方式。
		 * @return 深度测试方式。
		 */
		public var depthTest:Number;

		public function TrailMaterial(){}

		/**
		 * @inheritdoc 
		 * @override 
		 */
		override public function clone():*{}
	}

}
