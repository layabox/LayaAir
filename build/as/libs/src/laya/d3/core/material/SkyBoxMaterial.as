/*[IF-FLASH]*/
package laya.d3.core.material {
	improt laya.d3.math.Vector4;
	improt laya.d3.resource.TextureCube;
	improt laya.d3.core.material.BaseMaterial;
	public class SkyBoxMaterial extends laya.d3.core.material.BaseMaterial {
		public static var TINTCOLOR:Number;
		public static var EXPOSURE:Number;
		public static var ROTATION:Number;
		public static var TEXTURECUBE:Number;
		public static var defaultMaterial:SkyBoxMaterial;
		public var tintColor:Vector4;
		public var exposure:Number;
		public var rotation:Number;
		public var textureCube:TextureCube;
		public function clone():*{}

		public function SkyBoxMaterial(){}
	}

}
