import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Matrix3x3 } from "../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { FilterMode } from "../../../RenderEngine/RenderEnum/FilterMode";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { TextureFormat } from "../../../RenderEngine/RenderEnum/TextureFormat";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "../../../resource/Material";
import { Resource } from "../../../resource/Resource";
import { Texture } from "../../../resource/Texture";
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

/**
 * 缓存的绑定组
 */
class WebGPUBindGroupCacheItem {
    bg: GPUBindGroup;
    bgLayouts: GPUBindGroupLayoutEntry[];
    refNum: number;
    timer: number;

    constructor(bg: GPUBindGroup, bgLayouts: GPUBindGroupLayoutEntry[]) {
        this.bg = bg;
        this.bgLayouts = bgLayouts;
        this.refNum = 1;
        this.timer = 0;
    }
}

/**
 * 着色器数据
 */
export class WebGPUShaderData extends ShaderData {
    private static _bindGroupCounter: number = 0;
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

    stateKey: string = ''; //状态标识符
    private static _stateKeyMap: Set<number>;

    private _recovered: boolean = false; //是否已经回收
    private _destroyed: boolean = false; //是否已经销毁

    private _infoId: number; //WebGPUUniformPropertyBindingInfo数据的唯一标识
    private _uniformBuffer: WebGPUUniformBuffer; //Uniform缓存区（负责上传数据到GPU）
    private _bindGroupItem: WebGPUBindGroupCacheItem; //缓存的BindGroup
    private _bindGroupChange: boolean; //BindGroup是否可能变化
    private _bindInfoId: number; //绑定组的数据唯一标识

    private _elementType: number = 0; //Element类型 (3D=0, 3DSkin=1, 3DInstance=2, 2D=3)
    private _texIdSet: Set<number>; //所有贴图Id

    //伴随ShaderData
    skinShaderData: WebGPUShaderData[]; //用于骨骼动画
    instShaderData: WebGPUShaderData; //用于Instance

    private _isShare: boolean = true; //是否共享模式，该ShaderData数据是否会被多个节点共享
    get isShare(): boolean {
        return this._isShare;
    }
    set isShare(value: boolean) {
        this._isShare = value;
        if (this.instShaderData)
            this.instShaderData.isShare = value;
        if (this.skinShaderData)
            for (let i = this.skinShaderData.length - 1; i > -1; i--)
                this.skinShaderData[i].isShare = value;
    }
    private _isStatic: boolean = false; //是否静态，静态的节点会使用静态的大Buffer，减少上传次数
    get isStatic(): boolean {
        return this._isStatic;
    }
    set isStatic(value: boolean) {
        this._isStatic = value;
        if (this.instShaderData)
            this.instShaderData.isStatic = value;
        if (this.skinShaderData)
            for (let i = this.skinShaderData.length - 1; i > -1; i--)
                this.skinShaderData[i].isStatic = value;
    }
    changeMark: number = 0; //变化标记，用于标记预编译设置是否变化，如变化，值+1

    globalId: number;
    objectName: string = 'WebGPUShaderData';
    private static _objectCount: number = 0; //对象计数器

    /**
     * 全局缓存的BindGroup
     */
    private static _MAX_BIND_GROUP_NUM: number = 10; //超过该数后会进行清理
    private static _BIND_GROUP_CLEAR_INTERVAL: number = 10000; //清理BindGroup的时间间隔（10秒）
    private static _clearBindGroupTimeStamp: number = 0; //清理缓存的时间戳
    private static _bindGroupMap: Map<string, WebGPUBindGroupCacheItem> = new Map();
    static getBindGroup(key: string) {
        return this._bindGroupMap.get(key);
    }
    static setBindGroup(key: string, value: WebGPUBindGroupCacheItem) {
        this._bindGroupMap.set(key, value);
    }

    /**
     * 本地缓存的UniformBuffer，由于UniformBuffer在数据结构相同的情况下具体数据可能不同，
     * 渲染节点可能使用相同数据结构，不同数据内容的UniformBuffer，因此不能用数据结构的key区分不同的UniformBuffer，
     * 将UniformBuffer缓存到本地，相当于不同的ShaderData拥有不同的UniformBuffer，不会混淆
     */
    private _uniformBufferMap: Map<number, WebGPUUniformBuffer> = new Map();
    _getUniformBuffer(key: number) {
        return this._uniformBufferMap.get(key);
    }
    _setUniformBuffer(key: number, value: WebGPUUniformBuffer) {
        this._uniformBufferMap.set(key, value);
    }

