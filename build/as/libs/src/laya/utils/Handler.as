package laya.utils {

	/**
	 * <p><code>Handler</code> 是事件处理器类。</p>
	 * <p>推荐使用 Handler.create() 方法从对象池创建，减少对象创建消耗。创建的 Handler 对象不再使用后，可以使用 Handler.recover() 将其回收到对象池，回收后不要再使用此对象，否则会导致不可预料的错误。</p>
	 * <p><b>注意：</b>由于鼠标事件也用本对象池，不正确的回收及调用，可能会影响鼠标事件的执行。</p>
	 */
	public class Handler {

		/**
		 * @private handler对象池
		 */
		protected static var _pool:Array;

		/**
		 * @private 
		 */
		private static var _gid:*;

		/**
		 * 执行域(this)。
		 */
		public var caller:Object;

		/**
		 * 处理方法。
		 */
		public var method:Function;

		/**
		 * 参数。
		 */
		public var args:Array;

		/**
		 * 表示是否只执行一次。如果为true，回调后执行recover()进行回收，回收后会被再利用，默认为false 。
		 */
		public var once:Boolean;

		/**
		 * @private 
		 */
		protected var _id:Number;

		/**
		 * 根据指定的属性值，创建一个 <code>Handler</code> 类的实例。
		 * @param caller 执行域。
		 * @param method 处理函数。
		 * @param args 函数参数。
		 * @param once 是否只执行一次。
		 */

		public function Handler(caller:Object = undefined,method:Function = undefined,args:Array = undefined,once:Boolean = undefined){}

		/**
		 * 设置此对象的指定属性值。
		 * @param caller 执行域(this)。
		 * @param method 回调方法。
		 * @param args 携带的参数。
		 * @param once 是否只执行一次，如果为true，执行后执行recover()进行回收。
		 * @return 返回 handler 本身。
		 */
		public function setTo(caller:*,method:Function,args:Array,once:Boolean = null):Handler{
			return null;
		}

		/**
		 * 执行处理器。
		 */
		public function run():*{}

		/**
		 * 执行处理器，并携带额外数据。
		 * @param data 附加的回调数据，可以是单数据或者Array(作为多参)。
		 */
		public function runWith(data:*):*{}

		/**
		 * 清理对象引用。
		 */
		public function clear():Handler{
			return null;
		}

		/**
		 * 清理并回收到 Handler 对象池内。
		 */
		public function recover():void{}

		/**
		 * 从对象池内创建一个Handler，默认会执行一次并立即回收，如果不需要自动回收，设置once参数为false。
		 * @param caller 执行域(this)。
		 * @param method 回调方法。
		 * @param args 携带的参数。
		 * @param once 是否只执行一次，如果为true，回调后执行recover()进行回收，默认为true。
		 * @return 返回创建的handler实例。
		 */
		public static function create(caller:*,method:Function,args:Array = null,once:Boolean = null):Handler{
			return null;
		}
	}

}
