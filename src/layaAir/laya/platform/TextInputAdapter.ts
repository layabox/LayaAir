import { ILaya, Mutable } from "../../ILaya";
import { Laya } from "../../Laya";
import { Input } from "../display/Input";
import { type Stage } from "../display/Stage";
import { Text } from "../display/Text";
import { Event } from "../events/Event";
import { InputManager } from "../events/InputManager";
import { Browser } from "../utils/Browser";
import { SpriteUtils } from "../utils/SpriteUtils";
import { PAL } from "./PlatformAdapters";

/**
 * @ignore
 */
export class TextInputAdapter {
    readonly target: Input;

    protected _eInput: HTMLInputElement;
    protected _ePassword: HTMLInputElement;
    protected _eTextArea: HTMLTextAreaElement;
    protected _visEle: HTMLInputElement | HTMLTextAreaElement;
    protected _container: HTMLDivElement;
    protected _promptStyleDOM: HTMLElement;
    protected _restrictPattern: RegExp;
    protected _enterEvent: Event;
    protected _lastTransform: { x: number, y: number, width: number, height: number, scaleX: number, scaleY: number };
    protected _beginFlag: number = 0;

    /**
     * If true, the input box will be displayed inline with the canvas.
     * If false, use a pop-up keyboard to enter text.
     */
    protected _editInline: boolean = true;

    constructor() {
        this._enterEvent = new Event();
        this._lastTransform = <any>{};

        Laya.addAfterInitCallback(() => {
            ILaya.stage.on(Event.MOUSE_UP, this, this.onTouchEnd);
            InputManager.onMouseDownCapture.add(this.onTouchBegin, this);
        });
    }

    begin(target: Input, fromTouchBegin?: boolean): Promise<void> {
        if (this.target === target || this._beginFlag !== 0)
            return Promise.resolve();

        this._beginFlag = 1;
        return (this.target ? this.end(false, this.target.editable) : Promise.resolve()).then(() => {
            (<Mutable<this>>this).target = target;
            (<Mutable<Stage>>ILaya.stage).focus = target;

            this.updateRestrictPattern();
            this._lastTransform.x = null;

            target.on(Event.UNDISPLAY, this, this.end);

            return this.onBegin().catch(e => {
                console.error("TextInputAdapter begin error:", e);
            });
        }).then(() => {
            if (this._editInline) {
                this.target.hideText(true);
                ILaya.stage.on(Event.KEY_DOWN, this, this.onKeyDown);
            }
            target.event(Event.FOCUS);
        }).then(() => {
            if (!fromTouchBegin) {
                this._beginFlag = 0;
                return this.onCanShowKeyboard().catch(e => {
                    console.error("TextInputAdapter begin error:", e);
                });
            }
            else { //等待touchEnd再调用
                this._beginFlag = 2;
                return Promise.resolve();
            }
        });
    }

    end(complete?: boolean, switching?: boolean): Promise<void> {
        let target = this.target;
        if (!target)
            return Promise.resolve();

        (<Mutable<this>>this).target = null;
        (<Mutable<Stage>>ILaya.stage).focus = null;
        target.off(Event.UNDISPLAY, this, this.end);
        if (this._editInline)
            ILaya.stage.off(Event.KEY_DOWN, this, this.onKeyDown);

        return this.onEnd(target, !!complete, !!switching).then(() => {
            if (this._editInline)
                target.hideText(false);

            if (target.editable)
                target.event(Event.CHANGE);

            target.event(Event.BLUR);
        }).catch(e => {
            console.error("TextInputAdapter end error:", e);
        });
    }

    protected onBegin(): Promise<void> {
        this.showInputElement();

        let ele = this._visEle;
        let target = this.target;

        if (ele instanceof HTMLInputElement)
            ele.type = this.target.type;
        ele.readOnly = !target.editable;
        ele.maxLength = target.maxChars <= 0 ? 1E5 : target.maxChars;
        ele.value = this.target.text;
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
        if (this._editInline)
            ILaya.systemTimer.frameLoop(1, this, this.syncTransform);

        return Promise.resolve();
    }

