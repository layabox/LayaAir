import { View } from "./View";
import { DialogManager } from "./DialogManager";
import { UIUtils } from "./UIUtils";
import { Button } from "./Button";
import { UIComponent } from "./UIComponent";
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"
import { Point } from "../maths/Point"
import { Rectangle } from "../maths/Rectangle"
import { Handler } from "../utils/Handler"
import { Tween } from "../utils/Tween"

/**
 * @en The `Dialog` component is a pop-up dialog box that implements the functionality of popping up, dragging, and modal windows.
 * You can set the background transparency of the pop-up box through the `UIConfig`, and whether to close the window when clicking the edge in modal mode.
 * By setting the `zOrder` property, you can change the popup hierarchy.
 * By setting the `popupEffect` and `closeEffect`, you can set the popup and close effects. If you don't want any popup or close effects, you can set the aforementioned properties to empty.
 * @zh `Dialog` 组件是一个弹出对话框，实现对话框弹出，拖动，模式窗口功能。
 * 可以通过 `UIConfig` 设置弹出框背景透明度，模式窗口点击边缘是否关闭等。
 * 通过设置 `zOrder` 属性，可以更改弹出的层次。
 * 通过设置 `popupEffect` 和 `closeEffect` 可以设置弹出效果和关闭效果，如果不想有任何弹出关闭效果，可以设置前述属性为空。
 */
export class Dialog extends View {
    /**
     * @en If a button in the dialog is named `close`, clicking it will close the dialog.
     * @zh 对话框内的某个按钮命名为 `close`，点击此按钮则会关闭对话框。
     */
    static CLOSE: string = "close";
    /**
     * @en If a button in the dialog is named `cancel`, clicking it will close the dialog.
     * @zh 对话框内的某个按钮命名为 `cancel`，点击此按钮则会关闭对话框。
     */
    static CANCEL: string = "cancel";
    /**
     * @en If a button in the dialog is named `sure`, clicking it will close the dialog.
     * @zh 对话框内的某个按钮命名为 `sure`，点击此按钮则会关闭对话框。
     */
    static SURE: string = "sure";
    /**
     * @en If a button in the dialog is named `no`, clicking it will close the dialog.
     * @zh 对话框内的某个按钮命名为 `no`，点击此按钮则会关闭对话框。
     */
    static NO: string = "no";
    /**
     * @en If a button in the dialog is named `yes`, clicking it will close the dialog.
     * @zh 对话框内的某个按钮命名为 `yes`，点击此按钮则会关闭对话框。
     */
    static YES: string = "yes";
    /**
     * @en If a button in the dialog is named `ok`, clicking it will close the dialog.
     * @zh 对话框内的某个按钮命名为 `ok`，点击此按钮则会关闭对话框。
     */
    static OK: string = "ok";

    /** 表示对话框管理器。*/
    private static _manager: DialogManager;

    /**
     * @en
     * The dialog management container. All dialogs are inside this container and managed by the manager.
     * You can customize your own manager to change the window management process.
     * Any dialog opened or closed will trigger the `open` and `close` events of the management class.
     * @zh
     * 对话框管理容器，所有的对话框都在该容器内，并且受管理器管理，可以自定义自己的管理器，来更改窗口管理的流程。
     * 任意对话框打开和关闭，都会触发管理类的 `open` 和 `close` 事件。
     */
    static get manager(): DialogManager {
        return Dialog._manager = Dialog._manager || new DialogManager();
    }

    static set manager(value: DialogManager) {
        Dialog._manager = value;
    }

    /**
     * @en Set the lock view. Display the lock view before the interface is ready, and remove the lock layer after it is ready.
     * If it is empty, nothing will be displayed.
     * @param view The content of the lock view.
     * @zh 设置锁定界面，在界面未准备好前显示锁定界面，准备完毕后则移除锁定层，如果为空则什么都不显示
     * @param view 锁定界面内容
     */
    static setLockView(view: UIComponent): void {
        Dialog.manager.setLockView(view);
    }

    /**
     * @en Lock all layers, display loading information, and prevent the content below from being clicked.
     * @param value Whether to lock.
     * @zh 锁定所有层，显示加载条信息，防止下面内容被点击。
     * @param value 是否锁定
     */
    static lock(value: boolean): void {
        Dialog.manager.lock(value);
    }

