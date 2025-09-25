import { Byte } from "./Byte";
import { WordText } from "./WordText";

/**
 * @en JsonBin class provides methods for parsing and writing binary JSON-like data.
 * @zh JsonBin类提供了用于解析和写入二进制JSON数据的方法。
 */
export class JsonBin {
    /**
     * @en Checks if the given ArrayBuffer contains JSONBin data.
     * @param data The ArrayBuffer to be checked.
     * @returns True if the data is identified as JSONBin data, false otherwise.
     * @zh 检查给定的ArrayBuffer是否包含JsonBin数据。
     * @param data 要检查的ArrayBuffer。
     * @returns 如果数据被识别为JsonBin数据则返回true，否则返回false。
     */
    static isJsonBin(data: ArrayBufferLike): boolean {
        if (data.byteLength < 5)
            return false;
        const value = (new Uint32Array(data, 0, 4))[0];
        return value === ISJSONBIN || value === ISJSONBIN2 || value === ISJSONBIN3;
    }

    /**
     * @en Parses the given ArrayBuffer as JSONBin data.
     * @param data The ArrayBuffer to be parsed.
     * @param createObjWithClass An optional function to create objects with class information
     * @return The parsed data as an object. If parsing fails, returns null.
     * @zh 将给定的ArrayBuffer解析为JsonBin数据。
     * @param data 要解析的ArrayBuffer。
     * @param createObjWithClass 可选的函数，用于创建带有类信息的对象。 
     * @returns 解析后的数据作为一个对象。如果解析失败，则返回null。
     */
    static parse(data: ArrayBufferLike, createObjWithClass?: Function): any {
        if (!JsonBin.isJsonBin(data)) {
            let b: Byte = new Byte();
            b.writeArrayBuffer(data);
            b.pos = 0;
            let str: string = b.readUTFBytes();
            return JSON.parse(str);
        }

        _createObjWithClass = createObjWithClass;

        //trace("read jsonbin:", data.byteLength);
        //let time = performance.now();
        let bData: Byte = new Byte();
        let strMap: string;
        let binMark: number;

        bData.writeArrayBuffer(data);
        bData.pos = 0;
        _objectRef = {};
        binMark = bData.readInt32();
        switch (binMark) {
            case ISJSONBIN:
                strMap = bData.readUTFString();
                break;
            case ISJSONBIN2:
            case ISJSONBIN3:
                strMap = bData.readUTFString32();
                break;
            default:
                bData.pos = 0;
                return null;
        }

        var keyMap: ReadKeyMap = {
            keys: {},
            strs: ["BEGIN", 0],
            keyArray: [],
            keyIndex: 1
        }
        keyMap.strs = strMap.split(SPLITCHAR);
        keyMap.keyArray.length = keyMap.strs.length / 2;
        for (var i: number = 0, n: number = keyMap.strs.length; i < n; i += 2) {
            keyMap.keyArray[i / 2] = [keyMap.strs[i], parseInt(keyMap.strs[i + 1])];
        }
        //let time2 = performance.now();
        //if( (performance.now()-time)>10) console.log("jsonbinread delay:",(performance.now()-time),keyMap.strs.toString());
        _dataStartOfs = bData.pos;
        var r: any = {};
        readOne(r, bData, null, OBJECT, keyMap);

        //if ((performance.now() - time) > 10) console.log("jsonbinread delay:", (performance.now() - time) + "/" + (time2 - time), data.byteLength);

        return binMark == ISJSONBIN3 ? r.top : r;
    }

