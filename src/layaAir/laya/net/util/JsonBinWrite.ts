import { Byte } from "../../utils/Byte";
import { BinHashUtils } from "./BinHashUtils";
import { JsonBinRead } from "./JsonBinRead";


/**
 * ...
 * @author LaoXie
 */
export class JsonBinWrite {
	static COMPRESS: string = "_$TeMpkEy$_CoMpReSs";
	static NOSAVEKEY: string = "_$TeMpkEyNoSv$_";
	static NOSAVETHISOBJ: string = "$__$disbaleJsonBinSv";
	static NOSAVE_KEY_LEN: number = 15;

	static NOSAVETHISOBJ_DELETE: number = 2;
	static NOSAVETHISOBJ_TRUE: number = 1;

	private static _instance: JsonBinWrite;

	static get instance(): JsonBinWrite {
		return JsonBinWrite._instance || (JsonBinWrite._instance = new JsonBinWrite());
	}

	objectRef: any = {};

	private _classEnable_: boolean;

	constructor() {
	}

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

	private _writeString(keyMap: SaveKeyMap, value: any, out: any): void {
		var keyNum: number = keyMap.keys[value];
		if (!keyNum) {
			keyNum = keyMap.keys[value] = keyMap.keyIndex;
			keyMap.strs.push(value, 0);
			keyMap.keyIndex++;
		}
		out.writeUint16(keyNum);
	}

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

	static isWordText(o: any): boolean {
		return o && o._text && (o._$_$ISWORDTYEXT || o.lastGCCnt != null);
	}

	private _writeLen(out: Byte, len: number): void {
		if (len < 0x80)
			out.writeUint8(len);
		else if (len < 0x8000) {
			out.writeUint8((len >> 8) | 0x80);
			out.writeUint8(len & 0xFF);
		}
		else throw "jsonbin save len must<0x8000" + " " + len;
	}

	private _writeBigNumber(out: Byte, value: number): void {
		let numstr = value.toString(16);
		let n1 = parseInt(numstr.substring(0, numstr.length - 7), 16);
		let n2 = parseInt(numstr.substring(numstr.length - 7), 16);
		out.writeInt32(n1);
		out.writeInt32(n2);
		if (JsonBinRead._toLargeNumber(n1, n2) != value) throw "save big number err:" + value;
	}

	private deep = 0;
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




class SaveKeyMap {
	keys: any = {};
	strs: any[] = ["BEGIN", 0];
	keyArray: any[] = [];
	keyIndex: number = 1;
}

/*
__CLASS__:'Sprite'
不产生object，而是直接产生这个类
*/
