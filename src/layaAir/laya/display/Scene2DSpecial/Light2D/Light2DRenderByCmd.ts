import { Color } from "../../../maths/Color";
import { Matrix } from "../../../maths/Matrix";
import { Vector2 } from "../../../maths/Vector2";
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "../../../resource/Material";
import { Mesh2D } from "../../../resource/Mesh2D";
import { RenderTexture2D } from "../../../resource/RenderTexture2D";
import { Scene } from "../../Scene";
import { Command2D } from "../RenderCMD2D/Command2D";
import { CommandBuffer2D } from "../RenderCMD2D/CommandBuffer2D";
import { DrawMesh2DCMD } from "../RenderCMD2D/DrawMesh2DCMD";
import { Set2DRTCMD } from "../RenderCMD2D/Set2DRenderTargetCMD";
import { BaseLight2D } from "./BaseLight2D";
import { Light2DManager } from "./Light2DManager";

/**
 * 每一层用于渲染光影图的资源
 */
export class Light2DRenderRes {
    lights: BaseLight2D[] = []; //灯光对象
    textures: BaseTexture[] = []; //灯光贴图，数量等于当前层的灯光数量
    material: Material[] = []; //生成光影图的材质，数量等于当前层的灯光数量
    materialShadow: Material[] = []; //生成阴影图的材质，数量等于当前层的灯光数量
    lightMeshs: Mesh2D[][] = []; //灯光网格，数量等于当前层的灯光数量*PCF值
    shadowMeshs: Mesh2D[] = []; //阴影网格，数量等于当前层的灯光数量
    needShadowMesh: boolean[] = []; //是否需要阴影网格，数量等于当前层的灯光数量

    private _layer: number = 0; //对应的层
    private _invertY: boolean = false; //是否颠倒Y轴
    private _cmdRT: Set2DRTCMD; //渲染目标缓存
    private _cmdLightMeshs: DrawMesh2DCMD[][] = []; //渲染命令缓存（灯光）
    private _cmdShadowMeshs: DrawMesh2DCMD[] = []; //渲染命令缓存（阴影）
    private _cmdBuffer: CommandBuffer2D = new CommandBuffer2D('Light2DRender'); //渲染光影图的命令流

    constructor(scene: Scene, layer: number, invertY: boolean) {
        this._layer = layer;
        this._invertY = invertY;
    }

    /**
     * 初始化材质
     * @param material 待初始化的材质
     * @param shadow 是否用于渲染阴影
     */
    private _initMaterial(material: Material, shadow: boolean) {
        if (shadow) {
            material.setShaderName('ShadowGen2D');
            material.setFloat('u_Shadow2DStrength', 0.5);
            material.setColor('u_ShadowColor', new Color(0, 0, 0, 1));
        }
        else material.setShaderName('LightAndShadowGen2D');
        material.setColor('u_LightColor', new Color(1, 1, 1, 1));
        material.setFloat('u_LightRotation', 0);
        material.setFloat('u_LightIntensity', 1);
        material.setFloat('u_PCFIntensity', 1);
        material.setVector2('u_LightTextureSize', new Vector2(1, 1));
        material.setVector2('u_LightScale', new Vector2(1, 1));
        material.setBoolByIndex(Shader3D.DEPTH_WRITE, false);
        material.setIntByIndex(Shader3D.DEPTH_TEST, RenderState.DEPTHTEST_OFF);
        material.setIntByIndex(Shader3D.BLEND, RenderState.BLEND_ENABLE_ALL);
        material.setIntByIndex(Shader3D.BLEND_EQUATION, RenderState.BLENDEQUATION_ADD);
        material.setIntByIndex(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ONE);
        material.setIntByIndex(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE);
        material.setIntByIndex(Shader3D.CULL, RenderState.CULL_NONE);
    }

    /**
     * @en add lights group
     * @param lights the lights object array
     * @param recover the queue for recovery
     * @zh 添加灯光组
     * @param lights 灯光对象数组
     * @param recover 回收队列
     */
    addLights(lights: BaseLight2D[], recover?: any[]) {
        const length = lights.length;
        if (!Light2DManager.REUSE_MESH && recover)
            this._needRecoverMesh(recover, length);

        this.lights = lights;
        this.textures.length = length;
        this.lightMeshs.length = length;
        this.shadowMeshs.length = length;

        //遍历所有灯（建立灯光资源）
        for (let i = 0; i < length; i++) {
            const light = lights[i];
            const pcf = 1 / light._pcfIntensity() | 0;

            if (!this.lightMeshs[i])
                this.lightMeshs[i] = [];
            this.lightMeshs[i].length = pcf;

            if (!this.material[i]) {
                this.material[i] = new Material();
                this._initMaterial(this.material[i], false);
            }
            this.textures[i] = light._texLight;
        }

        //遍历所有灯（建立阴影资源）
        for (let i = 0; i < length; i++) {
            const light = lights[i];
            if (light._isNeedShadowMesh()) {
                if (!this.materialShadow[i]) {
                    this.materialShadow[i] = new Material();
                    this._initMaterial(this.materialShadow[i], true);
                }
                this.needShadowMesh[i] = true;
            } else this.needShadowMesh[i] = false;
        }
    }

