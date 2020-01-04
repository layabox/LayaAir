package laya.utils {
	import laya.utils.IStatRender;

	/**
	 * 显示Stat的结果。由于stat会引入很多的循环引用，所以把显示部分拆开
	 * @author laya
	 */
	public class StatUI extends IStatRender {
		private static var _fontSize:*;
		private var _txt:*;
		private var _leftText:*;
		private var _canvas:*;
		private var _ctx:*;
		private var _first:*;
		private var _vx:*;
		private var _width:*;
		private var _height:*;
		private var _view:*;

		/**
		 * @override 显示性能统计信息。
		 * @param x X轴显示位置。
		 * @param y Y轴显示位置。
		 */
		override public function show(x:Number = null,y:Number = null):void{}
		private var createUIPre:*;
		private var createUI:*;

		/**
		 * @override 激活性能统计
		 */
		override public function enable():void{}

		/**
		 * @override 隐藏性能统计信息。
		 */
		override public function hide():void{}

		/**
		 * @override 点击性能统计显示区域的处理函数。
		 */
		override public function set_onclick(fn:Function):void{}

		/**
		 * @private 性能统计参数计算循环处理函数。
		 */
		public function loop():void{}
		private var renderInfoPre:*;
		private var renderInfo:*;

		/**
		 * @override 
		 */
		override public function isCanvasRender():Boolean{
			return null;
		}

		/**
		 * @override 非canvas模式的渲染
		 */
		override public function renderNotCanvas(ctx:*,x:Number,y:Number):void{}
	}

}
