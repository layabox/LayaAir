/*[IF-FLASH]*/
package laya.maths {
	public class MathUtil {
		public static function subtractVector3(l:Float32Array,r:Float32Array,o:Float32Array):void{}
		public static function lerp(left:Number,right:Number,amount:Number):Number{}
		public static function scaleVector3(f:Float32Array,b:Number,e:Float32Array):void{}
		public static function lerpVector3(l:Float32Array,r:Float32Array,t:Number,o:Float32Array):void{}
		public static function lerpVector4(l:Float32Array,r:Float32Array,t:Number,o:Float32Array):void{}
		public static function slerpQuaternionArray(a:Float32Array,Offset1:Number,b:Float32Array,Offset2:Number,t:Number,out:Float32Array,Offset3:Number):Float32Array{}
		public static function getRotation(x0:Number,y0:Number,x1:Number,y1:Number):Number{}
		public static function sortBigFirst(a:Number,b:Number):Number{}
		public static function sortSmallFirst(a:Number,b:Number):Number{}
		public static function sortNumBigFirst(a:*,b:*):Number{}
		public static function sortNumSmallFirst(a:*,b:*):Number{}
		public static function sortByKey(key:String,bigFirst:Boolean = null,forceNum:Boolean = null):Function{}
	}

}
