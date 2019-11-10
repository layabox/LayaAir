package laya.d3.core.material {
	import laya.d3.math.Vector4;
	import laya.d3.core.material.Material;

	/**
	 * <code>SkyProceduralMaterial</code> 类用于实现SkyProceduralMaterial材质。
	 */
	public class SkyProceduralMaterial extends Material {

		/**
		 * 太阳_无
		 */
		public static var SUN_NODE:Number;

		/**
		 * 太阳_精简
		 */
		public static var SUN_SIMPLE:Number;

		/**
		 * 太阳_高质量
		 */
		public static var SUN_HIGH_QUALITY:Number;

		/**
		 * 默认材质，禁止修改
		 */
		public static var defaultMaterial:SkyProceduralMaterial;

		/**
		 * 太阳状态。
		 */
		public var sunDisk:Number;

		/**
		 * 太阳尺寸,范围是0到1。
		 */
		public var sunSize:Number;

		/**
		 * 太阳尺寸收缩,范围是0到20。
		 */
		public var sunSizeConvergence:Number;

		/**
		 * 大气厚度,范围是0到5。
		 */
		public var atmosphereThickness:Number;

		/**
		 * 天空颜色。
		 */
		public var skyTint:Vector4;

		/**
		 * 地面颜色。
		 */
		public var groundTint:Vector4;

		/**
		 * 曝光强度,范围是0到8。
		 */
		public var exposure:Number;

		/**
		 * 创建一个 <code>SkyProceduralMaterial</code> 实例。
		 */

		public function SkyProceduralMaterial(){}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}
	}

}
