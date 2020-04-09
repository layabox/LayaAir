package laya.ui {
	import laya.display.Graphics;
	import laya.resource.Texture;

	/**
	 * <code>AutoBitmap</code> 类是用于表示位图图像或绘制图形的显示对象。
	 * <p>封装了位置，宽高及九宫格的处理，供UI组件使用。</p>
	 */
	public class AutoBitmap extends Graphics {

		/**
		 * @private 是否自动缓存命令
		 */
		public var autoCacheCmd:Boolean;

		/**
		 * @private 宽度
		 */
		private var _width:*;

		/**
		 * @private 高度
		 */
		private var _height:*;

		/**
		 * @private 源数据
		 */
		private var _source:*;

		/**
		 * @private 网格数据
		 */
		private var _sizeGrid:*;

		/**
		 * @private 
		 */
		protected var _isChanged:Boolean;
		public var uv:Array;

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy():void{}

		/**
		 * 当前实例的有效缩放网格数据。
		 * <p>如果设置为null,则在应用任何缩放转换时，将正常缩放整个显示对象。</p>
		 * <p>数据格式：[上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)]。
		 * <ul><li>例如：[4,4,4,4,1]</li></ul></p>
		 * <p> <code>sizeGrid</code> 的值如下所示：
		 * <ol>
		 * <li>上边距</li>
		 * <li>右边距</li>
		 * <li>下边距</li>
		 * <li>左边距</li>
		 * <li>是否重复填充(值为0：不重复填充，1：重复填充)</li>
		 * </ol></p>
		 * <p>当定义 <code>sizeGrid</code> 属性时，该显示对象被分割到以 <code>sizeGrid</code> 数据中的"上边距,右边距,下边距,左边距" 组成的矩形为基础的具有九个区域的网格中，该矩形定义网格的中心区域。网格的其它八个区域如下所示：
		 * <ul>
		 * <li>矩形上方的区域</li>
		 * <li>矩形外的右上角</li>
		 * <li>矩形左侧的区域</li>
		 * <li>矩形右侧的区域</li>
		 * <li>矩形外的左下角</li>
		 * <li>矩形下方的区域</li>
		 * <li>矩形外的右下角</li>
		 * <li>矩形外的左上角</li>
		 * </ul>
		 * 同时也支持3宫格，比如0,4,0,4,1为水平3宫格，4,0,4,0,1为垂直3宫格，3宫格性能比9宫格高。
		 * </p>
		 */
		public var sizeGrid:Array;

		/**
		 * 表示显示对象的宽度，以像素为单位。
		 */
		public var width:Number;

		/**
		 * 表示显示对象的高度，以像素为单位。
		 */
		public var height:Number;

		/**
		 * 对象的纹理资源。
		 * @see laya.resource.Texture
		 */
		public var source:Texture;

		/**
		 * @private 
		 */
		protected function _setChanged():void{}

		/**
		 * @private 修改纹理资源。
		 */
		protected function changeSource():void{}
		private var drawBitmap:*;
		private static var getTexture:*;
	}

}
