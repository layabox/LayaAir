import { Laya } from "../../../../Laya";
import { Component } from "../../../components/Component";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Rectangle } from "../../../maths/Rectangle";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Mesh2D, VertexMesh2D } from "../../../resource/Mesh2D";
import { RenderTexture } from "../../../resource/RenderTexture";
import { Utils } from "../../../utils/Utils";
import { Scene } from "../../Scene";
import { Sprite } from "../../Sprite";
import { Light2DManager } from "./Light2DManager";

/**
 * 灯光类型
 */
export enum Light2DType {
    Base,
    Spot,
    Sprite,
    Freeform,
    Direction,
}

/**
 * 阴影边缘类型
 */
export enum ShadowFilterType {
    None,
    PCF5,
    PCF9,
    PCF13,
}

/**
 * 2D灯光基类
 */
export class BaseLight2D extends Component {
    /**
     * 光影图
     */
    static LIGHTANDSHADOW: number;
    /**
     * 灯光高度值
     */
    static LIGHTANDSHADOW_LIGHT_HEIGHT: number;
    /**
     * 光影图尺寸和偏移
     */
    static LIGHTANDSHADOW_PARAM: number;
    /**
     * 环境光
     */
    static LIGHTANDSHADOW_AMBIENT: number;

    static idCounter: number = 0; //灯光对象计数器

    declare owner: Sprite;

    /**
     * @internal
     */
    static _initLightRender2DRenderProperty() {
        BaseLight2D.LIGHTANDSHADOW = Shader3D.propertyNameToID("u_LightAndShadow2D");
        BaseLight2D.LIGHTANDSHADOW_LIGHT_HEIGHT = Shader3D.propertyNameToID("u_LightHeight");
        BaseLight2D.LIGHTANDSHADOW_PARAM = Shader3D.propertyNameToID("u_LightAndShadow2DParam");
        BaseLight2D.LIGHTANDSHADOW_AMBIENT = Shader3D.propertyNameToID("u_LightAndShadow2DAmbient");

        const sceneUniform = LayaGL.renderDeviceFactory.createGlobalUniformMap("BaseRender2D");
        sceneUniform.addShaderUniform(BaseLight2D.LIGHTANDSHADOW, "u_LightAndShadow2D", ShaderDataType.Texture2D);
        sceneUniform.addShaderUniform(BaseLight2D.LIGHTANDSHADOW_LIGHT_HEIGHT, "u_LightHeight", ShaderDataType.Float);
        sceneUniform.addShaderUniform(BaseLight2D.LIGHTANDSHADOW_PARAM, "u_LightAndShadow2DParam", ShaderDataType.Vector4);
        sceneUniform.addShaderUniform(BaseLight2D.LIGHTANDSHADOW_AMBIENT, "u_LightAndShadow2DAmbient", ShaderDataType.Color);
    }

    protected _type: Light2DType = Light2DType.Base; //灯光类型
    private _color: Color = new Color(1, 1, 1, 1); //灯光颜色
    private _intensity: number = 1; //灯光强度
    private _lightRotation: number = 0; //灯光旋转
    private _lightScale: Vector2 = new Vector2(1, 1); //灯光放缩

    private _layerMask: number = 1; //灯光层掩码（哪些层有灯光）
    private _layers: number[] = [0]; //灯光层数组（哪些层有灯光）

    private _shadowEnable: boolean = false; //是否开启阴影
    private _shadowColor: Color = new Color(0, 0, 0, 1); //阴影颜色
    private _shadowStrength: number = 0.5; //阴影强度
    private _shadowFilterSmooth: number = 1; //阴影边缘平滑系数
    private _shadowLayerMask: number = 1; //阴影层掩码（哪些层有阴影）
    private _shadowFilterType: ShadowFilterType = ShadowFilterType.None; //阴影边缘平滑类型

    protected _localRange: Rectangle = new Rectangle(); //灯光范围（局部坐标）
    protected _worldRange: Rectangle = new Rectangle(); //灯光范围（世界坐标）
    protected _lightRange: Rectangle = new Rectangle(); //灯光范围（光影图）

    private _recoverFC: number = 0; //回收资源帧序号
    protected _needToRecover: any[] = []; //需要回收的资源

