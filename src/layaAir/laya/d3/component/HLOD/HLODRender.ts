import { IRenderContext3D } from "../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { ShaderData } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { MeshFilter } from "../../core/MeshFilter";
import { RenderableSprite3D } from "../../core/RenderableSprite3D";
import { Sprite3D } from "../../core/Sprite3D";
import { BaseRender } from "../../core/render/BaseRender";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { RenderElement } from "../../core/render/RenderElement";
import { BoundFrustum } from "../../math/BoundFrustum";
import { Bounds } from "../../math/Bounds";
import { MeshUtil } from "../../resource/models/MeshUtil";
import { HLODBatchMesh } from "./HLODBatchMesh";
import { HLODElement } from "./HLODUtil";

/**
 * @en Handles the rendering of a hierarchical level of detail (HLOD) element. This class is responsible for managing LODs for objects to achieve better performance by rendering simpler meshes when objects are further from the camera.
 * @zh HLOD渲染处理类，负责管理场景中对象的层级细节层次（HLOD），以提高渲染性能。通过在相机较远时渲染更简单的网格来实现。
 */
export class HLODRender extends BaseRender {

    /**@internal */
    _singleton: boolean;

    /**@internal */
    _curHLODRS: HLODElement;

    /**@internal */
    _curSubBatchMeshBounds: Bounds[];

    constructor() {
        super();
        this._singleton = false;

    }

    /**
     * @en The current HLOD rendering state.
     * @zh 当前的 HLOD 渲染状态。
     */
    get curHLODRS() {
        return this._curHLODRS;
    }

    set curHLODRS(value: HLODElement) {
        if (!this._curHLODRS) {
            this._renderElements = [];
            this._renderElements.push(new RenderElement());
            this._renderElements[0].render = this;
        }
        if (value != this._curHLODRS) {
            this._changeMesh(value.HLODMesh);
            this._curHLODRS = value;//顺序不可变换
            this._createRenderelementByHLODElement(this._curHLODRS, this._renderElements[0]);
        }
    }

    /**
     * @en Set the geometry and material of the RenderElement based on the given HLODElement resource.
     * @param source The HLODElement containing mesh and material information.
     * @param out The RenderElement to be set.
     * @zh 根据给定的 HLOD 资源设置渲染节点的几何体和材质。
     * @param source 包含网格和材料信息的 HLODElement。
     * @param out 要设置的 RenderElement。
     */
    private _createRenderelementByHLODElement(source: HLODElement, out: RenderElement) {
        out.setGeometry(source.HLODMesh);
        out.material = source.material;
    }

    /**
     * @en Change the current rendering mesh to a new LOD mesh.
     * @param lodMesh The new LOD mesh for rendering.
     * @zh 将当前渲染网格更改为新的 LOD 网格。
     * @param lodMesh 新的 LOD 网格，用于渲染。
     */
    private _changeMesh(lodMesh: HLODBatchMesh) {
        var defineDatas: ShaderData = this._baseRenderNode.shaderData;
        this.boundsChange = true;
        let meshDefines = MeshFilter._meshVerticeDefine;
        if (this.curHLODRS) {
            MeshUtil.getMeshDefine(this.curHLODRS.HLODMesh.batchMesh, meshDefines);
            for (var i: number = 0, n: number = meshDefines.length; i < n; i++)
                defineDatas.removeDefine(MeshFilter._meshVerticeDefine[i]);
        }
        if (lodMesh) {
            MeshUtil.getMeshDefine(lodMesh.batchMesh, meshDefines);
            for (var i: number = 0, n: number = MeshFilter._meshVerticeDefine.length; i < n; i++)
                defineDatas.addDefine(MeshFilter._meshVerticeDefine[i]);
        }
        //update submesh Bounds
        this._curSubBatchMeshBounds.length = lodMesh.batchSubMeshInfo.length;
        for (let i = 0, n = lodMesh.batchSubMeshInfo.length; i < n; i++) {
            this._curSubBatchMeshBounds[i] = this._curSubBatchMeshBounds[i] ? this._curSubBatchMeshBounds[i] : new Bounds();
        }

    }

