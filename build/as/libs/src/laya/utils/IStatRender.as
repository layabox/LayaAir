package laya.utils {

	/**
	 * @author laya
	 */
	public class IStatRender {

		/**
		 * 显示性能统计信息。
		 * @param x X轴显示位置。
		 * @param y Y轴显示位置。
		 */
		public function show(x:Number = null,y:Number = null):void{}

		/**
		 * 激活性能统计
		 */
		public function enable():void{}

		/**
		 * 隐藏性能统计信息。
		 */
		public function hide():void{}

		/**
		 * 点击性能统计显示区域的处理函数。
		 */
		public function set_onclick(fn:Function):void{}
		public function isCanvasRender():Boolean{
			return null;
		}
		public function renderNotCanvas(ctx:*,x:Number,y:Number):void{}
	}

}
