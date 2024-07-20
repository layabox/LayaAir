import { Matrix } from "../maths/Matrix"

/**
 * @en The Byte class provides methods and properties for optimizing the reading, writing, and handling of binary data. The Byte class is suitable for advanced developers who need to access data at the byte level.
 * @zh Byte 类提供用于优化读取、写入以及处理二进制数据的方法和属性。Byte 类适用于需要在字节层访问数据的高级开发人员。
 */
export class Byte {

    /**
     * @en Host byte order, which represents the two different sequences in which a CPU can store data: little-endian and big-endian. Use getSystemEndian to obtain the byte order of the current system.
     * BIG_ENDIAN byte order: The lower address stores, the higher bits of the value, and the higher address stores the lower bits. It is sometimes referred to as network byte order.
     * LITTLE_ENDIAN byte order: The lower address stores, the lower bits of the value, and the higher address stores the higher bits.
     * @zh 主机字节序，是 CPU 存放数据的两种不同顺序：小端字节序和大端字节序。使用 getSystemEndian 获取当前系统的字节序。
     * BIG_ENDIAN：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。
     * LITTLE_ENDIAN： 小端字节序，地址低位存储值的低位，地址高位存储值的高位。
     */
    static BIG_ENDIAN: string = "bigEndian";
    /**
     * @en Host byte order, which represents the two different sequences in which a CPU can store data: little-endian and big-endian. Use getSystemEndian to obtain the byte order of the current system.
     * LITTLE_ENDIAN byte order: The lower address stores the lower bits of the value, and the higher address stores the higher bits.
     * BIG_ENDIAN byte order: The lower address stores the higher bits of the value, and the higher address stores the lower bits. It is sometimes referred to as network byte order.
     * @zh 主机字节序，是 CPU 存放数据的两种不同顺序：小端字节序和大端字节序。使用 getSystemEndian 获取当前系统的字节序。
     * LITTLE_ENDIAN ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。
     * BIG_ENDIAN：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。
     */
    static LITTLE_ENDIAN: string = "littleEndian";
    /**@private */
    private static _sysEndian: string = null;
    /**@private 是否为小端数据。*/
    protected _xd_: boolean = true;
    /**@private */
    private _allocated_: number = 8;
    /**@private 原始数据。*/
    protected _d_: any
    /**@private DataView*/
    protected _u8d_: any;
    /**@private */
    protected _pos_: number = 0;
    /**@private */
    protected _length: number = 0;

    /**
     * @en Get the byte order of the current host.
     * The host byte order refers to the two different sequences in which a CPU stores data, which includes little-endian and big-endian.
     * BIG_ENDIAN: Big-endian byte order, where the lower address stores the higher bits of the value, and the higher address stores the lower bits. It is sometimes also called network byte order.
     * LITTLE_ENDIAN: Little-endian byte order, where the lower address stores the lower bits of the value, and the higher address stores the higher bits.
     * @returns The byte order of the current system.
     * @zh 获取当前主机的字节序。
     * 主机字节序，是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。
     * BIG_ENDIAN：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。
     * LITTLE_ENDIAN：小端字节序，地址低位存储值的低位，地址高位存储值的高位。
     * @return 当前系统的字节序。
     */
    static getSystemEndian(): string {
        if (!Byte._sysEndian) {
            var buffer: any = new ArrayBuffer(2);
            new DataView(buffer).setInt16(0, 256, true);
            Byte._sysEndian = (new Int16Array(buffer))[0] === 256 ? Byte.LITTLE_ENDIAN : Byte.BIG_ENDIAN;
        }
        return Byte._sysEndian;
    }
    /**
     * @en Constructor method.
     * @param data Specifies the number of elements for initialization, or a TypedArray object or ArrayBuffer object for initialization. If null, allocate a certain amount of memory in advance. When available space is not enough, use this part of the memory first, and reallocate the required memory if it is still not enough.
     * @zh 构造方法
     * @param data 用于指定初始化的元素数目，或者用于初始化的TypedArray对象、ArrayBuffer对象。如果为 null ，则预分配一定的内存空间，当可用空间不足时，优先使用这部分内存，如果还不够，则重新分配所需内存。
     */
    constructor(data: any = null) {
        if (data) {
            this._u8d_ = new Uint8Array(data);
            this._d_ = new DataView(this._u8d_.buffer);
            this._length = this._d_.byteLength;
        } else {
            this._resizeBuffer(this._allocated_);
        }
    }

    /**
     * @en The ArrayBuffer data of this object, which contains only the valid data part.
     * @zh 此对象的 ArrayBuffer 数据，数据只包含有效数据部分。
     */
    get buffer(): ArrayBuffer {
        var rstBuffer: ArrayBuffer = this._d_.buffer;
        if (rstBuffer.byteLength === this._length) return rstBuffer;
        return rstBuffer.slice(0, this._length);
    }

