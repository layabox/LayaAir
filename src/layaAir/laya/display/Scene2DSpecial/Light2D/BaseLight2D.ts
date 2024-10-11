import { Laya } from "../../../../Laya";
import { Component } from "../../../components/Component";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Rectangle } from "../../../maths/Rectangle";
import { Vector3 } from "../../../maths/Vector3";
import { ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Mesh2D, VertexMesh2D } from "../../../resource/Mesh2D";
import { Scene } from "../../Scene";
import { Sprite } from "../../Sprite";
import { ShowRenderTarget } from "./ShowRenderTarget";

export enum ShadowFilterType {
    None = 1,
    PCF5 = 5,
    PCF9 = 9,
    PCF13 = 13,
}

export enum Light2DType {
    Base,
    Spot,
    Sprite,
    Freeform,
    Direction,
}

/**
 * 2D灯光基类
 */
export class BaseLight2D extends Component {
    /**
    * 灯光和阴影图
    */
    static LIGHTANDSHADOW: number;
    /**
     * 灯光和阴影图尺寸和偏移
     */
    static LIGHTANDSHADOW_PARAM: number;
    /**
     * 灯光和阴影图环境光
     */
    static LIGHTANDSHADOW_AMBIENT: number;
    /**
     * 2D阴影图
     */
    static LIGHTANDSHADOW_SHADOW: number;

    static idCounter: number = 0; //用于区别不同灯光对象的id计数器

    static initLightRender2DRenderProperty() {
        BaseLight2D.LIGHTANDSHADOW = Shader3D.propertyNameToID("u_LightAndShadow2D");
        BaseLight2D.LIGHTANDSHADOW_PARAM = Shader3D.propertyNameToID("u_LightAndShadow2DParam");
        BaseLight2D.LIGHTANDSHADOW_AMBIENT = Shader3D.propertyNameToID("u_LightAndShadow2DAmbient");

        const sceneUniform = LayaGL.renderDeviceFactory.createGlobalUniformMap("BaseRender2D");
        sceneUniform.addShaderUniform(BaseLight2D.LIGHTANDSHADOW, "u_LightAndShadow2D", ShaderDataType.Texture2D);
        sceneUniform.addShaderUniform(BaseLight2D.LIGHTANDSHADOW_PARAM, "u_LightAndShadow2DParam", ShaderDataType.Vector4);
        sceneUniform.addShaderUniform(BaseLight2D.LIGHTANDSHADOW_AMBIENT, "u_LightAndShadow2DAmbient", ShaderDataType.Color);
    }

    protected _type: Light2DType = Light2DType.Base;

    protected _color: Color;

    protected _intensity: number; //灯光强度

    protected _layerMask: number = 1; //灯光层掩码（哪些层有灯光）

    protected _shadowEnable: boolean = false; //是否开启阴影

    protected _shadowStrength: number = 0.5; //阴影强度

    protected _shadowFilterSmooth: number = 1; //阴影边缘平滑系数

    protected _shadowLayerMask: number = 1; //阴影层掩码（哪些层有阴影）

    protected _shadowFilterType: ShadowFilterType = ShadowFilterType.None; //阴影边缘平滑类型

    protected _range: Rectangle = new Rectangle(); //灯光范围

    protected _recoverFC: number = 0; //回收资源帧序号
    protected _needToRecover: any[] = []; //需要回收的资源
    protected _lastRotation: number = -1; //上一帧旋转角度

    /**
     * @internal
     */
    _lightId: number;
    /**
     * @internal
     */
    _needUpdateLight: boolean = true; //是否需要更新灯光贴图
    /**
     * @internal
     */
    _needUpdateLightTrans: boolean = false; //是否需要更新灯光的Trans位置

    //TODO 注释
    get color(): Color {
        return this._color;
    }
    set color(value: Color) {
        if (value.r !== this._color.r
            || value.g !== this._color.g
            || value.b !== this._color.b
            || value.a !== this._color.a)
            this._needUpdateLight = true;
        value.cloneTo(this._color);
    }

    //TODO 注释
    get intensity(): number {
        return this._intensity;
    }
    set intensity(value: number) {
        if (value !== this._intensity)
            this._needUpdateLight = true;
        this._intensity = value;
    }

    //TODO 注释
    get shadowEnable(): boolean {
        return this._shadowEnable;
    }
    set shadowEnable(value: boolean) {
        if (this._shadowEnable !== value)
            this._needUpdateLight = true;
        this._shadowEnable = value;
    }

    //TODO 注释
    get shadowStrength(): number {
        return this._shadowStrength;
    }
    set shadowStrength(value: number) {
        if (value !== this._shadowStrength)
            this._needUpdateLight = true;
        this._needUpdateLight = true;
    }

    //TODO 注释
    get shadowLayerMask(): number {
        return this._shadowLayerMask;
    }
    set shadowLayerMask(value: number) {
        if (value !== this._shadowLayerMask)
            this._notifyShadowCastLayerChange(this.shadowLayerMask, value);
        this._shadowLayerMask = value;
    }

    get shadowFilterType(): ShadowFilterType {
        return this._shadowFilterType;
    }
    set shadowFilterType(value: ShadowFilterType) {
        if (value !== this._shadowFilterType)
            this._needUpdateLight = true;
        this._shadowFilterType = value;
    }

