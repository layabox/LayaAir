
import { ShaderData } from "../../../RenderEngine/RenderInterface/ShaderData";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { IRenderContext3D } from "../../RenderDriverLayer/IRenderContext3D";
import { MeshFilter } from "../../core/MeshFilter";
import { RenderableSprite3D } from "../../core/RenderableSprite3D";
import { Sprite3D } from "../../core/Sprite3D";
import { Transform3D } from "../../core/Transform3D";
import { BaseRender } from "../../core/render/BaseRender";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { RenderElement } from "../../core/render/RenderElement";
import { BoundFrustum } from "../../math/BoundFrustum";
import { Bounds } from "../../math/Bounds";
import { MeshUtil } from "../../resource/models/MeshUtil";
import { HLODBatchMesh } from "./HLODBatchMesh";
import { HLODElement } from "./HLODUtil";

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
     * set HLOD element
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
     * 根据LOD资源生成渲染节点
     * @param source 
     * @returns 
     */
    private _createRenderelementByHLODElement(source: HLODElement, out: RenderElement) {
        out.setGeometry(source.HLODMesh);
        out.material = source.material;
    }

    /**
     * change Render Mesh
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
     * 全局贴图
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
     * re caculate BoundBox
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
     * update data
     * @param context 
     * @param transform 
     */
    _renderUpdate(context: IRenderContext3D): void {
        this._applyLightMapParams();
        // // todo 若有根节点, 在这里更新 worldmatrix
        this._baseRenderNode.shaderData.setMatrix4x4(Sprite3D.WORLDMATRIX, this._transform.worldMatrix);
    }

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

    onEnable() {
        super.onEnable();
    }

    onDisable() {
        super.onDisable();
    }

    onDestroy() {
        super.onDestroy();
        this._renderElements.forEach(element => {
            element.material._removeReference();
            element.destroy();
        });
        this._renderElements = null;
    }

    _cloneTo(dest: HLODRender) {
        //TODO
    }
}