    /**
     * @en The byte order of the `Byte` instance. Possible values are `BIG_ENDIAN` or `LITTLE_ENDIAN`.
     * The host byte order is one of two sequences used by the CPU to store data, which includes little-endian and big-endian byte orders.The current system's byte order can be obtained using `getSystemEndian`.
     * `BIG_ENDIAN`: Big-endian byte order, where the lower memory address stores the higher-order bits of a number, and is sometimes referred to as network byte order.
     * `LITTLE_ENDIAN`: Little-endian byte order, where the lower memory address stores the lower-order bits of a number.
     * @zh `Byte` 实例的字节序。取值为 `BIG_ENDIAN` 或 `LITTLE_ENDIAN`。
     * 主机字节序是 CPU 存放数据的两种不同顺序，包括小端字节序和大端字节序。可以通过 `getSystemEndian` 获取当前系统的字节序。
     * BIG_ENDIAN ：大端字节序，地址低位存储值的高位，地址高位存储值的低位。有时也称之为网络字节序。
     * LITTLE_ENDIAN ：小端字节序，地址低位存储值的低位，地址高位存储值的高位。
     */
    get endian(): string {
        return this._xd_ ? Byte.LITTLE_ENDIAN : Byte.BIG_ENDIAN;
    }

    set endian(value: string) {
        this._xd_ = (value === Byte.LITTLE_ENDIAN);
    }

    /**
     * @private
     * @en The length of the `Byte` object, measured in bytes.
     * When setting the length to a value greater than the current length, the byte array is right-padded with zeros. If the length is set to a value less than the current length, the byte array is truncated.
     * If the length to be set exceeds the current allocated memory space, the memory is reallocated to the larger of either the new length or twice the current allocated length, and the original data is copied to the new memory space. If the length to be set is less than the current allocated memory space, the memory is reallocated to the new length, and the original data is truncated from the beginning to fit the new length.
     * @zh `Byte` 对象的长度（以字节为单位）。
     * 如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧；如果将长度设置为小于当前长度的值，将会截断该字节数组。
     * 如果要设置的长度大于当前已分配的内存空间的字节长度，则重新分配内存空间，大小为以下两者较大者：要设置的长度、当前已分配的长度的2倍，并将原有数据拷贝到新的内存空间中；如果要设置的长度小于当前已分配的内存空间的字节长度，也会重新分配内存空间，大小为要设置的长度，并将原有数据从头截断为要设置的长度存入新的内存空间中。
     */
    set length(value: number) {
        if (this._allocated_ < value) this._resizeBuffer(this._allocated_ = Math.floor(Math.max(value, this._allocated_ * 2)));
        else if (this._allocated_ > value) this._resizeBuffer(this._allocated_ = value);
        this._length = value;
    }

    get length(): number {
        return this._length;
    }

    /**@private */
    private _resizeBuffer(len: number): void {
        try {
            var newByteView: any = new Uint8Array(len);
            if (this._u8d_ != null) {
                if (this._u8d_.length <= len) newByteView.set(this._u8d_);
                else newByteView.set(this._u8d_.subarray(0, len));
            }
            this._u8d_ = newByteView;
            this._d_ = new DataView(newByteView.buffer);
        } catch (err) {
            throw "Invalid typed array length:" + len;
        }
    }

    /**
     * @private
     * @en Commonly used to parse a byte stream in a fixed format.
     * First, read a `Uint16` value from the current byte offset of the byte stream, and then read a string of this length.
     * @returns The read string.
     * @zh 常用于解析固定格式的字节流。
     * 先从字节流的当前字节偏移位置处读取一个 `Uint16` 值，然后以此值为长度，读取此长度的字符串。
     * @return 读取的字符串。
     */
    getString(): string {
        return this.readString();
    }

    /**
     * @en Commonly used to parse a byte stream in a fixed format.
     * First, read a `Uint16` value from the current byte offset of the byte stream, and then read a string of this length.
     * @returns The read string.
     * @zh 常用于解析固定格式的字节流。
     * 先从字节流的当前字节偏移位置处读取一个 `Uint16` 值，然后以此值为长度，读取此长度的字符串。
     * @return 读取的字符串
     */
    readString(): string {
        return this._rUTF(this.getUint16());
    }

    /**
     * @private
     * @en Reads a number of bytes specified by the `len` parameter from the byte stream starting at the position indicated by the `start` parameter, and creates a `Float32Array` object from the data.
     * Note: The returned `Float32Array` object is a native HTML5 `Float32Array` object in the JavaScript environment. Reading operations on this object are based on the current host byte order of the machine running the program. This order may differ from the actual byte order of the data. If you use this object for reading, you need to be aware of the actual data's byte order and the current host byte order. If they are the same, you can read normally; otherwise, you need to wrap the actual data (`Float32Array.buffer`) with a `DataView` object to read according to the specified byte order.
     * @param start The starting position.
     * @param len The number of bytes to read. If the length to be read exceeds the readable range, only the values within the readable range are returned.
     * @returns The read `Float32Array` object.
     * @zh 从字节流中 `start` 参数指定的位置开始，读取 `len` 参数指定的字节数的数据，用于创建一个 `Float32Array` 对象并返回此对象。
     * 注意：返回的 Float32Array 对象，在 JavaScript 环境下，是原生的 HTML5 Float32Array 对象，对此对象的读取操作都是基于运行此程序的当前主机字节序，此顺序可能与实际数据的字节序不同，如果使用此对象进行读取，需要用户知晓实际数据的字节序和当前主机字节序，如果相同，可正常读取，否则需要用户对实际数据(Float32Array.buffer)包装一层 DataView ，使用 DataView 对象可按照指定的字节序进行读取。
     * @param	start	开始位置。
     * @param	len		需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
     * @return  读取的 Float32Array 对象。
     */
    getFloat32Array(start: number, len: number): any {
        return this.readFloat32Array(start, len);
    }