    /**
     * @en Serializes the given object into a binary format and returns the resulting buffer.
     * @param o The object to be serialized.
     * @param enableClass A flag indicating whether to include class information (default is false).
     * @returns The serialized object as an ArrayBuffer.
     * @zh 将给定对象序列化为二进制格式并返回生成的缓冲区。
     * @param o 要序列化的对象。
     * @param enableClass 一个标志，指示是否包含类信息（默认值为false）。
     * @returns 作为ArrayBuffer的序列化对象。
     */
    static write(o: any, enableClass?: boolean): ArrayBuffer {
        _deep = 0;
        _classEnable_ = enableClass;
        var keyMap: SaveKeyMap = {
            keys: {},
            strs: ["BEGIN", 0],
            keyArray: [],
            keyIndex: 1
        };

        _objectRef = {};

        var out: Byte = new Byte();

        writeObject(out, keyMap, { top: o });
        out.writeUint16(OBJECTEND);

        var r: Byte = new Byte();
        r.writeInt32(ISJSONBIN3);
        r.writeUTFString32(keyMap.strs.join(SPLITCHAR));
        r.writeArrayBuffer(out.buffer);

        return r.buffer;
    }
}

//old style interface, deprecated

/**
 * @deprecated Uses JsonBin
 */
export class JsonBinRead {
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
        return JsonBin.isJsonBin(data);
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
        return JsonBin.parse(value);
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
    read(data: ArrayBuffer, createObjWithClass?: Function): any {
        return JsonBin.parse(data, createObjWithClass);
    }
}

/**
 * @deprecated Uses JsonBin
 */
export class JsonBinWrite {
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
     * @en Serializes the given object into a binary format and returns the resulting buffer.
     * @param o The object to be serialized.
     * @param enableClass A flag indicating whether to include class information (default is false).
     * @returns The serialized object as an ArrayBuffer.
     * @zh 将给定对象序列化为二进制格式并返回生成的缓冲区。
     * @param o 要序列化的对象。
     * @param enableClass 一个标志，指示是否包含类信息（默认值为false）。
     * @returns 作为ArrayBuffer的序列化对象。
     */
    write(o: any, enableClass?: boolean): ArrayBuffer {
        return JsonBin.write(o, enableClass);
    }
}


//------------------------------------------------------------
//Parser start

interface ReadKeyMap {
    keys: any;
    strs: any[];
    keyArray: any[];
    keyIndex: number;
}

const ISJSONBIN: number = 0xFFFFFF;
const ISJSONBIN2: number = 0xFFFFFE;
const ISJSONBIN3: number = 0xFFFFFD;

const SPLITCHAR: string = String.fromCharCode(3);

const COMPRESS_NEW: number = 1;
const COMPRESS_REF: number = 2;
const COMPRESS_REFMODIFY: number = 3;

const NUM8: number = 0;
const NUM16: number = 1;
const NUM32: number = 2;
const BOOLEAN: number = 3;
const DOUBLE: number = 4;
const STRING: number = 5;
const ARRAY8: number = 6;
const ARRAY16: number = 7;
const ARRAYEMPTY: number = 8;
const ARRAYNUM8: number = 9;
const ARRAYNUM16: number = 10;
const ARRAYNUM32: number = 11;
const ARRAYDOUBLE: number = 12;
const ARRAYSTRING: number = 13;
const NULL: number = 14;
const OBJECT: number = 15;
const NUM16_1000: number = 16;
const NUM32_1000: number = 17;
const WORDTEXT: number = 18;
const ARRAYBUFFER: number = 19;
const ARRAYREF: number = 20;
const ARRAYREFSOURCE8: number = 21;
const ARRAYREFSOURCE16: number = 22;
const ARRAYBUFFER32: number = 23;
const ARRAYREF32: number = 24;
const ARRAY32: number = 25;
const OBJECTTHISCLASS: number = 26;

const NUM64: number = 27;

const INT8ARRAY: number = 28;
const UINT8ARRAY: number = 29;
const INT16ARRAY: number = 30;
const FLOAT32ARRAY: number = 31;

const OBJECTEND: number = 0x7FFF;

var _objectRef: any;
var _dataStartOfs: number;
var _createObjWithClass: Function;

function readArray(data: Byte, pos: number, n: number, type: number, keyMap: ReadKeyMap): any {
    var array: any[] = [];
    array.length = n;
    var endPos: number;
    if (pos >= 0) {
        endPos = data.pos;
        data.pos = pos;
    }
    for (var i: number = 0; i < n; i++) {
        array[i] = readOne({}, data, null, data.readUint8(), keyMap);
    }
    if (pos >= 0) {
        data.pos = endPos
    }
    return array;
}

