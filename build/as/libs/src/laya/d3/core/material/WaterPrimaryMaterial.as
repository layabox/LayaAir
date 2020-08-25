package laya.d3.core.material {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.core.material.Material;
	import laya.d3.shader.ShaderDefine;

	/**
	 * <code>WaterPrimaryMaterial</code> 类用于实现水材质。
	 */
	public class WaterPrimaryMaterial extends Material {
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
		 * 地平线颜色。
		 */
		public function get horizonColor():Vector4{return null;}
		public function set horizonColor(value:Vector4):void{}

		/**
		 * 主贴图。
		 */
		public function get mainTexture():BaseTexture{return null;}
		public function set mainTexture(value:BaseTexture):void{}

		/**
		 * 法线贴图。
		 */
		public function get normalTexture():BaseTexture{return null;}
		public function set normalTexture(value:BaseTexture):void{}

		/**
		 * 波动缩放系数。
		 */
		public function get waveScale():Number{return null;}
		public function set waveScale(value:Number):void{}

		/**
		 * 波动速率。
		 */
		public function get waveSpeed():Vector4{return null;}
		public function set waveSpeed(value:Vector4):void{}

		public function WaterPrimaryMaterial(){}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}
	}

}
