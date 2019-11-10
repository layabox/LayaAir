package laya.events {
	import laya.display.Sprite;

	/**
	 * <code>Event</code> 是事件类型的集合。一般当发生事件时，<code>Event</code> 对象将作为参数传递给事件侦听器。
	 */
	public class Event {

		/**
		 * 一个空的 Event 对象。用于事件派发中转使用。
		 */
		public static var EMPTY:Event;

		/**
		 * 定义 mousedown 事件对象的 type 属性值。
		 */
		public static var MOUSE_DOWN:String;

		/**
		 * 定义 mouseup 事件对象的 type 属性值。
		 */
		public static var MOUSE_UP:String;

		/**
		 * 定义 click 事件对象的 type 属性值。
		 */
		public static var CLICK:String;

		/**
		 * 定义 rightmousedown 事件对象的 type 属性值。
		 */
		public static var RIGHT_MOUSE_DOWN:String;

		/**
		 * 定义 rightmouseup 事件对象的 type 属性值。
		 */
		public static var RIGHT_MOUSE_UP:String;

		/**
		 * 定义 rightclick 事件对象的 type 属性值。
		 */
		public static var RIGHT_CLICK:String;

		/**
		 * 定义 mousemove 事件对象的 type 属性值。
		 */
		public static var MOUSE_MOVE:String;

		/**
		 * 定义 mouseover 事件对象的 type 属性值。
		 */
		public static var MOUSE_OVER:String;

		/**
		 * 定义 mouseout 事件对象的 type 属性值。
		 */
		public static var MOUSE_OUT:String;

		/**
		 * 定义 mousewheel 事件对象的 type 属性值。
		 */
		public static var MOUSE_WHEEL:String;

		/**
		 * 定义 mouseover 事件对象的 type 属性值。
		 */
		public static var ROLL_OVER:String;

		/**
		 * 定义 mouseout 事件对象的 type 属性值。
		 */
		public static var ROLL_OUT:String;

		/**
		 * 定义 doubleclick 事件对象的 type 属性值。
		 */
		public static var DOUBLE_CLICK:String;

		/**
		 * 定义 change 事件对象的 type 属性值。
		 */
		public static var CHANGE:String;

		/**
		 * 定义 changed 事件对象的 type 属性值。
		 */
		public static var CHANGED:String;

		/**
		 * 定义 resize 事件对象的 type 属性值。
		 */
		public static var RESIZE:String;

		/**
		 * 定义 added 事件对象的 type 属性值。
		 */
		public static var ADDED:String;

		/**
		 * 定义 removed 事件对象的 type 属性值。
		 */
		public static var REMOVED:String;

		/**
		 * 定义 display 事件对象的 type 属性值。
		 */
		public static var DISPLAY:String;

		/**
		 * 定义 undisplay 事件对象的 type 属性值。
		 */
		public static var UNDISPLAY:String;

		/**
		 * 定义 error 事件对象的 type 属性值。
		 */
		public static var ERROR:String;

		/**
		 * 定义 complete 事件对象的 type 属性值。
		 */
		public static var COMPLETE:String;

		/**
		 * 定义 loaded 事件对象的 type 属性值。
		 */
		public static var LOADED:String;

		/**
		 * 定义 loaded 事件对象的 type 属性值。
		 */
		public static var READY:String;

		/**
		 * 定义 progress 事件对象的 type 属性值。
		 */
		public static var PROGRESS:String;

		/**
		 * 定义 input 事件对象的 type 属性值。
		 */
		public static var INPUT:String;

		/**
		 * 定义 render 事件对象的 type 属性值。
		 */
		public static var RENDER:String;

		/**
		 * 定义 open 事件对象的 type 属性值。
		 */
		public static var OPEN:String;

		/**
		 * 定义 message 事件对象的 type 属性值。
		 */
		public static var MESSAGE:String;

		/**
		 * 定义 close 事件对象的 type 属性值。
		 */
		public static var CLOSE:String;

		/**
		 * 定义 keydown 事件对象的 type 属性值。
		 */
		public static var KEY_DOWN:String;

		/**
		 * 定义 keypress 事件对象的 type 属性值。
		 */
		public static var KEY_PRESS:String;

		/**
		 * 定义 keyup 事件对象的 type 属性值。
		 */
		public static var KEY_UP:String;

		/**
		 * 定义 frame 事件对象的 type 属性值。
		 */
		public static var FRAME:String;

		/**
		 * 定义 dragstart 事件对象的 type 属性值。
		 */
		public static var DRAG_START:String;

		/**
		 * 定义 dragmove 事件对象的 type 属性值。
		 */
		public static var DRAG_MOVE:String;

		/**
		 * 定义 dragend 事件对象的 type 属性值。
		 */
		public static var DRAG_END:String;

		/**
		 * 定义 enter 事件对象的 type 属性值。
		 */
		public static var ENTER:String;

		/**
		 * 定义 select 事件对象的 type 属性值。
		 */
		public static var SELECT:String;

		/**
		 * 定义 blur 事件对象的 type 属性值。
		 */
		public static var BLUR:String;

		/**
		 * 定义 focus 事件对象的 type 属性值。
		 */
		public static var FOCUS:String;

		/**
		 * 定义 visibilitychange 事件对象的 type 属性值。
		 */
		public static var VISIBILITY_CHANGE:String;

		/**
		 * 定义 focuschange 事件对象的 type 属性值。
		 */
		public static var FOCUS_CHANGE:String;

		/**
		 * 定义 played 事件对象的 type 属性值。
		 */
		public static var PLAYED:String;

		/**
		 * 定义 paused 事件对象的 type 属性值。
		 */
		public static var PAUSED:String;

		/**
		 * 定义 stopped 事件对象的 type 属性值。
		 */
		public static var STOPPED:String;

		/**
		 * 定义 start 事件对象的 type 属性值。
		 */
		public static var START:String;

		/**
		 * 定义 end 事件对象的 type 属性值。
		 */
		public static var END:String;

		/**
		 * 定义 componentadded 事件对象的 type 属性值。
		 */
		public static var COMPONENT_ADDED:String;

		/**
		 * 定义 componentremoved 事件对象的 type 属性值。
		 */
		public static var COMPONENT_REMOVED:String;

		/**
		 * 定义 released 事件对象的 type 属性值。
		 */
		public static var RELEASED:String;

		/**
		 * 定义 link 事件对象的 type 属性值。
		 */
		public static var LINK:String;

		/**
		 * 定义 label 事件对象的 type 属性值。
		 */
		public static var LABEL:String;

		/**
		 * 浏览器全屏更改时触发
		 */
		public static var FULL_SCREEN_CHANGE:String;

		/**
		 * 显卡设备丢失时触发
		 */
		public static var DEVICE_LOST:String;

		/**
		 * 世界矩阵更新时触发。
		 */
		public static var TRANSFORM_CHANGED:String;

		/**
		 * 更换动作时触发。
		 */
		public static var ANIMATION_CHANGED:String;

		/**
		 * 拖尾渲染节点改变时触发。
		 */
		public static var TRAIL_FILTER_CHANGE:String;

		/**
		 * 物理碰撞开始
		 */
		public static var TRIGGER_ENTER:String;

		/**
		 * 物理碰撞持续
		 */
		public static var TRIGGER_STAY:String;

		/**
		 * 物理碰撞结束
		 */
		public static var TRIGGER_EXIT:String;

		/**
		 * 事件类型。
		 */
		public var type:String;

		/**
		 * 原生浏览器事件。
		 */
		public var nativeEvent:*;

		/**
		 * 事件目标触发对象。
		 */
		public var target:Sprite;

		/**
		 * 事件当前冒泡对象。
		 */
		public var currentTarget:Sprite;

		/**
		 * 分配给触摸点的唯一标识号（作为 int）。
		 */
		public var touchId:Number;

		/**
		 * 键盘值
		 */
		public var keyCode:Number;

		/**
		 * 滚轮滑动增量
		 */
		public var delta:Number;

		/**
		 * 设置事件数据。
		 * @param type 事件类型。
		 * @param currentTarget 事件目标触发对象。
		 * @param target 事件当前冒泡对象。
		 * @return 返回当前 Event 对象。
		 */
		public function setTo(type:String,currentTarget:Sprite,target:Sprite):Event{
			return null;
		}

		/**
		 * 阻止对事件流中当前节点的后续节点中的所有事件侦听器进行处理。此方法不会影响当前节点 (currentTarget) 中的任何事件侦听器。
		 */
		public function stopPropagation():void{}

		/**
		 * 触摸点列表。
		 */
		public function get touches():Array{
				return null;
		}

		/**
		 * 表示 Alt 键是处于活动状态 (true) 还是非活动状态 (false)。
		 */
		public function get altKey():Boolean{
				return null;
		}

		/**
		 * 表示 Ctrl 键是处于活动状态 (true) 还是非活动状态 (false)。
		 */
		public function get ctrlKey():Boolean{
				return null;
		}

		/**
		 * 表示 Shift 键是处于活动状态 (true) 还是非活动状态 (false)。
		 */
		public function get shiftKey():Boolean{
				return null;
		}

		/**
		 * 包含按下或释放的键的字符代码值。字符代码值为英文键盘值。
		 */
		public function get charCode():Boolean{
				return null;
		}

		/**
		 * 表示键在键盘上的位置。这对于区分在键盘上多次出现的键非常有用。<br>
		 * 例如，您可以根据此属性的值来区分左 Shift 键和右 Shift 键：左 Shift 键的值为 KeyLocation.LEFT，右 Shift 键的值为 KeyLocation.RIGHT。另一个示例是区分标准键盘 (KeyLocation.STANDARD) 与数字键盘 (KeyLocation.NUM_PAD) 上按下的数字键。
		 */
		public function get keyLocation():Number{
				return null;
		}

		/**
		 * 鼠标在 Stage 上的 X 轴坐标
		 */
		public function get stageX():Number{
				return null;
		}

		/**
		 * 鼠标在 Stage 上的 Y 轴坐标
		 */
		public function get stageY():Number{
				return null;
		}
	}

}
