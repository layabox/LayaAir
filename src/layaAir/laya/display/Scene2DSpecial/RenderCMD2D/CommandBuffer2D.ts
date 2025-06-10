import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Matrix } from "../../../maths/Matrix";
import { Vector2 } from "../../../maths/Vector2";
import { Vector4 } from "../../../maths/Vector4";
import { IRenderContext2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderTarget } from "../../../RenderDriver/DriverDesign/RenderDevice/IRenderTarget";
import { checkShaderDataValueLegal, ShaderData, ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "../../../resource/Material";
import { Mesh2D } from "../../../resource/Mesh2D";
import { Texture2D } from "../../../resource/Texture2D";
import { Stat } from "../../../utils/Stat";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { RenderState2D } from "../../../webgl/utils/RenderState2D";
import { Render2DProcessor } from "../../Render2DProcessor";
import { Scene } from "../../Scene";
import { Mesh2DRender } from "../Mesh2DRender";
import { Blit2DCMD } from "./Blit2DCMD";
import { Command2D } from "./Command2D";
import { DrawMesh2DCMD } from "./DrawMesh2DCMD";
import { DrawRenderElement2DCMD } from "./DrawRenderElement2DCMD";
import { Set2DRTCMD } from "./Set2DRenderTargetCMD";
import { Set2DDefineCMD, Set2DShaderDataCMD } from "./Set2DShaderDataCMD";

/**
 * @en Interface is used to collect 2D rendering instructions
 * @zh 接口用来收集2D渲染指令
 */
export class CommandBuffer2D {

    private _context: IRenderContext2D;

    private _name: string;

    private _scene: Scene = null;

    private _commands: Command2D[];

    private _renderCMDs: any[] = [];

    /**
     * @internal
     */
    // _renderSize: Vector2 = new Vector2();
    shaderData :ShaderData; 

    /** @ignore */
    constructor(name?: string) {
        this._name = name;
        this.shaderData = LayaGL.renderDeviceFactory.createShaderData();
        this._context = Render2DProcessor.rendercontext2D;
        this._commands = [];
    }

    /**
     * @en The name of the command buffer.
     * @zh 命令缓冲区的名称。
     */
    getName(): string {
        return this._name;
    }

    private cacheData: any = {}
    private _cacheContextState() {
        this.cacheData.rt = this._context.getRenderTarget();
        this.cacheData.pipeline = this._context.pipelineMode;
        this.cacheData.invertY = this._context.invertY;
    }

    private _recoverContextState() {
        this._context.setRenderTarget(this.cacheData.rt, false, Color.BLACK);
        this._context.pipelineMode = this.cacheData.pipeline;
        this._context.invertY = this.cacheData.invertY;
    }

    /**
     * 渲染所有渲染指令后恢复context状态
     */
    // _applyAndRecoverContext() {
    //     this._apply(true);
    // }

    /**
     * @en Executes all rendering commands.
     * @param render Whether to render immediately, the default is true
     * @zh 调用所有渲染指令。
     * @param render  是否立即渲染，默认为true
     */
    apply(render: boolean = true, recoverContextStat: boolean = true): void {
        this.shaderData.clearData();
        let lastPass = this._context.passData;
        if (lastPass) {
            lastPass.cloneTo(this.shaderData);
        }else{
            this.shaderData.setVector2(ShaderDefines2D.UNIFORM_SIZE,Vector2.TEMP.setValue(
                RenderState2D.width, RenderState2D.height
            ));
        }
        this._context.passData = this.shaderData;

        recoverContextStat && this._cacheContextState();
        for (var i: number = 0, n: number = this._commands.length; i < n; i++) {
            let cmd = this._commands[i];
            cmd.run && cmd.run();
        }
        render && this._context.runCMDList(this._renderCMDs);

        this._context.passData = lastPass;
        //draw array
        Stat.cmdDrawCall += this._renderCMDs.length;
        recoverContextStat && this._recoverContextState();
    }

    /**
     * @en Executes a single command from the command buffer.
     * @zh 从命令缓冲区执行单个命令。
     */
    applyOne(recoverContextStat: boolean = true): boolean {
        recoverContextStat && this._cacheContextState();
        if (this._commands.length) {
            var cmd = this._commands.shift();
            cmd.run && cmd.run();
            //render
            cmd.getRenderCMD && this._context.runOneCMD(this._renderCMDs.shift());
            cmd.recover();
        }
        recoverContextStat && this._recoverContextState();
        return this._commands.length > 0;
    }

    /**
     * @en Clears the command buffer.
     * @zh 清除命令缓冲区
     * @param recover 
     */
    clear(recover: boolean = true): void {
        if (recover) //是否需要回收cmd，如果cmd是缓存的，不需要回收
            for (var i: number = 0, n: number = this._commands.length; i < n; i++)
                this._commands[i].recover();
        this._commands.length = 0;
        this._renderCMDs.length = 0;
    }

    /**
     * @en Gets the number of commands contained in the command buffer
     * @zh 获取命令缓冲区包含的命令数量
     */
    getCommandsSize(): number {
        return this._commands.length;
    }

    /**
     * Set rendering instructions for rendering data
     * @param shaderData dest render data
     * @param nameID property id
     * @param dataType proprty type
     * @param value set value
     * @returns 
     * @zh 设置渲染数据渲染指令
     * @param shaderData 目标渲染数据
     * @param nameID 属性ID
     * @param dataType 属性类型
     * @param value 设置数据
     * @returns 
     */
    setShaderDataValue(shaderData: ShaderData, nameID: number, dataType: ShaderDataType, value: any) {
        if (!checkShaderDataValueLegal(value, dataType))
            return;
        let cmd = Set2DShaderDataCMD.create(shaderData, nameID, value, dataType);
        cmd._globalMode = false;
        this._commands.push(cmd);
        cmd._commandBuffer = this;
        cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
    }

    /**
     * @en set global render data
     * @param nameID property id
     * @param dataType proprty type
     * @param value set value
     * @returns 
     * @zh 设置全局渲染数据
     * @param nameID 属性ID
     * @param dataType 属性类型
     * @param value 设置数据
     * @returns 
     */
    setGlobalShaderDataValue(nameID: number, dataType: ShaderDataType, value: any) {
        if (!checkShaderDataValueLegal(value, dataType))
            return;
        if (!this._scene || (!this._scene._specialManager)) {
            return;
        }
        let cmd = Set2DShaderDataCMD.create(this._scene._specialManager._shaderData, nameID, value, dataType);
        cmd._globalMode = true;
        this._commands.push(cmd);
        cmd._commandBuffer = this;
        cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
    }

    /**
     * @en set Shader Define marco cmd
     * @param shaderData dest render data
     * @param define marco of shader
     * @param value set bool of marco
     * @zh 设置渲染宏的指令
     * @param shaderData 目标渲染数据
     * @param define 着色器宏
     * @param value 是否开启
     */
    setShaderDefine(shaderData: ShaderData, define: ShaderDefine, value: boolean): void {
        let cmd = Set2DDefineCMD.create(shaderData, define, value);
        cmd._globalMode = false;
        this._commands.push(cmd);
        cmd._commandBuffer = this;
        cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
    }

    /**
     * 拷贝纹理到渲染目标渲染指令
     * @param source copy source
     * @param dest dest of render
     * @param offsetScale offset&scale of copy
     * @param shader copy use shader
     * @param shaderData copy use data for shader
     */
    blitTextureQuad(source: BaseTexture, dest: IRenderTarget, offsetScale?: Vector4, shader?: Shader3D, shaderData?: ShaderData): void {
        let cmd = Blit2DCMD.create(source, dest, offsetScale, shader, shaderData);
        this._commands.push(cmd);
        cmd._commandBuffer = this;
        cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
    }

    //TODO
    blitTextureBlur(source: BaseTexture, dest: IRenderTarget, blurParams: any) {
        //TODO
    }

    /**
     * 设置渲染目标指令
     * @param renderTexture dest render target
     * @param clearColor clear color when change target
     * @param colorValue clear color value
     * @param invertY invert y coordinate
     */
    setRenderTarget(renderTexture: IRenderTarget, clearColor: boolean, colorValue: Color = Color.BLACK, invertY: boolean = true): void {
        let cmd = Set2DRTCMD.create(renderTexture, clearColor, colorValue, invertY);
        this._commands.push(cmd);
        cmd._commandBuffer = this;
        cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
    }

    /**
     * 渲染元素位置指令
     * @param renderelement 
     * @param mat 
     */
    drawRenderElement(renderelement: IRenderElement2D, mat: Matrix) {
        let cmd = DrawRenderElement2DCMD.create(renderelement, mat);
        this._commands.push(cmd);
        cmd._commandBuffer = this;
        cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
    }

    /**
     * 渲染Mesh2D指令
     * @param mesh 
     * @param mat 
     * @param meshTexture 
     * @param color 
     * @param material 
     */
    drawMesh(mesh: Mesh2D, mat: Matrix, meshTexture?: BaseTexture, color?: Color, material?: Material): void {
        let cmd = DrawMesh2DCMD.create(mesh, mat, meshTexture || Texture2D.whiteTexture, color || Color.WHITE, material || Mesh2DRender.mesh2DDefaultMaterial);
        this._commands.push(cmd);
        cmd._commandBuffer = this;
        cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
    }

    drawQuad() {
        //TODO
    }

    drawLine() {
        //TODO
    }

    /**
     * 添加缓存渲染指令
     * @param cmd 
     */
    addCacheCommand(cmd: Command2D) {
        //TODO
        if (this._scene) {
            if (cmd instanceof Set2DShaderDataCMD) {
                if (cmd._commandBuffer)
                    cmd.setDest(this._scene._specialManager._shaderData);
            }
            if (cmd instanceof Set2DDefineCMD) {
                if (cmd._commandBuffer)
                    cmd.setDest(this._scene._specialManager._shaderData);
            }
        }
        this._commands.push(cmd);
        cmd._commandBuffer = this;
        cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
    }
}