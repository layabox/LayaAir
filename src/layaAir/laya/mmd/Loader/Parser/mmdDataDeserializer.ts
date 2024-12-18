type TupleOf<T, N extends number, R extends unknown[]> =
    R["length"] extends N ? R : TupleOf<T, N, [T, ...R]>;

type Tuple<T, N extends number> = N extends N
    ? number extends N ? T[] : TupleOf<T, N, []>
    : never;

/**
 * DataView wrapper for deserializing MMD data
 */
export class MmdDataDeserializer {
    /**
     * Whether the device is little endian
     */
    public readonly isDeviceLittleEndian: boolean;

    private readonly _dataView: DataView;
    private _decoder: TextDecoder | null;
    private _offset: number;

    /**
     * Creates MMD data deserializer
     * @param arrayBuffer ArrayBuffer to deserialize
     */
    public constructor(arrayBuffer: ArrayBufferLike) {
        this.isDeviceLittleEndian = this._getIsDeviceLittleEndian();
        this._dataView = new DataView(arrayBuffer);
        this._decoder = null;
        this._offset = 0;
    }

    /**
     * Current offset in the buffer
     */
    public get offset(): number {
        return this._offset;
    }

    public set offset(value: number) {
        this._offset = value;
    }

    private _getIsDeviceLittleEndian(): boolean {
        const array = new Int16Array([256]);
        return new Int8Array(array.buffer)[1] === 1;
    }

    /**
     * Changes the byte order of the array
     * @param array Array to swap
     */
    public swap16Array(array: Int16Array | Uint16Array): void {
        for (let i = 0; i < array.length; ++i) {
            const value = array[i];
            array[i] = ((value & 0xFF) << 8) | ((value >> 8) & 0xFF);
        }
    }

    /**
     * Changes the byte order of the array
     * @param array Array to swap
     */
    public swap32Array(array: Int32Array | Uint32Array | Float32Array): void {
        for (let i = 0; i < array.length; ++i) {
            const value = array[i];
            array[i] = ((value & 0xFF) << 24) | ((value & 0xFF00) << 8) | ((value >> 8) & 0xFF00) | ((value >> 24) & 0xFF);
        }
    }

    /**
     * Read a uint8 value
     * @returns Uint8 value
     */
    public getUint8(): number {
        const value = this._dataView.getUint8(this._offset);
        this._offset += 1;
        return value;
    }

    /**
     * Read a int8 value
     * @returns Int8 value
     */
    public getInt8(): number {
        const value = this._dataView.getInt8(this._offset);
        this._offset += 1;
        return value;
    }

    /**
     * Read a uint8 array
     * @param dest Destination array
     */
    public getUint8Array(dest: Uint8Array): void {
        const source = new Uint8Array(this._dataView.buffer, this._offset, dest.byteLength);
        dest.set(source);
        this._offset += dest.byteLength;
    }

    /**
     * Read a uint16 value
     * @returns Uint16 value
     */
    public getUint16(): number {
        const value = this._dataView.getUint16(this._offset, true);
        this._offset += 2;
        return value;
    }

    /**
     * Read a uint16 array
     * @param dest Destination array
     */
    public getUint16Array(dest: Uint16Array): void {
        const source = new Uint8Array(this._dataView.buffer, this._offset, dest.byteLength);
        new Uint8Array(dest.buffer, dest.byteOffset, dest.byteLength).set(source);
        this._offset += dest.byteLength;

        if (!this.isDeviceLittleEndian) this.swap16Array(dest);
    }

    /**
     * Read a int16 value
     * @returns Int16 value
     */
    public getInt16(): number {
        const value = this._dataView.getInt16(this._offset, true);
        this._offset += 2;
        return value;
    }

    /**
     * Read a int32 value
     * @returns Int32 value
     */
    public getUint32(): number {
        const value = this._dataView.getUint32(this._offset, true);
        this._offset += 4;
        return value;
    }

