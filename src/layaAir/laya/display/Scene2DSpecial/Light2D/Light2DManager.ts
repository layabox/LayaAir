import { Laya } from "../../../../Laya";
import { IElementComponentManager } from "../../../components/IScenceComponentManager";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Matrix } from "../../../maths/Matrix";
import { Rectangle } from "../../../maths/Rectangle";
import { Vector2 } from "../../../maths/Vector2";
import { Vector4 } from "../../../maths/Vector4";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";
import { ShaderData } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { WrapMode } from "../../../RenderEngine/RenderEnum/WrapMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Context } from "../../../renders/Context";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "../../../resource/Material";
import { Mesh2D, VertexMesh2D } from "../../../resource/Mesh2D";
import { RenderTexture2D } from "../../../resource/RenderTexture2D";
import { Browser } from "../../../utils/Browser";
import { Pool } from "../../../utils/Pool";
import { Utils } from "../../../utils/Utils";
import { RenderState2D } from "../../../webgl/utils/RenderState2D";
import { ILight2DManager, Scene } from "../../Scene";
import { Command2D } from "../RenderCMD2D/Command2D";
import { CommandBuffer2D } from "../RenderCMD2D/CommandBuffer2D";
import { DrawMesh2DCMD } from "../RenderCMD2D/DrawMesh2DCMD";
import { Set2DRTCMD } from "../RenderCMD2D/Set2DRenderTargetCMD";
import { BaseLight2D, Light2DType } from "./BaseLight2D";
import { DirectionLight2D } from "./DirectionLight2D";
import { LightLine2D } from "./LightLine2D";
import { LightOccluder2D } from "./LightOccluder2D";
import { LightAndShadow } from "./Shader/LightAndShadow";

/**
 * @internal
 * 每一层用于渲染光影图资源
 */
class Light2DRenderRes {
    lights: BaseLight2D[] = []; //灯光对象
    textures: BaseTexture[] = []; //灯光贴图，数量等于当前层的灯光数量
    material: Material[] = []; //生成光影图的材质，数量等于当前层的灯光数量
    materialShadow: Material[] = []; //生成阴影图的材质，数量等于当前层的灯光数量
    lightMeshs: Mesh2D[][] = []; //灯光网格，数量等于当前层的灯光数量*PCF值
    shadowMeshs: Mesh2D[] = []; //阴影网格，数量等于当前层的灯光数量

    private _invertY: boolean = false; //是否颠倒Y轴
    private _cmdRT: Set2DRTCMD; //渲染目标缓存
    private _cmdLightMeshs: DrawMesh2DCMD[][] = []; //渲染命令缓存（灯光）
    private _cmdShadowMeshs: DrawMesh2DCMD[] = []; //渲染命令缓存（阴影）
    private _cmdBuffer: CommandBuffer2D = new CommandBuffer2D('Light2DRender'); //渲染光影图的命令流

    constructor(invertY: boolean) {
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
     * 添加灯光组
     * @param lights 灯光对象数组
     * @param recover 回收队列
     */
    addLights(lights: BaseLight2D[], recover?: any[]) {
        const length = lights.length;
        if (recover)
            this._needRecoverMesh(recover, length);

        this.lights = lights;
        this.textures.length = length;
        this.lightMeshs.length = length;
        this.shadowMeshs.length = length;

        //遍历所有灯（建立灯光资源）
        for (let i = 0; i < length; i++) {
            const light = lights[i];
            const pcf = light.getLightType() === Light2DType.Direction ? 1 : light.shadowFilterType;

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
            }
        }
    }

    /**
     * 更新灯光组PCF
     * @param light 灯光对象
     */
    updateLightPCF(light: BaseLight2D) {
        for (let i = 0, len = this.lights.length; i < len; i++) {
            if (this.lights[i] === light) {
                const pcf = light.getLightType() === Light2DType.Direction ? 1 : light.shadowFilterType;
                if (!this.lightMeshs[i])
                    this.lightMeshs[i] = [];
                this.lightMeshs[i].length = pcf;
            }
        }
    }

    /**
     * 将mesh放入回收队列
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
     * 设置渲染目标命令
     * @param rt 渲染目标 
     */
    setRenderTargetCMD(rt: RenderTexture2D) {
        if (!this._cmdRT)
            this._cmdRT = Set2DRTCMD.create(rt, true, Color.CLEAR, this._invertY);
        else this._cmdRT.renderTexture = rt;
    }

    /**
     * 建立渲染网格命令缓存
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
            this._cmdShadowMeshs[i].recover();
        this._cmdShadowMeshs.length = 0;

        //创建新缓存
        for (let i = 0, len = this.lightMeshs.length; i < len; i++) {
            const meshs = this.lightMeshs[i];
            const cmds: Command2D[] = this._cmdLightMeshs[i] = [];
            for (let j = meshs.length - 1; j > -1; j--)
                cmds.push(DrawMesh2DCMD.create(meshs[j], Matrix.EMPTY, this.textures[i], Color.WHITE, this.material[i]));
        }
        for (let i = 0, len = this.shadowMeshs.length; i < len; i++) {
            this._cmdShadowMeshs.push(DrawMesh2DCMD.create(this.shadowMeshs[i], Matrix.EMPTY, this.textures[i], Color.WHITE, this.materialShadow[i]));
        }
    }

    /**
     * 更新命令缓存中的渲染材质
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
            this._cmdShadowMeshs[i].texture = this.textures[i];
            this._cmdShadowMeshs[i].material = this.materialShadow[i];
        }
    }

    /**
     * 更新命令缓存中的网格
     * @param mesh 网格对象
     * @param i 数组索引
     * @param j 数组索引
     */
    updateLightMesh(mesh: Mesh2D, i: number, j: number) {
        if (this._cmdLightMeshs[i] && this._cmdLightMeshs[i][j])
            this._cmdLightMeshs[i][j].mesh = mesh;
    }

    /**
     * 更新命令缓存中的网格
     * @param mesh 网格对象
     * @param i 数组索引
     */
    updateShadowMesh(mesh: Mesh2D, i: number) {
        if (this._cmdShadowMeshs[i])
            this._cmdShadowMeshs[i].mesh = mesh;
    }

    /**
     * 渲染光影图
     */
    render() {
        if (this._cmdRT) {
            this._cmdBuffer.addCacheCommand(this._cmdRT);
            for (let i = 0, len = this._cmdLightMeshs.length; i < len; i++) {
                const cmds = this._cmdLightMeshs[i];
                for (let j = 0, len = cmds.length; j < len; j++) {
                    const cmd = cmds[j];
                    if (cmd.mesh && cmd.texture && cmd.material)
                        this._cmdBuffer.addCacheCommand(cmd);
                }
            }
            for (let i = 0, len = this._cmdShadowMeshs.length; i < len; i++) {
                const cmd = this._cmdShadowMeshs[i];
                if (cmd.mesh && cmd.texture && cmd.material)
                    this._cmdBuffer.addCacheCommand(cmd);
            }
            this._cmdBuffer.apply(true);
            this._cmdBuffer.clear(false);
        }
    }
}

