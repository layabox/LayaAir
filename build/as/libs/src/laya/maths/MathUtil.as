package laya.maths {

	/**
	 * @private <code>MathUtil</code> 是一个数据处理工具类。
	 */
	public class MathUtil {
		public static function subtractVector3(l:Float32Array,r:Float32Array,o:Float32Array):void{}
		public static function lerp(left:Number,right:Number,amount:Number):Number{
			return null;
		}
		public static function scaleVector3(f:Float32Array,b:Number,e:Float32Array):void{}
		public static function lerpVector3(l:Float32Array,r:Float32Array,t:Number,o:Float32Array):void{}
		public static function lerpVector4(l:Float32Array,r:Float32Array,t:Number,o:Float32Array):void{}
		public static function slerpQuaternionArray(a:Float32Array,Offset1:Number,b:Float32Array,Offset2:Number,t:Number,out:Float32Array,Offset3:Number):Float32Array{
			return null;
		}

		/**
		 * 获取指定的两个点组成的线段的角度值。
		 * @param x0 点一的 X 轴坐标值。
		 * @param y0 点一的 Y 轴坐标值。
		 * @param x1 点二的 X 轴坐标值。
		 * @param y1 点二的 Y 轴坐标值。
		 * @return 角度值。
		 */
		public static function getRotation(x0:Number,y0:Number,x1:Number,y1:Number):Number{
			return null;
		}

		/**
		 * 一个用来确定数组元素排序顺序的比较函数。
		 * @param a 待比较数字。
		 * @param b 待比较数字。
		 * @return 如果a等于b 则值为0；如果b>a则值为1；如果b<则值为-1。
		 */
		public static function sortBigFirst(a:Number,b:Number):Number{
			return null;
		}

		/**
		 * 一个用来确定数组元素排序顺序的比较函数。
		 * @param a 待比较数字。
		 * @param b 待比较数字。
		 * @return 如果a等于b 则值为0；如果b>a则值为-1；如果b<则值为1。
		 */
		public static function sortSmallFirst(a:Number,b:Number):Number{
			return null;
		}

		/**
		 * 将指定的元素转为数字进行比较。
		 * @param a 待比较元素。
		 * @param b 待比较元素。
		 * @return b、a转化成数字的差值 (b-a)。
		 */
		public static function sortNumBigFirst(a:*,b:*):Number{
			return null;
		}

		/**
		 * 将指定的元素转为数字进行比较。
		 * @param a 待比较元素。
		 * @param b 待比较元素。
		 * @return a、b转化成数字的差值 (a-b)。
		 */
		public static function sortNumSmallFirst(a:*,b:*):Number{
			return null;
		}

		/**
		 * 返回根据对象指定的属性进行排序的比较函数。
		 * @param key 排序要依据的元素属性名。
		 * @param bigFirst 如果值为true，则按照由大到小的顺序进行排序，否则按照由小到大的顺序进行排序。
		 * @param forceNum 如果值为true，则将排序的元素转为数字进行比较。
		 * @return 排序函数。
		 */
		public static function sortByKey(key:String,bigFirst:Boolean = null,forceNum:Boolean = null):Function{
			return null;
		}
	}

}
