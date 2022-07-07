import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { SubUniformBufferData } from "../../RenderEngine/subUniformBufferData";
import { UniformBufferParamsType } from "../../RenderEngine/UniformBufferData";
import { UniformBufferObject } from "../../RenderEngine/UniformBufferObject";

export class TransLargeUBOUtils {
    static configStartLength: number = 1024;

    static addStep: number = 512;

    bindUBO: UniformBufferObject;

    maxlength: number;

    currentlength: number = 0;

    pool: SubUniformBufferData[];

    subDataMap: SubUniformBufferData[];

    subDataParamMap: Map<string, UniformBufferParamsType>;

    defaultSubData: SubUniformBufferData;

    /**
     * @internal
     * @param UBO
     * @param paramsMap
     * @param defautSubData 
     */
    constructor(UBO: UniformBufferObject, paramsMap: Map<string, UniformBufferParamsType>, defautSubData: SubUniformBufferData) {
        this.bindUBO = UBO;
        this.defaultSubData = defautSubData;
        UBO._reset(TransLargeUBOUtils.configStartLength * this.defaultSubData.getbyteLength());
        this.subDataParamMap = paramsMap;
        this.maxlength = TransLargeUBOUtils.configStartLength;
        this.subDataMap = [];
        this.pool = [];
        this.subDataMap.push(defautSubData);
        this.currentlength++;
    }

    /**
     * 
     * @returns 
     */
    create(): SubUniformBufferData {
        if (this.pool.length > 0) {
            const re = this.pool.pop();
            re._isInPool = false;
            return re;
        }
        if (this.maxlength == this.currentlength)
            this.reset();

        let uniformMap = new Map<number, UniformBufferParamsType>();
        this.subDataParamMap.forEach((value, key) => {
            uniformMap.set(Shader3D.propertyNameToID(key), value);
        })
        let subdata = new SubUniformBufferData(uniformMap, this.currentlength++);
        this.subDataMap.push(subdata);
        return subdata;
    }

    /**
     * 
     * @param subModuleData 
     */
    recover(subModuleData: SubUniformBufferData) {
        if (!subModuleData._isInPool) {
            this.pool.push(subModuleData);
            subModuleData._isInPool = true;
        }
    }

    /**
     * 
     */
    reset() {
        this.maxlength += TransLargeUBOUtils.addStep;
        this.bindUBO._reset(this.maxlength * this.defaultSubData.getbyteLength());
        //all update
        this.subDataMap.forEach(element => {
            this.bindUBO.setDataByByUniformBufferDataOffset(element, element._offset);
        });
    }

    /**
     * Update One subData
     * @param data 
     */
    updateSubData(data: SubUniformBufferData) {
        this.bindUBO.setDataByByUniformBufferDataOffset(data, data._offset);
        data._needUpdate = false;
    }

    updateBindRange(data: SubUniformBufferData) {
        let bytelenth = data.getbyteLength();
        this.bindUBO._bindBufferRange(data._offset * bytelenth, bytelenth);
    }


    /**
     * destroy
     */
    destroy() {
        this.subDataMap.forEach(element => {
            element.destroy();
        });

        delete this.subDataMap;
        delete this.pool;
        this.subDataMap = null;
        this.pool = null;
    }
}