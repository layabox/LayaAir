package laya.device.motion {
	import laya.device.motion.AccelerationInfo;
	import laya.events.EventDispatcher;

	/**
	 * Accelerator.instance获取唯一的Accelerator引用，请勿调用构造函数。
	 * 
	 * <p>
	 * listen()的回调处理器接受四个参数：
	 * <ol>
	 * <li><b>acceleration</b>: 表示用户给予设备的加速度。</li>
	 * <li><b>accelerationIncludingGravity</b>: 设备受到的总加速度（包含重力）。</li>
	 * <li><b>rotationRate</b>: 设备的自转速率。</li>
	 * <li><b>interval</b>: 加速度获取的时间间隔（毫秒）。</li>
	 * </ol>
	 * </p>
	 * <p>
	 * <b>NOTE</b><br/>
	 * 如，rotationRate的alpha在apple和moz文档中都是z轴旋转角度，但是实测是x轴旋转角度。为了使各属性表示的值与文档所述相同，实际值与其他属性进行了对调。
	 * 其中：
	 * <ul>
	 * <li>alpha使用gamma值。</li>
	 * <li>beta使用alpha值。</li>
	 * <li>gamma使用beta。</li>
	 * </ul>
	 * 目前孰是孰非尚未可知，以此为注。
	 * </p>
	 */
	public class Accelerator extends EventDispatcher {

		/**
		 * Accelerator的唯一引用。
		 */
		private static var _instance:*;
		public static function get instance():Accelerator{
				return null;
		}
		private static var acceleration:*;
		private static var accelerationIncludingGravity:*;
		private static var rotationRate:*;

		public function Accelerator(singleton:Number = undefined){}

		/**
		 * 侦听加速器运动。
		 * @param observer 回调函数接受4个参数，见类说明。
		 * @override 
		 */
		override public function on(type:String,caller:*,listener:Function,args:Array = null):EventDispatcher{
			return null;
		}

		/**
		 * 取消侦听加速器。
		 * @param handle 侦听加速器所用处理器。
		 * @override 
		 */
		override public function off(type:String,caller:*,listener:Function,onceOnly:Boolean = null):EventDispatcher{
			return null;
		}
		private var onDeviceOrientationChange:*;
		private static var transformedAcceleration:*;

		/**
		 * 把加速度值转换为视觉上正确的加速度值。依赖于Browser.window.orientation，可能在部分低端机无效。
		 * @param acceleration 
		 * @return 
		 */
		public static function getTransformedAcceleration(acceleration:AccelerationInfo):AccelerationInfo{
			return null;
		}
	}

}
