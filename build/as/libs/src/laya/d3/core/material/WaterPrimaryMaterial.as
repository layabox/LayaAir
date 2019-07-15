/*[IF-FLASH]*/
package laya.d3.core.material {
	improt laya.resource.BaseTexture;
	improt laya.d3.math.Vector4;
	improt laya.d3.core.material.BaseMaterial;
	public class WaterPrimaryMaterial extends laya.d3.core.material.BaseMaterial {
		public static var HORIZONCOLOR:Number;
		public static var MAINTEXTURE:Number;
		public static var NORMALTEXTURE:Number;
		public static var WAVESCALE:Number;
		public static var WAVESPEED:Number;
		public static var SHADERDEFINE_MAINTEXTURE:Number;
		public static var SHADERDEFINE_NORMALTEXTURE:Number;
		public static var defaultMaterial:WaterPrimaryMaterial;
		public var horizonColor:Vector4;
		public var mainTexture:BaseTexture;
		public var normalTexture:BaseTexture;
		public var waveScale:Number;
		public var waveSpeed:Vector4;

		public function WaterPrimaryMaterial(){}
		public function clone():*{}
	}

}
