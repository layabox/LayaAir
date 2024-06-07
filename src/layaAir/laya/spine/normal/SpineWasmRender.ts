import { Graphics } from "../../display/Graphics";
import { Material } from "../../resource/Material";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { SpineAdapter } from "../SpineAdapter";
import { SpineTemplet } from "../SpineTemplet";
import { ISpineRender } from "../interface/ISpineRender";
import { SpineMeshBase } from "../mesh/SpineMeshBase";
import { SpineWasmVirturalMesh } from "../mesh/SpineWasmVirturalMesh";
import { SpineNormalRenderBase } from "./SpineNormalRenderBase";
export class SpineWasmRender extends SpineNormalRenderBase implements ISpineRender {
    templet: SpineTemplet;
    private twoColorTint = false;
    graphics: Graphics;
    spineRender: any;
    constructor(templet: SpineTemplet, twoColorTint = true) {
        super();
        this.vmeshs = [];
        this.nextBatchIndex = 0;
        this.twoColorTint = twoColorTint;
        // if (twoColorTint)
        //     this.vertexSize += 4;
        this.templet = templet;
    }

    createMesh(material: Material): SpineMeshBase{
        return new SpineWasmVirturalMesh(material);
    }

    draw(skeleton: spine.Skeleton, renderNode: Spine2DRenderNode, slotRangeStart?: number, slotRangeEnd?: number): void {
        this.nextBatchIndex = 0;
        SpineAdapter.drawSkeleton((vbLen: number, ibLen: number, texturePath: string, blendMode: any) => {
            let texture = this.templet.getTexture(texturePath);
            let mat = this.templet.getMaterial(texture.realTexture, blendMode.value, renderNode);
            let mesh = this.nextBatch(mat,renderNode);
            mesh.drawByData(SpineAdapter._vbArray, vbLen, SpineAdapter._ibArray, ibLen);
        }, skeleton, false, slotRangeStart, slotRangeEnd);

    }
}

