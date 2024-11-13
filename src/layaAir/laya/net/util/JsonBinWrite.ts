import { Byte } from "../../utils/Byte";
import { BinHashUtils } from "./BinHashUtils";
import { JsonBinRead } from "./JsonBinRead";
/**
 * @en The JsonBinWrite class is responsible for serializing various data types into a binary format that can be saved or transmitted.
 * @zh JsonBinWrite类负责将各种数据类型序列化为可保存或传输的二进制格式。
 */
export class JsonBinWrite {
	/**
	 * @en A special string used for compression identification within the serialized data.
	 * @zh 用于在序列化数据中标识压缩的特殊字符串。
	 */
	static COMPRESS: string = "_$TeMpkEy$_CoMpReSs";
	/**
	 * @en A special string used to mark keys that should not be saved.
	 * @zh 用于标记不应保存的键的特殊字符串。
	 */
	static NOSAVEKEY: string = "_$TeMpkEyNoSv$_";
	/**
	* @en A special string used to mark an object that should not be saved in a specific way.
	* @zh 用于以特定方式标记不应保存的对象的特殊字符串。
	*/
	static NOSAVETHISOBJ: string = "$__$disbaleJsonBinSv";
	/**
	 * @en The length of the special NOSAVEKEY string.
	 * @zh 特殊的NOSAVEKEY字符串的长度。
	 */
	static NOSAVE_KEY_LEN: number = 15;
	/**
	 * @en A constant value used to indicate a specific action related to not saving an object (delete).
	 * @zh 用于指示与不保存对象相关的特定操作（删除）的常量值。
	 */
	static NOSAVETHISOBJ_DELETE: number = 2;
	/**
	 * @en A constant value used to indicate a specific action related to not saving an object (true).
	 * @zh 用于指示与不保存对象相关的特定操作（真）的常量值。
	 */
	static NOSAVETHISOBJ_TRUE: number = 1;
	/**
	 * @en The singleton instance of the JsonBinWrite class.
	 * @zh JsonBinWrite类的单例实例。
	 */
	private static _instance: JsonBinWrite;
	/**
	 * @en Gets the singleton instance of the JsonBinWrite class. If it doesn't exist, creates a new one.
	 * @returns The singleton instance of the JsonBinWrite class.
	 * @zh 获取JsonBinWrite类的单例实例。如果不存在，则创建一个新的实例。
	 * @returns JsonBinWrite类的单例实例。
	 */
	static get instance(): JsonBinWrite {
		return JsonBinWrite._instance || (JsonBinWrite._instance = new JsonBinWrite());
	}
	/**
	 * @en An object used to store references to other objects during the serialization process.
	 * @zh 在序列化过程中用于存储对其他对象引用的对象。
	 */
	objectRef: any = {};
	/**
	 * @en A flag used to enable or disable certain class-related functionality during serialization.
	 * @zh 在序列化期间用于启用或禁用某些与类相关功能的标志。
	 */
	private _classEnable_: boolean;