    //和onBegin区别在于，onBegin在touchBegin调用，这个在touchEnd调用
    protected onCanShowKeyboard(): Promise<void> {
        if (this._visEle)
            this._visEle.focus();
        return Promise.resolve();
    }

    protected onEnd(target: Input, complete: boolean, switching: boolean): Promise<void> {
        Browser.document.body.scrollTop = 0;
        target.text = this._visEle.value;

        this._visEle.blur();
        this.hideInputElement();
        this._visEle = null;

        if (this._editInline)
            ILaya.systemTimer.clear(this, this.syncTransform);

        return Promise.resolve();
    }

    syncText() {
        if (this._visEle && this._beginFlag === 0)
            this.updateTargetText(this._visEle.value);
    }

    setText(value: string) {
        if (this._visEle)
            this._visEle.value = value;
    }

    setSelection(startIndex: number, endIndex: number): void {
        if (this._visEle) {
            this._visEle.selectionStart = startIndex;
            this._visEle.selectionEnd = endIndex;
        }
    }

    private onTouchBegin(): void {
        let lastFocus = ILaya.stage.focus;
        let touchTarget = InputManager.touchTarget;
        if (lastFocus != touchTarget) {
            if (touchTarget instanceof Input)
                this.begin(touchTarget, true);
            else if (lastFocus instanceof Input)
                this.end();
        }
    }

    private onTouchEnd(): void {
        if (this._beginFlag !== 0) {
            if (this._beginFlag === 1) { //如果onBegin还没完成，需要延时。一般不会发生
                ILaya.systemTimer.frameOnce(1, this, this.onTouchEnd);
            }
            else { //==2
                this._beginFlag = 0;
                this.onCanShowKeyboard().catch(e => {
                    console.error("TextInputAdapter begin error:", e);
                });
            }
        }
    }

    protected setPromptColor(): void {
        // 创建style标签
        this._promptStyleDOM = Browser.document.getElementById("promptStyle");
        if (!this._promptStyleDOM) {
            this._promptStyleDOM = Browser.document.createElement("style");
            this._promptStyleDOM.setAttribute("id", "promptStyle");
            Browser.document.head.appendChild(this._promptStyleDOM);
        }

        let color = this.target.promptColor;

        // 设置style标签
        this._promptStyleDOM.innerText = `input::-webkit-input-placeholder, textarea::-webkit-input-placeholder {
                color: ${color}
            }
            input:-moz-placeholder, textarea:-moz-placeholder {
                color: ${color}
            }
            input::-moz-placeholder, textarea::-moz-placeholder {
                color: ${color}
            }
            input:-ms-input-placeholder, textarea:-ms-input-placeholder {
                color: ${color}
            }
        `;
    }

    protected updateRestrictPattern(): void {
        let value = this.target.restrict;
        // H5保存RegExp
        if (value) {
            value = "[^" + value + "]";

            // 如果pattern为^\00-\FF，则我们需要的正则表达式是\00-\FF
            if (value.indexOf("^^") > -1)
                value = value.replace("^^", "");

            this._restrictPattern = new RegExp(value, "g");
        } else
            this._restrictPattern = null;
    }

    protected validateText(str: string): string {
        if (str == null)
            str = "";
        if (!this.target.multiline)
            str = str.replace(/\r?\n/g, '');

        // 对输入字符进行限制
        if (this._restrictPattern) {
            // 部分输入法兼容
            str = str.replace(/\u2006|\x27/g, "");
            if (this._restrictPattern.test(str)) {
                str = str.replace(this._restrictPattern, "");
            }
        }

        return str;
    }

    protected showInputElement(): void {
        if (!this._eInput)
            this.createElements();

        let password = this.target.type === "password";
        let multiline = this.target.multiline && !password;
        let inputElement = (multiline ? this._eTextArea : password ? this._ePassword : this._eInput);
        this._visEle = inputElement;
        this._container.appendChild(inputElement);
    }

