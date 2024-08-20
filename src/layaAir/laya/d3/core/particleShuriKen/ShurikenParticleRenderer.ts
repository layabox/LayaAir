import { BoundFrustum } from "../../math/BoundFrustum";
import { Mesh } from "../../resource/models/Mesh";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";
import { ShurikenParticleSystem } from "./ShurikenParticleSystem";
import { ShuriKenParticle3DShaderDeclaration } from "./ShuriKenParticle3DShaderDeclaration";
import { ShurikenParticleInstanceSystem } from "./ShurikenParticleInstanceSystem";
import { RenderElement } from "../render/RenderElement";
import { Sprite3D } from "../Sprite3D";
import { ShurikenParticleMaterial } from "./ShurikenParticleMaterial";
import { Component } from "../../../components/Component";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { Stat } from "../../../utils/Stat";
import { Bounds } from "../../math/Bounds";
import { LayaEnv } from "../../../../LayaEnv";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { LayaGL } from "../../../layagl/LayaGL";
import { ShaderData, ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { IRenderContext3D } from "../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { Transform3D } from "../Transform3D";
import { BaseRenderType } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";



/**
 * @en The `ShurikenParticleRenderer` class is used to create 3D particle renderers.
 * @zh `ShurikenParticleRenderer` 类用于创建3D粒子渲染器。
 */
export class ShurikenParticleRenderer extends BaseRender {
    /**
     * @en Gravity value.
     * @zh 重力值。
     */
    static gravity: Vector3 = new Vector3(0, -9.81, 0);
    /** @internal */
    private _finalGravity: Vector3 = new Vector3();
    private _dragConstant: Vector2 = new Vector2();


    /**@internal */
    private _renderMode: number;
    /**@internal */
    private _mesh: Mesh = null;

    /**@interanl */
    _particleSystem: ShurikenParticleSystem;
    /**
     * @en Scale of camera speed in stretched billboard mode (currently not supported).
     * @zh 拉伸广告牌模式摄像机速度缩放（暂不支持）。
     */
    stretchedBillboardCameraSpeedScale: number = 0;
    /**
     * @en Speed scale in stretched billboard mode.
     * @zh 拉伸广告牌模式速度缩放。
     */
    stretchedBillboardSpeedScale: number = 0;
    /**
     * @en Length scale in stretched billboard mode.
     * @zh 拉伸广告牌模式长度缩放。
     */
    stretchedBillboardLengthScale: number = 2;

    /**
     * @en The particle management system.
     * @zh 粒子管理系统。
     */
    get particleSystem(): ShurikenParticleSystem {
        return this._particleSystem;
    }

    ///**排序模式。*/
    //public var sortingMode:int;

    /**
     * @en The render mode. 0: BILLBOARD, 1: STRETCHEDBILLBOARD, 2: HORIZONTALBILLBOARD, 3: VERTICALBILLBOARD, 4: MESH.
     * @zh 渲染模式。0：粒子始终面向摄像机。、1：粒子面向摄像机，但会应用各种缩放、2：粒子平面与 XZ“地板”平面平行、3：粒子在世界 Y 轴上直立，但转向面向摄像机、4：从 3D 网格而非从纹理渲染粒子。。
     */
    get renderMode(): number {
        return this._renderMode;
    }

    set renderMode(value: number) {
        if (this._renderMode !== value) {
            var defineDatas: ShaderData = this._baseRenderNode.shaderData;
            switch (this._renderMode) {
                case 0:
                    defineDatas.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_BILLBOARD);
                    break;
                case 1:
                    defineDatas.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_STRETCHEDBILLBOARD);
                    break;
                case 2:
                    defineDatas.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_HORIZONTALBILLBOARD);
                    break;
                case 3:
                    defineDatas.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_VERTICALBILLBOARD);
                    break;
                case 4:
                    defineDatas.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_MESH);
                    break;
            }
            this._renderMode = value;
            switch (value) {
                case 0:
                    defineDatas.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_BILLBOARD);
                    break;
                case 1:
                    defineDatas.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_STRETCHEDBILLBOARD);
                    break;
                case 2:
                    defineDatas.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_HORIZONTALBILLBOARD);
                    break;
                case 3:
                    defineDatas.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_VERTICALBILLBOARD);
                    break;
                case 4:
                    defineDatas.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_MESH);
                    break;
                default:
                    throw new Error("ShurikenParticleRender: unknown renderMode Value.");
            }
            var parSys: ShurikenParticleSystem = this._particleSystem;
            (parSys) && (parSys._initBufferDatas());
        }
    }

    /**
     * @en The Mesh used in mesh render mode. Effective when renderMode is 4.
     * @zh 网格渲染模式所使用的Mesh。renderMode为4时生效。
     */
    get mesh(): Mesh {
        return this._mesh;
    }

    set mesh(value: Mesh) {
        if (this._mesh !== value) {
            (this._mesh) && (this._mesh._removeReference());
            this._mesh = value;
            (value) && (value._addReference());
            this._particleSystem._initBufferDatas();
        }
    }

    /**
     * @ignore
     * @en Creates a new instance of ShurikenParticleRender class.
     * @zh 创建ShurikenParticleRender类的新实例。
     */
    constructor() {
        super();
        this.renderMode = 0;
        this._baseRenderNode.renderNodeType = BaseRenderType.ParticleRender
    }

    /**
     * @override
     */
    protected _getcommonUniformMap(): Array<string> {
        return ["Sprite3D", "ShurikenSprite3D"];
    }

    /**
    * @override
    */
    protected _onAdded(): void {
        super._onAdded();
        if (!LayaGL.renderEngine.getCapable(RenderCapable.DrawElement_Instance)) {
            this._particleSystem = new ShurikenParticleSystem(this);
        } else
            this._particleSystem = new ShurikenParticleInstanceSystem(this);

        var elements: RenderElement[] = this._renderElements;
        var element: RenderElement = elements[0] = new RenderElement();
        element.setTransform((this.owner as Sprite3D)._transform);
        element.render = this;
        element.setGeometry(this._particleSystem);
        element.material = ShurikenParticleMaterial.defaultMaterial;

        this._setRenderElements();
    }

    /**
    * @override
    */
    protected _onEnable(): void {
        super._onEnable();

        Stat.particleRenderNode++;
        (this._particleSystem.playOnAwake && LayaEnv.isPlaying) && (this._particleSystem.play());
    }

    /**
    * @override
    */
    protected _onDisable(): void {
        super._onDisable();
        Stat.particleRenderNode--;
        (this._particleSystem.isAlive) && (this._particleSystem.simulate(0, true));
    }

    /**
     * @inheritDoc
     * @internal
     * @override
     */
    _calculateBoundingBox(): void {
        var particleSystem: ShurikenParticleSystem = this._particleSystem;
        var bounds: Bounds;
        if (particleSystem._useCustomBounds) {
            bounds = particleSystem.customBounds;
            bounds._tranform((this.owner as Sprite3D).transform.worldMatrix, this._bounds);
        }
        else if (particleSystem._simulationSupported()) {
            // todo need update Bounds
            particleSystem._generateBounds();
            bounds = particleSystem._bounds;
            bounds._tranform((this.owner as Sprite3D).transform.worldMatrix, this._bounds);
            // 在世界坐标下考虑重力影响
            if (particleSystem.gravityModifier != 0) {
                var max: Vector3 = this._bounds.getMax();
                var min: Vector3 = this._bounds.getMin();
                var gravityOffset: Vector2 = particleSystem._gravityOffset;
                max.y -= gravityOffset.x;
                min.y -= gravityOffset.y;
                this._bounds.setMax(max);
                this._bounds.setMin(min);
            }
        }
        else {
            var min: Vector3 = this._bounds.getMin();
            min.setValue(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
            this._bounds.setMin(min);
            var max: Vector3 = this._bounds.getMax();
            max.setValue(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
            this._bounds.setMax(max);
        }
    }

    /**
     * @inheritDoc
     * @internal
     * @override
     */
    _needRender(boundFrustum: BoundFrustum, context: RenderContext3D): boolean {
        if (!Stat.enableParticle)
            return false;
        if (boundFrustum) {
            if (boundFrustum.intersects(this.bounds)) {
                if (this._particleSystem.isAlive)
                    return true;
                else
                    return false;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    /**
     * @inheritDoc
     * @internal
     * @override
     */
    _renderUpdate(context: IRenderContext3D): void {
        var particleSystem: ShurikenParticleSystem = this._particleSystem;
        var sv: ShaderData = this._baseRenderNode.shaderData;
        var transform: Transform3D = (this.owner as Sprite3D).transform;
        switch (particleSystem.simulationSpace) {
            case 0: //World
                break;
            case 1: //Local
                sv.setVector3(ShuriKenParticle3DShaderDeclaration.WORLDPOSITION, transform.position);
                sv.setShaderData(ShuriKenParticle3DShaderDeclaration.WORLDROTATION, ShaderDataType.Vector4, transform.rotation);
                break;
            default:
                throw new Error("ShurikenParticleMaterial: SimulationSpace value is invalid.");
        }

        if(particleSystem.shape&&particleSystem.shape.enable){
            sv.setBool(ShuriKenParticle3DShaderDeclaration.SHAPE, true)
        }else{
            sv.setBool(ShuriKenParticle3DShaderDeclaration.SHAPE, false)
        }

        switch (particleSystem.scaleMode) {
            case 0:
                var scale: Vector3 = transform.getWorldLossyScale();
                sv.setVector3(ShuriKenParticle3DShaderDeclaration.POSITIONSCALE, scale);
                sv.setVector3(ShuriKenParticle3DShaderDeclaration.SIZESCALE, scale);
                break;
            case 1:
                var localScale: Vector3 = transform.localScale;
                sv.setVector3(ShuriKenParticle3DShaderDeclaration.POSITIONSCALE, localScale);
                sv.setVector3(ShuriKenParticle3DShaderDeclaration.SIZESCALE, localScale);
                break;
            case 2:
                sv.setVector3(ShuriKenParticle3DShaderDeclaration.POSITIONSCALE, transform.getWorldLossyScale());
                sv.setVector3(ShuriKenParticle3DShaderDeclaration.SIZESCALE, Vector3.ONE);
                break;
        }

        switch (particleSystem.dragType) {
            case 0:
                this._dragConstant.setValue(particleSystem.dragSpeedConstantMin, particleSystem.dragSpeedConstantMin);
                sv.setVector2(ShuriKenParticle3DShaderDeclaration.DRAG, this._dragConstant);
                break;
            case 2:
                this._dragConstant.setValue(particleSystem.dragSpeedConstantMin, particleSystem.dragSpeedConstantMax);
                sv.setVector2(ShuriKenParticle3DShaderDeclaration.DRAG, this._dragConstant);
                break;
            default:
                this._dragConstant.setValue(0, 0);
                break;
        }

        Vector3.scale(ShurikenParticleRenderer.gravity, particleSystem.gravityModifier, this._finalGravity);
        sv.setVector3(ShuriKenParticle3DShaderDeclaration.GRAVITY, this._finalGravity);
        sv.setInt(ShuriKenParticle3DShaderDeclaration.SIMULATIONSPACE, particleSystem.simulationSpace);
        sv.setBool(ShuriKenParticle3DShaderDeclaration.THREEDSTARTROTATION, particleSystem.threeDStartRotation);
        sv.setInt(ShuriKenParticle3DShaderDeclaration.SCALINGMODE, particleSystem.scaleMode);
        sv.setNumber(ShuriKenParticle3DShaderDeclaration.STRETCHEDBILLBOARDLENGTHSCALE, this.stretchedBillboardLengthScale);
        sv.setNumber(ShuriKenParticle3DShaderDeclaration.STRETCHEDBILLBOARDSPEEDSCALE, this.stretchedBillboardSpeedScale);
        sv.setNumber(ShuriKenParticle3DShaderDeclaration.CURRENTTIME, particleSystem._currentTime);
    }

    /**
     * @perfTag PerformanceDefine.T_ShurikenUpdate
     * @en Update the render state.
     * @param context The render context.
     * @zh 更新渲染状态。
     * @param context 渲染上下文。
     */
    renderUpdate(context: RenderContext3D): void {
        this._renderElements.forEach(element => {
            element._renderElementOBJ.isRender = element._geometry._prepareRender(context);
            element._geometry._prepareRender(context);
            element._geometry._updateRenderParams(context);
        })
    }

    /**
     * @override
     * @en The bounding box. Read-only, not allowed to modify its value.
     * @zh 包围盒。只读，不允许修改其值。
     */
    get bounds(): Bounds {
        if (this.boundsChange) {
            this._calculateBoundingBox();
            this.boundsChange = false;
        }
        return this._bounds;
    }

    /**
     * @internal
     * @override
     */
    _cloneTo(dest: Component): void {
        let parRender = dest as ShurikenParticleRenderer;
        this._particleSystem.cloneTo(parRender._particleSystem);
        parRender.sharedMaterial = this.sharedMaterial;
        parRender.renderMode = this.renderMode;
        parRender.mesh = this.mesh;
        parRender.stretchedBillboardCameraSpeedScale = this.stretchedBillboardCameraSpeedScale;
        parRender.stretchedBillboardSpeedScale = this.stretchedBillboardSpeedScale;
        parRender.stretchedBillboardLengthScale = this.stretchedBillboardLengthScale;
        parRender.sortingFudge = this.sortingFudge;
    }

    protected _onDestroy() {
        (this._mesh) && (this._mesh._removeReference(), this._mesh = null);
        this._particleSystem.destroy();
        this._particleSystem = null;
        super._onDestroy();
    }

}


