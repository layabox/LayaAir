/*[IF-FLASH]*/
package laya.d3.math {
	improt laya.d3.core.IClone;
	public class Vector2 implements laya.d3.core.IClone {
		public static var ZERO:Vector2;
		public static var ONE:Vector2;
		public var x:Number;
		public var y:Number;

		public function Vector2(x:Number = null,y:Number = null){}
		public function setValue(x:Number,y:Number):void{}
		public static function scale(a:Vector2,b:Number,out:Vector2):void{}
		public function fromArray(array:Array,offset:Number = null):void{}
		public function cloneTo(destObject:*):void{}
		public static function dot(a:Vector2,b:Vector2):Number{}
		public static function normalize(s:Vector2,out:Vector2):void{}
		public static function scalarLength(a:Vector2):Number{}
		public function clone():*{}
		public function forNativeElement(nativeElements:Float32Array = null):void{}
		public static function rewriteNumProperty(proto:*,name:String,index:Number):void{}
	}

}
