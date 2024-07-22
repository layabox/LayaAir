import { UIGroup } from "./UIGroup";
import { Sprite } from "../display/Sprite"
import { Radio } from "./Radio"

/**
 * @en Dispatched when the selectedIndex property of a Group instance changes.
 * @zh 当 Group 实例的 selectedIndex 属性发生变化时调度。
 * @eventType laya.events.Event
 * [Event(name = "change", type = "laya.events.Event")]
*/

/**
 * @en The RadioGroup control defines a group of mutually exclusive Radio controls, such that only one Radio control can be selected at a time by the user.
 * @zh RadioGroup 控件定义一组 Radio 控件，这些控件相互排斥；因此，用户每次只能选择一个 Radio 控件。
 */
export class RadioGroup extends UIGroup {

    /**
     * @internal
     * @inheritDoc 
     * @override
     */
    protected createItem(skin: string, label: string): Sprite {
        let btn = new Radio();
        btn._skinBaseUrl = this._skinBaseUrl;
        if (skin)
            btn.skin = skin;
        btn.label = label;
        return btn;
    }
}