import { ISpineRenderDataHandle } from "../../../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { IRenderElement2D } from "../../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderStruct2D } from "../../../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { IRenderGeometryElement } from "../../../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { Material } from "../../../../resource/Material";
import { Texture2D } from "../../../../resource/Texture2D";
import { ShaderData } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Spine2DRenderNode } from "../../../Spine2DRenderNode";
import { SpineTemplet } from "../../../SpineTemplet";
import { SpineShaderInit } from "../../../shader/SpineShaderInit";
import { LayaGL } from "../../../../layagl/LayaGL";
import { BaseOptimizeRender } from "../optimize/BaseOptimizeRender";
import { ERenderProxyType, IRender, IRenderBatch } from "../../IWebSpine";
import { OptimizedSpineRenderer, StandardSpineRenderer, RigidBodySpineRenderer, BakedSpineRenderer } from "../optimize/SpineRendererTypes";
import { BakedSpine2DRenderer, StandardSpine2DRenderer } from "./SpineRendererTypes2D";
import { Spine2DNormalRenderUpdater } from "./Spine2DNormalRenderUpdater";
import { WebSpineRenderDataHandle } from "../../../../RenderDriver/RenderModuleData/WebModuleData/2D/WebRenderDataHandle";
import { SpineConst } from "../../../SpineConst";
import { SpineNormalRenderUpdater } from "../optimize/SpineNormalRenderUpdater";

/**
 * @en SpineOptimizeRender2D used for optimized rendering of Spine animations in 2D.
 * @zh SpineOptimizeRender2D 类用于优化 2D 空间中的 Spine 动画渲染。
 */
export class SpineOptimizeRender2D extends BaseOptimizeRender {

    static _NODE_COMMONMAP_ = ["BaseRender2D", "Spine2D"];
    /** @ignore @blueprintIgnore */
    static _pool: IRenderElement2D[] = [];

    /** @ignore @blueprintIgnore */
    static createRenderElement2D() {
        let element: IRenderElement2D;
        if (this._pool.length > 0) {
            element = this._pool.pop();
        } else {
            element = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        }
        element.renderStateIsBySprite = false;
        element.nodeCommonMap = SpineOptimizeRender2D._NODE_COMMONMAP_;
        return element;
    }

    /** @ignore @blueprintIgnore */
    static recoverRenderElement2D(value: IRenderElement2D) {
        if (!(value as any).canotPool) {
            value.materialShaderData = null;
            value.geometry = null;
            value.subShader = null;
            value.owner = null;
            this._pool.push(value);
        }
    }

    /** @internal */
    protected readonly is3D: boolean = false;

    /** @internal */
    private _renderElements: IRenderElement2D[] = [];

    /** @internal */
    _owner: Spine2DRenderNode;

    /** @internal */
    private _handle: ISpineRenderDataHandle;

    /** @ignore */
    constructor(owner: Spine2DRenderNode) {
        super();
        this._owner = owner;
        this._handle = this._owner._getRenderHandle() as ISpineRenderDataHandle;
        this._handle.baseColor = this.spineColor;
    }

    init(templet: SpineTemplet): void {
        super.init(templet);
        this._handle.skeleton = this._skeleton;
    }

    protected _createRenderProxies(): void {
        let shaderData = this._owner._struct.spriteShaderData;
        let renderOptimize = new OptimizedSpineRenderer(shaderData);
        let renderRigidBody = new RigidBodySpineRenderer(shaderData);
        if (SpineConst.ENABLE_WEB_BATCH) {
            let renderNormal = new StandardSpine2DRenderer(this._owner._struct);
            renderNormal.normalUpdater = new Spine2DNormalRenderUpdater;
            renderNormal.normalUpdater.autoCacheEnabled = this._enableCache;
            (this._handle as WebSpineRenderDataHandle).normalUpdater = renderNormal.normalUpdater;
            this.renderProxyMap.set(ERenderProxyType.RenderNormal, renderNormal);
        } else {
            let renderNormal = new StandardSpineRenderer(shaderData);
            renderNormal.normalUpdater = new SpineNormalRenderUpdater;
            renderNormal.normalUpdater.autoCacheEnabled = this._enableCache;
            this.renderProxyMap.set(ERenderProxyType.RenderNormal, renderNormal);
        }
        this.renderProxyMap.set(ERenderProxyType.RenderOptimize, renderOptimize);
        this.renderProxyMap.set(ERenderProxyType.RenderRigidBody, renderRigidBody);
    }

    protected _createBakedRenderer(): IRender {
        return new BakedSpine2DRenderer(this._owner._struct);
    }

