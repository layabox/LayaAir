import { Point } from "../maths/Point"

export interface ITouchInfo {
    touchId: number;
    readonly pos: Point;
}
/**
 * @en `Event` is a collection of event types. Generally, when an event occurs, the `Event` object is passed as a parameter to the event listener.
 * @zh `Event` 是事件类型的集合。一般当发生事件时,`Event` 对象将作为参数传递给事件侦听器。
 */
export class Event {

    /** 
     * @en An empty Event object. Used for event dispatch transfer.
     * @zh 一个空的 Event 对象。用于事件派发中转使用。
     */
    static readonly EMPTY: Readonly<Event> = new Event();
    /**
     * @en Defines the value of the `type` property of a `mousedown` event object, triggered when pressed on a display object.
     * @zh 定义 `mousedown` 事件对象的 `type` 属性值，用于在显示对象上按下后触发。
     */
    static MOUSE_DOWN = "mousedown";
    /**
     * @en Defines the value of the `type` property of a `mouseup` event object, triggered when released on a display object.
     * @zh 定义 `mouseup` 事件对象的 `type` 属性值，用于在显示对象抬起后触发。
     */
    static MOUSE_UP = "mouseup";
    /**
     * @en Defines the value of the `type` property of a `rightmousedown` event object.
     * @zh 定义 `rightmousedown` 事件对象的 `type` 属性值。
     */
    static RIGHT_MOUSE_DOWN: string = "rightmousedown";
    /**
     * @en Defines the value of the `type` property of a `rightmouseup` event object.
     * @zh 定义 `rightmouseup` 事件对象的 `type` 属性值。
     */
    static RIGHT_MOUSE_UP: string = "rightmouseup";
    /**
     * @en Defines the value of the `type` property of a `click` event object, triggered when a mouse click completes on a display object.
     * @zh 定义 `click` 事件对象的 `type` 属性值，用于鼠标点击对象后触发。
     */
    static CLICK = "click";
    /**
     * @en Defines the value of the `type` property of a `rightclick` event object.
     * @zh 定义 `rightclick` 事件对象的 `type` 属性值。
     */
    static RIGHT_CLICK = "rightclick";
    /**
     * @en Defines the value of the `type` property of a `mousemove` event object, triggered when mouse moves over a display object.
     * @zh 定义 `mousemove` 事件对象的 `type` 属性值，用于鼠标在对象身上进行移动后触发。
     */
    static MOUSE_MOVE = "mousemove";
    /**
     * @en Defines the value of the `type` property of a `mouseover` event object.
     * @zh 定义 `mouseover` 事件对象的 `type` 属性值。
     */
    static MOUSE_OVER = "mouseover";
    /**
     * @en Defines the value of the `type` property of a `mouseout` event object.
     * @zh 定义 `mouseout` 事件对象的 `type` 属性值。
     */
    static MOUSE_OUT = "mouseout";
    /**
     * @en Defines the value of the `type` property of a `mousewheel` event object.
     * @zh 定义 `mousewheel` 事件对象的 `type` 属性值。
     */
    static MOUSE_WHEEL = "mousewheel";
    /**
     * @en Defines the value of the `type` property of a `mouseover` event object.
     * @zh 定义 `mouseover` 事件对象的 `type` 属性值。
     */
    static ROLL_OVER = "mouseover";
    /**
     * @en Defines the value of the `type` property of a `mouseout` event object, triggered when mouse leaves a display object.
     * @zh 定义 `mouseout` 事件对象的 `type` 属性值，用于鼠标离开对象后触发。
     */
    static ROLL_OUT = "mouseout";
    /**
     * @en Defines the value of the `type` property of a `doubleclick` event object.
     * @zh 定义 `doubleclick` 事件对象的 `type` 属性值。
     */
    static DOUBLE_CLICK = "doubleclick";
    /**
     * @en Defines the value of the `type` property of a `mousedrag` event object.
     * @zh 定义 `mousedrag` 事件对象的 `type` 属性值。
     */
    static MOUSE_DRAG = "mousedrag";
    /**
     * @en Defines the value of the `type` property of a `mousedragend` event object.
     * @zh 定义 `mousedragend` 事件对象的 `type` 属性值。
     */
    static MOUSE_DRAG_END = "mousedragend";

