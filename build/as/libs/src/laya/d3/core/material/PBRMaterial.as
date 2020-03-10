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
		public var albedoColor:Vector4;

		/**
		 * 漫反射贴图。
		 */
		public var albedoTexture:BaseTexture;

		/**
		 * 法线贴图。
		 */
		public var normalTexture:BaseTexture;

		/**
		 * 法线贴图缩放系数。
		 */
		public var normalTextureScale:Number;

		/**
		 * 视差贴图。
		 */
		public var parallaxTexture:BaseTexture;

		/**
		 * 视差贴图缩放系数。
		 */
		public var parallaxTextureScale:Number;

		/**
		 * 遮挡贴图。
		 */
		public var occlusionTexture:BaseTexture;

		/**
		 * 遮挡贴图强度,范围为0到1。
		 */
		public var occlusionTextureStrength:Number;

		/**
		 * 光滑度,范围为0到1。
		 */
		public var smoothness:Number;

		/**
		 * 光滑度缩放系数,范围为0到1。
		 */
		public var smoothnessTextureScale:Number;

		/**
		 * 是否开启自发光。
		 */
		public var enableEmission:Boolean;

		/**
		 * 自发光颜色。
		 */
		public var emissionColor:Vector4;

		/**
		 * 自发光贴图。
		 */
		public var emissionTexture:BaseTexture;

		/**
		 * 纹理平铺和偏移。
		 */
		public var tilingOffset:Vector4;

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

		/**
		 * 渲染模式。
		 */
		public var renderMode:Number;

		public function PBRMaterial(){}

		/**
		 * @deprecated 
		 */
		public var enableReflection:Boolean;
	}

}
