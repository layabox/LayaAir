import { UIConfig } from "./../../UIConfig";
import { NodeFlags } from "../Const"
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"
import { Box } from "./Box"
import { Dialog } from "./Dialog"
import { UIComponent } from "./UIComponent"
import { Ease } from "../utils/Ease"
import { Handler } from "../utils/Handler"
import { Tween } from "../utils/Tween"
import { ILaya } from "../../ILaya";

/**
 * @en The `DialogManager` is a container for managing all dialog boxes, which are managed by the manager.
 * Opening and closing any dialog will trigger the manager's open and close events.
 * open event is used for any window after dispatching, and close event is used to dispatch events when closing any dialog.
 * The background transparency of the popup, whether the modal window closes when the edge is clicked, and whether the layer changes when the window is clicked can be set in UIConfig.
 * The layer of the popup can be changed by setting the dialog's zOrder property.
 * @zh DialogManager 对话框管理容器，所有的对话框都在该容器内，并且受管理器管理。
 * 任意对话框打开和关闭，都会触发管理类的 open 和 close 事件。
 * open事件用于任意窗口后调度，close事件用于关闭任意对话框时调度的事件。
 * 可以通过 UIConfig 设置弹出框背景透明度，模式窗口点击边缘是否关闭，点击窗口是否切换层次等。
 * 通过设置对话框的 zOrder 属性，可以更改弹出的层次。
 */
export class DialogManager extends Sprite {
    /** 
     * @en Mask layer
     * @zh 遮罩层。 
     */
    maskLayer: Sprite = new Sprite();
    /** 
     * @en Lock screen layer.
     * @zh 锁屏层。 
     */
    lockLayer: Sprite;

    /**
     * @en The global default popup effect for dialogs. You can set an effect to replace the default popup effect.
     * If you do not want any effect, you can assign it to null.
     * @zh 全局默认弹出对话框效果，可以设置一个效果代替默认的弹出效果，如果不想有任何效果，可以赋值为 null。
     */
    popupEffect = (dialog: Dialog) => {
        dialog.scale(1, 1);
        dialog._effectTween = Tween.from(dialog, { x: ILaya.stage.width / 2, y: ILaya.stage.height / 2, scaleX: 0, scaleY: 0 }, 300, Ease.backOut, Handler.create(this, this.doOpen, [dialog]), 0, false, false);
    }

    /**
     * @en The global default close effect for dialogs. You can set an effect to replace the default close effect.
     * If you do not want any effect, you can assign it to null.
     * @zh 全局默认关闭对话框效果，可以设置一个效果代替默认的关闭效果，如果不想有任何效果，可以赋值为 null。
     */
    closeEffect = (dialog: Dialog) => {
        dialog._effectTween = Tween.to(dialog, { x: ILaya.stage.width / 2, y: ILaya.stage.height / 2, scaleX: 0, scaleY: 0 }, 300, Ease.strongOut, Handler.create(this, this.doClose, [dialog]), 0, false, false);
    }

    /** 
     * @en Sets the global default opening effect for the dialog. You can specify an effect to replace the default opening effect.
     * If you do not want any effect, it can be set to null.
     * @zh 设置全局默认的对话框打开效果。可以指定一个效果来替代默认的打开效果，如果不想有任何效果，可以设置为 null。
     */
    popupEffectHandler: Handler = new Handler(this, this.popupEffect);


    /** 
     * @en Sets the global default closing effect for the dialog. You can specify an effect to replace the default closing effect.
     * If you do not want any effect, it can be set to null.
     * @zh 设置全局默认的对话框关闭效果。可以指定一个效果来替代默认的关闭效果，如果不想有任何效果，可以设置为 null。
     */
    closeEffectHandler: Handler = new Handler(this, this.closeEffect);

    /** @ignore */
    constructor() {
        super();
        this.mouseEnabled = this.maskLayer.mouseEnabled = true;
        this.zOrder = 1000;
        ILaya.stage.addChild(this);
        ILaya.stage.on(Event.RESIZE, this, this._onResize);
        if (UIConfig.closeDialogOnSide) this.maskLayer.on("click", this, this._closeOnSide);
        this._onResize(null);
    }

    private _closeOnSide(): void {
        var dialog: Dialog = (<Dialog>this.getChildAt(this.numChildren - 1));
        if (dialog instanceof Dialog) dialog.close("side");
    }

    private _onResize(e: Event = null): void {
        var width: number = this.maskLayer.width = ILaya.stage.width;
        var height: number = this.maskLayer.height = ILaya.stage.height;
        if (this.lockLayer) this.lockLayer.size(width, height);

        this.maskLayer.graphics.clear(true);
        this.maskLayer.graphics.drawRect(0, 0, width, height, UIConfig.popupBgColor);
        this.maskLayer.alpha = UIConfig.popupBgAlpha;

        for (var i: number = this.numChildren - 1; i > -1; i--) {
            var item: Dialog = (<Dialog>this.getChildAt(i));
            if (item.isPopupCenter) this._centerDialog(item);
        }
    }

    private _centerDialog(dialog: Dialog): void {
        dialog.x = Math.round(((ILaya.stage.width - dialog.width) >> 1) + dialog.pivotX);
        dialog.y = Math.round(((ILaya.stage.height - dialog.height) >> 1) + dialog.pivotY);
    }

    private _clearDialogEffect(dialog: Dialog): void {
        if (dialog._effectTween) {
            Tween.clear(dialog._effectTween);
            dialog._effectTween = null;
        }
    }

    private _closeAll(): void {
        for (var i: number = this.numChildren - 1; i > -1; i--) {
            var item: Dialog = (<Dialog>this.getChildAt(i));
            if (item && item.close != null) {
                this.doClose(item);
            }
        }
    }