    /**
     * @en Reads a number of bytes specified by the `len` parameter from the byte stream starting at the position indicated by the `start` parameter, and creates a `Float32Array` object from the data.
     * @param start The starting position.
     * @param len The number of bytes to read. If the length to be read exceeds the readable range, only the values within the readable range are returned.
     * @returns The read `Float32Array` object.
     * @zh 从字节流中 `start` 参数指定的位置开始，读取 `len` 参数指定的字节数的数据，用于创建一个 `Float32Array` 对象并返回此对象。
     * @param	start	开始位置。
     * @param	len		需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
     * @return  读取的 Float32Array 对象。
     */
    readFloat32Array(start: number, len: number): any {
        var end: number = start + len;
        end = (end > this._length) ? this._length : end;
        var v: any = new Float32Array(this._d_.buffer.slice(start, end));
        this._pos_ = end;
        return v;
    }

    /**
     * @private
     * @en Reads a number of bytes specified by the `len` parameter from the byte stream starting at the position indicated by the `start` parameter, and creates a `Uint8Array` object from the data.
     * @param start The starting position.
     * @param len The number of bytes to read. If the length to be read exceeds the readable range, only the values within the readable range are returned.
     * @returns The read `Uint8Array` object.
     * @zh 从字节流中 `start` 参数指定的位置开始，读取 `len` 参数指定的字节数的数据，用于创建一个 `Uint8Array` 对象并返回此对象。
     * @param	start	开始位置。
     * @param	len		需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
     * @return  读取的 Uint8Array 对象。
     */
    getUint8Array(start: number, len: number): Uint8Array {
        return this.readUint8Array(start, len);
    }

    /**
     * @en Reads a number of bytes specified by the `len` parameter from the byte stream starting at the position indicated by the `start` parameter, and creates a `Uint8Array` object from the data.
     * @param start The starting position.
     * @param len The number of bytes to read. If the length to be read exceeds the readable range, only the values within the readable range are returned.
     * @returns The read `Uint8Array` object.
     * @zh 从字节流中 `start` 参数指定的位置开始，读取 `len` 参数指定的字节数的数据，用于创建一个 `Uint8Array` 对象并返回此对象。
     * @param	start	开始位置。
     * @param	len		需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
     * @return  读取的 Uint8Array 对象。
     */
    readUint8Array(start: number, len: number): Uint8Array {
        var end: number = start + len;
        end = (end > this._length) ? this._length : end;
        var v: any = new Uint8Array(this._d_.buffer.slice(start, end));
        this._pos_ = end;
        return v;
    }

    /**
     * @private
     * @en Reads a number of bytes specified by the `len` parameter from the byte stream starting at the position indicated by the `start` parameter, and creates an `Int16Array` object from the data.
     * Note: The returned `Int16Array` object is a native HTML5 `Int16Array` object in the JavaScript environment. Reading operations on this object are based on the current host byte order. This order may differ from the actual byte order of the data. If you use this object for reading, you must be aware of the actual data's byte order and the current host byte order. If they match, you can read normally; otherwise, you need to wrap the actual data (`Int16Array.buffer`) with a `DataView` object to read according to the specified byte order.
     * @param start The byte offset from the start of the stream to begin reading.
     * @param len The number of bytes to read. Only values within the readable range are returned if the length exceeds the range.
     * @returns The created `Int16Array` object.
     * @zh 从字节流中 `start` 参数指定的位置开始，读取 `len` 参数指定的字节数的数据，用于创建一个 `Int16Array` 对象并返回此对象。
     * 注意：返回的 `Int16Array` 对象是 JavaScript 环境下原生的 HTML5 `Int16Array` 对象，对此对象的读取操作都是基于运行此程序的当前主机字节序。此顺序可能与实际数据的字节序不同，如果使用此对象进行读取，需要用户知晓实际数据的字节序和当前主机字节序，如果相同，可正常读取，否则需要用户对实际数据 (`Int16Array.buffer`) 包装一层 `DataView` 对象，使用 `DataView` 对象可按照指定的字节序进行读取。
     * @param	start	开始读取的字节偏移量位置。
     * @param	len		需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
     * @return  读取的 Int16Array 对象。
     */
    getInt16Array(start: number, len: number): any {
        return this.readInt16Array(start, len);
    }

    /**
     * @en Reads a number of bytes specified by the `len` parameter from the byte stream starting at the position indicated by the `start` parameter, and creates an `Int16Array` object from the data.
     * @param start The byte offset from the start of the stream to begin reading.
     * @param len The number of bytes to read. Only values within the readable range are returned if the length exceeds the range.
     * @returns The created `Int16Array` object.
     * @zh 从字节流中 `start` 参数指定的位置开始，读取 `len` 参数指定的字节数的数据，用于创建一个 `Int16Array` 对象并返回此对象。
     * @param	start	开始读取的字节偏移量位置。
     * @param	len		需要读取的字节长度。如果要读取的长度超过可读取范围，则只返回可读范围内的值。
     * @return  读取的 Uint8Array 对象。
     */
    readInt16Array(start: number, len: number): any {
        var end: number = start + len;
        end = (end > this._length) ? this._length : end;
        var v: any = new Int16Array(this._d_.buffer.slice(start, end));
        this._pos_ = end;
        return v;
    }

    /**
     * @private
     * @en Reads a 32-bit floating-point number from the current position in the byte stream using IEEE 754 format.
     * @returns The 32-bit floating-point number.
     * @zh 从字节流的当前字节偏移位置处读取一个 IEEE 754 单精度（32 位）浮点数。
     * @return 单精度（32 位）浮点数。
     */
    getFloat32(): number {
        return this.readFloat32();
    }

