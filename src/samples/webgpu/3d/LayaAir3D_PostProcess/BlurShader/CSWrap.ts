import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { LayaGL } from "laya/layagl/LayaGL";
import { Vector3 } from "laya/maths/Vector3";
import { ComputeCommandBuffer } from "laya/RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeCommandBuffer";
import { ComputeShader } from "laya/RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeShader";
import { CopyTextureInfo } from "laya/RenderDriver/DriverDesign/RenderDevice/ComputeShader/IComputeContext";
import { ShaderData, ShaderDataItem, ShaderDataType } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { IDefineDatas } from "laya/RenderDriver/RenderModuleData/Design/IDefineDatas";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { RenderTexture } from "laya/resource/RenderTexture";
import { Texture2D } from "laya/resource/Texture2D";


export class CSWrap {
    private _groupSizes: Vector3
    private _entryPoint: string;
    _name: string;
    private _shaderDefine: IDefineDatas;
    private _cs: ComputeShader
    shaderData: ShaderData;
    _uniformType:{[key:number]:ShaderDataType}={}
    private _dispatchParams=new Vector3();

    constructor(code: string, entryPoint: string, groupSize:Vector3, uniform_map: { [k:string]: ShaderDataType}, shaderdata?:ShaderData,name?:string,) {
        this._name = name;
        this._entryPoint = entryPoint;
        this._groupSizes = groupSize.clone();
        this._shaderDefine = LayaGL.unitRenderModuleDataFactory.createDefineDatas();

        let uniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap(name);
        for (let m in uniform_map) {
            let vid = Shader3D.propertyNameToID(m);
            uniformMap.addShaderUniform(vid, m, uniform_map[m]);
            this._uniformType[vid] = uniform_map[m];
        }

        this._cs = ComputeShader.createComputeShader(name, code, [uniformMap]);
        if(!shaderdata){
            this.shaderData = LayaGL.renderDeviceFactory.createShaderData();
        }else{
            this.shaderData = shaderdata;
        }
    }

    dispatchToCmd(cmd:ComputeCommandBuffer,numIterationsX: number, numIterationsY = 1, numIterationsZ = 1){
        const numGroupsX = Math.ceil(numIterationsX / this._groupSizes.x);
        const numGroupsY = Math.ceil(numIterationsY / this._groupSizes.y);
        const numGroupsZ = Math.ceil(numIterationsZ / this._groupSizes.z);
        this._dispatchParams.setValue(numGroupsX, numGroupsY, numGroupsZ);
        cmd.addDispatchCommand(this._cs, this._shaderDefine, [this.shaderData], this._dispatchParams);
    }
}

export class ComputeCommandWrap{
    private _commands = new ComputeCommandBuffer();

    start(){
        this._commands.clearCMDs();
    }
    dispatchCS(c:CSWrap,numIterationsX: number, numIterationsY = 1, numIterationsZ = 1){
        c.dispatchToCmd(this._commands,numIterationsX,numIterationsY,numIterationsZ);
    }

    setShaderData(cs:CSWrap, propertyID: number, value: ShaderDataItem){
        this._commands.addSetShaderDataCommand(cs.shaderData,propertyID,cs._uniformType[propertyID],value)
    }

    private _srcTextureObj={texture:null} as CopyTextureInfo;
    private _dstTextureObj={texture:null} as CopyTextureInfo;
    private _sizeObj={width:0,height:0}
    copyTexture(src:Texture2D|RenderTexture,dst:Texture2D|RenderTexture){
        this._srcTextureObj.texture = src._texture;
        this._dstTextureObj.texture = dst._texture;
        this._sizeObj.width=src.width;
        this._sizeObj.height=src.height;
        this._commands.addTextureToTextureCommand(this._srcTextureObj,this._dstTextureObj,this._sizeObj);
    }
    end(appltyToCmd:CommandBuffer){
        appltyToCmd.appatchComputeCommand(this._commands);
    }

}
