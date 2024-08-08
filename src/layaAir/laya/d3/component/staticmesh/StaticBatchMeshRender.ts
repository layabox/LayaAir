import { IRenderContext3D } from "../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { VertexMesh } from "../../../RenderEngine/RenderShader/VertexMesh";
import { MeshFilter } from "../../core/MeshFilter";
import { MeshSprite3DShaderDeclaration } from "../../core/MeshSprite3DShaderDeclaration";
import { BaseRender, RenderBitFlag } from "../../core/render/BaseRender";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { BoundFrustum } from "../../math/BoundFrustum";
import { StaticBatchMesh } from "./StaticBatchMesh";
import { StaticBatchMeshRenderElement } from "./StaticBatchMeshRenderElement";
import { StaticMeshMergeInfo } from "./StaticMeshMergeInfo";

/**
 * @en StaticBatchMeshRender class, extends BaseRender for static batch mesh rendering.
 * @zh StaticBatchMeshRender 类，继承自 BaseRender，用于静态批处理网格渲染。
 */
export class StaticBatchMeshRender extends BaseRender {
    /**
     * @en Creates a new StaticBatchMeshRender instance.
     * @param info The static mesh merge information.
     * @returns A new StaticBatchMeshRender instance.
     * @zh 创建一个新的 StaticBatchMeshRender 实例。
     * @param info 静态网格合并信息。
     * @returns 新的 StaticBatchMeshRender 实例。
     */
    static create(info: StaticMeshMergeInfo): StaticBatchMeshRender {

        let render = new StaticBatchMeshRender();

        render.mergeInfo = info;

        return render;
    }

    private _staticMesh: StaticBatchMesh;
    /**
     * @en The static batch mesh.
     * @zh 静态批处理网格。
     */
    public get staticMesh(): StaticBatchMesh {
        return this._staticMesh;
    }

    private _mergeInfo: StaticMeshMergeInfo;
    /**
     * @en The static mesh merge information.
     * @zh 静态网格合并信息。
     */
    public get mergeInfo(): StaticMeshMergeInfo {
        return this._mergeInfo;
    }
    public set mergeInfo(value: StaticMeshMergeInfo) {
        this._mergeInfo = value;

        let staticMesh = StaticBatchMesh.create(value);
        this._staticMesh = staticMesh;
        this.lightmapIndex = value.lightmapIndex;

        this._staticMesh = staticMesh;
        this.geometryBounds = staticMesh.bounds;
        let meshDefines = MeshFilter._meshVerticeDefine;
        let defineDatas = this._baseRenderNode.shaderData;
        this._getMeshDefine(staticMesh, meshDefines);

        for (const meshDef of meshDefines) {
            defineDatas.addDefine(meshDef);
        }

        this._renderElements.forEach(element => {
            element.material._removeReference();
            element.destroy();
        })

        this._renderElements = [];

        staticMesh._staticSubMeshes.forEach((subMesh, material) => {
            let element = new StaticBatchMeshRenderElement();
            this._renderElements.push(element);
            element.render = this;
            element.material = material;
            element.setGeometry(subMesh);

            material._addReference();
        });

        staticMesh.bounds.cloneTo(this.bounds);

    }

    _singleton: boolean;

    private constructor() {
        super();
        this._singleton = false;
    }

    _calculateBoundingBox() {
        // todo 根节点移动更新包围盒
        // this._bounds.setCenter(Vector3.ZERO);
        // this._bounds.setExtent(Vector3.ONE);
    }

    _renderUpdate(context: IRenderContext3D): void {
        // this._applyLightMapParams();
        // // todo 若有根节点, 在这里更新 worldmatrix
        // this._setShaderValue(Sprite3D.WORLDMATRIX, ShaderDataType.Matrix4x4, Matrix4x4.DEFAULT);
        // this._worldParams.x = 1.0;
        // this._setShaderValue(Sprite3D.WORLDINVERTFRONT, ShaderDataType.Vector4, this._worldParams);//TODO
    }

