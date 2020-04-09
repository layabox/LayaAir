package laya.display {
	import laya.display.Sprite;
	import laya.display.Node;
	import laya.maths.Matrix;
	import laya.maths.Point;
	import laya.resource.Context;

	/**
	 * stage大小经过重新调整时进行调度。
	 * @eventType Event.RESIZE
	 */

	/**
	 * 舞台获得焦点时调度。比如浏览器或者当前标签处于后台，重新切换回来时进行调度。
	 * @eventType Event.FOCUS
	 */

	/**
	 * 舞台失去焦点时调度。比如浏览器或者当前标签被切换到后台后调度。
	 * @eventType Event.BLUR
	 */

	/**
	 * 舞台焦点变化时调度，使用Laya.stage.isFocused可以获取当前舞台是否获得焦点。
	 * @eventType Event.FOCUS_CHANGE
	 */

	/**
	 * 舞台可见性发生变化时调度（比如浏览器或者当前标签被切换到后台后调度），使用Laya.stage.isVisibility可以获取当前是否处于显示状态。
	 * @eventType Event.VISIBILITY_CHANGE
	 */

	/**
	 * 浏览器全屏更改时调度，比如进入全屏或者退出全屏。
	 * @eventType Event.FULL_SCREEN_CHANGE
	 */

	/**
	 * <p> <code>Stage</code> 是舞台类，显示列表的根节点，所有显示对象都在舞台上显示。通过 Laya.stage 单例访问。</p>
	 * <p>Stage提供几种适配模式，不同的适配模式会产生不同的画布大小，画布越大，渲染压力越大，所以要选择合适的适配方案。</p>
	 * <p>Stage提供不同的帧率模式，帧率越高，渲染压力越大，越费电，合理使用帧率甚至动态更改帧率有利于改进手机耗电。</p>
	 */
	public class Stage extends Sprite {

		/**
		 * 应用保持设计宽高不变，不缩放不变形，stage的宽高等于设计宽高。
		 */
		public static var SCALE_NOSCALE:String;

		/**
		 * 应用根据屏幕大小铺满全屏，非等比缩放会变形，stage的宽高等于设计宽高。
		 */
		public static var SCALE_EXACTFIT:String;

		/**
		 * 应用显示全部内容，按照最小比率缩放，等比缩放不变形，一边可能会留空白，stage的宽高等于设计宽高。
		 */
		public static var SCALE_SHOWALL:String;

		/**
		 * 应用按照最大比率缩放显示，宽或高方向会显示一部分，等比缩放不变形，stage的宽高等于设计宽高。
		 */
		public static var SCALE_NOBORDER:String;

		/**
		 * 应用保持设计宽高不变，不缩放不变形，stage的宽高等于屏幕宽高。
		 */
		public static var SCALE_FULL:String;

		/**
		 * 应用保持设计宽度不变，高度根据屏幕比缩放，stage的宽度等于设计高度，高度根据屏幕比率大小而变化
		 */
		public static var SCALE_FIXED_WIDTH:String;

		/**
		 * 应用保持设计高度不变，宽度根据屏幕比缩放，stage的高度等于设计宽度，宽度根据屏幕比率大小而变化
		 */
		public static var SCALE_FIXED_HEIGHT:String;

		/**
		 * 应用保持设计比例不变，全屏显示全部内容(类似showall，但showall非全屏，会有黑边)，根据屏幕长宽比，自动选择使用SCALE_FIXED_WIDTH或SCALE_FIXED_HEIGHT
		 */
		public static var SCALE_FIXED_AUTO:String;

		/**
		 * 画布水平居左对齐。
		 */
		public static var ALIGN_LEFT:String;

		/**
		 * 画布水平居右对齐。
		 */
		public static var ALIGN_RIGHT:String;

		/**
		 * 画布水平居中对齐。
		 */
		public static var ALIGN_CENTER:String;

		/**
		 * 画布垂直居上对齐。
		 */
		public static var ALIGN_TOP:String;

		/**
		 * 画布垂直居中对齐。
		 */
		public static var ALIGN_MIDDLE:String;

		/**
		 * 画布垂直居下对齐。
		 */
		public static var ALIGN_BOTTOM:String;

		/**
		 * 不更改屏幕。
		 */
		public static var SCREEN_NONE:String;

		/**
		 * 自动横屏。
		 */
		public static var SCREEN_HORIZONTAL:String;

		/**
		 * 自动竖屏。
		 */
		public static var SCREEN_VERTICAL:String;

		/**
		 * 全速模式，以60的帧率运行。
		 */
		public static var FRAME_FAST:String;

		/**
		 * 慢速模式，以30的帧率运行。
		 */
		public static var FRAME_SLOW:String;

		/**
		 * 自动模式，以30的帧率运行，但鼠标活动后会自动加速到60，鼠标不动2秒后降低为30帧，以节省消耗。
		 */
		public static var FRAME_MOUSE:String;

		/**
		 * 休眠模式，以1的帧率运行
		 */
		public static var FRAME_SLEEP:String;

		/**
		 * 当前焦点对象，此对象会影响当前键盘事件的派发主体。
		 */
		public var focus:Node;

		/**
		 * @private 相对浏览器左上角的偏移，弃用，请使用_canvasTransform。
		 */
		public var offset:Point;

		/**
		 * 帧率类型，支持三种模式：fast-60帧(默认)，slow-30帧，mouse-30帧（鼠标活动后会自动加速到60，鼠标不动2秒后降低为30帧，以节省消耗），sleep-1帧。
		 */
		private var _frameRate:*;

		/**
		 * 设计宽度（初始化时设置的宽度Laya.init(width,height)）
		 */
		public var designWidth:Number;

		/**
		 * 设计高度（初始化时设置的高度Laya.init(width,height)）
		 */
		public var designHeight:Number;

		/**
		 * 画布是否发生翻转。
		 */
		public var canvasRotation:Boolean;

		/**
		 * 画布的旋转角度。
		 */
		public var canvasDegree:Number;

		/**
		 * <p>设置是否渲染，设置为false，可以停止渲染，画面会停留到最后一次渲染上，减少cpu消耗，此设置不影响时钟。</p>
		 * <p>比如非激活状态，可以设置renderingEnabled=false以节省消耗。</p>
		 */
		public var renderingEnabled:Boolean;

		/**
		 * 是否启用屏幕适配，可以适配后，在某个时候关闭屏幕适配，防止某些操作导致的屏幕意外改变
		 */
		public var screenAdaptationEnabled:Boolean;

		/**
		 * @private 
		 */
		private var _screenMode:*;

		/**
		 * @private 
		 */
		private var _scaleMode:*;

		/**
		 * @private 
		 */
		private var _alignV:*;

		/**
		 * @private 
		 */
		private var _alignH:*;

		/**
		 * @private 
		 */
		private var _bgColor:*;

		/**
		 * @private 
		 */
		private var _mouseMoveTime:*;

		/**
		 * @private 
		 */
		private var _renderCount:*;

		/**
		 * @private 
		 */
		private var _safariOffsetY:*;

		/**
		 * @private 
		 */
		private var _frameStartTime:*;

		/**
		 * @private 
		 */
		private var _previousOrientation:*;

		/**
		 * @private 
		 */
		private var _isFocused:*;

		/**
		 * @private 
		 */
		private var _isVisibility:*;

		/**
		 * @private 
		 */
		private var _globalRepaintSet:*;

		/**
		 * @private 
		 */
		private var _globalRepaintGet:*;

		/**
		 * 使用物理分辨率作为canvas大小，会改进渲染效果，但是会降低性能
		 */
		public var useRetinalCanvas:Boolean;

		/**
		 * 场景类，引擎中只有一个stage实例，此实例可以通过Laya.stage访问。
		 */

		public function Stage(){}

		/**
		 * @private 在移动端输入时，输入法弹出期间不进行画布尺寸重置。
		 */
		private var _isInputting:*;

		/**
		 * 舞台是否获得焦点。
		 */
		public function get isFocused():Boolean{
				return null;
		}

		/**
		 * 舞台是否处于可见状态(是否进入后台)。
		 */
		public function get isVisibility():Boolean{
				return null;
		}

		/**
		 * @private 
		 */
		private var _changeCanvasSize:*;

		/**
		 * @private 
		 */
		protected function _resetCanvas():void{}

		/**
		 * 设置屏幕大小，场景会根据屏幕大小进行适配。可以动态调用此方法，来更改游戏显示的大小。
		 * @param screenWidth 屏幕宽度。
		 * @param screenHeight 屏幕高度。
		 */
		public function setScreenSize(screenWidth:Number,screenHeight:Number):void{}

		/**
		 * @private 
		 */
		private var _formatData:*;

		/**
		 * <p>缩放模式。默认值为 "noscale"。</p>
		 * <p><ul>取值范围：
		 * <li>"noscale" ：不缩放；</li>
		 * <li>"exactfit" ：全屏不等比缩放；</li>
		 * <li>"showall" ：最小比例缩放；</li>
		 * <li>"noborder" ：最大比例缩放；</li>
		 * <li>"full" ：不缩放，stage的宽高等于屏幕宽高；</li>
		 * <li>"fixedwidth" ：宽度不变，高度根据屏幕比缩放；</li>
		 * <li>"fixedheight" ：高度不变，宽度根据屏幕比缩放；</li>
		 * <li>"fixedauto" ：根据宽高比，自动选择使用fixedwidth或fixedheight；</li>
		 * </ul></p>
		 */
		public var scaleMode:String;

		/**
		 * <p>水平对齐方式。默认值为"left"。</p>
		 * <p><ul>取值范围：
		 * <li>"left" ：居左对齐；</li>
		 * <li>"center" ：居中对齐；</li>
		 * <li>"right" ：居右对齐；</li>
		 * </ul></p>
		 */
		public var alignH:String;

		/**
		 * <p>垂直对齐方式。默认值为"top"。</p>
		 * <p><ul>取值范围：
		 * <li>"top" ：居顶部对齐；</li>
		 * <li>"middle" ：居中对齐；</li>
		 * <li>"bottom" ：居底部对齐；</li>
		 * </ul></p>
		 */
		public var alignV:String;

		/**
		 * 舞台的背景颜色，默认为黑色，null为透明。
		 */
		public var bgColor:String;

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function getMousePoint():Point{
			return null;
		}

		/**
		 * 当前视窗由缩放模式导致的 X 轴缩放系数。
		 */
		public function get clientScaleX():Number{
				return null;
		}

		/**
		 * 当前视窗由缩放模式导致的 Y 轴缩放系数。
		 */
		public function get clientScaleY():Number{
				return null;
		}

		/**
		 * <p>场景布局类型。</p>
		 * <p><ul>取值范围：
		 * <li>"none" ：不更改屏幕</li>
		 * <li>"horizontal" ：自动横屏</li>
		 * <li>"vertical" ：自动竖屏</li>
		 * </ul></p>
		 */
		public var screenMode:String;

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function repaint(type:Number = null):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function parentRepaint(type:Number = null):void{}

		/**
		 * @private 
		 */
		public function getFrameTm():Number{
			return null;
		}

		/**
		 * @private 
		 */
		private var _onmouseMove:*;

		/**
		 * <p>获得距当前帧开始后，过了多少时间，单位为毫秒。</p>
		 * <p>可以用来判断函数内时间消耗，通过合理控制每帧函数处理消耗时长，避免一帧做事情太多，对复杂计算分帧处理，能有效降低帧率波动。</p>
		 */
		public function getTimeFromFrameStart():Number{
			return null;
		}

		/**
		 * @private 
		 */
		public static var clear:Function;

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function render(context:Context,x:Number,y:Number):void{}
		public function renderToNative(context:Context,x:Number,y:Number):void{}
		private var _updateTimers:*;

		/**
		 * <p>是否开启全屏，用户点击后进入全屏。</p>
		 * <p>兼容性提示：部分浏览器不允许点击进入全屏，比如Iphone等。</p>
		 */
		public var fullScreenEnabled:Boolean;
		public var frameRate:String;

		/**
		 * @private 
		 */
		private var _requestFullscreen:*;

		/**
		 * @private 
		 */
		private var _fullScreenChanged:*;

		/**
		 * 退出全屏模式
		 */
		public function exitFullscreen():void{}

		/**
		 * @private 
		 */
		public function isGlobalRepaint():Boolean{
			return null;
		}

		/**
		 * @private 
		 */
		public function setGlobalRepaint():void{}

		/**
		 * @private 
		 */
		public function add3DUI(uibase:Sprite):void{}

		/**
		 * @private 
		 */
		public function remove3DUI(uibase:Sprite):Boolean{
			return null;
		}
	}

}
