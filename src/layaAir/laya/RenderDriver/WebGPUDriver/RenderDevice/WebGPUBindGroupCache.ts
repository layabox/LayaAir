import { LayaGL } from "../../../layagl/LayaGL";
import { Texture2D } from "../../../resource/Texture2D";
import { TextureCube } from "../../../resource/TextureCube";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebGPUBindingInfoType, WebGPUUniformPropertyBindingInfo } from "./WebGPUBindGroupHelper";
import { WebGPUCommandUniformMap } from "./WebGPUCommandUniformMap";
import { WebGPUInternalTex } from "./WebGPUInternalTex";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPUShaderData } from "./WebGPUShaderData";
import { WebGPUUniformBufferBase } from "./WebGPUUniform/WebGPUUniformBufferBase";

const empthArray: string[] = [];

export class WebGPUBindGroupLayoutInfo {

    private static _idCounter: number = 0;

    readonly id: number;

    entries: GPUBindGroupLayoutEntry[];

    properties: number[];

    values: string[];

    textureStates: number;

    textureExits: number;

    layout?: GPUBindGroupLayout;

    constructor(entries: GPUBindGroupLayoutEntry[], properties: number[], values: string[], textureStates: number, textureExits: number) {
        this.id = WebGPUBindGroupLayoutInfo._idCounter++;
        this.entries = entries;
        this.properties = properties;
        this.values = values;
        this.textureStates = textureStates;
        this.textureExits = textureExits;
    }
}

export class WebGPUBindGroup {

    info: WebGPUBindGroupLayoutInfo;

    layout: GPUBindGroupLayout;

    gpuRS: GPUBindGroup;

    constructor(info: WebGPUBindGroupLayoutInfo) {
        this.info = info;
    }

}

export class WebGPUBindGroupCache {

    private layoutCache: Map<string, WebGPUBindGroupLayoutInfo> = new Map();

    private bindGroupCache: Map<string, WebGPUBindGroup> = new Map();

    private getInfoCacheKey(commands: string[], shaderData: WebGPUShaderData, addition: Map<string, ShaderData>, textureExitsMask: number) {
        let textureStates = 0;
        let textureExits = 0;

        let texOffset = 0;

        let cacheKey = commands?.join(",");

        const getInfoData = (mapName: string, data: WebGPUShaderData) => {
            let map = LayaGL.renderDeviceFactory.createGlobalUniformMap(mapName) as WebGPUCommandUniformMap;

            let dataState = data.textureStatesMap.get(mapName) || 0;
            textureStates = textureStates | (dataState << texOffset);

            textureExits = textureExits | (map._textureExits << texOffset);

            texOffset += map._textureCount;
        };

        commands.forEach(mapName => {
            getInfoData(mapName, shaderData);
        });

        if (addition) {
            addition.forEach((data: ShaderData, mapName: string) => {
                getInfoData(mapName, data as WebGPUShaderData);
                cacheKey += `,${mapName}`;
            });
        }

        textureExits &= textureExitsMask;

        textureStates &= textureExits;

        cacheKey = `${cacheKey}_${textureExits}_${textureStates}`;

        if (texOffset > 31) {
            console.warn("WebGPUBindGroupCache: texture bits exceed 32, this may cause issues with texture binding.");
        }

        return cacheKey;
    }

    // todo
    // cache bindgrouplayout
    getLayoutInfo(commands: string[], shaderData: WebGPUShaderData, addition: Map<string, ShaderData>, resources: WebGPUUniformPropertyBindingInfo[], textureExitsMask: number) {

        const cacheKey = this.getInfoCacheKey(commands, shaderData, addition, textureExitsMask);
        if (this.layoutCache.has(cacheKey)) {
            return this.layoutCache.get(cacheKey);
        }

        let entries: GPUBindGroupLayoutEntry[] = [];
        let properties: number[] = [];
        let values: string[] = [];

        let bindIndex = 0;

        let textureStates = 0;
        let textureExits = 0;

        let bitOffset = 0;

        const func2 = (name: string, data: WebGPUShaderData) => {
            let map = LayaGL.renderDeviceFactory.createGlobalUniformMap(name) as WebGPUCommandUniformMap;

            resources.forEach(resource => {
                let propertyID = resource.propertyId;
                if (map.hasPtrID(propertyID)) {
                    let entry: GPUBindGroupLayoutEntry = {
                        binding: bindIndex++,
                        visibility: resource.visibility,
                    };
                    entries.push(entry);
                    properties.push(propertyID);
                    let value = data._data[propertyID];
                    values.push(name);

                    switch (resource.type) {
                        case WebGPUBindingInfoType.buffer:
                            entry.buffer = {
                                type: resource.buffer.type,
                                hasDynamicOffset: resource.buffer.hasDynamicOffset,
                                minBindingSize: resource.buffer.minBindingSize,
                            };
                            break;
                        case WebGPUBindingInfoType.texture:
                            entry.texture = {
                                viewDimension: resource.texture.viewDimension,
                                sampleType: resource.texture.sampleType,
                                multisampled: resource.texture.multisampled
                            };
                            if (value) {
                                let tex = (value as WebGPUInternalTex);
                                tex._getGPUTextureBindingLayout(entry.texture);
                            }
                            break;
                        case WebGPUBindingInfoType.sampler:
                            entry.sampler = {
                                type: resource.sampler.type,
                            };
                            if (value) {
                                let tex = (value as WebGPUInternalTex);
                                tex._getSampleBindingLayout(entry.sampler);
                            }
                            let textureBit = map._textureBits.get(propertyID) + bitOffset;
                            let posMask = 1 << textureBit;
                            textureExits |= posMask;
                            if (entry.sampler.type != "filtering") {
                                textureStates |= posMask;
                            }
                            break;
                        case WebGPUBindingInfoType.storageBuffer:
                            entry.buffer = {
                                type: resource.buffer.type,
                                hasDynamicOffset: resource.buffer.hasDynamicOffset,
                                minBindingSize: resource.buffer.minBindingSize,
                            };
                            break;
                        case WebGPUBindingInfoType.storageTexture:
                            entry.storageTexture = {
                                access: resource.storageTexture.access,
                                format: resource.storageTexture.format,
                                viewDimension: resource.storageTexture.viewDimension,
                            };
                            if (value) {
                                let tex = (value as WebGPUInternalTex);
                                tex._getStorageBindingLayout(entry.storageTexture);
                            }
                            break;
                        default:
                            break;
                    }
                }
            });

            bitOffset += map._textureCount;
        }

        commands?.forEach(mapName => {
            func2(mapName, shaderData);
        });

        if (addition) {
            addition.forEach((data: ShaderData, mapName: string) => {
                func2(mapName, data as WebGPUShaderData);
            });
        }

        let info = new WebGPUBindGroupLayoutInfo(entries, properties, values, textureStates, textureExits);

        this.layoutCache.set(cacheKey, info);
        return info;
    }