    /**
     * @en Defines the value of the `type` property of a `dragstart` event object, triggered when drag start.
     * @zh 定义 `dragstart` 事件对象的 `type` 属性值，用于开始拖动后触发。
     */
    static DRAG_START = "dragstart";
    /**
     * @en Defines the value of the `type` property of a `dragmove` event object, triggered when dragging.
     * @zh 定义 `dragmove` 事件对象的 `type` 属性值，用于拖动中触发。
     */
    static DRAG_MOVE = "dragmove";
    /**
     * @en Defines the value of the `type` property of a `dragend` event object, triggered when drag end.
     * @zh 定义 `dragend` 事件对象的 `type` 属性值，用于拖动结束后触发。
     */
    static DRAG_END = "dragend";

    /**
     * @en Defines the value of the `type` property of a `keydown` event object.
     * @zh 定义 `keydown` 事件对象的 `type` 属性值。
     */
    static KEY_DOWN = "keydown";
    /**
     * @en Defines the value of the `type` property of a `keypress` event object.
     * @zh 定义 `keypress` 事件对象的 `type` 属性值。
     */
    static KEY_PRESS = "keypress";
    /**
     * @en Defines the value of the `type` property of a `keyup` event object.
     * @zh 定义 `keyup` 事件对象的 `type` 属性值。
     */
    static KEY_UP = "keyup";

    /**
     * @en Defines the value of the `type` property of a `change` event object.
     * @zh 定义 `change` 事件对象的 `type` 属性值。
     */
    static CHANGE = "change";
    /**
     * @en Defines the value of the `type` property of a `changed` event object.
     * @zh 定义 `changed` 事件对象的 `type` 属性值。
     */
    static CHANGED = "changed";
    /**
     * @en Defines the value of the `type` property of a `willResize` event object.
     * @zh 定义 `willResize` 事件对象的 `type` 属性值。
     */
    static WILL_RESIZE = "willResize";
    /**
     * @en Defines the value of the `type` property of a `resize` event object.
     * @zh 定义 `resize` 事件对象的 `type` 属性值。
     */
    static RESIZE = "resize";

    /**
     * @en Defines the value of the `type` property of an `added` event object.
     * @zh 定义 `added` 事件对象的 `type` 属性值。
     */
    static ADDED = "added";
    /**
     * @en Defines the value of the `type` property of a `removed` event object.
     * @zh 定义 `removed` 事件对象的 `type` 属性值。
     */
    static REMOVED = "removed";
    /**
     * @en Defines the value of the `type` property of a `display` event object.
     * @zh 定义 `display` 事件对象的 `type` 属性值。
     */
    static DISPLAY = "display";
    /**
     * @en Defines the value of the `type` property of an `undisplay` event object.
     * @zh 定义 `undisplay` 事件对象的 `type` 属性值。
     */
    static UNDISPLAY = "undisplay";

    /**
     * @en Defines the value of the `type` property of an `error` event object.
     * @zh 定义 `error` 事件对象的 `type` 属性值。
     */
    static ERROR = "error";
    /**
     * @en Defines the value of the `type` property of a `complete` event object.
     * @zh 定义 `complete` 事件对象的 `type` 属性值。
     */
    static COMPLETE = "complete";
    /**
     * @en Defines the value of the `type` property of a `loaded` event object.
     * @zh 定义 `loaded` 事件对象的 `type` 属性值。
     */
    static LOADED = "loaded";
    /**
     * @en Defines the value of the `type` property of a `ready` event object.
     * @zh 定义 `ready` 事件对象的 `type` 属性值。
     */
    static READY = "ready";
    /**
     * @en Defines the value of the `type` property of a `progress` event object.
     * @zh 定义 `progress` 事件对象的 `type` 属性值。
     */
    static PROGRESS = "progress";
    /**
     * @en Defines the value of the `type` property of an `input` event object.
     * @zh 定义 `input` 事件对象的 `type` 属性值。
     */
    static INPUT = "input";
    /**
     * @en Defines the value of the `type` property of a `render` event object.
     * @zh 定义 `render` 事件对象的 `type` 属性值。
     */
    static RENDER = "render";
    /**
     * @en Defines the value of the `type` property of an `open` event object.
     * @zh 定义 `open` 事件对象的 `type` 属性值。
     */
    static OPEN = "open";
    /**
     * @en Defines the value of the `type` property of a `message` event object.
     * @zh 定义 `message` 事件对象的 `type` 属性值。
     */
    static MESSAGE = "message";
    /**
     * @en Defines the value of the `type` property of a `close` event object.
     * @zh 定义 `close` 事件对象的 `type` 属性值。
     */
    static CLOSE = "close";

