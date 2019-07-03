import { Text } from "./Text";
import { Event } from "../events/Event";
import { Utils } from "../utils/Utils";
import { ILaya } from "../../ILaya";
/**
 * 用户输入一个或多个文本字符时后调度。
 * @eventType Event.INPUT
 * */
/*[Event(name = "input", type = "laya.events.Event")]*/
/**
 * 文本发生变化后调度。
 * @eventType Event.CHANGE
 * */
/*[Event(name = "change", type = "laya.events.Event")]*/
/**
 * 用户在输入框内敲回车键后，将会调度 <code>enter</code> 事件。
 * @eventType Event.ENTER
 * */
/*[Event(name = "enter", type = "laya.events.Event")]*/
/**
 * 显示对象获得焦点后调度。
 * @eventType Event.FOCUS
 * */
/*[Event(name = "focus", type = "laya.events.Event")]*/
/**
 * 显示对象失去焦点后调度。
 * @eventType Event.BLUR
 * */
/*[Event(name = "blur", type = "laya.events.Event")]*/
/**
 * <p><code>Input</code> 类用于创建显示对象以显示和输入文本。</p>
 * <p>Input 类封装了原生的文本输入框，由于不同浏览器的差异，会导致此对象的默认文本的位置与用户点击输入时的文本的位置有少许的偏差。</p>
 */
