import { CommandEncoder } from "../../../layagl/CommandEncoder";
import { ShaderNode } from "../../../webgl/utils/ShaderNode";
import { CommandUniformMap } from "../../CommandUniformMap";
import { IRenderShaderInstance } from "../../RenderInterface/IRenderShaderInstance";
import { ShaderDataType } from "../../RenderShader/ShaderData";
import { WebGPUEngine } from "./WebGPUEngine";
import { WebGPUObject } from "./WebGPUObject";
import { WGPUBindGroupLayoutHelper } from "./WGPUBindGroupLayoutHelper";
import { WGPUShaderVariable } from "./WGPUShaderVariable";

export class WebGPUShaderInstance extends WebGPUObject implements IRenderShaderInstance {
    //protected _engine:WebGPUEngine;
    //protected _context:GPUCanvasContext;
    _complete: boolean;
    /**@internal */
    private _vs: string;
    /**@internal */
    private _ps: string;
    /**@internal */
    private _uniformMap: WGPUShaderVariable[];
    /**@internal VertexState*/
    private _vsshader: GPUShaderModule;
    /**@internal fragmentModule*/
    private _psshader: GPUShaderModule;
    
    private _pipelineLayout:GPUPipelineLayout;
    
    constructor(engine: WebGPUEngine) {
        super(engine);
    
        this._uniformMap = [];
    }

    _WGSLShaderLanguageProcess3D(vs:ShaderNode,fs:ShaderNode){
        //翻译vs
        //翻译fs
        //组织宏
        //根据宏 找到SceneCommand
        //根据宏 找到CameraCommand
        //根据宏 找到SpriteCommand
        //摘掉Material applyBindGroupLayoutByUniformMap
        //组织WGPUShaderVariable
        var __vs: any[] = vs.toscript([], []);
        var __fs: any[] = fs.toscript([], []);
        this._vs = __vs.join('\n');//TODO
        this._ps = __fs.join('\n');//TODO
        this.create();
    }

    create() {
        this._vsshader = this._engine._device.createShaderModule({
            code: this._vs,
        });
        this._psshader = this._engine._device.createShaderModule({
            code: this._ps
        });
    }

    /**
     * contactBindGroupLayout
     * @returns 
     */
    private _contactBindGroupLayout(variables: WGPUShaderVariable[]) {
        for (let i = 0, n = variables.length; i < n; i++) {
            let variable = variables[i];
            variable.location = this._uniformMap.length;
            this._uniformMap.push(variable);
        }
    }

    getVertexModule(): GPUShaderModule {
        return this._vsshader;
    }

    getFragmentModule(): GPUShaderModule {
        return this._psshader;
    }

    getUniformMap(): WGPUShaderVariable[] {
        return this._uniformMap;
    }


    //Material
    applyBindGroupLayoutByUniformMap(uniformMap: { [name: string]: ShaderDataType }, command: CommandEncoder) {
        let out: WGPUShaderVariable[] = [];
        WGPUBindGroupLayoutHelper.getBindGroupLayoutByUniformMap(uniformMap, out);
        for (let i = 0, n = out.length; i < n; i++) {
            command.addShaderUniform(out[i]);
        }
        this._contactBindGroupLayout(out);
    }

    //scene
    //camera
    //Sprite
    //TODO
    applyBindGroupLayout(map: CommandUniformMap, command: CommandEncoder) {
        let out: WGPUShaderVariable[] = [];
        WGPUBindGroupLayoutHelper.getBindGroupLayoutByMap(map, out);
        for (let i = 0, n = out.length; i < n; i++) {
            command.addShaderUniform(out[i]);
        }
        this._contactBindGroupLayout(out);
    }

    getWGPUPipelineLayout(): GPUPipelineLayout {
        if(!this._pipelineLayout){
            let gpubindGroups = [];
            for (let i = 0, n = this._uniformMap.length; i < n; i++) {
                gpubindGroups.push(this._uniformMap[i].groupLayout);
            }
            let pipelinelayoutDes: GPUPipelineLayoutDescriptor = {
                bindGroupLayouts: gpubindGroups
            }
            this._pipelineLayout = this._engine._device.createPipelineLayout(pipelinelayoutDes);
        }
        return this._pipelineLayout;
    }

    bind(): boolean {
        return true;
    }
}