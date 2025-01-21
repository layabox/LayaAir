import { Color } from "../../../maths/Color";
import { Matrix3x3 } from "../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Resource } from "../../../resource/Resource";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { WebGLEngine } from "../../WebGLDriver/RenderDevice/WebGLEngine";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../Design/ShaderDefine";
import { WebDefineDatas } from "./WebDefineDatas";
import { WebGLUniformBuffer } from "../../WebGLDriver/RenderDevice/WebGLUniformBuffer";
import { WebGLSubUniformBuffer } from "../../WebGLDriver/RenderDevice/WebGLSubUniformBuffer";
import { WebGLUniformBufferBase } from "../../WebGLDriver/RenderDevice/WebGLUniformBufferBase";
import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { WebGLCommandUniformMap } from "../../WebGLDriver/RenderDevice/WebGLCommandUniformMap";
import { Config } from "../../../../Config";

/**
 * 着色器数据类。
 */
export class WebGLShaderData extends ShaderData {
    /**@internal */
    protected _gammaColorMap: Map<number, Color>;
    /**@internal */
    _data: any = null;

    /** @internal */
    _defineDatas: WebDefineDatas = new WebDefineDatas();

    /** @internal */
    private _uniformBuffers: Map<string, WebGLUniformBuffer>;

    /** @internal */
    private _subUniformBuffers: Map<string, WebGLSubUniformBuffer>;

    /** @internal */
    private _uniformBuffersPropertyMap: Map<number, WebGLUniformBufferBase>;

    private _needCacheData: boolean = false;

    private _updateCacheArray: { [key: number]: any } = null;

    private _subUboBufferNumber: number;

    /**
     * @internal	
     */
    constructor(ownerResource: Resource = null) {
        super(ownerResource);
        this._initData();
    }

    /**
     * @internal
     */
    _initData(): void {
        this._data = {};
        this._updateCacheArray = {};
        this._gammaColorMap = new Map();
        this._uniformBuffers = new Map();
        this._subUniformBuffers = new Map();
        this._uniformBuffersPropertyMap = new Map();
    }

    /**
     * @param name 
     * @param uniformMap 
     * @returns 
     */
    createUniformBuffer(name: string, uniformMap: WebGLCommandUniformMap): void {
        if (!Config._uniformBlock || this._uniformBuffers.has(name)) {
            return;
        }
        //let uboBuffer = this._uniformBuffers.get(name);
        //create 
        this._needCacheData = true;
        let uboBuffer = new WebGLUniformBuffer(name);

        let uboPropertyMap = uniformMap._idata;
        uboPropertyMap.forEach(uniform => {
            uboBuffer.addUniform(uniform.id, uniform.uniformtype, uniform.arrayLength);
        });
        uboBuffer.create();
        this._uniformBuffers.set(name, uboBuffer);
        let id = Shader3D.propertyNameToID(name);
        this._data[id] = uboBuffer;
        uboPropertyMap.forEach(uniform => {
            let uniformId = uniform.id;
            let data = this._data[uniformId];
            if (data != null) {
                uboBuffer.setUniformData(uniformId, uniform.uniformtype, data);
            }
            this._uniformBuffersPropertyMap.set(uniformId, uboBuffer);
        });
    }

    updateUBOBuffer(name: string): void {
        if (!Config._uniformBlock) {
            return;
        }
        let buffer = this._uniformBuffers.get(name);
        for (var i in this._updateCacheArray) {
            let index = parseInt(i);
            let ubo = this._uniformBuffersPropertyMap.get(index);
            if (ubo) {
                (this._updateCacheArray[i] as Function).call(ubo, index, this._data[index]);
            }
        }
        this._updateCacheArray = {};
        buffer.needUpload && buffer.upload();
    }