export class Input extends Text {
    /**创建一个新的 <code>Input</code> 类实例。*/
    constructor() {
        super();
        /**@private */
        this._multiline = false;
        /**@private */
        this._editable = true;
        /**@private */
        this._maxChars = 1E5;
        this._type = "text";
        /**输入提示符。*/
        this._prompt = '';
        /**输入提示符颜色。*/
        this._promptColor = "#A9A9A9";
        this._originColor = "#000000";
        this._content = '';
        Input.IOS_IFRAME = (ILaya.Browser.onIOS && ILaya.Browser.window.top != ILaya.Browser.window.self);
        this._width = 100;
        this._height = 20;
        this.multiline = false;
        this.overflow = Text.SCROLL;
        this.on(Event.MOUSE_DOWN, this, this._onMouseDown);
        this.on(Event.UNDISPLAY, this, this._onUnDisplay);
    }
    /**@private */
    static __init__() {
        Input._createInputElement();
        // 移动端通过画布的touchend调用focus
        if (ILaya.Browser.onMobile) {
            var isTrue = false;
            if (ILaya.Browser.onMiniGame || ILaya.Browser.onBDMiniGame || ILaya.Browser.onQGMiniGame || ILaya.Browser.onKGMiniGame || ILaya.Browser.onVVMiniGame) {
                isTrue = true;
            }
            ILaya.Render.canvas.addEventListener(Input.IOS_IFRAME ? (isTrue ? "touchend" : "click") : "touchend", Input._popupInputMethod);
        }
    }
    // 移动平台在单击事件触发后弹出输入法
    static _popupInputMethod(e) {
        //e.preventDefault();
        if (!Input.isInputting)
            return;
        var input = Input.inputElement;
        // 弹出输入法。
        input.focus();
    }
    static _createInputElement() {
        Input._initInput(Input.area = ILaya.Browser.createElement("textarea"));
        Input._initInput(Input.input = ILaya.Browser.createElement("input"));
        Input.inputContainer = ILaya.Browser.createElement("div");
        Input.inputContainer.style.position = "absolute";
        Input.inputContainer.style.zIndex = 1E5;
        ILaya.Browser.container.appendChild(Input.inputContainer);
        Input.inputContainer.setPos = function (x, y) {
            Input.inputContainer.style.left = x + 'px';
            Input.inputContainer.style.top = y + 'px';
        };
    }
    static _initInput(input) {
        var style = input.style;
        style.cssText = "position:absolute;overflow:hidden;resize:none;transform-origin:0 0;-webkit-transform-origin:0 0;-moz-transform-origin:0 0;-o-transform-origin:0 0;";
        style.resize = 'none';
        style.backgroundColor = 'transparent';
        style.border = 'none';
        style.outline = 'none';
        style.zIndex = 1;
        input.addEventListener('input', Input._processInputting);
        input.addEventListener('mousemove', Input._stopEvent);
        input.addEventListener('mousedown', Input._stopEvent);
        input.addEventListener('touchmove', Input._stopEvent);
        input.setFontFace = function (fontFace) { input.style.fontFamily = fontFace; };
        if (!ILaya.Render.isConchApp) {
            input.setColor = function (color) { input.style.color = color; };
            input.setFontSize = function (fontSize) { input.style.fontSize = fontSize + 'px'; };
        }
    }
    static _processInputting(e) {
        var input = Input.inputElement.target;
        if (!input)
            return;
        var value = Input.inputElement.value;
        // 对输入字符进行限制
        if (input._restrictPattern) {
            // 部分输入法兼容
            value = value.replace(/\u2006|\x27/g, "");
            if (input._restrictPattern.test(value)) {
                value = value.replace(input._restrictPattern, "");
                Input.inputElement.value = value;
            }
        }
        input._text = value;
        input.event(Event.INPUT);
    }
    static _stopEvent(e) {
        if (e.type == 'touchmove')
            e.preventDefault();
        e.stopPropagation && e.stopPropagation();
    }
    /**
     * 设置光标位置和选取字符。
     * @param	startIndex	光标起始位置。
     * @param	endIndex	光标结束位置。
     */
    setSelection(startIndex, endIndex) {
        this.focus = true;
        Input.inputElement.selectionStart = startIndex;
        Input.inputElement.selectionEnd = endIndex;
    }
    /**表示是否是多行输入框。*/
    get multiline() {
        return this._multiline;
    }
    set multiline(value) {
        this._multiline = value;
        this.valign = value ? "top" : "middle";
    }
    /**
     * 获取对输入框的引用实例。
     */
    get nativeInput() {
        return this._multiline ? Input.area : Input.input;
    }
    _onUnDisplay(e = null) {
        this.focus = false;
    }
    _onMouseDown(e) {
        this.focus = true;
    }
    /**
     * 在输入期间，如果 Input 实例的位置改变，调用_syncInputTransform同步输入框的位置。
     */
    _syncInputTransform() {
        var inputElement = this.nativeInput;
        var transform = Utils.getTransformRelativeToWindow(this, this.padding[3], this.padding[0]);
        var inputWid = this._width - this.padding[1] - this.padding[3];
        var inputHei = this._height - this.padding[0] - this.padding[2];
        if (ILaya.Render.isConchApp) {
            inputElement.setScale(transform.scaleX, transform.scaleY);
            inputElement.setSize(inputWid, inputHei);
            inputElement.setPos(transform.x, transform.y);
        }
        else {
            Input.inputContainer.style.transform = Input.inputContainer.style.webkitTransform = "scale(" + transform.scaleX + "," + transform.scaleY + ") rotate(" + (ILaya.stage.canvasDegree) + "deg)";
            inputElement.style.width = inputWid + 'px';
            inputElement.style.height = inputHei + 'px';
            Input.inputContainer.style.left = transform.x + 'px';
            Input.inputContainer.style.top = transform.y + 'px';
        }
    }
    /**选中当前实例的所有文本。*/
    select() {
        this.nativeInput.select();
    }
    /**
     * 表示焦点是否在此实例上。
     */
    get focus() {
        return this._focus;
    }
    // 移动平台最后单击画布才会调用focus
    // 因此 调用focus接口是无法都在移动平台立刻弹出键盘的
    set focus(value) {
        var input = this.nativeInput;
        if (this._focus !== value) {
            if (value) {
                if (input.target) {
                    input.target._focusOut();
                }
                else {
                    this._setInputMethod();
                }
                input.target = this;
                this._focusIn();
            }
            else {
                input.target = null;
                this._focusOut();
                ILaya.Browser.document.body.scrollTop = 0;
                input.blur();
                if (ILaya.Render.isConchApp)
                    input.setPos(-10000, -10000);
                else if (Input.inputContainer.contains(input))
                    Input.inputContainer.removeChild(input);
            }
        }
    }
    _setInputMethod() {
        Input.input.parentElement && (Input.inputContainer.removeChild(Input.input));
        Input.area.parentElement && (Input.inputContainer.removeChild(Input.area));
        Input.inputElement = (this._multiline ? Input.area : Input.input);
        Input.inputContainer.appendChild(Input.inputElement);
        if (Text.RightToLeft) {
            Input.inputElement.style.direction = "rtl";
        }
    }
    _focusIn() {
        Input.isInputting = true;
        var input = this.nativeInput;
        this._focus = true;
        var cssStyle = input.style;
        cssStyle.whiteSpace = (this.wordWrap ? "pre-wrap" : "nowrap");
        this._setPromptColor();
        input.readOnly = !this._editable;
        if (ILaya.Render.isConchApp) {
            input.setType(this._type);
            input.setForbidEdit(!this._editable);
        }
        input.maxLength = this._maxChars;
        var padding = this.padding;
        //input.type = this._type;      不知道为什么说这个是只读的。但是as项目就没问题
        input.value = this._content;
        input.placeholder = this._prompt;
        ILaya.stage.off(Event.KEY_DOWN, this, this._onKeyDown);
        ILaya.stage.on(Event.KEY_DOWN, this, this._onKeyDown);
        ILaya.stage.focus = this;
        this.event(Event.FOCUS);
        // PC端直接调用focus进入焦点。
        if (ILaya.Browser.onPC)
            input.focus();
        // PC浏览器隐藏文字
        if (!ILaya.Browser.onMiniGame && !ILaya.Browser.onBDMiniGame && !ILaya.Browser.onQGMiniGame && !ILaya.Browser.onKGMiniGame && !ILaya.Browser.onVVMiniGame) {
            var temp = this._text;
            this._text = null;
        }
        this.typeset();
        // PC同步输入框外观。
        input.setColor(this._originColor);
        input.setFontSize(this.fontSize);
        input.setFontFace(ILaya.Browser.onIPhone ? (Text.fontFamilyMap[this.font] || this.font) : this.font);
        if (ILaya.Render.isConchApp) {
            input.setMultiAble && input.setMultiAble(this._multiline);
        }
        cssStyle.lineHeight = (this.leading + this.fontSize) + "px";
        cssStyle.fontStyle = (this.italic ? "italic" : "normal");
        cssStyle.fontWeight = (this.bold ? "bold" : "normal");
        cssStyle.textAlign = this.align;
        cssStyle.padding = "0 0";
        // 输入框重定位。
        this._syncInputTransform();
        if (!ILaya.Render.isConchApp && ILaya.Browser.onPC)
            ILaya.systemTimer.frameLoop(1, this, this._syncInputTransform);
    }
    // 设置DOM输入框提示符颜色。
    _setPromptColor() {
        // 创建style标签
        Input.promptStyleDOM = ILaya.Browser.getElementById("promptStyle");
        if (!Input.promptStyleDOM) {
            Input.promptStyleDOM = ILaya.Browser.createElement("style");
            Input.promptStyleDOM.setAttribute("id", "promptStyle");
            ILaya.Browser.document.head.appendChild(Input.promptStyleDOM);
        }
        // 设置style标签
        Input.promptStyleDOM.innerText = "input::-webkit-input-placeholder, textarea::-webkit-input-placeholder {" + "color:" + this._promptColor + "}" + "input:-moz-placeholder, textarea:-moz-placeholder {" + "color:" + this._promptColor + "}" + "input::-moz-placeholder, textarea::-moz-placeholder {" + "color:" + this._promptColor + "}" + "input:-ms-input-placeholder, textarea:-ms-input-placeholder {" + "color:" + this._promptColor + "}";
    }
    /**@private */
    _focusOut() {
        Input.isInputting = false;
        this._focus = false;
        this._text = null;
        this._content = this.nativeInput.value;
        if (!this._content) {
            super.set_text(this._prompt);
            super.set_color(this._promptColor);
        }
        else {
            super.set_text(this._content);
            super.set_color(this._originColor);
        }
        ILaya.stage.off(Event.KEY_DOWN, this, this._onKeyDown);
        ILaya.stage.focus = null;
        this.event(Event.BLUR);
        this.event(Event.CHANGE);
        if (ILaya.Render.isConchApp)
            this.nativeInput.blur();
        // 只有PC会注册此事件。
        ILaya.Browser.onPC && ILaya.systemTimer.clear(this, this._syncInputTransform);
    }
    /**@private */
    _onKeyDown(e) {
        if (e.keyCode === 13) {
            // 移动平台单行输入状态下点击回车收回输入法。 
            if (ILaya.Browser.onMobile && !this._multiline)
                this.focus = false;
            this.event(Event.ENTER);
        }
    }
    /**@inheritDoc */
    /*override*/ set text(value) {
        super.set_color(this._originColor);
        value += '';
        if (this._focus) {
            this.nativeInput.value = value || '';
            this.event(Event.CHANGE);
        }
        else {
            // 单行时不允许换行
            if (!this._multiline)
                value = value.replace(/\r?\n/g, '');
            this._content = value;
            if (value)
                super.set_text(value);
            else {
                super.set_text(this._prompt);
                super.set_color(this.promptColor);
            }
        }
    }
    /*override*/ get text() {
        if (this._focus)
            return this.nativeInput.value;
        else
            return this._content || "";
    }
    /*override*/ changeText(text) {
        this._content = text;
        if (this._focus) {
            this.nativeInput.value = text || '';
            this.event(Event.CHANGE);
        }
        else
            super.changeText(text);
    }
    /**@inheritDoc */
    /*override*/ set color(value) {
        if (this._focus)
            this.nativeInput.setColor(value);
        super.set_color(this._content ? value : this._promptColor);
        this._originColor = value;
    }
    get color() {
        return super.color;
    }
    /**@inheritDoc */
    /*override*/ set bgColor(value) {
        super.set_bgColor(value);
        if (ILaya.Render.isConchApp)
            this.nativeInput.setBgColor(value);
    }
    get bgColor() {
        return super.bgColor;
    }
    /**限制输入的字符。*/
    get restrict() {
        if (this._restrictPattern) {
            return this._restrictPattern.source;
        }
        return "";
    }
    set restrict(pattern) {
        // H5保存RegExp
        if (pattern) {
            pattern = "[^" + pattern + "]";
            // 如果pattern为^\00-\FF，则我们需要的正则表达式是\00-\FF
            if (pattern.indexOf("^^") > -1)
                pattern = pattern.replace("^^", "");
            this._restrictPattern = new RegExp(pattern, "g");
        }
        else
            this._restrictPattern = null;
    }
    /**
     * 是否可编辑。
     */
    set editable(value) {
        this._editable = value;
        if (ILaya.Render.isConchApp) {
            Input.input.setForbidEdit(!value);
        }
    }
    get editable() {
        return this._editable;
    }
    /**
     * <p>字符数量限制，默认为10000。</p>
     * <p>设置字符数量限制时，小于等于0的值将会限制字符数量为10000。</p>
     */
    get maxChars() {
        return this._maxChars;
    }
    set maxChars(value) {
        if (value <= 0)
            value = 1E5;
        this._maxChars = value;
    }
    /**
     * 设置输入提示符。
     */
    get prompt() {
        return this._prompt;
    }
    set prompt(value) {
        if (!this._text && value)
            super.set_color(this._promptColor);
        this.promptColor = this._promptColor;
        if (this._text)
            super.set_text((this._text == this._prompt) ? value : this._text);
        else
            super.set_text(value);
        this._prompt = Text.langPacks && Text.langPacks[value] ? Text.langPacks[value] : value;
    }
    /**
     * 设置输入提示符颜色。
     */
    get promptColor() {
        return this._promptColor;
    }
    set promptColor(value) {
        this._promptColor = value;
        if (!this._content)
            super.set_color(value);
    }
    /**
     * <p>输入框类型为Input静态常量之一。</p>
     * <ul>
     * <li>TYPE_TEXT</li>
     * <li>TYPE_PASSWORD</li>
     * <li>TYPE_EMAIL</li>
     * <li>TYPE_URL</li>
     * <li>TYPE_NUMBER</li>
     * <li>TYPE_RANGE</li>
     * <li>TYPE_DATE</li>
     * <li>TYPE_MONTH</li>
     * <li>TYPE_WEEK</li>
     * <li>TYPE_TIME</li>
     * <li>TYPE_DATE_TIME</li>
     * <li>TYPE_DATE_TIME_LOCAL</li>
     * </ul>
     * <p>平台兼容性参见http://www.w3school.com.cn/html5/html_5_form_input_types.asp。</p>
     */
    get type() {
        return this._type;
    }
    set type(value) {
        if (value === "password")
            this._getTextStyle().asPassword = true;
        else
            this._getTextStyle().asPassword = false;
        this._type = value;
    }
}
/** 常规文本域。*/
Input.TYPE_TEXT = "text";
/** password 类型用于密码域输入。*/
Input.TYPE_PASSWORD = "password";
/** email 类型用于应该包含 e-mail 地址的输入域。*/
Input.TYPE_EMAIL = "email";
/** url 类型用于应该包含 URL 地址的输入域。*/
Input.TYPE_URL = "url";
/** number 类型用于应该包含数值的输入域。*/
Input.TYPE_NUMBER = "number";
/**
 * <p>range 类型用于应该包含一定范围内数字值的输入域。</p>
 * <p>range 类型显示为滑动条。</p>
 * <p>您还能够设定对所接受的数字的限定。</p>
 */
Input.TYPE_RANGE = "range";
/**  选取日、月、年。*/
Input.TYPE_DATE = "date";
/** month - 选取月、年。*/
Input.TYPE_MONTH = "month";
/** week - 选取周和年。*/
Input.TYPE_WEEK = "week";
/** time - 选取时间（小时和分钟）。*/
Input.TYPE_TIME = "time";
/** datetime - 选取时间、日、月、年（UTC 时间）。*/
Input.TYPE_DATE_TIME = "datetime";
/** datetime-local - 选取时间、日、月、年（本地时间）。*/
Input.TYPE_DATE_TIME_LOCAL = "datetime-local";
/**
 * <p>search 类型用于搜索域，比如站点搜索或 Google 搜索。</p>
 * <p>search 域显示为常规的文本域。</p>
 */
Input.TYPE_SEARCH = "search";
/**@private */
Input.IOS_IFRAME = false;
Input.inputHeight = 45;
/**表示是否处于输入状态。*/
Input.isInputting = false;
