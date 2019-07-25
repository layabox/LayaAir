package laya.d3.core.material {
	import laya.d3.math.Vector4;
	import laya.d3.resource.TextureCube;
	import laya.d3.core.material.BaseMaterial;

	/*
	 * <code>SkyBoxMaterial</code> 类用于实现SkyBoxMaterial材质。
	 */
	public class SkyBoxMaterial extends laya.d3.core.material.BaseMaterial {
		public static var TINTCOLOR:Number;
		public static var EXPOSURE:Number;
		public static var ROTATION:Number;
		public static var TEXTURECUBE:Number;

		/*
		 * 默认材质，禁止修改
		 */
		public static var defaultMaterial:SkyBoxMaterial;

		/*
		 * 获取颜色。
		 * @return 颜色。
		 */

		/*
		 * 设置颜色。
		 * @param value 颜色。
		 */
		public var tintColor:Vector4;

		/*
		 * 获取曝光强度。
		 * @return 曝光强度。
		 */

		/*
		 * 设置曝光强度。
		 * @param value 曝光强度。
		 */
		public var exposure:Number;

		/*
		 * 获取曝光强度。
		 * @return 曝光强度。
		 */

		/*
		 * 设置曝光强度。
		 * @param value 曝光强度。
		 */
		public var rotation:Number;

		/*
		 * 获取天空盒纹理。
		 */

		/*
		 * 设置天空盒纹理。
		 */
		public var textureCube:TextureCube;

		/*
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}

		/*
		 * 创建一个 <code>SkyBoxMaterial</code> 实例。
		 */

		public function SkyBoxMaterial(){}
	}

}
