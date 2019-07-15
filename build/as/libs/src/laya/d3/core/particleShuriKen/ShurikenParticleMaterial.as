/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen {
	improt laya.d3.core.material.BaseMaterial;
	improt laya.d3.math.Vector4;
	improt laya.resource.BaseTexture;
	public class ShurikenParticleMaterial extends laya.d3.core.material.BaseMaterial {
		public static var RENDERMODE_ALPHABLENDED:Number;
		public static var RENDERMODE_ADDTIVE:Number;
		public static var SHADERDEFINE_DIFFUSEMAP:Number;
		public static var SHADERDEFINE_TINTCOLOR:Number;
		public static var SHADERDEFINE_TILINGOFFSET:Number;
		public static var SHADERDEFINE_ADDTIVEFOG:Number;
		public static var DIFFUSETEXTURE:Number;
		public static var TINTCOLOR:Number;
		public static var TILINGOFFSET:Number;
		public static var CULL:Number;
		public static var BLEND:Number;
		public static var BLEND_SRC:Number;
		public static var BLEND_DST:Number;
		public static var DEPTH_TEST:Number;
		public static var DEPTH_WRITE:Number;
		public static var defaultMaterial:ShurikenParticleMaterial;
		public var renderMode:Number;
		public var colorR:Number;
		public var colorG:Number;
		public var colorB:Number;
		public var colorA:Number;
		public var color:Vector4;
		public var tilingOffsetX:Number;
		public var tilingOffsetY:Number;
		public var tilingOffsetZ:Number;
		public var tilingOffsetW:Number;
		public var tilingOffset:Vector4;
		public var texture:BaseTexture;
		public var depthWrite:Boolean;
		public var cull:Number;
		public var blend:Number;
		public var blendSrc:Number;
		public var blendDst:Number;
		public var depthTest:Number;

		public function ShurikenParticleMaterial(){}
		public function clone():*{}
	}

}
