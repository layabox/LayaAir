import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";

export interface GpuScenePropertyRecordValueField {
    propertyId: number;
    uniformType: number;
    byteOffset: number;
}

export interface GpuScenePropertyRecordTextureField {
    propertyId: number;
    tokenByteOffset: number;
}

/** LayaX-internal fixed-stride record used only by the derived Resident variant. */
export interface GpuScenePropertyRecordSchema {
    schemaId: number;
    recordStrideInBytes: number;
    dataBufferPropertyId: number;
    fixedSamplerSourcePropertyId: number;
    resourcePagePropertyId: number;
    recordSet: number;
    resourcePageSet: number;
    resourcePageClass: number;
    resourcePageSlotCapacity: number;
    valueFields: GpuScenePropertyRecordValueField[];
    textureFields: GpuScenePropertyRecordTextureField[];
    generatedByLayaX?: boolean;
}

const MAX_FIELD_COUNT = 64;
const MAX_RECORD_STRIDE_IN_BYTES = 4 * 1024;
const RESOURCE_PAGE_SLOT_CAPACITY = 64;

/**
 * Builds the backend-owned property-record ABI used by a GPUScene variant.
 * Unsupported resources and arrays deliberately return null so Native keeps
 * the authoritative Classic path for the complete View.
 */
export function buildLayaXGpuScenePropertyRecordSchema(
    uniformMap: Map<number, UniformProperty>
): GpuScenePropertyRecordSchema | null {
    const uniforms = Array.from(uniformMap.values()).sort((left, right) => left.id - right.id);
    if (uniforms.length === 0 || uniforms.length > MAX_FIELD_COUNT) {
        return null;
    }

    const valueFields: GpuScenePropertyRecordSchema["valueFields"] = [];
    const textureFields: GpuScenePropertyRecordSchema["textureFields"] = [];
    let byteOffset = 0;

    for (const uniform of uniforms) {
        if (uniform.id === 0 || uniform.arrayLength > 0) {
            return null;
        }
        if (uniform.uniformtype === ShaderDataType.Texture2D) {
            textureFields.push({
                propertyId: uniform.id,
                tokenByteOffset: 0,
            });
            continue;
        }

        const byteSize = gpuSceneValueSize(uniform.uniformtype);
        if (byteSize === 0) {
            return null;
        }
        valueFields.push({
            propertyId: uniform.id,
            uniformType: uniform.uniformtype,
            byteOffset,
        });
        byteOffset += byteSize;
    }

    for (const field of textureFields) {
        field.tokenByteOffset = byteOffset;
        byteOffset += 4;
    }
    const recordStrideInBytes = alignUp(byteOffset, 16);
    if (recordStrideInBytes === 0 || recordStrideInBytes > MAX_RECORD_STRIDE_IN_BYTES) {
        return null;
    }

    const hasTextures = textureFields.length > 0;
    const schema: GpuScenePropertyRecordSchema = {
        schemaId: 0,
        recordStrideInBytes,
        dataBufferPropertyId: Shader3D.propertyNameToID("GpuSceneDataBuffer"),
        fixedSamplerSourcePropertyId: hasTextures ? textureFields[0].propertyId : 0,
        resourcePagePropertyId: hasTextures
            ? Shader3D.propertyNameToID("GpuSceneResourcePage")
            : 0,
        recordSet: 2,
        resourcePageSet: 3,
        resourcePageClass: hasTextures ? 1 : 0,
        resourcePageSlotCapacity: hasTextures ? RESOURCE_PAGE_SLOT_CAPACITY : 0,
        valueFields,
        textureFields,
        generatedByLayaX: true,
    };
    schema.schemaId = hashSchema(schema);
    return schema;
}

function gpuSceneValueSize(type: ShaderDataType): number {
    switch (type) {
        case ShaderDataType.Int:
        case ShaderDataType.Bool:
        case ShaderDataType.Float:
            return 4;
        case ShaderDataType.Vector2:
            return 8;
        case ShaderDataType.Vector3:
            return 12;
        case ShaderDataType.Vector4:
        case ShaderDataType.Color:
            return 16;
        case ShaderDataType.Matrix4x4:
            return 64;
        case ShaderDataType.Matrix3x3:
            return 36;
        default:
            return 0;
    }
}

function alignUp(value: number, alignment: number): number {
    return Math.ceil(value / alignment) * alignment;
}

function hashSchema(schema: GpuScenePropertyRecordSchema): number {
    let hash = 2166136261;
    const mix = (value: number) => {
        hash ^= value >>> 0;
        hash = Math.imul(hash, 16777619) >>> 0;
    };
    mix(schema.recordStrideInBytes);
    for (const field of schema.valueFields) {
        mix(field.propertyId);
        mix(field.uniformType);
        mix(field.byteOffset);
    }
    for (const field of schema.textureFields) {
        mix(field.propertyId);
        mix(field.tokenByteOffset);
    }
    // Reserve the high-bit namespace for automatically generated layouts and
    // keep zero unavailable as required by Native validation.
    return ((hash & 0x7fffffff) | 0x80000000) >>> 0;
}
