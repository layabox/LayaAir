import { BufferUsage, BufferTargetType } from "./RenderEnum/BufferTargetType";
import { SubUniformBufferData } from "./SubUniformBufferData";
import { UniformBufferBase } from "./UniformBufferBase";
import { UnifromBufferData } from "./UniformBufferData";
import { LayaGL } from "../layagl/LayaGL";
import { WebGLEngine } from "../RenderDriver/WebglDriver/RenderDevice/WebGLEngine";
import { GLBuffer } from "../RenderDriver/WebglDriver/RenderDevice/WebGLEngine/GLBuffer";
/**
 * 类封装WebGL2UniformBufferObect
 */
export class UniformBufferObject {
    static UBONAME_SCENE = "SceneUniformBlock";
    static UBONAME_CAMERA = "CameraUniformBlock";
    static UBONAME_SPRITE3D = "SpriteUniformBlock";
    static UBONAME_SHADOW = "ShadowUniformBlock";
    private static commonMap: string[] = ["CameraUniformBlock", "SceneUniformBlock", "SpriteUniformBlock", "ShadowUniformBlock"]

    /**@internal */
    private static _Map: Map<string, UniformBufferBase> = new Map<string, UniformBufferBase>();

    /**
     * create Uniform Buffer Base
     * @param name Uniform block name(must pitch Shader)
     * @param bufferUsage config usage
     * @param bytelength byte length
     * @returns 
     */
    static create(name: string, bufferUsage: number, bytelength: number, isSingle: boolean = false) {
        if (!UniformBufferObject._Map.get(name)) {
            UniformBufferObject._Map.set(name, new UniformBufferBase(name, WebGLEngine.instance.getUBOPointer(name), isSingle));
        }
        let bufferBase = UniformBufferObject._Map.get(name);
        if (bufferBase._singgle && bufferBase._mapArray.length > 0) {
            return null;
        } else {
            let ubo = LayaGL.renderOBJCreate.createUniformBufferObject(bufferBase._glPointerID, name, bufferUsage, bytelength, isSingle);
            if (bufferBase._singgle) bufferBase.add(ubo);
            return ubo;
        }
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


    _glBuffer: GLBuffer;//TODO
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
    bufferType: BufferTargetType;
    bufferUsage: BufferUsage;

    /**
     * @interanl
     */
    constructor(glPointer: number, name: string, bufferUsage: BufferUsage, byteLength: number, isSingle: boolean) {
        // super(BufferTargetType.UNIFORM_BUFFER, bufferUsage);
        this.bufferType = BufferTargetType.UNIFORM_BUFFER;
        this.bufferUsage = bufferUsage;
        this._glPointer = glPointer;
        this.byteLength = byteLength;
        this._name = name;
        this._isSingle = isSingle;
        this._glBuffer = WebGLEngine.instance.createBuffer(BufferTargetType.UNIFORM_BUFFER, bufferUsage);
        this.bind();
        if (this._isSingle)
            this._bindUniformBufferBase();
        this._glBuffer.setDataLength(this.byteLength);
    }

    /**
     * differcnt UBO bind Point
     * @internal
     */
    _bindUniformBufferBase() {
        this._glBuffer.bindBufferBase(this._glPointer);
    }

    /**
     * 绑定一段
     * @internal
     */
    _bindBufferRange(offset: number, byteCount: number) {
        this.bind();
        this._glBuffer.bindBufferRange(this._glPointer, offset, byteCount);
    }

    /**
     * 重置buffer长度
     * @param bytelength 
     */
    _reset(bytelength: number) {

        //destroy
        if (this._glBuffer) {
            this._glBuffer.destroy();
            this._glBuffer = null;
        }
        //create new
        this.byteLength = bytelength;
        this._glBuffer = WebGLEngine.instance.createBuffer(this.bufferType, this.bufferUsage);
        if (this._isSingle)
            this._bindUniformBufferBase();
        this._glBuffer.setDataLength(this.byteLength);
    }

    /**
     * @inheritDoc
     * @override
     */
    bind(): boolean {
        return this._glBuffer.bindBuffer();
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
            this._glBuffer.setData(subData, bufferOffset);
        }
        else {
            this._glBuffer.setDataEx(buffer, bufferOffset, buffer.length);
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
        this.bind();
        this._glBuffer.setDataEx(bufferData._buffer, offset * datalength, reallength / 4);
    }

    /**
     * @private
     */
    destroy(): void {
        //destroy
        if (this._glBuffer) {
            this._glBuffer.destroy();
            this._glBuffer = null;
        }
    }
}