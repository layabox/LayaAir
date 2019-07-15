/*[IF-FLASH]*/
package laya.d3.math {
	public class Rand {
		public static function getFloatFromInt(v:Number):Number{}
		public static function getByteFromInt(v:Number):Number{}
		public var seeds:Uint32Array;
		public var seed:Number;

		public function Rand(seed:Number){}
		public function getUint():Number{}
		public function getFloat():Number{}
		public function getSignedFloat():Number{}
	}

}