/**
 * 2D灯光全局配置参数
 */
export class Light2DConfig {
    lightHeight: number = 1; //灯光高度（0~1，影响法线效果）
    ambient: Color = new Color(0.25, 0.25, 0.25, 0); //环境光
    ambientLayerMask: number = 1; //环境光影响的层
}

/**
 * 生成2D光影图的渲染流程
 */
export class Light2DManager implements IElementComponentManager, ILight2DManager {
    /**
     * @internal
     */
    static _managerName = 'Light2DManager';

    static MAX_LAYER: number = 32; //最大层数
    static LIGHT_SCHMITT_SIZE: number = 100; //灯光施密特边缘尺寸
    static SCREEN_SCHMITT_SIZE: number = 200; //屏幕施密特边缘尺寸
    static DEBUG: boolean = false; //是否打印调试信息

    lsTarget: RenderTexture2D[] = []; //渲染目标（光影图），数量等于有灯光的层数

    private _config: Light2DConfig = new Light2DConfig();
    get config(): Light2DConfig {
        return this._config;
    }
    set config(value: Light2DConfig) {
        this._config = value;
        for (let i = this._updateMark.length - 1; i > -1; i--)
            this._updateMark[i]++;
    }

    private _PCF: Vector2[] = []; //PCF系数
    private _scene: Scene; //场景对象
    private _screen: Rectangle; //屏幕偏移和尺寸
    private _screenPrev: Vector2; //先前屏幕尺寸
    private _screenSchmitt: Rectangle; //带施密特性质的屏幕偏移和尺寸
    private _screenSchmittChange: boolean; //带施密特性质的屏幕是否发生变化
    private _lightRangeSchmitt: Rectangle[] = []; //带施密特性质灯光范围
    private _segments: LightLine2D[] = []; //当前层所有遮光器组成的线段
    private _points: number[] = []; //遮光器线段提取的点集
    private _param: Vector4[] = []; //光影图参数（xy：偏移，zw：宽高）

    private _lights: BaseLight2D[] = []; //场景中的所有灯光
    private _occluders: LightOccluder2D[] = []; //场景中的所有遮光器

    private _works: number = 0; //每帧工作负载（渲染光影图次数，每渲染一个灯光算一次）
    private _updateMark: number[] = new Array(Light2DManager.MAX_LAYER).fill(0); //各层的更新标识
    private _updateLayerLight: boolean[] = new Array(Light2DManager.MAX_LAYER).fill(false); //各层是否需要更新灯光图
    private _spriteLayer: number[] = []; //具有精灵的层序号
    private _spriteNumInLayer: number[] = new Array(Light2DManager.MAX_LAYER).fill(0); //精灵在各层中的数量
    private _lightLayer: number[] = []; //具有灯光的层序号（屏幕内）
    private _lightLayerAll: number[] = []; //具有灯光的层序号
    private _lightsInLayer: BaseLight2D[][] = []; //各层中的灯光（屏幕内）
    private _lightsInLayerAll: BaseLight2D[][] = []; //各层中的所有灯光
    private _occluderLayer: number[] = []; //具有遮光器的层序号
    private _occludersInLayer: LightOccluder2D[][] = []; //各层中的遮光器
    private _occludersInLight: LightOccluder2D[][][] = []; //影响屏幕内各层灯光的遮光器

    private _lightRenderRes: Light2DRenderRes[] = []; //各层的渲染资源
    private _lightRangeChange: boolean[] = []; //各层灯光围栏是否改变

    private _recoverFC: number = 0; //回收资源帧序号
    private _needToRecover: any[] = []; //需要回收的资源
    private _needUpdateLightRange: number = 0; //是否需要更新灯光范围
    private _needCollectLightInLayer: number = 0; //是否需要更新各层中的灯光

    private _tempRange: Rectangle = new Rectangle();

    constructor(scene: Scene) {
        this._scene = scene;
        this._scene._light2DManager = this;
        this._screen = new Rectangle();
        this._screenPrev = new Vector2();
        this._screenSchmitt = new Rectangle();
        this._screenSchmittChange = false;

        this._PCF = [
            new Vector2(0, 0),
            new Vector2(-1, 0),
            new Vector2(1, 0),
            new Vector2(0, -1),
            new Vector2(0, 1),
            new Vector2(-1, -1),
            new Vector2(1, -1),
            new Vector2(-1, 1),
            new Vector2(1, 1),
            new Vector2(-2, -2),
            new Vector2(2, -2),
            new Vector2(-2, 2),
            new Vector2(2, 2),
        ];
    }

    /**
     * @en Add render sprite
     * @param node Render node
     * @zh 添加渲染精灵
     * @param node 渲染节点
     */
    addRender(node: BaseRenderNode2D): void {
        const layerMask = node.layer;
        for (let i = 0; i < Light2DManager.MAX_LAYER; i++) {
            if (layerMask & (1 << i)) {
                this._spriteNumInLayer[i]++;
                if (this._spriteNumInLayer[i] === 1)
                    this._spriteLayer.push(i);
            }
        }
    }

    /**
     * @en Remove render sprite
     * @param node Render node
     * @zh 删除渲染精灵
     * @param node 渲染节点
     */
    removeRender(node: BaseRenderNode2D): void {
        const layerMask = node.layer;
        for (let i = 0; i < Light2DManager.MAX_LAYER; i++) {
            if (layerMask & (1 << i)) {
                this._spriteNumInLayer[i]--;
                if (this._spriteNumInLayer[i] === 0)
                    this._spriteLayer.splice(this._spriteLayer.indexOf(i), 1);
            }
        }
    }

    name: string;
    init(data: any): void {
    }

    update(dt: number): void {
    }

    /**
     * @internal
     * 将渲染出的贴图以Base64的方式打印到终端上
     */
    _printTextureToConsoleAsBase64(tex: RenderTexture2D) {
        Utils.uint8ArrayToArrayBufferAsync(tex).then(str => console.log(str));
    }

    /**
     * @internal
     * 灯光的变换矩阵发生变化
     * @param light 灯光对象
     */
    _lightTransformChange(light: BaseLight2D) {
        this._checkLightRange(light);
        if (Light2DManager.DEBUG)
            console.log('light transform change', light);
    }

    /**
     * @internal
     * 检查灯光范围，如果需要更新则更新
     * @param light 灯光对象
     */
    _checkLightRange(light: BaseLight2D) {
        const layers = light.layers;
        for (let i = layers.length - 1; i > -1; i--) {
            const layer = layers[i];
            if (!light._isInRange(this._lightRangeSchmitt[layer])) {
                //this._collectLightInScreenByLayer(layer); //收集该层屏幕内的灯光
                const mask = (1 << layer);
                this.needCollectLightInLayer(mask)
                this.needUpdateLightRange(mask);
                this._updateLayerLight[layer] = true;
            }
        }
    }

