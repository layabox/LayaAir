/*[IF-FLASH]*/
package laya.events {
	public class TouchManager {
		public static var I:TouchManager;
		private static var _oldArr:*;
		private static var _newArr:*;
		private static var _tEleArr:*;
		private var preOvers:*;
		private var preDowns:*;
		private var preRightDowns:*;
		public var enable:Boolean;
		private var _lastClickTime:*;
		private var _clearTempArrs:*;
		private var getTouchFromArr:*;
		private var removeTouchFromArr:*;
		private var createTouchO:*;
		public function onMouseDown(ele:*,touchID:Number,isLeft:Boolean = null):void{}
		private var sendEvents:*;
		private var getEles:*;
		private var checkMouseOutAndOverOfMove:*;
		public function onMouseMove(ele:*,touchID:Number):void{}
		public function getLastOvers():Array{}
		public function stageMouseOut():void{}
		public function onMouseUp(ele:*,touchID:Number,isLeft:Boolean = null):void{}
	}

}
