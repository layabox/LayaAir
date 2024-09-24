import { UIGroup } from "./UIGroup";
import { Sprite } from "../display/Sprite"
import { Radio } from "./Radio"

/**
 * @en The RadioGroup control defines a group of mutually exclusive Radio controls, such that only one Radio control can be selected at a time by the user.
 * `change` event is dispatched when the selectedIndex property of a Group instance changes.
 * @zh RadioGroup 控件定义一组 Radio 控件，这些控件相互排斥；因此，用户每次只能选择一个 Radio 控件。
 * `change`事件用于当Group的selectedIndex属性发生变化时调度。
 */
export class RadioGroup extends UIGroup {
    protected createItem(skin: string, label: string): Sprite {
        let btn = new Radio();
        btn._skinBaseUrl = this._skinBaseUrl;
        if (skin)
            btn.skin = skin;
        btn.label = label;
        return btn;
    }
}