function getLen(data: Byte): number {
    let n = data.readUint8();
    return (n & 0x80) === 0 ? n : (data.readUint8() | ((n & ~0x80) << 8));
}

function readOne(parent: any, data: Byte, key: string, type: number, keyMap: ReadKeyMap): any {
    let n: number, value: any;
    switch (type) {
        case NULL:
            value = null;
            break;
        case NUM8:
            value = data.readByte();
            break;
        case NUM16:
            value = data.readInt16();
            break;
        case NUM32:
            value = data.readInt32();
            break;
        case NUM64:
            value = toLargeNumber(data.readInt32(), data.readInt32());
            break;
        case BOOLEAN:
            value = data.readByte() ? true : false;
            break;
        case DOUBLE:
            value = data.readFloat32();
            break;
        case NUM16_1000:
            value = data.readInt16() / 1000;
            break;
        case NUM32_1000:
            value = data.readInt32() / 1000;
            break;
        case STRING:
            value = keyMap.keyArray[data.readUint16()][0];
            break;
        case WORDTEXT:
            n = data.readUint16();
            value = keyMap.keyArray[n][3];
            if (!value) {
                value = keyMap.keyArray[n][3] = new WordText();
                (value as WordText).setText(keyMap.keyArray[n][0]);
            }
            break;
        case ARRAYEMPTY:
            data.readUint8();
            value = [];
            break;
        case ARRAYNUM8:
            value = []; value.length = n = data.readUint8();
            for (let i = 0; i < n; i++) value[i] = data.readByte();
            break;
        case ARRAYNUM16:
            value = []; value.length = n = data.readUint8();
            for (let i = 0; i < n; i++) value[i] = data.readInt16();
            break;
        case ARRAYNUM32:
            value = []; value.length = n = data.readUint8();
            for (let i = 0; i < n; i++) value[i] = data.readInt32();
            break;
        case ARRAYDOUBLE:
            value = []; value.length = n = data.readUint8();
            for (let i = 0; i < n; i++) value[i] = data.readFloat32();
            break;
        case ARRAYBUFFER:
            value = data.readArrayBuffer(data.readUint16());
            break;
        case ARRAYBUFFER32:
            value = data.readArrayBuffer(data.readUint32());
            break;
        case INT8ARRAY:
            n = getLen(data);
            value = data.readInt8Array(data.pos, n);
            break;
        case UINT8ARRAY:
            n = getLen(data);
            value = data.readUint8Array(data.pos, n);
            break;
        case INT16ARRAY:
            n = getLen(data);
            value = data.readInt16Array(data.pos, n);
            break;
        case FLOAT32ARRAY:
            n = getLen(data);
            value = data.readFloat32Array(data.pos, n);
            break;
        default:
            return readOne_other(parent, data, key, type, keyMap);
    }
    parent && key && (parent[key] = value);
    return value;
}

