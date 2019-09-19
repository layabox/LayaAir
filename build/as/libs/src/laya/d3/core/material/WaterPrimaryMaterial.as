package laya.d3.core.material {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.core.material.BaseMaterial;
	import laya.d3.shader.ShaderDefine;

	/**
	 * <code>WaterPrimaryMaterial</code> 类用于实现水材质。
	 */
	public class WaterPrimaryMaterial extends BaseMaterial {
		public static var HORIZONCOLOR:Number;
		public static var MAINTEXTURE:Number;
		public static var NORMALTEXTURE:Number;
		public static var WAVESCALE:Number;
		public static var WAVESPEED:Number;
		public static var SHADERDEFINE_MAINTEXTURE:ShaderDefine;
		public static var SHADERDEFINE_NORMALTEXTURE:ShaderDefine;

		/**
		 * 默认材质，禁止修改
		 */
		public static var defaultMaterial:WaterPrimaryMaterial;

		/**
		 * 获取地平线颜色。
		 * @return 地平线颜色。
		 */

		/**
		 * 设置地平线颜色。
		 * @param value 地平线颜色。
		 */
		public var horizonColor:Vector4;

		/**
		 * 获取主贴图。
		 * @return 主贴图。
		 */

		/**
		 * 设置主贴图。
		 * @param value 主贴图。
		 */
		public var mainTexture:BaseTexture;

		/**
		 * 获取法线贴图。
		 * @return 法线贴图。
		 */

		/**
		 * 设置法线贴图。
		 * @param value 法线贴图。
		 */
		public var normalTexture:BaseTexture;

		/**
		 * 获取波动缩放系数。
		 * @return 波动缩放系数。
		 */

		/**
		 * 设置波动缩放系数。
		 * @param value 波动缩放系数。
		 */
		public var waveScale:Number;

		/**
		 * 获取波动速率。
		 * @return 波动速率。
		 */

		/**
		 * 设置波动速率。
		 * @param value 波动速率。
		 */
		public var waveSpeed:Vector4;

		public function WaterPrimaryMaterial(){}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}
	}

}
