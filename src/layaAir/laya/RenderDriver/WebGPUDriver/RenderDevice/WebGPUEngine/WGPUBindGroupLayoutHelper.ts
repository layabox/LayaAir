
import { CommandUniformMap } from "../../../../RenderEngine/CommandUniformMap";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "../../../../layagl/LayaGL";
import { ShaderDataType } from "../../../RenderModuleData/Design/ShaderData";
import { WGPUShaderVariable } from "./WGPUShaderVariable";
import { WebGPUEngine } from "./WebGPUEngine";

export class WGPUBindGroupLayoutHelper {
    /**
     * CommandUniformMap生成GPUBindGroupLayout
     * @param bindStart 
     * @param map 
     * @param out 
     * 
     * @returns 
     */
    static getBindGroupLayoutByMap(map: CommandUniformMap, out: WGPUShaderVariable[]) {
        let data = map._idata;
        out.length = 0;

        for (var i in data) {
            let one = data[i];
            let shaderVariable = new WGPUShaderVariable();
            out.push(shaderVariable);
            if (one.blockProperty) {
                let entrys = [];
                shaderVariable.name = one.propertyName;
                shaderVariable.dataOffset = Shader3D.propertyNameToID(one.propertyName);
                shaderVariable.block = true;
                shaderVariable.blockProperty = [];
                for (var i in one.blockProperty) {
                    let property = one.blockProperty[i];
                    let index = 0;
                    switch (property.uniformtype) {//TODO texture
                        case ShaderDataType.Buffer:
                        case ShaderDataType.Matrix4x4:
                        case ShaderDataType.Vector4:
                        case ShaderDataType.Color:
                        case ShaderDataType.Vector3:
                        case ShaderDataType.Vector2:
                        case ShaderDataType.Bool:
                        case ShaderDataType.Float:
                        case ShaderDataType.Int:
                            entrys.push(WGPUBindGroupLayoutHelper.createBufferLayoutEntry(index, GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, "uniform"));
                            shaderVariable.blockProperty.push(property);
                            break;
                        default:
                            break;
                    }
                }
                shaderVariable.groupLayout = (LayaGL.renderEngine as WebGPUEngine)._device.createBindGroupLayout({ entries: entrys });
            } else {
                //One BindGroup
                shaderVariable.name = one.propertyName;
                shaderVariable.type = one.uniformtype;
                shaderVariable.dataOffset = Shader3D.propertyNameToID(one.propertyName);
                switch (one.uniformtype) {//TODO 参数还得继续规范
                    case ShaderDataType.Texture2D:
                        shaderVariable.groupLayout = WGPUBindGroupLayoutHelper.getTextureBindGroupLayout(GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, "2d", false, "float", "filtering");
                        break;
                    case ShaderDataType.TextureCube://TODO
                        shaderVariable.groupLayout = WGPUBindGroupLayoutHelper.getTextureBindGroupLayout(GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, "cube", false, "float", "filtering")
                        break;
                    case ShaderDataType.Buffer:
                    case ShaderDataType.Matrix4x4:
                    case ShaderDataType.Vector4:
                    case ShaderDataType.Color:
                    case ShaderDataType.Vector3:
                    case ShaderDataType.Vector2:
                    case ShaderDataType.Bool:
                    case ShaderDataType.Float:
                    case ShaderDataType.Int:
                        shaderVariable.groupLayout = WGPUBindGroupLayoutHelper.getBufferBindGroupLayout(GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, "uniform");
                        break;
                    default:
                        break;
                }
            }
        }
    }

    static getBindGroupLayoutByUniformMap(uniformMap: { [name: string]: ShaderDataType }, out: WGPUShaderVariable[]) {
        out.length = 0;
        for (const key in uniformMap) {
            let shaderVariable = new WGPUShaderVariable();
            shaderVariable.name = key;
            shaderVariable.dataOffset = Shader3D.propertyNameToID(key);
            out.push(shaderVariable);
            if (typeof uniformMap[key] == "object") {
                shaderVariable.block = true;
                shaderVariable.blockProperty = [];
                let entrys = [];
                let index = 0;
                let block = uniformMap[key] as any;
                for (const uniformName in block) {
                    let uniformType = block[uniformName];
                    switch (uniformType) {//TODO texture
                        case ShaderDataType.Buffer:
                        case ShaderDataType.Matrix4x4:
                        case ShaderDataType.Vector4:
                        case ShaderDataType.Color:
                        case ShaderDataType.Vector3:
                        case ShaderDataType.Vector2:
                        case ShaderDataType.Bool:
                        case ShaderDataType.Float:
                            entrys.push(WGPUBindGroupLayoutHelper.createBufferLayoutEntry(index++, GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, "uniform"));
                            shaderVariable.blockProperty.push({ id: Shader3D.propertyNameToID(uniformName), propertyName: uniformName, uniformtype: uniformType as ShaderDataType });
                            break;
                        case ShaderDataType.Texture2D:
                            let texEntry = WGPUBindGroupLayoutHelper.createTextureLayoutEntry(index++, GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, "2d", false, "float");
                            let samplerEntry = WGPUBindGroupLayoutHelper.createSamplerLayoutEntry(index++, GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, "filtering");
                            entrys.push(texEntry, samplerEntry);
                            shaderVariable.blockProperty.push({ id: Shader3D.propertyNameToID(uniformName), propertyName: uniformName, uniformtype: uniformType as ShaderDataType });
                            break;
                        case ShaderDataType.TextureCube:
                            //TODO
                            break;
                        default:
                            break;
                    }
                }
                shaderVariable.groupLayout = (LayaGL.renderEngine as WebGPUEngine)._device.createBindGroupLayout({ entries: entrys });
                
            }
            else {
                shaderVariable.type = uniformMap[key];
                let unifromType = <ShaderDataType>uniformMap[key];
                switch (unifromType) {//TODO 参数还得继续规范
                    case ShaderDataType.Texture2D:
                        shaderVariable.groupLayout = WGPUBindGroupLayoutHelper.getTextureBindGroupLayout(GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, "2d", false, "float", "filtering");
                        break;
                    case ShaderDataType.TextureCube://TODO
                        shaderVariable.groupLayout = WGPUBindGroupLayoutHelper.getTextureBindGroupLayout(GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, "cube", false, "float", "filtering")
                        break;
                    case ShaderDataType.Buffer:
                    case ShaderDataType.Matrix4x4:
                    case ShaderDataType.Vector4:
                    case ShaderDataType.Color:
                    case ShaderDataType.Vector3:
                    case ShaderDataType.Vector2:
                    case ShaderDataType.Bool:
                    case ShaderDataType.Float:
                        shaderVariable.groupLayout = WGPUBindGroupLayoutHelper.getBufferBindGroupLayout(GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, "uniform");
                        break;
                    default:
                        break;
                }
            }
        }
    }


