import { Input } from "../../laya/display/Input";
import { Event } from "../../laya/events/Event";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { TextInputAdapter } from "../../laya/platform/TextInputAdapter";
import { ClassUtils } from "../../laya/utils/ClassUtils";

var mg: WechatMinigame.Wx;

export class MgTextInputAdapter extends TextInputAdapter {

    constructor() {
        super();

        mg = PAL.global;
        this._editInline = false;

        mg.onKeyboardInput(this.onKeyboardInput.bind(this));
        mg.onKeyboardConfirm(this.onKeyboardConfirm.bind(this));
        mg.onKeyboardComplete(this.onKeyboardComplete.bind(this));
    }

    setText(value: string): void {
        mg.updateKeyboard({ value });
    }

    protected onBegin(): Promise<void> {
        return Promise.resolve();
    }

    protected onCanShowKeyboard(): Promise<void> {
        let target = this.target;
        if (!target.editable)
            return Promise.resolve();

        return new Promise<any>((resolve, reject) => {
            mg.showKeyboard({
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
            mg.hideKeyboard({ success: resolve, fail: reject });
        });
    }

    private onKeyboardInput(ev: WechatMinigame.OnKeyboardInputListenerResult) {
        let str: string = ev.value ?? "";
        if (!this.target.multiline) {
            if (str.indexOf("\n") != -1) {
                this.end();
                return;
            }
        }

        // 对输入字符进行限制
        if (this._restrictPattern) {
            // 部分输入法兼容
            str = str.replace(/\u2006|\x27/g, "");
            if (this._restrictPattern.test(str)) {
                str = str.replace(this._restrictPattern, "");
            }
        }

        if (this.updateTargetText(str))
            this.target.event(Event.INPUT);
    }

    private onKeyboardConfirm(ev: WechatMinigame.OnKeyboardInputListenerResult) {
        this.onKeyboardInput(ev);
        this.end();
    }

    private onKeyboardComplete(ev: WechatMinigame.OnKeyboardInputListenerResult) {
        this.end(true);
    }
}

ClassUtils.regClass("PAL.TextInput", MgTextInputAdapter);