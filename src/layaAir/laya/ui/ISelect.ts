import { Handler } from "../utils/Handler"
import { UIComponent } from "./UIComponent";

/**
 * <code>ISelect</code> 接口，实现对象的 <code>selected</code> 属性和 <code>clickHandler</code> 选择回调函数处理器。
 */
export interface ISelect extends UIComponent {
    /**
     * 一个布尔值，表示是否被选择。
     */
    selected: boolean;
    /**
     * 对象的点击事件回掉函数处理器。
     */
    clickHandler: Handler;
}
