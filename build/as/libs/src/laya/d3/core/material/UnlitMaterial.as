/*[IF-FLASH]*/
package laya.d3.core.material {
	improt laya.resource.BaseTexture;
	improt laya.d3.math.Vector4;
	improt laya.d3.core.material.BaseMaterial;
	public class UnlitMaterial extends laya.d3.core.material.BaseMaterial {
		public static var RENDERMODE_OPAQUE:Number;
		public static var RENDERMODE_CUTOUT:Number;
		public static var RENDERMODE_TRANSPARENT:Number;
		public static var RENDERMODE_ADDTIVE:Number;
		public static var SHADERDEFINE_ALBEDOTEXTURE:Number;
		public static var SHADERDEFINE_TILINGOFFSET:Number;
		public static var SHADERDEFINE_ENABLEVERTEXCOLOR:Number;
		public static var ALBEDOTEXTURE:Number;
		public static var ALBEDOCOLOR:Number;
		public static var TILINGOFFSET:Number;
		public static var CULL:Number;
		public static var BLEND:Number;
		public static var BLEND_SRC:Number;
		public static var BLEND_DST:Number;
		public static var DEPTH_TEST:Number;
		public static var DEPTH_WRITE:Number;
		public static var defaultMaterial:UnlitMaterial;
		private var _albedoColor:*;
		private var _albedoIntensity:*;
		private var _enableVertexColor:*;
		public var albedoColorR:Number;
		public var albedoColorG:Number;
		public var albedoColorB:Number;
		public var albedoColorA:Number;
		public var albedoColor:Vector4;
		public var albedoIntensity:Number;
		public var albedoTexture:BaseTexture;
		public var tilingOffsetX:Number;
		public var tilingOffsetY:Number;
		public var tilingOffsetZ:Number;
		public var tilingOffsetW:Number;
		public var tilingOffset:Vector4;
		public var enableVertexColor:Boolean;
		public var renderMode:Number;
		public var depthWrite:Boolean;
		public var cull:Number;
		public var blend:Number;
		public var blendSrc:Number;
		public var blendDst:Number;
		public var depthTest:Number;

		public function UnlitMaterial(){}
		public function clone():*{}
	}

}
