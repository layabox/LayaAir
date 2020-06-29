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
		public function get sunDisk():Number{return null;}
		public function set sunDisk(value:Number):void{}

		/**
		 * 太阳尺寸,范围是0到1。
		 */
		public function get sunSize():Number{return null;}
		public function set sunSize(value:Number):void{}

		/**
		 * 太阳尺寸收缩,范围是0到20。
		 */
		public function get sunSizeConvergence():Number{return null;}
		public function set sunSizeConvergence(value:Number):void{}

		/**
		 * 大气厚度,范围是0到5。
		 */
		public function get atmosphereThickness():Number{return null;}
		public function set atmosphereThickness(value:Number):void{}

		/**
		 * 天空颜色。
		 */
		public function get skyTint():Vector4{return null;}
		public function set skyTint(value:Vector4):void{}

		/**
		 * 地面颜色。
		 */
		public function get groundTint():Vector4{return null;}
		public function set groundTint(value:Vector4):void{}

		/**
		 * 曝光强度,范围是0到8。
		 */
		public function get exposure():Number{return null;}
		public function set exposure(value:Number):void{}

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