    createSubUniformBuffer(name: string, uniformMap: Map<number, UniformProperty>) {

        let subBuffer = this._subUniformBuffers.get(name);
        if (subBuffer) {
            if (this._subUboBufferNumber < 2) {
                //update data
                for (var i in this._updateCacheArray) {
                    let index = parseInt(i);
                    let ubo = this._uniformBuffersPropertyMap.get(index);
                    if (ubo) {
                        (this._updateCacheArray[i] as Function).call(ubo, index, this._data[index]);
                    }
                }
                this._updateCacheArray = {};//clear
            } else {
                for (var i in uniformMap) {
                    let index = parseInt(i);
                    if (this._updateCacheArray[index]) {
                        (this._updateCacheArray[index] as Function).call(subBuffer, index, this._data[index]);
                    }

                }
            }
            return subBuffer;
        }

        let engine = WebGLEngine.instance;
        let mgr = engine.bufferMgr;

        let uniformBuffer = new WebGLSubUniformBuffer(name, uniformMap, mgr, this);
        this._subUboBufferNumber++;
        this._needCacheData = true;
        uniformBuffer.notifyGPUBufferChange();
        this._subUniformBuffers.set(name, uniformBuffer);

        let id = Shader3D.propertyNameToID(name);
        this._data[id] = uniformBuffer;

        uniformMap.forEach(uniform => {
            let uniformId = uniform.id;
            let data = this._data[uniformId];
            if (data != null) {
                uniformBuffer.setUniformData(uniformId, uniform.uniformtype, data);
            }
            this._uniformBuffersPropertyMap.set(uniformId, uniformBuffer);
        });
        return uniformBuffer;
    }



    /**
     * 注意!!!!!! 不要获得data之后直接设置值，设置值请使用set函数
     * @internal
     */
    getData(): any {
        return this._data;
    }

    /**
     * @ignore
     */
    addDefine(define: ShaderDefine): void {
        this._defineDatas.add(define);
    }

    addDefines(define: WebDefineDatas): void {
        this._defineDatas.addDefineDatas(define);
    }

    /**
     * @ignore
     */
    removeDefine(define: ShaderDefine): void {
        this._defineDatas.remove(define);
    }

    /**
     * @ignore
     */
    hasDefine(define: ShaderDefine): boolean {
        return this._defineDatas.has(define);
    }

    /**
     * @ignore
     */
    clearDefine(): void {
        this._defineDatas.clear();
    }

    clearData() {
        for (const key in this._data) {
            if (this._data[key] instanceof Resource) {
                this._data[key]._removeReference();
            }
        }

        this._uniformBuffersPropertyMap.clear();

        this._uniformBuffers.forEach(buffer => {
            buffer.destroy();
        });
        this._uniformBuffers.clear();

        this._subUniformBuffers.forEach(buffer => {
            buffer.destroy();
        });
        this._subUniformBuffers.clear();

        this._data = {};
        this._gammaColorMap.clear();

        this.clearDefine();
        this._needCacheData = false;
        this._subUboBufferNumber = 0;
    }



    /**
     * 获取布尔。
     * @param	index shader索引。
     * @return  布尔。
     */
    getBool(index: number): boolean {
        return this._data[index];
    }

    /**
     * 设置布尔。
     * @param	index shader索引。
     * @param	value 布尔。
     */
    setBool(index: number, value: boolean): void {
        this._data[index] = value;

        //let ubo = this._uniformBuffersPropertyMap.get(index);
        if (this._needCacheData) {
            // todo
            // ubo set bool
        }
    }

    /**
     * 获取整形。
     * @param	index shader索引。
     * @return  整形。
     */
    getInt(index: number): number {
        return this._data[index];
    }

    /**
     * 设置整型。
     * @param	index shader索引。
     * @param	value 整形。
     */
    setInt(index: number, value: number): void {
        this._data[index] = value;

        if (this._needCacheData) {
            this._updateCacheArray[index] = WebGLUniformBufferBase.prototype.setInt;
        }
    }

    /**
     * 获取浮点。
     * @param	index shader索引。
     * @return	浮点。
     */
    getNumber(index: number): number {
        return this._data[index];
    }

    /**
     * 设置浮点。
     * @param	index shader索引。
     * @param	value 浮点。
     */
    setNumber(index: number, value: number): void {
        this._data[index] = value;
        if (this._needCacheData) {
            this._updateCacheArray[index] = WebGLUniformBufferBase.prototype.setFloat;
        }
    }

    /**
     * 获取Vector2向量。
     * @param	index shader索引。
     * @return Vector2向量。
     */
    getVector2(index: number): Vector2 {
        return this._data[index];
    }

