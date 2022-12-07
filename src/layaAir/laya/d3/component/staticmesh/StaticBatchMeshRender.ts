import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";
import { MeshFilter } from "../../core/MeshFilter";
import { MeshSprite3DShaderDeclaration } from "../../core/MeshSprite3DShaderDeclaration";
import { BaseRender, RenderBitFlag } from "../../core/render/BaseRender";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { Sprite3D } from "../../core/Sprite3D";
import { Transform3D } from "../../core/Transform3D";
import { VertexMesh } from "../../graphics/Vertex/VertexMesh";
import { BoundFrustum } from "../../math/BoundFrustum";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { StaticBatchMesh } from "./StaticBatchMesh";
import { StaticBatchMeshRenderElement } from "./StaticBatchMeshRenderElement";
import { StaticMeshMergeInfo } from "./StaticMeshMergeInfo";

export class StaticBatchMeshRender extends BaseRender {

    static create(info: StaticMeshMergeInfo): StaticBatchMeshRender {

        let render = new StaticBatchMeshRender();

        render.mergeInfo = info;

        return render;
    }

    private _staticMesh: StaticBatchMesh;
    public get staticMesh(): StaticBatchMesh {
        return this._staticMesh;
    }

    private _mergeInfo: StaticMeshMergeInfo;
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
        let defineDatas = this._shaderValues;
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

    _renderUpdate(context: RenderContext3D, transform: Transform3D): void {
        this._applyLightMapParams();
        // todo 若有根节点, 在这里更新 worldmatrix
        this._setShaderValue(Sprite3D.WORLDMATRIX, ShaderDataType.Matrix4x4, Matrix4x4.DEFAULT);
    }

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

    onEnable() {
        super.onEnable();
        this.mergeInfo.renders.forEach(render => {
            render.setRenderbitFlag(RenderBitFlag.RenderBitFlag_Batch, true);
        });

    }

    onDisable() {
        super.onDisable();
        this.mergeInfo.renders.forEach(render => {
            render.setRenderbitFlag(RenderBitFlag.RenderBitFlag_Batch, false);
        });
    }

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

    _cloneTo(dest: StaticBatchMeshRender) {
        dest.mergeInfo = this.mergeInfo;
    }
}