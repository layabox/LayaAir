import { SoundManager } from "./SoundManager";
import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
/**
 * @private
 */
export class SoundNode extends Sprite {
    constructor() {
        super();
        this.visible = false;
        this.on(Event.ADDED, this, this._onParentChange);
        this.on(Event.REMOVED, this, this._onParentChange);
    }
    /**@private */
    _onParentChange() {
        this.target = this.parent;
    }
    /**
     * 播放
     * @param loops 循环次数
     * @param complete 完成回调
     *
     */
    play(loops = 1, complete = null) {
        if (isNaN(loops)) {
            loops = 1;
        }
        if (!this.url)
            return;
        this.stop();
        this._channel = SoundManager.playSound(this.url, loops, complete);
    }
    /**
     * 停止播放
     *
     */
    stop() {
        if (this._channel && !this._channel.isStopped) {
            this._channel.stop();
        }
        this._channel = null;
    }
    /**@private */
    _setPlayAction(tar, event, action, add = true) {
        if (!this[action])
            return;
        if (!tar)
            return;
        if (add) {
            tar.on(event, this, this[action]);
        }
        else {
            tar.off(event, this, this[action]);
        }
    }
    /**@private */
    _setPlayActions(tar, events, action, add = true) {
        if (!tar)
            return;
        if (!events)
            return;
        var eventArr = events.split(",");
        var i, len;
        len = eventArr.length;
        for (i = 0; i < len; i++) {
            this._setPlayAction(tar, eventArr[i], action, add);
        }
    }
    /**
     * 设置触发播放的事件
     * @param events
     *
     */
    set playEvent(events) {
        this._playEvents = events;
        if (!events)
            return;
        if (this._tar) {
            this._setPlayActions(this._tar, events, "play");
        }
    }
    /**
     * 设置控制播放的对象
     * @param tar
     *
     */
    set target(tar) {
        if (this._tar) {
            this._setPlayActions(this._tar, this._playEvents, "play", false);
            this._setPlayActions(this._tar, this._stopEvents, "stop", false);
        }
        this._tar = tar;
        if (this._tar) {
            this._setPlayActions(this._tar, this._playEvents, "play", true);
            this._setPlayActions(this._tar, this._stopEvents, "stop", true);
        }
    }
    /**
     * 设置触发停止的事件
     * @param events
     *
     */
    set stopEvent(events) {
        this._stopEvents = events;
        if (!events)
            return;
        if (this._tar) {
            this._setPlayActions(this._tar, events, "stop");
        }
    }
}
