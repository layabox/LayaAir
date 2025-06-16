import { Event } from "../../laya/events/Event";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { TextInputAdapter } from "../../laya/platform/TextInputAdapter";

export class TbTextInputAdapter extends TextInputAdapter {

    constructor() {
        super();

        this._editInline = false;
    }

    setText(value: string): void {
        //nothing
    }

    protected onBegin(): Promise<void> {
        return Promise.resolve();
    }

    protected onCanShowKeyboard(): Promise<void> {
        let target = this.target;
        if (!target.editable)
            return Promise.resolve();

        PAL.g.prompt({
            title: "请在提示框中输入内容",
            content: target.text,
            placeholder: target.prompt,
            success: (res: any) => {
                if (res.ok) {
                    let str = this.validateText(res.inputValue);
                    if (this.updateTargetText(str))
                        this.target.event(Event.INPUT);
                    this.target.event(Event.ENTER);

                }

                this.end();
            },
            fail: (res: any) => {
                console.log("prompt fail", res);
                this.end();
            }
        });

        return Promise.resolve();
    }

    protected onEnd(): Promise<void> {
        return Promise.resolve();
    }
}

PAL.register("textInput", TbTextInputAdapter);