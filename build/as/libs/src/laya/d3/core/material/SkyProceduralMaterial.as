package laya.d3.core.material {
	import laya.d3.math.Vector4;
	import laya.d3.core.material.BaseMaterial;

	/*
	 * <code>SkyProceduralMaterial</code> 类用于实现SkyProceduralMaterial材质。
	 */
	public class SkyProceduralMaterial extends laya.d3.core.material.BaseMaterial {

		/*
		 * 太阳_无
		 */
		public static var SUN_NODE:Number;

		/*
		 * 太阳_精简
		 */
		public static var SUN_SIMPLE:Number;

		/*
		 * 太阳_高质量
		 */
		public static var SUN_HIGH_QUALITY:Number;

		/*
		 * 默认材质，禁止修改
		 */
		public static var defaultMaterial:SkyProceduralMaterial;
		private var _sunDisk:*;

		/*
		 * 获取太阳状态。
		 * @return 太阳状态。
		 */

		/*
		 * 设置太阳状态。
		 * @param value 太阳状态。
		 */
		public var sunDisk:Number;

		/*
		 * 获取太阳尺寸,范围是0到1。
		 * @return 太阳尺寸。
		 */

		/*
		 * 设置太阳尺寸,范围是0到1。
		 * @param value 太阳尺寸。
		 */
		public var sunSize:Number;

		/*
		 * 获取太阳尺寸收缩,范围是0到20。
		 * @return 太阳尺寸收缩。
		 */

		/*
		 * 设置太阳尺寸收缩,范围是0到20。
		 * @param value 太阳尺寸收缩。
		 */
		public var sunSizeConvergence:Number;

		/*
		 * 获取大气厚度,范围是0到5。
		 * @return 大气厚度。
		 */

		/*
		 * 设置大气厚度,范围是0到5。
		 * @param value 大气厚度。
		 */
		public var atmosphereThickness:Number;

		/*
		 * 获取天空颜色。
		 * @return 天空颜色。
		 */

		/*
		 * 设置天空颜色。
		 * @param value 天空颜色。
		 */
		public var skyTint:Vector4;

		/*
		 * 获取地面颜色。
		 * @return 地面颜色。
		 */

		/*
		 * 设置地面颜色。
		 * @param value 地面颜色。
		 */
		public var groundTint:Vector4;

		/*
		 * 获取曝光强度,范围是0到8。
		 * @return 曝光强度。
		 */

		/*
		 * 设置曝光强度,范围是0到8。
		 * @param value 曝光强度。
		 */
		public var exposure:Number;

		/*
		 * 创建一个 <code>SkyProceduralMaterial</code> 实例。
		 */

		public function SkyProceduralMaterial(){}

		/*
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}
	}

}
