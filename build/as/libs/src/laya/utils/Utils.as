package laya.utils {
	import laya.display.Sprite;
	import laya.display.Stage;
	import laya.maths.Rectangle;

	/**
	 * <code>Utils</code> 是工具类。
	 */
	public class Utils {

		/**
		 * @private 
		 */
		public static var gStage:Stage;

		/**
		 * @private 
		 */
		private static var _gid:*;

		/**
		 * @private 
		 */
		private static var _pi:*;

		/**
		 * @private 
		 */
		private static var _pi2:*;

		/**
		 * @private 
		 */
		protected static var _extReg:RegExp;

		/**
		 * 角度转弧度。
		 * @param angle 角度值。
		 * @return 返回弧度值。
		 */
		public static function toRadian(angle:Number):Number{
			return null;
		}

		/**
		 * 弧度转换为角度。
		 * @param radian 弧度值。
		 * @return 返回角度值。
		 */
		public static function toAngle(radian:Number):Number{
			return null;
		}

		/**
		 * 将传入的 uint 类型颜色值转换为字符串型颜色值。
		 * @param color 颜色值。
		 * @return 字符串型颜色值。
		 */
		public static function toHexColor(color:Number):String{
			return null;
		}

		/**
		 * 获取一个全局唯一ID。
		 */
		public static function getGID():Number{
			return null;
		}

		/**
		 * 将字符串解析成 XML 对象。
		 * @param value 需要解析的字符串。
		 * @return js原生的XML对象。
		 */
		public static var parseXMLFromString:Function;

		/**
		 * @private <p>连接数组。和array的concat相比，此方法不创建新对象</p><b>注意：</b>若 参数 a 不为空，则会改变参数 source 的值为连接后的数组。
		 * @param source 待连接的数组目标对象。
		 * @param array 待连接的数组对象。
		 * @return 连接后的数组。
		 */
		public static function concatArray(source:Array,array:Array):Array{
			return null;
		}

		/**
		 * @private 清空数组对象。
		 * @param array 数组。
		 * @return 清空后的 array 对象。
		 */
		public static function clearArray(array:Array):Array{
			return null;
		}

		/**
		 * @private 清空source数组，复制array数组的值。
		 * @param source 需要赋值的数组。
		 * @param array 新的数组值。
		 * @return 复制后的数据 source 。
		 */
		public static function copyArray(source:Array,array:Array):Array{
			return null;
		}

		/**
		 * @private 根据传入的显示对象 <code>Sprite</code> 和此显示对象上的 两个点，返回此对象上的两个点在舞台坐标系上组成的最小的矩形区域对象。
		 * @param sprite 显示对象 <code>Sprite</code>。
		 * @param x0 点一的 X 轴坐标点。
		 * @param y0 点一的 Y 轴坐标点。
		 * @param x1 点二的 X 轴坐标点。
		 * @param y1 点二的 Y 轴坐标点。
		 * @return 两个点在舞台坐标系组成的矩形对象 <code>Rectangle</code>。
		 */
		public static function getGlobalRecByPoints(sprite:Sprite,x0:Number,y0:Number,x1:Number,y1:Number):Rectangle{
			return null;
		}

		/**
		 * 计算传入的显示对象 <code>Sprite</code> 的全局坐标系的坐标和缩放值，返回 <code>Rectangle</code> 对象存放计算出的坐标X值、Y值、ScaleX值、ScaleY值。
		 * @param sprite <code>Sprite</code> 对象。
		 * @return 矩形对象 <code>Rectangle</code>
		 */
		public static function getGlobalPosAndScale(sprite:Sprite):Rectangle{
			return null;
		}

		/**
		 * 给传入的函数绑定作用域，返回绑定后的函数。
		 * @param fun 函数对象。
		 * @param scope 函数作用域。
		 * @return 绑定后的函数。
		 */
		public static function bind(fun:Function,scope:*):Function{
			return null;
		}

		/**
		 * @private 对传入的数组列表，根据子项的属性 Z 值进行重新排序。返回是否已重新排序的 Boolean 值。
		 * @param array 子对象数组。
		 * @return Boolean 值，表示是否已重新排序。
		 */
		public static function updateOrder(array:Array):Boolean{
			return null;
		}

		/**
		 * @private 批量移动点坐标。
		 * @param points 坐标列表。
		 * @param x x轴偏移量。
		 * @param y y轴偏移量。
		 */
		public static function transPointList(points:Array,x:Number,y:Number):void{}

		/**
		 * 解析一个字符串，并返回一个整数。和JS原生的parseInt不同：如果str为空或者非数字，原生返回NaN，这里返回0。
		 * @param str 要被解析的字符串。
		 * @param radix 表示要解析的数字的基数。默认值为0，表示10进制，其他值介于 2 ~ 36 之间。如果它以 “0x” 或 “0X” 开头，将以 16 为基数。如果该参数不在上述范围内，则此方法返回 0。
		 * @return 返回解析后的数字。
		 */
		public static function parseInt(str:String,radix:Number = null):Number{
			return null;
		}

		/**
		 * @private 
		 */
		public static function getFileExtension(path:String):String{
			return null;
		}

		/**
		 * 获取指定区域内相对于窗口左上角的transform。
		 * @param coordinateSpace 坐标空间，不能是Stage引用
		 * @param x 相对于coordinateSpace的x坐标
		 * @param y 相对于coordinateSpace的y坐标
		 * @return 
		 */
		public static function getTransformRelativeToWindow(coordinateSpace:Sprite,x:Number,y:Number):*{}

		/**
		 * 使DOM元素使用舞台内的某块区域内。
		 * @param dom DOM元素引用
		 * @param coordinateSpace 坐标空间，不能是Stage引用
		 * @param x 相对于coordinateSpace的x坐标
		 * @param y 相对于coordinateSpace的y坐标
		 * @param width 宽度
		 * @param height 高度
		 */
		public static function fitDOMElementInArea(dom:*,coordinateSpace:Sprite,x:Number,y:Number,width:Number,height:Number):void{}

		/**
		 * @private 是否是可用的Texture数组
		 * @param textureList 
		 * @return 
		 */
		public static function isOkTextureList(textureList:Array):Boolean{
			return null;
		}

		/**
		 * @private 是否是可用的绘图指令数组
		 * @param cmds 
		 * @return 
		 */
		public static function isOKCmdList(cmds:Array):Boolean{
			return null;
		}

		/**
		 * 获得URL参数值
		 * @param name 参数名称
		 * @return 参数值
		 */
		public static function getQueryString(name:String):String{
			return null;
		}
	}

}
