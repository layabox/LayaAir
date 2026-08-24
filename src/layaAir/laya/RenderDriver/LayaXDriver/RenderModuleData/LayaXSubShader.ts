import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ISubshaderData } from "../../RenderModuleData/Design/ISubShaderData";
import { IShaderPassData } from "../../RenderModuleData/Design/IShaderPassData";
import { LayaGL } from "../../../layagl/LayaGL";
import { LayaXCommandUniformMap } from "../RenderDevice/LayaXCommandUniformMap";
import { LayaXShaderPass } from "./LayaXShaderPass";
import { buildLayaXGpuScenePropertyRecordSchema, GpuScenePropertyRecordSchema } from "./LayaXGpuScenePropertyRecord";

/**
 * LayaX SubShader — native C++-backed SubShader container.
 *
 * SubShaderHandle doubles as shader_template_id for the variant cache key.
 * Holds passes, uniform properties, and instance flag.
 */
export class LayaXSubShader implements ISubshaderData {
    _nativeObj: any;
    private _shaderName: string = "";
    // Capability publication is a LayaX backend concern. Every SubShader is
    // examined automatically; unsupported layouts fail closed to Classic.
    private _gpuScenePropertyRecordSchema: GpuScenePropertyRecordSchema | null = null;

    constructor() {
        this._nativeObj = new (window as any).conchLayaXSubShader();
        this._nativeObj.create();
        this._nativeObj.setGPUSceneCompatible(false);
    }

    get shaderName(): string {
        return this._shaderName;
    }

    set shaderName(value: string) {
        this._shaderName = value;
        this._nativeObj.setName(value);
        this._ensureMaterialMap();
    }

    get enableInstance(): boolean {
        return false; // TODO: read from native
    }

    set enableInstance(value: boolean) {
        this._nativeObj.setEnableInstance(value);
    }

    get gpuScenePropertyRecordSchema(): GpuScenePropertyRecordSchema | null {
        return this._gpuScenePropertyRecordSchema;
    }

    private _publishGPUScenePropertyRecordSchema(schema: GpuScenePropertyRecordSchema | null): void {
        if (!schema) {
            this._gpuScenePropertyRecordSchema = null;
            this._nativeObj.clearGPUScenePropertyRecordSchema();
            this._nativeObj.setGPUSceneCompatible(false);
            return;
        }
        if (typeof this._nativeObj.setGPUScenePropertyRecordSchemaV2 !== "function") {
            this._gpuScenePropertyRecordSchema = null;
            this._nativeObj.clearGPUScenePropertyRecordSchema();
            this._nativeObj.setGPUSceneCompatible(false);
            console.error("GPUScene generic property-record schema requires a matching Native runtime");
            return;
        }
        const valueFields = new Uint32Array(schema.valueFields.length * 3);
        schema.valueFields.forEach((field, index) => {
            const offset = index * 3;
            valueFields[offset] = field.propertyId;
            valueFields[offset + 1] = field.uniformType;
            valueFields[offset + 2] = field.byteOffset;
        });
        const textureFields = new Uint32Array(schema.textureFields.length * 2);
        schema.textureFields.forEach((field, index) => {
            const offset = index * 2;
            textureFields[offset] = field.propertyId;
            textureFields[offset + 1] = field.tokenByteOffset;
        });
        const accepted = this._nativeObj.setGPUScenePropertyRecordSchemaV2(
            schema.schemaId,
            schema.recordStrideInBytes,
            schema.dataBufferPropertyId,
            schema.fixedSamplerSourcePropertyId,
            schema.resourcePagePropertyId,
            schema.resourcePageClass,
            schema.resourcePageSlotCapacity,
            valueFields,
            textureFields
        );
        if (!accepted) {
            this._gpuScenePropertyRecordSchema = null;
            this._nativeObj.clearGPUScenePropertyRecordSchema();
            this._nativeObj.setGPUSceneCompatible(false);
            console.error("GPUScene property-record schema rejected by Native validation");
            return;
        }
        this._gpuScenePropertyRecordSchema = {
            ...schema,
            valueFields: schema.valueFields.map(field => ({ ...field })),
            textureFields: schema.textureFields.map(field => ({ ...field })),
        };
        this._nativeObj.setGPUSceneCompatible(true);
    }

    setUniformMap(_uniformMap: Map<number, UniformProperty>): void {
        this._syncUniformProperties(_uniformMap);
        this._pendingUniformMap = _uniformMap;
        this._ensureMaterialMap();
        this._publishGPUScenePropertyRecordSchema(
            buildLayaXGpuScenePropertyRecordSchema(_uniformMap)
        );
    }

    private _pendingUniformMap: Map<number, UniformProperty> | null = null;
    private _uniformPropertyIds: Set<number> = new Set();

    private _syncUniformProperties(uniformMap: Map<number, UniformProperty>): void {
        uniformMap.forEach((value) => {
            if (this._uniformPropertyIds.has(value.id)) {
                return;
            }
            this._nativeObj.addUniformProperty(
                value.id,
                value.propertyName,
                value.uniformtype,
                value.arrayLength
            );
            this._uniformPropertyIds.add(value.id);
        });
    }

    /** Create global CommandUniformMap for material Set3 using SubShader's uniform properties */
    private _ensureMaterialMap(): void {
        if (!this._pendingUniformMap || !this._shaderName) return;
        let map = LayaGL.renderDeviceFactory.createGlobalUniformMap(this._shaderName) as LayaXCommandUniformMap;
        this._pendingUniformMap.forEach((value) => {
            if (map._idata.has(value.id)) {
                return;
            }
            if (value.arrayLength > 0) {
                map.addShaderUniformArray(value.id, value.propertyName, value.uniformtype, value.arrayLength);
            } else {
                map.addShaderUniform(value.id, value.propertyName, value.uniformtype);
            }
        });
        this._pendingUniformMap = null;
    }

    addShaderPass(pass: IShaderPassData): void {
        const layaxPass = pass as LayaXShaderPass;
        layaxPass.syncOwnerUniformMap();
        this._nativeObj.addShaderPass(layaxPass._nativeObj);
    }

    destroy(): void {
        this._nativeObj.destroy();
    }
}