    /**
     * Read a uint32 array
     * @param dest Destination array
     */
    public getUint32Array(dest: Uint32Array): void {
        const source = new Uint8Array(this._dataView.buffer, this._offset, dest.byteLength);
        new Uint8Array(dest.buffer, dest.byteOffset, dest.byteLength).set(source);
        this._offset += dest.byteLength;

        if (!this.isDeviceLittleEndian) this.swap32Array(dest);
    }

    /**
     * Read a int32 value
     * @returns Int32 value
     */
    public getInt32(): number {
        const value = this._dataView.getInt32(this._offset, true);
        this._offset += 4;
        return value;
    }

    /**
     * Read a int32 array
     * @param dest Destination array
     */
    public getInt32Array(dest: Int32Array): void {
        const source = new Uint8Array(this._dataView.buffer, this._offset, dest.byteLength);
        new Uint8Array(dest.buffer, dest.byteOffset, dest.byteLength).set(source);
        this._offset += dest.byteLength;

        if (!this.isDeviceLittleEndian) this.swap32Array(dest);
    }

    /**
     * Read a float32 value
     * @returns Float32 value
     */
    public getFloat32(): number {
        const value = this._dataView.getFloat32(this._offset, true);
        this._offset += 4;
        return value;
    }

    /**
     * Read a float32 array
     * @param dest Destination array
     */
    public getFloat32Array(dest: Float32Array): void {
        const source = new Uint8Array(this._dataView.buffer, this._offset, dest.byteLength);
        new Uint8Array(dest.buffer, dest.byteOffset, dest.byteLength).set(source);
        this._offset += dest.byteLength;

        if (!this.isDeviceLittleEndian) this.swap32Array(dest);
    }

    /**
     * Read a float32 tuple
     * @param length Tuple length
     * @returns Float32 tuple
     */
    public getFloat32Tuple<N extends number>(length: N): Tuple<number, N> {
        const result = new Array<number>(length);
        for (let i = 0; i < length; ++i) {
            result[i] = this._dataView.getFloat32(this._offset, true);
            this._offset += 4;
        }
        return result as Tuple<number, N>;
    }

    /**
     * Initializes TextDecoder with the specified encoding
     * @param encoding Encoding
     */
    public initializeTextDecoder(encoding: string): void {
        this._decoder = new TextDecoder(encoding);
    }

    /**
     * Decode the string in the encoding determined by the initializeTextDecoder method
     * @param length Length of the string in bytes
     * @param trim Whether to trim the string, usally used in Shift-JIS encoding
     * @returns Decoded string
     */
    public getDecoderString(length: number, trim: boolean): string {
        if (this._decoder === null) {
            throw new Error("TextDecoder is not initialized.");
        }

        let bytes = new Uint8Array(this._dataView.buffer, this._offset, length);
        this._offset += length;

        if (trim) {
            for (let i = 0; i < bytes.length; ++i) {
                if (bytes[i] === 0) {
                    bytes = bytes.subarray(0, i);
                    break;
                }
            }
        }

        return this._decoder.decode(bytes);
    }

    /**
     * Read a utf-8 string
     * @param length Length of the string in bytes
     * @returns Utf-8 string
     */
    public getSignatureString(length: number): string {
        const decoder = new TextDecoder("utf-8");
        const bytes = new Uint8Array(this._dataView.buffer, this._offset, length);
        this._offset += length;

        return decoder.decode(bytes);
    }

    /**
     * Calculate byte alignment for finding the offset of the next element
     * @param elementSize Element size
     * @param length Element count
     * @returns Offset of the next element
     */
    public getPaddedArrayOffset(elementSize: number, length: number): number {
        this._offset += this._offset % elementSize === 0 ? 0 : elementSize - this._offset % elementSize;
        const offset = this._offset;
        this._offset += elementSize * length;

        return offset;
    }

    /**
     * The number of bytes available
     */
    public get bytesAvailable(): number {
        return this._dataView.byteLength - this._offset;
    }
}
