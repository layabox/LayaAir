import { UIConfig } from "./../../UIConfig";
import { Const } from "../Const"
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"
import { Box } from "./Box"
import { Dialog } from "./Dialog"
import { UIComponent } from "./UIComponent"
import { Ease } from "../utils/Ease"
import { Handler } from "../utils/Handler"
import { Tween } from "../utils/Tween"
import { IUI } from "./IUI";
import { ClassUtils } from "../utils/ClassUtils";
import { ILaya } from "../../ILaya";

/**打开任意窗口后调度。
 * @eventType Event.OPEN
 */
/*[Event(name = "open", type = "laya.events.Event")]*/
/**关闭任意窗口后调度。
 * @eventType Event.CLOSE
 */
/*[Event(name = "close", type = "laya.events.Event")]*/

/**
 * <code>DialogManager</code> 对话框管理容器，所有的对话框都在该容器内，并且受管理器管理。
 * 任意对话框打开和关闭，都会出发管理类的open和close事件
 * 可以通过UIConfig设置弹出框背景透明度，模式窗口点击边缘是否关闭，点击窗口是否切换层次等
 * 通过设置对话框的zOrder属性，可以更改弹出的层次
 */
export class DialogManager extends Sprite {
    /**遮罩层*/
    maskLayer: Sprite = new Sprite();
    /**锁屏层*/
    lockLayer: Sprite;

    /**@private 全局默认弹出对话框效果，可以设置一个效果代替默认的弹出效果，如果不想有任何效果，可以赋值为null*/
    popupEffect = (dialog: Dialog)=>{
        dialog.scale(1, 1);
        dialog._effectTween = Tween.from(dialog, { x: ILaya.stage.width / 2, y: ILaya.stage.height / 2, scaleX: 0, scaleY: 0 }, 300, Ease.backOut, Handler.create(this, this.doOpen, [dialog]), 0, false, false);
    }

    /**@private 全局默认关闭对话框效果，可以设置一个效果代替默认的关闭效果，如果不想有任何效果，可以赋值为null*/
    closeEffect = (dialog: Dialog)=>{
        dialog._effectTween = Tween.to(dialog, { x: ILaya.stage.width / 2, y: ILaya.stage.height / 2, scaleX: 0, scaleY: 0 }, 300, Ease.strongOut, Handler.create(this, this.doClose, [dialog]), 0, false, false);
    }

    /**全局默认关闭对话框效果，可以设置一个效果代替默认的关闭效果，如果不想有任何效果，可以赋值为null*/
    popupEffectHandler: Handler = new Handler(this, this.popupEffect);
    /**全局默认弹出对话框效果，可以设置一个效果代替默认的弹出效果，如果不想有任何效果，可以赋值为null*/
    closeEffectHandler: Handler = new Handler(this, this.closeEffect);

    /**
     * 创建一个新的 <code>DialogManager</code> 类实例。
     */
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
        if (dialog instanceof IUI.Dialog) dialog.close("side");
    }

    /**设置锁定界面，如果为空则什么都不显示*/
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

    /**@private */
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

    /**
     * 显示对话框
     * @param dialog 需要显示的对象框 <code>Dialog</code> 实例。
     * @param closeOther 是否关闭其它对话框，若值为ture，则关闭其它的对话框。
     * @param showEffect 是否显示弹出效果
     */
    open(dialog: Dialog, closeOther: boolean = false, showEffect: boolean = false): void {
        if (closeOther) this._closeAll();
        this._clearDialogEffect(dialog);
        if (dialog.isPopupCenter) this._centerDialog(dialog);
        this.addChild(dialog);
        if (dialog.isModal || this._getBit(Const.HAS_ZORDER)) ILaya.timer.callLater(this, this._checkMask);
        if (showEffect && dialog.popupEffect != null) dialog.popupEffect.runWith(dialog);
        else this.doOpen(dialog);
        this.event(Event.OPEN);
    }

    /**@private */
    private _clearDialogEffect(dialog: Dialog): void {
        if (dialog._effectTween) {
            Tween.clear(dialog._effectTween);
            dialog._effectTween = null;
        }
    }

    /**
     * 执行打开对话框。
     * @param dialog 需要关闭的对象框 <code>Dialog</code> 实例。
     */
    doOpen(dialog: Dialog): void {
        dialog.onOpened(dialog._param);
    }

    /**
     * 锁定所有层，显示加载条信息，防止双击
     */
    lock(value: boolean): void {
        if (this.lockLayer) {
            if (value) this.addChild(this.lockLayer);
            else this.lockLayer.removeSelf();
        }
    }

    /**
     * 关闭对话框。
     * @param dialog 需要关闭的对象框 <code>Dialog</code> 实例。
     */
    close(dialog: Dialog): void {
        this._clearDialogEffect(dialog);
        if (dialog.isShowEffect && dialog.closeEffect != null) dialog.closeEffect.runWith([dialog]);
        else this.doClose(dialog);
        this.event(Event.CLOSE);
    }

    /**
     * 执行关闭对话框。
     * @param dialog 需要关闭的对象框 <code>Dialog</code> 实例。
     */
    doClose(dialog: Dialog): void {
        dialog.removeSelf();
        dialog.isModal && this._checkMask();
        dialog.closeHandler && dialog.closeHandler.runWith(dialog.closeType);
        dialog.onClosed(dialog.closeType);
        if (dialog.autoDestroyAtClosed) dialog.destroy();
    }

    /**
     * 关闭所有的对话框。
     */
    closeAll(): void {
        this._closeAll();
        this.event(Event.CLOSE);
    }

    /**@private */
    private _closeAll(): void {
        for (var i: number = this.numChildren - 1; i > -1; i--) {
            var item: Dialog = (<Dialog>this.getChildAt(i));
            if (item && item.close != null) {
                this.doClose(item);
            }
        }
    }

    /**
     * 根据组获取所有对话框
     * @param	group 组名称
     * @return	对话框数组
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
     * 根据组关闭所有弹出框
     * @param	group 需要关闭的组名称
     * @return	需要关闭的对话框数组
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

    /**@internal 发生层次改变后，重新检查遮罩层是否正确*/
    _checkMask(): void {
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
}


ClassUtils.regClass("laya.ui.DialogManager", DialogManager);
ClassUtils.regClass("Laya.DialogManager", DialogManager);