    /**
     * @en Need update the light range
     * @zh 需要更新灯光范围
     * @param layerMark 
     */
    needUpdateLightRange(layerMark: number) {
        this._needUpdateLightRange |= layerMark;
    }

    /**
     * @en Need collect light in layers
     * @zh 是否需要收集各层中的灯光
     * @param layerMark 
     */
    needCollectLightInLayer(layerMark: number) {
        this._needCollectLightInLayer |= layerMark;
    }

    /**
     * @en light layer mark change
     * @zh 灯光的影响层发生变化
     * @param light 
     * @param oldLayer 
     * @param newLayer 
     */
    lightLayerMarkChange(light: BaseLight2D, oldLayer: number, newLayer: number) {
        for (let i = 0; i < Light2DManager.MAX_LAYER; i++) {
            const mask = 1 << i;
            const index = this._lightsInLayerAll[i]?.indexOf(light);
            if (newLayer & mask) {
                if (index === undefined || index === -1) {
                    if (!this._lightsInLayerAll[i])
                        this._lightsInLayerAll[i] = [];
                    this._lightsInLayerAll[i].push(light); //将灯光加入受影响的层
                    if (this._lightLayerAll.indexOf(i) === -1) //记录有灯光的层序号
                        this._lightLayerAll.push(i);
                    this._collectLightInScreenByLayer(i); //收集该层屏幕内的灯光
                    this._updateLayerLight[i] = true;
                }
            } else if (oldLayer & mask) {
                if (index >= 0) {
                    this._lightsInLayerAll[i].splice(index, 1); //将灯光从受影响的层中去除
                    if (this._lightsInLayerAll[i].length === 0) //如果受影响的层已经没有灯光，将层序号去除
                        this._lightLayerAll.splice(this._lightLayerAll.indexOf(i), 1);
                    this._collectLightInScreenByLayer(i); //收集该层屏幕内的灯光
                    this._updateLayerLight[i] = true;
                }
            }
        }
        if (Light2DManager.DEBUG)
            console.log('light layer mark change', light, oldLayer, newLayer);
    }

    /**
     * @en light shadow layer mark change
     * @zh 灯光的阴影影响层发生变化
     * @param light 
     * @param oldLayer 
     * @param newLayer 
     */
    lightShadowLayerMarkChange(light: BaseLight2D, oldLayer: number, newLayer: number) {
        if (Light2DManager.DEBUG)
            console.log('light shadow layer mark change', light, oldLayer, newLayer);
    }

    /**
     * @en light shadow pcf change
     * @zh 灯光的阴影PCF参数发生变化
     * @param light 
     */
    lightShadowPCFChange(light: BaseLight2D) {
        this._updateLightPCF(light);
        if (Light2DManager.DEBUG)
            console.log('light shadow pcf change', light);
    }

    /**
     * @en Clear all lights
     * @zh 清除所有灯光
     */
    clearLight() {
        this._lights.length = 0;
        for (let i = 0; i < this._lightLayerAll.length; i++)
            this._lightsInLayerAll[this._lightLayerAll[i]].length = 0;
        this._lightLayerAll.length = 0;
    }

    /**
     * @en Add light
     * @param light Light object
     * @zh 添加灯光
     * @param light 灯光对象
     */
    addLight(light: BaseLight2D) {
        if (this._lights.indexOf(light) === -1) {
            this._lights.push(light);
            const layers = light.layers;
            for (let i = layers.length - 1; i > -1; i--) {
                const layer = layers[i];
                if (!this._lightsInLayerAll[layer])
                    this._lightsInLayerAll[layer] = [];
                this._lightsInLayerAll[layer].push(light); //将灯光加入受影响的层
                if (this._lightLayerAll.indexOf(layer) === -1) //记录有灯光的层序号
                    this._lightLayerAll.push(layer);
                this._collectLightInScreenByLayer(layer); //收集该层屏幕内的灯光
            }
            this.needUpdateLightRange(light.layerMask); //通知相应的层更新灯光范围并集
            if (Light2DManager.DEBUG)
                console.log('add light', light);
        }
    }

    /**
     * @en Remove light
     * @param light Light object
     * @zh 移除灯光
     * @param light 灯光对象
     */
    removeLight(light: BaseLight2D) {
        const index = this._lights.indexOf(light);
        if (index >= 0) {
            this._lights.splice(index, 1);
            const layers = light.layers;
            for (let i = layers.length - 1; i > -1; i--) {
                const layer = layers[i];
                const idx = this._lightsInLayerAll[layer].indexOf(light);
                if (idx >= 0) {
                    this._lightsInLayerAll[layer].splice(idx, 1); //将灯光从受影响的层中去除
                    if (this._lightsInLayerAll[layer].length === 0) //如果受影响的层已经没有灯光，将层序号去除
                        this._lightLayerAll.splice(this._lightLayerAll.indexOf(layer), 1);
                    this._collectLightInScreenByLayer(layer); //收集该层屏幕内的灯光
                }
            }
            if (Light2DManager.DEBUG)
                console.log('remove light', light);
        }
    }

    /**
     * @en Clear all occluders
     * @zn 清除所有遮光器
     */
    clearOccluder() {
        this._occluders.length = 0;
        for (let i = 0; i < this._occluderLayer.length; i++)
            this._occludersInLayer[this._occluderLayer[i]].length = 0;
        this._occluderLayer.length = 0;
    }

    /**
     * @en Add occluder
     * @param occluder Occluder object
     * @zh 添加遮光器
     * @param occluder 遮光器对象
     */
    addOccluder(occluder: LightOccluder2D) {
        if (this._occluders.indexOf(occluder) === -1) {
            this._occluders.push(occluder);
            const layers = occluder.layers;
            for (let i = layers.length - 1; i > -1; i--) {
                const layer = layers[i];
                if (!this._occludersInLayer[layer])
                    this._occludersInLayer[layer] = [];
                this._occludersInLayer[layer].push(occluder); //将遮光器加入受影响的层
                if (this._occluderLayer.indexOf(layer) === -1) //记录有遮光器的层序号
                    this._occluderLayer.push(layer);
            }
            if (Light2DManager.DEBUG)
                console.log('add occluder', occluder);
        }
    }

