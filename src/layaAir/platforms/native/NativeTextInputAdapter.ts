import { Input } from "../../laya/display/Input";
import { Text } from "../../laya/display/Text";
import { Event } from "../../laya/events/Event";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { TextInputAdapter } from "../../laya/platform/TextInputAdapter";

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

        return Promise.resolve();
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

            return Promise.resolve();
        }
    }

    protected syncTransform(): void {
        let t = this.getTargetTransform();
        if (t != null) {
            (this._visEle as any).setScale(t.scaleX, t.scaleY);
            (this._visEle as any).setSize(t.width, t.height);
            (this._visEle as any).setPos(t.x, t.y);
        }
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