    /**
     * @en Reads a 32-bit floating-point number from the current position in the byte stream using IEEE 754 format.
     * @returns The 32-bit floating-point number.
     * @zh 从字节流的当前字节偏移位置处读取一个 IEEE 754 单精度（32 位）浮点数。
     * @return 单精度（32 位）浮点数。
     */
    readFloat32(): number {
        if (this._pos_ + 4 > this._length) throw "getFloat32 error - Out of bounds";
        var v: number = this._d_.getFloat32(this._pos_, this._xd_);
        this._pos_ += 4;
        return v;
    }

    /**
     * @private
     * @en Reads a 64-bit floating-point number from the current position in the byte stream using IEEE 754 format.
     * @returns The 64-bit floating-point number.
     * @zh 从字节流的当前字节偏移量位置处读取一个 IEEE 754 双精度（64 位）浮点数。
     * @return 双精度（64 位）浮点数。
     */
    getFloat64(): number {
        return this.readFloat64();
    }

    /**
     * @en Reads a 64-bit floating-point number from the current position in the byte stream using IEEE 754 format.
     * @returns The 64-bit floating-point number.
     * @zh 从字节流的当前字节偏移量位置处读取一个 IEEE 754 双精度（64 位）浮点数。
     * @return 双精度（64 位）浮点数。
     */
    readFloat64(): number {
        if (this._pos_ + 8 > this._length) throw "getFloat64 error - Out of bounds";
        var v: number = this._d_.getFloat64(this._pos_, this._xd_);
        this._pos_ += 8;
        return v;
    }

    /**
     * @en Writes an IEEE 754 single-precision (32-bit) floating point number to the byte stream at the current position.
     * @param value The single-precision (32-bit) floating point number to be written.
     * @zh 在字节流的当前字节偏移量位置处写入一个 IEEE 754 单精度（32 位）浮点数。
     * @param value 需要写入的单精度（32 位）浮点数。
     */
    writeFloat32(value: number): void {
        this._ensureWrite(this._pos_ + 4);
        this._d_.setFloat32(this._pos_, value, this._xd_);
        this._pos_ += 4;
    }

    /**
     * @en Writes an IEEE 754 double-precision (64-bit) floating point number to the byte stream at the current position.
     * @param value  The double-precision (64-bit) floating point number to be written.
     * @zh 在字节流的当前字节偏移量位置处写入一个 IEEE 754 双精度（64 位）浮点数。
     * @param value  需要写入的双精度（64 位）浮点数。
     */
    writeFloat64(value: number): void {
        this._ensureWrite(this._pos_ + 8);
        this._d_.setFloat64(this._pos_, value, this._xd_);
        this._pos_ += 8;
    }

    /**
     * @private
     * @en Reads an Int32 value from the current position in the byte stream.
     * @returns The Int32 value that was read.
     * @zh 从字节流的当前字节偏移量位置处读取一个 Int32 值。
     * @returns  读取的 Int32 值。
     */
    getInt32(): number {
        return this.readInt32();
    }

    /**
     * @en Reads an Int32 value from the current position in the byte stream.
     * @returns The Int32 value that was read.
     * @zh 从字节流的当前字节偏移量位置处读取一个 Int32 值。
     * @returns 读取的 Int32 值。
     */
    readInt32(): number {
        if (this._pos_ + 4 > this._length) throw "getInt32 error - Out of bounds";
        var float: number = this._d_.getInt32(this._pos_, this._xd_);
        this._pos_ += 4;
        return float;
    }

    /**
     * @private
     * @en Reads a Uint32 value from the current position in the byte stream.
     * @returns The Uint32 value that was read.
     * @zh 从字节流的当前字节偏移量位置处读取一个 Uint32 值。
     * @returns 读取的 Uint32 值。
     */
    getUint32(): number {
        return this.readUint32();
    }

    /**
     * @en Reads a Uint32 value from the current position in the byte stream.
     * @returns The Uint32 value that was read.
     * @zh 从字节流的当前字节偏移量位置处读取一个 Uint32 值。
     * @returns 读取的 Uint32 值。
     */
    readUint32(): number {
        if (this._pos_ + 4 > this._length) throw "getUint32 error - Out of bounds";
        var v: number = this._d_.getUint32(this._pos_, this._xd_);
        this._pos_ += 4;
        return v;
    }

    /**
     * @en Writes the specified Int32 value to the byte stream at the current position.
     * @param value The Int32 value to be written.
     * @zh 在字节流的当前字节偏移量位置处写入指定的 Int32 值。
     * @param value 需要写入的 Int32 值。
     */
    writeInt32(value: number): void {
        this._ensureWrite(this._pos_ + 4);
        this._d_.setInt32(this._pos_, value, this._xd_);
        this._pos_ += 4;
    }

    /**
     * @en Writes the specified Uint32 value to the byte stream at the current position.
     * @param value The Uint32 value to be written.
     * @zh 在字节流的当前字节偏移量位置处写入 Uint32 值。
     * @param value 需要写入的 Uint32 值。
     */
    writeUint32(value: number): void {
        this._ensureWrite(this._pos_ + 4);
        this._d_.setUint32(this._pos_, value, this._xd_);
        this._pos_ += 4;
    }

    /**
     * @private
     * @en Reads an Int16 value from the current byte offset in the byte stream.
     * @returns The Int16 value that was read.
     * @zh 从字节流的当前字节偏移量位置处读取一个 Int16 值。
     * @returns 读取的 Int16 值。
     */
    getInt16(): number {
        return this.readInt16();
    }

