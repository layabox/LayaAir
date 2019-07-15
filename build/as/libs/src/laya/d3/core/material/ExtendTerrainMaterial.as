/*[IF-FLASH]*/
package laya.d3.core.material {
	improt laya.resource.BaseTexture;
	improt laya.d3.math.Vector4;
	improt laya.d3.core.material.BaseMaterial;
	public class ExtendTerrainMaterial extends laya.d3.core.material.BaseMaterial {
		public static var RENDERMODE_OPAQUE:Number;
		public static var RENDERMODE_TRANSPARENT:Number;
		public static var SPLATALPHATEXTURE:Number;
		public static var DIFFUSETEXTURE1:Number;
		public static var DIFFUSETEXTURE2:Number;
		public static var DIFFUSETEXTURE3:Number;
		public static var DIFFUSETEXTURE4:Number;
		public static var DIFFUSETEXTURE5:Number;
		public static var DIFFUSESCALEOFFSET1:Number;
		public static var DIFFUSESCALEOFFSET2:Number;
		public static var DIFFUSESCALEOFFSET3:Number;
		public static var DIFFUSESCALEOFFSET4:Number;
		public static var DIFFUSESCALEOFFSET5:Number;
		public static var CULL:Number;
		public static var BLEND:Number;
		public static var BLEND_SRC:Number;
		public static var BLEND_DST:Number;
		public static var DEPTH_TEST:Number;
		public static var DEPTH_WRITE:Number;
		public static var SHADERDEFINE_DETAIL_NUM1:Number;
		public static var SHADERDEFINE_DETAIL_NUM2:Number;
		public static var SHADERDEFINE_DETAIL_NUM3:Number;
		public static var SHADERDEFINE_DETAIL_NUM4:Number;
		public static var SHADERDEFINE_DETAIL_NUM5:Number;
		private var _enableLighting:*;
		public var splatAlphaTexture:BaseTexture;
		public var diffuseTexture1:BaseTexture;
		public var diffuseTexture2:BaseTexture;
		public var diffuseTexture3:BaseTexture;
		public var diffuseTexture4:BaseTexture;
		public var diffuseTexture5:BaseTexture;
		private var _setDetailNum:*;
		public var diffuseScaleOffset1:Vector4;
		public var diffuseScaleOffset2:Vector4;
		public var diffuseScaleOffset3:Vector4;
		public var diffuseScaleOffset4:Vector4;
		public var diffuseScaleOffset5:Vector4;
		public var enableLighting:Boolean;
		public var renderMode:Number;
		public var depthWrite:Boolean;
		public var cull:Number;
		public var blend:Number;
		public var blendSrc:Number;
		public var blendDst:Number;
		public var depthTest:Number;

		public function ExtendTerrainMaterial(){}
		public function clone():*{}
	}

}