	constructor() {
	}
	/**
	 * @en Saves a key-value pair with a specific value type to the output buffer.
	 * @param key The key to be saved.
	 * @param valueType The type of the value associated with the key.
	 * @param keyMap A mapping object that keeps track of keys and their corresponding values and indices.
	 * @param out The output buffer where the data is written.
	 * @zh 将具有特定值类型的键值对保存到输出缓冲区。
	 * @param key 要保存的键。
	 * @param valueType 与键关联的值的类型。
	 * @param keyMap 用于跟踪键及其对应的值和索引的映射对象。
	 * @param out 写入数据的输出缓冲区。
	 */
	private _saveKey(key: string, valueType: number, keyMap: SaveKeyMap, out: Byte): void {
		//之前这里的分隔符不够特殊，导致出问题了，换成了更特殊的字符
		this.deep++;
		var keysv: string = key + "/&&__*?/" + valueType;
		var keyNum: number = keyMap.keys[keysv];
		if (!keyNum) {
			keyNum = keyMap.keys[keysv] = keyMap.keyIndex;
			keyMap.strs.push(key, valueType);
			keyMap.keyIndex++;
		}
		out.writeUint16(keyNum);
		this.deep--;
	}
    /**
     * @en Determines the appropriate array value type based on the typeof the given value.
     * @param value The value for which the array value type is to be determined.
     * @returns The determined array value type as a number.
     * @zh 根据给定值的类型确定合适的数组值类型。
     * @param value 要确定数组值类型的那个值。
     * @returns 确定的数组值类型（以数字表示）。
     */
	private _getValueArrayType(value: any): number {
		switch (typeof (value)) {
			case "number":
				if (Math.floor(value) !== value)
					return JsonBinRead.ARRAYDOUBLE;
				var valueabs: number = Math.abs(value);
				if (valueabs < 128)
					return JsonBinRead.ARRAYNUM8;
				if (valueabs < 0x7FFF)
					return JsonBinRead.ARRAYNUM16;
				return JsonBinRead.ARRAYNUM32;
			case "string":
				return JsonBinRead.OBJECT;
			case "boolean":
				return JsonBinRead.BOOLEAN;
		}
		return JsonBinRead.OBJECT;
	}
    /**
     * @en Writes a string or a word text value to the output buffer along with its associated key.
     * @param keyMap A mapping object that keeps track of keys and their corresponding values and indices.
     * @param key The key associated with the value. Can be null.
     * @param value The value to be written.
     * @param out The output buffer where the data is written.
     * @param isWordText A flag indicating whether the value is a word text.
     * @zh 将字符串或单词文本值及其关联的键写入输出缓冲区。
     * @param keyMap 用于跟踪键及其对应的值和索引的映射对象。
     * @param key 与值关联的键。可以为null。
     * @param value 要写入的值。
     * @param out 写入数据的输出缓冲区。
     * @param isWordText 指示值是否为单词文本的标志。
     */
	private _writeStrOrWordText(keyMap: SaveKeyMap, key: any, value: any, out: any, isWordText: boolean): void {
		var type: number = isWordText ? JsonBinRead.WORDTEXT : JsonBinRead.STRING;
		(key != null) ? (this._saveKey(key, type, keyMap, out)) : (out.writeUint8(type));
		var keyNum: number = keyMap.keys[value];
		if (!keyNum) {
			keyNum = keyMap.keys[value] = keyMap.keyIndex;
			keyMap.strs.push(value, 0);
			keyMap.keyIndex++;
		}
		out.writeUint16(keyNum);
	}
    /**
     * @en Writes a string value to the output buffer.
     * @param keyMap A mapping object that keeps track of keys and their corresponding values and indices.
     * @param value The value to be written.
     * @param out The output buffer where the data is written.
     * @zh 将字符串值写入输出缓冲区。
     * @param keyMap 用于跟踪键及其对应的值和索引的映射对象。
     * @param value 要写入的值。
     * @param out 写入数据的输出缓冲区。
     */
	private _writeString(keyMap: SaveKeyMap, value: any, out: any): void {
		var keyNum: number = keyMap.keys[value];
		if (!keyNum) {
			keyNum = keyMap.keys[value] = keyMap.keyIndex;
			keyMap.strs.push(value, 0);
			keyMap.keyIndex++;
		}
		out.writeUint16(keyNum);
	}
    /**
     * @en Gets the type of the given object as a string.
     * @param value The object for which the type is to be determined.
     * @returns The type of the object as a string.
     * @zh 获取给定对象的类型（以字符串表示）。
     * @param value 要确定类型的那个对象。
     * @returns 给定对象的类型（以字符串表示）。
     */
	private _getObjectTypeof(value: any): string {
		if (value instanceof ArrayBuffer)
			return "ArrayBuffer";
		if (value instanceof Uint8Array)
			return "Uint8Array";
		if (value instanceof Int8Array)
			return "Int8Array";
		if (value instanceof Int16Array)
			return "Int16Array";
		if (value instanceof Float32Array)
			return "Float32Array";
		//@ts-ignore
		if ((value instanceof WordText) || JsonBinWrite.isWordText(value))
			return "WordText";
		return "object";
	}
    /**
     * @en Checks if the given object is a word text.
     * @param o The object to be checked.
     * @returns True if the object is a word text, false otherwise.
     * @zh 检查给定对象是否为单词文本。
     * @param o 要检查的对象。
     * @returns 如果对象是单词文本则返回true，否则返回false。
     */
	static isWordText(o: any): boolean {
		return o && o._text && (o._$_$ISWORDTYEXT || o.lastGCCnt != null);
	}
    /**
     * @en Writes the length value to the output buffer in a specific format depending on its magnitude.
     * @param out The output buffer where the data is written.
     * @param len The length value to be written.
     * @zh 根据长度值的大小以特定格式将其写入输出缓冲区。
     * @param out 写入数据的输出缓冲区。
     * @param len 要写入的长度值。
     */
	private _writeLen(out: Byte, len: number): void {
		if (len < 0x80)
			out.writeUint8(len);
		else if (len < 0x8000) {
			out.writeUint8((len >> 8) | 0x80);
			out.writeUint8(len & 0xFF);
		}
		else throw "jsonbin save len must<0x8000" + " " + len;
	}
    /**
     * @en Writes a large number value to the output buffer in a specific format.
     * @param out The output buffer where the data is written.
     * @param value The large number value to be written.
     * @zh 以特定格式将大数值写入输出缓冲区。
     * @param out 写入数据的输出缓冲区。
     * @param value 要写入的大数值。
     */
	private _writeBigNumber(out: Byte, value: number): void {
		let numstr = value.toString(16);
		let n1 = parseInt(numstr.substring(0, numstr.length - 7), 16);
		let n2 = parseInt(numstr.substring(numstr.length - 7), 16);
		out.writeInt32(n1);
		out.writeInt32(n2);
		if (JsonBinRead._toLargeNumber(n1, n2) != value) throw "save big number err:" + value;
	}
    /**
     * @en A counter used to keep track of the depth during the serialization process.
     * @zh 在序列化过程中用于跟踪深度的计数器。
     */
	private deep = 0;
	/**
     * @en Writes a single key-value pair or object to the output buffer.
     * @param out The output buffer where the data is written.
     * @param keyMap A mapping object that keeps track of keys and their corresponding values and indices.
     * @param key The key associated with the value. Can be null.
     * @param value The value to be written.
     * @param parent The parent object of the value (if applicable).
     * @returns True if the write operation was successful, false otherwise.
     * @zh 将单个键值对或对象写入输出缓冲区。
     * @param out 写入数据的输出缓冲区。
     * @param keyMap 用于跟踪键及其对应的值和索引的映射对象。
     * @param key 与值关联的键。可以为null。
     * @param value 要写入的值。
     * @param parent 值的父对象（如果适用）。
     * @returns 如果写入操作成功则返回true，否则返回false。
     */
	private _writeOne(out: Byte, keyMap: SaveKeyMap, key: any, value: any, parent: any): boolean {
		if (value == undefined) {
			return false;
		}
		let type: string = typeof (value);
		if (type == "object" && value) {
			if (value.$__$disbaleJsonBinSv) {
				if (value.$__$disbaleJsonBinSv == JsonBinWrite.NOSAVETHISOBJ_DELETE) {
					//delete value.$__$disbaleJsonBinSv ;
				}
				return false;
			}
			type = this._getObjectTypeof(value);
		}

		switch (type) {
			case "number":
				if (Math.floor(value) !== value) {
					var value1000 = value * 1000;
					if ((value1000 | 0) === value1000) {
						if (Math.abs(value) < 32) {
							(key != null) ? this._saveKey(key, JsonBinRead.NUM16_1000, keyMap, out) : out.writeUint8(JsonBinRead.NUM16_1000);
							out.writeInt16(value1000);
							return true;
						}
						if (Math.abs(value) < 2147483) {
							(key != null) ? this._saveKey(key, JsonBinRead.NUM32_1000, keyMap, out) : out.writeUint8(JsonBinRead.NUM32_1000);
							out.writeInt32(value1000);
							return true;
						}
					}
					(key != null) ? this._saveKey(key, JsonBinRead.DOUBLE, keyMap, out) : out.writeUint8(JsonBinRead.DOUBLE);
					out.writeFloat32(value);
					return true;
				}
				var valueabs: number = Math.abs(value);
				if (valueabs < 128) {
					(key != null) ? this._saveKey(key, JsonBinRead.NUM8, keyMap, out) : out.writeUint8(JsonBinRead.NUM8);
					out.writeByte(value);
					return true;
				}
				if (valueabs < 0x7FFF) {
					(key != null) ? this._saveKey(key, JsonBinRead.NUM16, keyMap, out) : out.writeUint8(JsonBinRead.NUM16);
					out.writeInt16(value);
					return true;
				}
				if (valueabs < 0x7FFFFFFF) {
					(key != null) ? this._saveKey(key, JsonBinRead.NUM32, keyMap, out) : out.writeUint8(JsonBinRead.NUM32);
					out.writeInt32(value);
					return true;
				}
				(key != null) ? this._saveKey(key, JsonBinRead.NUM64, keyMap, out) : out.writeUint8(JsonBinRead.NUM64);
				this._writeBigNumber(out, value);
				return true;
			case "string":
				this._writeStrOrWordText(keyMap, key, value, out, false);
				return true;
			case "boolean":
				(key != null) ? this._saveKey(key, JsonBinRead.BOOLEAN, keyMap, out) : out.writeUint8(JsonBinRead.BOOLEAN);
				out.writeByte(value ? 1 : 0);
				return true;
			case 'ArrayBuffer':
				(key != null) ? this._saveKey(key, JsonBinRead.ARRAYBUFFER32, keyMap, out) : out.writeUint8(JsonBinRead.ARRAYBUFFER32);
				out.writeUint32(((<ArrayBuffer>value)).byteLength);
				out.writeArrayBuffer((<ArrayBuffer>value));
				return true;
			case 'Uint8Array':
				(key != null) ? this._saveKey(key, JsonBinRead.UINT8ARRAY, keyMap, out) : out.writeUint8(JsonBinRead.UINT8ARRAY);
				this._writeLen(out, ((<Uint8Array>value)).byteLength);
				out.writeArrayBuffer((<Uint8Array>value).buffer);
				return true;
			case 'Int8Array':
				(key != null) ? this._saveKey(key, JsonBinRead.INT8ARRAY, keyMap, out) : out.writeUint8(JsonBinRead.INT8ARRAY);
				this._writeLen(out, ((<Int8Array>value)).byteLength);
				out.writeArrayBuffer((<Int8Array>value).buffer);
				return true;
			case 'Int16Array':
				(key != null) ? this._saveKey(key, JsonBinRead.INT16ARRAY, keyMap, out) : out.writeUint8(JsonBinRead.INT16ARRAY);
				this._writeLen(out, ((<Int16Array>value)).byteLength);
				out.writeArrayBuffer((<Int16Array>value).buffer);
				return true;
			case 'Float32Array':
				(key != null) ? this._saveKey(key, JsonBinRead.FLOAT32ARRAY, keyMap, out) : out.writeUint8(JsonBinRead.FLOAT32ARRAY);
				this._writeLen(out, ((<Float32Array>value)).byteLength);
				out.writeArrayBuffer((<Float32Array>value).buffer);
				return true;
			case 'WordText':
				this._writeStrOrWordText(keyMap, key, value._text, out, true);
				return true;
			case "object":
				break;
			default:
				throw "jsonbin no this type:" + type;
		}
		if (!value) {
			(key != null) ? this._saveKey(key, JsonBinRead.NULL, keyMap, out) : out.writeUint8(JsonBinRead.NULL);
			return true;
		}
		if (!(value instanceof Array)) {
			if (this._classEnable_ && value.__CLASS__) {
				(key != null) ? this._saveKey(key, JsonBinRead.OBJECTTHISCLASS, keyMap, out) : out.writeUint8(JsonBinRead.OBJECTTHISCLASS);
				//this._writeStrOrWordText(keyMap, null, value.__CLASS__, out, false);
			}
			else (key != null) ? this._saveKey(key, JsonBinRead.OBJECT, keyMap, out) : out.writeUint8(JsonBinRead.OBJECT);

			this._writeObject(out, keyMap, value);
			out.writeUint16(JsonBinRead.OBJECTEND);
			return true;
		}

		return this._saveArray(parent, out, keyMap, key, value);
	}
    /**
     * @en Saves an array of values to the output buffer.
     * @param parent The parent object of the array (if applicable).
     * @param out The output buffer where the data is written.
     * @param keyMap A mapping object that keeps track of keys and their corresponding values and indices.
     * @param key The key associated with the array (if applicable).
     * @param value The array of values to be written.
     * @returns True if the save operation was successful, false otherwise.
     * @zh 将数组的值保存到输出缓冲区。
     * @param parent 数组的父对象（如果适用）。
     * @param out 写入数据的输出缓冲区。
     * @param keyMap 用于跟踪键及其对应的值和索引的映射对象。
     * @param key 与数组关联的键（如果适用）。
     * @param value 要保存的数组值。
     * @returns 如果保存操作成功则返回true，否则返回false。
     */
	private _saveArray(parent: any, out: Byte, keyMap: SaveKeyMap, key: string, value: any): boolean {
		var j: number, n: number = value.length;
		if (n === 0) {
			(key != null) ? this._saveKey(key, JsonBinRead.ARRAYEMPTY, keyMap, out) : out.writeUint8(JsonBinRead.ARRAYEMPTY);
			out.writeByte(0);
			return true;
		}
		var startType: number;
		if (n > 1 && n < 250 && ((startType = this._getValueArrayType(value[0])) != JsonBinRead.OBJECT)) {
			for (j = 1; j < n; j++) {
				if (startType !== this._getValueArrayType(value[j])) {
					startType = JsonBinRead.OBJECT;
					break;
				}
			}
			if (startType != JsonBinRead.OBJECT && startType != JsonBinRead.BOOLEAN) {
				(key != null) ? this._saveKey(key, startType, keyMap, out) : out.writeUint8(startType);
				out.writeUint8(value.length);
				switch (startType) {
					case JsonBinRead.ARRAYNUM8:
						for (j = 0; j < n; j++) out.writeByte(value[j]);
						break;
					case JsonBinRead.ARRAYNUM16:
						for (j = 0; j < n; j++) out.writeInt16(value[j]);
						break;
					case JsonBinRead.ARRAYNUM32:
						for (j = 0; j < n; j++) out.writeInt32(value[j]);
						break;
					case JsonBinRead.ARRAYDOUBLE:
						for (j = 0; j < n; j++) out.writeFloat32(value[j]);
						break;
				}
				return true;
			}
		}

		var typeArray: number;
		if (n < 250) {
			typeArray = JsonBinRead.ARRAY8;
		} else
			if (n < 32700) {
				typeArray = JsonBinRead.ARRAY16;
			} else {
				typeArray = JsonBinRead.ARRAY32;
			}
		var posHead: number = out.pos;
		(key != null) ? this._saveKey(key, typeArray, keyMap, out) : out.writeUint8(typeArray);
		var pos: number = out.pos, s: number = 0;
		switch (typeArray) {
			case JsonBinRead.ARRAY8:
				out.writeUint8(n)
				break;
			case JsonBinRead.ARRAY16:
				out.writeInt16(n);
				break;
			case JsonBinRead.ARRAY32:
				out.writeUint32(n);
				break;
		}
		//typeArray==JsonBinRead.ARRAY8?out.writeUint8(n):out.writeInt16(n);
		var posData: number = out.pos;
		for (j = 0; j < n; j++) {
			if (this._writeOne(out, keyMap, null, value[j], parent))
				s++;
		}
		if (s != n) {
			var tmp: number = out.pos;
			out.pos = pos;
			typeArray == JsonBinRead.ARRAY8 ? out.writeUint8(s) : out.writeInt16(s);
			out.pos = tmp;
		}

		var compress: number;
		if (key && parent && (compress = parent[JsonBinWrite.COMPRESS + key])) {
			this._useCompress(out, keyMap, key, value, posHead, posData, compress, typeArray);
		}
		return true;
	}
    /**
     * @en Handles the compression of data if applicable.
     * @param out The output buffer where the data is written.
     * @param keyMap A mapping object that keeps track of keys and their corresponding values and indices.
     * @param key The key associated with the data (if applicable).
     * @param value The data to be compressed (if applicable).
     * @param posHead The position of the head of the data in the buffer.
     * @param dataPos The position of the data in the buffer.
     * @param compress The compression factor or related information.
     * @param typeArray The type of the array or data structure.
     * @zh 如果适用，处理数据的压缩操作。
     * @param out 写入数据的输出缓冲区。
     * @param keyMap 用于跟踪键及其对应的值和 indices的映射对象。
     * @param key 与数据关联的键（如果适用）。
     * @param value 要压缩的数据（如果适用）。
     * @param posHead 缓冲区中数据头部的位置。
     * @param dataPos 缓冲区中数据的位置。
     * @param compress 压缩因子或相关信息。
     * @param typeArray 数组或数据结构的类型。
     */
	private _useCompress(out: Byte, keyMap: SaveKeyMap, key: string, value: any, posHead: number, dataPos: number, compress: number, typeArray: number): void {
		var dLen: number = out.pos - dataPos;
		if (dLen < 64) {
			//return;
		}
		var hashCode: number = BinHashUtils.getHash((out as any)._u8d_, dataPos, dLen);
		var same: any;
		var src: any;
		var i: number, n: number;
		if (this.objectRef[hashCode]) {
			var datas: any[] = this.objectRef[hashCode];
			n = datas.length
			for (i = 0; i < n; i++) {
				src = datas[i];
				if (src.value == value) {
					same = src;
					break;
				}
			}
			if (!same) {
				for (i = 0; i < n; i++) {
					src = datas[i];
					if (BinHashUtils.isSame((out as any)._u8d_, src.pos, src.len, (out as any)._u8d_, dataPos, dLen)) {
						same = src;
						break;
					}
				}
			}
		}
		else this.objectRef[hashCode] = [];

		if (!same) {
			this.objectRef[hashCode].push({ hashCode: hashCode, pos: dataPos, len: dLen, value: value });
			out.pos = posHead;
			this._saveKey(key, typeArray == JsonBinRead.ARRAY8 ? JsonBinRead.ARRAYREFSOURCE8 : JsonBinRead.ARRAYREFSOURCE16, keyMap, out);
			//trace("same array save, new souce:"+(out.pos+1));
			out.pos = dataPos + dLen;
		}
		else {
			out.pos = posHead;
			this._saveKey(key, JsonBinRead.ARRAYREF32, keyMap, out);
			//trace("same array save old souce:",same,compress);
			out.writeByte(compress);
			out.writeUint32(same.pos);
		}
	}
    /**
     * @en Writes an object to the output buffer.
     * @param out The output buffer where the data is written.
     * @param keyMap A mapping object that keeps track of keys and their corresponding values and indices.
     * @param o The object to be written.
     * @zh 将对象写入输出缓冲区。
     * @param out 写入数据的输出缓冲区。
     * @param keyMap 用于跟踪键及其对应的值和 indices的映射对象。
     * @param o 要写入的对象。
     */
	private _writeObject(out: Byte, keyMap: SaveKeyMap, o: any): any {
		//新增加，支持自动创建指定类型对象
		this._classEnable_ && o.__CLASS__ && this._writeString(keyMap, o.__CLASS__, out);

		for (var key in o) {
			//特殊标记，这个不存
			if (key && key.length > JsonBinWrite.NOSAVE_KEY_LEN && key.substr(0, JsonBinWrite.NOSAVE_KEY_LEN) == JsonBinWrite.NOSAVEKEY) {
				continue;
			}
			(this._classEnable_ && key == "__CLASS__") || this._writeOne(out, keyMap, key, o[key], o);
		}
	}
    /**
     * @en Serializes the given object into a binary format and returns the resulting buffer.
     * @param o The object to be serialized.
     * @param __CLASS__ A flag indicating whether to include class information (default is false).
     * @returns The serialized object as an ArrayBuffer.
     * @zh 将给定对象序列化为二进制格式并返回生成的缓冲区。
     * @param o 要序列化的对象。
     * @param __CLASS__ 一个标志，指示是否包含类信息（默认值为false）。
     * @returns 作为ArrayBuffer的序列化对象。
     */
	write(o: any, __CLASS__ = false): ArrayBuffer {
		this.deep = 0;
		this._classEnable_ = __CLASS__;
		var keyMap: SaveKeyMap = new SaveKeyMap();

		this.objectRef = {};

		var out: Byte = new Byte();

		this._writeObject(out, keyMap, { top: o });
		out.writeUint16(JsonBinRead.OBJECTEND);

		var r: Byte = new Byte();
		r.writeInt32(JsonBinRead.ISJSONBIN3);
		r.writeUTFString32(keyMap.strs.join(JsonBinRead.SPLITCHAR));
		r.writeArrayBuffer(out.buffer);

		return r.buffer;
	}
}
/**
 * @en A mapping object used to keep track of keys, their corresponding values, and indices during the serialization process.
 * @zh 在序列化过程中用于跟踪键、其对应的值和索引的映射对象。
 */
class SaveKeyMap {
    /**
     * @en An object that stores keys and their corresponding values or indices.
     * @zh 一个存储键及其对应的值或索引的对象。
     */
    keys: any = {};

    /**
     * @en An array that stores strings related to the keys and values.
     * @zh 一个存储与键和值相关的字符串的数组。
     */
    strs: any[] = ["BEGIN", 0];

    /**
     * @en An array that stores keys or related data in a specific order.
     * @zh 一个按特定顺序存储键或相关数据的数组。
     */
    keyArray: any[] = [];

    /**
     * @en An index used to keep track of the number of keys or related elements.
     * @zh 一个用于跟踪键或相关元素数量的索引。
     */
	keyIndex: number = 1;
}