    /**
     * @en update lights group PCF
     * @param light the lights object
     * @zh 更新灯光组PCF
     * @param light 灯光对象
     */
    updateLightPCF(light: BaseLight2D) {
        for (let i = 0, len = this.lights.length; i < len; i++) {
            if (this.lights[i] === light) {
                const pcf = 1 / light._pcfIntensity() | 0;
                if (!this.lightMeshs[i])
                    this.lightMeshs[i] = [];
                this.lightMeshs[i].length = pcf;
            }
        }
    }

    /**
     * @en put mesh into recover queue
     * @param recover recover queue
     * @param length the length to be reserved, the previous will be recycled
     * @zh 将mesh放入回收队列
     * @param recover 回收队列
     * @param length 保留的长度，之前的会被回收
     */
    private _needRecoverMesh(recover: any[], length: number) {
        for (let i = this.lightMeshs.length - 1; i >= length; i--) {
            if (this.lightMeshs[i]) {
                const meshs = this.lightMeshs[i];
                if (meshs[i]) {
                    for (let j = meshs.length - 1; j > -1; j--) {
                        recover.push(meshs[j]);
                        meshs[j] = null;
                    }
                }
            }
        }
        for (let i = this.shadowMeshs.length - 1; i >= length; i--) {
            if (this.shadowMeshs[i]) {
                recover.push(this.shadowMeshs[i]);
                this.shadowMeshs[i] = null;
            }
        }
    }

    /**
     * @en set render target command
     * @param rt render target
     * @zh 设置渲染目标命令
     * @param rt 渲染目标 
     */
    setRenderTargetCMD(rt: RenderTexture2D) {
        if (!this._cmdRT)
            this._cmdRT = Set2DRTCMD.create(rt, true, Color.CLEAR, this._invertY);
        else this._cmdRT.renderTexture = rt;
    }

    /**
     * @en build render mesh command cache
     * @zh 建立渲染网格命令缓存
     */
    buildRenderMeshCMD() {
        //清理旧缓存
        for (let i = this._cmdLightMeshs.length - 1; i > -1; i--) {
            const cmds = this._cmdLightMeshs[i];
            for (let j = cmds.length - 1; j > -1; j--)
                cmds[j].recover();
            cmds.length = 0;
        }
        this._cmdLightMeshs.length = 0;
        for (let i = this._cmdShadowMeshs.length - 1; i > -1; i--)
            if (this._cmdShadowMeshs[i])
                this._cmdShadowMeshs[i].recover();
        this._cmdShadowMeshs.length = 0;

        //创建新缓存
        const mat = Matrix.EMPTY;
        for (let i = 0, len = this.lightMeshs.length; i < len; i++) {
            const meshs = this.lightMeshs[i];
            const cmds: Command2D[] = this._cmdLightMeshs[i] = [];
            for (let j = meshs.length - 1; j > -1; j--)
                cmds.push(DrawMesh2DCMD.create(meshs[j], mat, this.textures[i], Color.WHITE, this.material[i]));
        }
        for (let i = 0, len = this.shadowMeshs.length; i < len; i++) {
            if (this.needShadowMesh)
                this._cmdShadowMeshs.push(DrawMesh2DCMD.create(this.shadowMeshs[i], mat, this.textures[i], Color.WHITE, this.materialShadow[i]));
            else this._cmdShadowMeshs.push(null);
        }
    }

    /**
     * @en update command cache's render material
     * @zh 更新命令缓存中的渲染材质
     */
    updateMaterial() {
        for (let i = 0, len = this._cmdLightMeshs.length; i < len; i++) {
            const cmds = this._cmdLightMeshs[i];
            for (let j = 0, len = cmds.length; j < len; j++) {
                cmds[j].texture = this.textures[i];
                cmds[j].material = this.material[i];
            }
        }
        for (let i = 0, len = this._cmdShadowMeshs.length; i < len; i++) {
            if (this._cmdShadowMeshs[i]) {
                this._cmdShadowMeshs[i].texture = this.textures[i];
                this._cmdShadowMeshs[i].material = this.materialShadow[i];
            }
        }
    }