    /**
     * @internal
     * @en Checks and readjusts the mask layer after a change in the z-order of dialogs.
     * @zh 发生层次改变后，重新检查遮罩层是否正确
     */
    _checkMask(): void {
        if (this._destroyed) return;
        this.maskLayer.removeSelf();
        for (var i: number = this.numChildren - 1; i > -1; i--) {
            var dialog: Dialog = (<Dialog>this.getChildAt(i));
            if (dialog && dialog.isModal) {
                //trace(numChildren,i);
                this.addChildAt(this.maskLayer, i);
                return;
            }
        }
    }

    /**
     * @en Sets the lock view. If no value is provided, the lock layer will be empty and won't display anything.
     * @param value The UIComponent to display on the lock layer, or null for an empty lock layer.
     * @zh 设置锁定界面，如果参数为空则什么都不显示。
     * @param value 要在锁定层上显示的UI组件，空锁定层为null。
     */
    setLockView(value: UIComponent): void {
        if (!this.lockLayer) {
            this.lockLayer = new Box();
            this.lockLayer.mouseEnabled = true;
            this.lockLayer.size(ILaya.stage.width, ILaya.stage.height);
        }
        this.lockLayer.removeChildren();
        if (value) {
            value.centerX = value.centerY = 0;
            this.lockLayer.addChild(value);
        }
    }

    /**
     * @en Opens a dialog.
     * @param dialog The Dialog instance to be displayed.
     * @param closeOther Whether to close other dialogs. If true, other dialogs will be closed.
     * @param showEffect Whether to show the popup effect.
     * @zh 打开对话框。
     * @param dialog 需要显示的对话框 Dialog 实例。
     * @param closeOther 是否关闭其他对话框。若为 true，则关闭其他对话框。
     * @param showEffect 是否显示弹出效果。
     */
    open(dialog: Dialog, closeOther: boolean = false, showEffect: boolean = false): void {
        if (closeOther) this._closeAll();
        this._clearDialogEffect(dialog);
        if (dialog.isPopupCenter) this._centerDialog(dialog);
        this.addChild(dialog);
        if (dialog.isModal || this._getBit(NodeFlags.HAS_ZORDER)) ILaya.timer.callLater(this, this._checkMask);
        if (showEffect && dialog.popupEffect != null) dialog.popupEffect.runWith(dialog);
        else this.doOpen(dialog);
        this.event(Event.OPEN);
    }

    /**
     * @en Executes the opening of a dialog.
     * @param dialog The Dialog instance that needs to be opened.
     * @zh 执行打开对话框操作。
     * @param dialog 需要打开的对话框 Dialog 实例。
     */
    doOpen(dialog: Dialog): void {
        dialog.onOpened(dialog._param);
    }

    /**
     * @en Locks all layers, displays loading information, and prevents double-clicking.
     * @param value If true, the lock layer is shown, otherwise it is hidden.
     * @zh 锁定所有层，显示加载信息，防止双击。
     * @param value 如果为true，则显示锁定层，否则隐藏锁定层。
     */
    lock(value: boolean): void {
        if (this.lockLayer) {
            if (value) this.addChild(this.lockLayer);
            else this.lockLayer.removeSelf();
        }
    }

    /**
     * @en Closes the dialog.
     * @param dialog The Dialog instance that needs to be closed.
     * @zh 关闭对话框。
     * @param dialog 需要关闭的对话框 Dialog 实例。
     */
    close(dialog: Dialog): void {
        this._clearDialogEffect(dialog);
        if (dialog.isShowEffect && dialog.closeEffect != null) dialog.closeEffect.runWith([dialog]);
        else this.doClose(dialog);
        this.event(Event.CLOSE);
    }


    /**
     * @en Executes the closing of a dialog.
     * @param dialog The Dialog instance that needs to be closed.
     * @zh 执行关闭对话框操作。
     * @param dialog 需要关闭的对话框 Dialog 实例。
     */
    doClose(dialog: Dialog): void {
        dialog.removeSelf();
        dialog.isModal && this._checkMask();
        dialog.closeHandler && dialog.closeHandler.runWith(dialog.closeType);
        dialog.onClosed(dialog.closeType);
        if (dialog.autoDestroyAtClosed) dialog.destroy();
    }

    /**
     * @en Closes all dialogs.
     * @zh 关闭所有对话框。
     */
    closeAll(): void {
        this._closeAll();
        this.event(Event.CLOSE);
    }

    /**
     * @en Gets all dialogs by group name.
     * @param group The name of the group.
     * @returns An array of dialogs that belong to the specified group.
     * @zh 根据组名获取所有对话框。
     * @param group 组名。
     * @returns 属于指定组的对话框数组。
     */
    getDialogsByGroup(group: string): any[] {
        var arr: any[] = [];
        for (var i: number = this.numChildren - 1; i > -1; i--) {
            var item: Dialog = (<Dialog>this.getChildAt(i));
            if (item && item.group === group) {
                arr.push(item);
            }
        }
        return arr;
    }

    /**
     * @en Closes all popups by group name.
     * @param group The name of the group to close.
     * @returns An array of dialogs that have been closed.
     * @zh 根据组名关闭所有弹出框。
     * @param group 需要关闭的组名。
     * @returns 已关闭的对话框数组。
     */
    closeByGroup(group: string): any[] {
        var arr: any[] = [];
        for (var i: number = this.numChildren - 1; i > -1; i--) {
            var item: Dialog = (<Dialog>this.getChildAt(i));
            if (item && item.group === group) {
                item.close();
                arr.push(item);
            }
        }
        return arr;
    }
}