    protected _updateSkinShaderDefines(): void {
        if (this._skinAttach.twoColorTint) {
            this._owner._spriteShaderData.addDefine(SpineShaderInit.SPINE_COLOR2);
        } else {
            this._owner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_COLOR2);
        }
    }

    changeSkeleton(skeleton: spine.Skeleton) {
        super.changeSkeleton(skeleton);
        this._handle.skeleton = skeleton;
    }

    /**
     * @en Update render elements from subMeshes and materials.
     * This method is called from renderProxy.afterRender().
     * @param subMeshes Array of sub meshes.
     * @param materials Array of materials.
     * @zh 根据子网格和材质数组更新渲染元素。
     * 此方法由 renderProxy.afterRender() 调用。
     * @param subMeshes 子网格数组。
     * @param materials 材质数组。
     */
    _updateRenderElements(subMeshes: IRenderGeometryElement[], materials: Material[]): void {
        if (!this._owner || !this._owner._struct) {
            return;
        }

        const struct = this._owner._struct;
        const shaderData = this._owner._spriteShaderData;

        this._updateRenderElementsFromData(
            struct,
            shaderData,
            subMeshes,
            materials
        );
    }

    /**
     * @en Update render elements from subMeshes and materials arrays.
     * Updates internal _renderElements first, then syncs to struct.renderElements.
     * @param struct The render struct to set renderElements.
     * @param shaderData The shader data for render elements.
     * @param subMeshes Array of sub meshes.
     * @param materials Array of materials.
     * @zh 根据子网格和材质数组更新渲染元素。
     * 先更新内部的 _renderElements，然后同步到 struct.renderElements。
     * @param struct 要设置 renderElements 的渲染结构。
     * @param shaderData 渲染元素的着色器数据。
     * @param subMeshes 子网格数组。
     * @param materials 材质数组。
     */
    private _updateRenderElementsFromData(
        struct: IRenderStruct2D,
        shaderData: ShaderData,
        subMeshes: IRenderGeometryElement[],
        materials: Material[]
    ): void {
        if (!subMeshes || !materials || subMeshes.length === 0 || materials.length === 0) {
            this._clearRenderElements();
            struct.renderElements = [];
            return;
        }

        const subMeshCount = subMeshes.length;
        const materialCount = materials.length;
        const targetCount = Math.max(subMeshCount, materialCount);

        let need = false;
        
        for (let i = 0; i < targetCount; i++) {
            let element = this._renderElements[i];
            const subMesh = subMeshes[i];
            const material = materials[i];

            if (subMesh && material) {
                let needUpdate = false;
                if (!element) {
                    element = SpineOptimizeRender2D.createRenderElement2D();
                    this._renderElements[i] = element;
                    needUpdate = true;
                } else {
                    if (element.geometry !== subMesh || 
                        element.materialShaderData !== material.shaderData ||
                        element.value2DShaderData !== shaderData ||
                        element.owner !== struct
                    ) {
                        needUpdate = true;
                    }
                }

                if (needUpdate) {
                    element.geometry = subMesh;
                    element.materialShaderData = material.shaderData;
                    element.subShader = material._shader.getSubShaderAt(0);
                    element.value2DShaderData = shaderData;
                    element.owner = struct;
                    element._index = i;
                    need = true;
                }
            } else {
                // 清理不需要的 element
                if (element) {
                    SpineOptimizeRender2D.recoverRenderElement2D(element);
                }
            }
        }

        this._renderElements.length = subMeshCount;

        if (need) {
            struct.renderElements = this._renderElements;
        }
    }

    /**
     * @en Clear all render elements.
     * @zh 清除所有渲染元素。
     */
    _clearRenderElements(): void {
        for (let i = 0, len = this._renderElements.length; i < len; i++) {
            const element = this._renderElements[i];
            if (element) {
                SpineOptimizeRender2D.recoverRenderElement2D(element);
            }
        }
        this._renderElements.length = 0;
        
        if (this._owner && this._owner._struct) {
            this._owner._struct.renderElements = [];
        }
    }

    /** @internal */
    _getMaterialByName(name: string, blendMode: number): Material {
        return this._templet.getMaterial(this._templet.getTexture(name), blendMode, this._premultipliedAlpha, false);
    }
    
    /** @internal */
    _getMaterial(texture: Texture2D, blendMode: number): Material {
        return this._templet.getMaterial(texture, blendMode, this._premultipliedAlpha, false);
    }

    _getRenderHandle(): any {
        return this._handle;
    }
}