    private _isInScreen: boolean = false; //是否在屏幕（缓存）
    protected _screenCache: Rectangle = new Rectangle(); //屏幕参数缓存

    private _texSize: Vector2 = new Vector2(1, 1); //灯光贴图尺寸

    /**
     * @internal
     * 灯光贴图（实时渲染)
     */
    _texLight: BaseTexture;

    /**
     * @en Is show light texture
     * @zh 是否显示灯光贴图
     */
    showLightTexture: boolean = false;

    /**
     * @internal
     */
    _lightId: number; //灯光对象Id，在所有灯光对象里保持唯一
    /**
     * @internal
     */
    _needUpdateLight: boolean = false; //是否需要更新灯光贴图（重新渲染）
    /**
     * @internal
     */
    _needUpdateLightAndShadow: boolean = false; //是否需要更新光影图
    /**
     * @internal
     */
    _needUpdateLightLocalRange: boolean = false; //是否需要更新灯光区域（局部坐标）
    /**
     * @internal
     */
    _needUpdateLightWorldRange: boolean = false; //是否需要更新灯光区域（世界坐标）

    /**
     * @en Get light color
     * @zh 获取灯光颜色
     */
    get color(): Color {
        return this._color;
    }

    /**
     * @en Set light color
     * @zh 设置灯光颜色
     */
    set color(value: Color) {
        if (value === this._color || !value.equal(this._color)) {
            value.cloneTo(this._color);
            this._needUpdateLightAndShadow = true;
        }
    }

    /**
     * @en Get light intensity
     * @zh 获取灯光强度
     */
    get intensity(): number {
        return this._intensity;
    }

    /**
     * @en Set light intensity
     * @zh 设置灯光强度
     */
    set intensity(value: number) {
        if (value !== this._intensity) {
            this._intensity = value;
            this._needUpdateLightAndShadow = true;
        }
    }

    /**
     * @en Get light rotation angle
     * @zh 获取灯光旋转角度
     */
    get lightRotation(): number {
        return this._lightRotation;
    }

    /**
     * @en Set light rotation angle
     * @param value Light rotation value
     * @zh 设置灯光旋转角度
     * @param value 灯光旋转值
     */
    set lightRotation(value: number) {
        if (value !== this._lightRotation) {
            this._lightRotation = value;
            this._needUpdateLightAndShadow = true;
        }
    }

    /**
     * @en Get light scale
     * @zh 获取灯光放缩
     */
    get lightScale() {
        return this._lightScale;
    }

    /**
     * @en Set light scale
     * @param value Light scale value
     * @zh 设置灯光放缩
     * @param value 灯光放缩值
     */
    set lightScale(value: Vector2) {
        if (value === this._lightScale || !Vector2.equals(value, this._lightScale)) {
            value.cloneTo(this._lightScale);
            this._needUpdateLightAndShadow = true;
        }
    }

    /**
     * @en Is shadow enable
     * @zh 获取阴影是否使能
     */
    get shadowEnable(): boolean {
        return this._shadowEnable;
    }

    /**
     * @en Enable shadow
     * @param value Enable value
     * @zh 使能灯光阴影
     * @param value 使能值
     */
    set shadowEnable(value: boolean) {
        if (value !== this._shadowEnable) {
            this._shadowEnable = value;
            this._needUpdateLightAndShadow = true;
            this._notifyShadowEnableChange();
        }
    }

    /**
     * @en Get shadow color
     * @zh 获取阴影颜色
     */
    get shadowColor(): Color {
        return this._shadowColor;
    }

    /**
     * @en Set shadow color
     * @param value Shadow color value
     * @zh 设置阴影颜色
     * @param value 阴影颜色值
     */
    set shadowColor(value: Color) {
        if (value === this._shadowColor || !value.equal(this._shadowColor)) {
            value.cloneTo(this._shadowColor);
            this._needUpdateLightAndShadow = true;
        }
    }

    /**
     * @en Get shadow strength
     * @zh 获取阴影强度
     */
    get shadowStrength(): number {
        return this._shadowStrength;
    }