    /**
     * @en Defines the value of the `type` property of a `enterframe` event object.
     * @zh 定义 `enterframe` 事件对象的 `type` 属性值。
     */
    static FRAME = "enterframe";
    /**
     * @en Defines the value of the `type` property of an `enter` event object.
     * @zh 定义 `enter` 事件对象的 `type` 属性值。
     */
    static ENTER = "enter";
    /**
     * @en Defines the value of the `type` property of a `select` event object.
     * @zh 定义 `select` 事件对象的 `type` 属性值。
     */
    static SELECT = "select";
    /**
     * @en Defines the value of the `type` property of a `blur` event object.
     * @zh 定义 `blur` 事件对象的 `type` 属性值。
     */
    static BLUR = "blur";
    /**
     * @en Defines the value of the `type` property of a `focus` event object.
     * @zh 定义 `focus` 事件对象的 `type` 属性值。
     */
    static FOCUS = "focus";
    /**
     * @en Defines the value of the `type` property of a `visibilitychange` event object.
     * @zh 定义 `visibilitychange` 事件对象的 `type` 属性值。
     */
    static VISIBILITY_CHANGE = "visibilitychange";
    /**
     * @en Defines the value of the `type` property of a `focuschange` event object.
     * @zh 定义 `focuschange` 事件对象的 `type` 属性值。
     */
    static FOCUS_CHANGE = "focuschange";
    /**
     * @en Defines the value of the `type` property of a `played` event object.
     * @zh 定义 `played` 事件对象的 `type` 属性值。
     */
    static PLAYED = "played";
    /**
     * @en Defines the value of the `type` property of a `paused` event object.
     * @zh 定义 `paused` 事件对象的 `type` 属性值。
     */
    static PAUSED = "paused";
    /**
     * @en Defines the value of the `type` property of a `stopped` event object.
     * @zh 定义 `stopped` 事件对象的 `type` 属性值。
     */
    static STOPPED = "stopped";
    /**
     * @en Defines the value of the `type` property of a `start` event object.
     * @zh 定义 `start` 事件对象的 `type` 属性值。
     */
    static START = "start";
    /**
     * @en Defines the value of the `type` property of an `end` event object.
     * @zh 定义 `end` 事件对象的 `type` 属性值。
     */
    static END = "end";
    /**
     * @en Defines the value of the `type` property of a `link` event object.
     * @zh 定义 `link` 事件对象的 `type` 属性值。
     */
    static LINK = "link";
    /**
     * @en Defines the value of the `type` property of a `label` event object.
     * @zh 定义 `label` 事件对象的 `type` 属性值。
     */
    static LABEL = "label";
    /**
     * @en Triggered when the full screen state changes in the browser.
     * @zh 浏览器全屏更改时触发
     */
    static FULL_SCREEN_CHANGE = "fullscreenchange";
    /**
     * @en Triggered when the GPU device is lost.
     * @zh 显卡设备丢失时触发
     */
    static DEVICE_LOST = "devicelost";
    /**
     * @en Triggered when the world matrix is updated.
     * @zh 世界矩阵更新时触发。
     */
    static TRANSFORM_CHANGED = "transformchanged";
    /**
     * @en Triggered when a 3D layer changes.
     * @zh 3D layer改变时触发。
     */
    static LAYERCHANGE = "layerChange";
    /**
    * @en Triggered when 3D Static changes.
    * @zh 3D Static改变时触发。
    */
    static staticMask = "staticMask";

