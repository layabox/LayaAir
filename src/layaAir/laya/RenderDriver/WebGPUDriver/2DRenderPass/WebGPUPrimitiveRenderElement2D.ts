import { LayaGL } from "../../../layagl/LayaGL";
import { IPrimitiveRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { WebGPUCommandUniformMap } from "../RenderDevice/WebGPUCommandUniformMap";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUUniformBufferBase } from "../RenderDevice/WebGPUUniform/WebGPUUniformBufferBase";
import { WebGPURenderElement2D } from "./WebGPURenderElement2D";

export class WebGPUPrimitiveRenderElement2D extends WebGPURenderElement2D implements IPrimitiveRenderElement2D {

    private _sprite2DGraphicUBOs: WebGPUUniformBufferBase;
    private _primitiveShaderData: WebGPUShaderData;
    public get primitiveShaderData(): WebGPUShaderData {
        return this._primitiveShaderData;
    }
    public set primitiveShaderData(value: WebGPUShaderData) {
        if (this._primitiveShaderData == value)
            return;
        let primitiveAdditionalKey = "Sprite2DGraphics";

        let oldData = this._additionShaderData.get(primitiveAdditionalKey);
        if (oldData) {
            oldData.removeBindGroupChangeFlag(primitiveAdditionalKey, this._value2DBindGroupChangeFlag, this._value2DBindGroupLayoutFlag);
            oldData._defineDatas.removeChangeFlagInfo(this._value2DDefChangeFlag);
            this._additionShaderData.delete(primitiveAdditionalKey);
            this._sprite2DGraphicUBOs = null;
        }
        if (value) {
            this._additionShaderData.set(primitiveAdditionalKey, value);
            let unifomrMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(primitiveAdditionalKey);
            this._sprite2DGraphicUBOs = value.createSubUniformBuffer(primitiveAdditionalKey, primitiveAdditionalKey, unifomrMap._idata);
            value.addBindGroupChangeLink(primitiveAdditionalKey, unifomrMap._idata);
            value.addBindGroupChangeFlag(primitiveAdditionalKey, this._value2DBindGroupChangeFlag, this._value2DBindGroupLayoutFlag);
            value._defineDatas.addChangeFlagInfo(this._value2DDefChangeFlag);
            this._additinalArray.push(primitiveAdditionalKey);
        }
    }

    protected _updateNodeUBO() {
        super._updateNodeUBO();
        if (this._sprite2DGraphicUBOs) {
            this._sprite2DGraphicUBOs.upload();
        }
    }

    constructor() {
        super();
    }
}