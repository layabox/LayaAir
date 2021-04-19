package laya.d3.core.material {
	import laya.d3.shader.DefineDatas;
	import laya.d3.shader.ShaderData;
	import laya.utils.Handler;
	import laya.d3.shader.ShaderDefine;
	import laya.resource.Resource;
	import laya.utils.Handler;
	import laya.d3.shader.DefineDatas;
	import laya.d3.shader.ShaderData;
	import laya.d3.core.IClone;
	import laya.d3.shader.ShaderDefine;

	/**
	 * <code>Material</code> 类用于创建材质。
	 */
	public class Material extends Resource implements IClone {

		/**
		 * Material资源。
		 */
		public static var MATERIAL:String;

		/**
		 * 渲染队列_不透明。
		 */
		public static var RENDERQUEUE_OPAQUE:Number;

		/**
		 * 渲染队列_阿尔法裁剪。
		 */
		public static var RENDERQUEUE_ALPHATEST:Number;

		/**
		 * 渲染队列_透明。
		 */
		public static var RENDERQUEUE_TRANSPARENT:Number;

		/**
		 * 着色器变量,透明测试值。
		 */
		public static var ALPHATESTVALUE:Number;

		/**
		 * 材质级着色器宏定义,透明测试。
		 */
		public static var SHADERDEFINE_ALPHATEST:ShaderDefine;

		/**
		 * 加载材质。
		 * @param url 材质地址。
		 * @param complete 完成回掉。
		 */
		public static function load(url:String,complete:Handler):void{}

		/**
		 * @inheritDoc 
		 */
		public static function _parse(data:*,propertyParams:* = null,constructParams:Array = null):Material{
			return null;
		}

		/**
		 * @private 
		 */
		public var _shaderValues:ShaderData;

		/**
		 * 所属渲染队列.
		 */
		public var renderQueue:Number;

		/**
		 * 着色器数据。
		 */
		public function get shaderData():ShaderData{return null;}

		/**
		 * 透明测试模式裁剪值。
		 */
		public function get alphaTestValue():Number{return null;}
		public function set alphaTestValue(value:Number):void{}

		/**
		 * 是否透明裁剪。
		 */
		public function get alphaTest():Boolean{return null;}
		public function set alphaTest(value:Boolean):void{}

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

		/**
		 * 获得材质属性
		 */
		public function get MaterialProperty():*{return null;}

		/**
		 * 获得材质宏
		 */
		public function get MaterialDefine():Array{return null;}

		/**
		 * 创建一个 <code>BaseMaterial</code> 实例。
		 */

		public function Material(){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _disposeResource():void{}

		/**
		 * 设置使用Shader名字。
		 * @param name 名称。
		 */
		public function setShaderName(name:String):void{}

		/**
		 * 设置属性值
		 * @param name 
		 * @param value 
		 */
		public function setShaderPropertyValue(name:String,value:*):void{}

		/**
		 * 获取属性值
		 * @param name 
		 */
		public function getShaderPropertyValue(name:String):*{}

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:*):void{}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}
		public function get _defineDatas():DefineDatas{return null;}
	}

}