    /**
     * @en Close all dialogs.
     * @zh 关闭所有对话框。
     */
    static closeAll(): void {
        Dialog.manager.closeAll();
    }

    /**
     * @en Get the dialog collection by group.
     * @param group The group name.
     * @returns The dialog array.
     * @zh 根据组获取对话框集合。
     * @param group 组名称
     * @returns 对话框数组
     */
    static getDialogsByGroup(group: string): any[] {
        return Dialog.manager.getDialogsByGroup(group);
    }

    /**
     * @en Close all pop-up boxes by group.
     * @param group The group name that needs to be closed.
     * @returns The closed dialogs.
     * @zh 根据组关闭所有弹出框。
     * @param group 需要关闭的组名称
     * @returns 关闭的对话框集合
     */
    static closeByGroup(group: string): any[] {
        return Dialog.manager.closeByGroup(group);
    }

    private _dragArea: Rectangle;
    /**@internal */
    _param: any;
    /**@internal */
    _effectTween: Tween;

    /**
     * @en The handler function that will be triggered when the dialog is closed.
     * The callback function parameter is the button name clicked by the user, of type `String`.
     * @zh 对话框被关闭时会触发的回调函数处理器。
     * 回调函数参数为用户点击的按钮名字name:String。
     */
    closeHandler: Handler;
    /**
     * @en The popup effect of the dialog. You can set an effect to replace the default popup effect.
     * If you don't want any effect, you can set it to `null`.
     * The default global popup effect can be set via `manager.popupEffect`.
     * @zh 弹出对话框效果，可以设置一个效果代替默认的弹出效果，如果不想有任何效果，可以赋值为null。
     * 全局默认弹出效果可以通过manager.popupEffect修改。
     */
    popupEffect: Handler;
    /**
     * @en The close effect of the dialog. You can set an effect to replace the default close effect.
     * If you don't want any effect, you can set it to `null`.
     * The default global close effect can be set via `manager.closeEffect`.
     * @zh 关闭对话框效果，可以设置一个效果代替默认的关闭效果，如果不想有任何效果，可以赋值为null。
     * 全局默认关闭效果可以通过manager.closeEffect修改。
     */
    closeEffect: Handler;
    /**
     * @en The dialog group name.
     * @zh 组名称。
     */
    group: string;
    /**
     * @en Indicates whether it is a modal dialog.
     * @zh 是否是模式窗口。
     */
    isModal: boolean;
    /**
     * @en Indicates whether to show popup effect.
     * @zh 是否显示弹出效果。
     */
    isShowEffect: boolean = true;
    /**
     * @en Specifies whether the dialog is popped up at the center.
     * If the value is `true`, the dialog will be centered. Otherwise, it will be displayed based on the object coordinates. The default value is `true`.
     * @zh 指定对话框是否居中弹出。
     * 如果值为true，则居中弹出，否则，则根据对象坐标显示，默认为true。
     */
    isPopupCenter: boolean = true;
    /**
     * @en The close type. Automatically records the name of the clicked button when its name is `"close"`, `"cancel"`, `"sure"`, `"no"`, `"yes"`, or `"no"`.
     * @zh 关闭类型，点击name为`"close"`，`"cancel"`，`"sure"`，`"no"`，`"yes"`，`"no"`的按钮时，会自动记录点击按钮的名称。
     */
    closeType: string;

    /**
     * @en Used to specify the drag area of the dialog. The default value is `"0,0,0,0"`.
     * The format is a string of `"x,y,width,height"` that represents a rectangle. For example, `"0,0,100,200"`.
     * @zh 用来指定对话框的拖拽区域。默认值为 `"0,0,0,0"`。
     * 格式：构成一个矩形所需的 x,y,width,heith 值，用逗号连接为字符串。例如："0,0,100,200"。
     */
    get dragArea(): string {
        if (this._dragArea) return this._dragArea.toString();
        return null;
    }
    set dragArea(value: string) {
        if (value) {
            var a: any[] = UIUtils.fillArray([0, 0, 0, 0], value, Number);
            this._dragArea = new Rectangle(a[0], a[1], a[2], a[3]);
            this.on(Event.MOUSE_DOWN, this, this._onMouseDown);
        } else {
            this._dragArea = null;
            this.off(Event.MOUSE_DOWN, this, this._onMouseDown);
        }
    }

