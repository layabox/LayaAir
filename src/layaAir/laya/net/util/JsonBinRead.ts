import { Browser } from "../../utils/Browser";
import { Byte } from "../../utils/Byte";
import { WordText } from "../../utils/WordText";
import { Loader } from "../Loader";
/**
 * @en JsonBinRead class provides methods for parsing and reading binary JSON-like data.
 *      It uses custom type codes and supports compression and various data structures.
 * @zh JsonBinRead 类提供了用于解析和读取二进制 JSON 数据的方法。
 *      它使用自定义的类型码，支持压缩和多种数据结构。
 */
export class JsonBinRead {
	static ISJSONBIN: number = 0xFFFFFF;
	static ISJSONBIN2: number = 0xFFFFFE;
	static ISJSONBIN3: number = 0xFFFFFD;

	/**
	 * @en The character used to split strings in the serialized data.
	 * @zh 用于在序列化数据中分割字符串的字符。
	 */
	static SPLITCHAR: string = String.fromCharCode(3);

	/**
	 * @en A constant representing a new compression type or mode.
	 * @zh 代表一种新的压缩类型或模式的常量。
	 */
	static COMPRESS_NEW: number = 1;

	/**
	 * @en A constant representing a reference-based compression type or mode.
	 * @zh 代表一种基于引用的压缩类型或模式的常量。
	 */
	static COMPRESS_REF: number = 2;

	/**
	 * @en A constant representing a modified reference-based compression type or mode.
	 * @zh 代表一种修改后的基于引用的压缩类型或模式的常量。
	 */
	static COMPRESS_REFMODIFY: number = 3;

	/**
	 * @en A type code representing an 8-bit integer value.
	 * @zh 代表一个8位整数值的类型码。
	 */
	static NUM8: number = 0;

	/**
	 * @en A type code representing a 16-bit integer value.
	 * @zh 代表一个16位整数值的类型码。
	 */
	static NUM16: number = 1;

	/**
	 * @en A type code representing a 32-bit integer value.
	 * @zh 代表一个32位整数值的类型码。
	 */
	static NUM32: number = 2;

	/**
	 * @en A type code representing a boolean value.
	 * @zh 代表一个布尔值的类型码。
	 */
	static BOOLEAN: number = 3;

	/**
	 * @en A type code representing a double-precision floating-point value.
	 * @zh 代表一个双精度浮点值的类型码。
	 */
	static DOUBLE: number = 4;

	/**
	 * @en A type code representing a string value.
	 * @zh 代表一个字符串值的类型码。
	 */
	static STRING: number = 5;

	/**
	 * @en A type code representing an 8-element array.
	 * @zh 代表一个具有8个元素的数组的类型码。
	 */
	static ARRAY8: number = 6;

	/**
	 * @en A type code representing a 16-element array.
	 * @zh 代表一个具有16个元素的数组的类型码。
	 */
	static ARRAY16: number = 7;

	/**
	 * @en A type code representing an empty array.
	 * @zh 代表一个空数组的类型码。
	 */
	static ARRAYEMPTY: number = 8;

	/**
	 * @en A type code representing an array of 8-bit integer values.
	 * @zh 代表一个由8位整数值组成的数组的类型码。
	 */
	static ARRAYNUM8: number = 9;

	/**
	 * @en A type code representing an array of 16-bit integer values.
	 * @zh 代表一个由16位整数值组成的数组的类型码。
	 */
	static ARRAYNUM16: number = 10;

	/**
	 * @en A type code representing an array of 32-bit integer values.
	 * @zh 代表一个由32位整数值组成的数组的类型码。
	 */
	static ARRAYNUM32: number = 11;

	/**
	 * @en A type code representing an array of double-precision floating-point values.
	 * @zh 代表一个由双精度浮点值组成的数组的类型码。
	 */
	static ARRAYDOUBLE: number = 12;

