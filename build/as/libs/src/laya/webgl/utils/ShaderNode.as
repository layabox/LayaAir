package laya.webgl.utils {
	public class ShaderNode {
		private static var __id:*;
		public var childs:Array;
		public var text:String;
		public var parent:ShaderNode;
		public var name:String;
		public var noCompile:Boolean;
		public var includefiles:Array;
		public var condition:*;
		public var conditionType:Number;
		public var useFuns:String;
		public var z:Number;
		public var src:String;

		public function ShaderNode(includefiles:Array = undefined){}
		public function setParent(parent:ShaderNode):void{}
		public function setCondition(condition:String,type:Number):void{}
		public function toscript(def:*,out:Array):Array{
			return null;
		}
		private var _toscript:*;
	}

}
