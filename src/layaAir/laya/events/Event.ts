import { Point } from "../maths/Point"

export interface ITouchInfo {
    touchId: number;
    readonly pos: Point;
}

/**
 * <code>Event</code> 是事件类型的集合。一般当发生事件时，<code>Event</code> 对象将作为参数传递给事件侦听器。
 */
export class Event {

    /** 一个空的 Event 对象。用于事件派发中转使用。*/
    static readonly EMPTY: Readonly<Event> = new Event();

    /** 定义 mousedown 事件对象的 type 属性值。*/
    static MOUSE_DOWN = "mousedown";
    /** 定义 mouseup 事件对象的 type 属性值。*/
    static MOUSE_UP = "mouseup";
    /** 定义 rightmousedown 事件对象的 type 属性值。*/
    static RIGHT_MOUSE_DOWN: string = "rightmousedown";
    /** 定义 rightmouseup 事件对象的 type 属性值。*/
    static RIGHT_MOUSE_UP: string = "rightmouseup";
    /** 定义 click 事件对象的 type 属性值。*/
    static CLICK = "click";
    /** 定义 rightclick 事件对象的 type 属性值。*/
    static RIGHT_CLICK = "rightclick";
    /** 定义 mousemove 事件对象的 type 属性值。*/
    static MOUSE_MOVE = "mousemove";
    /** 定义 mouseover 事件对象的 type 属性值。*/
    static MOUSE_OVER = "mouseover";
    /** 定义 mouseout 事件对象的 type 属性值。*/
    static MOUSE_OUT = "mouseout";
    /** 定义 mousewheel 事件对象的 type 属性值。*/
    static MOUSE_WHEEL = "mousewheel";
    /** 定义 mouseover 事件对象的 type 属性值。*/
    static ROLL_OVER = "mouseover";
    /** 定义 mouseout 事件对象的 type 属性值。*/
    static ROLL_OUT = "mouseout";
    /** 定义 doubleclick 事件对象的 type 属性值。*/
    static DOUBLE_CLICK = "doubleclick";
    /** 定义 mousemove 事件对象的 type 属性值。*/
    static MOUSE_DRAG = "mousedrag";
    /** 定义 mousemove 事件对象的 type 属性值。*/
    static MOUSE_DRAG_END = "mousedragend";

    /** 定义 dragstart 事件对象的 type 属性值。*/
    static DRAG_START = "dragstart";
    /** 定义 dragmove 事件对象的 type 属性值。*/
    static DRAG_MOVE = "dragmove";
    /** 定义 dragend 事件对象的 type 属性值。*/
    static DRAG_END = "dragend";

    /** 定义 keydown 事件对象的 type 属性值。*/
    static KEY_DOWN = "keydown";
    /** 定义 keypress 事件对象的 type 属性值。*/
    static KEY_PRESS = "keypress";
    /** 定义 keyup 事件对象的 type 属性值。*/
    static KEY_UP = "keyup";

    /** 定义 change 事件对象的 type 属性值。*/
    static CHANGE = "change";
    /** 定义 changed 事件对象的 type 属性值。*/
    static CHANGED = "changed";
    /** 定义 willResize 事件对象的 type 属性值。*/
    static WILL_RESIZE = "willResize";
    /** 定义 resize 事件对象的 type 属性值。*/
    static RESIZE = "resize";

    /** 定义 added 事件对象的 type 属性值。*/
    static ADDED = "added";
    /** 定义 removed 事件对象的 type 属性值。*/
    static REMOVED = "removed";
    /** 定义 display 事件对象的 type 属性值。*/
    static DISPLAY = "display";
    /** 定义 undisplay 事件对象的 type 属性值。*/
    static UNDISPLAY = "undisplay";