function readOne_other(parent: any, data: Byte, key: string, type: number, keyMap: ReadKeyMap): any {
    let cur: any = parent;
    let value: any;
    let n: number, i: number;
    let pos: number;

    switch (type) {
        case ARRAY8:
        case ARRAY16:
        case ARRAY32:
            switch (type) {
                case ARRAY8:
                    n = data.readUint8();
                    break;
                case ARRAY16:
                    n = data.readInt16();
                    break;
                case ARRAY32:
                    n = data.readUint32();
                    break;
            }
            //n = type === ARRAY8?data.readUint8():data.readInt16();
            //value = _readArray(data, -1, n, type, keyMap);
            var array: any[] = value = [];
            array.length = n;
            for (i = 0; i < n; i++) {
                type = data.readUint8();
                array[i] = readOne(null, data, null, type, keyMap);
            }
            break;
        case ARRAYREFSOURCE8:
        case ARRAYREFSOURCE16:
            n = type === ARRAYREFSOURCE8 ? data.readUint8() : data.readInt16();
            pos = data.pos - _dataStartOfs;
            value = readArray(data, -1, n, type, keyMap);
            _objectRef[pos] = { array: value, pos: pos };
            //trace("same array read souce:"+pos,value);
            break;
        case ARRAYREF:
        case ARRAYREF32:
            i = data.readByte();//读取创建压缩类型
            pos = type === ARRAYREF ? data.readUint16() : data.readUint32();
            let objectRef = _objectRef[pos];
            //trace("same array read ref:",pos,_objectRef);
            if (!objectRef) {
                //trace("same array read ref err:",pos,_objectRef);
                throw new Error("load ref err");
                return null;
            }
            if (i === COMPRESS_NEW) {
                value = readArray(data, pos + _dataStartOfs, objectRef.array.length, type, keyMap);
            }
            else value = objectRef.array;
            break;
        case OBJECT:
        case OBJECTTHISCLASS:
            if (key != null || !parent) {
                if (type === OBJECT) {
                    cur = {};
                }
                else {
                    n = data.readUint16();
                    cur = _createObjWithClass(keyMap.keyArray[n][0]);
                    if (!cur)
                        throw new Error("jsonbin read err,no this class:" + keyMap.keyArray[n][0]);
                }
                key && parent && (parent[key] = cur);
            }

            let keyDef: any[];

            while (true) {
                //读取key在字符串数组的索引
                n = data.readUint16();

                if (n === OBJECTEND)
                    break;

                keyDef = keyMap.keyArray[n];

                readOne(cur, data, keyDef[0], keyDef[1], keyMap);
            }
            value = cur;
            cur = parent;
            break;
    }
    (key != null) && (cur[key] = value);
    return value;
}

function toLargeNumber(n1: number, n2: number): number {
    let n2str = n2.toString(16);
    if (n2str.length < 7) {
        for (let i = n2str.length; i < 7; i++)
            n2str = "0" + n2str;
    }
    return parseInt(n1.toString(16) + "" + n2str, 16);
}

//------------------------------------------------------------
//Writer start


interface SaveKeyMap {
    keys: any;
    strs: any[];
    keyArray: any[];
    keyIndex: number;
}

const COMPRESS: string = "_$TeMpkEy$_CoMpReSs";
const NOSAVEKEY: string = "_$TeMpkEyNoSv$_";
const NOSAVETHISOBJ: string = "$__$disbaleJsonBinSv";
const NOSAVE_KEY_LEN: number = 15;

const NOSAVETHISOBJ_DELETE: number = 2;
const NOSAVETHISOBJ_TRUE: number = 1;

var _objectRef: any = {};
var _classEnable_: boolean;
var _deep = 0;

function saveKey(key: string, valueType: number, keyMap: SaveKeyMap, out: Byte): void {
    //之前这里的分隔符不够特殊，导致出问题了，换成了更特殊的字符
    _deep++;
    var keysv: string = key + "/&&__*?/" + valueType;
    var keyNum: number = has(keyMap.keys, keysv) ? keyMap.keys[keysv] : undefined;
    if (!keyNum) {
        keyNum = keyMap.keys[keysv] = keyMap.keyIndex;
        keyMap.strs.push(key, valueType);
        keyMap.keyIndex++;
    }
    out.writeUint16(keyNum);
    _deep--;
}

function getValueArrayType(value: any): number {
    switch (typeof (value)) {
        case "number":
            if (Math.floor(value) !== value)
                return ARRAYDOUBLE;
            var valueabs: number = Math.abs(value);
            if (valueabs < 128)
                return ARRAYNUM8;
            if (valueabs < 0x7FFF)
                return ARRAYNUM16;
            return ARRAYNUM32;
        case "string":
            return OBJECT;
        case "boolean":
            return BOOLEAN;
    }
    return OBJECT;
}

function writeStrOrWordText(keyMap: SaveKeyMap, key: any, value: any, out: any, isWordText: boolean): void {
    var type: number = isWordText ? WORDTEXT : STRING;
    (key != null) ? (saveKey(key, type, keyMap, out)) : (out.writeUint8(type));
    var keyNum: number = has(keyMap.keys, value) ? keyMap.keys[value] : undefined;
    if (keyNum === undefined) {
        keyNum = keyMap.keyIndex;
        keyMap.keys[value] = keyNum;
        keyMap.strs.push(value, 0);
        keyMap.keyIndex++;
    }
    out.writeUint16(keyNum);
}

