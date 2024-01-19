import { NativeRenderStateCommand } from "../../../RenderEngine/RenderEngine/NativeGLEngine/NativeRenderStateCommand";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IRenderEngineFactory } from "../../../RenderEngine/RenderInterface/IRenderEngineFactory";
import { RenderState } from "../../../RenderEngine/RenderShader/RenderState";
import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { NativeShaderInstance } from "../../../d3/RenderObjs/NativeOBJ/NativeShaderInstance";
import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { ISubshaderData, IShaderPassData } from "../../RenderInterface/RenderPipelineInterface/IShaderInstance";
import { ShaderData } from "../../RenderInterface/ShaderData";
import { ShaderPass } from "../../RenderShader/ShaderPass";
import { NativeCommandUniformMap } from "./NativeCommandUniformMap";
import { NativeShaderPass, NativeSubShader } from "./NativeModuleData";
import { NativeRenderState } from "./NativeRenderState";
import { NativeShaderData } from "./NativeShaderData";
import { NativeUniformBufferObject } from "./NativeUniformBufferObject";


export class NativeGLRenderEngineFactory implements IRenderEngineFactory {
    createSubShaderData(): ISubshaderData {
       return new NativeSubShader();
    }
    createShaderPass(pass: ShaderPass): IShaderPassData {
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
    createRenderState(): RenderState {
        return new NativeRenderState() as unknown as RenderState;
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