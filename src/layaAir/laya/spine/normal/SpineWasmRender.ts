import { Graphics } from "../../display/Graphics";
import { Material } from "../../resource/Material";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { SpineAdapter } from "../SpineAdapter";
import { SpineTemplet } from "../SpineTemplet";
import { ISpineRender } from "../interface/ISpineRender";
import { SpineMeshBase } from "../mesh/SpineMeshBase";
import { SpineWasmVirturalMesh } from "../mesh/SpineWasmVirturalMesh";
import { SpineNormalRenderBase } from "./SpineNormalRenderBase";
/**
 * @en SpineWasmRender class for rendering Spine skeletons using WebAssembly.
 * @zh SpineWasmRender 类用于使用 WebAssembly 渲染 Spine 骨骼。
 */
export class SpineWasmRender extends SpineNormalRenderBase implements ISpineRender {
    /**
     * @en Spine templet associated with this renderer.
     * @zh 与此渲染器关联的 Spine 模板。
     */
    templet: SpineTemplet;
    private twoColorTint = false;
    /**
     * @en Graphics object for rendering.
     * @zh 用于渲染的图形对象。
     */
    graphics: Graphics;
    /**
     * @en Spine render object.
     * @zh Spine 渲染对象。
     */
    spineRender: any;
    /**
     * @en Creates a new SpineWasmRender instance.
     * @param templet The Spine templet to use.
     * @param twoColorTint Whether to use two-color tinting.
     * @zh 创建 SpineWasmRender 类的新实例。
     * @param templet 要使用的 Spine 模板。
     * @param twoColorTint 是否使用双色调色。
     */
    constructor(templet: SpineTemplet, twoColorTint = true) {
        super();
        this.vmeshs = [];
        this.nextBatchIndex = 0;
        this.twoColorTint = twoColorTint;
        // if (twoColorTint)
        //     this.vertexSize += 4;
        this.templet = templet;
    }

    /**
     * @en Create a mesh with the given material.
     * @param material The material to be used for the mesh.
     * @returns A SpineMeshBase object.
     * @zh 创建具有给定材质的网格。
     * @param material 用于网格的材质。
     * @returns SpineMeshBase 对象。
     */
    createMesh(material: Material): SpineMeshBase{
        return new SpineWasmVirturalMesh(material);
    }

    /**
     * @en Draw the skeleton.
     * @param skeleton The skeleton to draw.
     * @param renderNode The render node.
     * @param slotRangeStart The starting slot index.
     * @param slotRangeEnd The ending slot index.
     * @zh 绘制骨骼。
     * @param skeleton 要绘制的骨骼。
     * @param renderNode 渲染节点。
     * @param slotRangeStart 起始插槽索引。
     * @param slotRangeEnd 结束插槽索引。
     */
    draw(skeleton: spine.Skeleton, renderNode: Spine2DRenderNode, slotRangeStart?: number, slotRangeEnd?: number): void {
        this.nextBatchIndex = 0;
        SpineAdapter.drawSkeleton((vbLen: number, ibLen: number, texturePath: string, blendMode: any) => {
            let mat = renderNode.getMaterial(this.templet.getTexture(texturePath), blendMode.value);
            let mesh = this.nextBatch(mat,renderNode);
            mesh.drawByData(SpineAdapter._vbArray, vbLen, SpineAdapter._ibArray, ibLen);
        }, skeleton, false, slotRangeStart, slotRangeEnd);

    }
}

