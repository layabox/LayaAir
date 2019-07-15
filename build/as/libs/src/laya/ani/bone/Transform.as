/*[IF-FLASH]*/
package laya.ani.bone {
	improt laya.maths.Matrix;
	public class Transform {
		public var skX:Number;
		public var skY:Number;
		public var scX:Number;
		public var scY:Number;
		public var x:Number;
		public var y:Number;
		public var skewX:Number;
		public var skewY:Number;
		private var mMatrix:*;
		public function initData(data:*):void{}
		public function getMatrix():Matrix{}
		public function skew(m:Matrix,x:Number,y:Number):Matrix{}
	}

}