	/**
	 * @en A type code representing an array of strings.
	 * @zh 代表一个由字符串组成的数组的类型码。
	 */
	static ARRAYSTRING: number = 13;

	/**
	 * @en A type code representing a null value.
	 * @zh 代表一个空值的类型码。
	 */
	static NULL: number = 14;

	/**
	 * @en A type code representing an object.
	 * @zh 代表一个对象的类型码。
	 */
	static OBJECT: number = 15;

	/**
	 * @en A type code representing a 16-bit integer value multiplied by 1000.
	 * @zh 代表一个乘以1000的16位整数值的类型码。
	 */
	static NUM16_1000: number = 16;

	/**
	 * @en A type code representing a 32-bit integer value multiplied by 1000.
	 * @zh 代表一个乘以1000的32位整数值的类型码。
	 */
	static NUM32_1000: number = 17;

	/**
	 * @en A type code representing a word text value.
	 * @zh 代表一个单词文本值的类型码。
	 */
	static WORDTEXT: number = 18;

	/**
	 * @en A type code representing an array buffer.
	 * @zh 代表一个数组缓冲区的类型码。
	 */
	static ARRAYBUFFER: number = 19;

	/**
	 * @en A type code representing an array reference.
	 * @zh 代表一个数组引用的类型码。
	 */
	static ARRAYREF: number = 20;

	/**
	 * @en A type code representing a source array of 8-bit integers for reference.
	 * @zh 代表一个用于引用的8位整数源数组的类型码。
	 */
	static ARRAYREFSOURCE8: number = 21;

	/**
	 * @en A type code representing a source array of 16-bit integers for reference.
	 * @zh 代表一个用于引用的16位整数源数组的类型码。
	 */
	static ARRAYREFSOURCE16: number = 22;

	/**
	 * @en A type code representing an array buffer with 32-bit size.
	 * @zh 代表一个具有32位大小的数组缓冲区的类型码。
	 */
	static ARRAYBUFFER32: number = 23;

	/**
	 * @en A type code representing an array reference with 32-bit size.
	 * @zh 代表一个具有32位大小的数组引用的类型码。
	 */
	static ARRAYREF32: number = 24;

	/**
	 * @en A type code representing a 32-element array.
	 * @zh 代表一个具有32个元素的数组的类型码。
	 */
	static ARRAY32: number = 25;

	/**
	 * @en A type code representing an object with a specific class.
	 * @zh 代表一个具有特定类的对象的类型码。
	 */
	static OBJECTTHISCLASS: number = 26;

	/**
	 * @en A type code representing a 64-bit integer value.
	 * @zh 代表一个64位整数值的类型码。
	 */
	static NUM64: number = 27;

