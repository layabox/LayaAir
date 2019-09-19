package laya.d3.core.material {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.core.material.BaseMaterial;
	import laya.d3.shader.ShaderDefine;

	/**
	 * ...
	 * @author ...
	 */
	public class ExtendTerrainMaterial extends BaseMaterial {

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
		private var _enableLighting:*;

		/**
		 * 获取splatAlpha贴图。
		 * @return splatAlpha贴图。
		 */

		/**
		 * 设置splatAlpha贴图。
		 * @param value splatAlpha贴图。
		 */
		public var splatAlphaTexture:BaseTexture;

		/**
		 * 设置第一层贴图。
		 * @param value 第一层贴图。
		 */
		public var diffuseTexture1:BaseTexture;

		/**
		 * 获取第二层贴图。
		 * @return 第二层贴图。
		 */

		/**
		 * 设置第二层贴图。
		 * @param value 第二层贴图。
		 */
		public var diffuseTexture2:BaseTexture;

		/**
		 * 获取第三层贴图。
		 * @return 第三层贴图。
		 */

		/**
		 * 设置第三层贴图。
		 * @param value 第三层贴图。
		 */
		public var diffuseTexture3:BaseTexture;

		/**
		 * 获取第四层贴图。
		 * @return 第四层贴图。
		 */

		/**
		 * 设置第四层贴图。
		 * @param value 第四层贴图。
		 */
		public var diffuseTexture4:BaseTexture;

		/**
		 * 获取第五层贴图。
		 * @return 第五层贴图。
		 */

		/**
		 * 设置第五层贴图。
		 * @param value 第五层贴图。
		 */
		public var diffuseTexture5:BaseTexture;
		private var _setDetailNum:*;
		public var diffuseScaleOffset1:Vector4;
		public var diffuseScaleOffset2:Vector4;
		public var diffuseScaleOffset3:Vector4;
		public var diffuseScaleOffset4:Vector4;
		public var diffuseScaleOffset5:Vector4;

		/**
		 * 获取是否启用光照。
		 * @return 是否启用光照。
		 */

		/**
		 * 设置是否启用光照。
		 * @param value 是否启用光照。
		 */
		public var enableLighting:Boolean;

		/**
		 * 设置渲染模式。
		 * @return 渲染模式。
		 */
		public var renderMode:Number;

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

		public function ExtendTerrainMaterial(){}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}
	}

}
