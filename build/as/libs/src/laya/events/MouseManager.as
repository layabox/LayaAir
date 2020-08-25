package laya.events {
	import laya.display.Sprite;
	import laya.display.Stage;

	/**
	 * <p><code>MouseManager</code> 是鼠标、触摸交互管理器。</p>
	 * <p>鼠标事件流包括捕获阶段、目标阶段、冒泡阶段。<br/>
	 * 捕获阶段：此阶段引擎会从stage开始递归检测stage及其子对象，直到找到命中的目标对象或者未命中任何对象；<br/>
	 * 目标阶段：找到命中的目标对象；<br/>
	 * 冒泡阶段：事件离开目标对象，按节点层级向上逐层通知，直到到达舞台的过程。</p>
	 */
	public class MouseManager {

		/**
		 * MouseManager 单例引用。
		 */
		public static var instance:MouseManager;

		/**
		 * 是否开启鼠标检测，默认为true
		 */
		public static var enabled:Boolean;

		/**
		 * 是否开启多点触控
		 */
		public static var multiTouchEnabled:Boolean;

		/**
		 * canvas 上的鼠标X坐标。
		 */
		public var mouseX:Number;

		/**
		 * canvas 上的鼠标Y坐标。
		 */
		public var mouseY:Number;

		/**
		 * 是否禁用除 stage 以外的鼠标事件检测。
		 */
		public var disableMouseEvent:Boolean;

		/**
		 * 鼠标按下的时间。单位为毫秒。
		 */
		public var mouseDownTime:Number;

		/**
		 * 鼠标移动精度。
		 */
		public var mouseMoveAccuracy:Number;

		/**
		 * @private 
		 */
		private static var _isTouchRespond:*;
		private var _stage:*;

		/**
		 * @private 希望capture鼠标事件的对象。
		 */
		private var _captureSp:*;

		/**
		 * @private 现在不支持直接把绝对坐标转到本地坐标，只能一级一级做下去，因此记录一下这个链
		 */
		private var _captureChain:*;

		/**
		 * @private capture对象独占消息
		 */
		private var _captureExlusiveMode:*;

		/**
		 * @private 在发送事件的过程中，是否发送给了_captureSp
		 */
		private var _hitCaputreSp:*;
		private var _point:*;
		private var _rect:*;
		private var _target:*;
		private var _lastMoveTimer:*;
		private var _isLeftMouse:*;
		private var _prePoint:*;
		private var _touchIDs:*;
		private var _curTouchID:*;
		private var _id:*;
		private static var _isFirstTouch:*;

		/**
		 * @private 初始化。
		 */
		public function __init__(stage:Stage,canvas:*):void{}
		private var _tTouchID:*;
		private var initEvent:*;
		private var checkMouseWheel:*;
		private var onMouseMove:*;
		private var onMouseDown:*;
		private var onMouseUp:*;
		private var check:*;
		private var hitTest:*;
		private var _checkAllBaseUI:*;

		/**
		 * 处理3d界面。
		 * @param mousex 
		 * @param mousey 
		 * @param callback 
		 * @return 
		 */
		public function check3DUI(mousex:Number,mousey:Number,callback:Function):Boolean{
			return null;
		}
		public function handleExclusiveCapture(mousex:Number,mousey:Number,callback:Function):Boolean{
			return null;
		}
		public function handleCapture(mousex:Number,mousey:Number,callback:Function):Boolean{
			return null;
		}

		/**
		 * 执行事件处理。
		 */
		public function runEvent(evt:*):void{}

		/**
		 * @param sp 
		 * @param exlusive 是否是独占模式
		 */
		public function setCapture(sp:Sprite,exclusive:Boolean = null):void{}
		public function releaseCapture():void{}
	}

}
