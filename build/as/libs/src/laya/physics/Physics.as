/*[IF-FLASH]*/
package laya.physics {
	improt laya.display.Sprite;
	improt laya.events.EventDispatcher;
	public class Physics extends laya.events.EventDispatcher {
		public static var PIXEL_RATIO:Number;
		private static var _I:*;
		public var box2d:*;
		public var world:*;
		public var velocityIterations:Number;
		public var positionIterations:Number;
		private var _enabled:*;
		private var _worldRoot:*;
		public var _emptyBody:*;
		public var _eventList:Array;
		public static function get I():Physics{};

		public function Physics(){}
		public static function enable(options:* = null):void{}
		public function start(options:* = null):void{}
		private var _update:*;
		private var _sendEvent:*;
		public function _createBody(def:*):*{}
		public function _removeBody(body:*):void{}
		public function _createJoint(def:*):*{}
		public function _removeJoint(joint:*):void{}
		public function stop():void{}
		public var allowSleeping:Boolean;
		public var gravity:*;
		public function getBodyCount():Number{}
		public function getContactCount():Number{}
		public function getJointCount():Number{}
		public var worldRoot:Sprite;
	}

}