    /**
     * @en Reads an Int16 value from the current byte offset in the byte stream.
     * @returns The Int16 value that was read.
     * @zh 从字节流的当前字节偏移量位置处读取一个 Int16 值。
     * @returns 读取的 Int16 值。
     */
    readInt16(): number {
        if (this._pos_ + 2 > this._length) throw "getInt16 error - Out of bounds";
        var us: number = this._d_.getInt16(this._pos_, this._xd_);
        this._pos_ += 2;
        return us;
    }

    /**
     * @private
     * @en Reads a Uint16 value from the current byte offset in the byte stream.
     * @returns The Uint16 value that was read.
     * @zh 从字节流的当前字节偏移量位置处读取一个 Uint16 值。
     * @returns 读取的 Uint16 值。
     */
    getUint16(): number {
        return this.readUint16();
    }

    /**
     * @en Reads a Uint16 value from the current byte offset in the byte stream.
     * @returns The Uint16 value that was read.
     * @zh 从字节流的当前字节偏移量位置处读取一个 Uint16 值。
     * @returns 读取的 Uint16 值。
     */
    readUint16(): number {
        if (this._pos_ + 2 > this._length) throw "getUint16 error - Out of bounds";
        var us: number = this._d_.getUint16(this._pos_, this._xd_);
        this._pos_ += 2;
        return us;
    }

    /**
     * @en Writes the specified Uint16 value to the byte stream at the current byte offset.
     * @param value The Uint16 value to be written.
     * @zh 在字节流的当前字节偏移量位置处写入指定的 Uint16 值。
     * @param value 需要写入的 Uint16 值。
     */
    writeUint16(value: number): void {
        this._ensureWrite(this._pos_ + 2);
        this._d_.setUint16(this._pos_, value, this._xd_);
        this._pos_ += 2;
    }

    /**
     * @en Writes the specified Int16 value to the byte stream at the current byte offset.
     * @param value The Int16 value to be written.
     * @zh 在字节流的当前字节偏移量位置处写入指定的 Int16 值。
     * @param value 需要写入的 Int16 值。
     */
    writeInt16(value: number): void {
        this._ensureWrite(this._pos_ + 2);
        this._d_.setInt16(this._pos_, value, this._xd_);
        this._pos_ += 2;
    }

    /**
     * @private
     * @en Reads a Uint8 value from the current byte offset in the byte stream.
     * @returns The Uint8 value that was read.
     * @zh 从字节流的当前字节偏移量位置处读取一个 Uint8 值。
     * @returns 读取的 Uint8 值。
     */
    getUint8(): number {
        return this.readUint8();
    }

    /**
     * @en Reads a Uint8 value from the current byte offset in the byte stream.
     * @returns The Uint8 value that was read.
     * @zh 从字节流的当前字节偏移量位置处读取一个 Uint8 值。
     * @returns 读取的 Uint8 值。
     */
    readUint8(): number {
        if (this._pos_ + 1 > this._length) throw "getUint8 error - Out of bounds";
        return this._u8d_[this._pos_++];
    }

    /**
     * @en Writes the specified Uint8 value to the byte stream at the current byte offset.
     * @param value The Uint8 value to be written.
     * @zh 在字节流的当前字节偏移量位置处写入指定的 Uint8 值。
     * @param value 需要写入的 Uint8 值。
     */
    writeUint8(value: number): void {
        this._ensureWrite(this._pos_ + 1);
        this._d_.setUint8(this._pos_, value);
        this._pos_++;
    }

    /**
     * @internal
     * @en Reads a Uint8 value from the specified byte offset in the byte stream.
     * @param pos The byte offset to read from.
     * @returns The Uint8 value that was read.
     * @zh 从字节流的指定字节偏移量位置处读取一个 Uint8 值。
     * @param pos 字节读取位置。
     * @returns 读取的 Uint8 值。
     */
    //TODO:coverage
    _getUInt8(pos: number): number {
        return this._readUInt8(pos);
    }

    /**
     * @internal
     * @en Reads a Uint8 value from the specified byte offset in the byte stream.
     * @param pos The byte offset to read from.
     * @returns The Uint8 value that was read.
     * @zh 从字节流的指定字节偏移量位置处读取一个 Uint8 值。
     * @param pos 字节读取位置。
     * @returns 读取的 Uint8 值。
     */
    //TODO:coverage
    _readUInt8(pos: number): number {
        return this._d_.getUint8(pos);
    }

    /**
     * @internal
     * @en Reads a Uint16 value from the specified byte offset in the byte stream.
     * @param pos The byte offset to read from.
     * @returns The Uint16 value that was read.
     * @zh 从字节流的指定字节偏移量位置处读取一个 Uint16 值。
     * @param pos 字节读取位置。
     * @returns 读取的 Uint16 值。
     */
    //TODO:coverage
    _getUint16(pos: number): number {
        return this._readUint16(pos);
    }

    /**
     * @internal
     * @en Reads a Uint16 value from the specified byte offset in the byte stream.
     * @param pos The byte offset to read from.
     * @returns The Uint16 value that was read, taking into account the endianness.
     * @zh 从字节流的指定字节偏移量位置处读取一个 Uint16 值，考虑字节序。
     * @param pos 字节读取位置。
     * @returns 读取的 Uint16 值。
     */
    //TODO:coverage
    _readUint16(pos: number): number {
        return this._d_.getUint16(pos, this._xd_);
    }

