import { LayaGL } from "../../layagl/LayaGL";
import { Buffer } from "../../webgl/utils/Buffer";
import { SubUniformBufferData } from "./subUniformBufferData";
import { UniformBufferBase } from "./UniformBufferBase";
import { UnifromBufferData } from "./UniformBufferData";
/**
 * 类封装WebGL2UniformBufferObect
 */
export class UniformBufferObject extends Buffer {
    private static commonMap: string[] = ["CameraUniformBlock", "SceneUniformBlock", "SpriteUniformBlock", "ShadowUniformBlock"]

    /**@internal */
    private static _Map: Map<string, UniformBufferBase> = new Map<string, UniformBufferBase>();

    /**@internal bind GL Pointer*/
    private static glPointerID: number = 0;

    /**
     * create Uniform Buffer Base
     * @param name Uniform block name(must pitch Shader)
     * @param bufferUsage config usage
     * @param bytelength byte length
     * @returns 
     */
    static creat(name: string, bufferUsage: number, bytelength: number, isSingle: boolean = false) {
        if (!UniformBufferObject._Map.get(name)) {
            UniformBufferObject._Map.set(name, new UniformBufferBase(name, UniformBufferObject.glPointerID++, isSingle));
        }
        let bufferBase = UniformBufferObject._Map.get(name);
        if (bufferBase._singgle && bufferBase._mapArray.length > 0) {
            return null;
        } else {
            let ubo = new UniformBufferObject(bufferBase._glPointerID, name, bufferUsage, bytelength, isSingle);
            bufferBase.add(ubo);
            return ubo;
        }
    }

    /**
     * BlockName is Engine default
     * @param blockName block name
     * @returns 
     */
    static isCommon(blockName: string): boolean {
        return UniformBufferObject.commonMap.indexOf(blockName) != -1;
    }

    /**
     * get Uniform Buffer by name
     * @param name Uniform block name(must pitch Shader)
     * @returns 
     */
    static getBuffer(name: string, index: number) {
        let base = UniformBufferObject._Map.get(name);
        if (!base)
            return null;
        return base._mapArray[index];
    }

    /**@interanl */
    _glPointer: number;

    /**@internal */
    _updateDataInfo: UnifromBufferData;

    /**@internal */
    _isSingle: boolean = false;

    /**buffer name */
    _name: string;

    /**all byte length */
    byteLength: number;

    /**
     * @interanl
     */
    constructor(glPointer: number, name: string, bufferUsage: number, byteLength: number, isSingle: boolean) {
        super();
        var gl: WebGL2RenderingContext = LayaGL.instance as WebGL2RenderingContext;
        this._glPointer = glPointer;
        this._bufferUsage = bufferUsage;
        this._bufferType = gl.UNIFORM_BUFFER;
        this.byteLength = byteLength;
        this._name = name;
        this._isSingle = isSingle;
        this.bind();
        if (this._isSingle)
            this._bindUniformBufferBase();
        gl.bufferData(this._bufferType, this.byteLength, this._bufferUsage);
    }

    /**
     * bind a range for Point buffer
     * @interanl
     */
    private _bindUniformBuffer() {
        var gl: WebGL2RenderingContext = LayaGL.instance as WebGL2RenderingContext;
        gl.bindBuffer(gl.UNIFORM_BUFFER, this._glBuffer);
    }

    /**
     * differcnt UBO bind Point
     * @internal
     */
    _bindUniformBufferBase() {
        const gl: WebGL2RenderingContext = LayaGL.instance as WebGL2RenderingContext;
        const base = UniformBufferObject._Map.get(this._name);
        if (base._curUniformBuffer != this) {
            gl.bindBufferBase(gl.UNIFORM_BUFFER, this._glPointer, this._glBuffer);
            base._curUniformBuffer = this;
        }
    }

    /**
     * 绑定一段
     * @internal
     */
    _bindBufferRange(offset: number, byteCount: number) {
        const gl: WebGL2RenderingContext = LayaGL.instance as WebGL2RenderingContext;
        this.bind();
        gl.bindBufferRange(gl.UNIFORM_BUFFER, this._glPointer, this._glBuffer, offset, byteCount);
    }

    /**
     * 重置buffer长度
     * @param bytelength 
     */
    _reset(bytelength: number) {
        const gl: WebGL2RenderingContext = LayaGL.instance as WebGL2RenderingContext;
        //destroy
        if (this._glBuffer) {
            gl.deleteBuffer(this._glBuffer);
            this._glBuffer = null;
        }
        //create new
        this._byteLength = this.byteLength = bytelength;
        this._glBuffer = LayaGL.instance.createBuffer();
        this.bind();
        if (this._isSingle)
            this._bindUniformBufferBase();
        gl.bufferData(this._bufferType, this.byteLength, this._bufferUsage);
    }

    /**
     * @inheritDoc
     * @override
     */
    bind(): boolean {
        if (Buffer._bindedVertexBuffer !== this._glBuffer) {
            this._bindUniformBuffer();
            Buffer._bindedVertexBuffer = this._glBuffer;
            return true;
        } else
            return false;
    }

    /**
     * set UniformBuffer data by UniformBufferData
     * @param buffer Float32Array data
     * @param bufferOffset byteOffset
     * @param byteCount  byteCount
     * @returns 
     */
    setData(buffer: Float32Array, bufferOffset: number = 0, byteCount: number = Number.MAX_SAFE_INTEGER): void {
        if (byteCount < 0) return;
        this.bind();
        var needSubData: boolean = !(bufferOffset == 0 && byteCount == this.byteLength);
        if (needSubData) {
            var subData: Uint8Array = new Uint8Array(buffer.buffer, bufferOffset, byteCount);
            LayaGL.instance.bufferSubData(this._bufferType, bufferOffset, subData);
        }
        else {
            let gl = (LayaGL.instance as WebGL2RenderingContext);
            gl.bufferSubData(this._bufferType, bufferOffset, buffer, 0, buffer.length);
        }
    }

    /**
     * set UniformBuffer data by UniformBufferData
     * @param bufferData 
     */
    setDataByUniformBufferData(bufferData: UnifromBufferData) {
        if (this._updateDataInfo == bufferData) {
            this.setData(bufferData._buffer, bufferData._updateFlag.x * 4, (bufferData._updateFlag.y - bufferData._updateFlag.x) * 4);
            bufferData._resetUpdateFlag();
        } else {
            this.setData(bufferData._buffer, 0, this.byteLength);
            bufferData._resetUpdateFlag();
            this._updateDataInfo = bufferData;
        }
    }

    /**
     * set Data by subUniformBufferData
     * @param bufferData sub UniformBufferData
     * @param offset 
     */
    setDataByByUniformBufferDataOffset(bufferData: SubUniformBufferData, offset: number) {
        let datalength = bufferData.getbyteLength();//offset
        let reallength = bufferData._realByte;//update Count
        bufferData._resetUpdateFlag();
        let gl = (LayaGL.instance as WebGL2RenderingContext);
        this.bind();
        gl.bufferSubData(this._bufferType, offset * datalength, bufferData._buffer, 0, reallength / 4);
    }

}