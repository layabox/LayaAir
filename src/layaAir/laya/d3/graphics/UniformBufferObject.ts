import { LayaGL } from "../../layagl/LayaGL";
import { Buffer } from "../../webgl/utils/Buffer";
import { UnifromBufferData } from "./UniformBufferData";
/**
 * 类封装WebGL2UniformBufferObect
 */
export class UniformBufferObject extends Buffer {

    /**@internal */
    private static _Map: Map<string, UniformBufferObject> = new Map<string, UniformBufferObject>();

    /**@internal bind GL Pointer*/
    private static glPointerID: number = 0;

    /**
     * has Buffer 
     * @param uniformBlockName 
     * @returns 
     */
    static hasBuffer(uniformBlockName: string): boolean {
        return UniformBufferObject._Map.has(uniformBlockName)
    }

    /**
     * create Uniform Buffer
     * @param name Uniform block name(must pitch Shader)
     * @param bufferUsage config usage
     * @param bytelength byte length
     * @returns 
     */
    static creat(name: string, bufferUsage: number, bytelength: number) {
        UniformBufferObject._Map.set(name, new UniformBufferObject(UniformBufferObject.glPointerID++, bufferUsage, bytelength));
        return UniformBufferObject._Map.get(name);
    }

    /**
     * get Uniform Buffer by name
     * @param name Uniform block name(must pitch Shader)
     * @returns 
     */
    static getBuffer(name: string) {
        return UniformBufferObject._Map.get(name);
    }

    /**@interanl */
    _glPointer: number;

    /**@internal */
    _updateDataInfo: UnifromBufferData;

    /**byte length */
    byteLength: number;

    /**
     * @interanl
     */
    constructor(glPointer: number, bufferUsage: number, byteLength: number) {
        super();
        var gl: WebGL2RenderingContext = LayaGL.instance as WebGL2RenderingContext;
        this._glPointer = glPointer;
        this._bufferUsage = bufferUsage;
        this._bufferType = gl.UNIFORM_BUFFER;
        this.byteLength = byteLength;
        this.bind();
        this.bindUniformBufferBase();
        gl.bufferData(this._bufferType, this.byteLength, this._bufferUsage);
        this._buffer = new Uint8Array(this.byteLength);
    }

    /**
     * @interanl
     */
    private bindUniformBuffer() {
        var gl: WebGL2RenderingContext = LayaGL.instance as WebGL2RenderingContext;
        gl.bindBuffer(gl.UNIFORM_BUFFER, this._glBuffer);
    }

    /**
     * @internal
     */
    private bindUniformBufferBase() {
        var gl: WebGL2RenderingContext = LayaGL.instance as WebGL2RenderingContext;
        gl.bindBufferBase(gl.UNIFORM_BUFFER, this._glPointer, this._glBuffer);
    }

    /**
     * @inheritDoc
     * @override
     */
    bind(): boolean {
        if (Buffer._bindedVertexBuffer !== this._glBuffer) {
            this.bindUniformBuffer();
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
            gl.bufferSubData(this._bufferType, bufferOffset, buffer, 0, byteCount / 4);
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

}