    /**
     * @internal
     * @en Reads six values using getFloat32() and returns a Matrix object created from those values.
     * @returns The Matrix object that was created.
     * @zh 使用 getFloat32() 读取六个值，并创建返回一个 Matrix 对象。
     * @returns 创建的 Matrix 对象。
     */
    //TODO:coverage
    _getMatrix(): Matrix {
        return this._readMatrix();
    }

    /**
     * @internal
     * @en Reads six values using getFloat32() and returns a Matrix object created from those values.
     * @returns The Matrix object that was created.
     * @zh 使用 getFloat32() 读取六个值，并创建返回一个 Matrix 对象。
     * @returns 创建的 Matrix 对象。
     */
    //TODO:coverage
    _readMatrix(): Matrix {
        var rst: Matrix = new Matrix(this.getFloat32(), this.getFloat32(), this.getFloat32(), this.getFloat32(), this.getFloat32(), this.getFloat32());
        return rst;
    }

    /**
     * @private
     * 读取指定长度的 UTF 型字符串。
     * @param	len 需要读取的长度。
     * @return 读取的字符串。
     */
    private _rUTF(len: number): string {
        var v: string = "", max: number = this._pos_ + len, c: number, c2: number, c3: number, f: Function = String.fromCharCode;
        var u: any = this._u8d_, i: number = 0;
        var strs: any[] = [];
        var n: number = 0;
        strs.length = 1000;
        while (this._pos_ < max) {
            c = u[this._pos_++];
            if (c < 0x80) {
                if (c != 0)
                    //v += f(c);\
                    strs[n++] = f(c);
            } else if (c < 0xE0) {
                //v += f(((c & 0x3F) << 6) | (u[_pos_++] & 0x7F));
                strs[n++] = f(((c & 0x3F) << 6) | (u[this._pos_++] & 0x7F));
            } else if (c < 0xF0) {
                c2 = u[this._pos_++];
                //v += f(((c & 0x1F) << 12) | ((c2 & 0x7F) << 6) | (u[_pos_++] & 0x7F));
                strs[n++] = f(((c & 0x1F) << 12) | ((c2 & 0x7F) << 6) | (u[this._pos_++] & 0x7F));
            } else {
                c2 = u[this._pos_++];
                c3 = u[this._pos_++];
                //v += f(((c & 0x0F) << 18) | ((c2 & 0x7F) << 12) | ((c3 << 6) & 0x7F) | (u[_pos_++] & 0x7F));
                const _code = ((c & 0x0F) << 18) | ((c2 & 0x7F) << 12) | ((c3 & 0x7F) << 6) | (u[this._pos_++] & 0x7F);
                if (_code >= 0x10000) {
                    const _offset = _code - 0x10000;
                    const _lead = 0xd800 | (_offset >> 10);
                    const _trail = 0xdc00 | (_offset & 0x3ff);
                    strs[n++] = f(_lead);
                    strs[n++] = f(_trail);
                }
                else {
                    strs[n++] = f(_code);
                }
            }
            i++;
        }
        strs.length = n;
        return strs.join('');
        //return v;
    }

    /**
     * @private
     * @en Reads a string of the specified length.
     * @param len The length of the string to read.
     * @returns The string of the specified length.
     * @zh 读取指定长度的字符串。
     * @param len 要读取的字符串的长度。
     * @returns 指定长度的字符串。
     */
    //TODO:coverage
    getCustomString(len: number): string {
        return this.readCustomString(len);
    }

    /**
     * @private
     * @en Reads a string of the specified length.
     * @param len The length of the string to read.
     * @returns The string of the specified length.
     * @zh 读取指定长度的字符串。
     * @param len 要读取的字符串的长度。
     * @returns 指定长度的字符串。
     */
    //TODO:coverage
    readCustomString(len: number): string {
        var v: string = "", ulen: number = 0, c: number, c2: number, f: Function = String.fromCharCode;
        var u: any = this._u8d_, i: number = 0;
        while (len > 0) {
            c = u[this._pos_];
            if (c < 0x80) {
                v += f(c);
                this._pos_++;
                len--;
            } else {
                ulen = c - 0x80;
                this._pos_++;
                len -= ulen;
                while (ulen > 0) {
                    c = u[this._pos_++];
                    c2 = u[this._pos_++];
                    v += f((c2 << 8) | c);
                    ulen--;
                }
            }
        }

        return v;
    }

    /**
     * @en The current position of the Byte object's read/write pointer (in bytes).
     * When reading, the next read operation will start at this position. When writing, the next write operation will start at this position.
     * @zh Byte对象的读写指针的当前位置（以字节为单位）。
     * 下一次调用读取方法时将在此位置开始读取，或者下一次调用写入方法时将在此位置开始写入。
     */
    get pos(): number {
        return this._pos_;
    }

    set pos(value: number) {
        this._pos_ = value;
        //$MOD byteOffset是只读的，这里进行赋值没有意义。
        //_d_.byteOffset = value;
    }

    /**
     * @en The number of bytes available to read from the current position to the end of the byte stream.
     * @zh 从当前位置到字节流末尾可读取的数据的字节数。
     */
    get bytesAvailable(): number {
        return this._length - this._pos_;
    }