    /**
     * @en For 2D physics collision or 3D physics trigger start.
     * @zh 2D物理碰撞或3D物理触发开始。
     */
    static TRIGGER_ENTER = "triggerenter";
    /**
     * @en For 2D physics collision or 3D physics trigger continues.
     * @zh 2D物理碰撞或3D物理触发持续。
     */
    static TRIGGER_STAY = "triggerstay";
    /**
     * @en For 2D physics collision or 3D physics trigger end.
     * @zh 2D物理碰撞或3D物理触发结束。
     */
    static TRIGGER_EXIT = "triggerexit";

    /**
     * @en 3DPhysical collision start.
     * @zh 3D物理碰撞开始。
     */
    static COLLISION_ENTER = "collisionenter";
    /**
     * @en 3DPhysical collision continues.
     * @zh 3D物理碰撞持续。
     */
    static COLLISION_STAY = "collisionstay";
    /**
     * @en 3DPhysical collision end.
     * @zh 3D物理碰撞结束。
     */
    static COLLISION_EXIT = "collisionexit";
    /**
     * @en Joint destruction.
     * @zh 关节破坏。
     */
    static JOINT_BREAK = "jointbreak";

    /** @internal */
    static _Add_Script = "addscript";
    /**
     * @en Checks whether the specified event type is a mouse event.
     * @param type The type of the event.
     * @returns True if the specified event type is a mouse event; otherwise, false.
     * @zh 检测指定事件类型是否是鼠标事件。
     * @param type 事件的类型。
     * @returns 如果是鼠标事件，则值为 true;否则，值为 false。
     */
    static isMouseEvent(type: string): boolean {
        return MOUSE_EVENTS.has(type);
    }

    /**
     * @en The event type.
     * @zh 事件类型。
     */
    type: string;
    /**
     * @en The triggering object of the event.
     * @zh 事件目标触发对象。
     */
    target: any;
    /**
     * @en The current propagation object of the event.
     * @zh 事件当前冒泡对象。
     */
    currentTarget: any;

    /**
     * @en Unique identifier assigned to the touch point (as an int).
     * @zh 分配给触摸点的唯一标识号（作为 int）。
     */
    touchId: number = 0;
    /**
     * @en The clicked position.
     * @zh 点击坐标。
     */
    readonly touchPos: Point;
    /**
     * @en Specifies whether this is a double-click.
     * @zh 是否双击。
     */
    isDblClick: boolean;
    /**
     * @en The scroll wheel increments.
     * @zh 滚轮滑动增量。
     */
    delta: number = 0;
    /** 
     * @en The mouse button.
     * - 0: Main button, usually the left button
     * - 1: Auxiliary button, usually the middle button (wheel button)
     * - 2: Secondary button, usually the right button
     * - 3: Fourth button, typically the browser Back button
     * - 4: Fifth button, typically the browser Forward button
     * @zh 鼠标按键，
     * - 0：主按键，通常指鼠标左键
     * - 1：辅助按键，通常指鼠标滚轮中键
     * - 2：次按键，通常指鼠标右键
     * - 3：第四个按钮，通常指浏览器后退按钮
     * - 4：第五个按钮，通常指浏览器的前进按钮
     */
    button: number = 0;

    /**
     * @en The original browser event.
     * @zh 原生浏览器事件。
     */
    nativeEvent: MouseEvent | TouchEvent | WheelEvent | KeyboardEvent;

    /** @internal */
    _stopped: boolean;
    /** @internal */
    _touches: ReadonlyArray<Readonly<ITouchInfo>>;

    constructor() {
        this.touchPos = new Point();
    }

    /**
     * @en Sets the event data.
     * @param type The type of the event.
     * @param currentTarget The triggering object of the event.
     * @param target The current propagation object of the event.
     * @returns The current Event object.
     * @zh 设置事件数据。
     * @param type 事件类型。
     * @param currentTarget 事件目标触发对象。
     * @param target 事件当前冒泡对象。
     * @returns 返回当前 Event 对象。
     */
    setTo(type: string, currentTarget: any, target: any): Event {
        this.type = type;
        this.currentTarget = currentTarget;
        this.target = target;
        return this;
    }

    /**
     * @en Prevents processing of all event listeners on the current node in the event flow after the current one.
     * This method does not affect any event listeners on the current node (currentTarget).
     * @zh 阻止对事件流中当前节点的后续节点中的所有事件侦听器进行处理。此方法不会影响当前节点 (currentTarget) 中的任何事件侦听器。
     */
    stopPropagation(): void {
        this._stopped = true;
    }

