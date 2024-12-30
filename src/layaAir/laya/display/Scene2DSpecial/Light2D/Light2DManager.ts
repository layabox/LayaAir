import { ILaya } from "../../../../ILaya";
import { Laya } from "../../../../Laya";
import { IElementComponentManager } from "../../../components/IScenceComponentManager";
import { Event } from "../../../events/Event";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Matrix } from "../../../maths/Matrix";
import { Point } from "../../../maths/Point";
import { Rectangle } from "../../../maths/Rectangle";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";
import { ShaderData, ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { WrapMode } from "../../../RenderEngine/RenderEnum/WrapMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Context } from "../../../renders/Context";
import { Mesh2D, VertexMesh2D } from "../../../resource/Mesh2D";
import { RenderTexture2D } from "../../../resource/RenderTexture2D";
import { Pool } from "../../../utils/Pool";
import { Utils } from "../../../utils/Utils";
import { RenderState2D } from "../../../webgl/utils/RenderState2D";
import { ILight2DManager, Scene } from "../../Scene";
import { BaseLight2D, Light2DType } from "./BaseLight2D";
import { DirectionLight2D } from "./DirectionLight2D";
import { Light2DConfig } from "./Light2DConfig";
import { Light2DRenderRes } from "./Light2DRenderByCmd";
import { LightLine2D } from "./LightLine2D";
import { LightOccluder2DCore } from "./LightOccluder2DCore";
import { Occluder2DAgent } from "./Occluder2DAgent";
import { LightAndShadow } from "./Shader/LightAndShadow";

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
    static REUSE_CMD: boolean = true; //复用CMD开关
    static REUSE_MESH: boolean = true; //复用Mesh开关
    static DEBUG: boolean = false; //是否打印调试信息

    lsTarget: RenderTexture2D[] = []; //渲染目标（光影图），数量等于有灯光的层数
    occluderAgent: Occluder2DAgent; //遮光器代理，便捷地创建和控制遮光器

    private _config: Light2DConfig = new Light2DConfig(); //2D灯光全局配置
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
    private _occluders: LightOccluder2DCore[] = []; //场景中的所有遮光器

    private _works: number = 0; //每帧工作负载（渲染光影图次数，每渲染一个灯光算一次）
    private _updateMark: number[] = new Array(Light2DManager.MAX_LAYER).fill(1); //各层的更新标识
    private _updateLayerLight: boolean[] = new Array(Light2DManager.MAX_LAYER).fill(false); //各层是否需要更新光影图
    private _spriteLayer: number[] = []; //具有精灵的层序号
    private _spriteNumInLayer: number[] = new Array(Light2DManager.MAX_LAYER).fill(0); //精灵在各层中的数量
    private _lightLayer: number[] = []; //具有灯光的层序号（屏幕内）
    private _lightLayerAll: number[] = []; //具有灯光的层序号
    private _lightsInLayer: BaseLight2D[][] = []; //各层中的灯光（屏幕内）
    private _lightsInLayerAll: BaseLight2D[][] = []; //各层中的所有灯光
    private _occluderLayer: number[] = []; //具有遮光器的层序号
    private _occludersInLayer: LightOccluder2DCore[][] = []; //各层中的遮光器
    private _occludersInLight: LightOccluder2DCore[][][] = []; //影响屏幕内各层灯光的遮光器

    private _lightRenderRes: Light2DRenderRes[] = []; //各层的渲染资源
    private _lightRangeChange: boolean[] = []; //各层灯光围栏是否改变

    private _sceneInv0: Vector3 = new Vector3(); //Scene逆矩阵上半部分
    private _sceneInv1: Vector3 = new Vector3(); //Scene逆矩阵下半部分
    private _stageMat0: Vector3 = new Vector3();
    private _stageMat1: Vector3 = new Vector3();
    private _lightScenePos: Point = new Point(); //灯光基于Scene的位置

    private _recoverFC: number = 0; //回收资源帧序号
    private _needToRecover: any[] = []; //需要回收的资源
    private _needUpdateLightRes: number = 0; //是否需要更新灯光资源
    private _needUpdateLightRange: number = 0; //是否需要更新灯光范围
    private _needCollectLightInLayer: number = 0; //是否需要更新各层中的灯光
    private _needCollectOccluderInLight: number = 0; //是否需要更新各层中影响各灯光的遮光器
    private _lightsNeedCheckRange: BaseLight2D[] = []; //需要检查范围的灯光

    private _tempRange: Rectangle = new Rectangle();

    static LIGHTANDSHADOW_SCENE_INV_0: number;
    static LIGHTANDSHADOW_SCENE_INV_1: number;
    static LIGHTANDSHADOW_STAGE_MAT_0: number;
    static LIGHTANDSHADOW_STAGE_MAT_1: number;
    static __init__() {
        if (!Scene.scene2DUniformMap)
            Scene.scene2DUniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap('Sprite2DGlobal');
        const scene2DUniformMap = Scene.scene2DUniformMap;
        this.LIGHTANDSHADOW_SCENE_INV_0 = Shader3D.propertyNameToID('u_LightAndShadow2DSceneInv0');
        this.LIGHTANDSHADOW_SCENE_INV_1 = Shader3D.propertyNameToID('u_LightAndShadow2DSceneInv1');
        this.LIGHTANDSHADOW_STAGE_MAT_0 = Shader3D.propertyNameToID('u_LightAndShadow2DStageMat0');
        this.LIGHTANDSHADOW_STAGE_MAT_1 = Shader3D.propertyNameToID('u_LightAndShadow2DStageMat1');
        scene2DUniformMap.addShaderUniform(this.LIGHTANDSHADOW_SCENE_INV_0, 'u_LightAndShadow2DSceneInv0', ShaderDataType.Vector3);
        scene2DUniformMap.addShaderUniform(this.LIGHTANDSHADOW_SCENE_INV_1, 'u_LightAndShadow2DSceneInv1', ShaderDataType.Vector3);
        scene2DUniformMap.addShaderUniform(this.LIGHTANDSHADOW_STAGE_MAT_0, 'u_LightAndShadow2DStageMat0', ShaderDataType.Vector3);
        scene2DUniformMap.addShaderUniform(this.LIGHTANDSHADOW_STAGE_MAT_1, 'u_LightAndShadow2DStageMat1', ShaderDataType.Vector3);
    }

    constructor(scene: Scene) {
        this._scene = scene;
        this._scene._light2DManager = this;
        this._screen = new Rectangle();
        this._screenPrev = new Vector2();
        this._screenSchmitt = new Rectangle();
        this._screenSchmittChange = false;
        this.occluderAgent = new Occluder2DAgent(this);
        ILaya.stage.on(Event.RESIZE, this, this._onScreenResize);

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
     * 响应屏幕尺寸改变
     */
    private _onScreenResize() {
        this._lights.forEach(light => light._transformChange());
        this._occluders.forEach(occluder => occluder._transformChange());
    }

    /**
     * 场景矩阵发生变化
     * @param context 
     */
    private _sceneTransformChange(context: Context) {
        let mat = ILaya.stage.transform; //获取Stage的矩阵
        this._stageMat0.set(mat.a, mat.c, mat.tx);
        this._stageMat1.set(mat.b, mat.d, mat.ty);
        if (context._drawingToTexture) {
            this._sceneInv0.set(mat.a, mat.c, mat.tx);
            this._sceneInv1.set(mat.b, mat.d, mat.ty);
        } else {
            mat = this._scene.globalTrans.getMatrixInv(Matrix.TEMP); //获取Scene的Global逆矩阵
            this._sceneInv0.set(mat.a, mat.c, mat.tx);
            this._sceneInv1.set(mat.b, mat.d, mat.ty);
        }

        const shaderData = this._scene.sceneShaderData; //上传给着色器
        shaderData.setVector3(Light2DManager.LIGHTANDSHADOW_SCENE_INV_0, this._sceneInv0);
        shaderData.setVector3(Light2DManager.LIGHTANDSHADOW_SCENE_INV_1, this._sceneInv1);
        shaderData.setVector3(Light2DManager.LIGHTANDSHADOW_STAGE_MAT_0, this._stageMat0);
        shaderData.setVector3(Light2DManager.LIGHTANDSHADOW_STAGE_MAT_1, this._stageMat1);
    }

    /**
     * @en Add render sprite
     * @param node Render node
     * @zh 添加渲染精灵
     * @param node 渲染节点
     */
    addRender(node: BaseRenderNode2D): void {
        const layer = node.layer;
        this._spriteNumInLayer[layer]++;
        if (this._spriteNumInLayer[layer] === 1)
            this._spriteLayer.push(layer);
    }

    /**
     * @en Remove render sprite
     * @param node Render node
     * @zh 删除渲染精灵
     * @param node 渲染节点
     */
    removeRender(node: BaseRenderNode2D): void {
        const layer = node.layer;
        this._spriteNumInLayer[layer]--;
        if (this._spriteNumInLayer[layer] === 0)
            this._spriteLayer.splice(this._spriteLayer.indexOf(layer), 1);
    }

    name: string;
    Init(data: any): void {
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
        this.needCheckLightRange(light);
        if (Light2DManager.DEBUG)
            console.log('light transform change', light);
    }

    /**
     * 检查灯光范围，如果需要更新则更新
     * @param light 灯光对象
     */
    private _checkLightRange(light: BaseLight2D) {
        const layers = light.layers;
        for (let i = layers.length - 1; i > -1; i--) {
            const layer = layers[i];
            if (!light._isInRange(this._screenSchmitt)) {
                const mask = (1 << layer);
                this.needCollectLightInLayer(mask)
                this.needUpdateLightRange(mask);
                this._updateLayerLight[layer] = true;
            }
        }
    }

    /**
     * @en Need check the light range
     * @param light light object
     * @zh 需要检查灯光范围
     * @param light 灯光对象
     */
    needCheckLightRange(light: BaseLight2D) {
        this._lightsNeedCheckRange.push(light);
    }

    /**
     * @en Need update the light range
     * @param layerMask mask layer
     * @zh 需要更新灯光范围
     * @param layerMask 遮罩层
     */
    needUpdateLightRange(layerMask: number) {
        this._needUpdateLightRange |= layerMask;
    }

    /**
     * @en Need collect light in layers
     * @param layerMask mask layer
     * @zh 是否需要收集各层中的灯光
     * @param layerMask 遮罩层
     */
    needCollectLightInLayer(layerMask: number) {
        this._needCollectLightInLayer |= layerMask;
    }

    /**
     * @en Need collect occluder in layers who effect lights
     * @param layerMask mask layer
     * @zh 是否需要收集各层中影响各灯光的遮光器
     * @param layerMask 遮罩层
     */
    needCollectOccluderInLight(layerMask: number) {
        this._needCollectOccluderInLight |= layerMask;
    }

    /**
     * @en light layer mask change
     * @param light Light object
     * @param oldLayerMask old mask layer
     * @param newLayerMask new mask layer
     * @zh 灯光的影响层发生变化
     * @param light 灯光对象 
     * @param oldLayerMask 新遮罩层
     * @param newLayerMask 旧遮罩层
     */
    lightLayerMaskChange(light: BaseLight2D, oldLayerMask: number, newLayerMask: number) {
        if (this._lights.indexOf(light) !== -1) { //执行这段逻辑之前必须保证该灯光已经添加
            for (let i = 0; i < Light2DManager.MAX_LAYER; i++) {
                const mask = 1 << i;
                const index = this._lightsInLayerAll[i]?.indexOf(light);
                if (newLayerMask & mask) {
                    if (index === undefined || index === -1) {
                        if (!this._lightsInLayerAll[i])
                            this._lightsInLayerAll[i] = [];
                        this._lightsInLayerAll[i].push(light); //将灯光加入受影响的层
                        if (this._lightLayerAll.indexOf(i) === -1) //记录有灯光的层序号
                            this._lightLayerAll.push(i);
                        this._collectLightInScreenByLayer(i); //收集该层屏幕内的灯光
                        this._updateLayerLight[i] = true;
                    }
                } else if (oldLayerMask & mask) {
                    if (index >= 0) {
                        this._lightsInLayerAll[i].splice(index, 1); //将灯光从受影响的层中去除
                        if (this._lightsInLayerAll[i].length === 0) //如果受影响的层已经没有灯光，将层序号去除
                            this._lightLayerAll.splice(this._lightLayerAll.indexOf(i), 1);
                        this._collectLightInScreenByLayer(i); //收集该层屏幕内的灯光
                        this._updateLayerLight[i] = true;
                    }
                }
            }
            this.needUpdateLightRange(newLayerMask); //通知相应的层更新灯光范围并集
            if (Light2DManager.DEBUG)
                console.log('light layer mask change', light, oldLayerMask, newLayerMask);
        }
    }

    /**
     * @en light shadow layer mark change
     * @param light Light object
     * @param oldLayerMask old shadow mask layer
     * @param newLayerMask new shadow mask layer
     * @zh 灯光的阴影遮罩层发生变化
     * @param light 灯光对象  
     * @param oldLayerMask 旧阴影遮罩层
     * @param newLayerMask 新阴影遮罩层
     */
    lightShadowLayerMaskChange(light: BaseLight2D, oldLayerMask: number, newLayerMask: number) {
        this.needCollectOccluderInLight(oldLayerMask | newLayerMask);
        if (Light2DManager.DEBUG)
            console.log('light shadow layer mask change', light, oldLayerMask, newLayerMask);
    }

    /**
     * @en light shadow pcf change
     * @param light Light object
     * @zh 灯光的阴影PCF参数发生变化
     * @param light 灯光对象 
     */
    lightShadowPCFChange(light: BaseLight2D) {
        this._updateLightPCF(light);
        if (Light2DManager.DEBUG)
            console.log('light shadow pcf change', light);
    }

    /**
     * @en light shadow enable change
     * @param light 
     * @zh 灯光的阴影使能变化
     * @param light 
     */
    lightShadowEnableChange(light: BaseLight2D) {
        const layers = light.layers;
        for (let i = layers.length - 1; i > -1; i--)
            if (this._lightRenderRes[layers[i]])
                this._lightRenderRes[layers[i]].enableShadow(light, this._needToRecover);
    }

    /**
     * @en Clear all lights
     * @zh 清除所有灯光
     */
    clearLight() {
        this._lights.length = 0;
        this._lightLayerAll.length = 0;
        this._lightsInLayerAll.length = 0;
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
            this.needUpdateLightRange(light.layerMask); //通知相应的层更新灯光范围并集
            if (Light2DManager.DEBUG)
                console.log('remove light', light);
        }
    }

    /**
     * @en Clear all occluders
     * @zh 清除所有遮光器
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
    addOccluder(occluder: LightOccluder2DCore) {
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
    removeOccluder(occluder: LightOccluder2DCore) {
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
     * @en Occluder layer change
     * @param occluder 
     * @param oldLayerMask 
     * @param newLayerMask 
     * @zh 遮光器的影响层发生变化
     * @param occluder 
     * @param oldLayerMask 
     * @param newLayerMask 
     */
    occluderLayerMaskChange(occluder: LightOccluder2DCore, oldLayerMask: number, newLayerMask: number) {
        if (this._occluders.indexOf(occluder) !== -1) { //执行这段逻辑之前必须保证该遮光器已经添加
            for (let i = 0; i < Light2DManager.MAX_LAYER; i++) {
                const mask = 1 << i;
                const index = this._occludersInLayer[i]?.indexOf(occluder);
                if (newLayerMask & mask) {
                    if (index === undefined || index === -1) {
                        if (!this._occludersInLayer[i])
                            this._occludersInLayer[i] = [];
                        this._occludersInLayer[i].push(occluder); //将遮光器加入受影响的层
                        if (this._occluderLayer.indexOf(i) === -1) //记录有遮光器的层序号
                            this._occluderLayer.push(i);
                    }
                } else if (oldLayerMask & mask) {
                    if (index >= 0) {
                        this._occludersInLayer[i].splice(index, 1); //将遮光器从受影响的层中去除
                        if (this._occludersInLayer[i].length === 0) //如果受影响的层已经没有遮光器，将层序号去除
                            this._occluderLayer.splice(this._occluderLayer.indexOf(i), 1);
                    }
                }
            }
            this._needCollectOccluderInLight |= oldLayerMask;
            this._needCollectOccluderInLight |= newLayerMask;

            if (Light2DManager.DEBUG)
                console.log('occluder layer change', occluder, oldLayerMask, newLayerMask);
        }
    }

    /**
     * 收集屏幕内指定层中的灯光和遮挡器
     * @param layer 层序号
     */
    private _collectLightInScreenByLayer(layer: number) {
        let lights = this._lightsInLayer[layer];
        const lightsAll = this._lightsInLayerAll[layer];

        if (this._screenSchmitt.width === 0
            || this._screenSchmitt.height === 0) {
            if (!lights)
                this._lightsInLayer[layer] = [];
            else lights.length = 0;
            return;
        }

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
            if (lightsAll[i]._isInScreen(this._screenSchmitt)) {
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
                console.log('create light layer texture', x, y, z, w, layer);
        } else if (param.z != z || param.w != w) {
            this._needToRecover.push(lsTarget);
            param.setValue(x, y, z, w);
            lsTarget = this.lsTarget[layer] = new RenderTexture2D(z, w, RenderTargetFormat.R8G8B8A8);
            lsTarget.wrapModeU = WrapMode.Clamp;
            lsTarget.wrapModeV = WrapMode.Clamp;
            lsTarget._invertY = LayaGL.renderEngine._screenInvertY;
            if (Light2DManager.DEBUG)
                console.log('update light layer texture', x, y, z, w, layer);
        } else {
            param.x = x;
            param.y = y;
        }

        //设置更新标志
        this._updateMark[layer]++;

        //更新该层的渲染资源
        this._updateLayerRenderRes(layer);

        //收集影响灯光的遮光器
        for (let i = lights.length - 1; i > -1; i--)
            this._collectOccludersInLight(layer, lights[i], i);
        this._needCollectOccluderInLight &= ~(1 << layer);

        if (Light2DManager.DEBUG)
            console.log('collect light in screen by layer', layer);
    }

    /**
     * 更新指定层的渲染资源
     * @param layer 层序号
     */
    private _updateLayerRenderRes(layer: number) {
        if (!this._lightRenderRes[layer])
            this._lightRenderRes[layer] = new Light2DRenderRes(this._scene, layer, LayaGL.renderEngine._screenInvertY);
        this._lightRenderRes[layer].addLights(this._lightsInLayer[layer], this._needToRecover);
        this._needUpdateLightRes |= (1 << layer);
        if (Light2DManager.REUSE_CMD) {
            this._lightRenderRes[layer].setRenderTargetCMD(this.lsTarget[layer]);
            this._lightRenderRes[layer].buildRenderMeshCMD();
        }
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
        const screen = this._screenSchmitt;
        for (let i = 0, len = lights.length; i < len; i++) {
            if (i === 0) {
                const r = lights[i]._getWorldRange(this._screenSchmitt);
                if (Light2DManager.DEBUG)
                    console.log('range =', r.x, r.y, r.width, r.height, lights[i]);
                lights[i]._getWorldRange(this._screenSchmitt).cloneTo(range);
            }
            else {
                const r = lights[i]._getWorldRange(this._screenSchmitt);
                if (Light2DManager.DEBUG)
                    console.log('range =', r.x, r.y, r.width, r.height, lights[i]);
                range.union(lights[i]._getWorldRange(this._screenSchmitt), range);
            }
        }
        range.union(screen, range); //不要小于屏幕，避免IDE中滚动屏幕时，灯光计算范围过窄
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
                console.log('light range schmitt =', rangeSchmitt.x, rangeSchmitt.y, rangeSchmitt.width, rangeSchmitt.height, layer);
        }

        if (Light2DManager.DEBUG)
            console.log('calc light range', layer);
        return rangeSchmitt;
    }

    /**
     * 提取指定层中灯光遮挡器线段
     * @param layer 
     * @param sn 
     * @param lightX 
     * @param lightY 
     * @param shadow 
     */
    private _getOccluderSegment(layer: number, sn: number, lightX: number, lightY: number, shadow: boolean) {
        const range = this._lightRangeSchmitt[layer];
        if (!range) return this._segments;
        const x = range.x - 10;
        const y = range.y - 10;
        const w = range.width + 20;
        const h = range.height + 20;
        const segments = this._segments;
        if (segments.length >= 4) {
            for (let i = 0; i < 4; i++) //只能recover本函数创建的4个线段
                Pool.recover('LightLine2D', segments[i]);
        }
        segments.length = 0;
        segments.push(Pool.getItemByClass('LightLine2D', LightLine2D).create(x, y, x + w, y)); //上边框
        segments.push(Pool.getItemByClass('LightLine2D', LightLine2D).create(x + w, y, x + w, y + h)); //右边框
        segments.push(Pool.getItemByClass('LightLine2D', LightLine2D).create(x + w, y + h, x, y + h)); //下边框
        segments.push(Pool.getItemByClass('LightLine2D', LightLine2D).create(x, y + h, x, y)); //左边框
        if (shadow && this._occludersInLight[layer]) {
            const occluders = this._occludersInLight[layer][sn];
            if (occluders) {
                for (let i = occluders.length - 1; i > -1; i--) {
                    const occluder = occluders[i];
                    if (occluder.selectByLight(lightX, lightY))
                        segments.push(...occluder.getSegment(lightX, lightY));
                }
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
            if (light.shadowLayerMask & (1 << layer)) {
                const range = light._getWorldRange(this._screenSchmitt);
                for (let i = occluders.length - 1; i > -1; i--)
                    if (occluders[i].isInLightRange(range))
                        result.push(occluders[i]);
            }
        }
    }

    /**
     * 回收资源
     */
    private _recoverResource() {
        //回收资源（每10帧回收一次）
        if (ILaya.timer.currFrame > this._recoverFC) {
            if (this._needToRecover.length > 0) {
                for (let i = this._needToRecover.length - 1; i > -1; i--)
                    this._needToRecover[i].destroy();
                this._needToRecover.length = 0;
            }
            this._recoverFC = ILaya.timer.currFrame + 10;
        }
    }

    /**
     * @en Render light and shader texture
     * @param context Render context
     * @zh 渲染光影图
     * @param context 渲染上下文
     */
    preRenderUpdate(context: Context) {
        //处理场景矩阵变化
        this._sceneTransformChange(context);

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
                    if (occluders[i].needUpdate)
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
        if (this._needCollectOccluderInLight > 0) {
            for (let i = this._lightLayerAll.length - 1; i > -1; i--) {
                const layer = this._lightLayerAll[i];
                if (this._needCollectOccluderInLight & (1 << layer)) {
                    const lights = this._lightsInLayer[layer];
                    for (let i = lights.length - 1; i > -1; i--)
                        this._collectOccludersInLight(layer, lights[i], i); //收集影响灯光的遮光器
                }
            }
        }

        //遍历需要检查范围的灯光
        for (let i = this._lightsNeedCheckRange.length - 1; i > -1; i--)
            this._checkLightRange(this._lightsNeedCheckRange[i]);
        this._lightsNeedCheckRange.length = 0;

        //遍历有灯光的层
        for (let i = this._lightLayer.length - 1; i > -1; i--) {
            let needRender = false;
            const layer = this._lightLayer[i];
            const renderRes = this._lightRenderRes[layer];
            const occluders = this._occludersInLayer[layer];
            const layerMask = (1 << layer);
            const x = this._screenSchmitt.x;
            const y = this._screenSchmitt.y;
            if (this._needUpdateLightRange & layerMask)
                this._calcLightRange(layer);
            if (this._spriteNumInLayer[layer] === 0)
                continue; //该层没有精灵，跳过
            if (occluders)
                for (let j = occluders.length - 1; j > -1; j--)
                    occluders[j]._getRange();
            let lightChange = false; //灯光是否有变化
            let screenChange = false; //屏幕是否有变化
            let occluderChange = false; //遮光器是否有变化
            if (this._screenSchmittChange
                || (this._needCollectLightInLayer & layerMask) > 0
                || (this._needCollectOccluderInLight & layerMask) > 0
                || (this._needUpdateLightRes & layerMask) > 0) //需要更新灯光资源（灯光有增减）
                screenChange = true;
            if (this._updateLayerLight[layer]) { //是否需要更新该层光影图
                this._updateLayerLight[layer] = false;
                screenChange = true;
            }
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
                light.getScenePos(this._lightScenePos); //获取基于Scene的位置
                light.renderLightTexture(); //按需更新灯光贴图
                if (!screenChange) {
                    lightChange = _isLightUpdate(light);
                    occluderChange = _isOccluderUpdate(layer, j);
                }
                if (screenChange || occluderChange || lightChange) { //状态有改变，更新光照网格和阴影网格
                    for (let k = lightMesh.length - 1; k > -1; k--) { //遍历PCF
                        renderRes.updateLightMesh(this._update(layer, x, y, light, lightMesh[k], k, j), j, k);
                        works++;
                    }
                    const pcfIntensity = light._pcfIntensity();
                    material.setColor('u_LightColor', light.color);
                    material.setFloat('u_LightIntensity', light.intensity);
                    material.setFloat('u_LightRotation', light.lightRotation);
                    material.setVector2('u_LightScale', light.lightScale);
                    material.setVector2('u_LightTextureSize', light._getTextureSize());
                    material.setFloat('u_PCFIntensity', pcfIntensity);
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
                            materialShadow.setFloat('u_PCFIntensity', pcfIntensity);
                            renderRes.updateShadowMesh(this._updateShadow(layer, x, y, light, shadowMesh, j), j);
                            works++;
                        }
                    } else if (shadowMesh) { //此灯光该层无阴影
                        if (!Light2DManager.REUSE_MESH)
                            this._needToRecover.push(shadowMesh);
                        renderRes.shadowMeshs[j] = null;
                    }
                    needRender = true;
                }
                lightChange = false;
                occluderChange = false;
            }
            if (needRender) { //更新光影图
                if (Light2DManager.REUSE_CMD)
                    renderRes.updateMaterial();
                renderRes.render(this.lsTarget[layer]);
            }
        }

        //清除相关标志
        for (let i = this._lightLayer.length - 1; i > -1; i--) {
            const layer = this._lightLayer[i];
            const lights = this._lightsInLayer[layer];
            for (let j = 0, len = lights.length; j < len; j++)
                lights[j]._needUpdateLightAndShadow = false;
            for (let j = 0, len = this._occluders.length; j < len; j++)
                this._occluders[j].needUpdate = false;
        }
        this._screenSchmittChange = false;
        this._needUpdateLightRes = 0;
        this._needUpdateLightRange = 0;
        this._needCollectLightInLayer = 0;
        this._needCollectOccluderInLight = 0;

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
        shaderData.setNumber(BaseLight2D.LIGHTANDSHADOW_LIGHT_HEIGHT, this.config.lightHeight);
        if (this.config.ambientLayerMask & (1 << layer))
            shaderData.setColor(BaseLight2D.LIGHTANDSHADOW_AMBIENT, this.config.ambient);
        else shaderData.setColor(BaseLight2D.LIGHTANDSHADOW_AMBIENT, Color.CLEAR);
        if (this.lsTarget[layer]) {
            shaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_EMPTY);
            shaderData.setTexture(BaseLight2D.LIGHTANDSHADOW, this.lsTarget[layer]);
        } else {
            shaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_EMPTY);
            shaderData.setTexture(BaseLight2D.LIGHTANDSHADOW, null);
        }
        if (this._param[layer])
            shaderData.setVector(BaseLight2D.LIGHTANDSHADOW_PARAM, this._param[layer]);
    }

    /**
     * 更新屏幕尺寸和偏移参数
     */
    private _updateScreen() {
        const area2DArrays = this._scene._area2Ds;
        if (area2DArrays.length > 0) {
            let xL = 10000000;
            let xR = -10000000;
            let yB = 10000000;
            let yT = -10000000;
            for (let i = 0; i < area2DArrays.length; i++) {
                const camera = area2DArrays[i].mainCamera;
                if (camera) {
                    let rect = camera._rect;
                    xL = Math.min(xL, rect.x);
                    xR = Math.max(xR, rect.y);
                    yB = Math.min(yB, rect.z);
                    yT = Math.max(yT, rect.w);
                }
            }
            this._screen.x = xL;
            this._screen.y = yB;
            this._screen.width = xR - xL;
            this._screen.height = yT - yB;
            if (this._screen.width < 0 || this._screen.height < 0) {
                this._screen.x = 0;
                this._screen.y = 0;
                this._screen.width = RenderState2D.width | 0;
                this._screen.height = RenderState2D.height | 0;
            }
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
     * @param sn 
     */
    private _update(layer: number, layerOffsetX: number, layerOffsetY: number, light: BaseLight2D, mesh: Mesh2D, pcf: number, sn: number) {
        const _calcLightX = (light: BaseLight2D, pcf: number) => {
            if (light.getLightType() === Light2DType.Direction)
                return this._screen.x + this._screen.width / 2 -
                    ((light as DirectionLight2D).directionVector.x +
                        this._PCF[pcf].x * light.shadowFilterSmooth * 0.01) * DirectionLight2D.LIGHT_SIZE / 4;
            return (this._lightScenePos.x + this._PCF[pcf].x * light.shadowFilterSmooth);
        };
        const _calcLightY = (light: BaseLight2D, pcf: number) => {
            if (light.getLightType() === Light2DType.Direction)
                return this._screen.y + this._screen.height / 2 -
                    ((light as DirectionLight2D).directionVector.y +
                        this._PCF[pcf].y * light.shadowFilterSmooth * 0.01) * DirectionLight2D.LIGHT_SIZE / 4;
            return (this._lightScenePos.y + this._PCF[pcf].y * light.shadowFilterSmooth);
        };

        let ret = mesh;
        const lightX = _calcLightX(light, pcf);
        const lightY = _calcLightY(light, pcf);
        const lightRange = light._getLightRange();
        const lightOffsetX = lightRange.x;
        const lightOffsetY = lightRange.y;
        const lightWidth = lightRange.width;
        const lightHeight = lightRange.height;
        const ss = this._getOccluderSegment(layer, sn, lightX, lightY, light.shadowEnable);
        const poly = this._getLightPolygon(lightX, lightY, ss);
        const len = poly.length;
        if (len > 2) {
            let index = 0;
            this._points.length = len * 2;
            for (let i = 0; i < len; i++) {
                this._points[index++] = poly[i].x;
                this._points[index++] = poly[i].y;
            }
            ret = this._genLightMesh(lightX, lightY, lightWidth, lightHeight, lightOffsetX, lightOffsetY, layerOffsetX, layerOffsetY, this._points, mesh);
        }
        for (let i = 0; i < len; i++)
            Pool.recover('Vector4', poly[i]); //poly来自内存池，需要归还
        return ret;
    }

    /**
     * 更新光影信息（阴影）
     * @param layer 
     * @param layerOffsetX 
     * @param layerOffsetY 
     * @param light 
     * @param mesh 
     * @param sn 
     */
    private _updateShadow(layer: number, layerOffsetX: number, layerOffsetY: number, light: BaseLight2D, mesh: Mesh2D, sn: number) {
        const _calcLightX = (light: BaseLight2D) => {
            if (light.getLightType() == Light2DType.Direction)
                return this._screen.x + this._screen.width / 2 -
                    (light as DirectionLight2D).directionVector.x * DirectionLight2D.LIGHT_SIZE / 4;
            return this._lightScenePos.x;
        };
        const _calcLightY = (light: BaseLight2D) => {
            if (light.getLightType() == Light2DType.Direction)
                return this._screen.y + this._screen.height / 2 -
                    (light as DirectionLight2D).directionVector.y * DirectionLight2D.LIGHT_SIZE / 4;
            return this._lightScenePos.y;
        };

        let ret = mesh;
        const lightX = _calcLightX(light);
        const lightY = _calcLightY(light);
        const lightRange = light._getLightRange();
        const worldRange = light._getWorldRange();
        const lightOffsetX = lightRange.x;
        const lightOffsetY = lightRange.y;
        const lightWidth = lightRange.width;
        const lightHeight = lightRange.height;
        const ss = this._getOccluderSegment(layer, sn, lightX, lightY, light.shadowEnable);
        const poly = this._getLightPolygon(lightX, lightY, ss);
        const len = poly.length;
        if (len > 2) {
            let index = 0;
            this._points.length = len * 2;
            for (let i = 0; i < len; i++) {
                this._points[index++] = poly[i].x;
                this._points[index++] = poly[i].y;
            }
            const radius = Math.max(worldRange.width, worldRange.height) * 2;
            ret = this._genShadowMesh(lightX, lightY, lightWidth, lightHeight, lightOffsetX, lightOffsetY, layerOffsetX, layerOffsetY, this._points, radius, mesh);
        }
        for (let i = 0; i < len; i++)
            Pool.recover('Vector4', poly[i]); //poly来自内存池，需要归还
        return ret;
    }

    /**
     * @en Generates or updates a mesh object.
     * @param vertices Vertex data representing the coordinates of the mesh vertices.
     * @param indices Index data representing how the mesh vertices are connected.
     * @param mesh Optional reusable mesh object. If provided, this mesh object will be updated if possible.
     * @returns The generated or updated mesh object.
     * @zh 创建或更新网格对象
     * @param vertices 顶点数据，表示网格的顶点坐标。
     * @param indices 索引数据，表示网格顶点的连接方式。
     * @param mesh 可选的复用网格对象，如果传入则尝试更新此网格对象。不传则会创建一个新的网格对象。
     * @returns 生成或更新后的网格对象。
    */
    private _makeOrUpdateMesh(vertices: Float32Array, indices: Uint16Array, mesh?: Mesh2D) {
        if (mesh) {
            const idx = mesh.getIndices();
            const ver = mesh.getVertices()[0];
            if (Light2DManager.REUSE_MESH
                && idx.length >= indices.length
                && ver.byteLength >= vertices.byteLength) { //mesh可以复用
                mesh.setIndices(indices);
                mesh.setVertexByIndex(vertices.buffer, 0);
                mesh.getSubMesh(0).clearRenderParams();
                mesh.getSubMesh(0).setDrawElemenParams(indices.length, 0);
                return mesh; //返回原mesh
            } else this._needToRecover.push(mesh); //mesh不可以复用，回收
        }
        const declaration = VertexMesh2D.getVertexDeclaration(['POSITION,UV'], false)[0];
        return Mesh2D.createMesh2DByPrimitive([vertices], [declaration], indices, IndexFormat.UInt16, [{ length: indices.length, start: 0 }], true);
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
     * @param mesh 
     */
    private _genLightMesh(lightX: number, lightY: number, lightWidth: number, lightHeight: number,
        lightOffsetX: number, lightOffsetY: number, layerOffsetX: number, layerOffsetY: number,
        inputPoints: number[], mesh: Mesh2D) {
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

        return this._makeOrUpdateMesh(vertices, indices, mesh);
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
     * @param mesh 
     */
    private _genShadowMesh(lightX: number, lightY: number, lightWidth: number, lightHeight: number,
        lightOffsetX: number, lightOffsetY: number, layerOffsetX: number, layerOffsetY: number,
        inputPoints: number[], radius: number, mesh: Mesh2D) {
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

        return this._makeOrUpdateMesh(vertices, indices, mesh);
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

        const ray = Pool.getItemByClass('LightLine2D', LightLine2D).create(0, 0, 0, 0);
        const result = Pool.getItemByClass('Vector4', Vector4);

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
                if (!closestIntersect) {
                    closestIntersect = Pool.getItemByClass('Vector4', Vector4);
                    result.cloneTo(closestIntersect);
                }
                else if (result.z < closestIntersect.z)
                    closestIntersect.setValue(result.x, result.y, result.z, result.w);
            }

            //Intersect angle
            if (!closestIntersect) continue;
            closestIntersect.w = angle;

            //Add to list of intersects
            intersects.push(closestIntersect);
        }

        Pool.recover('LightLine2D', ray);
        Pool.recover('Vector4', result);

        //Sort intersects by angle
        intersects = intersects.sort((a, b) => { return a.w - b.w; });

        //Polygon is intersects, in order of angle
        return intersects;
    }
}

//reg light2d component manager
Scene.regManager(Light2DManager._managerName, Light2DManager);
//reg loader init
Laya.addInitCallback(LightAndShadow.__init__);