    /**
     * @en Clears the content of the byte array and resets the length and pos properties to 0. Calling this method will release the memory occupied by the Byte instance.
     * @zh 清除字节数组的内容，并将 length 和 pos 属性重置为 0。调用此方法将释放 Byte 实例占用的内存。
     */
    clear(): void {
        this._pos_ = 0;
        this.length = 0;
    }

    /**
     * @internal
     * @en Gets the ArrayBuffer reference of this object.
     * @zh 获取此对象的 ArrayBuffer 引用。
     */
    __getBuffer(): ArrayBuffer {
        //this._d_.buffer.byteLength = this.length;
        return this._d_.buffer;
    }

    /**
     * @en Writes a UTF-8 string to the byte stream. Similar to the writeUTF() method, but writeUTFBytes() does not prefix the string with a 16-bit length word.
     * The corresponding reading method is getUTFBytes.
     * @param value The string to write.
     * @zh 将 UTF-8 字符串写入字节流。类似于 writeUTF() 方法，但 writeUTFBytes() 不使用 16 位长度的字节为字符串添加前缀。
     * 对应的读取方法为： getUTFBytes 。
     * @param value 要写入的字符串。
     */
    writeUTFBytes(value: string): void {
        // utf8-decode
        value = value + "";
        for (var i: number = 0, sz: number = value.length; i < sz; i++) {
            var c: number = value.charCodeAt(i);

            if (c <= 0x7F) {
                this.writeByte(c);
            } else if (c <= 0x7FF) {
                //优化为直接写入多个字节，而不必重复调用writeByte，免去额外的调用和逻辑开销。
                this._ensureWrite(this._pos_ + 2);
                this._u8d_.set([0xC0 | (c >> 6), 0x80 | (c & 0x3F)], this._pos_);
                this._pos_ += 2;
            } else if (c >= 0xD800 && c <= 0xDBFF) {
                i++;
                const c2 = value.charCodeAt(i);
                if (!Number.isNaN(c2) && c2 >= 0xDC00 && c2 <= 0xDFFF) {
                    const _p1 = (c & 0x3FF) + 0x40;
                    const _p2 = c2 & 0x3FF;

                    const _b1 = 0xF0 | ((_p1 >> 8) & 0x3F);
                    const _b2 = 0x80 | ((_p1 >> 2) & 0x3F);
                    const _b3 = 0x80 | ((_p1 & 0x3) << 4) | ((_p2 >> 6) & 0xF);
                    const _b4 = 0x80 | (_p2 & 0x3F);

                    this._ensureWrite(this._pos_ + 4);
                    this._u8d_.set([_b1, _b2, _b3, _b4], this._pos_);
                    this._pos_ += 4;
                }
            } else if (c <= 0xFFFF) {
                this._ensureWrite(this._pos_ + 3);
                this._u8d_.set([0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)], this._pos_);
                this._pos_ += 3;
            } else {
                this._ensureWrite(this._pos_ + 4);
                this._u8d_.set([0xF0 | (c >> 18), 0x80 | ((c >> 12) & 0x3F), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F)], this._pos_);
                this._pos_ += 4;
            }
        }
    }

    /**
     * @en Writes a UTF-8 string to the byte stream. First, the length of the UTF-8 string in bytes is written (as a 16-bit integer), followed by the bytes representing the string characters.
     * The corresponding reading method is getUTFString.
     * @param value The string value to write.
     * @zh 将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 16 位整数），然后写入表示字符串字符的字节。
     * 对应的读取方法为： getUTFString 。
     * @param value 要写入的字符串值。
     */
    writeUTFString(value: string): void {
        var tPos: number = this.pos;
        this.writeUint16(1);
        this.writeUTFBytes(value);
        var dPos: number = this.pos - tPos - 2;
        //trace("writeLen:",dPos,"pos:",tPos);
        this._d_.setUint16(tPos, dPos, this._xd_);
    }

    /**
     * @en Writes a UTF-8 string to the byte stream. First, the length of the UTF-8 string in bytes is written (as a 32-bit integer), followed by the bytes representing the string characters.
     * @param value The string value to write.
     * @zh 将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 32 位整数），然后写入表示字符串字符的字节。
     * @param value 要写入的字符串值。
     */
    writeUTFString32(value: string): void {
        var tPos = this.pos;
        this.writeUint32(1);
        this.writeUTFBytes(value);
        var dPos = this.pos - tPos - 4;
        //trace("writeLen:",dPos,"pos:",tPos);
        this._d_.setUint32(tPos, dPos, this._xd_);
    }

    /**
     * @private
     * @en Reads a UTF-8 string.
     * @returns The read string.
     * @zh 读取 UTF-8 字符串。
     * @returns 读取的字符串。
     */
    readUTFString(): string {
        //var tPos:int = pos;
        //var len:int = getUint16();
        ////trace("readLen:"+len,"pos,",tPos);
        return this.readUTFBytes(this.getUint16());
    }

    /**
     * @private
     * @en Reads a UTF-8 string that was written with the writeUTFString32() method.
     * @zh 读取由 writeUTFString32() 方法写入的 UTF-8 字符串。
     */
    readUTFString32(): string {
        return this.readUTFBytes(this.getUint32());
    }

    /**
     * @en Reads a UTF-8 string from the byte stream, assuming the string is prefixed with an unsigned short indicating the length to read.
     * The corresponding writing method is writeUTFString.
     * @returns The read string.
     * @zh 从字节流中读取一个 UTF-8 字符串，假定字符串的前缀是一个无符号的短整型（以此字节表示要读取的长度）。
     * 对应的写入方法为：writeUTFString。
     * @returns 读取的字符串。
     */
    getUTFString(): string {
        return this.readUTFString();
    }

    /**
     * @private
     * @en Reads a string that must have been written with the writeUTFBytes method.
     * @param len The length of the buffer to read. If set to -1, all data in the buffer will be read.
     * @returns The read string.
     * @zh 读字符串，必须是 writeUTFBytes 方法写入的字符串。
     * @param len 要读的buffer长度，默认将读取缓冲区全部数据。
     * @returns 读取的字符串。
     */
    readUTFBytes(len: number = -1): string {
        if (len === 0) return "";
        var lastBytes: number = this.bytesAvailable;
        if (len > lastBytes) throw "readUTFBytes error - Out of bounds";
        len = len > 0 ? len : lastBytes;
        return this._rUTF(len);
    }

    /**
     * @en Reads a UTF-8 byte sequence of a specified length from the byte stream and returns a string.
     * Typically used to read strings written with the writeUTFBytes method.
     * @param len The length of the buffer to read. If set to -1, all data in the buffer will be read.
     * @returns The read string.
     * @zh 从字节流中读取一个由 length 参数指定的长度的 UTF-8 字节序列，并返回一个字符串。
     * 一般读取的是由 writeUTFBytes 方法写入的字符串。
     * @param len 要读的buffer长度，默认将读取缓冲区全部数据。
     * @returns 读取的字符串。
     */
    getUTFBytes(len: number = -1): string {
        return this.readUTFBytes(len);
    }

    /**
     * @en Writes a byte to the byte stream. Only the lower 8 bits of the parameter are used. The higher 24 bits are ignored.
     * @param value The byte to write (0-255).
     * @zh 在字节流中写入一个字节。只使用参数的低 8 位。忽略高 24 位。
     * @param value 要写入的字节（0-255）。
     */
    writeByte(value: number): void {
        this._ensureWrite(this._pos_ + 1);
        this._d_.setInt8(this._pos_, value);
        this._pos_ += 1;
    }

    /**
     * @en Reads a signed byte from the byte stream. The return value is in the range of -128 to 127.
     * @returns An integer between -128 and 127.
     * @zh 从字节流中读取带符号的字节。返回值的范围是从 -128 到 127。
     * @returns 介于 -128 和 127 之间的整数。
     */
    readByte(): number {
        if (this._pos_ + 1 > this._length) throw "readByte error - Out of bounds";
        return this._d_.getInt8(this._pos_++);
    }

    /**
     * @private
     * @en Reads a signed byte from the byte stream.
     * @zh 从字节流中读取带符号的字节。
     */
    getByte(): number {
        return this.readByte();
    }

    /**
     * @internal
     * @en Ensures that the available length of this byte stream is at least the value specified by the lengthToEnsure parameter.
     * @param lengthToEnsure The length to ensure is available in the byte stream.
     * @zh 保证该字节流的可用长度不小于 lengthToEnsure 参数指定的值。
     * @param lengthToEnsure 指定的字节流中应确保可用的最小长度。
     */
    _ensureWrite(lengthToEnsure: number): void {
        if (this._length < lengthToEnsure) this._length = lengthToEnsure;
        if (this._allocated_ < lengthToEnsure) this.length = lengthToEnsure;
    }

    /**
     * @en Writes a byte sequence from the specified arraybuffer object into the byte stream, starting at the offset and with the specified length.
     * If the length parameter is omitted, the default length of 0 is used, and the method writes the entire buffer from the offset, if the offset is also omitted, the entire buffer is written.
     * The function will throw an exception if the offset or length is less than 0.
     * @param arraybuffer The ArrayBuffer object to write from.
     * @param offset The offset index of the ArrayBuffer object (in bytes).
     * @param length The length to write from the ArrayBuffer object into the Byte object (in bytes).
     * @zh 将指定 arraybuffer 对象中的以 offset 为起始偏移量，length 为长度的字节序列写入字节流。
     * 如果省略 length 参数，则使用默认长度 0，该方法将从 offset 开始写入整个缓冲区；如果还省略了 offset 参数，则写入整个缓冲区。
     * 如果 offset 或 length 小于0，本函数将抛出异常。
     * @param arraybuffer 需要写入的 Arraybuffer 对象。
     * @param offset Arraybuffer 对象的索引的偏移量（以字节为单位）。
     * @param length 从 Arraybuffer 对象写入到 Byte 对象的长度（以字节为单位）。
     */
    writeArrayBuffer(arraybuffer: any, offset: number = 0, length: number = 0): void {
        if (offset < 0 || length < 0) throw "writeArrayBuffer error - Out of bounds";
        if (length == 0) length = arraybuffer.byteLength - offset;
        this._ensureWrite(this._pos_ + length);
        var uint8array: any = new Uint8Array(arraybuffer);
        this._u8d_.set(uint8array.subarray(offset, offset + length), this._pos_);
        this._pos_ += length;
    }

    /**
     * @en Reads an ArrayBuffer of the specified length from the byte stream.
     * @param length The length of the ArrayBuffer to read.
     * @zh 读取ArrayBuffer数据，长度由参数指定。
     * @param length 要读取的ArrayBuffer的长度。
     */
    readArrayBuffer(length: number): ArrayBuffer {
        var rst: ArrayBuffer;
        rst = this._u8d_.buffer.slice(this._pos_, this._pos_ + length);
        this._pos_ = this._pos_ + length
        return rst;
    }
}

