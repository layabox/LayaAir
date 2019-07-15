/*[IF-FLASH]*/
package laya.d3.core.material {
	improt laya.resource.Resource;
	improt laya.utils.Handler;
	improt laya.d3.shader.DefineDatas;
	improt laya.d3.shader.ShaderData;
	improt laya.d3.shader.ShaderDefines;
	improt laya.d3.core.IClone;
	public class BaseMaterial extends laya.resource.Resource implements laya.d3.core.IClone {
		public static var MATERIAL:String;
		public static var RENDERQUEUE_OPAQUE:Number;
		public static var RENDERQUEUE_ALPHATEST:Number;
		public static var RENDERQUEUE_TRANSPARENT:Number;
		public static var ALPHATESTVALUE:Number;
		public static var SHADERDEFINE_ALPHATEST:Number;
		public static var shaderDefines:ShaderDefines;
		public static function load(url:String,complete:Handler):void{}
		public static function _parse(data:*,propertyParams:* = null,constructParams:Array = null):BaseMaterial{}
		private var _alphaTest:*;
		public var _shaderValues:ShaderData;
		public var renderQueue:Number;
		public var alphaTestValue:Number;
		public var alphaTest:Boolean;

		public function BaseMaterial(){}
		private var _removeTetxureReference:*;
		public function _addReference(count:Number = null):void{}
		public function _removeReference(count:Number = null):void{}
		protected function _disposeResource():void{}
		public function setShaderName(name:String):void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
		public function get _defineDatas():DefineDatas{};
	}

}
