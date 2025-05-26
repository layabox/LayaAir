import { TransformKind } from "../display/SpriteConst";
import { Event } from "../events/Event"
import { Button } from "./Button"

/**
 * @en The Radio control allows users to select one option from a mutually exclusive set of choices.
 * Choosing an unselected member of a Radio group will unselect the currently selected `Radio` control within that group.
 * @zh Radio 控件使用户可在一组互相排斥的选择中做出一种选择。
 * 用户一次只能选择 Radio 组中的一个成员。选择未选中的组成员将取消选择该组中当前所选的 Radio 控件。
 * @blueprintInheritable
 */
export class Radio extends Button {
    protected _value: any;

    /**
     * @en The optional user-defined value associated with the Radio.
     * @zh Radio 关联的可选用户定义值。
     */
    get value(): any {
        return this._value != null ? this._value : this.label;
    }

    set value(obj: any) {
        this._value = obj;
    }


    /**
     * @en creates an instance of Radio.
     * @param skin The path of the skin to be used for the Radio.
     * @param label The text label to be displayed next to the Radio.
     * @zh 创建一个 Radio 实例。
     * @param skin Radio 的皮肤路径。
     * @param label 显示在 Radio 旁边的文本标签。
     */
    constructor(skin: string = null, label: string = "") {
        super(skin, label);
        // preinitialize 放到这里了，因为不知道什么时候调用
        this.toggle = false;
        this._autoSize = false;
    }

    /**
     * @ignore
     */
    protected _transChanged(kind: TransformKind) {
        super._transChanged(kind);

        if ((kind & TransformKind.Width) != 0) {
            if (!this._autoSize)
                this._text.width = this._width - this._text.x;
        }
    }

    /**
     * @en Preinitializes the Radio component by setting properties before initialization.
     * @zh 在初始化前对 Radio 组件进行预初始化，设置相关属性。
     */
    protected preinitialize(): void {
        super.preinitialize();
        this.toggle = false;
        this._autoSize = false;
    }

    /**
     * @en Initializes the Radio component, creating text and setting text properties.
     * @zh 初始化 Radio 组件，创建文本并设置文本属性。
     */
    protected initialize(): void {
        super.initialize();
        this.createText();
        this._text.align = "left";
        this._text.valign = "top";
        this._text.width = null;
        this.on(Event.CLICK, this, this.onClick);
    }

    /**
     * @en The click event handler for the Radio object.
     * @param e The event object.
     * @zh 对象的Event.CLICK事件侦听处理函数。 
     * @param e 事件对象。
     */
    protected onClick(e: Event): void {
        this.selected = true;
    }

    protected changeClips(): void {
        super.changeClips();

        if (!this._autoSize)
            this._text.width = this.width - this._text.x;
    }
}