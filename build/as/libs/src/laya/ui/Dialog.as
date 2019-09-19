package laya.ui {
	import laya.ui.View;
	import laya.ui.DialogManager;
	import laya.ui.UIComponent;
	import laya.events.Event;
	import laya.utils.Handler;

	/**
	 * <code>Dialog</code> 组件是一个弹出对话框，实现对话框弹出，拖动，模式窗口功能。
	 * 可以通过UIConfig设置弹出框背景透明度，模式窗口点击边缘是否关闭等
	 * 通过设置zOrder属性，可以更改弹出的层次
	 * 通过设置popupEffect和closeEffect可以设置弹出效果和关闭效果，如果不想有任何弹出关闭效果，可以设置前述属性为空
	 * @example <caption>以下示例代码，创建了一个 <code>Dialog</code> 实例。</caption>package{import laya.ui.Dialog;import laya.utils.Handler;public class Dialog_Example{private var dialog:Dialog_Instance;public function Dialog_Example(){Laya.init(640, 800);//设置游戏画布宽高、渲染模式。Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。Laya.loader.load("resource/ui/btn_close.png", Handler.create(this, onLoadComplete));//加载资源。}private function onLoadComplete():void{dialog = new Dialog_Instance();//创建一个 Dialog_Instance 类的实例对象 dialog。dialog.dragArea = "0,0,150,50";//设置 dialog 的拖拽区域。dialog.show();//显示 dialog。dialog.closeHandler = new Handler(this, onClose);//设置 dialog 的关闭函数处理器。}private function onClose(name:String):void{if (name == Dialog.CLOSE){trace("通过点击 name 为" + name +"的组件，关闭了dialog。");}}}}import laya.ui.Button;import laya.ui.Dialog;import laya.ui.Image;class Dialog_Instance extends Dialog{function Dialog_Instance():void{var bg:Image = new Image("resource/ui/bg.png");bg.sizeGrid = "40,10,5,10";bg.width = 150;bg.height = 250;addChild(bg);var image:Image = new Image("resource/ui/image.png");addChild(image);var button:Button = new Button("resource/ui/btn_close.png");button.name = Dialog.CLOSE;//设置button的name属性值。button.x = 0;button.y = 0;addChild(button);}}
	 * @example Laya.init(640, 800);//设置游戏画布宽高、渲染模式Laya.stage.bgColor = "#efefef";//设置画布的背景颜色var dialog;Laya.loader.load("resource/ui/btn_close.png", laya.utils.Handler.create(this, loadComplete));//加载资源(function (_super) {//新建一个类Dialog_Instance继承自laya.ui.Dialog。    function Dialog_Instance() {        Dialog_Instance.__super.call(this);//初始化父类        var bg = new laya.ui.Image("resource/ui/bg.png");//新建一个 Image 类的实例 bg 。        bg.sizeGrid = "10,40,10,5";//设置 bg 的网格信息。        bg.width = 150;//设置 bg 的宽度。        bg.height = 250;//设置 bg 的高度。        this.addChild(bg);//将 bg 添加到显示列表。        var image = new laya.ui.Image("resource/ui/image.png");//新建一个 Image 类的实例 image 。        this.addChild(image);//将 image 添加到显示列表。        var button = new laya.ui.Button("resource/ui/btn_close.png");//新建一个 Button 类的实例 bg 。        button.name = laya.ui.Dialog.CLOSE;//设置 button 的 name 属性值。        button.x = 0;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。        button.y = 0;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。        this.addChild(button);//将 button 添加到显示列表。    };    Laya.class(Dialog_Instance,"mypackage.dialogExample.Dialog_Instance",_super);//注册类Dialog_Instance。})(laya.ui.Dialog);function loadComplete() {    console.log("资源加载完成！");    dialog = new mypackage.dialogExample.Dialog_Instance();//创建一个 Dialog_Instance 类的实例对象 dialog。    dialog.dragArea = "0,0,150,50";//设置 dialog 的拖拽区域。    dialog.show();//显示 dialog。    dialog.closeHandler = new laya.utils.Handler(this, onClose);//设置 dialog 的关闭函数处理器。}function onClose(name) {    if (name == laya.ui.Dialog.CLOSE) {        console.log("通过点击 name 为" + name + "的组件，关闭了dialog。");    }}
	 * @example import Dialog = laya.ui.Dialog;import Handler = laya.utils.Handler;class Dialog_Example {    private dialog: Dialog_Instance;    constructor() {        Laya.init(640, 800);//设置游戏画布宽高。        Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。        Laya.loader.load("resource/ui/btn_close.png", Handler.create(this, this.onLoadComplete));//加载资源。    }    private onLoadComplete(): void {        this.dialog = new Dialog_Instance();//创建一个 Dialog_Instance 类的实例对象 dialog。        this.dialog.dragArea = "0,0,150,50";//设置 dialog 的拖拽区域。        this.dialog.show();//显示 dialog。        this.dialog.closeHandler = new Handler(this, this.onClose);//设置 dialog 的关闭函数处理器。    }    private onClose(name: string): void {        if (name == Dialog.CLOSE) {            console.log("通过点击 name 为" + name + "的组件，关闭了dialog。");        }    }}import Button = laya.ui.Button;class Dialog_Instance extends Dialog {    Dialog_Instance(): void {        var bg: laya.ui.Image = new laya.ui.Image("resource/ui/bg.png");        bg.sizeGrid = "40,10,5,10";        bg.width = 150;        bg.height = 250;        this.addChild(bg);        var image: laya.ui.Image = new laya.ui.Image("resource/ui/image.png");        this.addChild(image);        var button: Button = new Button("resource/ui/btn_close.png");        button.name = Dialog.CLOSE;//设置button的name属性值。        button.x = 0;        button.y = 0;        this.addChild(button);    }}
	 */
	public class Dialog extends View {

		/**
		 * 对话框内的某个按钮命名为close，点击此按钮则会关闭
		 */
		public static var CLOSE:String;

		/**
		 * 对话框内的某个按钮命名为cancel，点击此按钮则会关闭
		 */
		public static var CANCEL:String;

		/**
		 * 对话框内的某个按钮命名为sure，点击此按钮则会关闭
		 */
		public static var SURE:String;

		/**
		 * 对话框内的某个按钮命名为no，点击此按钮则会关闭
		 */
		public static var NO:String;

		/**
		 * 对话框内的某个按钮命名为yes，点击此按钮则会关闭
		 */
		public static var YES:String;

		/**
		 * 对话框内的某个按钮命名为ok，点击此按钮则会关闭
		 */
		public static var OK:String;

		/**
		 * @private 表示对话框管理器。
		 */
		private static var _manager:*;

		/**
		 * 对话框管理容器，所有的对话框都在该容器内，并且受管理器管理，可以自定义自己的管理器，来更改窗口管理的流程。
		 * 任意对话框打开和关闭，都会触发管理类的open和close事件
		 */
		public static var manager:DialogManager;

		/**
		 * 对话框被关闭时会触发的回调函数处理器。
		 * <p>回调函数参数为用户点击的按钮名字name:String。</p>
		 */
		public var closeHandler:Handler;

		/**
		 * 弹出对话框效果，可以设置一个效果代替默认的弹出效果，如果不想有任何效果，可以赋值为null
		 * 全局默认弹出效果可以通过manager.popupEffect修改
		 */
		public var popupEffect:Handler;

		/**
		 * 关闭对话框效果，可以设置一个效果代替默认的关闭效果，如果不想有任何效果，可以赋值为null
		 * 全局默认关闭效果可以通过manager.closeEffect修改
		 */
		public var closeEffect:Handler;

		/**
		 * 组名称
		 */
		public var group:String;

		/**
		 * 是否是模式窗口
		 */
		public var isModal:Boolean;

		/**
		 * 是否显示弹出效果
		 */
		public var isShowEffect:Boolean;

		/**
		 * 指定对话框是否居中弹。<p>如果值为true，则居中弹出，否则，则根据对象坐标显示，默认为true。</p>
		 */
		public var isPopupCenter:Boolean;

		/**
		 * 关闭类型，点击name为"close"，"cancel"，"sure"，"no"，"yes"，"no"的按钮时，会自动记录点击按钮的名称
		 */
		public var closeType:String;

		/**
		 * @private 
		 */
		private var _dragArea:*;

		public function Dialog(){}

		/**
		 * @private 提取拖拽区域
		 */
		protected function _dealDragArea():void{}

		/**
		 * 用来指定对话框的拖拽区域。默认值为"0,0,0,0"。
		 * <p><b>格式：</b>构成一个矩形所需的 x,y,width,heith 值，用逗号连接为字符串。
		 * 例如："0,0,100,200"。</p>
		 * @see #includeExamplesSummary 请参考示例
		 */
		public var dragArea:String;

		/**
		 * @private 
		 */
		private var _onMouseDown:*;

		/**
		 * @private 处理默认点击事件
		 */
		protected function _onClick(e:Event):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function open(closeOther:Boolean = null,param:* = null):void{}

		/**
		 * 关闭对话框。
		 * @param type 关闭的原因，会传递给onClosed函数
		 * @override 
		 */
		override public function close(type:String = null):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		/**
		 * 显示对话框（以非模式窗口方式显示）。
		 * @param closeOther 是否关闭其它的对话框。若值为true则关闭其它对话框。
		 * @param showEffect 是否显示弹出效果
		 */
		public function show(closeOther:Boolean = null,showEffect:Boolean = null):void{}

		/**
		 * 显示对话框（以模式窗口方式显示）。
		 * @param closeOther 是否关闭其它的对话框。若值为true则关闭其它对话框。
		 * @param showEffect 是否显示弹出效果
		 */
		public function popup(closeOther:Boolean = null,showEffect:Boolean = null):void{}

		/**
		 * @private 
		 */
		protected function _open(modal:Boolean,closeOther:Boolean,showEffect:Boolean):void{}

		/**
		 * 弹出框的显示状态；如果弹框处于显示中，则为true，否则为false;
		 */
		public function get isPopup():Boolean{
				return null;
		}

		/**
		 * 设置锁定界面，在界面未准备好前显示锁定界面，准备完毕后则移除锁定层，如果为空则什么都不显示
		 * @param view 锁定界面内容
		 */
		public static function setLockView(view:UIComponent):void{}

		/**
		 * 锁定所有层，显示加载条信息，防止下面内容被点击
		 */
		public static function lock(value:Boolean):void{}

		/**
		 * 关闭所有对话框。
		 */
		public static function closeAll():void{}

		/**
		 * 根据组获取对话框集合
		 * @param group 组名称
		 * @return 对话框数组
		 */
		public static function getDialogsByGroup(group:String):Array{
			return null;
		}

		/**
		 * 根据组关闭所有弹出框
		 * @param group 需要关闭的组名称
		 */
		public static function closeByGroup(group:String):Array{
			return null;
		}
	}

}
