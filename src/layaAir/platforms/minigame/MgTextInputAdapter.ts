import { Input } from "../../laya/display/Input";
import { Event } from "../../laya/events/Event";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { TextInputAdapter } from "../../laya/platform/TextInputAdapter";

export class MgTextInputAdapter extends TextInputAdapter {

    constructor() {
        super();

        this._editInline = false;

        PAL.g.onKeyboardInput(this.onKeyboardInput.bind(this));
        PAL.g.onKeyboardConfirm(this.onKeyboardConfirm.bind(this));
        PAL.g.onKeyboardComplete(this.onKeyboardComplete.bind(this));
    }

    setText(value: string): void {
        PAL.g.updateKeyboard({ value });
    }

    protected onBegin(): Promise<void> {
        return Promise.resolve();
    }

    protected onCanShowKeyboard(): Promise<void> {
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
        if (complete || switching) //如果是键盘自己收回，或者是切换输入框的情况，无需调用关闭键盘
            return Promise.resolve();

        return new Promise<any>((resolve, reject) => {
            PAL.g.hideKeyboard({ success: resolve, fail: reject });
        });
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

PAL.register("textInput", MgTextInputAdapter);