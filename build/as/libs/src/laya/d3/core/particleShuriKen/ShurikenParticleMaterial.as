package laya.d3.core.particleShuriKen {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.shader.ShaderDefine;
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

		/**
		 * @interanl 
		 */
		public static var SHADERDEFINE_ADDTIVEFOG:ShaderDefine;

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
		 * 创建一个 <code>ShurikenParticleMaterial</code> 实例。
		 */

		public function ShurikenParticleMaterial(){}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}
	}

}