    /** 定义 error 事件对象的 type 属性值。*/
    static ERROR = "error";
    /** 定义 complete 事件对象的 type 属性值。*/
    static COMPLETE = "complete";
    /** 定义 loaded 事件对象的 type 属性值。*/
    static LOADED = "loaded";
    /** 定义 loaded 事件对象的 type 属性值。*/
    static READY = "ready";
    /** 定义 progress 事件对象的 type 属性值。*/
    static PROGRESS = "progress";
    /** 定义 input 事件对象的 type 属性值。*/
    static INPUT = "input";
    /** 定义 render 事件对象的 type 属性值。*/
    static RENDER = "render";
    /** 定义 open 事件对象的 type 属性值。*/
    static OPEN = "open";
    /** 定义 message 事件对象的 type 属性值。*/
    static MESSAGE = "message";
    /** 定义 close 事件对象的 type 属性值。*/
    static CLOSE = "close";

    /** 定义 frame 事件对象的 type 属性值。*/
    static FRAME = "enterframe";
    /** 定义 enter 事件对象的 type 属性值。*/
    static ENTER = "enter";
    /** 定义 select 事件对象的 type 属性值。*/
    static SELECT = "select";
    /** 定义 blur 事件对象的 type 属性值。*/
    static BLUR = "blur";
    /** 定义 focus 事件对象的 type 属性值。*/
    static FOCUS = "focus";
    /** 定义 visibilitychange 事件对象的 type 属性值。*/
    static VISIBILITY_CHANGE = "visibilitychange";
    /** 定义 focuschange 事件对象的 type 属性值。*/
    static FOCUS_CHANGE = "focuschange";
    /** 定义 played 事件对象的 type 属性值。*/
    static PLAYED = "played";
    /** 定义 paused 事件对象的 type 属性值。*/
    static PAUSED = "paused";
    /** 定义 stopped 事件对象的 type 属性值。*/
    static STOPPED = "stopped";
    /** 定义 start 事件对象的 type 属性值。*/
    static START = "start";
    /** 定义 end 事件对象的 type 属性值。*/
    static END = "end";
    /** 定义 link 事件对象的 type 属性值。*/
    static LINK = "link";
    /** 定义 label 事件对象的 type 属性值。*/
    static LABEL = "label";
    /**浏览器全屏更改时触发*/
    static FULL_SCREEN_CHANGE = "fullscreenchange";
    /**显卡设备丢失时触发*/
    static DEVICE_LOST = "devicelost";
    /**世界矩阵更新时触发。*/
    static TRANSFORM_CHANGED = "transformchanged";
    /**3D layer改变时触发。*/
    static LAYERCHANGE = "layerChange";
    /**3D Static改变时触发 */
    static staticMask = "staticMask";

    /**物理碰撞开始*/
    static TRIGGER_ENTER = "triggerenter";
    /**物理碰撞持续*/
    static TRIGGER_STAY = "triggerstay";
    /**物理碰撞结束*/
    static TRIGGER_EXIT = "triggerexit";

    /**物理碰撞开始*/
    static COLLISION_ENTER = "collisionenter";
    /**物理碰撞持续*/
    static COLLISION_STAY = "collisionstay";
    /**物理碰撞结束*/
    static COLLISION_EXIT = "collisionexit";
    /**关节破坏 */
    static JOINT_BREAK = "jointbreak";

    /**
     * 检测指定事件类型是否是鼠标事件。
     * @param	type 事件的类型。
     * @return	如果是鼠标事件，则值为 true;否则，值为 false。
     */
    static isMouseEvent(type: string): boolean {
        return MOUSE_EVENTS.has(type);
    }

    /** 事件类型。*/
    type: string;
    /** 事件目标触发对象。*/
    target: any;
    /** 事件当前冒泡对象。*/
    currentTarget: any;

    /** 分配给触摸点的唯一标识号（作为 int）。*/
    touchId: number = 0;
    /** 点击坐标 */
    readonly touchPos: Point;
    /** 是否双击 */
    isDblClick: boolean;
    /**滚轮滑动增量*/
    delta: number = 0;
    /** 
     * 鼠标按键，
     * 0：主按键，通常指鼠标左键
     * 1：辅助按键，通常指鼠标滚轮中键
     * 2：次按键，通常指鼠标右键
     * 3：第四个按钮，通常指浏览器后退按钮
     * 4：第五个按钮，通常指浏览器的前进按钮
     */
    button: number = 0;

