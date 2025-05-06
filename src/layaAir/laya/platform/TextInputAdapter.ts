import { ILaya, Mutable } from "../../ILaya";
import { Laya } from "../../Laya";
import { Input } from "../display/Input";
import { type Stage } from "../display/Stage";
import { Text } from "../display/Text";
import { Event } from "../events/Event";
import { InputManager } from "../events/InputManager";
import { Browser } from "../utils/Browser";
import { ClassUtils } from "../utils/ClassUtils";
import { SpriteUtils } from "../utils/SpriteUtils";

/**
 * @ignore
 */
export class TextInputAdapter {
    protected _eInput: HTMLInputElement;
    protected _ePassword: HTMLInputElement;
    protected _eTextArea: HTMLTextAreaElement;
    protected _visEle: HTMLInputElement | HTMLTextAreaElement;
    protected _container: HTMLDivElement;
    protected _promptStyleDOM: HTMLElement;
    protected _restrictPattern: RegExp;
    protected _editInline: boolean = true;
    protected _enterEvent: Event;
    protected _lastTransform: { x: number, y: number, width: number, height: number, scaleX: number, scaleY: number };
    protected _beginning: boolean = false;

    readonly target: Input;

    constructor() {
        this._enterEvent = new Event();
        this._lastTransform = <any>{};

        Laya.addAfterInitCallback(() => {
            ILaya.stage.on(Event.MOUSE_UP, () => {
                if (this._visEle)
                    this._visEle.focus();
            });
            InputManager.onMouseDownCapture.add(this.onMouseDownCapture, this);
        });
    }

    begin(target: Input) {
        if (this.target === target)
            return;

        if (this.target)
            this.end();

        this._beginning = true;
        (<Mutable<this>>this).target = target;
        (<Mutable<Stage>>ILaya.stage).focus = target;
        this.updateRestrictPattern();
        this._lastTransform.x = null;
        target.on(Event.UNDISPLAY, this, this.end);

        this.onBegin().then(() => {
            if (this._editInline) {
                this.target.hideText(true);
                ILaya.stage.on(Event.KEY_DOWN, this, this.onKeyDown);
            }
            this._beginning = false;
            target.event(Event.FOCUS);
        }).catch(e => {
            console.error("TextInputAdapter begin error:", e);
        });
    }

    end() {
        let target = this.target;
        if (!target)
            return;

        (<Mutable<this>>this).target = null;
        (<Mutable<Stage>>ILaya.stage).focus = null;
        target.off(Event.UNDISPLAY, this, this.end);
        if (this._editInline)
            ILaya.stage.off(Event.KEY_DOWN, this, this.onKeyDown);

        this.onEnd(target).then(() => {
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

    protected onEnd(target: Input): Promise<void> {
        document.body.scrollTop = 0;
        target.text = this._visEle.value;

        this._visEle.blur();
        this.hideInputElement();
        this._visEle = null;

        if (this._editInline)
            ILaya.systemTimer.clear(this, this.syncTransform);

        return Promise.resolve();
    }

    syncText() {
        if (this._visEle && !this._beginning)
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

    protected onMouseDownCapture(): void {
        let lastFocus = ILaya.stage.focus;
        let touchTarget = InputManager.touchTarget;
        if (lastFocus != touchTarget) {
            if (touchTarget instanceof Input)
                this.begin(touchTarget);
            else if (lastFocus instanceof Input)
                this.end();
        }
    }

    protected setPromptColor(): void {
        // 创建style标签
        this._promptStyleDOM = document.getElementById("promptStyle");
        if (!this._promptStyleDOM) {
            this._promptStyleDOM = document.createElement("style");
            this._promptStyleDOM.setAttribute("id", "promptStyle");
            document.head.appendChild(this._promptStyleDOM);
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

    protected updateTargetText(value: string): void {
        let target = this.target;
        (<Mutable<this>>this).target = null;
        target.text = value;
        (<Mutable<this>>this).target = target;
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
            style.transform = style.webkitTransform = (style as any).msTransform = (style as any).mozTransform
                = (style as any).oTransform = "scale(" + t.scaleX + "," + t.scaleY + ") rotate(" + (ILaya.stage.canvasDegree) + "deg)";

            this._visEle.style.width = t.width + 'px';
            this._visEle.style.height = t.height + 'px';

            this._container.style.left = t.x + 'px';
            this._container.style.top = t.y + 'px';
        }
    }

    protected createElements(): void {
        this._container = document.createElement("div");
        Browser.container.appendChild(this._container);

        let style = this._container.style;
        style.position = "absolute";
        style.zIndex = '1E5';

        this.initElement(this._eTextArea = document.createElement("textarea"));
        this.initElement(this._eInput = document.createElement("input"));
        this.initElement(this._ePassword = document.createElement("input"));
    }

    protected initElement(input: HTMLInputElement | HTMLTextAreaElement): void {
        let style = input.style;
        style.cssText = "position:absolute;overflow:hidden;resize:none;transform-origin:0 0;-webkit-transform-origin:0 0;-moz-transform-origin:0 0;-o-transform-origin:0 0;";
        style.resize = 'none';
        style.backgroundColor = 'transparent';
        style.border = 'none';
        style.outline = 'none';
        style.zIndex = '1';

        input.addEventListener('input', ev => this.processInputting(ev));

        input.addEventListener('mousemove', ev => this.stopEvent(ev), { passive: false });
        input.addEventListener('mousedown', ev => this.stopEvent(ev), { passive: false });
        input.addEventListener('touchmove', ev => this.stopEvent(ev), { passive: false });
    }

    protected processInputting(ev: globalThis.Event): void {
        if (!this.target)
            return;

        let ele = <HTMLInputElement | HTMLTextAreaElement>ev.target;
        let value = ele.value;

        // 对输入字符进行限制
        if (this._restrictPattern) {
            // 部分输入法兼容
            value = value.replace(/\u2006|\x27/g, "");

            if (this._restrictPattern.test(value)) {
                value = value.replace(this._restrictPattern, "");
                ele.value = value;
            }
        }

        this.updateTargetText(value);
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

ClassUtils.regClass("PAL.TextInput", TextInputAdapter);