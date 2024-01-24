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
import { ShaderData, ShaderDataType } from "../../../RenderDriver/RenderModuleData/Design/ShaderData";
import { IRenderContext3D } from "../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { Transform3D } from "../Transform3D";



/**
 * <code>ShurikenParticleRender</code> 类用于创建3D粒子渲染器。
 */
export class ShurikenParticleRenderer extends BaseRender {
    /**重力值。*/
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
    /**拉伸广告牌模式摄像机速度缩放,暂不支持。*/
    stretchedBillboardCameraSpeedScale: number = 0;
    /**拉伸广告牌模式速度缩放。*/
    stretchedBillboardSpeedScale: number = 0;
    /**拉伸广告牌模式长度缩放。*/
    stretchedBillboardLengthScale: number = 2;

    get particleSystem(): ShurikenParticleSystem {
        return this._particleSystem;
    }

    ///**排序模式。*/
    //public var sortingMode:int;

    /**
     * 获取渲染模式,0为BILLBOARD、1为STRETCHEDBILLBOARD、2为HORIZONTALBILLBOARD、3为VERTICALBILLBOARD、4为MESH。
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
     * 获取网格渲染模式所使用的Mesh,rendderMode为4时生效。
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
     * 创建一个 <code>ShurikenParticleRender</code> 实例。
     */
    constructor() {
        super();
        this.renderMode = 0;
    }

    protected _getcommonUniformMap(): Array<string> {
        return ["Sprite3D", "ShurikenSprite3D"];
    }


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

    protected _onEnable(): void {
        super._onEnable();

        Stat.particleRenderNode++;
        (this._particleSystem.playOnAwake && LayaEnv.isPlaying) && (this._particleSystem.play());
    }

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

    renderUpdate(context: RenderContext3D): void {
        this._renderElements.forEach(element => {
            element._renderElementOBJ.isRender = element._geometry._prepareRender(context);
            element._geometry._prepareRender(context);
            element._geometry._updateRenderParams(context);
        })
    }

    /**
     * @inheritDoc
     * @override
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


