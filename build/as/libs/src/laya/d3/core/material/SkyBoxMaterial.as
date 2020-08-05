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
		public function get tintColor():Vector4{return null;}
		public function set tintColor(value:Vector4):void{}

		/**
		 * 曝光强度。
		 */
		public function get exposure():Number{return null;}
		public function set exposure(value:Number):void{}

		/**
		 * 旋转角度。
		 */
		public function get rotation():Number{return null;}
		public function set rotation(value:Number):void{}

		/**
		 * 天空盒纹理。
		 */
		public function get textureCube():TextureCube{return null;}
		public function set textureCube(value:TextureCube):void{}

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
