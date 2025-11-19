import { IRenderGeometryElement } from "../../../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IRenderElement3D } from "../../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { Material } from "../../../../resource/Material";
import { Texture2D } from "../../../../resource/Texture2D";
import { ShaderData } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { SpineShaderInit } from "../../../shader/SpineShaderInit";
import { BaseOptimizeRender } from "../optimize/BaseOptimizeRender";
import { IBaseRenderNode } from "../../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { Laya3DRender } from "../../../../d3/RenderObjs/Laya3DRender";
import { OptimizedSpineRenderer, StandardSpineRenderer, RigidBodySpineRenderer, BakedSpineRenderer } from "../optimize/SpineRendererTypes";
import { ERenderProxyType, IRender } from "../../interface/IWebSpine";

/**
 * @en SpineOptimizeRender3D used for optimized rendering of Spine animations in 3D.
 * @zh SpineOptimizeRender3D 类用于优化 3D 空间中的 Spine 动画渲染。
 */
export class SpineOptimizeRender3D extends BaseOptimizeRender {

    /** @ignore @blueprintIgnore */
    static _pool: IRenderElement3D[] = [];

    /** @ignore @blueprintIgnore */
    static createRenderElement3D() {
        let element: IRenderElement3D;
        if (this._pool.length > 0) {
            element = this._pool.pop();
        } else {
            element = Laya3DRender.Render3DPassFactory.createRenderElement3D();
            element.isRender = true;
        }
        return element;
    }

    /** @ignore @blueprintIgnore */
    static recoverRenderElement3D(value: IRenderElement3D) {
        if (!(value as any).canotPool) {
            value.materialShaderData = null;
            value.geometry = null;
            value.subShader = null;
            value.owner = null;
            this._pool.push(value);
        }
    }

    /** @internal */
    protected readonly is3D: boolean = true;

    /** @internal */
    private _renderElements: IRenderElement3D[] = [];

    /** @internal */
    _owner: IBaseRenderNode;

    /** @ignore */
    constructor(owner: IBaseRenderNode) {
        super();
        this._owner = owner;
    }

    protected _createRenderProxies(): void {
        let shaderData = this._owner.shaderData;
        let renderOptimize = new OptimizedSpineRenderer(shaderData);
        let renderNormal = new StandardSpineRenderer(shaderData);
        let renderRigidBody = new RigidBodySpineRenderer(shaderData);
        this.renderProxyMap.set(ERenderProxyType.RenderNormal, renderNormal);
        this.renderProxyMap.set(ERenderProxyType.RenderOptimize, renderOptimize);
        this.renderProxyMap.set(ERenderProxyType.RenderRigidBody, renderRigidBody);
    }

    protected _createBakedRenderer(): IRender {
        return new BakedSpineRenderer(this._owner.shaderData);
    }

    protected _updateSkinShaderDefines(): void {
        if (this._skinAttach.twoColorTint) {
            this._owner.shaderData.addDefine(SpineShaderInit.SPINE_COLOR2);
        } else {
            this._owner.shaderData.removeDefine(SpineShaderInit.SPINE_COLOR2);
        }
    }

    /**
     * @en Update render elements from subMeshes and materials.
     * @param subMeshes Array of sub meshes.
     * @param materials Array of materials.
     * @zh 根据子网格和材质数组更新渲染元素。
     * @param subMeshes 子网格数组。
     * @param materials 材质数组。
     */
    _updateRenderElements(subMeshes: IRenderGeometryElement[], materials: Material[]): void {
        if (!this._owner) {
            return;
        }

        const shaderData = this._owner.shaderData;

        this._updateRenderElementsFromData(
            shaderData,
            subMeshes,
            materials
        );
    }

    /**
     * @en Update render elements from subMeshes and materials arrays.
     * @param shaderData The shader data for render elements.
     * @param subMeshes Array of sub meshes.
     * @param materials Array of materials.
     * @zh 根据子网格和材质数组更新渲染元素。
     * @param shaderData 渲染元素的着色器数据。
     * @param subMeshes 子网格数组。
     * @param materials 材质数组。
     */
    private _updateRenderElementsFromData(
        shaderData: ShaderData,
        subMeshes: IRenderGeometryElement[],
        materials: Material[]
    ): void {
        if (!subMeshes || !materials || subMeshes.length === 0 || materials.length === 0) {
            // 清理所有元素
            this._clearRenderElements();
            this._owner.setRenderelements([]);
            return;
        }

        const subMeshCount = subMeshes.length;
        const materialCount = materials.length;
        const targetCount = Math.max(subMeshCount, materialCount);

        let need = false;
        
        // 更新或创建 RenderElements
        for (let i = 0; i < targetCount; i++) {
            let element = this._renderElements[i];
            const subMesh = subMeshes[i];
            const material = materials[i];

            if (subMesh && material) {
                // 检查是否需要更新 element
                let needUpdate = false;
                if (!element) {
                    // 需要创建新的 element
                    element = SpineOptimizeRender3D.createRenderElement3D();
                    this._renderElements[i] = element;
                    needUpdate = true;
                } else {
                    // 对比检查是否需要更新现有 element
                    if (element.geometry !== subMesh || 
                        element.materialShaderData !== material.shaderData ||
                        element.renderShaderData !== shaderData ||
                        element.owner !== this._owner
                    ) {
                        needUpdate = true;
                    }
                }

                if (needUpdate) {
                    element.geometry = subMesh;
                    element.materialShaderData = material.shaderData;
                    element.subShader = material._shader.getSubShaderAt(0);
                    element.renderShaderData = shaderData;
                    element.owner = this._owner;
                    need = true;
                }
            } else {
                // 清理不需要的 element
                if (element) {
                    SpineOptimizeRender3D.recoverRenderElement3D(element);
                }
            }
        }

        this._renderElements.length = subMeshCount;

        if (need) {
            this._owner.setRenderelements(this._renderElements);
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
                SpineOptimizeRender3D.recoverRenderElement3D(element);
            }
        }
        this._renderElements.length = 0;
        
        if (this._owner) {
            this._owner.setRenderelements([]);
        }
    }

    /** @internal */
    _getMaterialByName(name: string, blendMode: number): Material {
        return this._templet.getMaterial(this._templet.getTexture(name), blendMode, true);
    }
    
    /** @internal */
    _getMaterial(texture: Texture2D, blendMode: number): Material {
        return this._templet.getMaterial(texture, blendMode, true);
    }

    _getRenderHandle(): any {
        return null; // 3D渲染不需要handle
    }
}

