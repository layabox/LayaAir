import { RenderTexture } from "../../../resource/RenderTexture";
import { Shader3D } from "../../../shader/Shader3D";
import { ShaderData } from "../../../shader/ShaderData";
import { Camera } from "../../Camera";
import { BaseTexture } from "../../../../resource/BaseTexture";
/**
 * <code>CommandBuffer</code> 类用于创建命令流。
 */
export declare class CommandBuffer {
    /**@private */
    _camera: Camera;
    /**@private */
    private _commands;
    /**
     * 创建一个 <code>CommandBuffer</code> 实例。
     */
    constructor();
    /**
     *@private
     */
    _apply(): void;
    /**
     *@private
     */
    setShaderDataTexture(shaderData: ShaderData, nameID: number, source: BaseTexture): void;
    /**
     * 添加一条通过全屏四边形将源纹理渲染到目标渲染纹理指令。
     * @param	source 源纹理。
     * @param	dest  目标纹理。
     * @param	shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
     * @param	shaderData 着色器数据,如果为null只接收sourceTexture。
     * @param	subShader subShader索引,默认值为0。
     */
    blitScreenQuad(source: BaseTexture, dest: RenderTexture, shader?: Shader3D, shaderData?: ShaderData, subShader?: number): void;
    /**
     * 添加一条通过全屏三角形将源纹理渲染到目标渲染纹理指令。
     * @param	source 源纹理。
     * @param	dest  目标纹理。
     * @param	shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
     * @param	shaderData 着色器数据,如果为null只接收sourceTexture。
     * @param	subShader subShader索引,默认值为0。
     */
    blitScreenTriangle(source: BaseTexture, dest: RenderTexture, shader?: Shader3D, shaderData?: ShaderData, subShader?: number): void;
    /**
     *@private
     */
    setRenderTarget(renderTexture: RenderTexture): void;
    /**
     *@private
     */
    clear(): void;
}
