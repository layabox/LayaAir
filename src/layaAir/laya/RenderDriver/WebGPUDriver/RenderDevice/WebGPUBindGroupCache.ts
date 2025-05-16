import { LayaGL } from "../../../layagl/LayaGL";
import { Texture2D } from "../../../resource/Texture2D";
import { TextureCube } from "../../../resource/TextureCube";
import { ShaderData, ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebGPUCommandUniformMap } from "./WebGPUCommandUniformMap";
import { WebGPUInternalTex } from "./WebGPUInternalTex";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPUShaderData } from "./WebGPUShaderData";
import { WebGPUShaderInstance } from "./WebGPUShaderInstance";
import { WebGPUUniformBufferBase } from "./WebGPUUniform/WebGPUUniformBufferBase";

export interface WebGPUBindGroupLayoutInfo {

    entries: GPUBindGroupLayoutEntry[];

    properties: number[];

    values: any[];

    textureState: number;

    textureCount: number;
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
    // todo
    // cache bindgrouplayout
    getLayoutInfo(commands: string[], shaderData: WebGPUShaderData, addition: Map<string, ShaderData>, usedTexSet: Set<string>) {

        let entries: GPUBindGroupLayoutEntry[] = [];
        let properties: number[] = [];
        let values: any[] = [];

        let bindIndex = 0;

        let graphicVisibility = GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX;

        let textureState = 0;
        let bitVal = 1;
        let textureCount = 0;

        const func = (name: string, data: WebGPUShaderData) => {
            let map = LayaGL.renderDeviceFactory.createGlobalUniformMap(name) as WebGPUCommandUniformMap;
            if (map._ishasBuffer) {
                let entry: GPUBindGroupLayoutEntry = {
                    binding: bindIndex++,
                    visibility: graphicVisibility,
                    buffer: {
                        type: 'uniform',
                    }
                };
                entries.push(entry);
                properties.push(map._stateID);
                values.push(data._data[map._stateID]);
            }

            map._idata.forEach((uniform) => {
                // uniform is texture
                if (uniform.uniformtype >= ShaderDataType.Texture2D) {

                    let uniformExit = usedTexSet ? usedTexSet.has(uniform.propertyName) : true;

                    if (uniformExit) {
                        textureCount++;

                        let textureEntry: GPUBindGroupLayoutEntry = {
                            binding: bindIndex++,
                            visibility: graphicVisibility,
                            texture: {
                                sampleType: 'float',
                                viewDimension: '2d',
                                multisampled: false,
                            },
                        };
                        entries.push(textureEntry);
                        properties.push(uniform.id);
                        values.push(data._data[uniform.id]);

                        let samplerEntry: GPUBindGroupLayoutEntry = {
                            binding: bindIndex++,
                            visibility: graphicVisibility,
                            sampler: {
                                type: 'filtering',
                            }
                        };
                        entries.push(samplerEntry);
                        properties.push(uniform.id);
                        values.push(data._data[uniform.id]);

                        let tex = data._data[uniform.id] as WebGPUInternalTex;
                        if (tex) {
                            tex._getGPUTextureBindingLayout(textureEntry.texture);
                            tex._getSampleBindingLayout(samplerEntry.sampler);

                            if (samplerEntry.sampler.type != 'filtering') {
                                textureState |= bitVal;
                            }
                        }

                        bitVal = bitVal << 1;

                    }
                }
            });
        };

        commands?.forEach(mapName => {
            func(mapName, shaderData);
        });

        if (addition) {
            addition.forEach((data: ShaderData, mapName: string) => {
                func(mapName, data as WebGPUShaderData);
            });
        }

        let info: WebGPUBindGroupLayoutInfo = {
            entries: entries,
            properties: properties,
            values: values,
            textureState: textureState,
            textureCount: textureCount,
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

    getBindGroup(commands: string[], shaderData: WebGPUShaderData, addition: Map<string, ShaderData> = null, usedTexSet: Set<string> = null) {

        let info = this.getLayoutInfo(commands, shaderData, addition, usedTexSet);

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
            label: "GPUBindGroupDescriptor",
            layout: layout,
            entries: entries,
        };

        const device = WebGPURenderEngine._instance.getDevice();
        let bindGroup: GPUBindGroup = device.createBindGroup(descriptor);

        let res = new WebGPUBindGroup(info);
        res.gpuRS = bindGroup;

        return res;
    }

    getBindGroupByNode(node: WebBaseRenderNode, usedTexSet: Set<string> = null): WebGPUBindGroup {
        let commands = node?._commonUniformMap;
        let shaderData = node?.shaderData as WebGPUShaderData;
        let addition = node?.additionShaderData;

        let bindGroup = this.getBindGroup(commands, shaderData, addition, usedTexSet);
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
