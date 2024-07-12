import { Handler } from "../utils/Handler"
import { UIComponent } from "./UIComponent";

/**
 * @en The ISelect interface, which should be implemented by objects that have a selected property and a clickHandler for selection callback function processing.
 * @zh ISelect 接口，实现对象的 selected属性和clickHandler 选择回调函数处理器。
 */
export interface ISelect extends UIComponent {
    /**
     * @en A boolean value indicating whether the object is selected.
     * @zh 是否被选择。
     */
    selected: boolean;
    /**
     * @en The click event callback function processing handler of the object.
     * @zh 对象的点击事件回调函数处理器。
     */
    clickHandler: Handler;
}
