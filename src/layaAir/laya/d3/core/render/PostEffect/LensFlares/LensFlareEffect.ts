import { ShaderDefine } from "../../../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader3D } from "../../../../../RenderEngine/RenderShader/Shader3D";
import { Color } from "../../../../../maths/Color";
import { Vector2 } from "../../../../../maths/Vector2";
import { Vector3 } from "../../../../../maths/Vector3";
import { Vector4 } from "../../../../../maths/Vector4";
import { BaseTexture } from "../../../../../resource/BaseTexture";
import { RenderTexture } from "../../../../../resource/RenderTexture";
import { Resource } from "../../../../../resource/Resource";
import { Texture2D } from "../../../../../resource/Texture2D";
import { Utils } from "../../../../../utils/Utils";
import { PostProcess } from "../../../../component/PostProcess";
import { Camera } from "../../../Camera";
import { DirectionLightCom } from "../../../light/DirectionLightCom";
import { Light, LightType } from "../../../light/Light";
import { PostProcessEffect } from "../../PostProcessEffect";
import { PostProcessRenderContext } from "../../PostProcessRenderContext";
import { CommandBuffer } from "../../command/CommandBuffer";
import { LensFlareCMD } from "./LensFlareCMD";
import { LensFlareElementGeomtry } from "./LensFlareGeometry";
import { LensFlareShaderInit } from "./LensFlareShaderInit";


/**
 * lens Flare Element
 * 光耀元素
 */
export class LensFlareElement {
    /**@internal active*/
    private _active: boolean = true;

    /**@internal type*/
    private _type: string = "Image";

    /**@internal tintColor */
    private _tint: Color = new Color(1, 1, 1, 1);

    /**@internal intensity*/
    private _intensity: number = 1;

    /**@internal texture*/
    private _texture: BaseTexture = Texture2D.whiteTexture;

    /**@internal positionOffet In screen space */
    private _positionOffset: Vector2 = new Vector2(0, 0);

    /**@internal scale in each dimension */
    private _scale: Vector2 = new Vector2(1, 1);

    /**@internal */
    private _autoRotate: boolean = false;

    /**@internal rotation with angle */
    private _rotation: number = 0;

    //AxisTransform
    private _startPosition: number = 0.0;

    private _angularOffset: number = 0;//0-360°

    // TODO
    /**@internal */
    private _aspectRatio: boolean = false;
    /**@internal */
    private _modulateByLightColor: boolean = false;
    /**@internal */
    private _blendMode: any;
    /**@internal */
    private _translationScale: Vector2 = new Vector2(1, 1);
    //elemet TODO
    //其他TODO



    /**
     * 是否激活
     */
    public get active(): boolean {
        return this._active;
    }
    public set active(value: boolean) {
        this._active = value;
    }

    /**
     * 颜色
     */
    public get tint(): Color {
        return this._tint;
    }
    public set tint(value: Color) {
        this._tint = value;
    }

    /**
     * 强度
     */
    public get intensity(): number {
        return this._intensity;
    }
    public set intensity(value: number) {
        this._intensity = value;
    }

    /**
     * 贴图
     */
    public get texture(): BaseTexture {
        return this._texture;
    }
    public set texture(value: BaseTexture) {
        this._texture = value;
    }

    /**
     * 位置偏移(屏幕空间下)
     */
    public get positionOffset(): Vector2 {
        return this._positionOffset;
    }
    public set positionOffset(value: Vector2) {
        this._positionOffset = value;
    }

    /**
     * 缩放(每个轴上)
     */
    public get scale(): Vector2 {
        return this._scale;
    }
    public set scale(value: Vector2) {
        this._scale = value;
    }

    /**
     * 自动旋转
     */
    public get autoRotate(): boolean {
        return this._autoRotate;
    }
    public set autoRotate(value: boolean) {
        this._autoRotate = value;
    }

    /**
     * 旋转角度
     */
    public get rotation(): number {
        return this._rotation;
    }
    public set rotation(value: number) {
        this._rotation = value;
    }

    /**
     * 起始位置
     */
    public get startPosition(): number {
        return this._startPosition;
    }
    public set startPosition(value: number) {
        this._startPosition = value;
    }

    /**
     * 角度偏移
     */
    public get angularOffset(): number {
        return this._angularOffset;
    }
    public set angularOffset(value: number) {
        this._angularOffset = value;
    }

}

/**
 * lens Flare Data 
 * 资源数据
 */
export class LensFlareData extends Resource {
    constructor() {
        super(false);
    }

    elements: LensFlareElement[] = [];
}

/**
 * lens Flare Element
 */
export class LensFlareEffect extends PostProcessEffect {
    /**@interal */
    static SHADERDEFINE_AUTOROTATE: ShaderDefine;

    /**
     * @internal
     * initdefine
     */
    static __initDefine__() {
        LensFlareEffect.SHADERDEFINE_AUTOROTATE = Shader3D.getDefineByName("LENSFLAREAUTOROTATE");
    }

    /**
     * init Shader\Geometry
     */
    static init() {
        LensFlareElementGeomtry.init();
        LensFlareShaderInit.init();
        LensFlareEffect.__initDefine__();
    }

