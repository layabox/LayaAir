import { Event } from "../events/Event";
/**
 * <code>UIEvent</code> 类用来定义UI组件类的事件类型。
 */
export class UIEvent extends Event {
}
/**
 * 显示提示信息。
 */
UIEvent.SHOW_TIP = "showtip";
/**
 * 隐藏提示信息。
 */
UIEvent.HIDE_TIP = "hidetip";
