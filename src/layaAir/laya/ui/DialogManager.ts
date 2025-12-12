import { UIConfig } from "./../../UIConfig";
import { NodeFlags } from "../Const"
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"
import { Box } from "./Box"
import { Dialog } from "./Dialog"
import { UIComponent } from "./UIComponent"
import { Widget } from "../components/Widget"
import { Ease } from "../tween/Ease"
import { Handler } from "../utils/Handler"
import { Tween } from "../tween/Tween"
import { ILaya } from "../../ILaya";

    /**
     * @zh DialogManager 对话框管理容器，统一管理弹窗；打开/关闭会触发 open/close 事件。可通过 UIConfig 设置弹出背景透明度、是否点边关闭、是否点击切层等；调整 dialog.zOrder 改变层级。
     * @en DialogManager manages all dialogs; open/close dispatch open/close events. UIConfig controls popup bg alpha, edge-close, layer switch; dialog.zOrder sets popup order.
     */
export class DialogManager extends Sprite {
    /**
     * @zh 遮罩层。
     * @en Mask layer.
     */
    maskLayer: Sprite = new Sprite();
    /**
     * @zh 锁屏层。
     * @en Lock screen layer.
     */
    lockLayer: Sprite;

    /**
     * @zh 全局默认弹出效果；可替换或置 null 关闭。
     * @en Global default popup effect; replace or set null to disable.
     */
    popupEffect = (dialog: Dialog) => {
        if (dialog._effectTween != null)
            Tween.kill(dialog._effectTween);

        // 记录目标状态
        const tx = dialog.x;
        const ty = dialog.y;
        const tsx = dialog.scaleX;
        const tsy = dialog.scaleY;

        // 起始：舞台中心，缩放 0
        dialog.pos(Math.round(ILaya.stage.width * 0.5), Math.round(ILaya.stage.height * 0.5));
        dialog.scale(0, 0);

        dialog._effectTween = Tween.create(dialog)
            .duration(300)
            .ease(Ease.backOut)
            .to("x", tx)
            .to("y", ty)
            .to("scaleX", tsx)
            .to("scaleY", tsy)
            .then(() => {
                this.doOpen(dialog);
            });
    }

    /**
     * @zh 全局默认关闭效果；可替换或置 null 关闭。
     * @en Global default close effect; replace or set null to disable.
     */
    closeEffect = (dialog: Dialog) => {
        if (dialog._effectTween != null)
            Tween.kill(dialog._effectTween);

        // 记录目标状态
        const tx = dialog.x;
        const ty = dialog.y;
        const tsx = dialog.scaleX;
        const tsy = dialog.scaleY;

        dialog._effectTween = Tween.create(dialog)
            .duration(300)
            .ease(Ease.strongOut)
            .to("x", Math.round(ILaya.stage.width * 0.5))
            .to("y", Math.round(ILaya.stage.height * 0.5))
            .to("scaleX", 0)
            .to("scaleY", 0)
            .then(() => {
                dialog.pos(tx, ty);
                dialog.scale(tsx, tsy);
                this.doClose(dialog);
            });
    }

    /**
     * @zh 全局默认打开效果 Handler，可替换或置 null。
     * @en Handler for global default open effect; replace or set null.
     */
    popupEffectHandler: Handler = new Handler(this, this.popupEffect);


    /**
     * @zh 全局默认关闭效果 Handler，可替换或置 null。
     * @en Handler for global default close effect; replace or set null.
     */
    closeEffectHandler: Handler = new Handler(this, this.closeEffect);

    /** @ignore */
    constructor() {
        super();
        this.mouseEnabled = true;
        this.mouseThrough = true; // 允许穿透父容器，但子节点(遮罩)仍可接收事件
        this.maskLayer.mouseEnabled = true;
        this.zOrder = 1000;
        ILaya.stage.addChild(this);
        ILaya.stage.on(Event.RESIZE, this, this._onResize);
        if (UIConfig.closeDialogOnSide) this.maskLayer.on("click", this, this._closeOnSide);
        this._onResize(null);
    }

    private _closeOnSide(): void {
        if (this.numChildren <= 0) return;
        var dialog: Dialog = (<Dialog>this.getChildAt(this.numChildren - 1));
        if (dialog instanceof Dialog) dialog.close("side");
    }

