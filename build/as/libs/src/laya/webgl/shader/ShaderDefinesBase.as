package laya.webgl.shader {
	public class ShaderDefinesBase {
		private var _name2int:*;
		private var _int2name:*;
		private var _int2nameMap:*;

		public function ShaderDefinesBase(name2int:* = undefined,int2name:Array = undefined,int2nameMap:Array = undefined){}
		public function add(value:*):Number{
			return null;
		}
		public function addInt(value:Number):Number{
			return null;
		}
		public function remove(value:*):Number{
			return null;
		}
		public function isDefine(def:Number):Boolean{
			return null;
		}
		public function getValue():Number{
			return null;
		}
		public function setValue(value:Number):void{}
		public function toNameDic():*{}
		public static function _reg(name:String,value:Number,_name2int:*,_int2name:Array):void{}
		public static function _toText(value:Number,_int2name:Array,_int2nameMap:*):*{}
		public static function _toInt(names:String,_name2int:*):Number{
			return null;
		}
	}

}