    /**
     * @en Remove occluder
     * @param occluder Occluder object
     * @zh 移除遮光器
     * @param occluder 遮光器对象
     */
    removeOccluder(occluder: LightOccluder2D) {
        const index = this._occluders.indexOf(occluder);
        if (index >= 0) {
            this._occluders.splice(index, 1);
            const layers = occluder.layers;
            for (let i = layers.length - 1; i > -1; i--) {
                const layer = layers[i];
                const idx = this._occludersInLayer[layer].indexOf(occluder);
                if (idx >= 0) {
                    this._occludersInLayer[layer].splice(idx, 1); //将遮光器从受影响的层中去除
                    if (this._occludersInLayer[layer].length === 0) //如果受影响的层已经没有遮光器，将层序号去除
                        this._occluderLayer.splice(this._occluderLayer.indexOf(layer), 1);
                }
            }
            if (Light2DManager.DEBUG)
                console.log('remove occluder', occluder);
        }
    }

    /**
     * @en Occluder layer mark change
     * @zh 遮光器的影响层发生变化
     * @param occluder 
     * @param oldLayer 
     * @param newLayer 
     */
    occluderLayerMarkChange(occluder: LightOccluder2D, oldLayer: number, newLayer: number) {
        for (let i = 0; i < Light2DManager.MAX_LAYER; i++) {
            const mask = 1 << i;
            const index = this._occludersInLayer[i]?.indexOf(occluder);
            if (newLayer & mask) {
                if (index === undefined || index === -1) {
                    if (!this._occludersInLayer[i])
                        this._occludersInLayer[i] = [];
                    this._occludersInLayer[i].push(occluder); //将遮光器加入受影响的层
                    if (this._occluderLayer.indexOf(i) === -1) //记录有遮光器的层序号
                        this._occluderLayer.push(i);
                }
            } else if (oldLayer & mask) {
                if (index >= 0) {
                    this._occludersInLayer[i].splice(index, 1); //将遮光器从受影响的层中去除
                    if (this._occludersInLayer[i].length === 0) //如果受影响的层已经没有遮光器，将层序号去除
                        this._occluderLayer.splice(this._occluderLayer.indexOf(i), 1);
                }
            }
        }
        if (Light2DManager.DEBUG)
            console.log('occluder layer mark change', occluder, oldLayer, newLayer);
    }

    /**
     * 收集屏幕内指定层中的灯光和遮挡器
     * @param layer 层序号
     */
    private _collectLightInScreenByLayer(layer: number) {
        if (this._screenSchmitt.width === 0) return;

        let lights = this._lightsInLayer[layer];
        const lightsAll = this._lightsInLayerAll[layer];

        if (!lights)
            lights = this._lightsInLayer[layer] = [];
        else lights.length = 0;

        if (!lightsAll || lightsAll.length === 0) {
            const index = this._lightLayer.indexOf(layer);
            if (index >= 0)
                this._lightLayer.splice(index, 1);
            this._updateLayerRenderRes(layer);
            return;
        }

        for (let i = lightsAll.length - 1; i > -1; i--) {
            if (lightsAll[i].isInScreen(this._screenSchmitt)) {
                lights.push(lightsAll[i]);
                if (this._lightLayer.indexOf(layer) === -1)
                    this._lightLayer.push(layer);
            }
        }
        const index = this._lightLayer.indexOf(layer);
        if (lights.length === 0 && index >= 0)
            this._lightLayer.splice(index, 1);

        //建立或更新渲染目标
        let param = this._param[layer];
        let lsTarget = this.lsTarget[layer];
        const x = this._screenSchmitt.x;
        const y = this._screenSchmitt.y;
        const z = this._screenSchmitt.width;
        const w = this._screenSchmitt.height;
        if (!lsTarget) {
            param = this._param[layer] = new Vector4(x, y, z, w);
            lsTarget = this.lsTarget[layer] = new RenderTexture2D(z, w, RenderTargetFormat.R8G8B8A8);
            lsTarget.wrapModeU = WrapMode.Clamp;
            lsTarget.wrapModeV = WrapMode.Clamp;
            lsTarget._invertY = LayaGL.renderEngine._screenInvertY;
            if (Light2DManager.DEBUG)
                console.log('create light layer texture', z, w, layer);
        } else if (param.z != z || param.w != w) {
            this._needToRecover.push(lsTarget);
            param.setValue(x, y, z, w);
            lsTarget = this.lsTarget[layer] = new RenderTexture2D(z, w, RenderTargetFormat.R8G8B8A8);
            lsTarget.wrapModeU = WrapMode.Clamp;
            lsTarget.wrapModeV = WrapMode.Clamp;
            lsTarget._invertY = LayaGL.renderEngine._screenInvertY;
            if (Light2DManager.DEBUG)
                console.log('update light layer texture', z, w, layer);
        } else {
            param.x = x;
            param.y = y;
        }

        //更新该层的渲染资源
        this._updateLayerRenderRes(layer);

        //收集影响灯光的遮光器
        for (let i = lights.length - 1; i > -1; i--)
            this._collectOccludersInLight(layer, lights[i], i);

        if (Light2DManager.DEBUG)
            console.log('collect light in screen by layer', layer);
    }

    /**
     * 更新指定层的渲染资源
     * @param layer 层序号
     */
    private _updateLayerRenderRes(layer: number) {
        if (!this._lightRenderRes[layer])
            this._lightRenderRes[layer] = new Light2DRenderRes(LayaGL.renderEngine._screenInvertY);
        this._lightRenderRes[layer].addLights(this._lightsInLayer[layer], this._needToRecover);
        this._lightRenderRes[layer].setRenderTargetCMD(this.lsTarget[layer]);
        this._lightRenderRes[layer].buildRenderMeshCMD();
        if (Light2DManager.DEBUG)
            console.log('update layer render res', layer);
    }

    /**
     * 更新指定灯光的PCF参数
     * @param light 灯光对象
     */
    private _updateLightPCF(light: BaseLight2D) {
        const layers = light.layers;
        for (let i = layers.length - 1; i > -1; i--) {
            const layer = layers[i];
            if (this._lightRenderRes[layer])
                this._lightRenderRes[layer].updateLightPCF(light);
        }
    }

