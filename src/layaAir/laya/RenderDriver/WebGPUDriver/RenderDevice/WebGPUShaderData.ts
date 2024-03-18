import { Color } from "../../../maths/Color";
import { Matrix3x3 } from "../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Resource } from "../../../resource/Resource";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPUBindingInfoType, WebGPUUniformPropertyBindingInfo } from "./WebGPUCodeGenerator";
import { WebGPUInternalTex } from "./WebGPUInternalTex";
import { UniformBuffer } from "./WebGPUUniform/WebGPUUniformBuffer";
import { WebGPURenderCommandEncoder } from "./WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";

export class WebGPUShaderData extends ShaderData {
    /**@internal */
    _defineDatas: WebDefineDatas;
    /**@internal */
    _data: any = null;
    /**@internal */
    _name: string;
    /**@internal */
    protected _gammaColorMap: Map<number, Color>;

    private _infoId: number;
    private _uniformBuffer: UniformBuffer;
    private _bindGroup: GPUBindGroup;

    isStatic: boolean = false; //是否静态

    globalId: number;
    objectName: string = 'WebGPUShaderData';

    constructor(ownerResource: Resource = null) {
        super(ownerResource);
        this._data = {};
        this._gammaColorMap = new Map();
        this._defineDatas = new WebDefineDatas();

        //this.globalId = WebGPUGlobal.getId(this);
    }

    createUniformBuffer(info: WebGPUUniformPropertyBindingInfo, single: boolean = false) {
        if (single && this._uniformBuffer) return;
        if (info && info.uniform) {
            if (!this._uniformBuffer || this._infoId != info.uniform.globalId) {
                this._infoId = info.uniform.globalId;
                const gpuBuffer = WebGPURenderEngine._instance.gpuBufferMgr;
                this._uniformBuffer = new UniformBuffer(info.name, info.set, info.binding, info.uniform.size, gpuBuffer, this);
                for (let i = 0, len = info.uniform.items.length; i < len; i++) {
                    const uniform = info.uniform.items[i];
                    this._uniformBuffer.addUniform(uniform.id, uniform.name, uniform.type, uniform.offset, uniform.align, uniform.size, uniform.elements, uniform.count);
                }
                this._updateUniformData();
            }
        }
    };

    private _updateUniformData() {
        for (const idStr in this._data) {
            const id = Number(idStr);
            const value = this._data[idStr];
            this._uniformBuffer.setUniformData(id, value);
        }
    }

    /**
     * 清理缓存的BindGroup
     */
    clearBindGroup() {
        this._bindGroup = null;
    }

    /**
     * 绑定资源组
     * @param groupId 
     * @param name 
     * @param uniforms 
     * @param command 
     */
    bindGroup(groupId: number, name: string, uniforms: WebGPUUniformPropertyBindingInfo[], command: WebGPURenderCommandEncoder) {
        const device = WebGPURenderEngine._instance.getDevice();

        //如果没有缓存, 则创建一个BindGroup
        if (!this._bindGroup) {
            const bindGroupLayoutEntries = [];
            const bindGroupEntries = [];
            for (const item of uniforms) {
                switch (item.type) {
                    case WebGPUBindingInfoType.buffer:
                        if (item.uniform) {
                            if (!this._uniformBuffer) return false;
                            bindGroupLayoutEntries.push({
                                binding: item.binding,
                                visibility: item.visibility,
                                buffer: item.buffer,
                            });
                            bindGroupEntries.push(this._uniformBuffer.getGPUBindEntry());
                        }
                        break;
                    case WebGPUBindingInfoType.texture:
                        if (item.texture) {
                            const texture = this.getTexture(item.propertyId);
                            if (!texture) return false;
                            else {
                                bindGroupLayoutEntries.push({
                                    binding: item.binding,
                                    visibility: item.visibility,
                                    texture: item.texture,
                                });
                                bindGroupEntries.push({
                                    binding: item.binding,
                                    resource: (texture._texture as WebGPUInternalTex).getTextureView(),
                                });
                            }
                        }
                        break;
                    case WebGPUBindingInfoType.sampler:
                        if (item.sampler) {
                            const texture = this.getTexture(item.propertyId);
                            if (!texture) return false;
                            else {
                                bindGroupLayoutEntries.push({
                                    binding: item.binding,
                                    visibility: item.visibility,
                                    sampler: item.sampler,
                                });
                                bindGroupEntries.push({
                                    binding: item.binding,
                                    resource: (texture._texture as WebGPUInternalTex).sampler.source,
                                });
                            }
                        }
                        break;
                }
            }

            //创建绑定组
            const bindGroupLayoutDesc: GPUBindGroupLayoutDescriptor = { entries: bindGroupLayoutEntries };
            this._bindGroup = device.createBindGroup({
                label: name,
                layout: device.createBindGroupLayout(bindGroupLayoutDesc),
                entries: bindGroupEntries,
            });
            //console.log('create bindGroup', bindGroupLayoutDesc, bindGroupEntries, this._bindGroup);
        }

        //将绑定组附加到命令
        command.setBindGroup(groupId, this._bindGroup);
        return true;
    }

