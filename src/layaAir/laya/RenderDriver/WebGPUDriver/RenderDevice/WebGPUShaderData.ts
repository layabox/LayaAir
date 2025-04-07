import { Color } from "../../../maths/Color";
import { Matrix3x3 } from "../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { TextureFormat } from "../../../RenderEngine/RenderEnum/TextureFormat";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "../../../resource/Material";
import { Resource } from "../../../resource/Resource";
import { Texture2D } from "../../../resource/Texture2D";
import { TextureCube } from "../../../resource/TextureCube";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPUBindingInfoType, WebGPUUniformPropertyBindingInfo } from "./WebGPUCodeGenerator";
import { WebGPUInternalTex } from "./WebGPUInternalTex";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPUUniformBuffer } from "./WebGPUUniform/WebGPUUniformBuffer";
import { WebGPUCommandUniformMap } from "./WebGPUCommandUniformMap";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { Stat } from "../../../utils/Stat";
import { WebGPUBuffer } from "./WebGPUBuffer";
import { LayaGL } from "../../../layagl/LayaGL";
import { WebGPUBindGroup, WebGPUBindGroupHelper } from "./WebGPUBindGroupHelper";
import { IUniformBufferUser } from "../../DriverDesign/RenderDevice/UniformBufferManager/IUniformBufferUser";
import { WebGPUUniformBufferBase } from "./WebGPUUniform/WebGPUUniformBufferBase";
import { WebGPUSubUniformBuffer } from "./WebGPUUniform/WebGPUSubUniformBuffer";

/**
 * 着色器数据
 */
