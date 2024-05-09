import { FilterMode } from "../../../RenderEngine/RenderEnum/FilterMode";
import { TextureFormat } from "../../../RenderEngine/RenderEnum/TextureFormat";
import { Color } from "../../../maths/Color";
import { Matrix3x3 } from "../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Resource } from "../../../resource/Resource";
import { Texture2D } from "../../../resource/Texture2D";
import { TextureCube } from "../../../resource/TextureCube";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPURenderBundle } from "./WebGPUBundle/WebGPURenderBundle";
import { WebGPUBindingInfoType, WebGPUUniformPropertyBindingInfo } from "./WebGPUCodeGenerator";
import { WebGPUInternalTex } from "./WebGPUInternalTex";
import { WebGPURenderCommandEncoder } from "./WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";
import { WebGPUTextureFormat } from "./WebGPUTextureContext";
import { WebGPUUniformBuffer } from "./WebGPUUniform/WebGPUUniformBuffer";
import { LayaGL } from "../../../layagl/LayaGL";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";

/**
 * 着色器数据
 */
export class WebGPUShaderData extends ShaderData {
    private static _dummyTexture2D: Texture2D; //替代贴图（2D）
    private static _dummyTextureCube: TextureCube; //替代贴图（Cube）
    /**@internal */
    _defineDatas: WebDefineDatas; //宏定义对象
    /**@internal */
    _data: any; //数据对象
    /**@internal */
    _name: string; //名称，便于调试
    /**@internal */
    protected _gammaColorMap: Map<number, Color>; //颜色矫正数据

    private _infoId: number; //WebGPUUniformPropertyBindingInfo数据的唯一标识
    private _uniformBuffer: WebGPUUniformBuffer; //Uniform缓冲区（负责上传数据到GPU）
    private _bindGroupMap: Map<string, [GPUBindGroup, GPUBindGroupLayoutEntry[]]>; //缓存的BindGroup
    private _bindGroup: GPUBindGroup; //缓存的BindGroup（非共享模式的着色器数据只可能有一个绑定组）
    private _bindGroupLayoutEntries: GPUBindGroupLayoutEntry[];
    bindGroupIsNew: boolean = false; //是否新建了bindGroup

    coShaderData: WebGPUShaderData[]; //伴随ShaderData，用于骨骼动画