    /**
     * 上传数据
     */
    uploadUniform() {
        this._uniformBuffer.upload();
    }

    getData() {
        return this._data;
    }

    getDefineData() {
        return this._defineDatas;
    }

    /**
    * 增加Shader宏定义。
    * @param value 宏定义。
    */
    addDefine(define: ShaderDefine): void {
        this._defineDatas.add(define);
    }

    addDefines(define: WebDefineDatas): void {
        this._defineDatas.addDefineDatas(define);
    }

    /**
     * 移除Shader宏定义。
     * @param value 宏定义。
     */
    removeDefine(define: ShaderDefine): void {
        this._defineDatas.remove(define);
    }

    /**
     * 是否包含Shader宏定义。
     * @param value 宏定义。
     */
    hasDefine(define: ShaderDefine): boolean {
        return this._defineDatas.has(define);
    }

    /**
     * 清空宏定义。
     */
    clearDefine(): void {
        this._defineDatas.clear();
    }

    /**
     * 获取布尔。
     * @param index shader索引。
     * @return 布尔。
     */
    getBool(index: number): boolean {
        return this._data[index];
    }

    /**
     * 设置布尔。
     * @param index shader索引。
     * @param value 布尔。
     */
    setBool(index: number, value: boolean): void {
        if (this._data[index] == value) return;
        this._data[index] = value;
        if (this._uniformBuffer)
            this._uniformBuffer.setBool(index, value);
    }

    /**
     * 获取整形。
     * @param index shader索引。
     * @return 整形。
     */
    getInt(index: number): number {
        return this._data[index];
    }

