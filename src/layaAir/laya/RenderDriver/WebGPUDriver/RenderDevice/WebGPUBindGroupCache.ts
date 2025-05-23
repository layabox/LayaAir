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

export interface WebGPUBindGroupLayoutInfo {

    entries: GPUBindGroupLayoutEntry[];

    properties: number[];

    values: any[];

    textureStates: number;

    textureExits: number;
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

    private layoutCache: Map<string, GPUBindGroupLayout> = new Map<string, GPUBindGroupLayout>();

    // todo
    // cache bindgrouplayout
    getLayoutInfo(commands: string[], shaderData: WebGPUShaderData, addition: Map<string, ShaderData>, resources: WebGPUUniformPropertyBindingInfo[]) {

        let entries: GPUBindGroupLayoutEntry[] = [];
        let properties: number[] = [];
        let values: any[] = [];

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
                    values.push(value);

                    switch (resource.type) {
                        case WebGPUBindingInfoType.buffer:
                            entry.buffer = resource.buffer;
                            break;
                        case WebGPUBindingInfoType.texture:
                            entry.texture = resource.texture;
                            if (value) {
                                let tex = (value as WebGPUInternalTex);
                                tex._getGPUTextureBindingLayout(entry.texture);
                            }
                            break;
                        case WebGPUBindingInfoType.sampler:
                            entry.sampler = resource.sampler;
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
                            entry.buffer = resource.buffer;
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

        let info: WebGPUBindGroupLayoutInfo = {
            entries: entries,
            properties: properties,
            values: values,
            textureStates: textureStates,
            textureExits: textureExits,
        };

        return info;
    }

    // todo
    // cache bindgrouplayout
    getBindGroupLayout(info: WebGPUBindGroupLayoutInfo) {

        let descriptor: GPUBindGroupLayoutDescriptor = {
            label: "GPUBindGroupLayoutDescriptor",
            entries: info.entries,
        };

        const device = WebGPURenderEngine._instance.getDevice();
        let layout = device.createBindGroupLayout(descriptor);

        return layout;
    }

    getBindGroup(commands: string[], shaderData: WebGPUShaderData, addition: Map<string, ShaderData>, resource: WebGPUUniformPropertyBindingInfo[]) {

        let info = this.getLayoutInfo(commands, shaderData, addition, resource);

        let layout = this.getBindGroupLayout(info);

        let entries: GPUBindGroupEntry[] = [];

        let tempTex: Map<number, WebGPUInternalTex> = new Map();

        info.entries.forEach((layoutEntry, index) => {
            let propertyID = info.properties[index];
            let value = info.values[index];
            if (layoutEntry.buffer) {
                let buffer = value as WebGPUUniformBufferBase;

                let entry = buffer.getBindGroupEntry(layoutEntry.binding);

                entries.push(entry);
            }
            else if (layoutEntry.texture) {
                let texture = value as WebGPUInternalTex;

                if (!texture) {
                    texture = getDefaultTexture(layoutEntry.texture);
                    tempTex.set(propertyID, texture);
                }

                let entry: GPUBindGroupEntry = {
                    binding: layoutEntry.binding,
                    resource: texture.getTextureView(),
                };

                entries.push(entry);
            }
            else if (layoutEntry.sampler) {
                let texture = value as WebGPUInternalTex;

                if (!texture) {
                    texture = tempTex.get(propertyID);
                }

                let entry: GPUBindGroupEntry = {
                    binding: layoutEntry.binding,
                    resource: texture.sampler.source,
                };

                entries.push(entry);
            }

        });

        tempTex.clear();

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

        return res;
    }

    getBindGroupByNode(resource: WebGPUUniformPropertyBindingInfo[], node: WebBaseRenderNode): WebGPUBindGroup {
        let commands = node?._commonUniformMap;
        let shaderData = node?.shaderData as WebGPUShaderData;
        let addition = node?.additionShaderData;

        let bindGroup = this.getBindGroup(commands, shaderData, addition, resource);
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
