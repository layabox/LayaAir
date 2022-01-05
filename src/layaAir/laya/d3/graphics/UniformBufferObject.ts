import { LayaGL } from "../../layagl/LayaGL";
import { Buffer } from "../../webgl/utils/Buffer";
import { UnifromBufferData } from "./UniformBufferData";
export class UniformBufferObject extends Buffer {
    private static _Map: Map<string, UniformBufferObject> = new Map<string, UniformBufferObject>();
    private static glPointerID: number = 0;
    static hasBuffer(uniformBlockName: string): boolean {
        return UniformBufferObject._Map.has(uniformBlockName)
    }

    static creat(name: string, bufferUsage: number, bytelength: number) {
        UniformBufferObject._Map.set(name, new UniformBufferObject(UniformBufferObject.glPointerID++, bufferUsage, bytelength));
        return UniformBufferObject._Map.get(name);
    }

    static getBuffer(name: string) {
        return UniformBufferObject._Map.get(name);
    }

    glPointer: number;

    byteLength: number;

    UpdateDataInfo: UnifromBufferData;
    
    constructor(glPointer: number, bufferUsage: number, byteLength: number) {
        super();
        var gl: WebGL2RenderingContext = LayaGL.instance as WebGL2RenderingContext;
        this.glPointer = glPointer;
        this._bufferUsage = bufferUsage;
        this._bufferType = gl.UNIFORM_BUFFER;
        this.byteLength = byteLength;
        this.bind();
        this.bindUniformBufferBase();
        gl.bufferData(this._bufferType, this.byteLength, this._bufferUsage);
        this._buffer = new Uint8Array(this.byteLength);
    }

    bind(): boolean {
        if (Buffer._bindedVertexBuffer !== this._glBuffer) {
            this.bindUniformBuffer();
            Buffer._bindedVertexBuffer = this._glBuffer;
            return true;
        } else
            return false;

    }

    private bindUniformBuffer() {
        var gl: WebGL2RenderingContext = LayaGL.instance as WebGL2RenderingContext;
        gl.bindBuffer(gl.UNIFORM_BUFFER, this._glBuffer);
    }

    private bindUniformBufferBase() {
        var gl: WebGL2RenderingContext = LayaGL.instance as WebGL2RenderingContext;
        gl.bindBufferBase(gl.UNIFORM_BUFFER, this.glPointer, this._glBuffer);
    }


    setData(buffer: Float32Array, bufferOffset: number = 0, dataCount: number = Number.MAX_SAFE_INTEGER): void {
        if (dataCount < 0) return;
        this.bind();
        var needSubData: boolean = !(bufferOffset == 0 && dataCount == this.byteLength);
        if (needSubData) {
            bufferOffset*=4;
            var subData: Uint8Array = new Uint8Array(buffer.buffer, bufferOffset, dataCount);
            LayaGL.instance.bufferSubData(this._bufferType, bufferOffset, subData);
        }
        else {
            let gl = (LayaGL.instance as WebGL2RenderingContext);
             gl.bufferSubData(this._bufferType, bufferOffset,buffer,0,dataCount/4);
        }
    }

    setDataByUniformBufferData(bufferData: UnifromBufferData) {
        if (this.UpdateDataInfo == bufferData) {
            this.setData(bufferData._buffer, bufferData._updateFlag.x, (bufferData._updateFlag.y - bufferData._updateFlag.x)*4);
            bufferData._resetUpdateFlag();
        } else {
            this.setData(bufferData._buffer, 0, this.byteLength);
            bufferData._resetUpdateFlag();
            this.UpdateDataInfo = bufferData;
        }
    }



}