function writeString(keyMap: SaveKeyMap, value: any, out: any): void {
    var keyNum: number = has(keyMap.keys, value) ? keyMap.keys[value] : undefined;
    if (keyNum === undefined) {
        keyNum = keyMap.keyIndex;
        keyMap.keys[value] = keyNum;
        keyMap.strs.push(value, 0);
        keyMap.keyIndex++;
    }
    out.writeUint16(keyNum);
}

function getObjectTypeof(value: any): string {
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
    if ((value instanceof WordText) || isWordText(value))
        return "WordText";
    return "object";
}

function isWordText(o: any): boolean {
    return o && o._text && (o._$_$ISWORDTYEXT || o.lastGCCnt != null);
}

function writeLen(out: Byte, len: number): void {
    if (len < 0x80)
        out.writeUint8(len);
    else if (len < 0x8000) {
        out.writeUint8((len >> 8) | 0x80);
        out.writeUint8(len & 0xFF);
    }
    else
        throw new Error("jsonbin save len must<0x8000" + " " + len);
}

function writeBigNumber(out: Byte, value: number): void {
    let numstr = value.toString(16);
    let n1 = parseInt(numstr.substring(0, numstr.length - 7), 16);
    let n2 = parseInt(numstr.substring(numstr.length - 7), 16);
    out.writeInt32(n1);
    out.writeInt32(n2);
    if (toLargeNumber(n1, n2) != value)
        throw new Error("save big number err:" + value);
}