    /**
     * @en Gets mesh defines based on vertex elements.
     * @param mesh The static batch mesh.
     * @param out Array to store the resulting shader defines.
     * @zh 根据顶点元素获取网格定义。
     * @param mesh 静态批处理网格。
     * @param out 用于存储结果着色器定义的数组。
     */
    _getMeshDefine(mesh: StaticBatchMesh, out: Array<ShaderDefine>) {
        let vertexElements = mesh._vertexBuffer.vertexDeclaration._vertexElements;
        for (const element of vertexElements) {
            switch (element.elementUsage) {
                case VertexMesh.MESH_COLOR0:
                    out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_COLOR);
                    break;
                case VertexMesh.MESH_TEXTURECOORDINATE0:
                    out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV0);
                    break;
                case VertexMesh.MESH_TEXTURECOORDINATE1:
                    out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1);
                    break;
                case VertexMesh.MESH_TANGENT0:
                    out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_TANGENT);
                    break;
            }
        }
    }

    /**
     * @en Determines if the mesh needs to be rendered based on frustum culling.
     * @param boundFrustum The bounding frustum for culling.
     * @param context The 3D render context.(Not used)
     * @returns True if the mesh needs to be rendered, false otherwise.
     * @zh 根据视锥体剔除确定是否需要渲染网格。
     * @param boundFrustum 用于剔除的边界视锥体。
     * @param context 3D渲染上下文。(未使用)
     * @returns 如果需要渲染网格则返回true，否则返回false。
     */
    _needRender(boundFrustum: BoundFrustum, context: RenderContext3D): boolean {
        if (boundFrustum) {
            if (boundFrustum.intersects(this.bounds)) {
                let needRender = false;
                this.staticMesh._staticSubMeshes.forEach(subMesh => {
                    for (const info of subMesh.subInfos) {
                        info.needRender = boundFrustum.intersects(info.meshBounds);
                        needRender = needRender || info.needRender;
                    }
                });
                return needRender;
            }
            return false;
        }
        else {
            return true;
        }
    }

    /**
     * @ignore
     * @en Called when the component is enabled.
     * Sets the batch render flag for all renders in the merge info.
     * @zh 当组件启用时调用。
     * 为合并信息中的所有渲染器设置批处理渲染标志。
     */
    onEnable() {
        super.onEnable();
        this.mergeInfo.renders.forEach(render => {
            render.setRenderbitFlag(RenderBitFlag.RenderBitFlag_Batch, true);
        });

    }

    /**
     * @ignore
     * @en Called when the component is disabled.
     * Unsets the batch render flag for all renders in the merge info.
     * @zh 当组件禁用时调用。
     * 为合并信息中的所有渲染器取消设置批处理渲染标志。
     */
    onDisable() {
        super.onDisable();
        this.mergeInfo.renders.forEach(render => {
            render.setRenderbitFlag(RenderBitFlag.RenderBitFlag_Batch, false);
        });
    }

    /**
     * @ignore
     * @en Called when the component is being destroyed.
     * Cleans up resources including render elements and static mesh.
     * @zh 当组件被销毁时调用。
     * 清理资源，包括渲染元素和静态网格。
     */
    onDestroy() {
        super.onDestroy();
        this._renderElements.forEach(element => {
            element.material._removeReference();
            element.destroy();
        });
        this._renderElements = null;
        this._staticMesh.destroy();
        this._staticMesh = null;
    }

    /**
     * @en Clones the current StaticBatchMeshRender to another instance.
     * @param dest The destination StaticBatchMeshRender instance.
     * @zh 将当前 StaticBatchMeshRender 克隆到另一个实例。
     * @param dest 目标 StaticBatchMeshRender 实例。
     */
    _cloneTo(dest: StaticBatchMeshRender) {
        dest.mergeInfo = this.mergeInfo;
    }
}