import { LayaGL } from "../../../layagl/LayaGL";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { LayaXCommandUniformMap } from "./LayaXCommandUniformMap";

/**
 * Binding type enum — numeric values match WebGPUBindingInfoType
 * so GLSLForVulkanGenerator can read .type without changes.
 */
export enum LayaXBindingInfoType {
    buffer = 0,
    texture = 1,
    sampler = 2,
    storageBuffer = 3,
    storageTexture = 4,
}

/**
 * Per-binding info for LayaX.
 *
 * Duck-type compatible with WebGPUUniformPropertyBindingInfo so
 * GLSLForVulkanGenerator.process can consume it without changes.
 * Also serialized to JSON for Rust FFI (layax_create_render_program).
 */
export interface LayaXBindingInfo {
    id: number;
    name: string;
    set: number;
    binding: number;
    propertyId: number;
    type: LayaXBindingInfoType;
    /** For Rust JSON serialization */
    bindingType: string;
    dataType: number;
    /** GLSLForVulkanGenerator reads these for texture/sampler declarations */
    texture?: { sampleType: string; viewDimension: string; multisampled: boolean };
    sampler?: { type: string };
    buffer?: { type: string; hasDynamicOffset?: boolean };
    storageTexture?: { access: string; format: string; viewDimension: string };
    format?: string;
}

export class LayaXBindGroupHelper {

    private static _cache: Map<string, LayaXBindingInfo[]> = new Map();

    private static _getCacheKey(groupID: number, mapNames: string[]): string {
        return `${groupID}_` + [...mapNames].sort().join("_");
    }

    private static _getTextureViewDimension(uniformType: ShaderDataType): string {
        switch (uniformType) {
            case ShaderDataType.Texture2D: return "2d";
            case ShaderDataType.Texture3D: return "3d";
            case ShaderDataType.TextureCube: return "cube";
            case ShaderDataType.Texture2DArray: return "2d-array";
            default: return "2d";
        }
    }

    /**
     * Build binding info array from CommandUniformMap names.
     * Mirrors WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap
     * but uses LayaXCommandUniformMap as data source.
     */
    static createBindingInfoArray(groupID: number, mapNames: string[]): LayaXBindingInfo[] {
        const cacheKey = this._getCacheKey(groupID, mapNames);
        const cached = this._cache.get(cacheKey);
        if (cached) return cached;

        let bindings: LayaXBindingInfo[] = [];
        let bindingIndex = 0;

        for (let i = 0; i < mapNames.length; i++) {
            const commandName = mapNames[i];
            const propertyId = Shader3D.propertyNameToID(commandName);
            const uniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap(commandName) as LayaXCommandUniformMap;

            // 1. UBO binding
            if (uniformMap._hasUniformBuffer) {
                let info: LayaXBindingInfo = {
                    id: 0,
                    name: commandName,
                    set: groupID,
                    binding: bindingIndex++,
                    propertyId: propertyId,
                    type: LayaXBindingInfoType.buffer,
                    bindingType: "uniform",
                    dataType: 0,
                    buffer: { type: "uniform" },
                };

                if (commandName == "SkinSprite3D") {
                    info.buffer!.hasDynamicOffset = true;
                }

                bindings.push(info);
            }

            // 2. Per-property bindings
            if (uniformMap && uniformMap._idata) {
                for (let [propID, prop] of uniformMap._idata) {
                    // Texture types → texture + sampler
                    if (prop.uniformtype >= ShaderDataType.Texture2D) {
                        let viewDim = this._getTextureViewDimension(prop.uniformtype);

                        bindings.push({
                            id: 0,
                            name: prop.propertyName + "_Texture",
                            set: groupID,
                            binding: bindingIndex++,
                            propertyId: propID,
                            type: LayaXBindingInfoType.texture,
                            bindingType: "texture",
                            dataType: prop.uniformtype,
                            texture: {
                                sampleType: "float",
                                viewDimension: viewDim,
                                multisampled: false,
                            },
                        });

                        bindings.push({
                            id: 0,
                            name: prop.propertyName + "_Sampler",
                            set: groupID,
                            binding: bindingIndex++,
                            propertyId: propID,
                            type: LayaXBindingInfoType.sampler,
                            bindingType: "sampler",
                            dataType: prop.uniformtype,
                            sampler: { type: "filtering" },
                            texture: {
                                sampleType: "float",
                                viewDimension: viewDim,
                                multisampled: false,
                            },
                        });
                    }

                    // ReadOnly storage buffer
                    if (prop.uniformtype == ShaderDataType.ReadOnlyDeviceBuffer) {
                        bindings.push({
                            id: 0,
                            name: prop.propertyName,
                            set: groupID,
                            binding: bindingIndex++,
                            propertyId: propID,
                            type: LayaXBindingInfoType.storageBuffer,
                            bindingType: "storageBufferReadOnly",
                            dataType: prop.uniformtype,
                            buffer: { type: "read-only-storage" },
                        });
                    }

                    // Storage buffer
                    if (prop.uniformtype == ShaderDataType.DeviceBuffer) {
                        bindings.push({
                            id: 0,
                            name: prop.propertyName,
                            set: groupID,
                            binding: bindingIndex++,
                            propertyId: propID,
                            type: LayaXBindingInfoType.storageBuffer,
                            bindingType: "storageBuffer",
                            dataType: prop.uniformtype,
                            buffer: { type: "storage" },
                        });
                    }

                    // Storage texture
                    if (prop.uniformtype == ShaderDataType.StorageTexture2D) {
                        bindings.push({
                            id: 0,
                            name: prop.propertyName,
                            set: groupID,
                            binding: bindingIndex++,
                            propertyId: propID,
                            type: LayaXBindingInfoType.storageTexture,
                            bindingType: "storageTexture",
                            dataType: prop.uniformtype,
                            format: prop.format,
                            storageTexture: {
                                access: prop.access || "write-only",
                                format: prop.format || "rgba8unorm",
                                viewDimension: "2d",
                            },
                        });
                    }
                }
            }
        }

        this._cache.set(cacheKey, bindings);
        return bindings;
    }

