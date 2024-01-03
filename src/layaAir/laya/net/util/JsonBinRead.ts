import { Browser } from "../../utils/Browser";
import { Byte } from "../../utils/Byte";
import { WordText } from "../../utils/WordText";
import { Loader } from "../Loader";

/**
 * ...
 * @author LaoXie
 */
export class JsonBinRead {
	static ISJSONBIN: number = 0xFFFFFF;
	static ISJSONBIN2: number = 0xFFFFFE;
	static ISJSONBIN3: number = 0xFFFFFD;

	static SPLITCHAR: string = String.fromCharCode(3);

	static COMPRESS_NEW: number = 1;
	static COMPRESS_REF: number = 2;
	static COMPRESS_REFMODIFY: number = 3;

	static NUM8: number = 0;
	static NUM16: number = 1;
	static NUM32: number = 2;
	static BOOLEAN: number = 3;
	static DOUBLE: number = 4;
	static STRING: number = 5;
	static ARRAY8: number = 6;
	static ARRAY16: number = 7;
	static ARRAYEMPTY: number = 8;
	static ARRAYNUM8: number = 9;
	static ARRAYNUM16: number = 10;
	static ARRAYNUM32: number = 11;
	static ARRAYDOUBLE: number = 12;
	static ARRAYSTRING: number = 13;
	static NULL: number = 14;
	static OBJECT: number = 15;
	static NUM16_1000: number = 16;
	static NUM32_1000: number = 17;
	static WORDTEXT: number = 18;
	static ARRAYBUFFER: number = 19;
	static ARRAYREF: number = 20;
	static ARRAYREFSOURCE8: number = 21;
	static ARRAYREFSOURCE16: number = 22;
	static ARRAYBUFFER32: number = 23;
	static ARRAYREF32: number = 24;
	static ARRAY32: number = 25;
	static OBJECTTHISCLASS: number = 26;

	static NUM64: number = 27;

	static INT8ARRAY: number = 28;
	static UINT8ARRAY: number = 29;
	static INT16ARRAY: number = 30;
	static FLOAT32ARRAY: number = 31;

	static OBJECTEND: number = 0x7FFF;

	private static _instance: JsonBinRead;

	static get instance(): JsonBinRead {
		return JsonBinRead._instance || (JsonBinRead._instance = new JsonBinRead());
	}

	static IsJsonbin(data: ArrayBuffer): boolean {
		if (data.byteLength < 5)
			return false;
		const value = (new Uint32Array(data, 0, 4))[0];
		return value == JsonBinRead.ISJSONBIN || value == JsonBinRead.ISJSONBIN2 || value == JsonBinRead.ISJSONBIN3;
	}

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

	static parsePack(value: any): any {
		var r: JsonBinRead = new JsonBinRead();
		var o: any = r.read(value);
		for (var key in o)
			Loader.cacheRes(key, o[key]);
		return o;
	}

	private _objectRef: any;
	private _dataStartOfs: number;
	private _createObjWithClass: Function;

	constructor() {

	}

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

	private _getLen(data: Byte): number {
		let n = data.readUint8();
		return (n & 0x80) == 0 ? n : (data.readUint8() | ((n & ~0x80) << 8));
	}

	static _toLargeNumber(n1: number, n2: number): number {
		let n2str = n2.toString(16);
		if (n2str.length < 7) {
			for (let i = n2str.length; i < 7; i++)
				n2str = "0" + n2str;
		}
		return parseInt(n1.toString(16) + "" + n2str, 16);
	}

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
		//if( (Browser.now()-time)>10) console.log("jsonbinread delay:",(Browser.now()-time),keyMap.strs.toString());
		this._dataStartOfs = bData.pos;
		var r: any = {};
		this._readOne(r, bData, null, JsonBinRead.OBJECT, keyMap);

		if ((Browser.now() - time) > 10) console.log("jsonbinread delay:", (Browser.now() - time) + "/" + (time2 - time), data.byteLength);

		return binMark == JsonBinRead.ISJSONBIN3 ? r.top : r;
	}


}




class ReadKeyMap {
	keys: any = {};
	strs: any[] = ["BEGIN", 0];
	keyArray: any[] = [];
	keyIndex: number = 1;
}
