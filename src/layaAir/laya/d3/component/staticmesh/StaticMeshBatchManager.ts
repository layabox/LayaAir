import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { StaticBatchMeshRender } from "./StaticBatchMeshRender";
import { StaticMeshMergeInfo } from "./StaticMeshMergeInfo";

/**
 * @internal
 * @en Manages static mesh batching.
 * @zh 管理静态网格批处理。
 */
export class StaticMeshBatchManager {

    private meshVertexDecSet: Set<StaticMeshMergeInfo>;

    constructor() {
        this.meshVertexDecSet = new Set();
    }

    /**
     * @en Combines multiple MeshRenderers into static batch renders.
     * @param renders Array of MeshRenderer objects to be combined.
     * @returns Array of StaticBatchMeshRender objects created from the combination.
     * @zh 将多个 MeshRenderer 合并为静态批处理渲染器。
     * @param renders 要合并的 MeshRenderer 对象数组。
     * @returns 由合并创建的 StaticBatchMeshRender 对象数组。
     */
    combine(renders: MeshRenderer[]) {
        // todo 检测方式
        for (const render of renders) {
            let haveMatch = false;
            for (const info of this.meshVertexDecSet) {
                if (info.match(render)) {
                    haveMatch = true;
                    info.addElement(render);
                }
            }
            if (!haveMatch) {
                let info = StaticMeshMergeInfo.create(render);
                info.addElement(render);
                this.meshVertexDecSet.add(info);
            }
        }

        let staticRenders: StaticBatchMeshRender[] = [];
        for (const info of this.meshVertexDecSet) {
            staticRenders.push(StaticBatchMeshRender.create(info));
        }
        this.meshVertexDecSet.clear();
        return staticRenders;
    }

    /**
     * @en Merges a single StaticMeshMergeInfo into a StaticBatchMeshRender.
     * @param info The StaticMeshMergeInfo to be merged.
     * @returns A new StaticBatchMeshRender created from the merge info.
     * @zh 将单个 StaticMeshMergeInfo 合并为 StaticBatchMeshRender。
     * @param info 要合并的 StaticMeshMergeInfo。
     * @returns 从合并信息创建的新 StaticBatchMeshRender。
     */
    merge(info: StaticMeshMergeInfo) {
        let staticMeshRender = StaticBatchMeshRender.create(info);
        return staticMeshRender;
    }

}