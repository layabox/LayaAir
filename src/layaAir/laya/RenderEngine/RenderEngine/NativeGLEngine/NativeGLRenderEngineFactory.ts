import { NativeRenderStateCommand } from "../../../RenderEngine/RenderEngine/NativeGLEngine/NativeRenderStateCommand";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IRenderEngineFactory } from "../../../RenderEngine/RenderInterface/IRenderEngineFactory";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { NativeShaderInstance } from "../../../d3/RenderObjs/NativeOBJ/NativeShaderInstance";
import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IDefineDatas } from "../../RenderInterface/RenderPipelineInterface/IShaderInstance";
import { ShaderData } from "../../RenderInterface/ShaderData";
import { ShaderPass } from "../../RenderShader/ShaderPass";
import { NativeCommandUniformMap } from "./NativeCommandUniformMap";
import { NativeDefineDatas, NativeShaderDefine, NativeShaderPass, NativeSubShader } from "./NativeModuleData";
import { NativeRenderState } from "./NativeRenderState";
import { NativeShaderData } from "./NativeShaderData";
import { NativeUniformBufferObject } from "./NativeUniformBufferObject";


export class NativeGLRenderEngineFactory implements IRenderEngineFactory {

    createDefineDatas(): IDefineDatas {
        return new NativeDefineDatas()
    }

    createShaderDefine(index: number, value: number): NativeShaderDefine {
        return new NativeShaderDefine(index, value);
    }

    createSubShaderData(): NativeSubShader {
        return new NativeSubShader();
    }

    createShaderPass(pass: ShaderPass): NativeShaderPass {
        return new NativeShaderPass(pass);
    }

    createShaderData(): ShaderData {
        return new NativeShaderData();
    }

    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): any {
        let shaderins = new NativeShaderInstance();
        shaderins._create(shaderProcessInfo, shaderPass);
        return shaderins;
    }

    createRenderStateComand(): NativeRenderStateCommand {
        return new NativeRenderStateCommand();
    }
    createRenderState(): NativeRenderState {
        return new NativeRenderState();
    }

    createUniformBufferObject(glPointer: number, name: string, bufferUsage: BufferUsage, byteLength: number, isSingle: boolean): UniformBufferObject {
        return new NativeUniformBufferObject(glPointer, name, bufferUsage, byteLength, isSingle);
    }

    createGlobalUniformMap(blockName: string): NativeCommandUniformMap {
        return new NativeCommandUniformMap((window as any).conchCommandUniformMap.createGlobalUniformMap(blockName), blockName);
    }

    createEngine(config: any, canvas: any) {
        //TODO:
        return Promise.resolve();
    }
}