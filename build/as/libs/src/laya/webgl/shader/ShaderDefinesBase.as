/*[IF-FLASH]*/
package laya.webgl.shader {
	public class ShaderDefinesBase {
		private var _name2int:*;
		private var _int2name:*;
		private var _int2nameMap:*;

		public function ShaderDefinesBase(name2int:*,int2name:Array,int2nameMap:Array){}
		public function add(value:*):Number{}
		public function addInt(value:Number):Number{}
		public function remove(value:*):Number{}
		public function isDefine(def:Number):Boolean{}
		public function getValue():Number{}
		public function setValue(value:Number):void{}
		public function toNameDic():*{}
		public static function _reg(name:String,value:Number,_name2int:*,_int2name:Array):void{}
		public static function _toText(value:Number,_int2name:Array,_int2nameMap:*):*{}
		public static function _toInt(names:String,_name2int:*):Number{}
	}

}
