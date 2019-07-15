/*[IF-FLASH]*/
package laya.events {
	improt laya.display.Sprite;
	public class Event {
		public static var EMPTY:Event;
		public static var MOUSE_DOWN:String;
		public static var MOUSE_UP:String;
		public static var CLICK:String;
		public static var RIGHT_MOUSE_DOWN:String;
		public static var RIGHT_MOUSE_UP:String;
		public static var RIGHT_CLICK:String;
		public static var MOUSE_MOVE:String;
		public static var MOUSE_OVER:String;
		public static var MOUSE_OUT:String;
		public static var MOUSE_WHEEL:String;
		public static var ROLL_OVER:String;
		public static var ROLL_OUT:String;
		public static var DOUBLE_CLICK:String;
		public static var CHANGE:String;
		public static var CHANGED:String;
		public static var RESIZE:String;
		public static var ADDED:String;
		public static var REMOVED:String;
		public static var DISPLAY:String;
		public static var UNDISPLAY:String;
		public static var ERROR:String;
		public static var COMPLETE:String;
		public static var LOADED:String;
		public static var READY:String;
		public static var PROGRESS:String;
		public static var INPUT:String;
		public static var RENDER:String;
		public static var OPEN:String;
		public static var MESSAGE:String;
		public static var CLOSE:String;
		public static var KEY_DOWN:String;
		public static var KEY_PRESS:String;
		public static var KEY_UP:String;
		public static var FRAME:String;
		public static var DRAG_START:String;
		public static var DRAG_MOVE:String;
		public static var DRAG_END:String;
		public static var ENTER:String;
		public static var SELECT:String;
		public static var BLUR:String;
		public static var FOCUS:String;
		public static var VISIBILITY_CHANGE:String;
		public static var FOCUS_CHANGE:String;
		public static var PLAYED:String;
		public static var PAUSED:String;
		public static var STOPPED:String;
		public static var START:String;
		public static var END:String;
		public static var COMPONENT_ADDED:String;
		public static var COMPONENT_REMOVED:String;
		public static var RELEASED:String;
		public static var LINK:String;
		public static var LABEL:String;
		public static var FULL_SCREEN_CHANGE:String;
		public static var DEVICE_LOST:String;
		public static var TRANSFORM_CHANGED:String;
		public static var ANIMATION_CHANGED:String;
		public static var TRAIL_FILTER_CHANGE:String;
		public static var TRIGGER_ENTER:String;
		public static var TRIGGER_STAY:String;
		public static var TRIGGER_EXIT:String;
		public var type:String;
		public var nativeEvent:*;
		public var target:Sprite;
		public var currentTarget:Sprite;
		public var touchId:Number;
		public var keyCode:Number;
		public var delta:Number;
		public function setTo(type:String,currentTarget:Sprite,target:Sprite):Event{}
		public function stopPropagation():void{}
		public function get touches():Array{};
		public function get altKey():Boolean{};
		public function get ctrlKey():Boolean{};
		public function get shiftKey():Boolean{};
		public function get charCode():Boolean{};
		public function get keyLocation():Number{};
		public function get stageX():Number{};
		public function get stageY():Number{};
	}

}
