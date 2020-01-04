package laya.d3.core.material {
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
		public function get shaderData():ShaderData{
				return null;
		}

		/**
		 * 透明测试模式裁剪值。
		 */
		public var alphaTestValue:Number;

		/**
		 * 是否透明裁剪。
		 */
		public var alphaTest:Boolean;

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
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:*):void{}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}
		public function get _defineDatas():DefineDatas{
				return null;
		}
	}

}
