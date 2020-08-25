package laya.d3.core.particleShuriKen {
	import laya.d3.core.material.Material;
	import laya.d3.math.Vector4;
	import laya.resource.BaseTexture;
	import laya.d3.shader.ShaderDefine;

	/**
	 * <code>ShurikenParticleMaterial</code> 类用于实现粒子材质。
	 */
	public class ShurikenParticleMaterial extends Material {

		/**
		 * 渲染状态_透明混合。
		 */
		public static var RENDERMODE_ALPHABLENDED:Number;

		/**
		 * 渲染状态_加色法混合。
		 */
		public static var RENDERMODE_ADDTIVE:Number;
		public static var SHADERDEFINE_DIFFUSEMAP:ShaderDefine;
		public static var SHADERDEFINE_TINTCOLOR:ShaderDefine;
		public static var SHADERDEFINE_TILINGOFFSET:ShaderDefine;
		public static var SHADERDEFINE_ADDTIVEFOG:ShaderDefine;
		public static var DIFFUSETEXTURE:Number;
		public static var TINTCOLOR:Number;
		public static var TILINGOFFSET:Number;
		public static var CULL:Number;
		public static var BLEND:Number;
		public static var BLEND_SRC:Number;
		public static var BLEND_DST:Number;
		public static var DEPTH_TEST:Number;
		public static var DEPTH_WRITE:Number;

		/**
		 * 默认材质，禁止修改
		 */
		public static var defaultMaterial:ShurikenParticleMaterial;

		/**
		 * 渲染模式。
		 */
		public function set renderMode(value:Number):void{}

		/**
		 * 颜色R分量。
		 */
		public function get colorR():Number{return null;}
		public function set colorR(value:Number):void{}

		/**
		 * 颜色G分量。
		 */
		public function get colorG():Number{return null;}
		public function set colorG(value:Number):void{}

		/**
		 * 颜色B分量。
		 */
		public function get colorB():Number{return null;}
		public function set colorB(value:Number):void{}

		/**
		 * 颜色Z分量。
		 */
		public function get colorA():Number{return null;}
		public function set colorA(value:Number):void{}

		/**
		 * 颜色。
		 */
		public function get color():Vector4{return null;}
		public function set color(value:Vector4):void{}

		/**
		 * 纹理平铺和偏移X分量。
		 */
		public function get tilingOffsetX():Number{return null;}
		public function set tilingOffsetX(x:Number):void{}

		/**
		 * 纹理平铺和偏移Y分量。
		 */
		public function get tilingOffsetY():Number{return null;}
		public function set tilingOffsetY(y:Number):void{}

		/**
		 * 纹理平铺和偏移Z分量。
		 */
		public function get tilingOffsetZ():Number{return null;}
		public function set tilingOffsetZ(z:Number):void{}

		/**
		 * 纹理平铺和偏移W分量。
		 */
		public function get tilingOffsetW():Number{return null;}
		public function set tilingOffsetW(w:Number):void{}

		/**
		 * 纹理平铺和偏移。
		 */
		public function get tilingOffset():Vector4{return null;}
		public function set tilingOffset(value:Vector4):void{}

		/**
		 * 漫反射贴图。
		 */
		public function get texture():BaseTexture{return null;}
		public function set texture(value:BaseTexture):void{}

		/**
		 * 是否写入深度。
		 */
		public function get depthWrite():Boolean{return null;}
		public function set depthWrite(value:Boolean):void{}

		/**
		 * 剔除方式。
		 */
		public function get cull():Number{return null;}
		public function set cull(value:Number):void{}

		/**
		 * 混合方式。
		 */
		public function get blend():Number{return null;}
		public function set blend(value:Number):void{}

		/**
		 * 混合源。
		 */
		public function get blendSrc():Number{return null;}
		public function set blendSrc(value:Number):void{}

		/**
		 * 混合目标。
		 */
		public function get blendDst():Number{return null;}
		public function set blendDst(value:Number):void{}

		/**
		 * 深度测试方式。
		 */
		public function get depthTest():Number{return null;}
		public function set depthTest(value:Number):void{}

		public function ShurikenParticleMaterial(){}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}
	}

}
