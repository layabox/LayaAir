package laya.d3.core.material {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.shader.ShaderDefine;
	import laya.d3.core.material.Material;

	/**
	 * <code>UnlitMaterial</code> 类用于实现不受光照影响的材质。
	 */
	public class UnlitMaterial extends Material {

		/**
		 * 渲染状态_不透明。
		 */
		public static var RENDERMODE_OPAQUE:Number;

		/**
		 * 渲染状态_阿尔法测试。
		 */
		public static var RENDERMODE_CUTOUT:Number;

		/**
		 * 渲染状态__透明混合。
		 */
		public static var RENDERMODE_TRANSPARENT:Number;

		/**
		 * 渲染状态__加色法混合。
		 */
		public static var RENDERMODE_ADDTIVE:Number;
		public static var SHADERDEFINE_ALBEDOTEXTURE:ShaderDefine;
		public static var SHADERDEFINE_TILINGOFFSET:ShaderDefine;
		public static var SHADERDEFINE_ENABLEVERTEXCOLOR:ShaderDefine;
		public static var ALBEDOTEXTURE:Number;
		public static var ALBEDOCOLOR:Number;
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
		public static var defaultMaterial:UnlitMaterial;
		private var _albedoColor:*;
		private var _albedoIntensity:*;
		private var _enableVertexColor:*;
		public function set _ColorR(value:Number):void{}
		public function set _ColorG(value:Number):void{}
		public function set _ColorB(value:Number):void{}
		public function set _ColorA(value:Number):void{}
		public function set _AlbedoIntensity(value:Number):void{}
		public function set _MainTex_STX(x:Number):void{}
		public function set _MainTex_STY(y:Number):void{}
		public function set _MainTex_STZ(z:Number):void{}
		public function set _MainTex_STW(w:Number):void{}
		public function set _Cutoff(value:Number):void{}

		/**
		 * 反照率颜色R分量。
		 */
		public function get albedoColorR():Number{return null;}
		public function set albedoColorR(value:Number):void{}

		/**
		 * 反照率颜色G分量。
		 */
		public function get albedoColorG():Number{return null;}
		public function set albedoColorG(value:Number):void{}

		/**
		 * 反照率颜色B分量。
		 */
		public function get albedoColorB():Number{return null;}
		public function set albedoColorB(value:Number):void{}

		/**
		 * 反照率颜色Z分量。
		 */
		public function get albedoColorA():Number{return null;}
		public function set albedoColorA(value:Number):void{}

		/**
		 * 反照率颜色。
		 */
		public function get albedoColor():Vector4{return null;}
		public function set albedoColor(value:Vector4):void{}

		/**
		 * 反照率强度。
		 */
		public function get albedoIntensity():Number{return null;}
		public function set albedoIntensity(value:Number):void{}

		/**
		 * 反照率贴图。
		 */
		public function get albedoTexture():BaseTexture{return null;}
		public function set albedoTexture(value:BaseTexture):void{}

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
		 * 是否支持顶点色。
		 */
		public function get enableVertexColor():Boolean{return null;}
		public function set enableVertexColor(value:Boolean):void{}

		/**
		 * 渲染模式。
		 */
		public function set renderMode(value:Number):void{}

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

		public function UnlitMaterial(){}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}
	}

}
