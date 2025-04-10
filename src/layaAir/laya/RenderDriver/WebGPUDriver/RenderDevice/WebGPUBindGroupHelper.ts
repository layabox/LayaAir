import { LayaGL } from "../../../layagl/LayaGL";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Stat } from "../../../utils/Stat";
import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { WebGPUBindingInfoType, WebGPUUniformPropertyBindingInfo } from "./WebGPUCodeGenerator";
import { WebGPUCommandUniformMap } from "./WebGPUCommandUniformMap";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPUShaderData } from "./WebGPUShaderData";

export class WebGPUBindGroup {
    gpuRS: GPUBindGroup;
    createMask: number = -1;//创建的时候生成的帧数
    constructor() {
        this.createMask = Stat.loopCount;
    }

    isNeedCreate(resourceUpdateMask: number): boolean {
        return resourceUpdateMask >= this.createMask;
    }
}

export class WebGPUBindGroupHelper {
    static BindGroupPropertyInfoMap: Map<string, WebGPUUniformPropertyBindingInfo[]> = new Map();
    static BindGroupLayoutMap: Map<string, GPUBindGroupLayout> = new Map();
    static _getBindGroupID(array: string[]): string {
        // 将数组中的字符串拼接成一个唯一标识符
        if (!array || array.length === 0) {
            return "";
        }

        // 复制数组并排序，确保相同内容的数组生成相同的ID
        const sortedArray = [...array].sort();

        // 使用分隔符拼接数组元素
        return sortedArray.join("_");
    }

    static _getBindGroupPropertyID(bindGroupID: number, array: string[]) {
        return `${bindGroupID}` + this._getBindGroupID(array);
    }

    /**
     * 获取纹理类型
     * @param uniformType 
     * @returns 
     */
    private static _getTextureType(uniformType: ShaderDataType): GPUTextureViewDimension {
        switch (uniformType) {
            case ShaderDataType.Texture2D:
                return '2d';
            case ShaderDataType.Texture3D:
                return '3d';
            case ShaderDataType.TextureCube:
                return 'cube';
            case ShaderDataType.Texture2DArray:
                return '2d-array';
            default:
                return '2d';
        }
    }

    static _createBindGroupLayout(name: string, data: WebGPUUniformPropertyBindingInfo[]) {

        let entries: GPUBindGroupLayoutEntry[] = [];
        const desc: GPUBindGroupLayoutDescriptor = {
            label: name,
            entries: entries,
        };
        if (data) {
            for (let i = 0; i < data.length; i++) {
                switch (data[i].type) {
                    case WebGPUBindingInfoType.buffer:
                        (desc.entries as any).push({
                            binding: data[i].binding,
                            visibility: data[i].visibility,
                            buffer: data[i].buffer,
                        });
                        break;
                    case WebGPUBindingInfoType.sampler:
                        (desc.entries as any).push({
                            binding: data[i].binding,
                            visibility: data[i].visibility,
                            sampler: data[i].sampler,
                        });
                        break;
                    case WebGPUBindingInfoType.texture:
                        (desc.entries as any).push({
                            binding: data[i].binding,
                            visibility: data[i].visibility,
                            texture: data[i].texture,
                        });
                        break;
                    case WebGPUBindingInfoType.storageBuffer:
                        (desc.entries as any).push({
                            binding: data[i].binding,
                            visibility: data[i].visibility,
                            buffer: data[i].buffer,
                        })
                }
            }

        }
        return WebGPURenderEngine._instance.getDevice().createBindGroupLayout(desc);
    }