    /**
     * @en Set shadow strength
     * @param value Shadow strength value
     * @zh 设置阴影强度
     * @param value 阴影强度值
     */
    set shadowStrength(value: number) {
        if (value !== this._shadowStrength) {
            this._shadowStrength = value;
            this._needUpdateLightAndShadow = true;
        }
    }

    /**
     * @en Get shadow filter type
     * @zh 获取阴影平滑类型
     */
    get shadowFilterType(): ShadowFilterType {
        return this._shadowFilterType;
    }

    /**
     * @en Set shadow filter type
     * @param value Shadow filter type value
     * @zh 设置阴影平滑类型
     * @param value 阴影平滑类型值
     */
    set shadowFilterType(value: ShadowFilterType) {
        if (value !== this._shadowFilterType) {
            this._shadowFilterType = value;
            this._needUpdateLightAndShadow = true;
            this._notifyShadowPCFChange();
        }
    }

    /**
     * @en Get shadow filter smooth
     * @zh 获取阴影边缘平滑系数
     */
    get shadowFilterSmooth(): number {
        return this._shadowFilterSmooth;
    }

    /**
     * @en Set shadow filter smooth
     * @param value Filter smooth value
     * @zh 设置阴影边缘平滑系数
     * @param value 阴影平滑系数值
     */
    set shadowFilterSmooth(value: number) {
        if (value !== this._shadowFilterSmooth) {
            this._shadowFilterSmooth = value;
            this._needUpdateLightAndShadow = true;
            this._needUpdateLightWorldRange = true;
        }
    }

    /**
     * @en Get layer mask
     * @zh 获取灯光层遮罩（灯光影响哪些层）
     */
    get layerMask(): number {
        return this._layerMask;
    }

    /**
     * @en Set layer mask
     * @param value Layer mask value
     * @zh 设置灯光层遮罩（灯光影响哪些层）
     * @param value 层遮罩值
     */
    set layerMask(value: number) {
        if (this._layerMask !== value) {
            this._needUpdateLightAndShadow = true;
            this._notifyLightLayerChange(this._layerMask, value);
            this._layerMask = value;

            this._layers.length = 0;
            for (let i = 0; i < Light2DManager.MAX_LAYER; i++)
                if (value & (1 << i))
                    this._layers.push(i);
        }
    }

    /**
     * @en Get light layers
     * @zh 获取灯光层数组（灯光影响哪些层）
     */
    get layers() {
        return this._layers;
    }

    /**
     * @en Get shadow layer mask
     * @zh 获取阴影层遮罩（阴影影响哪些层）
     */
    get shadowLayerMask(): number {
        return this._shadowLayerMask;
    }

    /**
     * @en Set shadow layer mask
     * @param value shadow layer mask value
     * @zh 设置阴影层遮罩（阴影影响哪些层）
     * @param value 阴影遮罩值
     */
    set shadowLayerMask(value: number) {
        if (value !== this._shadowLayerMask) {
            this._needUpdateLightAndShadow = true;
            this._notifyShadowCastLayerChange(this._shadowLayerMask, value);
            this._shadowLayerMask = value;
        }
    }

    /**
     * @ignore
     */
    constructor() {
        super();
        this._lightId = BaseLight2D.idCounter++;
    }

    /**
     * @internal
     * 通知此灯光层的改变
     */
    private _notifyLightLayerChange(oldLayer: number, newLayer: number) {
        const light2DManager = this.owner?.scene?._light2DManager as Light2DManager;
        if (light2DManager) {
            light2DManager.lightLayerMarkChange(this, oldLayer, newLayer);
            light2DManager.needCollectLightInLayer(newLayer);
        }
    }

    /**
     * @internal
     * 通知此灯阴影接受层的改变
     */
    private _notifyShadowCastLayerChange(oldLayer: number, newLayer: number) {
        (this.owner?.scene?._light2DManager as Light2DManager)?.lightShadowLayerMarkChange(this, oldLayer, newLayer);
    }

    /**
     * @internal
     * 通知此灯阴影PCF参数的改变
     */
    private _notifyShadowPCFChange() {
        const light2DManager = this.owner?.scene?._light2DManager as Light2DManager;
        if (light2DManager) {
            light2DManager.lightShadowPCFChange(this);
            light2DManager.needCollectLightInLayer(this.layerMask);
        }
    }

