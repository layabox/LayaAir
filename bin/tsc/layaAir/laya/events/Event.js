import { Point } from "../maths/Point";
import { ILaya } from "../../ILaya";
/**
 * <code>Event</code> 是事件类型的集合。一般当发生事件时，<code>Event</code> 对象将作为参数传递给事件侦听器。
 */
export class Event {
    /**
     * 设置事件数据。
     * @param	type 事件类型。
     * @param	currentTarget 事件目标触发对象。
     * @param	target 事件当前冒泡对象。
     * @return 返回当前 Event 对象。
     */
    setTo(type, currentTarget, target) {
        this.type = type;
        this.currentTarget = currentTarget;
        this.target = target;
        return this;
    }
    /**
     * 阻止对事件流中当前节点的后续节点中的所有事件侦听器进行处理。此方法不会影响当前节点 (currentTarget) 中的任何事件侦听器。
     */
    stopPropagation() {
        this._stoped = true;
    }
    /**
     * 触摸点列表。
     */
    get touches() {
        if (!this.nativeEvent)
            return null;
        var arr = this.nativeEvent.touches;
        if (arr) {
            var stage = ILaya.stage;
            for (var i = 0, n = arr.length; i < n; i++) {
                var e = arr[i];
                var point = Point.TEMP;
                point.setTo(e.clientX, e.clientY);
                stage._canvasTransform.invertTransformPoint(point);
                stage.transform.invertTransformPoint(point);
                e.stageX = point.x;
                e.stageY = point.y;
            }
        }
        return arr;
    }
    /**
     * 表示 Alt 键是处于活动状态 (true) 还是非活动状态 (false)。
     */
    get altKey() {
        return this.nativeEvent.altKey;
    }
    /**
     * 表示 Ctrl 键是处于活动状态 (true) 还是非活动状态 (false)。
     */
    get ctrlKey() {
        return this.nativeEvent.ctrlKey;
    }
    /**
     * 表示 Shift 键是处于活动状态 (true) 还是非活动状态 (false)。
     */
    get shiftKey() {
        return this.nativeEvent.shiftKey;
    }
    /**
     * 包含按下或释放的键的字符代码值。字符代码值为英文键盘值。
     */
    get charCode() {
        return this.nativeEvent.charCode;
    }
    /**
     * 表示键在键盘上的位置。这对于区分在键盘上多次出现的键非常有用。<br>
     * 例如，您可以根据此属性的值来区分左 Shift 键和右 Shift 键：左 Shift 键的值为 KeyLocation.LEFT，右 Shift 键的值为 KeyLocation.RIGHT。另一个示例是区分标准键盘 (KeyLocation.STANDARD) 与数字键盘 (KeyLocation.NUM_PAD) 上按下的数字键。
     */
    get keyLocation() {
        return this.nativeEvent.location || this.nativeEvent.keyLocation;
    }
    /**鼠标在 Stage 上的 X 轴坐标*/
    get stageX() {
        return ILaya.stage.mouseX;
    }
    /**鼠标在 Stage 上的 Y 轴坐标*/
    get stageY() {
        return ILaya.stage.mouseY;
    }
}
/** 一个空的 Event 对象。用于事件派发中转使用。*/
Event.EMPTY = new Event();
/** 定义 mousedown 事件对象的 type 属性值。*/
Event.MOUSE_DOWN = "mousedown";
/** 定义 mouseup 事件对象的 type 属性值。*/
Event.MOUSE_UP = "mouseup";
/** 定义 click 事件对象的 type 属性值。*/
Event.CLICK = "click";
/** 定义 rightmousedown 事件对象的 type 属性值。*/
Event.RIGHT_MOUSE_DOWN = "rightmousedown";
/** 定义 rightmouseup 事件对象的 type 属性值。*/
Event.RIGHT_MOUSE_UP = "rightmouseup";
/** 定义 rightclick 事件对象的 type 属性值。*/
Event.RIGHT_CLICK = "rightclick";
/** 定义 mousemove 事件对象的 type 属性值。*/
Event.MOUSE_MOVE = "mousemove";
/** 定义 mouseover 事件对象的 type 属性值。*/
Event.MOUSE_OVER = "mouseover";
/** 定义 mouseout 事件对象的 type 属性值。*/
Event.MOUSE_OUT = "mouseout";
/** 定义 mousewheel 事件对象的 type 属性值。*/
Event.MOUSE_WHEEL = "mousewheel";
/** 定义 mouseover 事件对象的 type 属性值。*/
Event.ROLL_OVER = "mouseover";
/** 定义 mouseout 事件对象的 type 属性值。*/
Event.ROLL_OUT = "mouseout";
/** 定义 doubleclick 事件对象的 type 属性值。*/
Event.DOUBLE_CLICK = "doubleclick";
/** 定义 change 事件对象的 type 属性值。*/
Event.CHANGE = "change";
/** 定义 changed 事件对象的 type 属性值。*/
Event.CHANGED = "changed";
/** 定义 resize 事件对象的 type 属性值。*/
Event.RESIZE = "resize";
/** 定义 added 事件对象的 type 属性值。*/
Event.ADDED = "added";
/** 定义 removed 事件对象的 type 属性值。*/
Event.REMOVED = "removed";
/** 定义 display 事件对象的 type 属性值。*/
Event.DISPLAY = "display";
/** 定义 undisplay 事件对象的 type 属性值。*/
Event.UNDISPLAY = "undisplay";
/** 定义 error 事件对象的 type 属性值。*/
Event.ERROR = "error";
/** 定义 complete 事件对象的 type 属性值。*/
Event.COMPLETE = "complete";
/** 定义 loaded 事件对象的 type 属性值。*/
Event.LOADED = "loaded";
/** 定义 loaded 事件对象的 type 属性值。*/
Event.READY = "ready";
/** 定义 progress 事件对象的 type 属性值。*/
Event.PROGRESS = "progress";
/** 定义 input 事件对象的 type 属性值。*/
Event.INPUT = "input";
/** 定义 render 事件对象的 type 属性值。*/
Event.RENDER = "render";
/** 定义 open 事件对象的 type 属性值。*/
Event.OPEN = "open";
/** 定义 message 事件对象的 type 属性值。*/
Event.MESSAGE = "message";
/** 定义 close 事件对象的 type 属性值。*/
Event.CLOSE = "close";
/** 定义 keydown 事件对象的 type 属性值。*/
Event.KEY_DOWN = "keydown";
/** 定义 keypress 事件对象的 type 属性值。*/
Event.KEY_PRESS = "keypress";
/** 定义 keyup 事件对象的 type 属性值。*/
Event.KEY_UP = "keyup";
/** 定义 frame 事件对象的 type 属性值。*/
Event.FRAME = "enterframe";
/** 定义 dragstart 事件对象的 type 属性值。*/
Event.DRAG_START = "dragstart";
/** 定义 dragmove 事件对象的 type 属性值。*/
Event.DRAG_MOVE = "dragmove";
/** 定义 dragend 事件对象的 type 属性值。*/
Event.DRAG_END = "dragend";
/** 定义 enter 事件对象的 type 属性值。*/
Event.ENTER = "enter";
/** 定义 select 事件对象的 type 属性值。*/
Event.SELECT = "select";
/** 定义 blur 事件对象的 type 属性值。*/
Event.BLUR = "blur";
/** 定义 focus 事件对象的 type 属性值。*/
Event.FOCUS = "focus";
/** 定义 visibilitychange 事件对象的 type 属性值。*/
Event.VISIBILITY_CHANGE = "visibilitychange";
/** 定义 focuschange 事件对象的 type 属性值。*/
Event.FOCUS_CHANGE = "focuschange";
/** 定义 played 事件对象的 type 属性值。*/
Event.PLAYED = "played";
/** 定义 paused 事件对象的 type 属性值。*/
Event.PAUSED = "paused";
/** 定义 stopped 事件对象的 type 属性值。*/
Event.STOPPED = "stopped";
/** 定义 start 事件对象的 type 属性值。*/
Event.START = "start";
/** 定义 end 事件对象的 type 属性值。*/
Event.END = "end";
/** 定义 componentadded 事件对象的 type 属性值。*/
Event.COMPONENT_ADDED = "componentadded";
/** 定义 componentremoved 事件对象的 type 属性值。*/
Event.COMPONENT_REMOVED = "componentremoved";
/** 定义 released 事件对象的 type 属性值。*/
Event.RELEASED = "released";
/** 定义 link 事件对象的 type 属性值。*/
Event.LINK = "link";
/** 定义 label 事件对象的 type 属性值。*/
Event.LABEL = "label";
/**浏览器全屏更改时触发*/
Event.FULL_SCREEN_CHANGE = "fullscreenchange";
/**显卡设备丢失时触发*/
Event.DEVICE_LOST = "devicelost";
/**世界矩阵更新时触发。*/
Event.TRANSFORM_CHANGED = "transformchanged";
/**更换动作时触发。*/
Event.ANIMATION_CHANGED = "animationchanged";
/**拖尾渲染节点改变时触发。*/
Event.TRAIL_FILTER_CHANGE = "trailfilterchange";
/**物理碰撞开始*/
Event.TRIGGER_ENTER = "triggerenter";
/**物理碰撞持续*/
Event.TRIGGER_STAY = "triggerstay";
/**物理碰撞结束*/
Event.TRIGGER_EXIT = "triggerexit";
