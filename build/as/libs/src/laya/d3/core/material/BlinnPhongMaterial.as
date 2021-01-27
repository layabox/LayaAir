package laya.d3.core.material {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.math.Vector4;
	import laya.d3.core.material.Material;
	import laya.resource.BaseTexture;

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

		/**
		 * 默认材质，禁止修改
		 */
		public static var defaultMaterial:BlinnPhongMaterial;
		private var _albedoColor:*;
		private var _albedoIntensity:*;
		private var _enableLighting:*;
		private var _enableVertexColor:*;
		public function set _ColorR(value:Number):void{}
		public function set _ColorG(value:Number):void{}
		public function set _ColorB(value:Number):void{}
		public function set _ColorA(value:Number):void{}
		public function set _Color(value:Vector4):void{}
		public function set _SpecColorR(value:Number):void{}
		public function set _SpecColorG(value:Number):void{}
		public function set _SpecColorB(value:Number):void{}
		public function set _SpecColorA(value:Number):void{}
		public function set _SpecColor(value:Vector4):void{}
		public function set _AlbedoIntensity(value:Number):void{}
		public function set _Shininess(value:Number):void{}
		public function set _MainTex_STX(x:Number):void{}
		public function set _MainTex_STY(y:Number):void{}
		public function set _MainTex_STZ(z:Number):void{}
		public function set _MainTex_STW(w:Number):void{}
		public function set _MainTex_ST(value:Vector4):void{}
		public function set _Cutoff(value:Number):void{}

		/**
		 * 设置渲染模式。
		 * @param 渲染模式 
		 */
		public function set renderMode(value:Number):void{}

		/**
		 * 是否支持顶点色。
		 */
		public function get enableVertexColor():Boolean{return null;}
		public function set enableVertexColor(value:Boolean):void{}

		/**
		 * 纹理平铺和偏移X分量。
		 */
		public function get tilingOffsetX():Number{return null;}
		public function set tilingOffsetX(x:Number):void{}

		/**
		 * 纹理平铺和偏移Y分量。
		 */
		public function get tilingOffsetY():Number{return null;}
		public function set tilingOffsetY(y:Number):void{}

		/**
		 * 纹理平铺和偏移Z分量。
		 */
		public function get tilingOffsetZ():Number{return null;}
		public function set tilingOffsetZ(z:Number):void{}

		/**
		 * 纹理平铺和偏移W分量。
		 */
		public function get tilingOffsetW():Number{return null;}
		public function set tilingOffsetW(w:Number):void{}

		/**
		 * 纹理平铺和偏移。
		 */
		public function get tilingOffset():Vector4{return null;}
		public function set tilingOffset(value:Vector4):void{}

		/**
		 * 反照率颜色R分量。
		 */
		public function get albedoColorR():Number{return null;}
		public function set albedoColorR(value:Number):void{}

		/**
		 * 反照率颜色G分量。
		 */
		public function get albedoColorG():Number{return null;}
		public function set albedoColorG(value:Number):void{}

		/**
		 * 反照率颜色B分量。
		 */
		public function get albedoColorB():Number{return null;}
		public function set albedoColorB(value:Number):void{}

		/**
		 * 反照率颜色Z分量。
		 */
		public function get albedoColorA():Number{return null;}
		public function set albedoColorA(value:Number):void{}

		/**
		 * 反照率颜色。
		 */
		public function get albedoColor():Vector4{return null;}
		public function set albedoColor(value:Vector4):void{}

		/**
		 * 反照率强度。
		 */
		public function get albedoIntensity():Number{return null;}
		public function set albedoIntensity(value:Number):void{}

		/**
		 * 高光颜色R轴分量。
		 */
		public function get specularColorR():Number{return null;}
		public function set specularColorR(value:Number):void{}

		/**
		 * 高光颜色G分量。
		 */
		public function get specularColorG():Number{return null;}
		public function set specularColorG(value:Number):void{}

		/**
		 * 高光颜色B分量。
		 */
		public function get specularColorB():Number{return null;}
		public function set specularColorB(value:Number):void{}

		/**
		 * 高光颜色A分量。
		 */
		public function get specularColorA():Number{return null;}
		public function set specularColorA(value:Number):void{}

		/**
		 * 高光颜色。
		 */
		public function get specularColor():Vector4{return null;}
		public function set specularColor(value:Vector4):void{}

		/**
		 * 高光强度,范围为0到1。
		 */
		public function get shininess():Number{return null;}
		public function set shininess(value:Number):void{}

		/**
		 * 反照率贴图。
		 */
		public function get albedoTexture():BaseTexture{return null;}
		public function set albedoTexture(value:BaseTexture):void{}

		/**
		 * 法线贴图。
		 */
		public function get normalTexture():BaseTexture{return null;}
		public function set normalTexture(value:BaseTexture):void{}

		/**
		 * 高光贴图。
		 */
		public function get specularTexture():BaseTexture{return null;}
		public function set specularTexture(value:BaseTexture):void{}

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
