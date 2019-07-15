/*[IF-FLASH]*/
package laya.utils {
	improt laya.display.Sprite;
	improt laya.maths.Rectangle;
	public class Dragging {
		public var target:Sprite;
		public var ratio:Number;
		public var maxOffset:Number;
		public var area:Rectangle;
		public var hasInertia:Boolean;
		public var elasticDistance:Number;
		public var elasticBackTime:Number;
		public var data:*;
		private var _dragging:*;
		private var _clickOnly:*;
		private var _elasticRateX:*;
		private var _elasticRateY:*;
		private var _lastX:*;
		private var _lastY:*;
		private var _offsetX:*;
		private var _offsetY:*;
		private var _offsets:*;
		private var _disableMouseEvent:*;
		private var _tween:*;
		private var _parent:*;
		public function start(target:Sprite,area:Rectangle,hasInertia:Boolean,elasticDistance:Number,elasticBackTime:Number,data:*,disableMouseEvent:Boolean,ratio:Number = null):void{}
		private var clearTimer:*;
		public function stop():void{}
		private var loop:*;
		private var checkArea:*;
		private var backToArea:*;
		private var onStageMouseUp:*;
		private var checkElastic:*;
		private var tweenMove:*;
		private var clear:*;
	}

}