    get layerMask(): number {
        return this._layerMask;
    }
    set layerMask(value: number) {
        if (this.layerMask !== value) {
            this._notifyLightLayerChange(this.layerMask, value);
        }
        this._layerMask = value;
    }

    get shadowFilterSmooth(): number {
        return this._shadowFilterSmooth;
    }
    set shadowFilterSmooth(value: number) {
        if (value !== this._shadowFilterSmooth)
            this._needUpdateLight = true;
        this._shadowFilterSmooth = value;
    }

    /**
     * @internal
     */
    _texLight: BaseTexture; //灯光贴图（实时渲染）TODO

    updateMark: number = 0; //灯光更新标志
    editMode: boolean = false; //编辑模式

    //TODO
    enableShadowColor: boolean;
    shadowColor: Color; //阴影颜色

    //测试用
    showLightTexture: boolean = false;
    showRenderTarget: ShowRenderTarget;

    /**
     * @ignore
     */
    constructor() {
        super();
        this._lightId = BaseLight2D.idCounter++;
        this._color = new Color(1, 1, 1, 1);
        this._intensity = 1;
    }

    private _notifyLightLayerChange(oldLayer: number, newLayer: number) {
        //更新此灯光的层的改变
    }

    private _notifyShadowCastLayerChange(oldLayer: number, newLayer: number) {
        //更新此灯阴影接受层的改变
    }

    protected _onEnable(): void {
        super._onEnable();
        if (this.owner) {
            (this.owner as Sprite).on("2DtransChanged", this, this._transformChange);
            (this.owner as Sprite).transChangeNotify = true;
            const lightRP = (this.owner.scene as Scene)?._light2DManager;
            if (lightRP)
                lightRP.addLight(this);
        }
    }

    protected _onDisable(): void {
        super._onDisable();
        if (this.owner) {
            (this.owner as Sprite).off("2DtransChanged", this, this._transformChange);
            const lightRP = (this.owner?.scene as Scene)?._light2DManager;
            if (lightRP)
                lightRP.removeLight(this);
        }
    }

    protected _onDestroy() {
        //TODO
    }

    protected _transformChange() {
        this._needUpdateLight = true;
        this._needUpdateLightTrans = true;
    }

    /**
     * @internal
     * @returns 
     */
    _pcfIntensity() {
        switch (this.shadowFilterType) {
            default:
            case ShadowFilterType.None:
                return 1;
            case ShadowFilterType.PCF5:
                return 1 / 5;
            case ShadowFilterType.PCF9:
                return 1 / 9;
            case ShadowFilterType.PCF13:
                return 1 / 13;
        }
    }

    /**
     * @internal
     * @returns 
     */
    _getRange() {
        return this._range;
    }

    getLightType(): Light2DType {
        return this._type;
    }

    getHeight() {
        return this._range.height;
    }

    getWidth() {
        return this._range.width;
    }

    getGlobalPosX() {
        if (this.owner && this.owner instanceof Sprite)
            return this.owner.globalPosX;
        return 0;
    }

    getGlobalPosY() {
        if (this.owner && this.owner instanceof Sprite)
            return this.owner.globalPosY;
        return 0;
    }

    /**
     * 用列表设置灯光层掩码
     * @param layerList 
     */
    setLayerMaskByList(layerList: number[]) {
        let layer = 0;
        for (let i = layerList.length - 1; i > -1; i--)
            layer |= 1 << layerList[i];
        this.layerMask = layer;
    }

    /**
     * 灯光对指定层是否开启
     * @param layer 
     */
    isLayerEnable(layer: number) {
        const mask = 1 << layer;
        return (this.layerMask & mask);
    }

    /**
     * 用列表设置阴影层掩码
     * @param layerList 
     */
    setShadowLayerMaskByList(layerList: number[]) {
        let shadowLayer = 0;
        for (let i = layerList.length - 1; i > -1; i--)
            shadowLayer |= 1 << layerList[i];
        this.shadowLayerMask = shadowLayer;
    }

    /**
     * 阴影对指定层是否开启
     * @param layer 
     */
    isShadowLayerEnable(layer: number) {
        const mask = 1 << layer;
        return (this.shadowLayerMask & mask);
    }

    /**
     * 获取灯光范围
     * @param screen 
     */
    getLightRange(screen?: Rectangle) {
        return this._range;
    }

    /**
     * 渲染灯光贴图
     * @param scene 
     */
    renderLightTexture(scene: Scene) {
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
     * 是否在屏幕内
     * @param screen 
     */
    isInScreen(screen: Rectangle) {
        return this.getLightRange().intersects(screen);
    }

    /**
     * 生成网格对象
     * @param points 
     * @param inds 
     */
    protected _makeMesh(points: Vector3[], inds: number[]) {
        const vertices = new Float32Array(points.length * 5);
        const indices = new Uint16Array(inds);
        let index = 0, p: Vector3;
        for (let i = 0, len = points.length; i < len; i++) {
            p = points[i];
            vertices[index++] = p.x;
            vertices[index++] = p.y;
            vertices[index++] = 0;
            vertices[index++] = p.z;
            vertices[index++] = 0;
        }

        const declaration = VertexMesh2D.getVertexDeclaration(['POSITION,UV'], false)[0];
        return Mesh2D.createMesh2DByPrimitive([vertices], [declaration], indices, IndexFormat.UInt16, [{ length: indices.length, start: 0 }]);
    }
}