    /**
     * @en update command cache's mesh
     * @param mesh mesh object
     * @param i array index
     * @param j array index
     * @zh 更新命令缓存中的网格
     * @param mesh 网格对象
     * @param i 数组索引
     * @param j 数组索引
     */
    updateLightMesh(mesh: Mesh2D, i: number, j: number) {
        this.lightMeshs[i][j] = mesh;
        if (Light2DManager.REUSE_CMD) {
            if (this._cmdLightMeshs[i] && this._cmdLightMeshs[i][j])
                this._cmdLightMeshs[i][j].mesh = mesh;
        }
    }

    /**
     * @en update command cache's mesh
     * @param mesh  mesh object
     * @param i array index    
     * @zh 更新命令缓存中的网格
     * @param mesh 网格对象
     * @param i 数组索引
     */
    updateShadowMesh(mesh: Mesh2D, i: number) {
        this.shadowMeshs[i] = mesh;
        if (Light2DManager.REUSE_CMD) {
            if (this._cmdShadowMeshs[i])
                this._cmdShadowMeshs[i].mesh = mesh;
        }
    }

    /**
     * @en enable shadow
     * @param light light object
     * @param recover revert array
     * @zh 启用阴影
     * @param light 光源对象
     * @param recover 回收队列
     */
    enableShadow(light: BaseLight2D, recover: any[]) {
        const layer = this._layer;
        const mat = Matrix.EMPTY;
        for (let i = this.lights.length - 1; i > -1; i--) {
            if (this.lights[i] === light) {
                this.needShadowMesh[i] = false;
                if (!light.shadowEnable
                    || !light._isNeedShadowMesh()
                    || (light.shadowLayerMask & (1 << layer)) === 0) {
                    if (!Light2DManager.REUSE_MESH
                        && recover && this.shadowMeshs[i])
                        recover.push(this.shadowMeshs[i]);
                    this.shadowMeshs[i] = null;
                    if (Light2DManager.REUSE_CMD) {
                        if (this._cmdShadowMeshs[i]) {
                            this._cmdShadowMeshs[i].recover();
                            this._cmdShadowMeshs[i] = null;
                        }
                    }
                } else {
                    if (Light2DManager.REUSE_CMD) {
                        if (!this._cmdShadowMeshs[i])
                            this._cmdShadowMeshs[i] = DrawMesh2DCMD.create(this.shadowMeshs[i], mat, this.textures[i], Color.WHITE, this.materialShadow[i]);
                    }
                    if (!this.materialShadow[i]) {
                        this.materialShadow[i] = new Material();
                        this._initMaterial(this.materialShadow[i], true);
                    }
                    this.needShadowMesh[i] = true;
                }
                return;
            }
        }
    }

    /**
     * 渲染光影图
     */
    render(rt?: RenderTexture2D) {
        if (Light2DManager.REUSE_CMD) {
            if (this._cmdRT) {
                this._cmdBuffer.addCacheCommand(this._cmdRT);
                for (let i = 0, len = this._cmdLightMeshs.length; i < len; i++) {
                    const cmds = this._cmdLightMeshs[i];
                    for (let j = 0, len = cmds.length; j < len; j++) {
                        const cmd = cmds[j];
                        if (cmd.mesh && cmd.material)
                            this._cmdBuffer.addCacheCommand(cmd);
                    }
                }
                for (let i = 0, len = this._cmdShadowMeshs.length; i < len; i++) {
                    const cmd = this._cmdShadowMeshs[i];
                    if (cmd && cmd.mesh && cmd.material)
                        this._cmdBuffer.addCacheCommand(cmd);
                }
                this._cmdBuffer.apply(true);
                this._cmdBuffer.clear(false);
            }
        } else {
            const mat = Matrix.EMPTY;
            this._cmdBuffer.setRenderTarget(rt, true, Color.CLEAR, this._invertY);
            for (let i = 0, len = this.lightMeshs.length; i < len; i++) {
                const meshs = this.lightMeshs[i];
                for (let j = 0, len = meshs.length; j < len; j++)
                    if (meshs[j] && this.material[i])
                        this._cmdBuffer.drawMesh(meshs[j], mat, this.textures[i], Color.WHITE, this.material[i]);
            }
            for (let i = 0, len = this.shadowMeshs.length; i < len; i++) {
                const mesh = this.shadowMeshs[i];
                if (mesh && this.materialShadow[i])
                    this._cmdBuffer.drawMesh(mesh, mat, this.textures[i], Color.WHITE, this.materialShadow[i]);
            }
            this._cmdBuffer.apply(true);
            this._cmdBuffer.clear(true);
        }
    }
}