    /**
     * 全局初始化
     */
    static __init__() {
        if (!this._dummyTexture2D) { //创建2D空白贴图（替代丢失的贴图）
            this._dummyTexture2D = new Texture2D(1, 1, TextureFormat.R8G8B8A8, false, true, false, false);
            this._dummyTexture2D.setPixelsData(new Uint8Array([255, 255, 255, 255]), false, false);
            this._dummyTexture2D.lock = true;

        }
        if (!this._dummyTextureCube) { //创建Cube空白贴图（替代丢失的贴图）
            this._dummyTextureCube = new TextureCube(1, TextureFormat.R8G8B8A8, false, false, false);
            this._dummyTextureCube.lock = true;
        }
        Material.__initDefine__();
        this._stateKeyMap = new Set();
        this._stateKeyMap.add(Shader3D.BLEND);
        this._stateKeyMap.add(Shader3D.BLEND_EQUATION);
        this._stateKeyMap.add(Shader3D.BLEND_SRC);
        this._stateKeyMap.add(Shader3D.BLEND_DST);
        this._stateKeyMap.add(Shader3D.DEPTH_WRITE);
        this._stateKeyMap.add(Shader3D.DEPTH_TEST);
        this._stateKeyMap.add(Shader3D.STENCIL_TEST);
        this._stateKeyMap.add(Shader3D.STENCIL_Op);
        this._stateKeyMap.add(Shader3D.STENCIL_Ref);
        this._stateKeyMap.add(Shader3D.STENCIL_WRITE);
    }

    /**
     * 对象池
     */
    private static _pool: WebGPUShaderData[] = [];
    static create(ownerResource: Resource = null, elementType: number = 0) {
        const obj = this._pool.pop() ?? new WebGPUShaderData(ownerResource);
        obj._elementType = elementType;
        obj._recovered = false;
        return obj;
    }
    recover(clear: boolean = false) {
        this._recovered = true;
        clear && this.clear();
        WebGPUShaderData._pool.push(this);
    }

    /**
     * 帧结束时做一些处理
     */
    static endFrame() {
        const currTimer = Laya.timer.currTimer;

        //清理过期的BindGroup缓存
        if (this._bindGroupMap.size > this._MAX_BIND_GROUP_NUM
            && currTimer - this._clearBindGroupTimeStamp > this._BIND_GROUP_CLEAR_INTERVAL) {
            this._clearBindGroupTimeStamp = currTimer;
            const needToRemove: string[] = [];
            this._bindGroupMap.forEach((v, k) => {
                if (v.refNum <= 0) {
                    v.timer++;
                    if (v.timer > 10) //删除超过10个处理周期没有被使用的缓存
                        needToRemove.push(k);
                }
            });
            for (let i = needToRemove.length - 1; i > -1; i--)
                this._bindGroupMap.delete(needToRemove[i]);
        }
    }

