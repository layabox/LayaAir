package laya.d3.core.material {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.core.material.BaseMaterial;

	/*
	 * <code>UnlitMaterial</code> 类用于实现不受光照影响的材质。
	 */
	public class UnlitMaterial extends BaseMaterial {

		/*
		 * 渲染状态_不透明。
		 */
		public static var RENDERMODE_OPAQUE:Number;

		/*
		 * 渲染状态_阿尔法测试。
		 */
		public static var RENDERMODE_CUTOUT:Number;

		/*
		 * 渲染状态__透明混合。
		 */
		public static var RENDERMODE_TRANSPARENT:Number;

		/*
		 * 渲染状态__加色法混合。
		 */
		public static var RENDERMODE_ADDTIVE:Number;
		public static var SHADERDEFINE_ALBEDOTEXTURE:Number;
		public static var SHADERDEFINE_TILINGOFFSET:Number;
		public static var SHADERDEFINE_ENABLEVERTEXCOLOR:Number;
		public static var ALBEDOTEXTURE:Number;
		public static var ALBEDOCOLOR:Number;
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
		public static var defaultMaterial:UnlitMaterial;
		private var _albedoColor:*;
		private var _albedoIntensity:*;
		private var _enableVertexColor:*;

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
		 * 获取反照率贴图。
		 * @return 反照率贴图。
		 */

		/*
		 * 设置反照率贴图。
		 * @param value 反照率贴图。
		 */
		public var albedoTexture:BaseTexture;

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
		 * 获取是否支持顶点色。
		 * @return 是否支持顶点色。
		 */

		/*
		 * 设置是否支持顶点色。
		 * @param value 是否支持顶点色。
		 */
		public var enableVertexColor:Boolean;

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

		public function UnlitMaterial(){}

		/*
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}
	}

}
