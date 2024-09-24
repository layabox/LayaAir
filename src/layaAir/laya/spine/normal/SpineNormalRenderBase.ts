import { Material } from "../../resource/Material";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { SpineMeshBase } from "../mesh/SpineMeshBase";

/**
 * @en Abstract base class for Spine normal rendering.
 * @zh Spine 普通渲染的抽象基类。
 */
export abstract class SpineNormalRenderBase {
    /**
     * @en Array of SpineMeshBase objects.
     * @zh SpineMeshBase 对象数组。
     */
    protected vmeshs: SpineMeshBase[] = [];
    /**
     * @en Index for the next batch.
     * @zh 下一批次的索引。
     */
    protected nextBatchIndex: number = 0;
    /**
     * @en Clears all batches by resetting meshes and batch index.
     * @zh 通过重置网格和批次索引来清除所有批次。
     */
    protected clearBatch() {
        for (var i = 0; i < this.vmeshs.length; i++) {
            this.vmeshs[i].clear();
        }
        this.nextBatchIndex = 0;
    }

    /**
     * @en Abstract method to create a mesh with the given material.
     * @param material The material to be used for the mesh.
     * @zh 创建具有给定材质的网格的抽象方法。
     * @param material 用于网格的材质。
     */
    abstract createMesh(material: Material): SpineMeshBase;

    /**
     * @en Prepares the next batch for rendering.
     * @param material The material to be used for the batch.
     * @param spineRenderNode The Spine2DRenderNode to be rendered.
     * @zh 准备下一批次用于渲染。
     * @param material 用于批次的材质。
     * @param spineRenderNode 要渲染的 Spine2DRenderNode。
     */
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