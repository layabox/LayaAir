import { ILaya } from "../../ILaya";
import { Input } from "../../laya/display/Input";
import { Text } from "../../laya/display/Text";
import { Event } from "../../laya/events/Event";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { TextInputAdapter } from "../../laya/platform/TextInputAdapter";
import { SpriteUtils } from "../../laya/utils/SpriteUtils";

export class NativeTextInputAdapter extends TextInputAdapter {

    constructor() {
        super();

        this._editInline = (window as any).conchConfig.getOS() === "Conch-window";

        if (!this._editInline) {
            PAL.g.onKeyboardInput(this.onKeyboardInput.bind(this));
            PAL.g.onKeyboardConfirm(this.onKeyboardConfirm.bind(this));
            PAL.g.onKeyboardComplete(this.onKeyboardComplete.bind(this));
        }
    }

    setText(value: string): void {
        PAL.g.updateKeyboard({ value });
    }

    protected onBegin(): Promise<void> {
        if (!this._editInline)
            return Promise.resolve();

        this.showInputElement();

        let ele = this._visEle;
        let target = this.target;

        (ele as any).setType(this.target.type);
        (ele as any).setForbidEdit(!this.target.editable);
        (ele as any).setMultiAble(target.multiline);
        if (target.bgColor)
            (ele as any).setBgColor(target.bgColor);

        ele.maxLength = target.maxChars <= 0 ? 1E5 : target.maxChars;
        ele.value = target.text;
        ele.placeholder = target.prompt;

        let style = ele.style;
        style.fontFamily = target.realFont;
        style.color = target.color;
        style.fontSize = target.fontSize + 'px';
        style.whiteSpace = (target.wordWrap ? "pre-wrap" : "nowrap");
        style.lineHeight = (target.leading + target.fontSize) + "px";
        style.fontStyle = (target.italic ? "italic" : "normal");
        style.fontWeight = (target.bold ? "bold" : "normal");
        style.textAlign = target.align;
        style.padding = "0 0";
        style.direction = Text.RightToLeft ? "rtl" : "";

        this.setPromptColor();
        this.syncTransform();

        PAL.browser.on(Event.RESIZE, this, this._onResize);//覆盖Stage的resize事件
        ILaya.stage.on(Event.RESIZE, this, this.syncTransform);
        return Promise.resolve();
    }
    private _onResize() {
        // 弹出输入法不应对画布进行resize。
        //if (PAL.textInput.target) return;
        if (ILaya.stage.screenAdaptationEnabled) {
            ILaya.stage.event(Event.WILL_RESIZE);
            ILaya.stage.updateCanvasSize(true);
        }
    }

    protected onCanShowKeyboard(): Promise<void> {
        if (this._editInline)
            return super.onCanShowKeyboard();

        let target = this.target;
        if (!target.editable)
            return Promise.resolve();

        return new Promise<any>((resolve, reject) => {
            PAL.g.showKeyboard({
                defaultValue: target.text,
                maxLength: target.maxChars <= 0 ? 1E5 : target.maxChars,
                multiple: target.multiline,
                confirmHold: true,
                confirmType: target.confirmType,
                keyboardType: 'text',
                success: resolve,
                fail: reject
            });
        });
    }

    protected onEnd(target: Input, complete: boolean, switching: boolean): Promise<void> {
        if (!this._editInline) {
            if (complete || switching) //如果是键盘自己收回，或者是切换输入框的情况，无需调用关闭键盘
                return Promise.resolve();

            return new Promise<any>((resolve, reject) => {
                PAL.g.hideKeyboard({ success: resolve, fail: reject });
            });
        }
        else {
            target.text = this._visEle.value;

            this._visEle.blur();
            this.hideInputElement();
            this._visEle = null;
            PAL.browser.off(Event.RESIZE, this, this._onResize);
            ILaya.stage.off(Event.RESIZE, this, this.syncTransform);
            return Promise.resolve();
        }
    }

    protected syncTransform(): void {
        let padding = this.target.padding;
        let { x, y, scaleX, scaleY } = SpriteUtils.getTransformRelativeToWindow(this.target, padding[3], padding[0]);
        let w = this.target.width - padding[1] - padding[3];
        let h = this.target.height - padding[0] - padding[2];

        (this._visEle as any).setScale(scaleX, scaleY);
        (this._visEle as any).setSize(w, h);
        (this._visEle as any).setPos(x, y);
    }

    protected hideInputElement(): void {
        if (this._editInline)
            (this._visEle as any).setPos(-10000, -10000);
    }

    private onKeyboardInput(ev: WechatMinigame.OnKeyboardInputListenerResult) {
        let str = this.validateText(ev.value);
        if (this.updateTargetText(str))
            this.target.event(Event.INPUT);
    }

    private onKeyboardConfirm(ev: WechatMinigame.OnKeyboardInputListenerResult) {
        if (!this.target)
            return;
        this.onKeyboardInput(ev);
        this.target.event(Event.ENTER);
        this.end();
    }

    private onKeyboardComplete(ev: WechatMinigame.OnKeyboardInputListenerResult) {
        this.end(true);
    }
}

PAL.register("textInput", NativeTextInputAdapter);