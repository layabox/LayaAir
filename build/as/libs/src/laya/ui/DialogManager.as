package laya.ui {
	import laya.display.Sprite;
	import laya.ui.Dialog;
	import laya.ui.UIComponent;
	import laya.utils.Handler;

	/**
	 * 打开任意窗口后调度。
	 * @eventType Event.OPEN
	 */

	/**
	 * 关闭任意窗口后调度。
	 * @eventType Event.CLOSE
	 */

	/**
	 * <code>DialogManager</code> 对话框管理容器，所有的对话框都在该容器内，并且受管理器管理。
	 * 任意对话框打开和关闭，都会出发管理类的open和close事件
	 * 可以通过UIConfig设置弹出框背景透明度，模式窗口点击边缘是否关闭，点击窗口是否切换层次等
	 * 通过设置对话框的zOrder属性，可以更改弹出的层次
	 */
	public class DialogManager extends Sprite {

		/**
		 * 遮罩层
		 */
		public var maskLayer:Sprite;

		/**
		 * 锁屏层
		 */
		public var lockLayer:Sprite;

		/**
		 * @private 全局默认弹出对话框效果，可以设置一个效果代替默认的弹出效果，如果不想有任何效果，可以赋值为null
		 */
		public var popupEffect:Function;

		/**
		 * @private 全局默认关闭对话框效果，可以设置一个效果代替默认的关闭效果，如果不想有任何效果，可以赋值为null
		 */
		public var closeEffect:Function;

		/**
		 * 全局默认关闭对话框效果，可以设置一个效果代替默认的关闭效果，如果不想有任何效果，可以赋值为null
		 */
		public var popupEffectHandler:Handler;

		/**
		 * 全局默认弹出对话框效果，可以设置一个效果代替默认的弹出效果，如果不想有任何效果，可以赋值为null
		 */
		public var closeEffectHandler:Handler;

		/**
		 * 创建一个新的 <code>DialogManager</code> 类实例。
		 */

		public function DialogManager(){}
		private var _closeOnSide:*;

		/**
		 * 设置锁定界面，如果为空则什么都不显示
		 */
		public function setLockView(value:UIComponent):void{}

		/**
		 * @private 
		 */
		private var _onResize:*;
		private var _centerDialog:*;

		/**
		 * 显示对话框
		 * @param dialog 需要显示的对象框 <code>Dialog</code> 实例。
		 * @param closeOther 是否关闭其它对话框，若值为ture，则关闭其它的对话框。
		 * @param showEffect 是否显示弹出效果
		 */
		public function open(dialog:Dialog,closeOther:Boolean = null,showEffect:Boolean = null):void{}

		/**
		 * @private 
		 */
		private var _clearDialogEffect:*;

		/**
		 * 执行打开对话框。
		 * @param dialog 需要关闭的对象框 <code>Dialog</code> 实例。
		 */
		public function doOpen(dialog:Dialog):void{}

		/**
		 * 锁定所有层，显示加载条信息，防止双击
		 */
		public function lock(value:Boolean):void{}

		/**
		 * 关闭对话框。
		 * @param dialog 需要关闭的对象框 <code>Dialog</code> 实例。
		 */
		public function close(dialog:Dialog):void{}

		/**
		 * 执行关闭对话框。
		 * @param dialog 需要关闭的对象框 <code>Dialog</code> 实例。
		 */
		public function doClose(dialog:Dialog):void{}

		/**
		 * 关闭所有的对话框。
		 */
		public function closeAll():void{}

		/**
		 * @private 
		 */
		private var _closeAll:*;

		/**
		 * 根据组获取所有对话框
		 * @param group 组名称
		 * @return 对话框数组
		 */
		public function getDialogsByGroup(group:String):Array{
			return null;
		}

		/**
		 * 根据组关闭所有弹出框
		 * @param group 需要关闭的组名称
		 * @return 需要关闭的对话框数组
		 */
		public function closeByGroup(group:String):Array{
			return null;
		}
	}

}
