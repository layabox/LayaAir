import { View } from "./View";
import { DialogManager } from "./DialogManager";
import { UIUtils } from "./UIUtils";
import { Event } from "../events/Event";
import { Rectangle } from "../maths/Rectangle";
import { IUI } from "./IUI";
import { ILaya } from "ILaya";
/**
 * <code>Dialog</code> 组件是一个弹出对话框，实现对话框弹出，拖动，模式窗口功能。
 * 可以通过UIConfig设置弹出框背景透明度，模式窗口点击边缘是否关闭等
 * 通过设置zOrder属性，可以更改弹出的层次
 * 通过设置popupEffect和closeEffect可以设置弹出效果和关闭效果，如果不想有任何弹出关闭效果，可以设置前述属性为空
 *
 * @example <caption>以下示例代码，创建了一个 <code>Dialog</code> 实例。</caption>
 * package
 *	{
 *		import laya.ui.Dialog;
 *		import laya.utils.Handler;
 *		public class Dialog_Example
 *		{
 *			private var dialog:Dialog_Instance;
 *			public function Dialog_Example()
 *			{
 *				Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *				Laya.loader.load("resource/ui/btn_close.png", Handler.create(this, onLoadComplete));//加载资源。
 *			}
 *			private function onLoadComplete():void
 *			{
 *				dialog = new Dialog_Instance();//创建一个 Dialog_Instance 类的实例对象 dialog。
 *				dialog.dragArea = "0,0,150,50";//设置 dialog 的拖拽区域。
 *				dialog.show();//显示 dialog。
 *				dialog.closeHandler = new Handler(this, onClose);//设置 dialog 的关闭函数处理器。
 *			}
 *			private function onClose(name:String):void
 *			{
 *				if (name == Dialog.CLOSE)
 *				{
 *					trace("通过点击 name 为" + name +"的组件，关闭了dialog。");
 *				}
 *			}
 *		}
 *	}
 *	import laya.ui.Button;
 *	import laya.ui.Dialog;
 *	import laya.ui.Image;
 *	class Dialog_Instance extends Dialog
 *	{
 *		function Dialog_Instance():void
 *		{
 *			var bg:Image = new Image("resource/ui/bg.png");
 *			bg.sizeGrid = "40,10,5,10";
 *			bg.width = 150;
 *			bg.height = 250;
 *			addChild(bg);
 *			var image:Image = new Image("resource/ui/image.png");
 *			addChild(image);
 *			var button:Button = new Button("resource/ui/btn_close.png");
 *			button.name = Dialog.CLOSE;//设置button的name属性值。
 *			button.x = 0;
 *			button.y = 0;
 *			addChild(button);
 *		}
 *	}
 * @example
 * Laya.init(640, 800);//设置游戏画布宽高、渲染模式
 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
 * var dialog;
 * Laya.loader.load("resource/ui/btn_close.png", laya.utils.Handler.create(this, loadComplete));//加载资源
 * (function (_super) {//新建一个类Dialog_Instance继承自laya.ui.Dialog。
 *     function Dialog_Instance() {
 *         Dialog_Instance.__super.call(this);//初始化父类
 *         var bg = new laya.ui.Image("resource/ui/bg.png");//新建一个 Image 类的实例 bg 。
 *         bg.sizeGrid = "10,40,10,5";//设置 bg 的网格信息。
 *         bg.width = 150;//设置 bg 的宽度。
 *         bg.height = 250;//设置 bg 的高度。
 *         this.addChild(bg);//将 bg 添加到显示列表。
 *         var image = new laya.ui.Image("resource/ui/image.png");//新建一个 Image 类的实例 image 。
 *         this.addChild(image);//将 image 添加到显示列表。
 *         var button = new laya.ui.Button("resource/ui/btn_close.png");//新建一个 Button 类的实例 bg 。
 *         button.name = laya.ui.Dialog.CLOSE;//设置 button 的 name 属性值。
 *         button.x = 0;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
 *         button.y = 0;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
 *         this.addChild(button);//将 button 添加到显示列表。
 *     };
 *     Laya.class(Dialog_Instance,"mypackage.dialogExample.Dialog_Instance",_super);//注册类Dialog_Instance。
 * })(laya.ui.Dialog);
 * function loadComplete() {
 *     console.log("资源加载完成！");
 *     dialog = new mypackage.dialogExample.Dialog_Instance();//创建一个 Dialog_Instance 类的实例对象 dialog。
 *     dialog.dragArea = "0,0,150,50";//设置 dialog 的拖拽区域。
 *     dialog.show();//显示 dialog。
 *     dialog.closeHandler = new laya.utils.Handler(this, onClose);//设置 dialog 的关闭函数处理器。
 * }
 * function onClose(name) {
 *     if (name == laya.ui.Dialog.CLOSE) {
 *         console.log("通过点击 name 为" + name + "的组件，关闭了dialog。");
 *     }
 * }
 * @example
 * import Dialog = laya.ui.Dialog;
 * import Handler = laya.utils.Handler;
 * class Dialog_Example {
 *     private dialog: Dialog_Instance;
 *     constructor() {
 *         Laya.init(640, 800);//设置游戏画布宽高。
 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *         Laya.loader.load("resource/ui/btn_close.png", Handler.create(this, this.onLoadComplete));//加载资源。
 *     }
 *     private onLoadComplete(): void {
 *         this.dialog = new Dialog_Instance();//创建一个 Dialog_Instance 类的实例对象 dialog。
 *         this.dialog.dragArea = "0,0,150,50";//设置 dialog 的拖拽区域。
 *         this.dialog.show();//显示 dialog。
 *         this.dialog.closeHandler = new Handler(this, this.onClose);//设置 dialog 的关闭函数处理器。
 *     }
 *     private onClose(name: string): void {
 *         if (name == Dialog.CLOSE) {
 *             console.log("通过点击 name 为" + name + "的组件，关闭了dialog。");
 *         }
 *     }
 * }
 * import Button = laya.ui.Button;
 * class Dialog_Instance extends Dialog {
 *     Dialog_Instance(): void {
 *         var bg: laya.ui.Image = new laya.ui.Image("resource/ui/bg.png");
 *         bg.sizeGrid = "40,10,5,10";
 *         bg.width = 150;
 *         bg.height = 250;
 *         this.addChild(bg);
 *         var image: laya.ui.Image = new laya.ui.Image("resource/ui/image.png");
 *         this.addChild(image);
 *         var button: Button = new Button("resource/ui/btn_close.png");
 *         button.name = Dialog.CLOSE;//设置button的name属性值。
 *         button.x = 0;
 *         button.y = 0;
 *         this.addChild(button);
 *     }
 * }
 */