    /**
     * 计算当前层的光影图范围（带施密特）
     * @param layer 层序号
     */
    private _calcLightRange(layer: number) {
        const range = this._tempRange.reset();
        const lights = this._lightsInLayer[layer];
        for (let i = 0, len = lights.length; i < len; i++) {
            if (i === 0) {
                const r = lights[i]._getRange(this._screenSchmitt);
                if (Light2DManager.DEBUG)
                    console.log('range =', r.x, r.y, r.width, r.height, lights[i]);
                lights[i]._getRange(this._screenSchmitt).cloneTo(range);
            }
            else {
                const r = lights[i]._getRange(this._screenSchmitt);
                if (Light2DManager.DEBUG)
                    console.log('range =', r.x, r.y, r.width, r.height, lights[i]);
                range.union(lights[i]._getRange(this._screenSchmitt), range);
            }
        }
        if (Light2DManager.DEBUG)
            console.log('light range =', range.x, range.y, range.width, range.height);

        let rangeSchmitt = this._lightRangeSchmitt[layer];
        if (!rangeSchmitt) {
            rangeSchmitt = this._lightRangeSchmitt[layer] = new Rectangle();
            this._lightRangeChange[layer] = false;
        }

        if (range.x < rangeSchmitt.x
            || range.y < rangeSchmitt.y
            || range.x + range.width > rangeSchmitt.x + rangeSchmitt.width
            || range.y + range.height > rangeSchmitt.y + rangeSchmitt.height) {
            rangeSchmitt.x = (range.x - Light2DManager.LIGHT_SCHMITT_SIZE) | 0;
            rangeSchmitt.y = (range.y - Light2DManager.LIGHT_SCHMITT_SIZE) | 0;
            rangeSchmitt.width = (range.width + Light2DManager.LIGHT_SCHMITT_SIZE * 2) | 0;
            rangeSchmitt.height = (range.height + Light2DManager.LIGHT_SCHMITT_SIZE * 2) | 0;
            this._lightRangeChange[layer] = true;
            if (Light2DManager.DEBUG)
                console.log('light range schmitt =', rangeSchmitt.x, rangeSchmitt.y, rangeSchmitt.width, rangeSchmitt.height);
        }

        if (Light2DManager.DEBUG)
            console.log('calc light range', layer);
        return rangeSchmitt;
    }

    /**
     * 提取指定层中灯光遮挡器线段
     * @param layer 
     * @param lightX 
     * @param lightY 
     * @param lightRange 
     * @param shadow 
     */
    private _getOccluderSegment(layer: number, lightX: number, lightY: number, lightRange: Rectangle, shadow: boolean) {
        const range = this._lightRangeSchmitt[layer];
        const x = range.x - 10;
        const y = range.y - 10;
        const w = range.width + 20;
        const h = range.height + 20;
        const segments = this._segments;
        for (let i = segments.length - 1; i > -1; i--)
            Pool.recover('LightLine2D', segments[i]);
        segments.length = 0;
        segments.push(Pool.getItemByClass('LightLine2D', LightLine2D).create(x, y, x + w, y, false)); //上边框
        segments.push(Pool.getItemByClass('LightLine2D', LightLine2D).create(x + w, y, x + w, y + h, false)); //右边框
        segments.push(Pool.getItemByClass('LightLine2D', LightLine2D).create(x + w, y + h, x, y + h, false)); //下边框
        segments.push(Pool.getItemByClass('LightLine2D', LightLine2D).create(x, y + h, x, y, false)); //左边框
        const occluders = this._occludersInLayer[layer];
        if (occluders && shadow) {
            for (let i = occluders.length - 1; i > -1; i--) {
                const occluder = occluders[i];
                if (occluder.isInLightRange(lightRange)
                    && occluder.selectByLight(lightX, lightY))
                    segments.push(...occluder.getSegment(lightX, lightY));
            }
        }
        if (Light2DManager.DEBUG)
            console.log('get occluder segment', layer);
        return segments;
    }

    /**
     * 收集影响指定灯光的遮光器
     * @param layer 
     * @param light 
     * @param sn 灯光序号
     */
    private _collectOccludersInLight = (layer: number, light: BaseLight2D, sn: number) => {
        const occluders = this._occludersInLayer[layer];
        if (occluders) {
            if (!this._occludersInLight[layer])
                this._occludersInLight[layer] = [];
            if (!this._occludersInLight[layer][sn])
                this._occludersInLight[layer][sn] = [];
            const result = this._occludersInLight[layer][sn];
            result.length = 0;
            const range = light._getRange(this._screenSchmitt);
            for (let i = occluders.length - 1; i > -1; i--)
                if (range.intersects(occluders[i]._getRange()))
                    result.push(occluders[i]);
        }
    };

    /**
     * 回收资源
     */
    private _recoverResource() {
        //回收资源（每10帧回收一次）
        if (Laya.timer.currFrame > this._recoverFC) {
            if (this._needToRecover.length > 0) {
                for (let i = this._needToRecover.length - 1; i > -1; i--)
                    this._needToRecover[i].destroy();
                this._needToRecover.length = 0;
            }
            this._recoverFC = Laya.timer.currFrame + 10;
        }
    }