export class WebGPUShaderData extends ShaderData {
    private static _dummyTexture2D: Texture2D; //替代贴图（2D）
    private static _dummyTextureCube: TextureCube; //替代贴图（Cube）
    private static _stateKeyMap: Set<number>;


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
        this._stateKeyMap.add(Shader3D.BLEND_EQUATION_RGB);
        this._stateKeyMap.add(Shader3D.BLEND_SRC_RGB);
        this._stateKeyMap.add(Shader3D.BLEND_DST_RGB);
        this._stateKeyMap.add(Shader3D.BLEND_EQUATION_ALPHA);
        this._stateKeyMap.add(Shader3D.BLEND_SRC_ALPHA);
        this._stateKeyMap.add(Shader3D.BLEND_DST_ALPHA);
        this._stateKeyMap.add(Shader3D.DEPTH_WRITE);
        this._stateKeyMap.add(Shader3D.DEPTH_TEST);
        this._stateKeyMap.add(Shader3D.STENCIL_TEST);
        this._stateKeyMap.add(Shader3D.STENCIL_Op);
        this._stateKeyMap.add(Shader3D.STENCIL_Ref);
        this._stateKeyMap.add(Shader3D.STENCIL_WRITE);
    }
    /**
    * 帧结束时做一些处理
    */
    static endFrame() {

    }

    private _gammaColorMap: Map<number, Color>; //颜色矫正数据
    /**@internal */
    _data: any; //数据对象
    /**@internal */
    _defineDatas: WebDefineDatas; //宏定义对象

    _stateKey: string;

    //UBO Buffer Module
    private _uniformBuffers: Map<string, WebGPUUniformBuffer>;

    private _subUniformBuffers: Map<string, WebGPUSubUniformBuffer>;

    private _uniformBuffersPropertyMap: Map<number, WebGPUUniformBufferBase>;

    private _updateCacheArray: { [key: number]: any } = {};

    private _subUboBufferNumber: number = 0;

    //BindGroup缓存数据
    //缓存了纹理改动之后，需要重建的key
    private _textureCacheUpdateMap: Map<number, Set<string>>;
    //根据string来查找某个Uniform组最后数据更新的值 用来快速判断是否需要重新创建bindGroup
    private _bindGroupLastUpdateMask: Map<string, number>;

    //BindGroup资源数据 
    private _cacheBindGroup: Map<string, WebGPUBindGroup>;
    private _cacheNameBindGroupInfos: Map<string, WebGPUUniformPropertyBindingInfo[]>;

    _textureData: { [key: number]: BaseTexture } = {};
    /**
     * 不允许直接创建，只能通过对象池
     * @param ownerResource 
     */
    constructor(ownerResource: Resource = null) {
        super(ownerResource);
        this._data = {};
        this._gammaColorMap = new Map();
        this._defineDatas = new WebDefineDatas();

        this._textureCacheUpdateMap = new Map();
        this._bindGroupLastUpdateMask = new Map();
        this._cacheBindGroup = new Map();
        this._cacheNameBindGroupInfos = new Map();

        this._uniformBuffers = new Map();
        this._subUniformBuffers = new Map();
        this._uniformBuffersPropertyMap = new Map();
    }

    updateUBOBuffer(key: string) {
        let buffer = this._uniformBuffers.get(key) || this._subUniformBuffers.get(key);
        if (!buffer) {
            return;
        }
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

    createUniformBuffer(name: string, uniformMap: WebGPUCommandUniformMap): WebGPUUniformBuffer {
        if (this._uniformBuffers.has(name)) {
            return null;
        }
        let uboBuffer = new WebGPUUniformBuffer(name, uniformMap._idata);
        this._uniformBuffers.set(name, uboBuffer);
        let id = Shader3D.propertyNameToID(name);
        this._data[id] = uboBuffer;
        uniformMap._idata.forEach(uniform => {
            let uniformId = uniform.id;
            let data = this._data[uniformId];
            if (data != null) {
                uboBuffer.setUniformData(uniformId, uniform.uniformtype, data);
            }
            this._uniformBuffersPropertyMap.set(uniformId, uboBuffer);
        });
        return uboBuffer;
    }

    createSubUniformBuffer(name: string, cacheName: string, uniformMap: Map<number, UniformProperty>): WebGPUSubUniformBuffer {
        let subBuffer = this._subUniformBuffers.get(cacheName);
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
                uniformMap.forEach((uniform, index) => {
                    if (this._data[index] && this._updateCacheArray[index]) {
                        (this._updateCacheArray[index] as Function).call(subBuffer, index, this._data[index]);
                    }
                });
            }
            return subBuffer;
        }

        //create WebGPUSubUniform
        let uniformBuffer = new WebGPUSubUniformBuffer(name, uniformMap);
        this._subUboBufferNumber++;
        uniformBuffer.notifyGPUBufferChange();
        this._subUniformBuffers.set(cacheName, uniformBuffer);

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
   * 传入布局，绑定好资源数据
   * @param groupId 
   * @param name 
   * @param info 
   * @param command 
   * @param bundle 
   */
    fillBindGroupEntry(commandMap: string, entryArray: GPUBindGroupEntry[], infos: WebGPUUniformPropertyBindingInfo[]) {
        let map = (LayaGL.renderDeviceFactory.createGlobalUniformMap(commandMap) as WebGPUCommandUniformMap)
        let mapInfos = [];
        for (const item of infos) {
            if (!map.hasPtrID(item.propertyId)) {
                continue;
            }
            mapInfos.push(item);
            switch (item.type) {
                case WebGPUBindingInfoType.buffer:
                    //get ubo 
                    entryArray.push((this._data[item.propertyId] as WebGPUUniformBufferBase).getBindGroupEntry(item.binding));
                    break;
                case WebGPUBindingInfoType.texture:
                    if (item.texture) {
                        let texture = this._data[item.propertyId];
                        if (!texture) {
                            //设置为默认纹理
                            switch (item.texture.viewDimension) {
                                case 'cube':
                                    texture = WebGPUShaderData._dummyTextureCube._texture;
                                    break;
                                case "2d":
                                    texture = WebGPUShaderData._dummyTexture2D._texture;
                                    break;
                            }
                        }

                        entryArray.push({
                            binding: item.binding,
                            resource: texture.getTextureView(),
                        });
                    }
                    break;
                case WebGPUBindingInfoType.sampler:
                    if (item.sampler) {
                        let texture = this._data[item.propertyId];
                        if (!texture) {
                            //设置为默认纹理
                            switch (item.texture.viewDimension) {
                                case 'cube':
                                    texture = WebGPUShaderData._dummyTextureCube._texture;
                                    break;
                                case "2d":
                                    texture = WebGPUShaderData._dummyTexture2D._texture;
                                    break;
                            }
                        }
                        entryArray.push({
                            binding: item.binding,
                            resource: texture.sampler.source,
                        });
                    }
                    break;
            }
        }

        if (!this._bindGroupLastUpdateMask.has(commandMap)) {
            this._setBindGroupCacheInfo(commandMap, mapInfos);
        }
    }

    /**
     * 设置某个key 对应的需要统计资源更新列表，组织TextureCacheUpdateMap和_bindGroupLastUpdateMask
     * @param key 
     * @param infos 
     */
    _setBindGroupCacheInfo(key: string, infos: WebGPUUniformPropertyBindingInfo[]) {
        for (const item of infos) {
            if (item.type == WebGPUBindingInfoType.texture) {
                if (this._textureCacheUpdateMap.has(item.propertyId)) {
                    this._textureCacheUpdateMap.get(item.propertyId).add(key);
                } else {
                    this._textureCacheUpdateMap.set(item.propertyId, new Set<string>([key]));
                }
            }
        }
        this._bindGroupLastUpdateMask.set(key, 0);//重新开始记录更新最后一帧
    }

    /**
     * 活得资源更新的mask数据
     * @param key 
     * @returns 
     */
    _getBindGroupLastUpdateMask(key: string) {
        return this._bindGroupLastUpdateMask.has(key) ? this._bindGroupLastUpdateMask.get(key) : Number.MAX_VALUE;
    }


    _createOrGetBindGroup(name: string, cacheName: string, bindGroup: number, uniformMap: Map<number, UniformProperty>): WebGPUBindGroup {
        let needRecreate = false;
        //判断是否已经缓存了相应的BindGroup
        needRecreate = !this._cacheBindGroup.has(cacheName) ||
            this._cacheBindGroup.get(cacheName).isNeedCreate(this._getBindGroupLastUpdateMask(cacheName));
        if (needRecreate) {//重新创建BindGroup
            if (!this._cacheNameBindGroupInfos.has(`${bindGroup}` + cacheName)) {
                this._cacheNameBindGroupInfos.set(`${bindGroup}` + cacheName, WebGPUBindGroupHelper.createBindGroupInfosByUniformMap(bindGroup, name, cacheName, uniformMap));
            }

            let bindGroupInfos = this._cacheNameBindGroupInfos.get(`${bindGroup}` + cacheName);
            let groupLayout: GPUBindGroupLayout = WebGPUBindGroupHelper.createBindGroupEntryLayout(bindGroupInfos)
            let bindgroupEntriys: GPUBindGroupEntry[] = [];
            let bindGroupDescriptor: GPUBindGroupDescriptor = {
                label: "GPUBindGroupDescriptor",
                layout: groupLayout,
                entries: bindgroupEntriys
            };
            //填充bindgroupEntriys
            this.fillBindGroupEntry(cacheName, bindgroupEntriys, bindGroupInfos);
            let bindGroupGPU = WebGPURenderEngine._instance.getDevice().createBindGroup(bindGroupDescriptor);
            let returns = new WebGPUBindGroup();
            returns.gpuRS = bindGroupGPU;
            returns.createMask = Stat.loopCount;
            this._cacheBindGroup.set(cacheName, returns);
            return returns;
        } else {
            return this._cacheBindGroup.get(cacheName);
        }
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
     * @ignore
     */
    addDefine(define: ShaderDefine) {
        this._defineDatas.add(define);
    }

    /**
     * @ignore
     */
    addDefines(define: WebDefineDatas) {
        this._defineDatas.addDefineDatas(define);
    }

    /**
     * @ignore
     */
    removeDefine(define: ShaderDefine): void {
        this._defineDatas.remove(define);
    }

    removeDefines(defines: WebDefineDatas): void {
        this._defineDatas.removeDefineDatas(defines);
    }

    /**
     * @ignore
     */
    hasDefine(define: ShaderDefine) {
        return this._defineDatas.has(define);
    }

    /**
     * @ignore
     */
    clearDefine() {
        this._defineDatas.clear();
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
        this._data[index] = value;
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
            this._stateKey = '<';
            this._stateKey += (this._data[Shader3D.BLEND] ?? 'x') + '_';
            switch (this._data[Shader3D.BLEND]) {
                case RenderState.BLEND_DISABLE:
                    break;
                case RenderState.BLEND_ENABLE_ALL:
                    this._stateKey += (this._data[Shader3D.BLEND_EQUATION] ?? 'x') + '_';
                    this._stateKey += (this._data[Shader3D.BLEND_SRC] ?? 'x') + '_';
                    this._stateKey += (this._data[Shader3D.BLEND_DST] ?? 'x') + '_';
                    break;
                case RenderState.BLEND_ENABLE_SEPERATE:
                    this._stateKey += (this._data[Shader3D.BLEND_EQUATION_RGB] ?? 'x') + '_';
                    this._stateKey += (this._data[Shader3D.BLEND_SRC_RGB] ?? 'x') + '_';
                    this._stateKey += (this._data[Shader3D.BLEND_DST_RGB] ?? 'x') + '_';
                    this._stateKey += (this._data[Shader3D.BLEND_EQUATION_ALPHA] ?? 'x') + '_';
                    this._stateKey += (this._data[Shader3D.BLEND_SRC_ALPHA] ?? 'x') + '_';
                    this._stateKey += (this._data[Shader3D.BLEND_DST_ALPHA] ?? 'x') + '_';
                    break;
            }
            this._stateKey += (this._data[Shader3D.DEPTH_WRITE] ? 't' : 'f') + '_';
            this._stateKey += (this._data[Shader3D.DEPTH_TEST] ?? 'x') + '_';
            this._stateKey += (this._data[Shader3D.STENCIL_TEST] ?? 'x') + '_';
            if (this._data[Shader3D.STENCIL_Op]) {
                this._stateKey += this._data[Shader3D.STENCIL_Op].x + '_';
                this._stateKey += this._data[Shader3D.STENCIL_Op].y + '_';
                this._stateKey += this._data[Shader3D.STENCIL_Op].z + '_';
            } else this._stateKey += 'x_x_x_';
            this._stateKey += (this._data[Shader3D.STENCIL_Ref] ?? 'x') + '_';
            this._stateKey += (this._data[Shader3D.STENCIL_WRITE] ? 't' : 'f') + '>_';
        }
        else {
            this._updateCacheArray[index] = WebGPUUniformBufferBase.prototype.setInt;
        }
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
        this._data[index] = value;
        this._updateCacheArray[index] = WebGPUUniformBufferBase.prototype.setFloat;
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
        if (this._data[index]) {
            value.cloneTo(this._data[index]);
        } else
            this._data[index] = value.clone();
        this._updateCacheArray[index] = WebGPUUniformBufferBase.prototype.setVector2;
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
        if (this._data[index]) {
            value.cloneTo(this._data[index]);
        } else
            this._data[index] = value.clone();
        this._updateCacheArray[index] = WebGPUUniformBufferBase.prototype.setVector3;
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
        if (this._data[index]) {
            value.cloneTo(this._data[index]);
        } else
            this._data[index] = value.clone();
        this._updateCacheArray[index] = WebGPUUniformBufferBase.prototype.setVector4;
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
        this._updateCacheArray[index] = WebGPUUniformBufferBase.prototype.setVector4;
    }

    /**
     * @internal
     * @param index 
     */
    getLinearColor(index: number): Vector4 {
        return this._data[index];
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
        if (this._data[index]) {
            value.cloneTo(this._data[index]);
        }
        else {
            this._data[index] = value.clone();
        }
        this._updateCacheArray[index] = WebGPUUniformBufferBase.prototype.setMatrix3x3;
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
        if (this._data[index]) {
            value.cloneTo(this._data[index]);
        } else {
            this._data[index] = value.clone();
        }
        this._updateCacheArray[index] = WebGPUUniformBufferBase.prototype.setMatrix4x4;
        //TODO
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
        this._updateCacheArray[index] = WebGPUUniformBufferBase.prototype.setArrayBuffer;
    }

    /**
     * 设置纹理
     * @param index shader索引
     * @param value 纹理
     */
    setTexture(index: number, value: BaseTexture) {
        var lastValue: BaseTexture = this._textureData[index];

        if (value && (value as any).bitmap) value = (value as any).bitmap;
        //维护Reference
        this._textureData[index] = value;
        if (value) {
            this._setInternalTexture(index, (value._texture as WebGPUInternalTex));
        } else {
            this._setInternalTexture(index, null);
        }
        lastValue && lastValue._removeReference();
        value && value._addReference();
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
            }
            this._data[index] = value;
            let arra = this._textureCacheUpdateMap.get(index);
            if (arra) {
                for (const item of arra) {//更新和纹理相关的所有bindGroup的标记
                    let oldMask = this._bindGroupLastUpdateMask.get(item)
                    let mask: number;
                    if (oldMask >= Stat.loopCount) {
                        mask = Stat.loopCount++;
                    } else {
                        mask = Stat.loopCount;
                    }
                    this._bindGroupLastUpdateMask.set(item, mask);
                }
            }

        }
    }

    /**
     * 获取纹理
     * @param index shader索引
     * @return 纹理
     */
    getTexture(index: number): BaseTexture {
        return this._textureData[index];
    }


    /**
     * 克隆（仅克隆数据）
     * @param dest 
     */
    cloneTo(dest: WebGPUShaderData) {
        dest.clearData();
        var destData: { [key: string]: number | boolean | Vector2 | Vector3 | Vector4 | Matrix3x3 | Matrix4x4 | Resource } = dest._data;

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
                        dest.setColor(parseInt(k), clonecolor);
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
        this._defineDatas.cloneTo(dest._defineDatas);
        this._gammaColorMap.forEach((color, index) => {
            dest._gammaColorMap.set(index, color.clone());
        });
    }

    /**
     * 克隆（仅克隆数据）
     */
    clone() {
        const dest = new WebGPUShaderData();
        this.cloneTo(dest);
        return dest;
    }

    /**
     * 清理数据
     */
    clearData() {
        for (const index in this._data)
            if (this._data[index] instanceof Resource)
                this._data[index]._removeReference();

        this._uniformBuffersPropertyMap.clear();

        this._uniformBuffers.forEach(buffer => {
            buffer.destroy();
        });
        this._uniformBuffers.clear();

        this._subUniformBuffers.forEach(buffer => {
            buffer.destroy();
        });
        this._subUniformBuffers.clear();

        //bindGroup Cache
        this._cacheBindGroup.clear();
        this._bindGroupLastUpdateMask.clear();
        this._textureCacheUpdateMap.clear();

        this._cacheBindGroup.clear();
        this._cacheNameBindGroupInfos.clear();

        this._data = {};
        this._gammaColorMap.clear();
        this.clearDefine();
        this._subUboBufferNumber = 0;


    }

    /**
     * 销毁转回收
     */
    destroy() {
        this.clearData();

        this._defineDatas.destroy();
        this._defineDatas = null;

        this._gammaColorMap.clear();
        this._gammaColorMap = null;
    }
}