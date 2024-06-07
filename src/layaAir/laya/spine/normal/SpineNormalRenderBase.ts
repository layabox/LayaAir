import { Material } from "../../resource/Material";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { SpineMeshBase } from "../mesh/SpineMeshBase";

export abstract class SpineNormalRenderBase {
    protected vmeshs: SpineMeshBase[] = [];
    protected nextBatchIndex: number = 0;
    protected clearBatch() {
        for (var i = 0; i < this.vmeshs.length; i++) {
            this.vmeshs[i].clear();
        }
        this.nextBatchIndex = 0;
    }

    abstract createMesh(material: Material): SpineMeshBase;

    protected nextBatch(material: Material, spineRenderNode: Spine2DRenderNode) {
        if (this.vmeshs.length == this.nextBatchIndex) {
            let vmesh = this.createMesh(material);
            this.vmeshs.push(vmesh);
            spineRenderNode._renderElements[this.nextBatchIndex++] = vmesh.element;
            vmesh.element.value2DShaderData = spineRenderNode._spriteShaderData;
            return vmesh;
        }
        let vmesh = this.vmeshs[this.nextBatchIndex];
        spineRenderNode._renderElements[this.nextBatchIndex++] = vmesh.element;
        vmesh.material = material;
        return vmesh;
    }
}