export class Dialog extends View {
    constructor() {
        super();
        /**是否显示弹出效果*/
        this.isShowEffect = true;
        /**指定对话框是否居中弹。<p>如果值为true，则居中弹出，否则，则根据对象坐标显示，默认为true。</p>*/
        this.isPopupCenter = true;
        this.popupEffect = Dialog.manager.popupEffectHandler;
        this.closeEffect = Dialog.manager.closeEffectHandler;
        this._dealDragArea();
        this.on(Event.CLICK, this, this._onClick);
    }
    /**对话框管理容器，所有的对话框都在该容器内，并且受管理器管理，可以自定义自己的管理器，来更改窗口管理的流程。
     * 任意对话框打开和关闭，都会触发管理类的open和close事件*/
    static get manager() {
        return Dialog._manager = Dialog._manager || new DialogManager();
    }
    static set manager(value) {
        Dialog._manager = value;
    }
    /**@private 提取拖拽区域*/
    _dealDragArea() {
        var dragTarget = this.getChildByName("drag");
        if (dragTarget) {
            this.dragArea = dragTarget._x + "," + dragTarget._y + "," + dragTarget.width + "," + dragTarget.height;
            dragTarget.removeSelf();
        }
    }
    /**
     * 用来指定对话框的拖拽区域。默认值为"0,0,0,0"。
     * <p><b>格式：</b>构成一个矩形所需的 x,y,width,heith 值，用逗号连接为字符串。
     * 例如："0,0,100,200"。</p>
     * @see #includeExamplesSummary 请参考示例
     */
    get dragArea() {
        if (this._dragArea)
            return this._dragArea.toString();
        return null;
    }
    set dragArea(value) {
        if (value) {
            var a = UIUtils.fillArray([0, 0, 0, 0], value, Number);
            this._dragArea = new Rectangle(a[0], a[1], a[2], a[3]);
            this.on(Event.MOUSE_DOWN, this, this._onMouseDown);
        }
        else {
            this._dragArea = null;
            this.off(Event.MOUSE_DOWN, this, this._onMouseDown);
        }
    }
    /**@private */
    _onMouseDown(e) {
        var point = this.getMousePoint();
        if (this._dragArea.contains(point.x, point.y))
            this.startDrag();
        else
            this.stopDrag();
    }
    /**@private 处理默认点击事件*/
    _onClick(e) {
        var btn = e.target;
        if (btn) {
            switch (btn.name) {
                case Dialog.CLOSE:
                case Dialog.CANCEL:
                case Dialog.SURE:
                case Dialog.NO:
                case Dialog.OK:
                case Dialog.YES:
                    this.close(btn.name);
                    return;
            }
        }
    }
    /**@inheritDoc */
    /*override*/ open(closeOther = true, param = null) {
        this._dealDragArea();
        this._param = param;
        Dialog.manager.open(this, closeOther, this.isShowEffect);
        Dialog.manager.lock(false);
    }
    /**
     * 关闭对话框。
     * @param type 关闭的原因，会传递给onClosed函数
     */
    /*override*/ close(type = null) {
        this.closeType = type;
        Dialog.manager.close(this);
    }
    /**@inheritDoc */
    /*override*/ destroy(destroyChild = true) {
        this.closeHandler = null;
        this.popupEffect = null;
        this.closeEffect = null;
        this._dragArea = null;
        super.destroy(destroyChild);
    }
    /**
     * 显示对话框（以非模式窗口方式显示）。
     * @param closeOther 是否关闭其它的对话框。若值为true则关闭其它对话框。
     * @param showEffect 是否显示弹出效果
     */
    show(closeOther = false, showEffect = true) {
        this._open(false, closeOther, showEffect);
    }
    /**
     * 显示对话框（以模式窗口方式显示）。
     * @param closeOther 是否关闭其它的对话框。若值为true则关闭其它对话框。
     * @param showEffect 是否显示弹出效果
     */
    popup(closeOther = false, showEffect = true) {
        this._open(true, closeOther, showEffect);
    }
    /**@private */
    _open(modal, closeOther, showEffect) {
        this.isModal = modal;
        this.isShowEffect = showEffect;
        Dialog.manager.lock(true);
        this.open(closeOther);
    }
    /**弹出框的显示状态；如果弹框处于显示中，则为true，否则为false;*/
    get isPopup() {
        return this.parent != null;
    }
    /**@inheritDoc */
    /*override*/ set zOrder(value) {
        super.zOrder = value;
        Dialog.manager._checkMask();
    }
    get zOrder() {
        return super.zOrder;
    }
    /**
     * 设置锁定界面，在界面未准备好前显示锁定界面，准备完毕后则移除锁定层，如果为空则什么都不显示
     * @param	view 锁定界面内容
     */
    static setLockView(view) {
        Dialog.manager.setLockView(view);
    }
    /**
     * 锁定所有层，显示加载条信息，防止下面内容被点击
     */
    static lock(value) {
        Dialog.manager.lock(value);
    }
    /**关闭所有对话框。*/
    static closeAll() {
        Dialog.manager.closeAll();
    }
    /**
     * 根据组获取对话框集合
     * @param	group 组名称
     * @return	对话框数组
     */
    static getDialogsByGroup(group) {
        return Dialog.manager.getDialogsByGroup(group);
    }
    /**
     * 根据组关闭所有弹出框
     * @param	group 需要关闭的组名称
     */
    static closeByGroup(group) {
        return Dialog.manager.closeByGroup(group);
    }
}
/**对话框内的某个按钮命名为close，点击此按钮则会关闭*/
Dialog.CLOSE = "close";
/**对话框内的某个按钮命名为cancel，点击此按钮则会关闭*/
Dialog.CANCEL = "cancel";
/**对话框内的某个按钮命名为sure，点击此按钮则会关闭*/
Dialog.SURE = "sure";
/**对话框内的某个按钮命名为no，点击此按钮则会关闭*/
Dialog.NO = "no";
/**对话框内的某个按钮命名为yes，点击此按钮则会关闭*/
Dialog.YES = "yes";
/**对话框内的某个按钮命名为ok，点击此按钮则会关闭*/
Dialog.OK = "ok";
IUI.Dialog = Dialog;
ILaya.regClass(Dialog);