    // todo
    // cache bindgrouplayout
    getBindGroupLayout(info: WebGPUBindGroupLayoutInfo) {

        let descriptor: GPUBindGroupLayoutDescriptor = {
            label: `Layout_${info.id}`,
            entries: info.entries,
        };

        const device = WebGPURenderEngine._instance.getDevice();
        let layout = device.createBindGroupLayout(descriptor);

        return layout;
    }

    getBindGroup(commands: string[], shaderData: WebGPUShaderData, addition: Map<string, ShaderData>, resource: WebGPUUniformPropertyBindingInfo[], textureExitsMask: number): WebGPUBindGroup {

        commands = commands || empthArray;

        let info = this.getLayoutInfo(commands, shaderData, addition, resource, textureExitsMask);
        if (!info.layout) {
            info.layout = this.getBindGroupLayout(info);
        }
        let layout = info.layout;

        let cacheKey = `L:${info.id}V:`;

        let entries: GPUBindGroupEntry[] = [];

        let tempTex: Map<number, WebGPUInternalTex> = new Map();

        info.entries.forEach((layoutEntry, index) => {
            let propertyID = info.properties[index];

            let blockName = info.values[index];
            let value: WebGPUUniformBufferBase | WebGPUInternalTex;
            if (commands.indexOf(blockName) >= 0) {
                value = shaderData._data[propertyID];
            }
            if (addition && addition.has(blockName)) {
                value = (addition.get(blockName) as WebGPUShaderData)._data[propertyID];
            }

            if (layoutEntry.buffer) {
                let buffer = value as WebGPUUniformBufferBase;

                cacheKey += `_${buffer.globalId}`;

                let entry = buffer.getBindGroupEntry(layoutEntry.binding);

                entries.push(entry);
            }
            else if (layoutEntry.texture) {
                let texture = value as WebGPUInternalTex;

                if (!texture) {
                    texture = getDefaultTexture(layoutEntry.texture);
                    tempTex.set(propertyID, texture);
                }
                let textureView = texture.getTextureView();

                cacheKey += `_${texture.globalId}`;

                let entry: GPUBindGroupEntry = {
                    binding: layoutEntry.binding,
                    resource: textureView,
                };

                entries.push(entry);
            }
            else if (layoutEntry.sampler) {
                let texture = value as WebGPUInternalTex;

                if (!texture) {
                    texture = tempTex.get(propertyID);
                }

                let sampler = texture.sampler;

                cacheKey += `_${sampler.globalId}`;

                let entry: GPUBindGroupEntry = {
                    binding: layoutEntry.binding,
                    resource: sampler.source,
                };

                entries.push(entry);
            }
            else if (layoutEntry.storageTexture) {
                let texture = value as WebGPUInternalTex;

                cacheKey += `_${texture.globalId}`;

                let entry: GPUBindGroupEntry = {
                    binding: layoutEntry.binding,
                    resource: texture.getTextureView()
                };

                entries.push(entry);

            }

        });

        tempTex.clear();

        if (this.bindGroupCache.has(cacheKey)) {
            return this.bindGroupCache.get(cacheKey);
        }

        let descriptor: GPUBindGroupDescriptor = {
            label: "GPUBindGroupDescriptor" + commands?.join(","),
            layout: layout,
            entries: entries,
        };

        const device = WebGPURenderEngine._instance.getDevice();
        let bindGroup: GPUBindGroup = device.createBindGroup(descriptor);

        let res = new WebGPUBindGroup(info);
        res.gpuRS = bindGroup;
        res.layout = layout;

        this.bindGroupCache.set(cacheKey, res);

        return res;
    }

    getBindGroupByNode(resource: WebGPUUniformPropertyBindingInfo[], node: WebBaseRenderNode, textureExitsMask: number): WebGPUBindGroup {
        let commands = node?._commonUniformMap;
        let shaderData = node?.shaderData as WebGPUShaderData;
        let addition = node?.additionShaderData;

        let bindGroup = this.getBindGroup(commands, shaderData, addition, resource, textureExitsMask);
        return bindGroup;
    }

}

function getDefaultTexture(layout: GPUTextureBindingLayout) {
    switch (layout.viewDimension) {
        case "1d":
            return null;
        case "2d":
            return Texture2D.whiteTexture._texture as WebGPUInternalTex;
        case "2d-array":
        case "cube":
            return TextureCube.whiteTexture._texture as WebGPUInternalTex;
        case "cube-array":
        case "3d":
        default:
            return null;
    }

}