	/**
	 * @en A type code representing an Int8Array.
	 * @zh 代表一个Int8Array的类型码。
	 */
	static INT8ARRAY: number = 28;
	/**
	 * @en A type code representing a Uint8Array.
	 * @zh 代表一个Uint8Array的类型码。
	 */
	static UINT8ARRAY: number = 29;
	/**
	 * @en A type code representing an Int16Array.
	 * @zh 代表一个Int16Array的类型码。
	 */
	static INT16ARRAY: number = 30;
	/**
	 * @en A type code representing a Float32Array.
	 * @zh 代表一个Float32Array的类型码。
	 */
	static FLOAT32ARRAY: number = 31;
	/**
	 * @en A constant value used to mark the end of an object in the serialized data.
	 * @zh 用于在序列化数据中标记对象结束的常量值。
	 */
	static OBJECTEND: number = 0x7FFF;
	/**
	 * @en The singleton instance of the JsonBinRead class.
	 * @zh JsonBinRead类的单例实例。
	 */
	private static _instance: JsonBinRead;
	/**
	 * @en Gets the singleton instance of the JsonBinRead class. If it doesn't exist, creates a new one.
	 * @returns The singleton instance of the JsonBinRead class.
	 * @zh 获取JsonBinRead类的单例实例。如果不存在，则创建一个新的实例。
	 * @returns JsonBinRead类的单例实例。
	 */
	static get instance(): JsonBinRead {
		return JsonBinRead._instance || (JsonBinRead._instance = new JsonBinRead());
	}
	/**
	 * @en Checks if the given ArrayBuffer contains JSONBin data.
	 * @param data The ArrayBuffer to be checked.
	 * @returns True if the data is identified as JSONBin data, false otherwise.
	 * @zh 检查给定的ArrayBuffer是否包含JsonBin数据。
	 * @param data 要检查的ArrayBuffer。
	 * @returns 如果数据被识别为JsonBin数据则返回true，否则返回false。
	 */
	static IsJsonbin(data: ArrayBuffer): boolean {
		if (data.byteLength < 5)
			return false;
		const value = (new Uint32Array(data, 0, 4))[0];
		return value == JsonBinRead.ISJSONBIN || value == JsonBinRead.ISJSONBIN2 || value == JsonBinRead.ISJSONBIN3;
	}
	/**
	 * @en Parses the given ArrayBuffer as JSONBin data. If it's not in the expected JSONBin format,
	 *      tries to parse it as a regular JSON string.
	 * @param value The ArrayBuffer to be parsed.
	 * @returns The parsed data as an object. If parsing fails, returns null.
	 * @zh 将给定的ArrayBuffer解析为JsonBin数据。如果不是预期的JsonBin格式，
	 *      则尝试将其作为常规JSON字符串进行解析。
	 * @param value 要解析的ArrayBuffer。
	 * @returns 解析后的数据作为一个对象。如果解析失败，则返回null。
	 */
	static parse(value: ArrayBuffer): any {
		var int32: Int32Array = new Int32Array(value, 0, 4);
		if (int32[0] !== JsonBinRead.ISJSONBIN && int32[0] !== JsonBinRead.ISJSONBIN2) {
			var b: Byte = new Byte();
			b.writeArrayBuffer(value);
			b.pos = 0;
			var str: string = b.readUTFBytes();
			return JSON.parse(str);
		}
		var r: JsonBinRead = new JsonBinRead();
		return r.read(value);
	}
	/**
	 * @en Parses the given value (assumed to be JSONBin data) and caches the result using the Loader.
	 * @param value The value to be parsed.
	 * @returns The parsed data as an object.
	 * @zh 解析给定的值（假定为JsonBin数据）并使用Loader缓存结果。
	 * @param value 要解析的价值。
	 * @returns 解析后的数据作为一个对象。
	 */
	static parsePack(value: any): any {
		var r: JsonBinRead = new JsonBinRead();
		var o: any = r.read(value);
		for (var key in o)
			Loader.cacheRes(key, o[key]);
		return o;
	}

	/**
	 * @en An object used to store references to other objects during the reading process.
	 * @zh 在读取过程中用于存储对其他对象引用的对象。
	 */
	private _objectRef: any;

	/**
	 * @en The starting offset of the data within the buffer during the reading process.
	 * @zh 在读取过程中缓冲区中数据的起始偏移量。
	 */
	private _dataStartOfs: number;

	/**
	 * @en A function used to create an object with a specific class during the reading process.
	 * @zh 在读取过程中用于创建具有特定类的对象的函数。
	 */
	private _createObjWithClass: Function;

