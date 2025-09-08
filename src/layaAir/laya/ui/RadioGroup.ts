import { UIGroup } from "./UIGroup";
import { Sprite } from "../display/Sprite"
import { Radio } from "./Radio"
import { Vector2 } from "../maths/Vector2";

/**
 * @en The RadioGroup control defines a group of mutually exclusive Radio controls, such that only one Radio control can be selected at a time by the user.
 * `change` event is dispatched when the selectedIndex property of a Group instance changes.
 * @zh RadioGroup 控件定义一组 Radio 控件，这些控件相互排斥；因此，用户每次只能选择一个 Radio 控件。
 * `change`事件用于当Group的selectedIndex属性发生变化时调度。
 */
export class RadioGroup extends UIGroup {
    /** @internal */
    constructor() {
        super();
        this._fitContent = true;
    }

    protected createItem(skin: string, label: string): Sprite {
        let btn = new Radio();
        btn._skinBaseUrl = this._skinBaseUrl;
        if (skin)
            btn.skin = skin;
        btn.label = label;
        // 如果禁用 fitContent，则应用固定宽高
        if (!this._fitContent) {
            if (this._labelFixedSize.x > 0) btn.width = this._labelFixedSize.x;
            if (this._labelFixedSize.y > 0) btn.height = this._labelFixedSize.y;
        }
        return btn;
    }

    /**
     * @zh 设置节点宽高是否自适应文本内容，一旦适应后，文本对齐设置将无效。
     * - true（文本宽度和高度自适应）
     * - false （不自适应）
     * @en sets whether the node width and height adapts to the text content. Once adapted, the text alignment settings will be invalid.
     * - true (both text width and height adapt)
     * - false (does not adapt)
     */
    get fitContent(): boolean {
        return this._fitContent;
    }

    set fitContent(value: boolean) {
        if (this._fitContent != value) {
            this._fitContent = value;
            this._setLabelChanged();
        }
    }

    /**
     * @zh 文本标签固定的宽高，不自动适应文本内容时，并且宽高值大于0，该功能才会生效。
     * @en The fixed width and height of the text label. This feature will only take effect when the text content is not automatically adapted. The width and height values must be greater than 0.
     */
    get labelFixedSize(): Vector2 {
        return this._labelFixedSize;
    }

    set labelFixedSize(value: Vector2) {
        this._labelFixedSize = value;
        this._setLabelChanged();
    }
}