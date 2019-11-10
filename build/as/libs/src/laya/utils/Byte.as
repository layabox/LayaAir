package laya.utils {

	/**
	 * <p> <code>Byte</code> 类提供用于优化读取、写入以及处理二进制数据的方法和属性。</p>
	 * <p> <code>Byte</code> 类适用于需要在字节层访问数据的高级开发人员。</p>
	 */
	public class Byte {

		/**
		 * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。通过 <code>getSystemEndian</code> 可以获取当前系统的字节序。</p>
		 * <p> <code>BIG_ENDIAN</code> ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。<br/>
		 * <code>LITTLE_ENDIAN</code> ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
		 */
		public static var BIG_ENDIAN:String;

		/**
		 * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。通过 <code>getSystemEndian</code> 可以获取当前系统的字节序。</p>
		 * <p> <code>LITTLE_ENDIAN</code> ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。<br/>
		 * <code>BIG_ENDIAN</code> ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。</p>
		 */
		public static var LITTLE_ENDIAN:String;

		/**
		 * @private 
		 */
		private static var _sysEndian:*;

		/**
		 * @private 是否为小端数据。
		 */
		protected var _xd_:Boolean;

		/**
		 * @private 
		 */
		private var _allocated_:*;

		/**
		 * @private 原始数据。
		 */
		protected var _d_:*;

		/**
		 * @private DataView
		 */
		protected var _u8d_:*;

		/**
		 * @private 
		 */
		protected var _pos_:Number;

		/**
		 * @private 
		 */
		protected var _length:Number;

		/**
		 * <p>获取当前主机的字节序。</p>
		 * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。</p>
		 * <p> <code>BIG_ENDIAN</code> ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。<br/>
		 * <code>LITTLE_ENDIAN</code> ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
		 * @return 当前系统的字节序。
		 */
		public static function getSystemEndian():String{
			return null;
		}

		/**
		 * 创建一个 <code>Byte</code> 类的实例。
		 * @param data 用于指定初始化的元素数目，或者用于初始化的TypedArray对象、ArrayBuffer对象。如果为 null ，则预分配一定的内存空间，当可用空间不足时，优先使用这部分内存，如果还不够，则重新分配所需内存。
		 */

		public function Byte(data:* = undefined){}

		/**
		 * 获取此对象的 ArrayBuffer 数据，数据只包含有效数据部分。
		 */
		public function get buffer():ArrayBuffer{
				return null;
		}

		/**
		 * <p> <code>Byte</code> 实例的字节序。取值为：<code>BIG_ENDIAN</code> 或 <code>BIG_ENDIAN</code> 。</p>
		 * <p>主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。通过 <code>getSystemEndian</code> 可以获取当前系统的字节序。</p>
		 * <p> <code>BIG_ENDIAN</code> ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。<br/>
		 *   <code>LITTLE_ENDIAN</code> ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。</p>
		 */
		public var endian:String;

		/**
		 * <p> <code>Byte</code> 对象的长度（以字节为单位）。</p>
		 * <p>如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧；如果将长度设置为小于当前长度的值，将会截断该字节数组。</p>
		 * <p>如果要设置的长度大于当前已分配的内存空间的字节长度，则重新分配内存空间，大小为以下两者较大者：要设置的长度、当前已分配的长度的2倍，并将原有数据拷贝到新的内存空间中；如果要设置的长度小于当前已分配的内存空间的字节长度，也会重新分配内存空间，大小为要设置的长度，并将原有数据从头截断为要设置的长度存入新的内存空间中。</p>
		 */
		public var length:Number;

		/**
		 * @private 
		 */
		private var _resizeBuffer:*;

		/**
		 * @private <p>常用于解析固定格式的字节流。</p><p>先从字节流的当前字节偏移位置处读取一个 <code>Uint16</code> 值，然后以此值为长度，读取此长度的字符串。</p>
		 * @return 读取的字符串。
		 */
		public function getString():String{
			return null;
		}

		/**
		 * <p>常用于解析固定格式的字节流。</p>
		 * <p>先从字节流的当前字节偏移位置处读取一个 <code>Uint16</code> 值，然后以此值为长度，读取此长度的字符串。</p>
		 * @return 读取的字符串。
		 */
		public function readString():String{
			return null;
		}

		/**
		 * @private <p>从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Float32Array</code> 对象并返回此对象。</p><p><b>注意：</b>返回的 Float32Array 对象，在 JavaScript 环境下，是原生的 HTML5 Float32Array 对象，对此对象的读取操作都是基于运行此程序的当前主机字节序，此顺序可能与实际数据的字节序不同，如果使用此对象进行读取，需要用户知晓实际数据的字节序和当前主机字节序，如果相同，可正常读取，否则需要用户对实际数据(Float32Array.buffer)包装一层 DataView ，使用 DataView 对象可按照指定的字节序进行读取。</p>
		 * @param start 开始位置。
		 * @param len 需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
		 * @return 读取的 Float32Array 对象。
		 */
		public function getFloat32Array(start:Number,len:Number):*{}

		/**
		 * 从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Float32Array</code> 对象并返回此对象。
		 * @param start 开始位置。
		 * @param len 需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
		 * @return 读取的 Float32Array 对象。
		 */
		public function readFloat32Array(start:Number,len:Number):*{}

		/**
		 * @private 从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Uint8Array</code> 对象并返回此对象。
		 * @param start 开始位置。
		 * @param len 需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
		 * @return 读取的 Uint8Array 对象。
		 */
		public function getUint8Array(start:Number,len:Number):Uint8Array{
			return null;
		}

		/**
		 * 从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Uint8Array</code> 对象并返回此对象。
		 * @param start 开始位置。
		 * @param len 需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
		 * @return 读取的 Uint8Array 对象。
		 */
		public function readUint8Array(start:Number,len:Number):Uint8Array{
			return null;
		}

		/**
		 * @private <p>从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Int16Array</code> 对象并返回此对象。</p><p><b>注意：</b>返回的 Int16Array 对象，在 JavaScript 环境下，是原生的 HTML5 Int16Array 对象，对此对象的读取操作都是基于运行此程序的当前主机字节序，此顺序可能与实际数据的字节序不同，如果使用此对象进行读取，需要用户知晓实际数据的字节序和当前主机字节序，如果相同，可正常读取，否则需要用户对实际数据(Int16Array.buffer)包装一层 DataView ，使用 DataView 对象可按照指定的字节序进行读取。</p>
		 * @param start 开始读取的字节偏移量位置。
		 * @param len 需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
		 * @return 读取的 Int16Array 对象。
		 */
		public function getInt16Array(start:Number,len:Number):*{}

		/**
		 * 从字节流中 <code>start</code> 参数指定的位置开始，读取 <code>len</code> 参数指定的字节数的数据，用于创建一个 <code>Int16Array</code> 对象并返回此对象。
		 * @param start 开始读取的字节偏移量位置。
		 * @param len 需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
		 * @return 读取的 Uint8Array 对象。
		 */
		public function readInt16Array(start:Number,len:Number):*{}

		/**
		 * @private 从字节流的当前字节偏移位置处读取一个 IEEE 754 单精度（32 位）浮点数。
		 * @return 单精度（32 位）浮点数。
		 */
		public function getFloat32():Number{
			return null;
		}

		/**
		 * 从字节流的当前字节偏移位置处读取一个 IEEE 754 单精度（32 位）浮点数。
		 * @return 单精度（32 位）浮点数。
		 */
		public function readFloat32():Number{
			return null;
		}

		/**
		 * @private 从字节流的当前字节偏移量位置处读取一个 IEEE 754 双精度（64 位）浮点数。
		 * @return 双精度（64 位）浮点数。
		 */
		public function getFloat64():Number{
			return null;
		}

		/**
		 * 从字节流的当前字节偏移量位置处读取一个 IEEE 754 双精度（64 位）浮点数。
		 * @return 双精度（64 位）浮点数。
		 */
		public function readFloat64():Number{
			return null;
		}

		/**
		 * 在字节流的当前字节偏移量位置处写入一个 IEEE 754 单精度（32 位）浮点数。
		 * @param value 单精度（32 位）浮点数。
		 */
		public function writeFloat32(value:Number):void{}

		/**
		 * 在字节流的当前字节偏移量位置处写入一个 IEEE 754 双精度（64 位）浮点数。
		 * @param value 双精度（64 位）浮点数。
		 */
		public function writeFloat64(value:Number):void{}

		/**
		 * @private 从字节流的当前字节偏移量位置处读取一个 Int32 值。
		 * @return Int32 值。
		 */
		public function getInt32():Number{
			return null;
		}

		/**
		 * 从字节流的当前字节偏移量位置处读取一个 Int32 值。
		 * @return Int32 值。
		 */
		public function readInt32():Number{
			return null;
		}

		/**
		 * @private 从字节流的当前字节偏移量位置处读取一个 Uint32 值。
		 * @return Uint32 值。
		 */
		public function getUint32():Number{
			return null;
		}

		/**
		 * 从字节流的当前字节偏移量位置处读取一个 Uint32 值。
		 * @return Uint32 值。
		 */
		public function readUint32():Number{
			return null;
		}

		/**
		 * 在字节流的当前字节偏移量位置处写入指定的 Int32 值。
		 * @param value 需要写入的 Int32 值。
		 */
		public function writeInt32(value:Number):void{}

		/**
		 * 在字节流的当前字节偏移量位置处写入 Uint32 值。
		 * @param value 需要写入的 Uint32 值。
		 */
		public function writeUint32(value:Number):void{}

		/**
		 * @private 从字节流的当前字节偏移量位置处读取一个 Int16 值。
		 * @return Int16 值。
		 */
		public function getInt16():Number{
			return null;
		}

		/**
		 * 从字节流的当前字节偏移量位置处读取一个 Int16 值。
		 * @return Int16 值。
		 */
		public function readInt16():Number{
			return null;
		}

		/**
		 * @private 从字节流的当前字节偏移量位置处读取一个 Uint16 值。
		 * @return Uint16 值。
		 */
		public function getUint16():Number{
			return null;
		}

		/**
		 * 从字节流的当前字节偏移量位置处读取一个 Uint16 值。
		 * @return Uint16 值。
		 */
		public function readUint16():Number{
			return null;
		}

		/**
		 * 在字节流的当前字节偏移量位置处写入指定的 Uint16 值。
		 * @param value 需要写入的Uint16 值。
		 */
		public function writeUint16(value:Number):void{}

		/**
		 * 在字节流的当前字节偏移量位置处写入指定的 Int16 值。
		 * @param value 需要写入的 Int16 值。
		 */
		public function writeInt16(value:Number):void{}

		/**
		 * @private 从字节流的当前字节偏移量位置处读取一个 Uint8 值。
		 * @return Uint8 值。
		 */
		public function getUint8():Number{
			return null;
		}

		/**
		 * 从字节流的当前字节偏移量位置处读取一个 Uint8 值。
		 * @return Uint8 值。
		 */
		public function readUint8():Number{
			return null;
		}

		/**
		 * 在字节流的当前字节偏移量位置处写入指定的 Uint8 值。
		 * @param value 需要写入的 Uint8 值。
		 */
		public function writeUint8(value:Number):void{}

		/**
		 * @private 读取指定长度的 UTF 型字符串。
		 * @param len 需要读取的长度。
		 * @return 读取的字符串。
		 */
		private var _rUTF:*;

		/**
		 * @private 读取 <code>len</code> 参数指定的长度的字符串。
		 * @param len 要读取的字符串的长度。
		 * @return 指定长度的字符串。
		 */
		public function getCustomString(len:Number):String{
			return null;
		}

		/**
		 * @private 读取 <code>len</code> 参数指定的长度的字符串。
		 * @param len 要读取的字符串的长度。
		 * @return 指定长度的字符串。
		 */
		public function readCustomString(len:Number):String{
			return null;
		}

		/**
		 * 移动或返回 Byte 对象的读写指针的当前位置（以字节为单位）。下一次调用读取方法时将在此位置开始读取，或者下一次调用写入方法时将在此位置开始写入。
		 */
		public var pos:Number;

		/**
		 * 可从字节流的当前位置到末尾读取的数据的字节数。
		 */
		public function get bytesAvailable():Number{
				return null;
		}

		/**
		 * 清除字节数组的内容，并将 length 和 pos 属性重置为 0。调用此方法将释放 Byte 实例占用的内存。
		 */
		public function clear():void{}

		/**
		 * <p>将 UTF-8 字符串写入字节流。类似于 writeUTF() 方法，但 writeUTFBytes() 不使用 16 位长度的字为字符串添加前缀。</p>
		 * <p>对应的读取方法为： getUTFBytes 。</p>
		 * @param value 要写入的字符串。
		 */
		public function writeUTFBytes(value:String):void{}

		/**
		 * <p>将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 16 位整数），然后写入表示字符串字符的字节。</p>
		 * <p>对应的读取方法为： getUTFString 。</p>
		 * @param value 要写入的字符串值。
		 */
		public function writeUTFString(value:String):void{}

		/**
		 * @private 读取 UTF-8 字符串。
		 * @return 读取的字符串。
		 */
		public function readUTFString():String{
			return null;
		}

		/**
		 * <p>从字节流中读取一个 UTF-8 字符串。假定字符串的前缀是一个无符号的短整型（以此字节表示要读取的长度）。</p>
		 * <p>对应的写入方法为： writeUTFString 。</p>
		 * @return 读取的字符串。
		 */
		public function getUTFString():String{
			return null;
		}

		/**
		 * @private 读字符串，必须是 writeUTFBytes 方法写入的字符串。
		 * @param len 要读的buffer长度，默认将读取缓冲区全部数据。
		 * @return 读取的字符串。
		 */
		public function readUTFBytes(len:Number = null):String{
			return null;
		}

		/**
		 * <p>从字节流中读取一个由 length 参数指定的长度的 UTF-8 字节序列，并返回一个字符串。</p>
		 * <p>一般读取的是由 writeUTFBytes 方法写入的字符串。</p>
		 * @param len 要读的buffer长度，默认将读取缓冲区全部数据。
		 * @return 读取的字符串。
		 */
		public function getUTFBytes(len:Number = null):String{
			return null;
		}

		/**
		 * <p>在字节流中写入一个字节。</p>
		 * <p>使用参数的低 8 位。忽略高 24 位。</p>
		 * @param value 
		 */
		public function writeByte(value:Number):void{}

		/**
		 * <p>从字节流中读取带符号的字节。</p>
		 * <p>返回值的范围是从 -128 到 127。</p>
		 * @return 介于 -128 和 127 之间的整数。
		 */
		public function readByte():Number{
			return null;
		}

		/**
		 * @private 从字节流中读取带符号的字节。
		 */
		public function getByte():Number{
			return null;
		}

		/**
		 * <p>将指定 arraybuffer 对象中的以 offset 为起始偏移量， length 为长度的字节序列写入字节流。</p>
		 * <p>如果省略 length 参数，则使用默认长度 0，该方法将从 offset 开始写入整个缓冲区；如果还省略了 offset 参数，则写入整个缓冲区。</p>
		 * <p>如果 offset 或 length 小于0，本函数将抛出异常。</p>
		 * @param arraybuffer 需要写入的 Arraybuffer 对象。
		 * @param offset Arraybuffer 对象的索引的偏移量（以字节为单位）
		 * @param length 从 Arraybuffer 对象写入到 Byte 对象的长度（以字节为单位）
		 */
		public function writeArrayBuffer(arraybuffer:*,offset:Number = null,length:Number = null):void{}

		/**
		 * 读取ArrayBuffer数据
		 * @param length 
		 * @return 
		 */
		public function readArrayBuffer(length:Number):ArrayBuffer{
			return null;
		}
	}

}