    /**
     * @override
     * @internal
     * @en Apply the lightmap parameters of the current HLOD element to the shader.
     * @zh 将当前 HLOD 元素的光照图参数应用到着色器上。
     */
    _applyLightMapParams() {
        if (!this._scene) return;
        var shaderValues = this._baseRenderNode.shaderData;
        var lightMap = this._curHLODRS.lightmap;
        if (lightMap && lightMap.lightmapColor) {
            shaderValues.setTexture(RenderableSprite3D.LIGHTMAP, lightMap.lightmapColor);
            shaderValues.addDefine(RenderableSprite3D.SAHDERDEFINE_LIGHTMAP);
            if (lightMap.lightmapDirection) {
                shaderValues.setTexture(RenderableSprite3D.LIGHTMAP_DIRECTION, lightMap.lightmapDirection);
                shaderValues.addDefine(RenderableSprite3D.SHADERDEFINE_LIGHTMAP_DIRECTIONAL);
            }
            else {
                shaderValues.removeDefine(RenderableSprite3D.SHADERDEFINE_LIGHTMAP_DIRECTIONAL);
            }
        } else {
            shaderValues.removeDefine(RenderableSprite3D.SAHDERDEFINE_LIGHTMAP);
            shaderValues.removeDefine(RenderableSprite3D.SHADERDEFINE_LIGHTMAP_DIRECTIONAL);
        }
    }

    /**
     * @en re caculate BoundBox
     * @zh 重新计算包围盒
     */
    _calculateBoundingBox() {
        // todo 根节点移动更新包围盒
        if (this._curHLODRS) {
            var sharedMesh: HLODBatchMesh = this._curHLODRS.HLODMesh;
            if (sharedMesh) {
                var worldMat: Matrix4x4 = this._transform.worldMatrix;
                sharedMesh.batchMesh.bounds._tranform(worldMat, this._bounds);
            }
            //Update 
            for (let i = 0, n = this._curSubBatchMeshBounds.length; i < n; i++) {
                sharedMesh.batchSubMeshInfo[i].bounds._tranform(worldMat, this._curSubBatchMeshBounds[i]);
            }
        }
    }

    /**
     * @en Update rendering data.
     * @zh 更新渲染数据。
     */
    _renderUpdate(context: IRenderContext3D): void {
        this._applyLightMapParams();
        // // todo 若有根节点, 在这里更新 worldmatrix
        this._baseRenderNode.shaderData.setMatrix4x4(Sprite3D.WORLDMATRIX, this._transform.worldMatrix);
    }

    /**
     * @en Determine if the object needs to be rendered based on its visibility within the bounding frustum.
     * @param boundFrustum The bounding frustum used for culling.
     * @param context The rendering context.
     * @returns True if the object needs to be rendered, false otherwise.
     * @zh 根据对象在边界视锥体内的可见性确定是否需要渲染该对象。
     * @param boundFrustum 用于裁剪的边界视锥体。
     * @param context 渲染上下文。
     * @returns 如果对象需要被渲染则返回 true，否则返回 false。
     */
    _needRender(boundFrustum: BoundFrustum, context: RenderContext3D): boolean {
        if (boundFrustum) {
            if (boundFrustum.intersects(this.bounds)) {
                let hodMesh = this.curHLODRS.HLODMesh.drawSubMeshs;
                let lodbatchMesh = this._curHLODRS.HLODMesh.batchSubMeshInfo;
                hodMesh.length = 0;
                for (let i = 0, n = this._curSubBatchMeshBounds.length; i < n; i++) {
                    if (boundFrustum.intersects(this._curSubBatchMeshBounds[i])) {
                        hodMesh.push(lodbatchMesh[i]);
                    }
                }
                //sort TODO
                // let position = context.camera.transform.position;
                // let oriPisition = (this.owner as Sprite3D)
                // hodMesh = hodMesh.sort((a,b)=>{

                //     return 10;
                // });
                this._curHLODRS.HLODMesh.drawSubMeshs = hodMesh;
                return true;
            }
            else
                return false
        } else {
            return true;
        }
    }

    /**
     * @ignore
     * @en Called when the component is being destroyed.
     * @zh 当组件被销毁时调用。
     */
    onDestroy() {
        super.onDestroy();
        this._renderElements.forEach(element => {
            element.material._removeReference();
            element.destroy();
        });
        this._renderElements = null;
    }
}