    static getTextureBindGroupLayout(visibility: GPUShaderStageFlags, dimension: GPUTextureViewDimension = "2d", mulsampler: boolean = false, GPUTtextureType: GPUTextureSampleType = "float", samplerType: GPUSamplerBindingType = "filtering") {
        let texEntry = WGPUBindGroupLayoutHelper.createTextureLayoutEntry(0, visibility, dimension, mulsampler, GPUTtextureType);
        let samplerEntry = WGPUBindGroupLayoutHelper.createSamplerLayoutEntry(1, visibility, samplerType);
        let bindGroupLayoutDes: GPUBindGroupLayoutDescriptor = {
            entries: [
                texEntry,
                samplerEntry
            ]
        };
        return (LayaGL.renderEngine as WebGPUEngine)._device.createBindGroupLayout(bindGroupLayoutDes);
    }

    static getBufferBindGroupLayout(visibility: GPUShaderStageFlags, bufferBindType: GPUBufferBindingType = "uniform") {
        let bindGroupLayoutDes: GPUBindGroupLayoutDescriptor = {
            entries: [
                WGPUBindGroupLayoutHelper.createBufferLayoutEntry(0, visibility, bufferBindType)
            ]
        }
        return (LayaGL.renderEngine as WebGPUEngine)._device.createBindGroupLayout(bindGroupLayoutDes);
    }

    /**
     * BufferEntry
     * @returns 
     */
    static createBufferLayoutEntry(binding: number, visibility: GPUShaderStageFlags, bufferBindType: GPUBufferBindingType, dynamicOffset: boolean = false): GPUBindGroupLayoutEntry {
        let bufferLayout: GPUBufferBindingLayout = {
            type: bufferBindType,
            hasDynamicOffset: dynamicOffset
        }
        let ob: GPUBindGroupLayoutEntry = {
            binding: binding,
            visibility: visibility,
            buffer: bufferLayout
        }
        return ob;
    }

    /**
     * TextureEntry
     * @returns 
     */
    static createTextureLayoutEntry(binding: number, visibility: GPUShaderStageFlags, dimension: GPUTextureViewDimension = "2d", mulsampler: boolean = false, GPUTtextureType: GPUTextureSampleType = "float"): GPUBindGroupLayoutEntry {
        let textureLayout: GPUTextureBindingLayout = {
            sampleType: GPUTtextureType,
            viewDimension: dimension,
            multisampled: mulsampler
        };
        let ob: GPUBindGroupLayoutEntry = {
            binding: binding,
            visibility: visibility,
            texture: textureLayout
        }
        return ob;
    }

    /**
     * SamplerEntry
     * @returns 
     */
    static createSamplerLayoutEntry(binding: number, visibility: GPUShaderStageFlags, samplerType: GPUSamplerBindingType = "filtering"): GPUBindGroupLayoutEntry {

        let layout: GPUSamplerBindingLayout = {
            type: samplerType
        }
        let ob: GPUBindGroupLayoutEntry = {
            binding: binding,
            visibility: visibility,
            sampler: layout
        }
        return ob;
    }

    /**
     * StrorageEntry
     * @returns 
     */
    static createStorageTextureEntry(binding: number, visibility: GPUShaderStageFlags, textureFormat: GPUTextureFormat, dimension: GPUTextureViewDimension = "2d"): GPUBindGroupLayoutEntry {
        let layout: GPUStorageTextureBindingLayout = {
            access: "write-only",
            format: textureFormat,
            viewDimension: dimension
        }
        let ob: GPUBindGroupLayoutEntry = {
            binding: binding,
            visibility: visibility,
            storageTexture: layout
        }
        return ob;
    }

    /**
     * ExternalTextureEntry
     * @returns 
     */
    static createExternalTextureEntry(): GPUBindGroupLayoutEntry {
        //TODO
        return null;
    }
}