    protected hideInputElement(): void {
        if (this._visEle && this._visEle.parentElement)
            this._visEle.remove();
    }

    protected updateTargetText(value: string): boolean {
        let target = this.target;
        (<Mutable<this>>this).target = null;
        let ret = target.text != value;
        target.text = value;
        (<Mutable<this>>this).target = target;
        return ret;
    }

    protected getTargetTransform() {
        let padding = this.target.padding;
        let { x, y, scaleX, scaleY } = SpriteUtils.getTransformRelativeToWindow(this.target, padding[3], padding[0]);
        let w = this.target.width - padding[1] - padding[3];
        let h = this.target.height - padding[0] - padding[2];

        let t = this._lastTransform;
        if (x !== t.x || y !== t.y || w !== t.width || h !== t.height || scaleX !== t.scaleX || scaleY !== t.scaleY) {
            t.x = x;
            t.y = y;
            t.width = w;
            t.height = h;
            t.scaleX = scaleX;
            t.scaleY = scaleY;
            return t;
        }
        else
            return null;
    }

    protected syncTransform(): void {
        let t = this.getTargetTransform();
        if (t != null) {
            let style = this._visEle.style;

            style.width = t.width + 'px';
            style.height = t.height + 'px';
            PAL.browser.setStyleTransform(style, "scale(" + t.scaleX + "," + t.scaleY + ") rotate(" + (ILaya.stage.canvasDegree) + "deg)");

            this._container.style.left = t.x + 'px';
            this._container.style.top = t.y + 'px';
        }
    }

    protected createElements(): void {
        this._container = Browser.document.createElement("div");
        Browser.container.appendChild(this._container);

        let style = this._container.style;
        style.position = "absolute";
        style.zIndex = '1E5';

        this.initElement(this._eTextArea = Browser.document.createElement("textarea"));
        this.initElement(this._eInput = Browser.document.createElement("input"));
        this.initElement(this._ePassword = Browser.document.createElement("input"));
    }

    protected initElement(input: HTMLInputElement | HTMLTextAreaElement): void {
        let style = input.style;
        style.cssText = "position:absolute;overflow:hidden;resize:none;";
        style.resize = 'none';
        style.backgroundColor = 'transparent';
        style.border = 'none';
        style.outline = 'none';
        style.zIndex = '1';
        PAL.browser.setStyleTransformOrigin(style, "0 0");

        input.addEventListener('input', ev => !(<InputEvent>ev).isComposing && this.processInputting(ev));
        input.addEventListener("compositionend", ev => this.processInputting(ev));

        input.addEventListener('mousemove', ev => this.stopEvent(ev), { passive: false });
        input.addEventListener('mousedown', ev => this.stopEvent(ev), { passive: false });
        input.addEventListener('touchmove', ev => this.stopEvent(ev), { passive: false });
    }

    protected processInputting(ev: globalThis.Event): void {
        if (!this.target)
            return;

        let ele = <HTMLInputElement | HTMLTextAreaElement>ev.target;
        let value = this.validateText(ele.value);
        ele.value = value;
        if (this.updateTargetText(value))
            this.target.event(Event.INPUT);
    }

    protected stopEvent(e: any): void {
        if (e.type == 'touchmove')
            e.preventDefault();
        e.stopPropagation && e.stopPropagation();
    }

    protected onKeyDown(e: KeyboardEvent): void {
        if (e.key === "Enter" || e.key === "NumpadEnter") {
            let target = this.target;
            if (!target.multiline) {
                e.preventDefault();

                this._enterEvent.setTo(Event.ENTER, this.target, this.target);
                target.event(Event.ENTER, this._enterEvent);
                if (!this._enterEvent._defaultPrevented && this.target === target)
                    this.end();
            }
        }
    }
}

PAL.register("textInput", TextInputAdapter);