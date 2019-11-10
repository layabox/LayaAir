package laya.events {

	/**
	 * <p><code>KeyLocation</code> 类包含表示在键盘或类似键盘的输入设备上按键位置的常量。</p>
	 * <p><code>KeyLocation</code> 常数用在键盘事件对象的 <code>keyLocation </code>属性中。</p>
	 */
	public class KeyLocation {

		/**
		 * 表示激活的键不区分位于左侧还是右侧，也不区分是否位于数字键盘（或者是使用对应于数字键盘的虚拟键激活的）。
		 */
		public static var STANDARD:Number;

		/**
		 * 表示激活的键在左侧键位置（此键有多个可能的位置）。
		 */
		public static var LEFT:Number;

		/**
		 * 表示激活的键在右侧键位置（此键有多个可能的位置）。
		 */
		public static var RIGHT:Number;

		/**
		 * <p>表示激活的键位于数字键盘或者是使用对应于数字键盘的虚拟键激活的。</p>
		 * <p>注意：此属性只在flash模式下有效。</p>
		 */
		public static var NUM_PAD:Number;
	}

}
