import { Event } from "././Event";
import { ILaya } from "../../ILaya";
/**
 * <p><code>KeyBoardManager</code> 是键盘事件管理类。该类从浏览器中接收键盘事件，并派发该事件。</p>
 * <p>派发事件时若 Stage.focus 为空则只从 Stage 上派发该事件，否则将从 Stage.focus 对象开始一直冒泡派发该事件。所以在 Laya.stage 上监听键盘事件一定能够收到，如果在其他地方监听，则必须处在Stage.focus的冒泡链上才能收到该事件。</p>
 * <p>用户可以通过代码 Laya.stage.focus=someNode 的方式来设置focus对象。</p>
 * <p>用户可统一的根据事件对象中 e.keyCode 来判断按键类型，该属性兼容了不同浏览器的实现。</p>
 */
export class KeyBoardManager {
    /**@private */
    static __init__() {
        KeyBoardManager._addEvent("keydown");
        KeyBoardManager._addEvent("keypress");
        KeyBoardManager._addEvent("keyup");
    }
    static _addEvent(type) {
        ILaya.Browser.document.addEventListener(type, function (e) {
            KeyBoardManager._dispatch(e, type);
        }, true);
    }
    static _dispatch(e, type) {
        if (!KeyBoardManager.enabled)
            return;
        KeyBoardManager._event._stoped = false;
        KeyBoardManager._event.nativeEvent = e;
        KeyBoardManager._event.keyCode = e.keyCode || e.which || e.charCode;
        //判断同时按下的键
        if (type === "keydown")
            KeyBoardManager._pressKeys[KeyBoardManager._event.keyCode] = true;
        else if (type === "keyup")
            KeyBoardManager._pressKeys[KeyBoardManager._event.keyCode] = null;
        var target = (ILaya.stage.focus && (ILaya.stage.focus.event != null) && ILaya.stage.focus.displayedInStage) ? ILaya.stage.focus : ILaya.stage;
        var ct = target;
        while (ct) {
            ct.event(type, KeyBoardManager._event.setTo(type, ct, target));
            ct = ct.parent;
        }
    }
    /**
     * 返回指定键是否被按下。
     * @param	key 键值。
     * @return 是否被按下。
     */
    static hasKeyDown(key) {
        return KeyBoardManager._pressKeys[key];
    }
}
KeyBoardManager._pressKeys = {};
/**是否开启键盘事件，默认为true*/
KeyBoardManager.enabled = true;
/**@private */
KeyBoardManager._event = new Event();