    /**@internal */
    private _tempV3: Vector3;

    /**@internal */
    private _tempV4: Vector4;

    /**@internal */
    private _flareCMDS: LensFlareCMD[];

    /**@internal */
    private _center: Vector2;

    /**@internal */
    private _rotate: number

    /**@internal */
    private _light: Light;

    /**@internal */
    private _effectIntensity: number = 1;

    /**@internal */
    private _effectScale: number = 1;

    /**@internal */
    private _needUpdate: boolean = false;

    /**@internal */
    _lensFlareData: LensFlareData;

    /**
     * LensFlareData
     */
    set lensFlareData(value: LensFlareData) {
        if (!value) return;
        this._flareCMDS.length = 0;
        for (let i = 0; i < value.elements.length; i++) {
            let ele = value.elements[i];
            if (!ele.active) continue;
            var cmd = new LensFlareCMD();
            cmd.lensFlareElement = ele;
            this._flareCMDS.push(cmd);
        }
        this._lensFlareData = value;
        this._needUpdate = true;
    }

    get lensFlareData(): LensFlareData {
        return this._lensFlareData;
    }

    /**
     * bind light
     */
    set bindLight(light: Light) {
        if (!light)
            return;
        this._light = light;//TODO
        this._needUpdate = true;
    }

    get bindLight(): Light {
        return this._light;
    }

    /**
     * 后处理强度
     */
    public get effectIntensity(): number {
        return this._effectIntensity;
    }
    public set effectIntensity(value: number) {
        this._effectIntensity = value;
        this._needUpdate = true;
    }

    /**
     * 后处理缩放
     */
    public get effectScale(): number {
        return this._effectScale;
    }
    public set effectScale(value: number) {
        this._effectScale = value;
        this._needUpdate = true;
    }

    constructor() {
        super();
        this.singleton = false;
        this._flareCMDS = [];
        this._flareCMDS.push(new LensFlareCMD());
        this._center = new Vector2();
        this._tempV3 = new Vector3();
        this._tempV4 = new Vector4();
    }

    /**
     * @internal
     * 更新后处理数据
     */
    _updateEffectData(cmd: CommandBuffer) {
        if (this._flareCMDS.length == 0) return;
        for (let i = 0; i < this._flareCMDS.length; i++) {
            this._flareCMDS[i].center = this._center;//set center
            this._flareCMDS[i].rotate = this._rotate;//set rotate
            if (this._needUpdate) {
                let cmdEle = this._flareCMDS[i].lensFlareElement;
                if (!cmdEle) continue;
                cmdEle.intensity *= this.effectIntensity;
                let scale = cmdEle.scale;
                scale.setValue(scale.x * this.effectScale, scale.y * this.effectScale);
                cmdEle.scale = scale;
                this._flareCMDS[i].applyElementData();
            }
            cmd.addCustomCMD(this._flareCMDS[i]);
        }
        this._needUpdate = false;
    }

    /**
     * 计算直射光中心点
     * @param camera 
     */
    caculateDirCenter(camera: Camera) {
        //center caculate start
        // lightDirection
        (this._light as DirectionLightCom).direction.cloneTo(this._tempV3);
        // lightDir revert
        Vector3.scale(this._tempV3, -10, this._tempV3);
        // offset of light to camera
        Vector3.add(camera.transform.position, this._tempV3, this._tempV3);
        // to screen space
        Vector3.transformV3ToV4(this._tempV3, camera.projectionViewMatrix, this._tempV4);
        // normalize x\y coordinate
        this._center.setValue(this._tempV4.x / this._tempV4.w, this._tempV4.y / this._tempV4.w);
        // angle caculatge
        var angle: number = Utils.toAngle(Math.atan2(this._center.x, this._center.y));
        // angle round
        angle = (angle < 0) ? angle + 360 : angle;
        angle = Math.round(angle);
        this._rotate = Math.PI * 2.0 - Math.PI / 180 * angle;
    }

    /**
     * 计算点光
     * @param camera 
     */
    caculatePointCenter(camera: Camera) {
        //TODO
        this._needUpdate = true;
    }

    /**
     * 计算spot光
     * @param value 
     */
    caculateSpotCenter(value: Vector2) {
        //TODO
        this._needUpdate = true;
    }

    /**
     * 渲染流程
     * @param context 
     * @returns 
     */
    render(context: PostProcessRenderContext) {
        var cmd: CommandBuffer = context.command;
        let source: RenderTexture = context.indirectTarget;
        cmd.setRenderTarget(source,false,false);
        if (!this._light)
            return;
        switch (this._light.lightType) {
            case LightType.Directional:
                this.caculateDirCenter(context.camera);
                break;
            case LightType.Point:
                //TODO
                break;
            case LightType.Spot:
                //TODO
                break;
        }
        if (Math.abs(this._center.x) > 1.0 || Math.abs(this._center.y) > 1.0) return;
        this._updateEffectData(cmd);
        cmd.blitScreenQuad(source, context.destination);
    }

    /**
   * 释放Effect
   * @inheritDoc
   * @override
   */
    release(postprocess: PostProcess) {
        //TODO
        this._needUpdate = false;
    }
}