    private _onResize(e: Event = null): void {
        var width: number = ILaya.stage.width;
        var height: number = ILaya.stage.height;
        this.size(width, height);
        this.maskLayer.size(width, height);
        if (this.lockLayer) this.lockLayer.size(width, height);

        this.maskLayer.graphics.clear(true);
        this.maskLayer.graphics.drawRect(0, 0, width, height, UIConfig.popupBgColor);
        this.maskLayer.alpha = UIConfig.popupBgAlpha;
        this.event(Event.RESIZE); 
        for (var i: number = this.numChildren - 1; i > -1; i--) {
            var item: Dialog = (<Dialog>this.getChildAt(i));
            if (item.isPopupCenter && !this._hasLayout(item as any)) this._centerDialog(item);
        }
    }

    /**
     * @zh 检查是否设置相对布局（left/right/top/bottom/centerX/centerY）。
     * @en Check whether relative layout is set (left/right/top/bottom/centerX/centerY).
     */
    private _hasLayout(item: any): boolean {
        const w = (item as any)._widget as Widget;
        if (!w || w === Widget.EMPTY) return false;
        return w.left != null || w.right != null || w.top != null || w.bottom != null || w.centerX != null || w.centerY != null;
    }

    private _centerDialog(dialog: Dialog): void {
        dialog.x = Math.round(((ILaya.stage.width - dialog.width) >> 1) + dialog.pivotX);
        dialog.y = Math.round(((ILaya.stage.height - dialog.height) >> 1) + dialog.pivotY);
    }

    private _clearDialogEffect(dialog: Dialog): void {
        if (dialog._effectTween) {
            Tween.kill(dialog._effectTween);
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
     * @zh 重新检查遮罩层位置（z 变更后）。
     * @en Re-check mask layer after z-order changes.
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
     * @zh 设置锁定界面，value 为空则不显示。
     * @param value 要显示在锁定层的 UIComponent，空则不显示。
     * @en Set lock view; shows nothing when value is null.
     * @param value UIComponent to show on lock layer, null to show nothing.
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
     * @zh 打开对话框。
     * @param dialog 需要显示的对话框实例。
     * @param closeOther 是否关闭其他对话框，默认 false。
     * @param showEffect 是否显示弹出效果。
     * @en Open a dialog.
     * @param dialog Dialog instance to display.
     * @param closeOther Whether to close other dialogs; default false.
     * @param showEffect Whether to show popup effect.
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
     * @zh 执行打开逻辑。
     * @param dialog 需要打开的对话框。
     * @en Execute dialog open.
     * @param dialog Dialog instance.
     */
    doOpen(dialog: Dialog): void {
        dialog.onOpened(dialog._param);
    }

    /**
     * @zh 锁定所有层，显示加载信息，防止双击。
     * @param value 如果为true，则显示锁定层，否则隐藏锁定层。
     * @en Locks all layers, displays loading information, and prevents double-clicking.
     * @param value If true, the lock layer is shown, otherwise it is hidden.
     */
    lock(value: boolean): void {
        if (this.lockLayer) {
            if (value) this.addChild(this.lockLayer);
            else this.lockLayer.removeSelf();
        }
    }

    /**
     * @zh 关闭对话框。
     * @param dialog 需要关闭的对话框 Dialog 实例。
     * @en Closes the dialog.
     * @param dialog The Dialog instance that needs to be closed.
     */
    close(dialog: Dialog): void {
        this._clearDialogEffect(dialog);
        if (dialog.isShowEffect && dialog.closeEffect != null) dialog.closeEffect.runWith([dialog]);
        else this.doClose(dialog);
        this.event(Event.CLOSE);
    }


    /**
     * @zh 执行关闭对话框操作。
     * @param dialog 需要关闭的对话框 Dialog 实例。
     * @en Executes the closing of a dialog.
     * @param dialog The Dialog instance that needs to be closed.
     */
    doClose(dialog: Dialog): void {
        dialog.removeSelf();
        dialog.isModal && this._checkMask();
        dialog.closeHandler && dialog.closeHandler.runWith(dialog.closeType);
        dialog.onClosed(dialog.closeType);
        if (dialog.autoDestroyAtClosed) dialog.destroy();
    }

    /**
     * @zh 关闭所有对话框。
     * @en Closes all dialogs.
     */
    closeAll(): void {
        this._closeAll();
        this.event(Event.CLOSE);
    }

    /**
     * @zh 根据组名获取所有对话框。
     * @param group 组名。
     * @returns 属于指定组的对话框数组。
     * @en Gets all dialogs by group name.
     * @param group The name of the group.
     * @returns An array of dialogs that belong to the specified group.
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
     * @zh 根据组名关闭所有弹出框。
     * @param group 需要关闭的组名。
     * @returns 已关闭的对话框数组。
     * @en Closes all popups by group name.
     * @param group The name of the group to close.
     * @returns An array of dialogs that have been closed.
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