	/** @ignore */
	constructor() {

	}
	/**
	 * @en Reads an array from the given Byte data buffer based on the specified type and keyMap.
	 * @param data The Byte data buffer from which to read the array.
	 * @param pos The starting position in the buffer to read the array. If -1, uses the current position.
	 * @param n The number of elements in the array.
	 * @param type The type code representing the array type.
	 * @param keyMap A mapping object that keeps track of keys and their corresponding values and indices.
	 * @returns The read array as an object.
	 * @zh 根据指定的类型和键映射从给定的Byte数据缓冲区读取数组。
	 * @param data 从中读取数组的Byte数据缓冲区。
	 * @param pos 在缓冲区中读取数组的起始位置。如果为-1，则使用当前位置。
	 * @param n 数组中的元素数量。
	 * @param type 代表数组类型的类型码。
	 * @param keyMap 一个映射对象，用于跟踪键及其对应的值和索引。
	 * @returns 读取的数组作为一个对象。
	 */
	private _readArray(data: Byte, pos: number, n: number, type: number, keyMap: ReadKeyMap): any {
		var array: any[] = [];
		array.length = n;
		var endPos: number;
		if (pos >= 0) {
			endPos = data.pos;
			data.pos = pos;
		}
		for (var i: number = 0; i < n; i++) {
			array[i] = this._readOne({}, data, null, data.readUint8(), keyMap);
		}
		if (pos >= 0) {
			data.pos = endPos
		}
		return array;
	}
	/**
	 * @en Retrieves the length value from the given Byte object.
	 *      It interprets the length based on the encoding rules where a single byte might represent the length directly or two bytes need to be combined if the length is larger.
	 * @param data The Byte object from which to extract the length.
	 * @returns The length value obtained from the Byte object.
	 * @zh 从给定的Byte对象中获取长度值。
	 *      它根据编码规则解析长度，即单个字节可能直接表示长度，如果长度较大，则需要组合两个字节来获取长度值。
	 * @param data 从中提取长度的Byte对象。
	 * @returns 从Byte对象获取的长度值。
	 */
	private _getLen(data: Byte): number {
		let n = data.readUint8();
		return (n & 0x80) == 0 ? n : (data.readUint8() | ((n & ~0x80) << 8));
	}
	/**
	 * @en Combines two numbers into a single large number representation.
	 *      It first converts the second number to a hexadecimal string, pads it to a specific length if needed,
	 *      and then concatenates it with the hexadecimal string of the first number to form the large number.
	 * @param n1 The first number.
	 * @param n2 The second number.
	 * @returns The combined large number.
	 * @zh 将两个数字组合成一个大数字表示形式。
	 *      它首先将第二个数字转换为十六进制字符串，如有需要将其填充到特定长度，
	 *      然后将其与第一个数字的十六进制字符串连接起来以形成大数字。
	 * @param n1 第一个数字。
	 * @param n2 第二个数字。
	 * @returns 组合后的大数字。
	 */
	static _toLargeNumber(n1: number, n2: number): number {
		let n2str = n2.toString(16);
		if (n2str.length < 7) {
			for (let i = n2str.length; i < 7; i++)
				n2str = "0" + n2str;
		}
		return parseInt(n1.toString(16) + "" + n2str, 16);
	}
	/**
	 * @en Reads an Int8Array from the given Byte object starting from a specific position and with a given length.
	 *      It adjusts the end position to fit within the buffer bounds and creates the Int8Array from the buffer slice. Also updates the internal position of the Byte object after reading.
	 * @param byte The Byte object from which to read the Int8Array.
	 * @param start The starting position within the Byte object's buffer.
	 * @param len The length of the Int8Array to read.
	 * @returns The read Int8Array.
	 * @zh 从给定的Byte对象中从特定位置开始按给定长度读取一个Int8Array。
	 *      它会调整结束位置以适应缓冲区边界，并从缓冲区切片创建Int8Array。读取后还会更新Byte对象的内部位置。
	 * @param byte 从中读取Int8Array的Byte对象。
	 * @param start Byte对象缓冲区中的起始位置。
	 * @param len 要读取的Int8Array的长度。
	 * @returns 读取的Int8Array。
	 */
	private static readInt8Array(byte: Byte, start: number, len: number): Int8Array {
		var end: number = start + len;
		// @ts-ignore
		end = (end > byte._length) ? byte._length : end;
		// @ts-ignore
		var v: any = new Int8Array(byte._d_.buffer.slice(start, end));
		// @ts-ignore
		byte._pos_ = end;
		return v;
	}
	/**
	 * @en Reads a single value from the given Byte data buffer based on the specified type and keyMap.
	 *      It handles different types of values such as null, integers, booleans, strings, arrays, etc., by using specific read operations for each type.
	 *      If the type is not recognized among the common ones, it delegates to the _readOne_other method.
	 * @param parent The parent object to which the read value may be assigned (used for object property assignment).
	 * @param data The Byte data buffer from which to read the value.
	 * @param key The key associated with the value (if applicable, for object property setting).
	 * @param type The type code representing the value type.
	 * @param keyMap A mapping object that keeps track of keys and their corresponding values and indices.
	 * @returns The read value.
	 * @zh 根据指定的类型和键映射从给定的Byte数据缓冲区读取单个值。
	 *      它通过针对每种类型使用特定的读取操作来处理不同类型的值，如空值、整数、布尔值、字符串、数组等。
	 *      如果在常见类型中无法识别该类型，则委托给_readOne_other方法处理。
	 * @param parent 读取的值可能分配到的父对象（用于对象属性赋值）。
	 * @param data 从中读取值的Byte数据缓冲区。
	 * @param key 与值关联的键（如果适用，用于设置对象属性）。
	 * @param type 代表值类型的类型码。
	 * @param keyMap 一个映射对象，用于跟踪键及其对应的值和索引。
	 * @returns 读取的值。
	 */
	private _readOne(parent: any, data: Byte, key: string, type: number, keyMap: ReadKeyMap): any {
		let n: number, value: any;
		switch (type) {
			case JsonBinRead.NULL:
				value = null;
				break;
			case JsonBinRead.NUM8:
				value = data.readByte();
				break;
			case JsonBinRead.NUM16:
				value = data.readInt16();
				break;
			case JsonBinRead.NUM32:
				value = data.readInt32();
				break;
			case JsonBinRead.NUM64:
				value = JsonBinRead._toLargeNumber(data.readInt32(), data.readInt32());
				break;
			case JsonBinRead.BOOLEAN:
				value = data.readByte() ? true : false;
				break;
			case JsonBinRead.DOUBLE:
				value = data.readFloat32();
				break;
			case JsonBinRead.NUM16_1000:
				value = data.readInt16() / 1000;
				break;
			case JsonBinRead.NUM32_1000:
				value = data.readInt32() / 1000;
				break;
			case JsonBinRead.STRING:
				value = keyMap.keyArray[data.readUint16()][0];
				break;
			case JsonBinRead.WORDTEXT:
				n = data.readUint16();
				value = keyMap.keyArray[n][3];
				if (!value) {
					value = keyMap.keyArray[n][3] = new WordText();
					(value as WordText).setText(keyMap.keyArray[n][0]);
				}
				break;
			case JsonBinRead.ARRAYEMPTY:
				data.readUint8();
				value = [];
				break;
			case JsonBinRead.ARRAYNUM8:
				value = []; value.length = n = data.readUint8();
				for (let i = 0; i < n; i++) value[i] = data.readByte();
				break;
			case JsonBinRead.ARRAYNUM16:
				value = []; value.length = n = data.readUint8();
				for (let i = 0; i < n; i++) value[i] = data.readInt16();
				break;
			case JsonBinRead.ARRAYNUM32:
				value = []; value.length = n = data.readUint8();
				for (let i = 0; i < n; i++) value[i] = data.readInt32();
				break;
			case JsonBinRead.ARRAYDOUBLE:
				value = []; value.length = n = data.readUint8();
				for (let i = 0; i < n; i++) value[i] = data.readFloat32();
				break;
			case JsonBinRead.ARRAYBUFFER:
				value = data.readArrayBuffer(data.readUint16());
				break;
			case JsonBinRead.ARRAYBUFFER32:
				value = data.readArrayBuffer(data.readUint32());
				break;
			case JsonBinRead.INT8ARRAY:
				n = this._getLen(data);
				value = JsonBinRead.readInt8Array(data, data.pos, n);
				break;
			case JsonBinRead.UINT8ARRAY:
				n = this._getLen(data);
				value = data.readUint8Array(data.pos, n);
				break;
			case JsonBinRead.INT16ARRAY:
				n = this._getLen(data);
				value = data.readInt16Array(data.pos, n);
				break;
			case JsonBinRead.FLOAT32ARRAY:
				n = this._getLen(data);
				value = data.readFloat32Array(data.pos, n);
				break;
			default:
				return this._readOne_other(parent, data, key, type, keyMap);
		}
		parent && key && (parent[key] = value);
		return value;
	}
	/**
	 * @en Reads a value from the given Byte data buffer for types that are not handled in the _readOne method directly.
	 *      It deals with more complex types like arrays with specific compression or reference handling and objects with class creation.
	 * @param parent The parent object related to the value being read (used for property assignment and object hierarchy).
	 * @param data The Byte data buffer from which to read the value.
	 * @param key The key associated with the value (if applicable for property setting).
	 * @param type The type code representing the value type.
	 * @param keyMap A mapping object that keeps track of keys and their corresponding values and indices.
	 * @returns The read value.
	 * @zh 从给定的Byte数据缓冲区读取那些在_readOne方法中未直接处理的类型的值。
	 *      它处理更复杂的类型，例如具有特定压缩或引用处理的数组以及需要创建类的对象。
	 * @param parent 与正在读取的值相关的父对象（用于属性赋值和对象层次结构）。
	 * @param data 从中读取值的Byte数据缓冲区。
	 * @param key 与值关联的键（如果适用于属性设置）。
	 * @param type 代表值类型的类型码。
	 * @param keyMap 一个映射对象，用于跟踪键及其对应的值和索引。
	 * @returns 读取的值。
	 */
	private _readOne_other(parent: any, data: Byte, key: string, type: number, keyMap: ReadKeyMap): any {
		let cur: any = parent;
		let value: any;
		let n: number, i: number;
		let pos: number;

		switch (type) {
			case JsonBinRead.ARRAY8:
			case JsonBinRead.ARRAY16:
			case JsonBinRead.ARRAY32:
				switch (type) {
					case JsonBinRead.ARRAY8:
						n = data.readUint8();
						break;
					case JsonBinRead.ARRAY16:
						n = data.readInt16();
						break;
					case JsonBinRead.ARRAY32:
						n = data.readUint32();
						break;
				}
				//n = type === ARRAY8?data.readUint8():data.readInt16();
				//value = _readArray(data, -1, n, type, keyMap);
				var array: any[] = value = [];
				array.length = n;
				for (i = 0; i < n; i++) {
					type = data.readUint8();
					array[i] = this._readOne(null, data, null, type, keyMap);
				}
				break;
			case JsonBinRead.ARRAYREFSOURCE8:
			case JsonBinRead.ARRAYREFSOURCE16:
				n = type === JsonBinRead.ARRAYREFSOURCE8 ? data.readUint8() : data.readInt16();
				pos = data.pos - this._dataStartOfs;
				value = this._readArray(data, -1, n, type, keyMap);
				this._objectRef[pos] = { array: value, pos: pos };
				//trace("same array read souce:"+pos,value);
				break;
			case JsonBinRead.ARRAYREF:
			case JsonBinRead.ARRAYREF32:
				i = data.readByte();//读取创建压缩类型
				pos = type == JsonBinRead.ARRAYREF ? data.readUint16() : data.readUint32();
				let objectRef = this._objectRef[pos];
				//trace("same array read ref:",pos,_objectRef);
				if (!objectRef) {
					//trace("same array read ref err:",pos,_objectRef);
					throw "load ref err";
					return null;
				}
				if (i == JsonBinRead.COMPRESS_NEW) {
					value = this._readArray(data, pos + this._dataStartOfs, objectRef.array.length, type, keyMap);
				}
				else value = objectRef.array;
				break;
			case JsonBinRead.OBJECT:
			case JsonBinRead.OBJECTTHISCLASS:
				if (key != null || !parent) {
					if (type == JsonBinRead.OBJECT) {
						cur = {};
					}
					else {
						n = data.readUint16();
						cur = this._createObjWithClass(keyMap.keyArray[n][0]);
						if (!cur) throw "jsonbin read err,no this class:" + keyMap.keyArray[n][0];
					}
					key && parent && (parent[key] = cur);
				}

				let keyDef: any[];

				while (true) {
					//读取key在字符串数组的索引
					n = data.readUint16();

					if (n == JsonBinRead.OBJECTEND)
						break;

					keyDef = keyMap.keyArray[n];

					this._readOne(cur, data, keyDef[0], keyDef[1], keyMap);
				}
				value = cur;
				cur = parent;
				break;
		}
		(key != null) && (cur[key] = value);
		return value;
	}
	/**
	 * @en Reads binary JSON data from the given ArrayBuffer and parses it into an object.
	 *      It first initializes some internal state, determines the format based on a marker in the buffer, creates a keyMap for decoding, and then uses the _readOne method to start parsing the data. It also measures and may log the parsing time if it exceeds a certain threshold.
	 * @param data The ArrayBuffer containing the binary JSON data to be read.
	 * @param createObjWithClass A function used to create objects with specific classes during the parsing process (optional).
	 * @returns The parsed object. If the data format is not recognized, it returns null.
	 * @zh 从给定的ArrayBuffer中读取二进制JSON数据并将其解析为对象。
	 *      它首先初始化一些内部状态，根据缓冲区中的标记确定格式，创建用于解码的键映射，然后使用_readOne方法开始解析数据。如果解析时间超过一定阈值，它还会测量并可能记录解析时间。
	 * @param data 包含要读取的二进制JSON数据的ArrayBuffer。
	 * @param createObjWithClass 在解析过程中用于创建具有特定类的对象的函数（可选）。
	 * @returns 解析后的对象。如果数据格式无法识别，则返回null。
	 */
	read(data: ArrayBuffer, createObjWithClass: Function = null): any {
		this._createObjWithClass = createObjWithClass;

		//trace("read jsonbin:", data.byteLength);
		let time = Browser.now();
		let bData: Byte = new Byte();
		let strMap: string;
		let binMark: number;

		bData.writeArrayBuffer(data);
		bData.pos = 0;
		this._objectRef = {};
		binMark = bData.readInt32();
		switch (binMark) {
			case JsonBinRead.ISJSONBIN:
				strMap = bData.readUTFString();
				break;
			case JsonBinRead.ISJSONBIN2:
			case JsonBinRead.ISJSONBIN3:
				strMap = bData.readUTFString32();
				break;
			default:
				bData.pos = 0;
				return null;
		}

		var keyMap: ReadKeyMap = new ReadKeyMap();
		keyMap.strs = strMap.split(JsonBinRead.SPLITCHAR);
		keyMap.keyArray.length = keyMap.strs.length / 2;
		for (var i: number = 0, n: number = keyMap.strs.length; i < n; i += 2) {
			keyMap.keyArray[i / 2] = [keyMap.strs[i], parseInt(keyMap.strs[i + 1])];
		}
		let time2 = Browser.now();
		//if( (Browser.now()-time)>10) console.debug("jsonbinread delay:",(Browser.now()-time),keyMap.strs.toString());
		this._dataStartOfs = bData.pos;
		var r: any = {};
		this._readOne(r, bData, null, JsonBinRead.OBJECT, keyMap);

		if ((Browser.now() - time) > 10) console.debug("jsonbinread delay:", (Browser.now() - time) + "/" + (time2 - time), data.byteLength);

		return binMark == JsonBinRead.ISJSONBIN3 ? r.top : r;
	}


}
class ReadKeyMap {
	keys: any = {};
	strs: any[] = ["BEGIN", 0];
	keyArray: any[] = [];
	keyIndex: number = 1;
}
