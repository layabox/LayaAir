package laya.d3.core.trail {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.core.material.Material;
	import laya.d3.shader.ShaderDefine;

	/**
	 * <code>TrailMaterial</code> 类用于实现拖尾材质。
	 */
	public class TrailMaterial extends Material {

		/**
		 * 渲染状态_透明混合。
		 */
		public static var RENDERMODE_ALPHABLENDED:Number;

		/**
		 * 渲染状态_加色法混合。
		 */
		public static var RENDERMODE_ADDTIVE:Number;

		/**
		 * 默认材质，禁止修改
		 */
		public static var defaultMaterial:TrailMaterial;
		public static var SHADERDEFINE_MAINTEXTURE:ShaderDefine;
		public static var SHADERDEFINE_TILINGOFFSET:ShaderDefine;
		public static var SHADERDEFINE_ADDTIVEFOG:ShaderDefine;
		public static var MAINTEXTURE:Number;
		public static var TINTCOLOR:Number;
		public static var TILINGOFFSET:Number;
		public static var CULL:Number;
		public static var BLEND:Number;
		public static var BLEND_SRC:Number;
		public static var BLEND_DST:Number;
		public static var DEPTH_TEST:Number;
		public static var DEPTH_WRITE:Number;

		/**
		 * 设置渲染模式。
		 * @return 渲染模式。
		 */
		public function set renderMode(value:Number):void{}

		/**
		 * 获取颜色R分量。
		 * @return 颜色R分量。
		 */
		public function get colorR():Number{return null;}

		/**
		 * 设置颜色R分量。
		 * @param value 颜色R分量。
		 */
		public function set colorR(value:Number):void{}

		/**
		 * 获取颜色G分量。
		 * @return 颜色G分量。
		 */
		public function get colorG():Number{return null;}

		/**
		 * 设置颜色G分量。
		 * @param value 颜色G分量。
		 */
		public function set colorG(value:Number):void{}

		/**
		 * 获取颜色B分量。
		 * @return 颜色B分量。
		 */
		public function get colorB():Number{return null;}

		/**
		 * 设置颜色B分量。
		 * @param value 颜色B分量。
		 */
		public function set colorB(value:Number):void{}

		/**
		 * 获取颜色Z分量。
		 * @return 颜色Z分量。
		 */
		public function get colorA():Number{return null;}

		/**
		 * 设置颜色alpha分量。
		 * @param value 颜色alpha分量。
		 */
		public function set colorA(value:Number):void{}

		/**
		 * 获取颜色。
		 * @return 颜色。
		 */
		public function get color():Vector4{return null;}

		/**
		 * 设置颜色。
		 * @param value 颜色。
		 */
		public function set color(value:Vector4):void{}

		/**
		 * 获取贴图。
		 * @return 贴图。
		 */
		public function get texture():BaseTexture{return null;}

		/**
		 * 设置贴图。
		 * @param value 贴图。
		 */
		public function set texture(value:BaseTexture):void{}

		/**
		 * 获取纹理平铺和偏移X分量。
		 * @return 纹理平铺和偏移X分量。
		 */
		public function get tilingOffsetX():Number{return null;}

		/**
		 * 获取纹理平铺和偏移X分量。
		 * @param x 纹理平铺和偏移X分量。
		 */
		public function set tilingOffsetX(x:Number):void{}

		/**
		 * 获取纹理平铺和偏移Y分量。
		 * @return 纹理平铺和偏移Y分量。
		 */
		public function get tilingOffsetY():Number{return null;}

		/**
		 * 获取纹理平铺和偏移Y分量。
		 * @param y 纹理平铺和偏移Y分量。
		 */
		public function set tilingOffsetY(y:Number):void{}

		/**
		 * 获取纹理平铺和偏移Z分量。
		 * @return 纹理平铺和偏移Z分量。
		 */
		public function get tilingOffsetZ():Number{return null;}

		/**
		 * 获取纹理平铺和偏移Z分量。
		 * @param z 纹理平铺和偏移Z分量。
		 */
		public function set tilingOffsetZ(z:Number):void{}

		/**
		 * 获取纹理平铺和偏移W分量。
		 * @return 纹理平铺和偏移W分量。
		 */
		public function get tilingOffsetW():Number{return null;}

		/**
		 * 获取纹理平铺和偏移W分量。
		 * @param w 纹理平铺和偏移W分量。
		 */
		public function set tilingOffsetW(w:Number):void{}

		/**
		 * 获取纹理平铺和偏移。
		 * @return 纹理平铺和偏移。
		 */
		public function get tilingOffset():Vector4{return null;}

		/**
		 * 设置纹理平铺和偏移。
		 * @param value 纹理平铺和偏移。
		 */
		public function set tilingOffset(value:Vector4):void{}

		/**
		 * 设置是否写入深度。
		 * @param value 是否写入深度。
		 */
		public function set depthWrite(value:Boolean):void{}

		/**
		 * 获取是否写入深度。
		 * @return 是否写入深度。
		 */
		public function get depthWrite():Boolean{return null;}

		/**
		 * 设置剔除方式。
		 * @param value 剔除方式。
		 */
		public function set cull(value:Number):void{}

		/**
		 * 获取剔除方式。
		 * @return 剔除方式。
		 */
		public function get cull():Number{return null;}

		/**
		 * 设置混合方式。
		 * @param value 混合方式。
		 */
		public function set blend(value:Number):void{}

		/**
		 * 获取混合方式。
		 * @return 混合方式。
		 */
		public function get blend():Number{return null;}

		/**
		 * 设置混合源。
		 * @param value 混合源
		 */
		public function set blendSrc(value:Number):void{}

		/**
		 * 获取混合源。
		 * @return 混合源。
		 */
		public function get blendSrc():Number{return null;}

		/**
		 * 设置混合目标。
		 * @param value 混合目标
		 */
		public function set blendDst(value:Number):void{}

		/**
		 * 获取混合目标。
		 * @return 混合目标。
		 */
		public function get blendDst():Number{return null;}

		/**
		 * 设置深度测试方式。
		 * @param value 深度测试方式
		 */
		public function set depthTest(value:Number):void{}

		/**
		 * 获取深度测试方式。
		 * @return 深度测试方式。
		 */
		public function get depthTest():Number{return null;}

		public function TrailMaterial(){}

		/**
		 * @inheritdoc 
		 * @override 
		 */
		override public function clone():*{}
	}

}
