package laya.ui {
	import laya.events.Event;
	import laya.ui.Button;

	/**
	 * <code>Radio</code> 控件使用户可在一组互相排斥的选择中做出一种选择。
	 * 用户一次只能选择 <code>Radio</code> 组中的一个成员。选择未选中的组成员将取消选择该组中当前所选的 <code>Radio</code> 控件。
	 * @see laya.ui.RadioGroup
	 */
	public class Radio extends Button {

		/**
		 * @private 
		 */
		protected var _value:*;

		/**
		 * 创建一个新的 <code>Radio</code> 类实例。
		 * @param skin 皮肤。
		 * @param label 标签。
		 */

		public function Radio(skin:String = undefined,label:String = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		/**
		 * @override 
		 */
		override protected function preinitialize():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function initialize():void{}

		/**
		 * @private 对象的<code>Event.CLICK</code>事件侦听处理函数。
		 */
		protected function onClick(e:Event):void{}

		/**
		 * 获取或设置 <code>Radio</code> 关联的可选用户定义值。
		 */
		public var value:*;
	}

}
