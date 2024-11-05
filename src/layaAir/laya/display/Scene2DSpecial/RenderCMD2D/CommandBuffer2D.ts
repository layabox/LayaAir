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
import { Render2DSimple } from "../../../renders/Render2D";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "../../../resource/Material";
import { Mesh2D } from "../../../resource/Mesh2D";
import { Texture2D } from "../../../resource/Texture2D";
import { Stat } from "../../../utils/Stat";
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

    static instance: CommandBuffer2D = new CommandBuffer2D();

    private _context: IRenderContext2D

    private _name: string;

    private _scene: Scene = null;

    private _commands: Command2D[];

    private _renderCMDs: any[] = [];

    /**
     * @internal
     */
    _renderSize: Vector2 = new Vector2();

    /** @ignore */
    constructor(name: string = null) {
        this._name = name;
        this._context = Render2DSimple.rendercontext2D;
        this._commands = [];
    }

    /**
     * @en The name of the command buffer.
     * @zh 命令缓冲区的名称。
     */
    getName(): string {
        return this._name;
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
    apply(render: boolean = true): void {
        for (var i: number = 0, n: number = this._commands.length; i < n; i++) {
            let cmd = this._commands[i];
            cmd.run && cmd.run();
        }
        render && this._context.runCMDList(this._renderCMDs);
        //draw array
        Stat.cmdDrawCall += this._renderCMDs.length;
    }

    /**
     * @en Executes a single command from the command buffer.
     * @zh 从命令缓冲区执行单个命令。
     */
    applyOne(): boolean {
        if (this._commands.length) {
            var cmd = this._commands.shift();
            cmd.run && cmd.run();
            //render
            cmd.getRenderCMD && this._context.runOneCMD(this._renderCMDs.shift());
            cmd.recover();
        }
        return this._commands.length > 0;
    }


    /**
     * @en Clears the command buffer.
     * @zh 清除命令缓冲区。
     */
    clear(): void {
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
    blitTextureQuad(source: BaseTexture, dest: IRenderTarget, offsetScale: Vector4 = null, shader: Shader3D = null, shaderData: ShaderData = null): void {
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
     */
    setRenderTarget(renderTexture: IRenderTarget, clearColor: boolean, colorValue: Color = Color.BLACK): void {
        let cmd = Set2DRTCMD.create(renderTexture, clearColor, colorValue);
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
     * 渲染元素位置指令
     * @param mesh 
     * @param mat 
     * @param meshTexture 
     * @param color 
     * @param material 
     */
    drawMesh2DByMatrix(mesh: Mesh2D, mat: Matrix, meshTexture: BaseTexture = Texture2D.whiteTexture, color: Color = Color.WHITE, material: Material = Mesh2DRender.mesh2DDefaultMaterial) {
        let cmd = DrawMesh2DCMD.create(mesh, mat, meshTexture, color, material);
        this._commands.push(cmd);
        cmd._commandBuffer = this;
        cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
    }

    /**
     * 渲染Mesh2D指令
     * @param mesh 
     * @param pos 
     * @param rotate 
     * @param skew 
     * @param scale 
     * @param meshTexture 
     * @param color 
     * @param material 
     */
    drawMesh2DByTrans(mesh: Mesh2D, pos: Vector2 = Vector2.ZERO, rotate: number = 0, skew: Vector2 = Vector2.ZERO, scale: Vector2 = Vector2.ONE, meshTexture: BaseTexture = Texture2D.whiteTexture, color: Color = Color.WHITE, material: Material = Mesh2DRender.mesh2DDefaultMaterial) {
        let mat = Matrix.TEMP;
        mat.setMatrix(pos.x, pos.y, scale.x, scale.y, rotate, skew.x, skew.y, 0, 0);
        this.drawMesh2DByMatrix(mesh, mat, meshTexture, color, material);
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
        if (cmd instanceof Set2DShaderDataCMD) {
            if (cmd._commandBuffer)
                cmd.setDest(this._scene._specialManager._shaderData);
        }
        if (cmd instanceof Set2DDefineCMD) {
            if (cmd._commandBuffer)
                cmd.setDest(this._scene._specialManager._shaderData);
        }
        this._commands.push(cmd);
        cmd._commandBuffer = this;
        cmd.getRenderCMD && this._renderCMDs.push(cmd.getRenderCMD());
    }
}