    /** 原生浏览器事件。*/
    nativeEvent: MouseEvent | TouchEvent | WheelEvent | KeyboardEvent;

    /** @internal */
    _stopped: boolean;
    /** @internal */
    _touches: ReadonlyArray<Readonly<ITouchInfo>>;

    constructor() {
        this.touchPos = new Point();
    }

    /**
     * 设置事件数据。
     * @param	type 事件类型。
     * @param	currentTarget 事件目标触发对象。
     * @param	target 事件当前冒泡对象。
     * @return 返回当前 Event 对象。
     */
    setTo(type: string, currentTarget: any, target: any): Event {
        this.type = type;
        this.currentTarget = currentTarget;
        this.target = target;
        return this;
    }

    /**
     * 阻止对事件流中当前节点的后续节点中的所有事件侦听器进行处理。此方法不会影响当前节点 (currentTarget) 中的任何事件侦听器。
     */
    stopPropagation(): void {
        this._stopped = true;
    }

    /**
     * 触摸点列表。
     */
    get touches(): ReadonlyArray<Readonly<ITouchInfo>> {
        return this._touches;
    }

    /**
     * 表示 Alt 键是处于活动状态 (true) 还是非活动状态 (false)。
     */
    get altKey(): boolean {
        return this.nativeEvent?.altKey;
    }

    /**
     * 表示 Ctrl 键是处于活动状态 (true) 还是非活动状态 (false)。
     */
    get ctrlKey(): boolean {
        return this.nativeEvent?.ctrlKey;
    }

    /**
     * 表示 Shift 键是处于活动状态 (true) 还是非活动状态 (false)。
     */
    get shiftKey(): boolean {
        return this.nativeEvent?.shiftKey;
    }

    /**
     * 表示 Shift 键是处于活动状态 (true) 还是非活动状态 (false)。
     */
    get metaKey(): boolean {
        return this.nativeEvent?.metaKey;
    }

    get key(): string {
        return (<KeyboardEvent>this.nativeEvent).key;
    }

    get keyCode(): number {
        return (<KeyboardEvent>this.nativeEvent).keyCode;
    }

    /**
     * 包含按下或释放的键的字符代码值。字符代码值为英文键盘值。
     */
    get charCode(): string {
        return (<KeyboardEvent>this.nativeEvent)?.code;
    }

    /**
     * 表示键在键盘上的位置。这对于区分在键盘上多次出现的键非常有用。<br>
     * 例如，您可以根据此属性的值来区分左 Shift 键和右 Shift 键：左 Shift 键的值为 KeyLocation.LEFT，右 Shift 键的值为 KeyLocation.RIGHT。另一个示例是区分标准键盘 (KeyLocation.STANDARD) 与数字键盘 (KeyLocation.NUM_PAD) 上按下的数字键。
     */
    get keyLocation(): number {
        if (this.nativeEvent)
            return (<KeyboardEvent>this.nativeEvent).location || (<any>this.nativeEvent).keyLocation;
        else
            return 0;
    }

    /**鼠标在 Stage 上的 X 轴坐标*/
    get stageX(): number {
        return this.touchPos.x;
    }

    /**鼠标在 Stage 上的 Y 轴坐标*/
    get stageY(): number {
        return this.touchPos.y;
    }
}

const MOUSE_EVENTS = new Set<string>([
    Event.MOUSE_DOWN, Event.MOUSE_UP, Event.MOUSE_MOVE, Event.CLICK, Event.DOUBLE_CLICK,
    Event.RIGHT_CLICK, Event.RIGHT_MOUSE_DOWN, Event.RIGHT_MOUSE_UP,
    Event.MOUSE_OVER, Event.MOUSE_OUT, Event.MOUSE_WHEEL
]);