    /**
     * @en The list of touch points.
     * @zh 触摸点列表。
     */
    get touches(): ReadonlyArray<Readonly<ITouchInfo>> {
        return this._touches;
    }

    /**
     * @en Indicates whether the Alt key is active (true) or inactive (false).
     * @zh 表示 Alt 键是处于活动状态 (true) 还是非活动状态 (false)。
     */
    get altKey(): boolean {
        return this.nativeEvent?.altKey;
    }

    /**
     * @en Indicates whether the Ctrl key is active (true) or inactive (false).
     * @zh 表示 Ctrl 键是处于活动状态 (true) 还是非活动状态 (false)。
     */
    get ctrlKey(): boolean {
        return this.nativeEvent?.ctrlKey;
    }

    /**
     * @en Indicates whether the Shift key is active (true) or inactive (false).
     * @zh 表示 Shift 键是处于活动状态 (true) 还是非活动状态 (false)。
     */
    get shiftKey(): boolean {
        return this.nativeEvent?.shiftKey;
    }

    /**
     * @en Indicates whether the Shift key is active (true) or inactive (false).
     * @zh 表示 Shift 键是处于活动状态 (true) 还是非活动状态 (false)。
     */
    get metaKey(): boolean {
        return this.nativeEvent?.metaKey;
    }

    /**
     * @en The event name.
     * @zh 事件名称。
     */
    get key(): string {
        return (<KeyboardEvent>this.nativeEvent).key;
    }

    /**
     * @en The event name index.
     * @zh 事件名称索引。
     */
    get keyCode(): number {
        return (<KeyboardEvent>this.nativeEvent).keyCode;
    }

    /**
     * @en Contains the character code value of the key pressed or released. The character code value is for English keyboard.
     * @zh 包含按下或释放的键的字符代码值。字符代码值为英文键盘值。
     */
    get charCode(): string {
        return (<KeyboardEvent>this.nativeEvent)?.code;
    }

    /**
     * @en Indicates the location of the key on the keyboard. This is useful for differentiating keys that appear more than once on the keyboard.
     * For example, you can use this property to distinguish between the left and right Shift keys: the value of KeyLocation.LEFT for the left Shift key and the value of KeyLocation.RIGHT for the right Shift key. Another example is distinguishing between a key pressed on the standard keyboard (KeyLocation.STANDARD) and the same key pressed on the numeric keypad (KeyLocation.NUM_PAD).
     * @zh 表示键在键盘上的位置。这对于区分在键盘上多次出现的键非常有用。
     * 例如，您可以根据此属性的值来区分左 Shift 键和右 Shift 键：左 Shift 键的值为 KeyLocation.LEFT，右 Shift 键的值为 KeyLocation.RIGHT。另一个示例是区分标准键盘 (KeyLocation.STANDARD) 与数字键盘 (KeyLocation.NUM_PAD) 上按下的数字键。
     */
    get keyLocation(): number {
        if (this.nativeEvent)
            return (<KeyboardEvent>this.nativeEvent).location || (<any>this.nativeEvent).keyLocation;
        else
            return 0;
    }

    /**
     * @en The X axis coordinate of the mouse on the Stage.
     * @zh 鼠标在 Stage 上的 X 轴坐标。
     */
    get stageX(): number {
        return this.touchPos.x;
    }

    /**
     * @en The Y axis coordinate of the mouse on the Stage.
     * @zh 鼠标在 Stage 上的 Y 轴坐标。
     */
    get stageY(): number {
        return this.touchPos.y;
    }
}

const MOUSE_EVENTS = new Set<string>([
    Event.MOUSE_DOWN, Event.MOUSE_UP, Event.MOUSE_MOVE, Event.CLICK, Event.DOUBLE_CLICK,
    Event.RIGHT_CLICK, Event.RIGHT_MOUSE_DOWN, Event.RIGHT_MOUSE_UP,
    Event.MOUSE_OVER, Event.MOUSE_OUT, Event.MOUSE_WHEEL, Event.MOUSE_DRAG, Event.MOUSE_DRAG_END
]);