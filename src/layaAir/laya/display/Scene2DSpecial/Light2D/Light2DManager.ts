import { Color } from "../../../maths/Color";
import { Rectangle } from "../../../maths/Rectangle";
import { Vector2 } from "../../../maths/Vector2";
import { Vector4 } from "../../../maths/Vector4";
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { WrapMode } from "../../../RenderEngine/RenderEnum/WrapMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Context } from "../../../renders/Context";
import { Material } from "../../../resource/Material";
import { Mesh2D, VertexMesh2D } from "../../../resource/Mesh2D";
import { RenderTexture2D } from "../../../resource/RenderTexture2D";
import { Browser } from "../../../utils/Browser";
import { RenderState2D } from "../../../webgl/utils/RenderState2D";
import { Scene } from "../../Scene";
import { Sprite } from "../../Sprite";
import { Mesh2DRender } from "../Mesh2DRender";
import { BaseLight2D, Light2DType, ShadowFilterType } from "./BaseLight2D";
import { DirectionLight2D } from "./DirectionLight2D";
import { LightOccluder2D } from "./LightOccluder2D";
import { LightLine2D } from "./LightLine2D";
import { ShowRenderTarget } from "./ShowRenderTarget";
import { Laya } from "../../../../Laya";
import { ShaderData } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";

/**
 * 生成2D光影图的渲染流程
 */
export class Light2DManager {
    static MAX_LAYER: number = 32; //最大层数
    static LIGHT_SCHMITT_SIZE: number = 10; //灯光施密特边缘尺寸
    static SCREEN_SCHMITT_SIZE: number = 200; //屏幕施密特边缘尺寸

    target: RenderTexture2D[] = []; //渲染目标（光影图），数量等于有灯光的层数
    param: Vector4[] = []; //光影图参数（xy：偏移，zw：宽高）
    ambient: Color = new Color(0.25, 0.25, 0.25, 1); //环境光
    ambientLayerMask: number = 1; //环境光影响的层

    sceneTarget: RenderTexture2D; //临时测试用

    private _PCF: Vector2[] = []; //PCF系数
    private _scene: Scene; //场景对象
    private _screen: Rectangle; //屏幕偏移和尺寸
    private _screenPrev: Vector2; //先前屏幕尺寸
    private _screenSchmitt: Rectangle; //带施密特性质的屏幕偏移和尺寸
    private _screenSchmittChange: boolean; //带施密特性质的屏幕是否发生变化
    private _root: Sprite; //精灵根节点
    private _sprites: Sprite[][] = []; //灯光精灵，数量等于当前层的灯光数量*PCF值
    private _render: Mesh2DRender[][] = []; //2D网格渲染器，数量等于当前层的灯光数量*PCF值
    private _material: Material[] = []; //生成光影图的材质，数量等于当前层的灯光数量
    private _spritesShadow: Sprite[] = []; //阴影精灵，数量等于当前层的灯光数量
    private _renderShadow: Mesh2DRender[] = []; //2D网格渲染器，数量等于当前层的灯光数量
    private _materialShadow: Material[] = []; //生成阴影图的材质，数量等于当前层的灯光数量
    private _lightRangeSchmitt: Rectangle[] = []; //带施密特性质灯光范围，数量等于当前层的灯光数量
    private _segments: LightLine2D[] = []; //当前层所有遮光器组成的线段
    private _points: number[] = []; //遮光器线段提取的点集

    private _lights: BaseLight2D[] = []; //场景中的所有灯光
    private _occluders: LightOccluder2D[] = []; //场景中的所有遮光器

    private _works: number = 0; //每帧工作负载
    private _updateMark: number[] = new Array(32).fill(0); //各层的更新标识
    private _lightsInLayer: BaseLight2D[][] = []; //各层中的灯光
    private _occludersInLayer: LightOccluder2D[][] = []; //各层中的遮光器
    private _occludersInLight: LightOccluder2D[] = []; //影响当前灯光的遮光器

