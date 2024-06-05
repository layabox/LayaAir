
import { BaseRenderNode2D } from "../NodeRender2D/BaseRenderNode2D";
import { Graphics } from "../display/Graphics";
import { Material } from "../resource/Material";
import { Spine2DRenderNode } from "./Spine2DRenderNode";
import { SpineAdapter } from "./SpineAdapter";
import { SpineTemplet } from "./SpineTemplet";
import { ISpineRender } from "./interface/ISpineRender";
import { SpineWasmVirturalMesh } from "./mesh/SpineWasmVirturalMesh";
export class SpineWasmRender implements ISpineRender {
    templet: SpineTemplet;
    vmeshs: SpineWasmVirturalMesh[] = [];
    private twoColorTint = false;
    private nextBatchIndex: number = 0;
    graphics: Graphics;
    spineRender: any;
    constructor(templet: SpineTemplet, twoColorTint = true) {
        this.vmeshs = [];
        this.nextBatchIndex = 0;
        this.twoColorTint = twoColorTint;
        // if (twoColorTint)
        //     this.vertexSize += 4;
        this.templet = templet;
    }
    clearBatch() {
        for (var i = 0; i < this.vmeshs.length; i++) {
            this.vmeshs[i].clear();
        }
        this.nextBatchIndex = 0;
    }
    nextBatch(material: Material) {
        if (this.vmeshs.length == this.nextBatchIndex) {
            let vmesh = new SpineWasmVirturalMesh(material);
            this.vmeshs.push(vmesh);
            this.nextBatchIndex++;
            return vmesh;
        }
        let vmesh = this.vmeshs[this.nextBatchIndex++];
        vmesh.material = material;
        return vmesh;
    }
    draw(skeleton: spine.Skeleton, renderNode: Spine2DRenderNode, slotRangeStart?: number, slotRangeEnd?: number): void {
        this.nextBatchIndex = 0;
        SpineAdapter.drawSkeleton((vbLen: number, ibLen: number, texturePath: string, blendMode: any) => {
            let texture = this.templet.getTexture(texturePath);
            let mat = this.templet.getMaterial(texture.realTexture, blendMode.value, renderNode);
            let mesh = this.nextBatch(mat);
            mesh.drawNew(SpineAdapter._vbArray, vbLen, SpineAdapter._ibArray, ibLen);
        }, skeleton, false, slotRangeStart, slotRangeEnd);

    }
}

