package laya.ani.bone {
	import laya.maths.Matrix;
	
	/**
	 * @private
	 */
	public class Transform {
		
		public var skX:Number = 0;		// 旋转？
		public var skY:Number = 0;		// 不知道干什么的
		public var scX:Number = 1;		// 缩放
		public var scY:Number = 1;
		public var x:Number = 0;		// 偏移
		public var y:Number = 0;
		public var skewX:Number = 0;	// skew
		public var skewY:Number = 0;
		private var mMatrix:Matrix;
		
		//TODO:coverage
		public function initData(data:*):void {
			if (data.x != undefined) {
				x = data.x;
			}
			if (data.y != undefined) {
				y = data.y;
			}
			if (data.skX != undefined) {
				skX = data.skX;
			}
			if (data.skY != undefined) {
				skY = data.skY;
			}
			if (data.scX != undefined) {
				scX = data.scX;
			}
			if (data.scY != undefined) {
				scY = data.scY;
			}
		}
		
		//TODO:coverage
		public function getMatrix():Matrix {
			var tMatrix:Matrix;
			if (mMatrix) {
				tMatrix = mMatrix;
			} else {
				tMatrix = mMatrix = new Matrix();
			}
			
			tMatrix.identity();
			tMatrix.scale(scX, scY);
			if (skewX || skewY) {
				skew(tMatrix, skewX * Math.PI / 180, skewY * Math.PI / 180);
			}
			tMatrix.rotate(skX * Math.PI / 180);
			tMatrix.translate(x, y);
			
			return tMatrix;
		}
		
		//TODO:coverage
		public function skew(m:Matrix,x:Number, y:Number):Matrix {
			var sinX:Number = Math.sin(y);
			var cosX:Number = Math.cos(y);
			var sinY:Number = Math.sin(x);
			var cosY:Number = Math.cos(x);

			m.setTo(m.a  * cosY - m.b  * sinX,
					m.a  * sinY + m.b  * cosX,
					m.c  * cosY - m.d  * sinX,
					m.c  * sinY + m.d  * cosX,
					m.tx * cosY - m.ty * sinX,
					m.tx * sinY + m.ty * cosX);
			return m;
		}
	}
}