    /**
     * @internal
     * 通知此灯阴影使能改变
     */
    private _notifyShadowEnableChange() {
        (this.owner?.scene?._light2DManager as Light2DManager)?.lightShadowEnableChange(this);
    }

    /**
     * @internal
     */
    protected _onEnable(): void {
        super._onEnable();
        this.owner.on("2DtransChanged", this, this._transformChange);
        this.owner.transChangeNotify = true;
        (this.owner?.scene?._light2DManager as Light2DManager)?.addLight(this);
    }

    /**
     * @internal
     */
    protected _onDisable(): void {
        super._onDisable();
        this._clearScreenCache();
        this.owner.off("2DtransChanged", this, this._transformChange);
        (this.owner?.scene?._light2DManager as Light2DManager)?.removeLight(this);
    }

    /**
     * @internal
     */
    protected _onDestroy() {
    }

    /**
     * @internal
     * 响应矩阵改变
     */
    protected _transformChange() {
        this._clearScreenCache();
        this._needUpdateLightAndShadow = true;
        this._needUpdateLightWorldRange = true;
        (this.owner?.scene?._light2DManager as Light2DManager)?._lightTransformChange(this);
    }

    /**
     * @intenal
     * 清除屏幕尺寸缓存
     */
    protected _clearScreenCache() {
        this._screenCache.width = 0;
        this._screenCache.height = 0;
    }

    /**
     * @internal
     * 计算PCF系数
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
     * 获取灯光范围（局部坐标）
     */
    _getLocalRange() {
        if (this._needUpdateLightLocalRange)
            this._calcLocalRange();
        return this._localRange;
    }

    /**
     * @internal
     * 获取灯光范围（世界坐标）
     * @param screen 
     */
    _getWorldRange(screen?: Rectangle) {
        if (this._needUpdateLightLocalRange)
            this._calcLocalRange();
        if (this._needUpdateLightWorldRange)
            this._calcWorldRange(screen);
        return this._worldRange;
    }

    /**
     * @internal
     * 获取灯光范围（光影图）
     * @param screen 
     */
    _getLightRange(screen?: Rectangle) {
        if (this._needUpdateLightLocalRange)
            this._calcLocalRange();
        if (this._needUpdateLightWorldRange)
            this._calcWorldRange(screen);
        return this._lightRange;
    }

    /**
     * @internal
     * 获取贴图尺寸
     */
    _getTextureSize() {
        if (this._texLight) {
            this._texSize.x = this._texLight.width;
            this._texSize.y = this._texLight.height;
        }
        return this._texSize;
    }

    /**
     * @internal
     * 是否需要建立阴影网格
     */
    _isNeedShadowMesh() {
        return (!this._shadowColor.equal(Color.BLACK) || this._shadowStrength < 1) && this.shadowEnable;
    }

    /**
     * 矩形1是否包含矩形2
     * @param rect1
     * @param rect2 
     */
    private _rectContain(rect1: Rectangle, rect2: Rectangle) {
        return (
            rect2.x >= rect1.x &&
            rect2.y >= rect1.y &&
            (rect2.x + rect2.width) <= (rect1.x + rect1.width) &&
            (rect2.y + rect2.height) <= (rect1.y + rect1.height));
    }

    /**
     * @internal
     * 是否在指定范围内
     */
    _isInRange(range: Rectangle) {
        return range && this._rectContain(range, this._getWorldRange());
    }

    /**
     * @en Get light type
     * @zh 获取灯光类型
     */
    getLightType(): Light2DType {
        return this._type;
    }

    /**
     * @en Get light global position x
     * @zh 获取灯光世界位置的X坐标值
     */
    getGlobalPosX() {
        return this.owner.globalPosX;
    }

    /**
     * @en Get light global position y
     * @zh 获取灯光世界位置的Y坐标值
     */
    getGlobalPosY() {
        return this.owner.globalPosY;
    }

    /**
     * @en Set layer mask by list
     * @param layerList Layer list
     * @zh 用列表设置灯光层掩码
     * @param layerList 层列表
     */
    setLayerMaskByList(layerList: number[]) {
        let layer = 0;
        for (let i = layerList.length - 1; i > -1; i--)
            layer |= (1 << layerList[i]);
        this.layerMask = layer;
    }