    /**
     * 不允许直接创建，只能通过对象池
     * @param ownerResource 
     */
    private constructor(ownerResource: Resource = null) {
        super(ownerResource);
        this._data = {};
        this._gammaColorMap = new Map();
        this._texIdSet = new Set();
        this._defineDatas = new WebDefineDatas();

        this.globalId = WebGPUGlobal.getId(this);
        WebGPUShaderData._objectCount++;
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
            if (this._infoId !== info.id) {
                this._infoId = info.id;
                this._uniformBuffer = this._getUniformBuffer(this._infoId); //先尝试从缓存中获取
                if (!this._uniformBuffer) { //缓存中没有，创建一个
                    const gpuBuffer = WebGPURenderEngine._instance.gpuBufferMgr;
                    this._uniformBuffer = new WebGPUUniformBuffer(info.name, info.set, info.binding, info.uniform.size, gpuBuffer, this);
                    for (let i = 0, len = info.uniform.items.length; i < len; i++) {
                        const uniform = info.uniform.items[i];
                        this._uniformBuffer.addUniform(uniform.propertyId, uniform.name, uniform.type, uniform.offset, uniform.align, uniform.size, uniform.element, uniform.count);
                    }
                    this._setUniformBuffer(this._infoId, this._uniformBuffer);
                    let log = 'createUniformBuffer: ' + this._infoId + '|' + info.name + ', set = ' + info.set + ', binding = ' + info.binding + ', size = ' + info.uniform.size;
                    if (WebGPUGlobal.useBigBuffer)
                        log += ', offset = ', this._uniformBuffer.offset;
                    console.log(log);
                }
                this._updateUniformData();
                this._bindGroupChange = true;
            }
        }
    }

    /**
     * 将数据更新到UniformBuffer中
     */
    private _updateUniformData() {
        if (this._uniformBuffer)
            for (const id in this._data)
                this._uniformBuffer.setUniformData(Number(id), this._data[id]);
        this.instShaderData?._updateUniformData();
        if (this.skinShaderData)
            for (let i = this.skinShaderData.length - 1; i > -1; i--)
                this.skinShaderData[i]._updateUniformData();
        //console.log('updateUniformData');
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
                        if (internalTex.compareMode > 0)
                            item.texture.sampleType = 'depth';
                        else if (internalTex._webGPUFormat === WebGPUTextureFormat.depth16unorm
                            || internalTex._webGPUFormat === WebGPUTextureFormat.depth24plus_stencil8
                            || internalTex._webGPUFormat === WebGPUTextureFormat.depth32float) {
                            item.texture.sampleType = 'unfilterable-float';
                        } else {
                            const supportFloatLinearFiltering = LayaGL.renderEngine.getCapable(RenderCapable.Texture_FloatLinearFiltering);
                            if (!supportFloatLinearFiltering && texture.format === TextureFormat.R32G32B32A32)
                                item.texture.sampleType = 'unfilterable-float';
                            else item.texture.sampleType = 'float';
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
                        if (internalTex.compareMode > 0)
                            item.sampler.type = 'comparison';
                        else if (internalTex._webGPUFormat === WebGPUTextureFormat.depth16unorm
                            || internalTex._webGPUFormat === WebGPUTextureFormat.depth24plus_stencil8
                            || internalTex._webGPUFormat === WebGPUTextureFormat.depth32float) {
                            if (item.sampler.type !== 'non-filtering') {
                                item.sampler.type = 'non-filtering';
                                internalTex.filterMode = FilterMode.Point;
                            }
                        } else {
                            const supportFloatLinearFiltering = LayaGL.renderEngine.getCapable(RenderCapable.Texture_FloatLinearFiltering);
                            if (!supportFloatLinearFiltering && texture.format === TextureFormat.R32G32B32A32) {
                                if (item.sampler.type !== 'non-filtering') {
                                    item.sampler.type = 'non-filtering';
                                    internalTex.filterMode = FilterMode.Point;
                                }
                            } else if (item.sampler.type !== 'filtering') {
                                item.sampler.type = 'filtering';
                                internalTex.filterMode = FilterMode.Bilinear;
                            }
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
        //具体原因是bindGroup中还包含了texture和sampler，不同的RenderElement共享了同一个ShaderData，
        //但是他们的texture和sampler是有可能不同的，比如使用了UnlitMaterial和BlinnPhongMaterial的渲染节点共享了
        //同一个Scene3D的ShaderData（对应bindGroup0），但UnlitMaterial不使用灯光，从而不使用u_lightBuffer，
        //但BlinnPhongMaterial使用灯光，使用u_lightBuffer贴图，因此这两个渲染节点的bindGroup0是不同的，
        //不同的bindGroup可以通过info中propertyId区分出来。

        const _createBindGroupEntry = (info: WebGPUUniformPropertyBindingInfo[], bindGroupEntries: any[]) => {
            let internalTex: WebGPUInternalTex;
            for (const item of info) {
                switch (item.type) {
                    case WebGPUBindingInfoType.buffer:
                        if (item.uniform) {
                            if (!this._uniformBuffer) {
                                console.warn('uniformBuffer is null');
                                bindGroupEntries.length = 0;
                            }
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
                            if (!internalTex) { //保护措施
                                texture = WebGPUShaderData._dummyTexture2D;
                                internalTex = texture._texture as WebGPUInternalTex;
                            }
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
                            bindGroupEntries.push({
                                binding: item.binding,
                                resource: internalTex.sampler.source,
                            });
                        }
                        break;
                }
            }
        }

        //查找缓存
        let key = '';
        if (this._bindGroupChange || this._bindInfoId !== info[0].id) {
            this._bindGroupChange = false;
            this._bindInfoId = info[0].id;
            key += this._uniformBuffer.id + '_';
            if (WebGPUGlobal.useBigBuffer)
                key += this._uniformBuffer.offset + '_';
            for (let i = 0, len = info.length; i < len; i++)
                key += info[i].propertyId + '_';
            this._texIdSet.forEach(id => key += id + '_');
            key += this._elementType;
            const cache = WebGPUShaderData.getBindGroup(key);
            if (cache) {
                if (cache !== this._bindGroupItem) {
                    if (this._bindGroupItem)
                        this._bindGroupItem.refNum--;
                    this._bindGroupItem = cache;
                    cache.refNum++;
                    cache.timer = 0;
                }
            } else {
                if (this._bindGroupItem)
                    this._bindGroupItem.refNum--;
                this._bindGroupItem = null;
            }
        }

        //如果没有从缓存中找到, 则创建一个bindGroup
        if (!this._bindGroupItem) {
            const bindGroupLayoutEntries = this.createBindGroupLayoutEntry(info);
            const bindGroupEntries: any[] = [];
            _createBindGroupEntry(info, bindGroupEntries);
            if (bindGroupEntries.length === 0) return null;

            //创建绑定组
            const bindGroupLayoutDesc: GPUBindGroupLayoutDescriptor = { entries: bindGroupLayoutEntries };
            const bindGroup = device.createBindGroup({
                label: name + '_' + this._infoId + ' ' + key,
                layout: device.createBindGroupLayout(bindGroupLayoutDesc),
                entries: bindGroupEntries,
            });

            this._bindGroupItem = new WebGPUBindGroupCacheItem(bindGroup, bindGroupLayoutEntries);

            //缓存绑定组
            WebGPUShaderData.setBindGroup(key, this._bindGroupItem);
            console.log('create bindGroup_' + WebGPUShaderData._bindGroupCounter++, key, this._bindGroupItem);
        }

        //将绑定组附加到命令
        command?.setBindGroup(groupId, this._bindGroupItem.bg);
        bundle?.setBindGroup(groupId, this._bindGroupItem.bg);

        //返回绑定组结构（用于建立pipeline）
        return this._bindGroupItem.bgLayouts;
    }

    /**
     * 上传数据
     */
    uploadUniform() {
        this._uniformBuffer?.upload();
        this.instShaderData?.uploadUniform();
        if (this.skinShaderData)
            for (let i = this.skinShaderData.length - 1; i > -1; i--)
                this.skinShaderData[i].uploadUniform();
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
            const names1: string[] = [];
            Shader3D._getNamesByDefineData(this._defineDatas, names1);

            this._defineDatas.add(define);
            this.changeMark++;

            const names2: string[] = [];
            Shader3D._getNamesByDefineData(this._defineDatas, names2);
            const names: string[] = [];
            for (const item of names1) {
                if (!names2.includes(item)) {
                    names.push(item);
                }
            }
            for (const item of names2) {
                if (!names1.includes(item)) {
                    names.push(item);
                }
            }

            this.instShaderData?.addDefine(define);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].addDefine(define);
            //console.log('addDefine =', names);
        }
    }
    addDefines(defines: WebDefineDatas) {
        this._defineDatas.addDefineDatas(defines);
        this.changeMark++;

        const names: string[] = [];
        Shader3D._getNamesByDefineData(defines, names);

        this.instShaderData?.addDefines(defines);
        if (this.skinShaderData)
            for (let i = this.skinShaderData.length - 1; i > -1; i--)
                this.skinShaderData[i].addDefines(defines);
        //console.log('addDefines =', names);
    }

    /**
     * 移除Shader宏定义
     * @param value 宏定义
     */
    removeDefine(define: ShaderDefine) {
        if (this._defineDatas.has(define)) {
            const names1: string[] = [];
            Shader3D._getNamesByDefineData(this._defineDatas, names1);

            this._defineDatas.remove(define);
            this.changeMark++;

            const names2: string[] = [];
            Shader3D._getNamesByDefineData(this._defineDatas, names2);
            const names: string[] = [];
            for (const item of names1) {
                if (!names2.includes(item)) {
                    names.push(item);
                }
            }
            for (const item of names2) {
                if (!names1.includes(item)) {
                    names.push(item);
                }
            }
            this.instShaderData?.removeDefine(define);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].removeDefine(define);
            //console.log('removeDefine =', names);
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
        this.instShaderData?.clearDefine();
        if (this.skinShaderData)
            for (let i = this.skinShaderData.length - 1; i > -1; i--)
                this.skinShaderData[i].clearDefine();
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
        if (this._data[index] !== value) {
            this._data[index] = value;
            this._uniformBuffer?.setBool(index, value);
            this.instShaderData?.setBool(index, value);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].setBool(index, value);
            //console.log('setBool');
        }
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

        //更新状态标识符
        if (WebGPUShaderData._stateKeyMap.has(index)) {
            this.stateKey = '<';
            this.stateKey += (this._data[Shader3D.BLEND] ?? 'x') + '_';
            this.stateKey += (this._data[Shader3D.BLEND_EQUATION] ?? 'x') + '_';
            this.stateKey += (this._data[Shader3D.BLEND_SRC] ?? 'x') + '_';
            this.stateKey += (this._data[Shader3D.BLEND_DST] ?? 'x') + '_';
            this.stateKey += (this._data[Shader3D.DEPTH_WRITE] ? 't' : 'f') + '_';
            this.stateKey += (this._data[Shader3D.DEPTH_TEST] ?? 'x') + '_';
            this.stateKey += (this._data[Shader3D.STENCIL_TEST] ?? 'x') + '_';
            if (this._data[Shader3D.STENCIL_Op]) {
                this.stateKey += this._data[Shader3D.STENCIL_Op].x + '_';
                this.stateKey += this._data[Shader3D.STENCIL_Op].y + '_';
                this.stateKey += this._data[Shader3D.STENCIL_Op].z + '_';
            } else this.stateKey += 'x_x_x_';
            this.stateKey += (this._data[Shader3D.STENCIL_Ref] ?? 'x') + '_';
            this.stateKey += (this._data[Shader3D.STENCIL_WRITE] ? 't' : 'f') + '>_';
        }
        if (this._uniformBuffer)
            this._uniformBuffer.setInt(index, value);
        if (this.instShaderData)
            this.instShaderData.setInt(index, value);
        if (this.skinShaderData)
            for (let i = this.skinShaderData.length - 1; i > -1; i--)
                this.skinShaderData[i].setInt(index, value);
        //console.log('setInt =', index, value, this.stateKey);
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
        if (this._data[index] !== value) {
            this._data[index] = value;
            this._uniformBuffer?.setFloat(index, value);
            this.instShaderData?.setNumber(index, value);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].setNumber(index, value);
            //console.log('setNumber');
        }
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
        this._uniformBuffer?.setVector2(index, value);
        this.instShaderData?.setVector2(index, value);
        if (this.skinShaderData)
            for (let i = this.skinShaderData.length - 1; i > -1; i--)
                this.skinShaderData[i].setVector2(index, value);
        //console.log('setVector2');
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
        this._uniformBuffer?.setVector3(index, value);
        this.instShaderData?.setVector3(index, value);
        if (this.skinShaderData)
            for (let i = this.skinShaderData.length - 1; i > -1; i--)
                this.skinShaderData[i].setVector3(index, value);
        //console.log('setVector3');
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
        this._uniformBuffer?.setVector4(index, value);
        this.instShaderData?.setVector(index, value);
        if (this.skinShaderData)
            for (let i = this.skinShaderData.length - 1; i > -1; i--)
                this.skinShaderData[i].setVector(index, value);
        //console.log('setVector');
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
            this._uniformBuffer?.setVector4(index, linearColor);
        }
        else {
            const linearColor = new Vector4();
            linearColor.x = Color.gammaToLinearSpace(value.r);
            linearColor.y = Color.gammaToLinearSpace(value.g);
            linearColor.z = Color.gammaToLinearSpace(value.b);
            linearColor.w = value.a;
            this._data[index] = linearColor;
            this._gammaColorMap.set(index, value.clone());
            this._uniformBuffer?.setVector4(index, linearColor);
        }
        this.instShaderData?.setColor(index, value);
        if (this.skinShaderData)
            for (let i = this.skinShaderData.length - 1; i > -1; i--)
                this.skinShaderData[i].setColor(index, value);
        //console.log('setColor');
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
        this._uniformBuffer?.setMatrix3x3(index, value);
        this.instShaderData?.setMatrix3x3(index, value);
        if (this.skinShaderData)
            for (let i = this.skinShaderData.length - 1; i > -1; i--)
                this.skinShaderData[i].setMatrix3x3(index, value);
        //console.log('setMatrix3x3');
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
        this._uniformBuffer?.setMatrix4x4(index, value);
        this.instShaderData?.setMatrix4x4(index, value);
        if (this.skinShaderData)
            for (let i = this.skinShaderData.length - 1; i > -1; i--)
                this.skinShaderData[i].setMatrix4x4(index, value);
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
        this._uniformBuffer?.setBuffer(index, value);
        this.instShaderData?.setBuffer(index, value);
        if (this.skinShaderData)
            for (let i = this.skinShaderData.length - 1; i > -1; i--)
                this.skinShaderData[i].setBuffer(index, value);
        //console.log('setBuffer');
    }

    /**
     * 设置纹理
     * @param index shader索引
     * @param value 纹理
     */
    setTexture(index: number, value: BaseTexture) {
        if (value instanceof Texture)
            value = (value as Texture).bitmap;
        const lastValue = this._data[index];
        if (lastValue != value) {
            if (value) {
                const shaderDefine = WebGPURenderEngine._instance._texGammaDefine[index];
                if (shaderDefine) {
                    if (value.gammaCorrection > 1)
                        this.addDefine(shaderDefine);
                    else this.removeDefine(shaderDefine);
                }
                this._texIdSet.add(value.id);
            }
            if (lastValue)
                this._texIdSet.delete(lastValue.id);
            this.changeMark++;
            this._bindGroupChange = true;
            this._data[index] = value;
            lastValue && lastValue._removeReference();
            value && value._addReference();
            this.instShaderData?.setTexture(index, value);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i].setTexture(index, value);
        }
    }

    /**
     * 设置内部纹理
     * @param index shader索引
     * @param value 纹理
     */
    _setInternalTexture(index: number, value: InternalTexture) {
        const lastValue = this._data[index];
        if (lastValue != value) {
            if (value) {
                const shaderDefine = WebGPURenderEngine._instance._texGammaDefine[index];
                if (shaderDefine) {
                    if (value.gammaCorrection > 1)
                        this.addDefine(shaderDefine);
                    else this.removeDefine(shaderDefine);
                }
                this._texIdSet.add((value as WebGPUInternalTex).globalId);
            }
            if (lastValue)
                this._texIdSet.delete(lastValue.globalId);
            this.changeMark++;
            this._bindGroupChange = true;
            this._data[index] = value;
            this.instShaderData?._setInternalTexture(index, value);
            if (this.skinShaderData)
                for (let i = this.skinShaderData.length - 1; i > -1; i--)
                    this.skinShaderData[i]._setInternalTexture(index, value);
        }
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

        this._texIdSet.forEach(id => dest._texIdSet.add(id));

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
     * 清理
     */
    clear() {
        this._gammaColorMap.clear();
        if (this._bindGroupItem) {
            this._bindGroupItem.refNum--;
            this._bindGroupItem = null;
        }
        this._uniformBuffer = null;
        this._uniformBufferMap.clear();
        this.instShaderData?.clear();
        if (this.skinShaderData)
            for (let i = this.skinShaderData.length - 1; i > -1; i--)
                this.skinShaderData[i].clear();
    }

    /**
     * 销毁
     */
    destroy() {
        if (!this._destroyed) {
            this._destroyed = true;
            WebGPUGlobal.releaseId(this);
            WebGPUShaderData._objectCount--;
            this._gammaColorMap = null;
            if (this._bindGroupItem) {
                this._bindGroupItem.refNum--;
                this._bindGroupItem = null;
            }
            this._uniformBuffer = null;
            this._uniformBufferMap.clear();
            if (this.instShaderData) {
                this.instShaderData.destroy();
                this.instShaderData.recover();
                this.instShaderData = null;
            }
            if (this.skinShaderData) {
                for (let i = this.skinShaderData.length - 1; i > -1; i--) {
                    this.skinShaderData[i].destroy();
                    this.skinShaderData[i].recover();
                }
                this.skinShaderData = null;
            }
        }
    }
}