    private _isShare: boolean = true; //是否共享模式，该ShaderData数据是否会被多个节点共享
    get isShare(): boolean {
        return this._isShare;
    }
    set isShare(value: boolean) {
        this._isShare = value;
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i].isShare = value;
    }
    private _isStatic: boolean = false; //是否静态，静态的节点会使用静态的大Buffer，减少上传次数
    get isStatic(): boolean {
        return this._isStatic;
    }
    set isStatic(value: boolean) {
        this._isStatic = value;
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i].isStatic = value;
    }
    changeMark: number = 0; //变化标记，用于标记预编译设置是否变化，如变化，值+1

    globalId: number;
    objectName: string = 'WebGPUShaderData';

    static __init__() {
        if (!this._dummyTexture2D) { //创建2D空白贴图（替代丢失的贴图）
            this._dummyTexture2D = new Texture2D(1, 1, TextureFormat.R8G8B8A8, false, true);
            const data = new Uint8Array([255, 255, 255, 255]);
            this._dummyTexture2D.setPixelsData(data, false, false);
            this._dummyTexture2D.lock = true;
        }
        if (!this._dummyTextureCube) { //创建Cube空白贴图（替代丢失的贴图）
            this._dummyTextureCube = new TextureCube(1, TextureFormat.R8G8B8A8, false, true);
            this._dummyTextureCube.lock = true;
        }
    }

    constructor(ownerResource: Resource = null) {
        super(ownerResource);
        this._data = {};
        this._gammaColorMap = new Map();
        this._bindGroupMap = new Map();
        this._defineDatas = new WebDefineDatas();

        this.globalId = WebGPUGlobal.getId(this);
    }

    /**
     * 创建UniformBuffer
     * @param info 
     * @param single 
     */
    createUniformBuffer(info: WebGPUUniformPropertyBindingInfo, single: boolean = false) {
        //如果指明了这种类型UniformBuffer是single的，则不会重复创建
        if (single && this._uniformBuffer) return;
        if (info && info.uniform) {
            //如果UniformBuffer还没有创建，或者创建UniformBuffer所使用的信息发生了变化，则创建
            if (!this._uniformBuffer || this._infoId !== info.uniform.globalId) {
                if (this._uniformBuffer)
                    this._uniformBuffer.destroy();
                this._infoId = info.uniform.globalId;
                const gpuBuffer = WebGPURenderEngine._instance.gpuBufferMgr;
                this._uniformBuffer = new WebGPUUniformBuffer(info.name, info.set, info.binding, info.uniform.size, gpuBuffer, this);
                for (let i = 0, len = info.uniform.items.length; i < len; i++) {
                    const uniform = info.uniform.items[i];
                    this._uniformBuffer.addUniform(uniform.propertyId, uniform.name, uniform.type, uniform.offset, uniform.align, uniform.size, uniform.element, uniform.count);
                }
                this._updateUniformData();
            }
        }
    };

    /**
     * 将数据更新到UniformBuffer中
     */
    private _updateUniformData() {
        for (const id in this._data) {
            const value = this._data[id];
            this._uniformBuffer.setUniformData(Number(id), value);
        }
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i]._updateUniformData();
    }

    /**
     * 清理缓存的BindGroup
     */
    clearBindGroup() {
        this._bindGroupMap.clear();
        this._bindGroup = null;
        this._bindGroupLayoutEntries = null;
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i].clearBindGroup();
    }

    /**
     * 创建绑定组项
     * @param info 
     */
    createBindGroupLayoutEntry(info: WebGPUUniformPropertyBindingInfo[]) {
        const bindGroupLayoutEntries = [];
        let internalTex: WebGPUInternalTex;
        for (const item of info) {
            switch (item.type) {
                case WebGPUBindingInfoType.buffer:
                    if (item.uniform) {
                        bindGroupLayoutEntries.push({
                            binding: item.binding,
                            visibility: item.visibility,
                            buffer: item.buffer,
                        });
                    }
                    break;
                case WebGPUBindingInfoType.texture:
                    if (item.texture) {
                        let texture = this.getTexture(item.propertyId) ?? WebGPUShaderData._dummyTexture2D;
                        if (item.texture.viewDimension === 'cube' && texture === WebGPUShaderData._dummyTexture2D)
                            texture = WebGPUShaderData._dummyTextureCube;
                        if (texture instanceof WebGPUInternalTex)
                            internalTex = texture;
                        else internalTex = texture._texture as WebGPUInternalTex;
                        if (!internalTex) { //保护措施
                            texture = WebGPUShaderData._dummyTexture2D;
                            internalTex = texture._texture as WebGPUInternalTex;
                        }
                        if (internalTex._webGPUFormat === WebGPUTextureFormat.depth16unorm
                            || internalTex._webGPUFormat === WebGPUTextureFormat.depth24plus_stencil8
                            || internalTex._webGPUFormat === WebGPUTextureFormat.depth32float)
                            item.texture.sampleType = 'unfilterable-float';
                        else {
                            const supportFloatLinearFiltering = LayaGL.renderEngine.getCapable(RenderCapable.Texture_FloatLinearFiltering);
                            if (!supportFloatLinearFiltering && texture.format === TextureFormat.R32G32B32A32)
                                item.texture.sampleType = 'unfilterable-float';
                            else item.texture.sampleType = 'float';
                            // if (texture.format === TextureFormat.R32G32B32A32)
                            //     item.texture.sampleType = 'unfilterable-float';
                            // else item.texture.sampleType = 'float';
                        }
                        bindGroupLayoutEntries.push({
                            binding: item.binding,
                            visibility: item.visibility,
                            texture: item.texture,
                        });
                    }
                    break;
                case WebGPUBindingInfoType.sampler:
                    if (item.sampler) {
                        let texture = this.getTexture(item.propertyId) ?? WebGPUShaderData._dummyTexture2D;
                        if (texture instanceof WebGPUInternalTex)
                            internalTex = texture;
                        else internalTex = texture._texture as WebGPUInternalTex;
                        if (!internalTex) {
                            texture = WebGPUShaderData._dummyTexture2D;
                            internalTex = texture._texture as WebGPUInternalTex;
                        }
                        // if (internalTex.compareMode > 0)
                        //     item.sampler.type = 'comparison';
                        // else 
                        if (internalTex._webGPUFormat === WebGPUTextureFormat.depth16unorm
                            || internalTex._webGPUFormat === WebGPUTextureFormat.depth24plus_stencil8
                            || internalTex._webGPUFormat === WebGPUTextureFormat.depth32float) {
                            item.sampler.type = 'non-filtering';
                            internalTex.filterMode = FilterMode.Point;
                        }
                        else {
                            const supportFloatLinearFiltering = LayaGL.renderEngine.getCapable(RenderCapable.Texture_FloatLinearFiltering);
                            if (!supportFloatLinearFiltering && texture.format === TextureFormat.R32G32B32A32)
                                item.sampler.type = 'non-filtering';
                            else item.sampler.type = 'filtering';
                            // if (internalTex._webGPUFormat === WebGPUTextureFormat.rgba32float) {
                            //     item.sampler.type = 'non-filtering';
                            //     internalTex.filterMode = FilterMode.Point;
                            // } else item.sampler.type = 'filtering';
                        }
                        bindGroupLayoutEntries.push({
                            binding: item.binding,
                            visibility: item.visibility,
                            sampler: item.sampler,
                        });
                    }
                    break;
            }
        }
        return bindGroupLayoutEntries;
    }

    /**
     * 绑定资源组
     * @param groupId 
     * @param name 
     * @param info 
     * @param command 
     * @param bundle 
     */
    bindGroup(groupId: number, name: string, info: WebGPUUniformPropertyBindingInfo[],
        command: WebGPURenderCommandEncoder, bundle?: WebGPURenderBundle) {
        const device = WebGPURenderEngine._instance.getDevice();

        //同一个ShaderData可能需要不同的bindGroup，因为某些ShaderData是共享的（比如Scene3D和Camera）
        //具体原因是bindGroup中还包含了texture和sampler，不同的RendlerElement共享了同一个ShaderData，
        //但是他们的texture和sampler是有可能不同的，比如使用了UnlitMaterial和BlinnPhongMaterial的渲染节点共享了
        //同一个Scene3D的ShaderData（对应bindGroup0），但UnlitMaterial不使用灯光，从而不使用u_lightButter，
        //但BlinnPhongMaterial使用灯光，使用u_lightBuffer贴图，因此这两个渲染节点的bindGroup0是不同的，
        //不同的bindGroup可以通过info中propertyId区分开来。

        let key;
        let bindGroup;
        let bindGroupLayoutEntries;

        //构建key，查找缓存bindGroup
        if (this.isShare) { //只有共享的ShaderData才可能会需要不同的bindGroup
            key = name + '_' + this._infoId + ' | ';
            for (let i = info.length - 1; i > -1; i--)
                key += info[i].propertyId + '_';
            const bindInfo = this._bindGroupMap.get(key); //根据Key查找缓存
            bindGroup = bindInfo ? bindInfo[0] : null;
            bindGroupLayoutEntries = bindInfo ? bindInfo[1] : null;
        } else {
            if (!this._bindGroup) { //首次创建
                key = name + '_' + this._infoId + ' | ';
                for (let i = info.length - 1; i > -1; i--)
                    key += info[i].propertyId + '_';
            }
            bindGroup = this._bindGroup;
            bindGroupLayoutEntries = this._bindGroupLayoutEntries;
        }

        //如果没有缓存, 则创建一个BindGroup
        if (!bindGroup) {
            bindGroupLayoutEntries = [];
            const bindGroupEntries = [];
            let internalTex: WebGPUInternalTex;
            for (const item of info) {
                switch (item.type) {
                    case WebGPUBindingInfoType.buffer:
                        if (item.uniform) {
                            if (!this._uniformBuffer) {
                                console.warn('uniformBuffer is null');
                                return null;
                            }
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
                            let texture = this.getTexture(item.propertyId) ?? WebGPUShaderData._dummyTexture2D;
                            if (item.texture.viewDimension === 'cube' && texture === WebGPUShaderData._dummyTexture2D)
                                texture = WebGPUShaderData._dummyTextureCube;
                            if (texture instanceof WebGPUInternalTex)
                                internalTex = texture;
                            else internalTex = texture._texture as WebGPUInternalTex;
                            if (!internalTex) {
                                texture = WebGPUShaderData._dummyTexture2D;
                                internalTex = texture._texture as WebGPUInternalTex;
                            }
                            if (internalTex._webGPUFormat === WebGPUTextureFormat.depth16unorm
                                || internalTex._webGPUFormat === WebGPUTextureFormat.depth24plus_stencil8
                                || internalTex._webGPUFormat === WebGPUTextureFormat.depth32float)
                                item.texture.sampleType = 'unfilterable-float';
                            else {
                                // todo different samplerType
                                // eg: uint, sint
                                const supportFloatLinearFiltering = LayaGL.renderEngine.getCapable(RenderCapable.Texture_FloatLinearFiltering);
                                if (!supportFloatLinearFiltering && texture.format === TextureFormat.R32G32B32A32)
                                    item.texture.sampleType = 'unfilterable-float';
                                else item.texture.sampleType = 'float';
                                // if (internalTex._webGPUFormat === WebGPUTextureFormat.rgba32float)
                                //     item.texture.sampleType = 'unfilterable-float';
                                // else item.texture.sampleType = 'float';
                            }
                            bindGroupLayoutEntries.push({
                                binding: item.binding,
                                visibility: item.visibility,
                                texture: item.texture,
                            });
                            bindGroupEntries.push({
                                binding: item.binding,
                                resource: internalTex.getTextureView(),
                            });
                        }
                        break;
                    case WebGPUBindingInfoType.sampler:
                        if (item.sampler) {
                            let texture = this.getTexture(item.propertyId) ?? WebGPUShaderData._dummyTexture2D;
                            if (texture instanceof WebGPUInternalTex)
                                internalTex = texture;
                            else internalTex = texture._texture as WebGPUInternalTex;
                            if (!internalTex) {
                                texture = WebGPUShaderData._dummyTexture2D;
                                internalTex = texture._texture as WebGPUInternalTex;
                            }
                            // if (internalTex.compareMode > 0)
                            //     item.sampler.type = 'comparison';
                            // else
                            if (internalTex._webGPUFormat === WebGPUTextureFormat.depth16unorm
                                || internalTex._webGPUFormat === WebGPUTextureFormat.depth24plus_stencil8
                                || internalTex._webGPUFormat === WebGPUTextureFormat.depth32float) {
                                item.sampler.type = 'non-filtering';
                                internalTex.filterMode = FilterMode.Point;
                            }
                            else {
                                const supportFloatLinearFiltering = LayaGL.renderEngine.getCapable(RenderCapable.Texture_FloatLinearFiltering);
                                if (!supportFloatLinearFiltering && texture.format === TextureFormat.R32G32B32A32)
                                    item.sampler.type = 'non-filtering';
                                else item.sampler.type = 'filtering';
                                // if (internalTex._webGPUFormat === WebGPUTextureFormat.rgba32float) {
                                //     item.sampler.type = 'non-filtering';
                                //     internalTex.filterMode = FilterMode.Point;
                                // } else item.sampler.type = 'filtering';
                            }
                            bindGroupLayoutEntries.push({
                                binding: item.binding,
                                visibility: item.visibility,
                                sampler: item.sampler,
                            });
                            bindGroupEntries.push({
                                binding: item.binding,
                                resource: internalTex.sampler.source,
                            });
                        }
                        break;
                }
            }

            //创建绑定组
            const bindGroupLayoutDesc: GPUBindGroupLayoutDescriptor = { entries: bindGroupLayoutEntries };
            bindGroup = device.createBindGroup({
                label: name + '_' + this._infoId,
                layout: device.createBindGroupLayout(bindGroupLayoutDesc),
                entries: bindGroupEntries,
            });

            //缓存绑定组
            if (this.isShare)
                this._bindGroupMap.set(key, [bindGroup, bindGroupLayoutEntries]);
            else {
                this._bindGroup = bindGroup;
                this._bindGroupLayoutEntries = bindGroupLayoutEntries;
            }
            this.bindGroupIsNew = true;
            //console.log('create bindGroup_' + WebGPUShaderData._bindGroupCounter++, key, bindGroupLayoutDesc, bindGroupEntries);
        } else this.bindGroupIsNew = false;

        //将绑定组附加到命令
        if (command)
            command.setBindGroup(groupId, bindGroup);
        if (bundle)
            bundle.setBindGroup(groupId, bindGroup);
        //返回绑定组结构（用于建立pipeline）
        return bindGroupLayoutEntries;
    }

    /**
     * 上传数据
     */
    uploadUniform() {
        if (this._uniformBuffer)
            this._uniformBuffer.upload();
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i].uploadUniform();
    }

    /**
     * 获取数据对象
     */
    getData() {
        return this._data;
    }

    /**
     * 获取宏定义数据
     */
    getDefineData() {
        return this._defineDatas;
    }

    /**
     * 增加Shader宏定义
     * @param value 宏定义
     */
    addDefine(define: ShaderDefine) {
        if (!this._defineDatas.has(define)) {
            this._defineDatas.add(define);
            this.changeMark++;
            if (this.coShaderData)
                for (let i = this.coShaderData.length - 1; i > -1; i--)
                    this.coShaderData[i].addDefine(define);
        }
    }
    addDefines(define: WebDefineDatas) {
        this._defineDatas.addDefineDatas(define);
        this.changeMark++;
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i].addDefines(define);
    }

    /**
     * 移除Shader宏定义
     * @param value 宏定义
     */
    removeDefine(define: ShaderDefine) {
        if (this._defineDatas.has(define)) {
            this._defineDatas.remove(define);
            this.changeMark++;
            if (this.coShaderData)
                for (let i = this.coShaderData.length - 1; i > -1; i--)
                    this.coShaderData[i].removeDefine(define);
        }
    }

    /**
     * 是否包含Shader宏定义
     * @param value 宏定义
     */
    hasDefine(define: ShaderDefine) {
        return this._defineDatas.has(define);
    }

    /**
     * 清空宏定义
     */
    clearDefine() {
        this._defineDatas.clear();
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i].clearDefine();
    }

    /**
     * 获取布尔
     * @param index shader索引
     * @return 布尔
     */
    getBool(index: number): boolean {
        return this._data[index];
    }

    /**
     * 设置布尔
     * @param index shader索引
     * @param value 布尔
     */
    setBool(index: number, value: boolean) {
        if (this._data[index] === value) return;
        this._data[index] = value;
        if (this._uniformBuffer)
            this._uniformBuffer.setBool(index, value);
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i].setBool(index, value);
    }

    /**
     * 获取整型
     * @param index shader索引
     * @return 整型
     */
    getInt(index: number): number {
        return this._data[index];
    }

    /**
     * 设置整型
     * @param index shader索引
     * @param value 整型
     */
    setInt(index: number, value: number) {
        if (this._data[index] === value) return;
        this._data[index] = value;
        if (this._uniformBuffer)
            this._uniformBuffer.setInt(index, value);
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i].setInt(index, value);
    }

    /**
     * 获取浮点
     * @param index shader索引
     * @return 浮点
     */
    getNumber(index: number): number {
        return this._data[index];
    }

    /**
     * 设置浮点
     * @param index shader索引
     * @param value 浮点
     */
    setNumber(index: number, value: number) {
        if (this._data[index] === value) return;
        this._data[index] = value;
        if (this._uniformBuffer)
            this._uniformBuffer.setFloat(index, value);
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i].setNumber(index, value);
    }

    /**
     * 获取Vector2向量
     * @param index shader索引
     * @return Vector2向量
     */
    getVector2(index: number): Vector2 {
        return this._data[index];
    }

    /**
     * 设置Vector2向量
     * @param index shader索引
     * @param value Vector2向量
     */
    setVector2(index: number, value: Vector2) {
        const v2 = this._data[index];
        if (v2) {
            if (Vector2.equals(v2, value)) return;
            value.cloneTo(this._data[index]);
        } else this._data[index] = value.clone();
        if (this._uniformBuffer)
            this._uniformBuffer.setVector2(index, value);
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i].setVector2(index, value);
    }

    /**
     * 获取Vector3向量
     * @param index shader索引
     * @return Vector3向量
     */
    getVector3(index: number): Vector3 {
        return this._data[index];
    }

    /**
     * 设置Vector3向量
     * @param index shader索引
     * @param value Vector3向量
     */
    setVector3(index: number, value: Vector3) {
        const v3 = this._data[index];
        if (v3) {
            if (Vector3.equals(v3, value)) return;
            value.cloneTo(this._data[index]);
        } else this._data[index] = value.clone();
        if (this._uniformBuffer)
            this._uniformBuffer.setVector3(index, value);
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i].setVector3(index, value);
    }

    /**
     * 获取向量
     * @param index shader索引
     * @return 向量
     */
    getVector(index: number): Vector4 {
        return this._data[index];
    }

    /**
     * 设置向量
     * @param index shader索引
     * @param value 向量
     */
    setVector(index: number, value: Vector4) {
        const v4 = this._data[index]
        if (v4) {
            if (Vector4.equals(v4, value)) return;
            value.cloneTo(this._data[index]);
        } else this._data[index] = value.clone();
        if (this._uniformBuffer)
            this._uniformBuffer.setVector4(index, value);
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i].setVector(index, value);
    }

    /**
     * 获取颜色
     * @param index 索引
     * @returns 颜色
     */
    getColor(index: number) {
        return this._gammaColorMap.get(index);
    }

    /**
     * 设置颜色
     * @param index 索引
     * @param value 颜色值
     */
    setColor(index: number, value: Color) {
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
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i].setColor(index, value);
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
     * 设置矩阵
     * @param index 
     * @param value 
     */
    setMatrix3x3(index: number, value: Matrix3x3) {
        const mat = this._data[index] as Matrix3x3;
        if (mat)
            value.cloneTo(this._data[index]);
        else this._data[index] = value.clone();
        if (this._uniformBuffer)
            this._uniformBuffer.setMatrix3x3(index, value);
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i].setMatrix3x3(index, value);
    }

    /**
     * 获取矩阵
     * @param index shader索引
     * @return 矩阵
     */
    getMatrix4x4(index: number): Matrix4x4 {
        return this._data[index];
    }

    /**
     * 设置矩阵
     * @param index shader索引
     * @param value 矩阵
     */
    setMatrix4x4(index: number, value: Matrix4x4) {
        const mat = this._data[index] as Matrix4x4;
        if (mat) {
            if (mat.equalsOtherMatrix(value)) return;
            value.cloneTo(this._data[index]);
        } else this._data[index] = value.clone();
        if (this._uniformBuffer)
            this._uniformBuffer.setMatrix4x4(index, value);
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i].setMatrix4x4(index, value);
    }

    /**
     * 获取Buffer
     * @param index shader索引
     * @return
     */
    getBuffer(index: number): Float32Array {
        return this._data[index];
    }

    /**
     * 设置Buffer
     * @param index shader索引
     * @param value buffer数据
     */
    setBuffer(index: number, value: Float32Array) {
        this._data[index] = value;
        if (this._uniformBuffer)
            this._uniformBuffer.setBuffer(index, value);
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i].setBuffer(index, value);
    }

    /**
     * 设置纹理
     * @param index shader索引
     * @param value 纹理
     */
    setTexture(index: number, value: BaseTexture) {
        const lastValue = this._data[index];
        if (lastValue == value) return; //null or undefined
        if (value) {
            const shaderDefine = WebGPURenderEngine._instance._texGammaDefine[index];
            if (shaderDefine) {
                if (value.gammaCorrection > 1)
                    this.addDefine(shaderDefine);
                else this.removeDefine(shaderDefine);
            }
        }
        if ((!lastValue && value) || (lastValue && !value))
            this.changeMark++;
        this._data[index] = value;
        lastValue && lastValue._removeReference();
        value && value._addReference();
        this.clearBindGroup(); //清理绑定组（重建绑定）
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i].setTexture(index, value);
    }

    /**
     * 设置内部纹理
     * @param index shader索引
     * @param value 纹理
     */
    _setInternalTexture(index: number, value: InternalTexture) {
        const lastValue = this._data[index];
        if (lastValue == value) return;
        if (value) {
            const shaderDefine = WebGPURenderEngine._instance._texGammaDefine[index];
            if (shaderDefine) {
                if (value.gammaCorrection > 1)
                    this.addDefine(shaderDefine);
                else this.removeDefine(shaderDefine);
            }
        }
        if ((!lastValue && value) || (lastValue && !value))
            this.changeMark++;
        this._data[index] = value;
        this.clearBindGroup(); //清理绑定组（重建绑定）
        if (this.coShaderData)
            for (let i = this.coShaderData.length - 1; i > -1; i--)
                this.coShaderData[i]._setInternalTexture(index, value);
    }

    /**
     * 获取纹理
     * @param index shader索引
     * @return 纹理
     */
    getTexture(index: number): BaseTexture {
        return this._data[index];
    }

    getSourceIndex(value: any) {
        for (const i in this._data)
            if (this._data[i] === value)
                return Number(i);
        return -1;
    }

    /**
     * 克隆
     * @param dest 
     */
    cloneTo(dest: WebGPUShaderData) {
        dest._data = {};
        for (const id in this._data) {
            dest._data[id] = this._data[id];
            if (dest._uniformBuffer)
                dest._uniformBuffer.setUniformData(Number(id), this._data[id]);
        }
        dest._defineDatas.clear();
        this._defineDatas.cloneTo(dest._defineDatas);

        dest._gammaColorMap.clear();
        this._gammaColorMap.forEach((value, key) => { dest._gammaColorMap.set(key, value); });

        dest._infoId = this._infoId;
        dest._isShare = this._isShare;
        dest._isStatic = this._isStatic;
        dest.changeMark = this.changeMark;
    }

    /**
     * 克隆
     */
    clone() {
        const dest = new WebGPUShaderData();
        this.cloneTo(dest);
        return dest;
    }

    _releaseUBOData() { }

    /**
     * 销毁
     */
    destroy() {
        WebGPUGlobal.releaseId(this);
        this.clearBindGroup();
    }
}