    /**
     * 设置Vector2向量。
     * @param	index shader索引。
     * @param	value Vector2向量。
     */
    setVector2(index: number, value: Vector2): void {
        if (this._data[index]) {
            value.cloneTo(this._data[index]);
        } else
            this._data[index] = value.clone();

        if (this._needCacheData) {
            this._updateCacheArray[index] = WebGLUniformBufferBase.prototype.setVector2;
        }
    }

    /**
     * 获取Vector3向量。
     * @param	index shader索引。
     * @return Vector3向量。
     */
    getVector3(index: number): Vector3 {
        return this._data[index];
    }

    /**
     * 设置Vector3向量。
     * @param	index shader索引。
     * @param	value Vector3向量。
     */
    setVector3(index: number, value: Vector3): void {
        if (this._data[index]) {
            value.cloneTo(this._data[index]);
        } else
            this._data[index] = value.clone();

        if (this._needCacheData) {
            this._updateCacheArray[index] = WebGLUniformBufferBase.prototype.setVector3;
        }
    }

    /**
     * 获取颜色。
     * @param 	index shader索引。
     * @return  向量。
     */
    getVector(index: number): Vector4 {
        return this._data[index];
    }

    /**
     * 设置向量。
     * @param	index shader索引。
     * @param	value 向量。
     */
    setVector(index: number, value: Vector4): void {
        if (this._data[index]) {
            value.cloneTo(this._data[index]);
        } else
            this._data[index] = value.clone();

        if (this._needCacheData) {
            this._updateCacheArray[index] = WebGLUniformBufferBase.prototype.setVector4;
        }
    }

    /**
     * 获取颜色
     * @param index 索引
     * @returns 颜色
     */
    getColor(index: number): Color {
        return this._gammaColorMap.get(index);
    }

    /**
     * 设置颜色
     * @param index 索引
     * @param value 颜色值
     */
    setColor(index: number, value: Color): void {
        if (!value)
            return;
        if (this._data[index]) {
            let gammaColor = this._gammaColorMap.get(index);
            value.cloneTo(gammaColor);
            let linearColor = this._data[index];
            linearColor.x = Color.gammaToLinearSpace(value.r);
            linearColor.y = Color.gammaToLinearSpace(value.g);
            linearColor.z = Color.gammaToLinearSpace(value.b);
            linearColor.w = value.a;
        }
        else {
            let linearColor = new Vector4();
            linearColor.x = Color.gammaToLinearSpace(value.r);
            linearColor.y = Color.gammaToLinearSpace(value.g);
            linearColor.z = Color.gammaToLinearSpace(value.b);
            linearColor.w = value.a;
            this._data[index] = linearColor;
            this._gammaColorMap.set(index, value.clone());
        }
        if (this._needCacheData) {
            this._updateCacheArray[index] = WebGLUniformBufferBase.prototype.setVector4;
        }
    }

    /**
     * @internal
     * @param index 
     */
    getLinearColor(index: number): Vector4 {
        return this._data[index];
    }

    /**
     * 获取矩阵。
     * @param	index shader索引。
     * @return  矩阵。
     */
    getMatrix4x4(index: number): Matrix4x4 {
        return this._data[index];
    }

    /**
     * 设置矩阵。
     * @param	index shader索引。
     * @param	value  矩阵。
     */
    setMatrix4x4(index: number, value: Matrix4x4): void {
        if (this._data[index]) {
            value.cloneTo(this._data[index]);
        } else {
            this._data[index] = value.clone();
        }

        if (this._needCacheData)
            this._updateCacheArray[index] = WebGLUniformBufferBase.prototype.setMatrix4x4;
    }

    /**
     * 获取矩阵
     * @param index 
     * @returns 
     */
    getMatrix3x3(index: number): Matrix3x3 {
        return this._data[index];
    }

    /**
     * 设置矩阵。
     * @param index 
     * @param value 
     */
    setMatrix3x3(index: number, value: Matrix3x3): void {
        if (this._data[index]) {
            value.cloneTo(this._data[index]);
        }
        else {
            this._data[index] = value.clone();
        }

        if (this._needCacheData) {
            this._updateCacheArray[index] = WebGLUniformBufferBase.prototype.setMatrix3x3;
        }
    }