    /**
     * @en The display status of the pop-up box. If the pop-up box is being displayed, it is `true`; otherwise, it is `false`.
     * @zh 弹出框的显示状态。如果弹框处于显示中，则为 `true`，否则为 `false`。
     */
    get isPopup(): boolean {
        return this.parent != null;
    }

    /**
     * @en The z-order of the dialog.
     * @zh 对话框的层级。
     */
    get zOrder() {
        return super.zOrder;
    }
    set zOrder(value: number) {
        super.zOrder = value;
        Dialog.manager._checkMask();
    }
    /** @ignore */
    constructor() {
        super();
        this.popupEffect = Dialog.manager.popupEffectHandler;
        this.closeEffect = Dialog.manager.closeEffectHandler;
        this._dealDragArea();
        this.on(Event.CLICK, this, this._onClick);
    }

    /** 提取拖拽区域*/
    protected _dealDragArea(): void {
        var dragTarget: Sprite = (<Sprite>this.getChildByName("drag"));
        if (dragTarget) {
            this.dragArea = dragTarget._x + "," + dragTarget._y + "," + dragTarget.width + "," + dragTarget.height;
            dragTarget.removeSelf();
        }
    }
    private _onMouseDown(e: Event): void {
        var point: Point = this.getMousePoint();
        if (this._dragArea.contains(point.x, point.y)) this.startDrag();
        else this.stopDrag();
    }

    /**
     * @en Handle the click event for the dialog box. Close the dialog box based on the button name.
     * @zh 处理对话框的点击事件。根据按钮的名称关闭对话框。
     * @param e 鼠标事件。
     */
    protected _onClick(e: Event): void {
        var btn: Button = (<Button>e.target);
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

    /**
     * @en Open the dialog.
     * @param closeOther Whether to close other dialogs. If the value is `true`, other dialogs will be closed. The default value is `true`.
     * @param param The parameters to pass to the dialog.
     * @zh 打开对话框。
     * @param closeOther 是否关闭其它的对话框。若值为true则关闭其它对话框。
     * @param param 传递给对话框的参数。
     */
    open(closeOther: boolean = true, param: any = null): void {
        this._dealDragArea();
        this._param = param;
        Dialog.manager.open(this, closeOther, this.isShowEffect);
        Dialog.manager.lock(false);
    }

    /**
     * @en Close the dialog.
     * @param type The reason for closing. It will be passed to the `onClosed` function.
     * @zh 关闭对话框。
     * @param type 关闭的原因，会传递给onClosed函数
     * @override
     */
    close(type: string = null): void {
        this.closeType = type;
        Dialog.manager.close(this);
    }

    /**
     * @en Destroy the dialog.
     * @param destroyChild Whether to destroy the child objects as well.
     * @zh 销毁对话框。
     * @param destroyChild 是否销毁子对象。
     */
    destroy(destroyChild: boolean = true): void {
        this.closeHandler = null;
        this.popupEffect = null;
        this.closeEffect = null;
        this._dragArea = null;
        super.destroy(destroyChild);
        Dialog.manager._checkMask();
    }

    /**
     * @en Display the dialog (non-modal).
     * @param closeOther Whether to close other dialogs. If the value is `true`, other dialogs will be closed.
     * @param showEffect Whether to show pop-up effect.
     * @zh 显示对话框（以非模式窗口方式显示）。
     * @param closeOther 是否关闭其它的对话框。若值为true则关闭其它对话框。
     * @param showEffect 是否显示弹出效果
     */
    show(closeOther: boolean = false, showEffect: boolean = true): void {
        this._open(false, closeOther, showEffect);
    }

    /**
     * @en Display the dialog (modal).
     * @param closeOther Whether to close other dialogs. If the value is `true`, other dialogs will be closed.
     * @param showEffect Whether to show pop-up effect.
     * @zh 显示对话框（以模式窗口方式显示）。
     * @param closeOther 是否关闭其它的对话框。若值为true则关闭其它对话框。
     * @param showEffect 是否显示弹出效果
     */
    popup(closeOther: boolean = false, showEffect: boolean = true): void {
        this._open(true, closeOther, showEffect);
    }

    protected _open(modal: boolean, closeOther: boolean, showEffect: boolean): void {
        this.isModal = modal;
        this.isShowEffect = showEffect;
        Dialog.manager.lock(true);
        this.open(closeOther);
    }
}