    /**
     * @en Is the light turned on for the specified layer
     * @param layer Specified layer
     * @zh 灯光对指定层是否开启
     * @param layer 指定层
     */
    isLayerEnable(layer: number) {
        return (this.layerMask & (1 << layer));
    }

    /**
     * @en Set shadow layer mask by list
     * @param layerList Layer list
     * @zh 用列表设置阴影层掩码
     * @param layerList 层列表
     */
    setShadowLayerMaskByList(layerList: number[]) {
        let shadowLayer = 0;
        for (let i = layerList.length - 1; i > -1; i--)
            shadowLayer |= (1 << layerList[i]);
        this.shadowLayerMask = shadowLayer;
    }

    /**
     * @en Is the shadow turned on for the specified layer
     * @param layer Specified layer
     * @zh 阴影对指定层是否开启
     * @param layer 指定层
     */
    isShadowLayerEnable(layer: number) {
        return (this.shadowLayerMask & (1 << layer));
    }

    /**
     * @internal
     * 将渲染出的贴图以Base64的方式打印到终端上
     */
    _printTextureToConsoleAsBase64() {
        if (this._texLight)
            Utils.uint8ArrayToArrayBufferAsync(this._texLight as RenderTexture).then(str => console.log(str));
    }

    /**
     * @internal
     * 计算灯光范围（局部坐标）
     */
    protected _calcLocalRange() {
        this._needUpdateLightLocalRange = false;
    }

    /**
     * @internal
     * 获取灯光范围
     */
    protected _calcWorldRange(screen?: Rectangle) {
        this._needUpdateLightWorldRange = false;
        (this.owner?.scene?._light2DManager as Light2DManager)?.needCheckLightRange(this);
    }

    /**
     * @internal
     * 设置灯光放缩和旋转
     */
    protected _lightScaleAndRotation() {
        //获取放缩量
        const sx = Math.abs(this.owner.globalScaleX);
        const sy = Math.abs(this.owner.globalScaleY);

        //设置灯光放缩
        Vector2.TempVector2.x = 1 / sx;
        Vector2.TempVector2.y = 1 / sy;
        this.lightScale = Vector2.TempVector2;

        //设置灯光旋转
        this.lightRotation = this.owner.globalRotation * Math.PI / 180;
    }

    /**
     * @en Render light texture
     * @param scene Scene object
     * @zh 渲染灯光贴图
     * @param scene 场景对象
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
     * @en Is light range inside the screen
     * @param screen Screen rectangle
     * @zh 灯光范围是否在屏幕内
     * @param screen 屏幕矩形
     */
    isInScreen(screen: Rectangle) {
        const cache = this._screenCache;
        if (cache.x === screen.x
            && cache.y === screen.y
            && cache.width === screen.width
            && cache.right === screen.height) {
            return this._isInScreen;
        }
        this._isInScreen = this._getWorldRange().intersects(screen);
        screen.cloneTo(cache);
        return this._isInScreen;
    }

    /**
     * @internal
     * 生成网格对象
     * @param points 
     * @param inds 
     * @param mesh 复用的mesh
     * @param recover 如果mesh没有被复用，则将mesh放入recover队列
     */
    protected _makeOrUpdateMesh(points: Vector3[], inds: number[], mesh?: Mesh2D, recover?: any[]) {
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

        if (mesh) {
            const idx = mesh.getIndices();
            const ver = mesh.getVertices()[0];
            if (idx.length >= indices.length && ver.byteLength >= vertices.byteLength) { //mesh可以复用
                idx.set(indices);
                mesh.setVertexByIndex(vertices.buffer, 0);
                mesh.getSubMesh(0).setDrawElemenParams(indices.length, 0);
                return mesh; //返回原mesh
            } else if (recover) //mesh不可以复用，回收
                recover.push(mesh);
        }

        const declaration = VertexMesh2D.getVertexDeclaration(['POSITION,UV'], false)[0];
        return Mesh2D.createMesh2DByPrimitive([vertices], [declaration], indices, IndexFormat.UInt16, [{ length: indices.length, start: 0 }], true);
    }
}