import { NativeRenderStateCommand } from "../../../RenderEngine/RenderEngine/NativeGLEngine/NativeRenderStateCommand";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IRenderEngineFactory } from "../../../RenderEngine/RenderInterface/IRenderEngineFactory";
import { RenderState } from "../../../RenderEngine/RenderShader/RenderState";
import { ShaderData } from "../../../RenderEngine/RenderShader/ShaderData";
import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { NativeCommandUniformMap } from "./NativeCommandUniformMap";
import { NativeRenderState } from "./NativeRenderState";
import { NativeShaderData } from "./NativeShaderData";
import { NativeUniformBufferObject } from "./NativeUniformBufferObject";


export class NativeGLRenderEngineFactory implements IRenderEngineFactory {



    createShaderData(): ShaderData {
        return new NativeShaderData();
    }

    createShaderInstance(shaderProcessInfo:ShaderProcessInfo, shaderPass: ShaderCompileDefineBase): ShaderInstance {
        //return new NativeShaderInstance(vs, ps, attributeMap, shaderPass) as unknown as ShaderInstance;
        //TODO
        return null;
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

    createGlobalUniformMap(blockName: string): NativeCommandUniformMap{
        return new NativeCommandUniformMap((window as any).conchCommandUniformMap.createGlobalUniformMap(blockName), blockName);
    }

    createEngine(config:any,canvas:any){
        //TODO:
        return Promise.resolve();
    }
}