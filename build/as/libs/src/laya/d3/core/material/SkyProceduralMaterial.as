/*[IF-FLASH]*/
package laya.d3.core.material {
	improt laya.d3.math.Vector4;
	improt laya.d3.core.material.BaseMaterial;
	public class SkyProceduralMaterial extends laya.d3.core.material.BaseMaterial {
		public static var SUN_NODE:Number;
		public static var SUN_SIMPLE:Number;
		public static var SUN_HIGH_QUALITY:Number;
		public static var defaultMaterial:SkyProceduralMaterial;
		private var _sunDisk:*;
		public var sunDisk:Number;
		public var sunSize:Number;
		public var sunSizeConvergence:Number;
		public var atmosphereThickness:Number;
		public var skyTint:Vector4;
		public var groundTint:Vector4;
		public var exposure:Number;

		public function SkyProceduralMaterial(){}
		public function clone():*{}
	}

}
