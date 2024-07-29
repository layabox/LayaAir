import { Sprite } from "../display/Sprite"
import { Button } from "./Button"
import { Styles } from "./Styles";
import { UIGroup } from "./UIGroup"

/**
 * @en This event is dispatched when the selectedIndex property of a Group instance has changed.
 * @zh 当 Group 实例的 selectedIndex 属性发生变化时调度。
 * @eventType laya.events.Event
 */
/*[Event(name = "change", type = "laya.events.Event")]*/

/**
 * @en The Tab component is used to define tab button groups.
 * The default value of ths property selectedIndex is -1.
 * @zh Tab 组件用来定义选项卡按钮组。
 * 属性selectedIndex 的默认值为-1。
 */
export class Tab extends UIGroup {
    constructor() {
        super();
        this._stateNum = Styles.buttonStateNum;
    }

    /**
     * @internal
     * @inheritDoc
     * @override
     */
    protected createItem(skin: string, label: string): Sprite {
        let btn = new Button();
        btn._skinBaseUrl = this._skinBaseUrl;
        if (skin)
            btn.skin = skin;
        btn.label = label;
        return btn;
    }
}