function writeOne(out: Byte, keyMap: SaveKeyMap, key: any, value: any, parent: any): boolean {
    if (value == undefined) {
        return false;
    }
    let type: string = typeof (value);
    if (type === "object" && value) {
        if (value.$__$disbaleJsonBinSv) {
            if (value.$__$disbaleJsonBinSv === NOSAVETHISOBJ_DELETE) {
                //delete value.$__$disbaleJsonBinSv ;
            }
            return false;
        }
        type = getObjectTypeof(value);
    }

    switch (type) {
        case "number":
            if (Math.floor(value) !== value) {
                var value1000 = value * 1000;
                if ((value1000 | 0) === value1000) {
                    if (Math.abs(value) < 32) {
                        (key != null) ? saveKey(key, NUM16_1000, keyMap, out) : out.writeUint8(NUM16_1000);
                        out.writeInt16(value1000);
                        return true;
                    }
                    if (Math.abs(value) < 2147483) {
                        (key != null) ? saveKey(key, NUM32_1000, keyMap, out) : out.writeUint8(NUM32_1000);
                        out.writeInt32(value1000);
                        return true;
                    }
                }
                (key != null) ? saveKey(key, DOUBLE, keyMap, out) : out.writeUint8(DOUBLE);
                out.writeFloat32(value);
                return true;
            }
            var valueabs: number = Math.abs(value);
            if (valueabs < 128) {
                (key != null) ? saveKey(key, NUM8, keyMap, out) : out.writeUint8(NUM8);
                out.writeByte(value);
                return true;
            }
            if (valueabs < 0x7FFF) {
                (key != null) ? saveKey(key, NUM16, keyMap, out) : out.writeUint8(NUM16);
                out.writeInt16(value);
                return true;
            }
            if (valueabs < 0x7FFFFFFF) {
                (key != null) ? saveKey(key, NUM32, keyMap, out) : out.writeUint8(NUM32);
                out.writeInt32(value);
                return true;
            }
            (key != null) ? saveKey(key, NUM64, keyMap, out) : out.writeUint8(NUM64);
            writeBigNumber(out, value);
            return true;
        case "string":
            writeStrOrWordText(keyMap, key, value, out, false);
            return true;
        case "boolean":
            (key != null) ? saveKey(key, BOOLEAN, keyMap, out) : out.writeUint8(BOOLEAN);
            out.writeByte(value ? 1 : 0);
            return true;
        case 'ArrayBuffer':
            (key != null) ? saveKey(key, ARRAYBUFFER32, keyMap, out) : out.writeUint8(ARRAYBUFFER32);
            out.writeUint32(((<ArrayBuffer>value)).byteLength);
            out.writeArrayBuffer((<ArrayBuffer>value));
            return true;
        case 'Uint8Array':
            (key != null) ? saveKey(key, UINT8ARRAY, keyMap, out) : out.writeUint8(UINT8ARRAY);
            writeLen(out, ((<Uint8Array>value)).length);
            out.writeArrayBuffer((<Uint8Array>value).buffer);
            return true;
        case 'Int8Array':
            (key != null) ? saveKey(key, INT8ARRAY, keyMap, out) : out.writeUint8(INT8ARRAY);
            writeLen(out, ((<Int8Array>value)).length);
            out.writeArrayBuffer((<Int8Array>value).buffer);
            return true;
        case 'Int16Array':
            (key != null) ? saveKey(key, INT16ARRAY, keyMap, out) : out.writeUint8(INT16ARRAY);
            writeLen(out, ((<Int16Array>value)).length);
            out.writeArrayBuffer((<Int16Array>value).buffer);
            return true;
        case 'Float32Array':
            (key != null) ? saveKey(key, FLOAT32ARRAY, keyMap, out) : out.writeUint8(FLOAT32ARRAY);
            writeLen(out, ((<Float32Array>value)).length);
            out.writeArrayBuffer((<Float32Array>value).buffer);
            return true;
        case 'WordText':
            writeStrOrWordText(keyMap, key, value._text, out, true);
            return true;
        case "object":
            break;
        default:
            throw new Error("jsonbin no this type:" + type);
    }
    if (!value) {
        (key != null) ? saveKey(key, NULL, keyMap, out) : out.writeUint8(NULL);
        return true;
    }
    if (!(value instanceof Array)) {
        if (_classEnable_ && value.__CLASS__) {
            (key != null) ? saveKey(key, OBJECTTHISCLASS, keyMap, out) : out.writeUint8(OBJECTTHISCLASS);
            //this._writeStrOrWordText(keyMap, null, value.__CLASS__, out, false);
        }
        else (key != null) ? saveKey(key, OBJECT, keyMap, out) : out.writeUint8(OBJECT);

        writeObject(out, keyMap, value);
        out.writeUint16(OBJECTEND);
        return true;
    }

    return saveArray(parent, out, keyMap, key, value);
}

function saveArray(parent: any, out: Byte, keyMap: SaveKeyMap, key: string, value: any): boolean {
    var j: number, n: number = value.length;
    if (n === 0) {
        (key != null) ? saveKey(key, ARRAYEMPTY, keyMap, out) : out.writeUint8(ARRAYEMPTY);
        out.writeByte(0);
        return true;
    }
    var startType: number;
    if (n > 1 && n < 250 && ((startType = getValueArrayType(value[0])) != OBJECT)) {
        for (j = 1; j < n; j++) {
            if (startType !== getValueArrayType(value[j])) {
                startType = OBJECT;
                break;
            }
        }
        if (startType != OBJECT && startType != BOOLEAN) {
            (key != null) ? saveKey(key, startType, keyMap, out) : out.writeUint8(startType);
            out.writeUint8(value.length);
            switch (startType) {
                case ARRAYNUM8:
                    for (j = 0; j < n; j++) out.writeByte(value[j]);
                    break;
                case ARRAYNUM16:
                    for (j = 0; j < n; j++) out.writeInt16(value[j]);
                    break;
                case ARRAYNUM32:
                    for (j = 0; j < n; j++) out.writeInt32(value[j]);
                    break;
                case ARRAYDOUBLE:
                    for (j = 0; j < n; j++) out.writeFloat32(value[j]);
                    break;
            }
            return true;
        }
    }

    var typeArray: number;
    if (n < 250) {
        typeArray = ARRAY8;
    } else
        if (n < 32700) {
            typeArray = ARRAY16;
        } else {
            typeArray = ARRAY32;
        }
    var posHead: number = out.pos;
    (key != null) ? saveKey(key, typeArray, keyMap, out) : out.writeUint8(typeArray);
    var pos: number = out.pos, s: number = 0;
    switch (typeArray) {
        case ARRAY8:
            out.writeUint8(n)
            break;
        case ARRAY16:
            out.writeInt16(n);
            break;
        case ARRAY32:
            out.writeUint32(n);
            break;
    }
    //typeArray==ARRAY8?out.writeUint8(n):out.writeInt16(n);
    var posData: number = out.pos;
    for (j = 0; j < n; j++) {
        if (writeOne(out, keyMap, null, value[j], parent))
            s++;
    }
    if (s != n) {
        var tmp: number = out.pos;
        out.pos = pos;
        typeArray === ARRAY8 ? out.writeUint8(s) : out.writeInt16(s);
        out.pos = tmp;
    }

    var compress: number;
    if (key && parent && (compress = parent[COMPRESS + key])) {
        useCompress(out, keyMap, key, value, posHead, posData, compress, typeArray);
    }
    return true;
}