    /**
     * @en Render light and shader texture
     * @param context Render context
     * @zh 渲染光影图
     * @param context 渲染上下文
     */
    preRenderUpdate(context: Context) {
        //灯光状态是否更新
        const _isLightUpdate = (light: BaseLight2D) => {
            return light._needUpdateLightAndShadow;
        };

        //遮光器状态是否更新
        const _isOccluderUpdate = (layer: number, sn: number) => {
            if (this._occludersInLight[layer]
                && this._occludersInLight[layer][sn]) {
                const occluders = this._occludersInLight[layer][sn];
                for (let i = occluders.length - 1; i > -1; i--)
                    if (occluders[i]._needUpdate)
                        return true;
            }
            return false;
        };

        //回收资源
        this._recoverResource();

        //遍历屏幕内有灯光的层
        let works = 0;
        this._updateScreen();
        if (this._screenSchmittChange) {
            for (let i = this._lightLayerAll.length - 1; i > -1; i--) {
                const layer = this._lightLayerAll[i];
                this._collectLightInScreenByLayer(layer); //收集该层屏幕内灯光
            }
        } else if (this._needCollectLightInLayer > 0) {
            for (let i = this._lightLayerAll.length - 1; i > -1; i--) {
                const layer = this._lightLayerAll[i];
                if (this._needCollectLightInLayer & (1 << layer))
                    this._collectLightInScreenByLayer(layer); //收集该层屏幕内灯光
            }
        }
        for (let i = this._lightLayer.length - 1; i > -1; i--) {
            let needRender = false;
            const layer = this._lightLayer[i];
            //if (this._spriteNumInLayer[layer] === 0) continue; //该层没有精灵，跳过
            const renderRes = this._lightRenderRes[layer];
            const occluders = this._occludersInLayer[layer];
            const layerMask = (1 << layer);
            if (this._needUpdateLightRange & layerMask)
                this._calcLightRange(layer);
            if (occluders)
                for (let j = occluders.length - 1; j > -1; j--)
                    occluders[j]._getRange();
            let lightChange = false; //灯光是否有变化
            let screenChange = false; //屏幕是否有变化
            let occluderChange = false; //遮光器是否有变化
            if (this._screenSchmittChange
                || this._needCollectLightInLayer > 0) //屏幕位置和尺寸是否改变
                screenChange = true;
            if (this._lightRangeChange[layer]) { //灯光围栏是否改变
                this._lightRangeChange[layer] = false;
                screenChange = true;
            }
            const lights = this._lightsInLayer[layer];
            for (let j = 0, len = lights.length; j < len; j++) { //遍历各灯光
                const light = lights[j];
                const lightMesh = renderRes.lightMeshs[j];
                const shadowMesh = renderRes.shadowMeshs[j];
                const material = renderRes.material[j];
                const materialShadow = renderRes.materialShadow[j];
                light.renderLightTexture(this._scene); //按需更新灯光贴图
                if (!screenChange) {
                    lightChange = _isLightUpdate(light);
                    occluderChange = _isOccluderUpdate(layer, j);
                }
                if (screenChange || occluderChange || lightChange) { //状态有改变，更新光照网格和阴影网格
                    for (let k = lightMesh.length - 1; k > -1; k--) { //遍历PCF
                        material.setColor('u_LightColor', light.color);
                        material.setFloat('u_LightIntensity', light.intensity);
                        material.setFloat('u_LightRotation', light.lightRotation);
                        material.setVector2('u_LightScale', light.lightScale);
                        material.setVector2('u_LightTextureSize', light._getTextureSize());
                        material.setFloat('u_PCFIntensity', light._pcfIntensity());
                        lightMesh[k] = this._update(layer, this._screenSchmitt.x, this._screenSchmitt.y, light, lightMesh[k], k);
                        renderRes.updateLightMesh(lightMesh[k], j, k);
                        needRender = true;
                        works++;
                    }
                    renderRes.textures[j] = light._texLight;
                    if (light.shadowLayerMask & layerMask) { //此灯光该层有阴影
                        if (light._isNeedShadowMesh() && materialShadow) {
                            materialShadow.setColor('u_LightColor', light.color);
                            materialShadow.setColor('u_ShadowColor', light.shadowColor);
                            materialShadow.setFloat('u_LightIntensity', light.intensity);
                            materialShadow.setFloat('u_LightRotation', light.lightRotation);
                            materialShadow.setVector2('u_LightScale', light.lightScale);
                            materialShadow.setVector2('u_LightTextureSize', light._getTextureSize());
                            materialShadow.setFloat('u_Shadow2DStrength', light.shadowStrength);
                            materialShadow.setFloat('u_PCFIntensity', light._pcfIntensity());
                            renderRes.shadowMeshs[j] = this._updateShadow(layer, this._screenSchmitt.x, this._screenSchmitt.y, light, shadowMesh);
                            renderRes.updateShadowMesh(renderRes.shadowMeshs[j], j);
                            needRender = true;
                            works++;
                        }
                    } else if (shadowMesh) { //此灯光该层无阴影
                        this._needToRecover.push(shadowMesh);
                        renderRes.shadowMeshs[j] = null;
                    }
                    this._updateMark[layer]++;
                }
                lightChange = false;
                occluderChange = false;
            }
            if (needRender) { //更新光影图和方向图
                renderRes.updateMaterial();
                renderRes.render();
            }
        }

        //清除相关标志
        for (let i = this._lightLayer.length - 1; i > -1; i--) {
            const layer = this._lightLayer[i];
            const lights = this._lightsInLayer[layer];
            for (let j = 0, len = lights.length; j < len; j++)
                lights[j]._needUpdateLightAndShadow = false;
            for (let j = 0, len = this._occluders.length; j < len; j++)
                this._occluders[j]._needUpdate = false;
        }
        this._screenSchmittChange = false;
        this._needUpdateLightRange = 0;
        this._needCollectLightInLayer = 0;

        //显示工作负载
        if (Light2DManager.DEBUG) {
            if (this._works !== works) {
                this._works = works;
                console.log('works =', works);
            }
        }
    }

    /**
     * @internal
     * 获取层更新码
     * @param layer 层序号
     */
    _getLayerUpdateMark(layer: number) {
        return this._updateMark[layer];
    }