    /**
     * 设置整型。
     * @param index shader索引。
     * @param value 整形。
     */
    setInt(index: number, value: number): void {
        if (this._data[index] == value) return;
        this._data[index] = value;
        if (this._uniformBuffer)
            this._uniformBuffer.setInt(index, value);
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
     * @param index shader索引。
     * @param value 浮点。
     */
    setNumber(index: number, value: number): void {
        if (this._data[index] == value) return;
        this._data[index] = value;
        if (this._uniformBuffer)
            this._uniformBuffer.setFloat(index, value);
    }

    /**
     * 获取Vector2向量。
     * @param index shader索引。
     * @return Vector2向量。
     */
    getVector2(index: number): Vector2 {
        return this._data[index];
    }

    /**
     * 设置Vector2向量。
     * @param index shader索引。
     * @param value Vector2向量。
     */
    setVector2(index: number, value: Vector2): void {
        const v2 = this._data[index];
        if (v2) {
            if (Vector2.equals(v2, value)) return;
            value.cloneTo(this._data[index]);
        } else this._data[index] = value.clone();
        if (this._uniformBuffer)
            this._uniformBuffer.setVector2(index, value);
    }

    /**
     * 获取Vector3向量。
     * @param index shader索引。
     * @return Vector3向量。
     */
    getVector3(index: number): Vector3 {
        return this._data[index];
    }

    /**
     * 设置Vector3向量。
     * @param index shader索引。
     * @param value Vector3向量。
     */
    setVector3(index: number, value: Vector3): void {
        const v3 = this._data[index];
        if (v3) {
            if (Vector3.equals(v3, value)) return;
            value.cloneTo(this._data[index]);
        } else this._data[index] = value.clone();
        if (this._uniformBuffer)
            this._uniformBuffer.setVector3(index, value);
    }

    /**
     * 获取向量。
     * @param index shader索引。
     * @return 向量。
     */
    getVector(index: number): Vector4 {
        return this._data[index];
    }

    /**
     * 设置向量。
     * @param index shader索引。
     * @param value 向量。
     */
    setVector(index: number, value: Vector4): void {
        const v4 = this._data[index]
        if (v4) {
            if (Vector4.equals(v4, value)) return;
            value.cloneTo(this._data[index]);
        } else this._data[index] = value.clone();
        if (this._uniformBuffer)
            this._uniformBuffer.setVector4(index, value);
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
        if (!value) return;
        if (this._data[index]) {
            const gammaColor = this._gammaColorMap.get(index);
            if ((this._data[index] as Color).equal(gammaColor))
                return;
            value.cloneTo(gammaColor);
            const linearColor = this._data[index];
            linearColor.x = Color.gammaToLinearSpace(value.r);
            linearColor.y = Color.gammaToLinearSpace(value.g);
            linearColor.z = Color.gammaToLinearSpace(value.b);
            linearColor.w = value.a;
            if (this._uniformBuffer)
                this._uniformBuffer.setVector4(index, linearColor);
        }
        else {
            const linearColor = new Vector4();
            linearColor.x = Color.gammaToLinearSpace(value.r);
            linearColor.y = Color.gammaToLinearSpace(value.g);
            linearColor.z = Color.gammaToLinearSpace(value.b);
            linearColor.w = value.a;
            this._data[index] = linearColor;
            this._gammaColorMap.set(index, value.clone());
            if (this._uniformBuffer)
                this._uniformBuffer.setVector4(index, linearColor);
        }
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
        const mat = this._data[index] as Matrix3x3;
        if (mat) {
            value.cloneTo(this._data[index]);
        } else this._data[index] = value.clone();
        if (this._uniformBuffer)
            this._uniformBuffer.setMatrix3x3(index, value);
    }

    /**
     * 获取矩阵。
     * @param index shader索引。
     * @return 矩阵。
     */
    getMatrix4x4(index: number): Matrix4x4 {
        return this._data[index];
    }

    /**
     * 设置矩阵。
     * @param index shader索引。
     * @param value 矩阵。
     */
    setMatrix4x4(index: number, value: Matrix4x4): void {
        const mat = this._data[index] as Matrix4x4;
        if (mat) {
            if (mat.equalsOtherMatrix(value)) return;
            value.cloneTo(this._data[index]);
        } else this._data[index] = value.clone();
        if (this._uniformBuffer)
            this._uniformBuffer.setMatrix4x4(index, value);
    }

    /**
     * 获取Buffer。
     * @param index shader索引。
     * @return
     */
    getBuffer(index: number): Float32Array {
        return this._data[index];
    }

    /**
     * 设置Buffer。
     * @param index shader索引。
     * @param value buffer数据。
     */
    setBuffer(index: number, value: Float32Array): void {
        this._data[index] = value;
        this._uniformBuffer.setBuffer(index, value);
    }

    /**
     * 设置纹理。
     * @param index shader索引。
     * @param value 纹理。
     */
    setTexture(index: number, value: BaseTexture): void {
        const lastValue: BaseTexture = this._data[index];
        if (lastValue === value) return;
        if (value) {
            const shaderDefine = WebGPURenderEngine._instance._texGammaDefine[index];
            if (shaderDefine && value && value.gammaCorrection > 1)
                this.addDefine(shaderDefine);
            else if (shaderDefine) this.removeDefine(shaderDefine);
        }
        //维护Reference
        this._data[index] = value;
        lastValue && lastValue._removeReference();
        value && value._addReference();
        this.clearBindGroup(); //清理绑定组（重建绑定）
    }

    // /**@internal */
    // _setInternalTexture(index: number, value: InternalTexture) {
    //     if (value) {
    //         const shaderDefine = WebGPURenderEngine._instance._texGammaDefine[index];
    //         if (shaderDefine && value && value.gammaCorrection > 1)
    //             this.addDefine(shaderDefine);
    //         else if (shaderDefine) this.removeDefine(shaderDefine);
    //     }
    //     this._data[index] = value;
    //     this.clearBindGroup();
    // }

    /**
     * 获取纹理。
     * @param index shader索引。
     * @return 纹理。
     */
    getTexture(index: number): BaseTexture {
        return this._data[index];
    }

    getSourceIndex(value: any): number {
        for (const i in this._data)
            if (this._data[i] == value)
                return Number(i);
        return -1;
    }

    cloneTo(dest: WebGPUShaderData): void {
        //TODO
    }

    /**
     * 克隆。
     * @return 克隆副本。
     */
    clone(): any {
        const dest: WebGPUShaderData = new WebGPUShaderData();
        this.cloneTo(dest);
        return dest;
    }

    destroy(): void {
        WebGPUGlobal.releaseId(this);
        super.destroy();
        //TODO
    }
}