function useCompress(out: Byte, keyMap: SaveKeyMap, key: string, value: any, posHead: number, dataPos: number, compress: number, typeArray: number): void {
    var dLen: number = out.pos - dataPos;
    if (dLen < 64) {
        //return;
    }
    var hashCode: number = getHash((out as any)._u8d_, dataPos, dLen);
    var same: any;
    var src: any;
    var i: number, n: number;
    if (_objectRef[hashCode]) {
        var datas: any[] = _objectRef[hashCode];
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
                if (isSame((out as any)._u8d_, src.pos, src.len, (out as any)._u8d_, dataPos, dLen)) {
                    same = src;
                    break;
                }
            }
        }
    }
    else
        _objectRef[hashCode] = [];

    if (!same) {
        _objectRef[hashCode].push({ hashCode: hashCode, pos: dataPos, len: dLen, value: value });
        out.pos = posHead;
        saveKey(key, typeArray === ARRAY8 ? ARRAYREFSOURCE8 : ARRAYREFSOURCE16, keyMap, out);
        //trace("same array save, new souce:"+(out.pos+1));
        out.pos = dataPos + dLen;
    }
    else {
        out.pos = posHead;
        saveKey(key, ARRAYREF32, keyMap, out);
        //trace("same array save old souce:",same,compress);
        out.writeByte(compress);
        out.writeUint32(same.pos);
    }
}

function writeObject(out: Byte, keyMap: SaveKeyMap, o: any): any {
    //新增加，支持自动创建指定类型对象
    _classEnable_ && o.__CLASS__ && writeString(keyMap, o.__CLASS__, out);

    for (var key in o) {
        //特殊标记，这个不存
        if (key && key.length > NOSAVE_KEY_LEN && key.substr(0, NOSAVE_KEY_LEN) == NOSAVEKEY) {
            continue;
        }
        (_classEnable_ && key == "__CLASS__") || writeOne(out, keyMap, key, o[key], o);
    }
}

/**
 * 计算哈希值
 */
function getHash(buffer: Uint8Array, start: number, len: number, magic: number = 9191891): number {
    var i: number;
    var rst: number = 0;
    for (i = 0; i < len; i++) {
        rst = (rst * 2 + buffer[start + i]) % magic;
    }
    return rst;
}

/**
 * 判断两段数据是否相等
 */
function isSame(buffer1: Uint8Array, start1: number, len1: number, buffer2: Uint8Array, start2: number, len2: number): boolean {
    if (len1 != len2) return false;
    var i: number, len: number;
    len = len1;
    for (i = 0; i < len; i++) {
        if (buffer1[start1 + i] != buffer2[start2 + i]) return false;
    }
    return true;
}

// Helper function for efficient hasOwnProperty check
const hasOwnProp = Object.prototype.hasOwnProperty;
function has(obj: any, key: string): boolean {
    return hasOwnProp.call(obj, key);
}