    /**
     * 根据unfiformCommandMapArray获得绑定信息
     * @param groupID 
     * @param unifromCommandMapArray 
     * @returns 
     */
    static createBindPropertyInfoArrayByCommandMap(groupID: number, unifromCommandMapArray: string[], isComputeShader: boolean = false): WebGPUUniformPropertyBindingInfo[] {
        // 根据groupID和命令映射数组生成唯一的绑定组键值
        const bindGroupKey = this._getBindGroupPropertyID(groupID, unifromCommandMapArray);
        if (WebGPUBindGroupHelper.BindGroupPropertyInfoMap.has(bindGroupKey)) {
            return WebGPUBindGroupHelper.BindGroupPropertyInfoMap.get(bindGroupKey);
        }

        //create
        //  if (WebGPUShaderData.getBindGroup(bindGroupKey)) {
        // 创建一个空数组用于存储绑定信息
        let bindingInfos: WebGPUUniformPropertyBindingInfo[] = [];
        let bindingIndex = 0;

        let visibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;
        if (isComputeShader) {
            visibility = GPUShaderStage.COMPUTE;
        }
        // 遍历命令映射数组
        for (let i = 0; i < unifromCommandMapArray.length; i++) {
            const commandName = unifromCommandMapArray[i];
            const propertyId = Shader3D.propertyNameToID(commandName);

            // 从WebGPUCommandUniformMap中获取uniform信息
            const uniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap(commandName) as WebGPUCommandUniformMap;
            if (uniformMap._ishasBuffer) {
                // 创建绑定信息对象
                const bindingInfo: WebGPUUniformPropertyBindingInfo = {
                    id: 0,
                    name: commandName,
                    set: groupID,
                    binding: bindingIndex++,
                    propertyId: propertyId,
                    visibility: visibility, // 默认在顶点和片元着色器中可见
                    type: WebGPUBindingInfoType.buffer, // 默认为缓冲区类型
                    buffer: {
                        type: 'uniform'
                    }
                };
                // 将绑定信息添加到数组中
                bindingInfos.push(bindingInfo);
            }



            if (uniformMap && uniformMap._idata) {
                // 遍历uniform映射中的所有属性,添加纹理set和sampler的绑定信息
                for (let [propertyID, uniformProperty] of uniformMap._idata) {
                    // 检查是否为纹理类型
                    if (uniformProperty.uniformtype >= ShaderDataType.Texture2D) {
                        let textureBindInfo: WebGPUUniformPropertyBindingInfo = {
                            id: 0,
                            set: groupID,
                            binding: bindingIndex++,
                            name: uniformProperty.propertyName + "_Texture",
                            propertyId: propertyID,
                            visibility: visibility,
                            type: WebGPUBindingInfoType.texture,
                            texture: {
                                sampleType: 'float',
                                viewDimension: WebGPUBindGroupHelper._getTextureType(uniformProperty.uniformtype),
                                multisampled: false
                            }
                        }
                        bindingInfos.push(textureBindInfo);
                        // 修改当前绑定信息为纹理类型
                        let samplerBindInfo: WebGPUUniformPropertyBindingInfo = {
                            id: 0,
                            set: groupID,
                            binding: bindingIndex++,
                            name: uniformProperty.propertyName + "_Sampler",
                            propertyId: propertyID,//TODO
                            visibility: visibility,
                            type: WebGPUBindingInfoType.sampler,
                            sampler: {
                                type: 'filtering'
                            },
                            texture: {
                                sampleType: 'float',
                                viewDimension: WebGPUBindGroupHelper._getTextureType(uniformProperty.uniformtype),
                                multisampled: false
                            }

                        }
                        bindingInfos.push(samplerBindInfo);
                    }
                    if (uniformProperty.uniformtype == ShaderDataType.StorageBuffer) {
                        let storageBufferBindInfo: WebGPUUniformPropertyBindingInfo = {
                            id: 0,
                            set: groupID,
                            binding: bindingIndex++,
                            name: uniformProperty.propertyName,
                            propertyId: propertyID,
                            visibility: visibility,
                            type: WebGPUBindingInfoType.storageBuffer,
                            buffer: {
                                type: "storage"
                            }
                        }
                        bindingInfos.push(storageBufferBindInfo);
                    }
                }
            }
        }
        WebGPUBindGroupHelper.BindGroupPropertyInfoMap.set(bindGroupKey, bindingInfos);
        return bindingInfos;
    }

    //根据同一组的绑定信息，创建绑定组布局
    static createBindGroupEntryLayout(infoArray: WebGPUUniformPropertyBindingInfo[]): GPUBindGroupLayout {
        let entries: GPUBindGroupLayoutEntry[] = [];
        const desc: GPUBindGroupLayoutDescriptor = {
            label: "GPUBindGroupLayoutDescriptor",
            entries: entries,
        };
        for (let i = 0; i < infoArray.length; i++) {
            switch (infoArray[i].type) {
                case WebGPUBindingInfoType.buffer:
                    (desc.entries as any).push({
                        binding: infoArray[i].binding,
                        visibility: infoArray[i].visibility,
                        buffer: infoArray[i].buffer,
                    });
                    break;
                case WebGPUBindingInfoType.storageBuffer:
                    (desc.entries as any).push({
                        binding: infoArray[i].binding,
                        visibility: infoArray[i].visibility,
                        buffer: infoArray[i].buffer,
                    });
                    break;
                case WebGPUBindingInfoType.sampler:
                    (desc.entries as any).push({
                        binding: infoArray[i].binding,
                        visibility: infoArray[i].visibility,
                        sampler: infoArray[i].sampler,
                    });
                    break;
                case WebGPUBindingInfoType.texture:
                    (desc.entries as any).push({
                        binding: infoArray[i].binding,
                        visibility: infoArray[i].visibility,
                        texture: infoArray[i].texture,
                    });
                    break;
            }
        }
        return WebGPURenderEngine._instance.getDevice().createBindGroupLayout(desc);
    }


