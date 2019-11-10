package laya.net {
	import laya.events.EventDispatcher;

	/**
	 * 连接建立成功后调度。
	 * @eventType Event.OPEN
	 */

	/**
	 * 接收到数据后调度。
	 * @eventType Event.MESSAGE
	 */

	/**
	 * 连接被关闭后调度。
	 * @eventType Event.CLOSE
	 */

	/**
	 * 出现异常后调度。
	 * @eventType Event.ERROR
	 */

	/**
	 * <p> <code>Socket</code> 封装了 HTML5 WebSocket ，允许服务器端与客户端进行全双工（full-duplex）的实时通信，并且允许跨域通信。在建立连接后，服务器和 Browser/Client Agent 都能主动的向对方发送或接收文本和二进制数据。</p>
	 * <p>要使用 <code>Socket</code> 类的方法，请先使用构造函数 <code>new Socket</code> 创建一个 <code>Socket</code> 对象。 <code>Socket</code> 以异步方式传输和接收数据。</p>
	 */
	public class Socket extends EventDispatcher {

		/**
		 * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。</p>
		 * <p> LITTLE_ENDIAN ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
		 * <p> BIG_ENDIAN ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。</p>
		 */
		public static var LITTLE_ENDIAN:String;

		/**
		 * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。</p>
		 * <p> BIG_ENDIAN ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。</p>
		 * <p> LITTLE_ENDIAN ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
		 */
		public static var BIG_ENDIAN:String;

		/**
		 * @private 
		 */
		protected var _socket:*;

		/**
		 * @private 
		 */
		private var _connected:*;

		/**
		 * @private 
		 */
		private var _addInputPosition:*;

		/**
		 * @private 
		 */
		private var _input:*;

		/**
		 * @private 
		 */
		private var _output:*;

		/**
		 * 不再缓存服务端发来的数据，如果传输的数据为字符串格式，建议设置为true，减少二进制转换消耗。
		 */
		public var disableInput:Boolean;

		/**
		 * 用来发送和接收数据的 <code>Byte</code> 类。
		 */
		private var _byteClass:*;

		/**
		 * <p>子协议名称。子协议名称字符串，或由多个子协议名称字符串构成的数组。必须在调用 connect 或者 connectByUrl 之前进行赋值，否则无效。</p>
		 * <p>指定后，只有当服务器选择了其中的某个子协议，连接才能建立成功，否则建立失败，派发 Event.ERROR 事件。</p>
		 * @see https://html.spec.whatwg.org/multipage/comms.html#dom-websocket
		 */
		public var protocols:*;

		/**
		 * 缓存的服务端发来的数据。
		 */
		public function get input():*{
				return null;
		}

		/**
		 * 表示需要发送至服务端的缓冲区中的数据。
		 */
		public function get output():*{
				return null;
		}

		/**
		 * 表示此 Socket 对象目前是否已连接。
		 */
		public function get connected():Boolean{
				return null;
		}

		/**
		 * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。</p>
		 * <p> LITTLE_ENDIAN ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
		 * <p> BIG_ENDIAN ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。</p>
		 */
		public var endian:String;

		/**
		 * <p>创建新的 Socket 对象。默认字节序为 Socket.BIG_ENDIAN 。若未指定参数，将创建一个最初处于断开状态的套接字。若指定了有效参数，则尝试连接到指定的主机和端口。</p>
		 * @param host 服务器地址。
		 * @param port 服务器端口。
		 * @param byteClass 用于接收和发送数据的 Byte 类。如果为 null ，则使用 Byte 类，也可传入 Byte 类的子类。
		 * @param protocols 子协议名称。子协议名称字符串，或由多个子协议名称字符串构成的数组
		 * @see laya.utils.Byte
		 */

		public function Socket(host:String = undefined,port:Number = undefined,byteClass:Class = undefined,protocols:Array = undefined){}

		/**
		 * <p>连接到指定的主机和端口。</p>
		 * <p>连接成功派发 Event.OPEN 事件；连接失败派发 Event.ERROR 事件；连接被关闭派发 Event.CLOSE 事件；接收到数据派发 Event.MESSAGE 事件； 除了 Event.MESSAGE 事件参数为数据内容，其他事件参数都是原生的 HTML DOM Event 对象。</p>
		 * @param host 服务器地址。
		 * @param port 服务器端口。
		 */
		public function connect(host:String,port:Number):void{}

		/**
		 * <p>连接到指定的服务端 WebSocket URL。 URL 类似 ws://yourdomain:port。</p>
		 * <p>连接成功派发 Event.OPEN 事件；连接失败派发 Event.ERROR 事件；连接被关闭派发 Event.CLOSE 事件；接收到数据派发 Event.MESSAGE 事件； 除了 Event.MESSAGE 事件参数为数据内容，其他事件参数都是原生的 HTML DOM Event 对象。</p>
		 * @param url 要连接的服务端 WebSocket URL。 URL 类似 ws://yourdomain:port。
		 */
		public function connectByUrl(url:String):void{}

		/**
		 * 清理Socket：关闭Socket链接，关闭事件监听，重置Socket
		 */
		public function cleanSocket():void{}

		/**
		 * 关闭连接。
		 */
		public function close():void{}

		/**
		 * @private 连接建立成功 。
		 */
		protected function _onOpen(e:*):void{}

		/**
		 * @private 接收到数据处理方法。
		 * @param msg 数据。
		 */
		protected function _onMessage(msg:*):void{}

		/**
		 * @private 连接被关闭处理方法。
		 */
		protected function _onClose(e:*):void{}

		/**
		 * @private 出现异常处理方法。
		 */
		protected function _onError(e:*):void{}

		/**
		 * 发送数据到服务器。
		 * @param data 需要发送的数据，可以是String或者ArrayBuffer。
		 */
		public function send(data:*):void{}

		/**
		 * 发送缓冲区中的数据到服务器。
		 */
		public function flush():void{}
	}

}
