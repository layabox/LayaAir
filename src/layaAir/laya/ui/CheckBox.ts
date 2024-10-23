import { Button } from "./Button"
/**
 * @en The `CheckBox` component displays a small box that can have a check mark. 
 * - The `CheckBox` component can also display an optional text label, which is positioned to the right of the CheckBox by default.
 * - When assigning a value to `CheckBox` using `dataSource`, the default property is `selected`.
 * - `change` event, dispatched when the button's selected state (`selected` property) changes.
 * @zh `CheckBox` 组件显示一个小方框，该方框内可以有选中标记。
 * - `CheckBox` 组件还可以显示可选的文本标签，默认该标签位于 CheckBox 右侧。
 * - 使用 `dataSource` 赋值时，`CheckBox` 的默认属性是 `selected`。
 * - `change`事件，当按钮的选中状态（ `selected` 属性）发生改变时调度。
 */
export class CheckBox extends Button {

    /**
     * @en `CheckBox` component constructor.
     * @param skin The skin resource address.
     * @param label The content of the text label.
     * @zh `CheckBox` 组件的构造函数。
     * @param skin 皮肤资源地址。
     * @param label 文本标签的内容。
     */
    constructor(skin: string = null, label: string = "") {
        super(skin, label);
        this.toggle = true;
        this._autoSize = false;
    }

    /**
     * @en Preinitialization method. Called before the object is initialized.
     * @zh 预初始化方法。在对象初始化之前调用。
     */
    protected preinitialize(): void {
        super.preinitialize();
        this.toggle = true;
        this._autoSize = false;
    }

    /**
     * @en Initialization method. Called when the object is initialized.
     * @zh 初始化方法。在对象初始化时调用。
     */
    protected initialize(): void {
        super.initialize();
        this.createText();
        this._text.align = "left";
        this._text.valign = "top";
        this._text.width = null;
    }

    /**
     * @en Sets the data source of the component.
     * @param value The data source.
     * @zh 设置组件的数据源。
     * @param value 数据源。
     */
    set_dataSource(value: any) {
        this._dataSource = value;
        if (value instanceof Boolean)
            this.selected = value as boolean;
        else if (typeof (value) == 'string')
            this.selected = value === "true";
        else
            super.set_dataSource(value);
    }
}