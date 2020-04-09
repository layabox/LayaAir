package laya.d3.core.material {
	import laya.d3.math.Vector4;
	import laya.d3.resource.TextureCube;
	import laya.d3.core.material.Material;

	/**
	 * <code>SkyBoxMaterial</code> 类用于实现SkyBoxMaterial材质。
	 */
	public class SkyBoxMaterial extends Material {
		public static var TINTCOLOR:Number;
		public static var EXPOSURE:Number;
		public static var ROTATION:Number;
		public static var TEXTURECUBE:Number;

		/**
		 * 默认材质，禁止修改
		 */
		public static var defaultMaterial:SkyBoxMaterial;

		/**
		 * 颜色。
		 */
		public var tintColor:Vector4;

		/**
		 * 曝光强度。
		 */
		public var exposure:Number;

		/**
		 * 旋转角度。
		 */
		public var rotation:Number;

		/**
		 * 天空盒纹理。
		 */
		public var textureCube:TextureCube;

		/**
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}

		/**
		 * 创建一个 <code>SkyBoxMaterial</code> 实例。
		 */

		public function SkyBoxMaterial(){}
	}

}