    private _rangeState: string[] = []; //各层灯光围栏状态
    private _lightsState: string[][] = []; //各层中各灯光状态
    private _occludersState: string[][] = []; //各层中影响各灯的遮光器状态

    private _recoverFC: number = 0; //回收资源帧序号
    private _needToRecover: any[] = []; //需要回收的资源
    private _showRenderTarget: ShowRenderTarget[] = []; //用于临时显示渲染目标

    private _tempRange: Rectangle = new Rectangle();

    constructor(scene: Scene) {
        this._scene = scene;
        this._root = new Sprite();
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

    showRenderTarget(layer: number = 0) {
        if (!this._showRenderTarget[layer])
            this._showRenderTarget[layer] = new ShowRenderTarget(this._scene, this.target[layer], 1200, layer * 300, 300, 300);
        else this._showRenderTarget[layer].setRenderTarget(this.target[layer]);
    }

    //临时测试用
    showSceneTarget(layer: number = 0) {
        if (!this._showRenderTarget[layer])
            this._showRenderTarget[layer] = new ShowRenderTarget(this._scene, this.sceneTarget, 400, layer * 300, this._screen.width / 4, this._screen.height / 4);
        else this._showRenderTarget[layer].setRenderTarget(this.sceneTarget);
    }

    /**
     * @en Clear all lights
     * @zh 清除所有灯光
     */
    clearLight() {
        this._lights.length = 0;
    }

    /**
     * @en Add light
     * @zh 添加灯光
     * @param light 
     */
    addLight(light: BaseLight2D) {
        if (this._lights.indexOf(light) === -1)
            this._lights.push(light);
    }

    /**
     * @en Remove light
     * @zh 移除灯光
     * @param light 
     */
    removeLight(light: BaseLight2D) {
        const index = this._lights.indexOf(light);
        if (index >= 0)
            this._lights.splice(index, 1);
    }

    /**
     * @en Clear all occluders
     * @zn 清除所有遮光器
     */
    clearOccluder() {
        this._occluders.length = 0;
    }

    /**
     * @en Add occluder
     * @zh 添加遮光器
     * @param occluder 
     */
    addOccluder(occluder: LightOccluder2D) {
        if (this._occluders.indexOf(occluder) === -1)
            this._occluders.push(occluder);
    }

    /**
     * @en Remove occluder
     * @zh 移除遮光器
     * @param occluder 
     */
    removeOccluder(occluder: LightOccluder2D) {
        const index = this._occluders.indexOf(occluder);
        if (index >= 0)
            this._occluders.splice(index, 1);
    }

    /**
     * @en Collect lights and occlusions from specified layers
     * @zh 收集指定层中的灯光和遮挡器
     * @param layer 
     */
    private _collectLightAndOccluderInLayer(layer: number) {
        const mask = 1 << layer;
        let lights = this._lightsInLayer[layer];
        let occluders = this._occludersInLayer[layer];
        if (!lights)
            lights = this._lightsInLayer[layer] = [];
        else lights.length = 0;
        if (!occluders)
            occluders = this._occludersInLayer[layer] = [];
        else occluders.length = 0;

        for (let i = this._lights.length - 1; i > -1; i--)
            if (this._lights[i].layerMask & mask)
                if (this._lights[i].isInScreen(this._screenSchmitt))
                    lights.push(this._lights[i]);
        for (let i = this._occluders.length - 1; i > -1; i--)
            if (this._occluders[i].layerMask & mask)
                occluders.push(this._occluders[i]);
    }

    /**
     * @en Is there any light in the specified layer
     * @zh 指定层中是否有灯光
     * @param layer 
     */
    private _isHaveLight(layer: number) {
        let lights = this._lightsInLayer[layer];
        if (!lights)
            lights = this._lightsInLayer[layer] = [];
        this._collectLightAndOccluderInLayer(layer);
        this._calcLightRange(layer);
        return lights.length > 0;
    }

    /**
     * @en Calculate the range of the current layer's light and shadow map (with Schmidt)
     * @zh 计算当前层的光影图范围（带施密特）
     * @param layer 
     */
    private _calcLightRange(layer: number) {
        const range = this._tempRange.reset();
        const lights = this._lightsInLayer[layer];
        for (let i = 0, len = lights.length; i < len; i++) {
            if (i === 0)
                lights[i].getLightRange(this._screenSchmitt).cloneTo(range);
            else range.union(lights[i].getLightRange(this._screenSchmitt), range);
        }

        let rangeSchmitt = this._lightRangeSchmitt[layer];
        if (!rangeSchmitt)
            rangeSchmitt = this._lightRangeSchmitt[layer] = new Rectangle();

        if (range.x < rangeSchmitt.x
            || range.y < rangeSchmitt.y
            || range.x + range.width > rangeSchmitt.x + rangeSchmitt.width
            || range.y + range.height > rangeSchmitt.y + rangeSchmitt.height) {
            rangeSchmitt.x = (range.x - Light2DManager.LIGHT_SCHMITT_SIZE) | 0;
            rangeSchmitt.y = (range.y - Light2DManager.LIGHT_SCHMITT_SIZE) | 0;
            rangeSchmitt.width = (range.width + Light2DManager.LIGHT_SCHMITT_SIZE * 2) | 0;
            rangeSchmitt.height = (range.height + Light2DManager.LIGHT_SCHMITT_SIZE * 2) | 0;
        }

        rangeSchmitt.x = rangeSchmitt.x | 0;
        rangeSchmitt.y = rangeSchmitt.y | 0;
        rangeSchmitt.width = rangeSchmitt.width | 0;
        rangeSchmitt.height = rangeSchmitt.height | 0;
        return rangeSchmitt;
    }

    /**
     * @en Extract light occluder segments from the specified layer
     * @zh 提取指定层中灯光遮挡器线段
     * @param layer 
     * @param lightX 
     * @param lightY 
     * @param shadow 
     */
    private _getOccluderSegment(layer: number, lightX: number, lightY: number, shadow: boolean) {
        const range = this._lightRangeSchmitt[layer];
        const x = range.x;
        const y = range.y;
        const w = range.width;
        const h = range.height;
        this._segments.length = 0;
        this._segments.push(new LightLine2D(x, y, x + w, y, false)); //上边框
        this._segments.push(new LightLine2D(x + w, y, x + w, y + h, false)); //右边框
        this._segments.push(new LightLine2D(x + w, y + h, x, y + h, false)); //下边框
        this._segments.push(new LightLine2D(x, y + h, x, y, false)); //左边框
        const occluders = this._occludersInLayer[layer];
        if (shadow) {
            for (let i = occluders.length - 1; i > -1; i--) {
                if (occluders[i].selectByLight(lightX, lightY))
                    occluders[i].getSegment(this._segments);
            }
        }
        return this._segments;
    }

    /**
     * @en Prepare render target
     * @zh 准备渲染目标
     * @param layer 
     */
    private _prepareRenderTarget(layer: number) {
        this._updateScreen();
        if (this._isHaveLight(layer)) {
            let param = this.param[layer];
            const x = this._screenSchmitt.x;
            const y = this._screenSchmitt.y;
            const z = this._screenSchmitt.width;
            const w = this._screenSchmitt.height;
            let target = this.target[layer];
            if (!target) {
                target = this.target[layer] = new RenderTexture2D(z, w, RenderTargetFormat.R8G8B8A8);
                target.wrapModeU = WrapMode.Clamp;
                target.wrapModeV = WrapMode.Clamp;
                param = this.param[layer] = new Vector4(x, y, z, w);

                this.sceneTarget = new RenderTexture2D(this._screen.width, this._screen.height, RenderTargetFormat.R8G8B8A8);
            } else if (param.z != z || param.w != w) {
                this._needToRecover.push(target);
                target = this.target[layer] = new RenderTexture2D(z, w, RenderTargetFormat.R8G8B8A8);
                target.wrapModeU = WrapMode.Clamp;
                target.wrapModeV = WrapMode.Clamp;
                param.setValue(x, y, z, w);
            } else {
                param.x = x;
                param.y = y;
            }
            //遍历当前层中的所有灯
            const lights = this._lightsInLayer[layer];
            for (let i = 0, len = lights.length; i < len; i++) {
                const light = lights[i];
                const pcf = light.getLightType() === Light2DType.Direction ? 1 : light.shadowFilterType;
                if (!this._sprites[i]) {
                    this._sprites[i] = [];
                    this._render[i] = [];
                }
                for (let j = 0; j < ShadowFilterType.PCF13; j++) {
                    if (j < pcf) {
                        if (!this._sprites[i][j]) {
                            this._sprites[i][j] = this._root.addChild(new Sprite());
                            this._render[i][j] = this._sprites[i][j].addComponent(Mesh2DRender);
                            this._render[i][j].lightReceive = false;
                        } else this._root.addChild(this._sprites[i][j]);
                    } else if (this._sprites[i][j])
                        this._root.removeChild(this._sprites[i][j]);
                }
                if (!this._material[i]) {
                    this._material[i] = new Material();
                    this._initMaterial(this._material[i], false);
                }
                for (let j = this._render[i].length - 1; j > -1; j--) {
                    this._render[i][j].texture = light._texLight;
                    this._render[i][j].sharedMaterial = this._material[i];
                }
                this._material[i].setColor('u_LightColor', light.color);
                this._material[i].setFloat('u_LightIntensity', light.intensity);
                this._material[i].setFloat('u_PCFIntensity', light._pcfIntensity());
            }
            for (let i = lights.length; i < this._sprites.length; i++)
                for (let j = this._sprites[i].length - 1; j > -1; j--)
                    this._root.removeChild(this._sprites[i][j]);
            //遍历当前层中的所有灯（提取阴影）
            for (let i = 0, len = lights.length; i < len; i++) {
                const light = lights[i];
                if (light.shadowEnable && light.shadowStrength < 1) {
                    if (!this._spritesShadow[i]) {
                        this._spritesShadow[i] = this._root.addChild(new Sprite());
                        this._renderShadow[i] = this._spritesShadow[i].addComponent(Mesh2DRender);
                        this._renderShadow[i].lightReceive = false;
                    } else this._root.addChild(this._spritesShadow[i]);
                    if (!this._materialShadow[i]) {
                        this._materialShadow[i] = new Material();
                        this._initMaterial(this._materialShadow[i], true);
                    }
                    this._renderShadow[i].texture = light._texLight;
                    this._renderShadow[i].sharedMaterial = this._materialShadow[i];
                    if (light.shadowColor)
                        this._materialShadow[i].setColor('u_LightColor', light.shadowColor);
                    else this._materialShadow[i].setColor('u_LightColor', light.color);
                    this._materialShadow[i].setFloat('u_LightIntensity', light.intensity);
                    this._materialShadow[i].setFloat('u_PCFIntensity', light._pcfIntensity());
                    this._materialShadow[i].setFloat('u_Shadow2DStrength', light.shadowStrength);
                } else if (this._spritesShadow[i])
                    this._root.removeChild(this._spritesShadow[i]);
            }
            for (let i = lights.length; i < this._spritesShadow.length; i++)
                this._root.removeChild(this._spritesShadow[i]);
            //this.showRenderTarget(layer);
            //this.showSceneTarget(layer);
            return true;
        }
        return false;
    }

    /**
     * @en Render light and shader texture
     * @zh 渲染光影图
     * @param context 
     */
    preRenderUpdate(context: Context) {
        //收集影响指定灯光的遮光器
        const _collectOccludersInLight = (layer: number, light: BaseLight2D) => {
            const occluders = this._occludersInLayer[layer];
            const result = this._occludersInLight;
            result.length = 0;
            const range = light.getLightRange(this._screenSchmitt);
            for (let i = occluders.length - 1; i > -1; i--)
                if (range.intersects(occluders[i]._range))
                    result.push(occluders[i]);
        };

        //计算灯光围栏状态
        const _calcRangeState = (layer: number) => {
            const range = this._lightRangeSchmitt[layer];
            let state = '[<';
            state += range.x + ',';
            state += range.y + ',';
            state += range.width + ',';
            state += range.height + '>]';
            return state;
        };

        //计算灯光状态
        const _calcLightState = (light: BaseLight2D) => {
            let state = '[<';
            state += light._lightId + '><';
            state += light.updateMark + '><';
            state += (light.getGlobalPosX() | 0) + ',' + (light.getGlobalPosY() | 0) + '>';
            if (light.getLightType() === Light2DType.Direction)
                state += '<' + ((light as DirectionLight2D).directionAngle * 10 | 0) + '>';
            state += ']';
            return state;
        };

        //计算遮光器状态
        const _calcOccluderState = () => {
            const occluders = this._occludersInLight;
            let state = '[';
            for (let i = occluders.length - 1; i > -1; i--) {
                const occluder = occluders[i];
                state += '<' + occluder._occluderId + '>' + occluder.getSegmentState();
            }
            state += ']';
            return state;
        };

        //回收资源（每10帧回收一次）
        if (Laya.timer.currFrame > this._recoverFC) {
            if (this._needToRecover.length > 0) {
                for (let i = this._needToRecover.length - 1; i > -1; i--)
                    this._needToRecover[i].destroy();
                this._needToRecover.length = 0;
            }
            this._recoverFC = Laya.timer.currFrame + 10;
        }

        //遍历所有的层
        let works = 0;
        for (let i = 0; i < Light2DManager.MAX_LAYER; i++) {
            if (this._prepareRenderTarget(i)) { //该层是否具有光影
                let needRender = false;
                const occluders = this._occludersInLayer[i]; //遮光器坐标转换
                for (let j = occluders.length - 1; j > -1; j--) {
                    //occluders[j].transformPoly();
                    occluders[j].getRange();
                }
                let update1 = false;
                let update2 = false;
                let update3 = false;
                if (this._screenSchmittChange) { //屏幕位置和尺寸是否改变
                    this._screenSchmittChange = false;
                    update1 = true;
                }
                if (!update1) {
                    const rangeState = _calcRangeState(i);
                    if (this._rangeState[i] !== rangeState) { //检查灯光围栏是否改变
                        this._rangeState[i] = rangeState;
                        update1 = true;
                    }
                }
                const lights = this._lightsInLayer[i];
                for (let j = 0, len = lights.length; j < len; j++) { //遍历灯光
                    const light = lights[j];
                    const renders = this._render[j];
                    const renderShadow = this._renderShadow[j];
                    light.renderLightTexture(this._scene); //更新灯光贴图
                    if (!update1) {
                        _collectOccludersInLight(i, light); //收集影响当前灯光的遮光器
                        const occluderState = _calcOccluderState();
                        if (!this._occludersState[i])
                            this._occludersState[i] = [];
                        if (this._occludersState[i][j] !== occluderState) { //检查遮光器是否改变
                            this._occludersState[i][j] = occluderState;
                            update2 = true;
                        }
                        if (!update2) {
                            const lightState = _calcLightState(light);
                            if (!this._lightsState[i])
                                this._lightsState[i] = [];
                            if (this._lightsState[i][j] !== lightState) { //检查灯光是否改变
                                this._lightsState[i][j] = lightState;
                                update3 = true;
                            }
                        }
                    }
                    if (update1 || update2 || update3) { //状态有改变，更新光照网格和阴影网格
                        for (let k = renders.length - 1; k > -1; k--) { //遍历PCF
                            const render = renders[k];
                            if (render) {
                                render.texture = light._texLight;
                                this._update(i, this._screenSchmitt.x, this._screenSchmitt.y, light, render, k);
                                needRender = true;
                                works++;
                            }
                        }
                        if (renderShadow) { //处理阴影
                            renderShadow.texture = light._texLight;
                            this._updateShadow(i, this._screenSchmitt.x, this._screenSchmitt.y, light, renderShadow);
                            needRender = true;
                            works++;
                        }
                        this._updateMark[i]++;
                    }
                    update3 = false;
                }
                if (needRender) { //更新光影图
                    this._scene.addChild(this._root);
                    this._root.drawToTexture(0, 0, 0, 0, this.target[i]);
                    this._scene.removeChild(this._root);
                    //this._scene.drawToTexture(0, 0, 0, 0, this.sceneTarget);
                }
            }
        }

        //显示工作负载
        //if (this._works !== works) {
        //    this._works = works;
        //    console.log('works =', works);
        //}
    }

    /**
     * @internal
     * @param layer 
     */
    _getLayerUpdateMask(layer: number) {
        //return -1; //TODO 需要判断更新这个灯光的纹理是否改变
        //return Laya.timer.currFrame; //临时测试
        return this._updateMark[layer];
    }

    /**
     * @internal
     * @param layer 
     * @param shaderData 
     */
    _updateShaderDataByLayer(layer: number, shaderData: ShaderData) {
        shaderData.setColor(Shader3D.propertyNameToID('u_LightAndShadow2DAmbient'), this.ambient);
        if (this.target[layer]) {
            shaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHTANDSHADOW);
            shaderData.setTexture(Shader3D.propertyNameToID('u_LightAndShadow2D'), this.target[layer]);
        } else {
            shaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHTANDSHADOW);
            shaderData.setTexture(Shader3D.propertyNameToID('u_LightAndShadow2D'), null);
        }
        if (this.param[layer])
            shaderData.setVector(Shader3D.propertyNameToID('u_LightAndShadow2DParam'), this.param[layer]);
    }

    /**
     * @en Update screen size and offset parameters
     * @zh 更新屏幕尺寸和偏移参数
     */
    private _updateScreen() {
        const camera = this._scene._specialManager._mainCamera;
        if (camera) {
            //@ts-ignore
            this._screen.x = (camera._cameraPos.x - RenderState2D.width / 2) | 0;
            ///@ts-ignore
            this._screen.y = (camera._cameraPos.y - RenderState2D.height / 2) | 0;
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
        }
    }

    /**
     * @en Update light and shadow info
     * @zh 更新光影信息
     * @param layer 
     * @param layerOffetX 
     * @param layerOffetY 
     * @param light 
     * @param render 
     * @param pcf 
     */
    private _update(layer: number, layerOffsetX: number, layerOffsetY: number, light: BaseLight2D, render: Mesh2DRender, pcf: number) {
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

        const lightX = _calcLightX(light, pcf);
        const lightY = _calcLightY(light, pcf);
        const lightOffsetX = light._getRange().x;
        const lightOffsetY = light._getRange().y;
        const ss = this._getOccluderSegment(layer, lightX, lightY, light.shadowEnable);
        const poly = this._getLightPolygon(lightX, lightY, ss);
        const len = poly.length;
        if (len > 2) {
            let index = 0;
            this._points.length = len * 2;
            for (let i = 0; i < len; i++) {
                this._points[index++] = poly[i].x;
                this._points[index++] = poly[i].y;
            }
            if (render.shareMesh)
                this._needToRecover.push(render.shareMesh);
            render.shareMesh = this._genLightMesh(lightX, lightY, light.getWidth(), light.getHeight(), lightOffsetX, lightOffsetY, layerOffsetX, layerOffsetY, this._points);
        }
    }

    /**
     * @en Update light and shadow info (shadow)
     * @zh 更新光影信息（阴影）
     * @param layer 
     * @param layerOffsetX 
     * @param layerOffsetY 
     * @param light 
     * @param render 
     */
    private _updateShadow(layer: number, layerOffsetX: number, layerOffsetY: number, light: BaseLight2D, render: Mesh2DRender) {
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

        const lightX = _calcLightX(light);
        const lightY = _calcLightY(light);
        const lightOffsetX = light._getRange().x;
        const lightOffsetY = light._getRange().y;
        const ss = this._getOccluderSegment(layer, lightX, lightY, light.shadowEnable);
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
            if (render.shareMesh)
                this._needToRecover.push(render.shareMesh);
            render.shareMesh = this._genShadowMesh(lightX, lightY, light.getWidth(), light.getHeight(), lightOffsetX, lightOffsetY, layerOffsetX, layerOffsetY, this._points, radius);
        }
    }

    /**
     * @en Generate light mesh
     * @zh 生成灯光网格
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
     * @en Generate a shadow polygon, which is the part of a circle minus the inner polygon.
     *     The circle should be able to completely surround the polygon
     * @zh 生成阴影多边形，阴影多边形是圆减去内部多边形的部分，圆要能完全包围住多边形
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
     * 生成矩形网格（测试用）
     */
    private _genMeshRect(x: number, y: number, width: number, height: number) {
        const vertices = new Float32Array(4 * 5);
        const indices = new Uint16Array(2 * 3);

        let index = 0;
        vertices[index++] = x;
        vertices[index++] = y;
        vertices[index++] = 0;
        vertices[index++] = 0;
        vertices[index++] = 0;

        vertices[index++] = x + width;
        vertices[index++] = y;
        vertices[index++] = 0;
        vertices[index++] = 1;
        vertices[index++] = 0;

        vertices[index++] = x + width;
        vertices[index++] = y + height;
        vertices[index++] = 0;
        vertices[index++] = 1;
        vertices[index++] = 1;

        vertices[index++] = x;
        vertices[index++] = y + height;
        vertices[index++] = 0;
        vertices[index++] = 0;
        vertices[index++] = 1;

        index = 0;
        indices[index++] = 0;
        indices[index++] = 1;
        indices[index++] = 3;

        indices[index++] = 1;
        indices[index++] = 2;
        indices[index++] = 3;

        const declaration = VertexMesh2D.getVertexDeclaration(['POSITION,UV'], false)[0];
        return Mesh2D.createMesh2DByPrimitive([vertices], [declaration], indices, IndexFormat.UInt16, [{ length: indices.length, start: 0 }]);
    }

    /**
     * @en Initial material
     * @zh 初始化材质
     * @param material 
     * @param shadow 
     */
    private _initMaterial(material: Material, shadow: boolean) {
        if (shadow) {
            material.setShaderName('ShadowGen2D');
            material.setFloat('u_Shadow2DStrength', 0.5);
        }
        else material.setShaderName('LightAndShadowGen2D');
        material.setColor('u_LightColor', new Color(1, 1, 1, 1));
        material.setFloat('u_LightIntensity', 1);
        material.setFloat('u_PCFIntensity', 1);
        material.setBoolByIndex(Shader3D.DEPTH_WRITE, false);
        material.setIntByIndex(Shader3D.DEPTH_TEST, RenderState.DEPTHTEST_OFF);
        material.setIntByIndex(Shader3D.BLEND, RenderState.BLEND_ENABLE_ALL);
        material.setIntByIndex(Shader3D.BLEND_EQUATION, RenderState.BLENDEQUATION_ADD);
        material.setIntByIndex(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ONE);
        material.setIntByIndex(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE);
        material.setIntByIndex(Shader3D.CULL, RenderState.CULL_NONE);
    }

    /**
     * @en Calculate the intersection point of rays and line segments
     * @zh 计算射线和线段的交点
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
        result.z = T1;
        result.w = 0; //angle
        return true;
    }

    /**
     * @en Obtain the sequence of vertices of the illuminated polygon (arranged clockwise) 
     *     based on the position of the light and the shading line segment
     * @zh 根据灯光位置，遮光器线段，获取光照多边形顶点序列（按顺时针排列）
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

        const ray = new LightLine2D(0, 0, 0, 0);
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
            let closestIntersect: Vector4 = null;
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

        //Sort intersects by angle
        intersects = intersects.sort((a, b) => { return a.w - b.w; });

        //Polygon is intersects, in order of angle
        return intersects;
    }
}