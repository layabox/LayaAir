package laya.d3.core.material {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.core.material.Material;
	import laya.d3.core.material.PBRRenderQuality;

	/**
	 * PBR材质的父类,该类为抽象类。
	 */
	public class PBRMaterial extends Material {

		/**
		 * 渲染质量。
		 */
		public static var renderQuality:PBRRenderQuality;

		/**
		 * @private 
		 */
		public static function __init__():void{}

		/**
		 * 漫反射颜色。
		 */
		public function get albedoColor():Vector4{return null;}
		public function set albedoColor(value:Vector4):void{}

		/**
		 * 漫反射贴图。
		 */
		public function get albedoTexture():BaseTexture{return null;}
		public function set albedoTexture(value:BaseTexture):void{}

		/**
		 * 法线贴图。
		 */
		public function get normalTexture():BaseTexture{return null;}
		public function set normalTexture(value:BaseTexture):void{}

		/**
		 * 法线贴图缩放系数。
		 */
		public function get normalTextureScale():Number{return null;}
		public function set normalTextureScale(value:Number):void{}

		/**
		 * 视差贴图。
		 */
		public function get parallaxTexture():BaseTexture{return null;}
		public function set parallaxTexture(value:BaseTexture):void{}

		/**
		 * 视差贴图缩放系数。
		 */
		public function get parallaxTextureScale():Number{return null;}
		public function set parallaxTextureScale(value:Number):void{}

		/**
		 * 遮挡贴图。
		 */
		public function get occlusionTexture():BaseTexture{return null;}
		public function set occlusionTexture(value:BaseTexture):void{}

		/**
		 * 遮挡贴图强度,范围为0到1。
		 */
		public function get occlusionTextureStrength():Number{return null;}
		public function set occlusionTextureStrength(value:Number):void{}

		/**
		 * 光滑度,范围为0到1。
		 */
		public function get smoothness():Number{return null;}
		public function set smoothness(value:Number):void{}

		/**
		 * 光滑度缩放系数,范围为0到1。
		 */
		public function get smoothnessTextureScale():Number{return null;}
		public function set smoothnessTextureScale(value:Number):void{}

		/**
		 * 是否开启自发光。
		 */
		public function get enableEmission():Boolean{return null;}
		public function set enableEmission(value:Boolean):void{}

		/**
		 * 自发光颜色。
		 */
		public function get emissionColor():Vector4{return null;}
		public function set emissionColor(value:Vector4):void{}

		/**
		 * 自发光贴图。
		 */
		public function get emissionTexture():BaseTexture{return null;}
		public function set emissionTexture(value:BaseTexture):void{}

		/**
		 * 纹理平铺和偏移。
		 */
		public function get tilingOffset():Vector4{return null;}
		public function set tilingOffset(value:Vector4):void{}

		/**
		 * 是否写入深度。
		 */
		public function get depthWrite():Boolean{return null;}
		public function set depthWrite(value:Boolean):void{}

		/**
		 * 剔除方式。
		 */
		public function get cull():Number{return null;}
		public function set cull(value:Number):void{}

		/**
		 * 混合方式。
		 */
		public function get blend():Number{return null;}
		public function set blend(value:Number):void{}

		/**
		 * 混合源。
		 */
		public function get blendSrc():Number{return null;}
		public function set blendSrc(value:Number):void{}

		/**
		 * 混合目标。
		 */
		public function get blendDst():Number{return null;}
		public function set blendDst(value:Number):void{}

		/**
		 * 深度测试方式。
		 */
		public function get depthTest():Number{return null;}
		public function set depthTest(value:Number):void{}

		/**
		 * 渲染模式。
		 */
		public function set renderMode(value:Number):void{}

		public function PBRMaterial(){}

		/**
		 * @deprecated 
		 */
		public function get enableReflection():Boolean{return null;}
		public function set enableReflection(value:Boolean):void{}
	}

}