    /**
     * Build binding info array from a raw uniform map (for material set).
     * Equivalent to WebGPUBindGroupHelper.createBindGroupInfosByUniformMap.
     */
    static createBindingInfosByUniformMap(groupID: number, name: string, cacheName: string, uniformMap: Map<number, UniformProperty>): LayaXBindingInfo[] {
        const cacheKey = this._getCacheKey(groupID, [cacheName]);
        const cached = this._cache.get(cacheKey);
        if (cached) return cached;

        let bindings: LayaXBindingInfo[] = [];
        let bindingIndex = 0;
        const propertyId = Shader3D.propertyNameToID(name);

        let hasBuffer = false;
        for (let [propID, prop] of uniformMap) {
            if (prop.uniformtype < ShaderDataType.Texture2D
                && prop.uniformtype != ShaderDataType.DeviceBuffer
                && prop.uniformtype != ShaderDataType.ReadOnlyDeviceBuffer
                && prop.uniformtype != ShaderDataType.StorageTexture2D) {
                hasBuffer = true;
                break;
            }
        }

        if (hasBuffer) {
            bindings.push({
                id: 0,
                name: name,
                set: groupID,
                binding: bindingIndex++,
                propertyId: propertyId,
                type: LayaXBindingInfoType.buffer,
                bindingType: "uniform",
                dataType: 0,
                buffer: { type: "uniform" },
            });
        }

        for (let [propID, prop] of uniformMap) {
            if (prop.uniformtype >= ShaderDataType.Texture2D) {
                let viewDim = this._getTextureViewDimension(prop.uniformtype);

                bindings.push({
                    id: 0,
                    name: prop.propertyName + "_Texture",
                    set: groupID,
                    binding: bindingIndex++,
                    propertyId: propID,
                    type: LayaXBindingInfoType.texture,
                    bindingType: "texture",
                    dataType: prop.uniformtype,
                    texture: {
                        sampleType: "float",
                        viewDimension: viewDim,
                        multisampled: false,
                    },
                });

                bindings.push({
                    id: 0,
                    name: prop.propertyName + "_Sampler",
                    set: groupID,
                    binding: bindingIndex++,
                    propertyId: propID,
                    type: LayaXBindingInfoType.sampler,
                    bindingType: "sampler",
                    dataType: prop.uniformtype,
                    sampler: { type: "filtering" },
                    texture: {
                        sampleType: "float",
                        viewDimension: viewDim,
                        multisampled: false,
                    },
                });
            }

            if (prop.uniformtype == ShaderDataType.ReadOnlyDeviceBuffer) {
                bindings.push({
                    id: 0,
                    name: prop.propertyName,
                    set: groupID,
                    binding: bindingIndex++,
                    propertyId: propID,
                    type: LayaXBindingInfoType.storageBuffer,
                    bindingType: "storageBufferReadOnly",
                    dataType: prop.uniformtype,
                    buffer: { type: "read-only-storage" },
                });
            }

            if (prop.uniformtype == ShaderDataType.DeviceBuffer) {
                bindings.push({
                    id: 0,
                    name: prop.propertyName,
                    set: groupID,
                    binding: bindingIndex++,
                    propertyId: propID,
                    type: LayaXBindingInfoType.storageBuffer,
                    bindingType: "storageBuffer",
                    dataType: prop.uniformtype,
                    buffer: { type: "storage" },
                });
            }

            if (prop.uniformtype == ShaderDataType.StorageTexture2D) {
                bindings.push({
                    id: 0,
                    name: prop.propertyName,
                    set: groupID,
                    binding: bindingIndex++,
                    propertyId: propID,
                    type: LayaXBindingInfoType.storageTexture,
                    bindingType: "storageTexture",
                    dataType: prop.uniformtype,
                    format: prop.format,
                    storageTexture: {
                        access: prop.access || "write-only",
                        format: prop.format || "rgba8unorm",
                        viewDimension: "2d",
                    },
                });
            }
        }

        this._cache.set(cacheKey, bindings);
        return bindings;
    }

    /**
     * Compute texture existence bitmask for a set.
     */
    static computeTextureExits(setIndex: number, mapNames: string[], bindings: LayaXBindingInfo[]): number {
        let bitOffset = 0;
        let textureExits = 0;

        for (const name of mapNames) {
            let map = LayaGL.renderDeviceFactory.createGlobalUniformMap(name) as LayaXCommandUniformMap;
            for (const binding of bindings) {
                let propertyID = binding.propertyId;
                if (map.hasPtrID(propertyID)) {
                    if (binding.type === LayaXBindingInfoType.sampler) {
                        let textureBitIndex = map._textureBits.get(propertyID);
                        if (textureBitIndex !== undefined) {
                            let textureBit = textureBitIndex + bitOffset;
                            textureExits |= (1 << textureBit);
                        }
                    }
                }
            }
            bitOffset += map._textureCount;
        }

        return textureExits;
    }
}
