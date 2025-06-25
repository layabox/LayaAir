import { LayaGL } from "../../../layagl/LayaGL";
import { Vector2 } from "../../../maths/Vector2";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebGPUCommandUniformMap } from "../RenderDevice/WebGPUCommandUniformMap";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUUniformBufferBase } from "../RenderDevice/WebGPUUniform/WebGPUUniformBufferBase";
import { WebGPURenderElement3D } from "./WebGPURenderElement3D";

export class WebGPUBaseRenderNode extends WebBaseRenderNode {
    //bindGroup的改动值
    bindGroupChangeFlag: Vector2 = new Vector2();
    //bindGroup值改动引起Layout改动的标签
    bindGroupLayoutChangeFlag: Vector2 = new Vector2();

    spriteUBOs: WebGPUUniformBufferBase[] = [];

    additionalUBOs: WebGPUUniformBufferBase[] = [];

    UBOUpdateChangeFlags: Vector2 = new Vector2();

    declare protected _shaderData: WebGPUShaderData;
    declare protected _additionShaderData: Map<string, WebGPUShaderData>;

    public get shaderData() {
        return this._shaderData;
    }
    public set shaderData(value) {
        this._shaderData = value;
    }

    public set additionShaderData(value: Map<string, WebGPUShaderData>) {
        if (!value)
            for (var [key, date] of this._additionShaderData) {//全删
                date.removeBindGroupChangeFlag(key, this.bindGroupChangeFlag, this.bindGroupLayoutChangeFlag);
            }
        else {
            for (var [key, date] of this._additionShaderData) {//删部分
                if (!value.has(key)) {
                    date.removeBindGroupChangeFlag(key, this.bindGroupChangeFlag, this.bindGroupLayoutChangeFlag);
                }
            }
        }

        this._additionShaderData = value;
        if (value && value.size > 0) {
            this._additionShaderDataKeys = Array.from(this._additionShaderData.keys());
            this.additionalUBOs.length = 0;
            for (var [key, shaderdate] of value) {
                let unifomrMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(key);
                let uniformBuffer = shaderdate.createSubUniformBuffer(key, key, unifomrMap._idata);
                uniformBuffer && this.additionalUBOs.push(uniformBuffer);
                shaderdate.addBindGroupChangeLink(key, unifomrMap._idata);
                shaderdate.addBindGroupChangeFlag(key, this.bindGroupChangeFlag, this.bindGroupLayoutChangeFlag);
            }
        }
        else {
            this._additionShaderDataKeys = [];
            this.additionalUBOs.length = 0;
        }
    }

    public setCommonUniformMap(value: string[]): void {
        //消除之前的影响
        //判断没有了的uniformMap,删除link
        this._commonUniformMap.forEach(element => {
            if (value.indexOf(element) == -1) {
                let unifomrMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(element);
                this._shaderData.removeBindGroupChangeLink(element, unifomrMap._idata);
            }
        })
        this._commonUniformMap.length = 0;
        value.forEach(element => {
            this._commonUniformMap.push(element);
            let unifomrMap = <WebGPUCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap(element);
            let uniformBuffer = this.shaderData.createSubUniformBuffer(element, element, unifomrMap._idata);
            uniformBuffer && this.spriteUBOs.push(uniformBuffer);
            this._shaderData.addBindGroupChangeLink(element, unifomrMap._idata);
            this.shaderData.addBindGroupChangeFlag(element, this.bindGroupChangeFlag, this.bindGroupLayoutChangeFlag);
        });
    }

    /**
     * @param value :RenderElementObj
     */
    setRenderelements(value: WebGPURenderElement3D[]): void {
        this.renderelements.length = 0;
        for (var i = 0; i < value.length; i++) {
            this.renderelements.push(value[i]);
            value[i].owner = this;
        }
    }
}