import { Config3D } from "../../../../Config3D";
import { Scene3D } from "../scene/Scene3D";
import { Sprite3D } from "../Sprite3D";
import { ShadowMode } from "./ShadowMode";
import { Component } from "../../../components/Component";
import { Color } from "../../../maths/Color";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { IDirectLightData, IPointLightData, ISpotLightData } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";



export enum LightType {
    Directional,
    Spot,
    Point,
    Area
}

export enum LightMode {
    mix,
    realTime,//
    bakeOnly
}

/**
 * <code>LightSprite</code> 类用于创建灯光的父类。
 */
export class Light extends Component {
    /**@internal 下沉数据集合 */
    protected _dataModule: IDirectLightData | ISpotLightData | IPointLightData;
    /** @internal */
    protected _shadowMode: ShadowMode = ShadowMode.None;

    /** @internal */
    private _isAlternate: boolean = false;
    /** @internal */
    _intensityColor: Vector3;
    /** @internal */
    _intensity: number;
    /** @internal */
    _lightmapBakedType: LightMode;
    /** @internal */
    _lightType: LightType;
    /** @internal 因为scale会影响裁剪阴影*/
    _lightWoldMatrix: Matrix4x4 = new Matrix4x4();

    /** 灯光颜色。 */
    color: Color;

    /**
     * 灯光强度。
     */
    get intensity(): number {
        return this._intensity;
    }

    set intensity(value: number) {
        this._intensity = value;
    }

    /**
     * 阴影模式。
     */
    get shadowMode(): ShadowMode {
        return this._dataModule.shadowMode;
    }

    set shadowMode(value: ShadowMode) {
        this._dataModule.shadowMode = value
    }

    /**
     * 最大阴影距离。
     */
    get shadowDistance(): number {
        return this._dataModule.shadowDistance;
    }

    set shadowDistance(value: number) {
        this._dataModule.shadowDistance = value;
    }

    /**
     * 阴影贴图分辨率。
     */
    get shadowResolution(): number {
        return this._dataModule.shadowResolution;
    }

    set shadowResolution(value: number) {
        this._dataModule.shadowResolution = value;
    }

    /**
     * 阴影深度偏差。
     */
    get shadowDepthBias(): number {
        return this._dataModule.shadowDepthBias;
    }

    set shadowDepthBias(value: number) {
        this._dataModule.shadowDepthBias = value;
    }

    /**
     * 阴影法线偏差。
     */
    get shadowNormalBias(): number {
        return this._dataModule.shadowNormalBias;
    }

    set shadowNormalBias(value: number) {
        this._dataModule.shadowNormalBias = value;
    }

    /**
     * 阴影强度。
     */
    get shadowStrength(): number {
        return this._dataModule.shadowStrength;
    }

    set shadowStrength(value: number) {
        this._dataModule.shadowStrength = value;
    }

    /**
     * 阴影视锥的近裁面。
     */
    get shadowNearPlane(): number {
        return this._dataModule.shadowNearPlane;
    }

    set shadowNearPlane(value: number) {
        this._dataModule.shadowNearPlane = value;
    }

    /**
     * 灯光烘培类型。
     */
    get lightmapBakedType(): LightMode {
        return this._lightmapBakedType;
    }

    set lightmapBakedType(value: LightMode) {
        let premode = this._lightmapBakedType;
        if (this._lightmapBakedType !== value) {
            this._lightmapBakedType = value;
            if (this._enabled) {
                if (value == LightMode.bakeOnly)
                    this._removeFromScene();
                else
                    if (premode == LightMode.bakeOnly)
                        this._addToScene();
            }
        }
    }

    get lightWorldMatrix(): Matrix4x4 {
        var position = (this.owner as Sprite3D).transform.position;
        var quaterian = (this.owner as Sprite3D).transform.rotation;
        Matrix4x4.createAffineTransformation(position, quaterian, Vector3.ONE, this._lightWoldMatrix);
        return this._lightWoldMatrix;
    }

    get lightType() {
        return this._lightType;
    }




    /**
     * 创建一个 <code>LightSprite</code> 实例。
     */
    constructor() {
        super();
        this._creatModuleData();
        this.runInEditor = true;
        this._intensity = 1.0;
        this._intensityColor = new Vector3();
        this.color = new Color(1.0, 1.0, 1.0, 1.0);
        this._lightmapBakedType = LightMode.realTime;
        this.shadowResolution = 2048;
        this.shadowDistance = 50.0;
        this.shadowDepthBias = 1.0;
        this.shadowNormalBias = 1.0;
        this.shadowNearPlane = 0.1;
        this.shadowStrength = 1.0;
        this.shadowMode = ShadowMode.None;
    }

    protected _creatModuleData() {
        //overrid it
    }

    /**@internal */
    _setOwner(node: Sprite3D): void {
        super._setOwner(node);
        this._dataModule.transform = (this.owner as Sprite3D).transform;
    }

    /**@internal */
    _getRenderDataModule() {
        return this._dataModule;
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _parse(data: any, spriteMap: any): void {
        super._parse(data, spriteMap);
        var colorData: any[] = data.color;
        this.color.r = colorData[0];
        this.color.g = colorData[1];
        this.color.b = colorData[2];
        this.intensity = data.intensity;
        this.lightmapBakedType = data.lightmapBakedType;
    }
    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _cloneTo(dest: Component) {
        super._cloneTo(dest);
        var light = <Light>dest;
        light.color = this.color.clone();
        light.intensity = this.intensity;
        light.lightmapBakedType = this.lightmapBakedType;
    }

    /**
     * @internal
     */
    private _addToScene(): void {
        var scene: Scene3D = <Scene3D>this.owner.scene;
        var maxLightCount: number = Config3D.maxLightCount;
        if (scene._lightCount < maxLightCount) {
            scene._lightCount++;
            this._addToLightQueue();
            this._isAlternate = false;
        }
        else {
            scene._alternateLights.add(this);
            this._isAlternate = true;
            console.warn("LightSprite:light count has large than maxLightCount,the latest added light will be ignore.");
        }
    }

    /**
     * @internal
     */
    private _removeFromScene(): void {
        var scene: Scene3D = <Scene3D>this.owner._scene;
        if (!scene)
            return;
        if (this._isAlternate) {
            scene._alternateLights.remove(this);
        }
        else {
            scene._lightCount--;
            this._removeFromLightQueue();
            if (scene._alternateLights._length > 0) {
                var alternateLight = scene._alternateLights.shift();
                alternateLight!._addToLightQueue();
                alternateLight!._isAlternate = false;
                scene._lightCount++;
            }
        }
    }

    /**
     * @internal
     */
    protected _addToLightQueue(): void {
    }

    /**
     * @internal
     */
    protected _removeFromLightQueue(): void {
    }

    protected _onEnable(): void {
        (this.lightmapBakedType !== LightMode.bakeOnly) && (this._addToScene());
    }

    protected _onDisable(): void {
        (this.lightmapBakedType !== LightMode.bakeOnly) && (this._removeFromScene());
    }

    protected _onDestroy() {
    }

    /**
     * @internal
     */
    protected _create(): Component {
        return new Light();
    }
}