    //传入Command的string Array 生成Scene和Camera用这个
    static createBindGroupByCommandMapArray(groupID: number, unifromCommandMapArray: string[], shaderData: WebGPUShaderData): WebGPUBindGroup {
        let infoArray: WebGPUUniformPropertyBindingInfo[] = WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(groupID, unifromCommandMapArray);
        const bindGroupKey = this._getBindGroupID(unifromCommandMapArray);
        let groupLayout: GPUBindGroupLayout;
        if (WebGPUBindGroupHelper.BindGroupLayoutMap.has(bindGroupKey)) {
            groupLayout = WebGPUBindGroupHelper.BindGroupLayoutMap.get(bindGroupKey);
        } else {
            groupLayout = WebGPUBindGroupHelper.createBindGroupEntryLayout(infoArray);
            WebGPUBindGroupHelper.BindGroupLayoutMap.set(bindGroupKey, groupLayout);
        }
        let bindgroupEntriys: GPUBindGroupEntry[] = [];
        let bindGroupDescriptor: GPUBindGroupDescriptor = {
            label: "GPUBindGroupDescriptor",
            layout: groupLayout,
            entries: bindgroupEntriys
        };
        //填充bindgroupEntriys
        for (var i = 0; i < unifromCommandMapArray.length; i++) {
            shaderData.fillBindGroupEntry(unifromCommandMapArray[i], unifromCommandMapArray[i], bindgroupEntriys, infoArray);
        }

        let bindGroup = WebGPURenderEngine._instance.getDevice().createBindGroup(bindGroupDescriptor);
        //设置缓存  
        let returns = new WebGPUBindGroup();
        returns.gpuRS = bindGroup;
        returns.createMask = Stat.loopCount;
        return returns;
    }

    //传入UniformMap，创建WebGPUUniformPropertyBindingInfo数组
    static createBindGroupInfosByUniformMap(groupID: number, name: string, cacheName: string, uniformMap: Map<number, UniformProperty>) {
        const bindGroupKey = this._getBindGroupPropertyID(groupID, [cacheName]);
        if (WebGPUBindGroupHelper.BindGroupPropertyInfoMap.has(bindGroupKey)) {
            return WebGPUBindGroupHelper.BindGroupPropertyInfoMap.get(bindGroupKey);
        }
        // 遍历uniform映射中的所有属性,添加纹理set和sampler的绑定信息
        let bindingIndex = 0;
        const propertyId = Shader3D.propertyNameToID(name);
        let bindingInfos: WebGPUUniformPropertyBindingInfo[] = [];
        // 创建绑定信息对象
        const bindingInfo: WebGPUUniformPropertyBindingInfo = {
            id: 0,
            name: name,
            set: groupID,
            binding: bindingIndex++,
            propertyId: propertyId,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, // 默认在顶点和片元着色器中可见
            type: WebGPUBindingInfoType.buffer, // 默认为缓冲区类型
            buffer: {
                type: 'uniform'
            }
        };
        // 将绑定信息添加到数组中
        bindingInfos.push(bindingInfo);
        for (let [propertyID, uniformProperty] of uniformMap) {
            // 检查是否为纹理类型
            if (uniformProperty.uniformtype >= ShaderDataType.Texture2D) {
                let textureBindInfo: WebGPUUniformPropertyBindingInfo = {
                    id: 0,
                    set: groupID,
                    binding: bindingIndex++,
                    name: uniformProperty.propertyName + "_Texture",
                    propertyId: propertyID,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    type: WebGPUBindingInfoType.texture,
                    texture: {
                        sampleType: 'float',
                        viewDimension: WebGPUBindGroupHelper._getTextureType(uniformProperty.uniformtype),
                        multisampled: false
                    }
                }
                bindingInfos.push(textureBindInfo);
                // 修改当前绑定信息为纹理类型
                let samplerBindInfo: WebGPUUniformPropertyBindingInfo = {
                    id: 0,
                    set: groupID,
                    binding: bindingIndex++,
                    name: uniformProperty.propertyName + "_Sampler",
                    propertyId: propertyID,//TODO
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    type: WebGPUBindingInfoType.sampler,
                    sampler: {
                        type: 'filtering'
                    },
                    texture: {
                        sampleType: 'float',
                        viewDimension: WebGPUBindGroupHelper._getTextureType(uniformProperty.uniformtype),
                        multisampled: false
                    }
                }
                bindingInfos.push(samplerBindInfo);
            }

            if (uniformProperty.uniformtype == ShaderDataType.StorageBuffer) {
                let storageBufferBindInfo: WebGPUUniformPropertyBindingInfo = {
                    id: 0,
                    set: groupID,
                    binding: bindingIndex++,
                    name: uniformProperty.propertyName,
                    propertyId: propertyID,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    type: WebGPUBindingInfoType.storageBuffer,
                    buffer: {
                        type: "storage"
                    }
                }
                bindingInfos.push(storageBufferBindInfo);
            }
        }
        WebGPUBindGroupHelper.BindGroupPropertyInfoMap.set(bindGroupKey, bindingInfos);
        return bindingInfos;

    }
}
