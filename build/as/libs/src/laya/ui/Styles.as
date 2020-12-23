package laya.ui {

	/**
	 * <code>Styles</code> 定义了组件常用的样式属性。
	 */
	public class Styles {

		/**
		 * 默认九宫格信息。
		 * @see laya.ui.AutoBitmap#sizeGrid
		 */
		public static var defaultSizeGrid:Array;

		/**
		 * 标签颜色。
		 */
		public static var labelColor:String;

		/**
		 * 标签的边距。
		 * <p><b>格式：</b>[上边距，右边距，下边距，左边距]。</p>
		 */
		public static var labelPadding:Array;

		/**
		 * 标签的边距。
		 * <p><b>格式：</b>[上边距，右边距，下边距，左边距]。</p>
		 */
		public static var inputLabelPadding:Array;

		/**
		 * 按钮皮肤的状态数，支持1,2,3三种状态值。
		 */
		public static var buttonStateNum:Number;

		/**
		 * 按钮标签颜色。
		 * <p><b>格式：</b>[upColor,overColor,downColor,disableColor]。</p>
		 */
		public static var buttonLabelColors:Array;

		/**
		 * 下拉框项颜色。
		 * <p><b>格式：</b>[overBgColor,overLabelColor,outLabelColor,borderColor,bgColor]。</p>
		 */
		public static var comboBoxItemColors:Array;

		/**
		 * 滚动条的最小值。
		 */
		public static var scrollBarMinNum:Number;

		/**
		 * 长按按钮，等待时间，使其可激活连续滚动。
		 */
		public static var scrollBarDelayTime:Number;
	}

}
