package laya.ui {
	import laya.ui.Clip;

	/**
	 * 字体切片，简化版的位图字体，只需设置一个切片图片和文字内容即可使用，效果同位图字体
	 * 使用方式：设置位图字体皮肤skin，设置皮肤对应的字体内容sheet（如果多行，可以使用空格换行），示例：
	 * fontClip.skin = "font1.png";//设置皮肤
	 * fontClip.sheet = "abc123 456";//设置皮肤对应的内容，空格换行。此皮肤为2行5列（显示时skin会被等分为2行5列），第一行对应的文字为"abc123"，第二行为"456"
	 * fontClip.value = "a1326";//显示"a1326"文字
	 */
	public class FontClip extends Clip {

		/**
		 * 数值
		 */
		protected var _valueArr:String;

		/**
		 * 文字内容数组*
		 */
		protected var _indexMap:*;

		/**
		 * 位图字体内容*
		 */
		protected var _sheet:String;

		/**
		 * @private 
		 */
		protected var _direction:String;

		/**
		 * X方向间隙
		 */
		protected var _spaceX:Number;

		/**
		 * Y方向间隙
		 */
		protected var _spaceY:Number;

		/**
		 * @private 水平对齐方式
		 */
		private var _align:*;

		/**
		 * @private 显示文字宽
		 */
		private var _wordsW:*;

		/**
		 * @private 显示文字高
		 */
		private var _wordsH:*;

		/**
		 * @param skin 位图字体皮肤
		 * @param sheet 位图字体内容，空格代表换行
		 */

		public function FontClip(skin:String = undefined,sheet:String = undefined){}

		/**
		 * @override 
		 */
		override protected function createChildren():void{}

		/**
		 * 资源加载完毕
		 */
		private var _onClipLoaded:*;

		/**
		 * 设置位图字体内容，空格代表换行。比如"abc123 456"，代表第一行对应的文字为"abc123"，第二行为"456"
		 */
		public function get sheet():String{return null;}
		public function set sheet(value:String):void{}

		/**
		 * 设置位图字体的显示内容
		 */
		public function get value():String{return null;}
		public function set value(value:String):void{}

		/**
		 * 布局方向。
		 * <p>默认值为"horizontal"。</p>
		 * <p><b>取值：</b>
		 * <li>"horizontal"：表示水平布局。</li>
		 * <li>"vertical"：表示垂直布局。</li>
		 * </p>
		 */
		public function get direction():String{return null;}
		public function set direction(value:String):void{}

		/**
		 * X方向文字间隙
		 */
		public function get spaceX():Number{return null;}
		public function set spaceX(value:Number):void{}

		/**
		 * Y方向文字间隙
		 */
		public function get spaceY():Number{return null;}
		public function set spaceY(value:Number):void{}
		public function set align(v:String):void{}

		/**
		 * 水平对齐方式
		 */
		public function get align():String{return null;}

		/**
		 * 渲染数值
		 */
		protected function changeValue():void{}

		/**
		 * @override 
		 */
		override public function set width(value:Number):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function get width():Number{return null;}

		/**
		 * @override 
		 */
		override public function set height(value:Number):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function get height():Number{return null;}

		/**
		 * @override 
		 */
		override protected function measureWidth():Number{
			return null;
		}

		/**
		 * @override 
		 */
		override protected function measureHeight():Number{
			return null;
		}

		/**
		 * @param destroyChild 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}
	}

}
