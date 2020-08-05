package laya.d3.core.material {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.core.material.Material;
	import laya.d3.shader.ShaderDefine;

	/**
	 * ...
	 * @author ...
	 */
	public class ExtendTerrainMaterial extends Material {

		/**
		 * 渲染状态_不透明。
		 */
		public static var RENDERMODE_OPAQUE:Number;

		/**
		 * 渲染状态_透明混合。
		 */
		public static var RENDERMODE_TRANSPARENT:Number;

		/**
		 * 渲染状态_透明混合。
		 */
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

		/**
		 * 地形细节宏定义。
		 */
		public static var SHADERDEFINE_DETAIL_NUM1:ShaderDefine;
		public static var SHADERDEFINE_DETAIL_NUM2:ShaderDefine;
		public static var SHADERDEFINE_DETAIL_NUM3:ShaderDefine;
		public static var SHADERDEFINE_DETAIL_NUM4:ShaderDefine;
		public static var SHADERDEFINE_DETAIL_NUM5:ShaderDefine;

		/**
		 * splatAlpha贴图。
		 */
		public function get splatAlphaTexture():BaseTexture{return null;}
		public function set splatAlphaTexture(value:BaseTexture):void{}

		/**
		 * 第一层贴图。
		 */
		public function get diffuseTexture1():BaseTexture{return null;}
		public function set diffuseTexture1(value:BaseTexture):void{}

		/**
		 * 第二层贴图。
		 */
		public function get diffuseTexture2():BaseTexture{return null;}
		public function set diffuseTexture2(value:BaseTexture):void{}

		/**
		 * 第三层贴图。
		 */
		public function get diffuseTexture3():BaseTexture{return null;}
		public function set diffuseTexture3(value:BaseTexture):void{}

		/**
		 * 第四层贴图。
		 */
		public function get diffuseTexture4():BaseTexture{return null;}
		public function set diffuseTexture4(value:BaseTexture):void{}

		/**
		 * 第五层贴图。
		 */
		public function get diffuseTexture5():BaseTexture{return null;}
		public function set diffuseTexture5(value:BaseTexture):void{}

		/**
		 * 第一层贴图缩放偏移。
		 */
		public function set diffuseScaleOffset1(scaleOffset1:Vector4):void{}

		/**
		 * 第二层贴图缩放偏移。
		 */
		public function set diffuseScaleOffset2(scaleOffset2:Vector4):void{}

		/**
		 * 第三层贴图缩放偏移。
		 */
		public function set diffuseScaleOffset3(scaleOffset3:Vector4):void{}

		/**
		 * 第四层贴图缩放偏移。
		 */
		public function set diffuseScaleOffset4(scaleOffset4:Vector4):void{}

		/**
		 * 第五层贴图缩放偏移。
		 */
		public function set diffuseScaleOffset5(scaleOffset5:Vector4):void{}

		/**
		 * 设置渲染模式。
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

		public function ExtendTerrainMaterial(){}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 * @override 
		 */
		override public function clone():*{}
	}

}