    /**
     * @internal
     * 更新指定层的着色器数据
     * @param layer 层序号
     * @param shaderData 着色器数据
     */
    _updateShaderDataByLayer(layer: number, shaderData: ShaderData) {
        shaderData.setNumber(Shader3D.propertyNameToID('u_LightHeight'), this.config.lightHeight);
        if (this.config.ambientLayerMask & (1 << layer))
            shaderData.setColor(Shader3D.propertyNameToID('u_LightAndShadow2DAmbient'), this.config.ambient);
        else shaderData.setColor(Shader3D.propertyNameToID('u_LightAndShadow2DAmbient'), Color.CLEAR);
        if (this.lsTarget[layer]) {
            shaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHTANDSHADOW);
            shaderData.setTexture(Shader3D.propertyNameToID('u_LightAndShadow2D'), this.lsTarget[layer]);
        } else {
            shaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHTANDSHADOW);
            shaderData.setTexture(Shader3D.propertyNameToID('u_LightAndShadow2D'), null);
            shaderData.setTexture(Shader3D.propertyNameToID('u_LightDirection2D'), null);
        }
        if (this._param[layer])
            shaderData.setVector(Shader3D.propertyNameToID('u_LightAndShadow2DParam'), this._param[layer]);
    }

    /**
     * 更新屏幕尺寸和偏移参数
     */
    private _updateScreen() {
        const camera = this._scene._specialManager._mainCamera;
        if (camera) {
            this._screen.x = (camera.getCameraPos().x - RenderState2D.width / 2) | 0;
            this._screen.y = (camera.getCameraPos().y - RenderState2D.height / 2) | 0;
            this._screen.width = RenderState2D.width | 0;
            this._screen.height = RenderState2D.height | 0;
        } else {
            this._screen.x = 0;
            this._screen.y = 0;
            this._screen.width = RenderState2D.width | 0;
            this._screen.height = RenderState2D.height | 0;
        }

        if (this._screen.x < this._screenSchmitt.x
            || this._screen.y < this._screenSchmitt.y
            || this._screen.x + this._screen.width > this._screenSchmitt.x + this._screenSchmitt.width
            || this._screen.y + this._screen.height > this._screenSchmitt.y + this._screenSchmitt.height
            || this._screenPrev.x !== this._screen.width
            || this._screenPrev.y !== this._screen.height) {
            this._screenPrev.x = this._screen.width;
            this._screenPrev.y = this._screen.height;
            this._screenSchmitt.x = (this._screen.x - Light2DManager.SCREEN_SCHMITT_SIZE) | 0;
            this._screenSchmitt.y = (this._screen.y - Light2DManager.SCREEN_SCHMITT_SIZE) | 0;
            this._screenSchmitt.width = (this._screen.width + Light2DManager.SCREEN_SCHMITT_SIZE * 2) | 0;
            this._screenSchmitt.height = (this._screen.height + Light2DManager.SCREEN_SCHMITT_SIZE * 2) | 0;
            this._screenSchmittChange = true;
            for (let i = this._lights.length - 1; i > -1; i--) {
                if (this._lights[i].getLightType() === Light2DType.Direction)
                    this._lights[i]._needUpdateLightWorldRange = true;
            }
            if (Light2DManager.DEBUG)
                console.log('screen schmitt change');
        }
    }

    /**
     * 更新光影信息
     * @param layer 
     * @param layerOffetX 
     * @param layerOffetY 
     * @param light 
     * @param mesh 
     * @param pcf 
     */
    private _update(layer: number, layerOffsetX: number, layerOffsetY: number, light: BaseLight2D, mesh: Mesh2D, pcf: number) {
        const _calcLightX = (light: BaseLight2D, pcf: number) => {
            if (light.getLightType() == Light2DType.Direction)
                return this._screen.x - (light as DirectionLight2D).directionVector.x * 5000 * Browser.pixelRatio;
            return (light.getGlobalPosX() + this._PCF[pcf].x * light.shadowFilterSmooth) * Browser.pixelRatio;
        };
        const _calcLightY = (light: BaseLight2D, pcf: number) => {
            if (light.getLightType() == Light2DType.Direction)
                return this._screen.y - (light as DirectionLight2D).directionVector.y * 5000 * Browser.pixelRatio;
            return (light.getGlobalPosY() + this._PCF[pcf].y * light.shadowFilterSmooth) * Browser.pixelRatio;
        };

        let ret = mesh;
        const lightX = _calcLightX(light, pcf);
        const lightY = _calcLightY(light, pcf);
        const lightOffsetX = light._getRange().x;
        const lightOffsetY = light._getRange().y;
        const ss = this._getOccluderSegment(layer, lightX, lightY, light._getRange(), light.shadowEnable);
        const poly = this._getLightPolygon(lightX, lightY, ss);
        const len = poly.length;
        if (len > 2) {
            let index = 0;
            this._points.length = len * 2;
            for (let i = 0; i < len; i++) {
                this._points[index++] = poly[i].x;
                this._points[index++] = poly[i].y;
            }
            if (mesh)
                this._needToRecover.push(mesh);
            ret = this._genLightMesh(lightX, lightY, light.getWidth(), light.getHeight(), lightOffsetX, lightOffsetY, layerOffsetX, layerOffsetY, this._points);
        }
        return ret;
    }

    /**
     * 更新光影信息（阴影）
     * @param layer 
     * @param layerOffsetX 
     * @param layerOffsetY 
     * @param light 
     * @param mesh 
     */
    private _updateShadow(layer: number, layerOffsetX: number, layerOffsetY: number, light: BaseLight2D, mesh: Mesh2D) {
        const _calcLightX = (light: BaseLight2D) => {
            if (light.getLightType() == Light2DType.Direction)
                return this._screen.x - (light as DirectionLight2D).directionVector.x * 5000 * Browser.pixelRatio;
            return light.getGlobalPosX() * Browser.pixelRatio;
        };
        const _calcLightY = (light: BaseLight2D) => {
            if (light.getLightType() == Light2DType.Direction)
                return this._screen.y - (light as DirectionLight2D).directionVector.y * 5000 * Browser.pixelRatio;
            return light.getGlobalPosY() * Browser.pixelRatio;
        };

        let ret = mesh;
        const lightX = _calcLightX(light);
        const lightY = _calcLightY(light);
        const lightOffsetX = light._getRange().x;
        const lightOffsetY = light._getRange().y;
        const ss = this._getOccluderSegment(layer, lightX, lightY, light._getRange(), light.shadowEnable);
        const poly = this._getLightPolygon(lightX, lightY, ss);
        const len = poly.length;
        if (len > 2) {
            let index = 0;
            this._points.length = len * 2;
            for (let i = 0; i < len; i++) {
                this._points[index++] = poly[i].x;
                this._points[index++] = poly[i].y;
            }
            let radius = light.getLightType() === Light2DType.Direction ? 10000 : Math.max(light.getWidth(), light.getHeight()) * 2;
            if (mesh)
                this._needToRecover.push(mesh);
            ret = this._genShadowMesh(lightX, lightY, light.getWidth(), light.getHeight(), lightOffsetX, lightOffsetY, layerOffsetX, layerOffsetY, this._points, radius);
        }
        return ret;
    }

    /**
     * 生成灯光网格
     * @param lightX 光源位置
     * @param lightY 
     * @param lightWidth 光源尺寸
     * @param lightHeight 
     * @param lightOffsetX 灯光贴图的偏移值
     * @param lightOffsetY 
     * @param layerOffsetX 光影图的偏移值
     * @param layerOffsetY 
     * @param inputPoints 顶点
     */
    private _genLightMesh(lightX: number, lightY: number, lightWidth: number, lightHeight: number,
        lightOffsetX: number, lightOffsetY: number, layerOffsetX: number, layerOffsetY: number, inputPoints: number[]) {
        const vertices = new Float32Array((inputPoints.length / 2 + 1) * 5);
        const indices = new Uint16Array(inputPoints.length / 2 * 3);
        const centerX = lightOffsetX + lightWidth / 2; //灯光贴图中心对应的世界坐标
        const centerY = lightOffsetY + lightHeight / 2; //灯光贴图中心对应的世界坐标

        vertices[0] = lightX - layerOffsetX;
        vertices[1] = lightY - layerOffsetY;
        vertices[2] = 0;
        vertices[3] = 0.5 - (centerX - lightX) / lightWidth;
        vertices[4] = 0.5 - (centerY - lightY) / lightHeight;
        let index = 5;
        for (let i = 0; i < inputPoints.length; i += 2) {
            vertices[index++] = inputPoints[i + 0] - layerOffsetX;
            vertices[index++] = inputPoints[i + 1] - layerOffsetY;
            vertices[index++] = 0;
            vertices[index++] = 0.5 + (inputPoints[i + 0] - centerX) / lightWidth; //将x从[-width/2, width/2]映射到[0,1]
            vertices[index++] = 0.5 + (inputPoints[i + 1] - centerY) / lightHeight; //将y从[-height/2, height/2]映射到[0,1]
        }

        index = 0;
        for (let i = 0; i < inputPoints.length - 2; i += 2) {
            indices[index++] = 0;
            indices[index++] = i / 2 + 1;
            indices[index++] = i / 2 + 2;
        }
        indices[index++] = 0;
        indices[index++] = 1;
        indices[index++] = inputPoints.length / 2;
        const declaration = VertexMesh2D.getVertexDeclaration(['POSITION,UV'], false)[0];
        return Mesh2D.createMesh2DByPrimitive([vertices], [declaration], indices, IndexFormat.UInt16, [{ length: indices.length, start: 0 }]);
    }

    /**
     * 生成阴影多边形，阴影多边形是圆减去内部多边形的部分，圆要能完全包围住多边形
     * @param lightX 光源位置
     * @param lightY 
     * @param lightWidth 光源尺寸
     * @param lightHeight 
     * @param lightOffsetX 灯光贴图的偏移值
     * @param lightOffsetY 
     * @param layerOffsetX 光影图的偏移值
     * @param layerOffsetY 
     * @param inputPoints 顶点
     * @param radius 圆半径
     */
    private _genShadowMesh(lightX: number, lightY: number, lightWidth: number, lightHeight: number,
        lightOffsetX: number, lightOffsetY: number, layerOffsetX: number, layerOffsetY: number, inputPoints: number[], radius: number) {
        const points: number[] = [];
        const inds: number[] = [];
        const len = inputPoints.length;
        const centerX = lightOffsetX + lightWidth / 2; //灯光贴图中心对应的世界坐标
        const centerY = lightOffsetY + lightHeight / 2; //灯光贴图中心对应的世界坐标

        //计算和圆周交点
        let pointX = 0, pointY = 0;
        let interX = 0, interY = 0;
        let dx = 0, dy = 0, length = 0;
        const _getIntersectionPoint = () => {
            dx = pointX - lightX;
            dy = pointY - lightY;
            length = Math.sqrt(dx * dx + dy * dy);
            interX = lightX + dx / length * radius;
            interY = lightY + dy / length * radius;
        }

        //生成顶点
        for (let i = 0; i < len; i += 2) {
            pointX = inputPoints[i];
            pointY = inputPoints[i + 1];
            _getIntersectionPoint();
            points.push(pointX, pointY, interX, interY);
        }

        //三角化网格
        let current = 0, next = 0;
        const pointCount = len / 2;
        for (let i = 0; i < pointCount; i++) {
            current = i * 2;
            next = ((i + 1) % pointCount) * 2;
            inds.push(current, current + 1, next);
            inds.push(current + 1, next + 1, next);
        }

        const vertices = new Float32Array(points.length / 2 * 5);
        const indices = new Uint16Array(inds.length);
        indices.set(inds);

        let index = 0;
        for (let i = 0, len = points.length; i < len; i += 2) {
            vertices[index++] = points[i + 0] - layerOffsetX;
            vertices[index++] = points[i + 1] - layerOffsetY;
            vertices[index++] = 0;
            vertices[index++] = 0.5 + (points[i + 0] - centerX) / lightWidth; //将x从[-width/2, width/2]映射到[0,1]
            vertices[index++] = 0.5 + (points[i + 1] - centerY) / lightHeight; //将y从[-height/2, height/2]映射到[0,1]
        }

        const declaration = VertexMesh2D.getVertexDeclaration(['POSITION,UV'], false)[0];
        return Mesh2D.createMesh2DByPrimitive([vertices], [declaration], indices, IndexFormat.UInt16, [{ length: indices.length, start: 0 }]);
    }

    /**
     * 计算射线和线段的交点
     * @param ray 
     * @param segment 
     * @param result 
     */
    private _getIntersection(ray: LightLine2D, segment: LightLine2D, result: Vector4) {
        //RAY in parametric: Point + Delta*T1
        const r_px = ray.a.x;
        const r_py = ray.a.y;
        const r_dx = ray.b.x - ray.a.x;
        const r_dy = ray.b.y - ray.a.y;

        //SEGMENT in parametric: Point + Delta*T2
        const s_px = segment.a.x;
        const s_py = segment.a.y;
        const s_dx = segment.b.x - segment.a.x;
        const s_dy = segment.b.y - segment.a.y;

        //Are they parallel? If so, no intersect
        const r_mag = Math.sqrt(r_dx * r_dx + r_dy * r_dy);
        const s_mag = Math.sqrt(s_dx * s_dx + s_dy * s_dy);
        if (r_dx / r_mag === s_dx / s_mag && r_dy / r_mag === s_dy / s_mag) {
            //Unit vectors are the same.
            //console.log('parallel ray', r_px, r_py, r_dx, r_dy);
            //console.log('parallel seg', s_px, s_py, s_dx, s_dy);
            return false;
        }

        //SOLVE FOR T1 & T2
        const T2 = (r_dx * (s_py - r_py) + r_dy * (r_px - s_px)) / (s_dx * r_dy - s_dy * r_dx);
        const T1 = (s_px + s_dx * T2 - r_px) / r_dx;

        //Must be within parametic whatevers for RAY/SEGMENT
        if (T1 < 0) return false; //射线的T=[0,infinite)
        if (T2 < 0 || T2 > 1) return false; //线段的T=[0,1]

        //Return the point of intersection
        result.x = r_px + r_dx * T1;
        result.y = r_py + r_dy * T1;
        result.z = T1; //distance
        result.w = 0; //angle
        return true;
    }

    /**
     * 根据灯光位置，遮光器线段，获取光照多边形顶点序列（按顺时针排列）
     * @param lightX 
     * @param lightY 
     * @param segments 
     */
    private _getLightPolygon(lightX: number, lightY: number, segments: LightLine2D[]) {
        //Get all unique points
        const points: Vector2[] = [];
        for (let i = 0, len = segments.length; i < len; i++)
            points.push(segments[i].a, segments[i].b);

        const _uniquePoints = (points: Vector2[]) => {
            const set: { [key: string]: boolean } = {};
            return points.filter(p => {
                const key = p.x + ',' + p.y;
                if (key in set) {
                    return false;
                } else {
                    set[key] = true;
                    return true;
                }
            });
        };
        const uniquePoints = _uniquePoints(points);

        //Get all angles
        const uniqueAngles = [];
        for (let i = 0, len = uniquePoints.length; i < len; i++) {
            const uniquePoint = uniquePoints[i];
            const angle = Math.atan2(uniquePoint.y - lightY, uniquePoint.x - lightX);
            uniqueAngles.push(angle - 0.0001, angle, angle + 0.0001);
        }

        const ray = Pool.getItemByClass('LightLine2D_Ray', LightLine2D).create(0, 0, 0, 0);
        const result = new Vector4();

        //Rays in all directions
        let intersects = [];
        for (let i = 0, len = uniqueAngles.length; i < len; i++) {
            const angle = uniqueAngles[i];

            //Calculate dx & dy from angle
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);

            //Ray from light
            ray.a.x = lightX;
            ray.a.y = lightY;
            ray.b.x = lightX + dx;
            ray.b.y = lightY + dy;

            //Find CLOSEST intersection
            let closestIntersect: Vector4;
            for (let i = 0, len = segments.length; i < len; i++) {
                if (!this._getIntersection(ray, segments[i], result)) continue;
                if (!closestIntersect)
                    closestIntersect = result.clone();
                else if (result.z < closestIntersect.z)
                    closestIntersect.setValue(result.x, result.y, result.z, result.w);
            }

            //Intersect angle
            if (!closestIntersect) continue;
            closestIntersect.w = angle;

            //Add to list of intersects
            intersects.push(closestIntersect);
        }

        Pool.recover('LightLine2D_Ray', ray);

        //Sort intersects by angle
        intersects = intersects.sort((a, b) => { return a.w - b.w; });

        //Polygon is intersects, in order of angle
        return intersects;
    }
}

//reg nav component manager
Scene.regManager(Light2DManager._managerName, Light2DManager);
//reg loader init
Laya.addInitCallback(LightAndShadow.__init__);