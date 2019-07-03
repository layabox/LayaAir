import { BlitScreenQuadCMD } from "./BlitScreenQuadCMD";
import { SetRenderTargetCMD } from "./SetRenderTargetCMD";
import { SetShaderDataTextureCMD } from "./SetShaderDataTextureCMD";
/**
 * <code>CommandBuffer</code> 类用于创建命令流。
 */
export class CommandBuffer {
    /**
     * 创建一个 <code>CommandBuffer</code> 实例。
     */
    constructor() {
        /**@internal */
        this._camera = null;
        /**@internal */
        this._commands = [];
    }
    /**
     *@internal
     */
    _apply() {
        for (var i = 0, n = this._commands.length; i < n; i++)
            this._commands[i].run();
    }
    /**
     *@internal
     */
    setShaderDataTexture(shaderData, nameID, source) {
        this._commands.push(SetShaderDataTextureCMD.create(shaderData, nameID, source));
    }
    /**
     * 添加一条通过全屏四边形将源纹理渲染到目标渲染纹理指令。
     * @param	source 源纹理。
     * @param	dest  目标纹理。
     * @param	shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
     * @param	shaderData 着色器数据,如果为null只接收sourceTexture。
     * @param	subShader subShader索引,默认值为0。
     */
    blitScreenQuad(source, dest, shader = null, shaderData = null, subShader = 0) {
        this._commands.push(BlitScreenQuadCMD.create(source, dest, shader, shaderData, subShader, BlitScreenQuadCMD._SCREENTYPE_QUAD));
    }
    /**
     * 添加一条通过全屏三角形将源纹理渲染到目标渲染纹理指令。
     * @param	source 源纹理。
     * @param	dest  目标纹理。
     * @param	shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
     * @param	shaderData 着色器数据,如果为null只接收sourceTexture。
     * @param	subShader subShader索引,默认值为0。
     */
    blitScreenTriangle(source, dest, shader = null, shaderData = null, subShader = 0) {
        this._commands.push(BlitScreenQuadCMD.create(source, dest, shader, shaderData, subShader, BlitScreenQuadCMD._SCREENTYPE_TRIANGLE));
    }
    /**
     *@internal
     */
    setRenderTarget(renderTexture) {
        this._commands.push(SetRenderTargetCMD.create(renderTexture));
    }
    /**
     *@internal
     */
    clear() {
        for (var i = 0, n = this._commands.length; i < n; i++)
            this._commands[i].recover();
        this._commands.length = 0;
    }
}