    /**
     * 获取Buffer。
     * @param	index shader索引。
     * @return
     */
    getBuffer(index: number): Float32Array {
        return this._data[index];
    }

    /**
     * 设置Buffer。
     * @param	index shader索引。
     * @param	value  buffer数据。
     */
    setBuffer(index: number, value: Float32Array): void {
        this._data[index] = value;

        if (this._needCacheData) {
            this._updateCacheArray[index] = WebGLUniformBufferBase.prototype.setBuffer;
        }
    }

    /**
     * 设置纹理。
     * @param	index shader索引。
     * @param	value 纹理。
     */
    setTexture(index: number, value: BaseTexture): void {
        var lastValue: BaseTexture = this._data[index];
        if (value) {
            let shaderDefine = WebGLEngine._texGammaDefine[index];
            if (shaderDefine && value && value.gammaCorrection > 1) {
                this.addDefine(shaderDefine);
            }
            else {
                // todo 自动的
                shaderDefine && this.removeDefine(shaderDefine);
            }
        }
        //维护Reference
        this._data[index] = value;
        lastValue && lastValue._removeReference();
        value && value._addReference();
    }

    _setInternalTexture(index: number, value: InternalTexture) {
        var lastValue: InternalTexture = this._data[index];
        if (value) {
            let shaderDefine = WebGLEngine._texGammaDefine[index];
            if (shaderDefine && value && value.gammaCorrection > 1) {
                this.addDefine(shaderDefine);
            }
            else {
                // todo 自动的
                shaderDefine && this.removeDefine(shaderDefine);
            }
        }
        //维护Reference
        this._data[index] = value;
        // lastValue && lastValue._removeReference();
        // value && value._addReference();
    }

    /**
     * 获取纹理。
     * @param	index shader索引。
     * @return  纹理。
     */
    getTexture(index: number): BaseTexture {
        return this._data[index];
    }

    getSourceIndex(value: any) {
        for (var i in this._data) {
            if (this._data[i] == value)
                return Number(i);
        }
        return -1;
    }

    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: WebGLShaderData): void {
        destObject.clearData();
        var destData: { [key: string]: number | boolean | Vector2 | Vector3 | Vector4 | Matrix3x3 | Matrix4x4 | Resource } = destObject._data;

        for (var k in this._data) {//TODO:需要优化,杜绝is判断，慢
            var value: any = this._data[k];
            if (value != null) {
                if (typeof value == "number") {
                    destData[k] = value;
                } else if (typeof value == "boolean") {
                    destData[k] = value;
                } else if (value instanceof Vector2) {
                    let v2 = destData[k] || (destData[k] = new Vector2());
                    value.cloneTo(<Vector2>v2);
                } else if (value instanceof Vector3) {
                    let v3 = destData[k] || (destData[k] = new Vector3());
                    value.cloneTo(<Vector3>v3);
                } else if (value instanceof Vector4) {
                    let color = this.getColor(parseInt(k));
                    if (color) {
                        let clonecolor = color.clone();
                        destObject.setColor(parseInt(k), clonecolor);
                    } else {
                        let v4 = destData[k] || (destData[k] = new Vector4());
                        value.cloneTo(<Vector4>v4);
                    }
                }
                else if (value instanceof Matrix3x3) {
                    let mat = destData[k] || (destData[k] = new Matrix3x3());
                    value.cloneTo(<Matrix3x3>mat);
                }
                else if (value instanceof Matrix4x4) {
                    let mat = destData[k] || (destData[k] = new Matrix4x4());
                    value.cloneTo(<Matrix4x4>mat);
                } else if (value instanceof Resource) {
                    destData[k] = value;
                    value._addReference();
                }
            }
        }
        this._defineDatas.cloneTo(destObject._defineDatas);
        this._gammaColorMap.forEach((color, index) => {
            destObject._gammaColorMap.set(index, color.clone());
        });
    }

    getDefineData(): WebDefineDatas {
        return this._defineDatas;
    }

    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): WebGLShaderData {
        var dest: WebGLShaderData = new WebGLShaderData();
        this.cloneTo(dest);
        return dest;
    }

    destroy(): void {
        this.clearData();

        this._defineDatas.destroy();
        this._defineDatas = null;

        this._gammaColorMap.clear();
        this._gammaColorMap = null;
    }
}

