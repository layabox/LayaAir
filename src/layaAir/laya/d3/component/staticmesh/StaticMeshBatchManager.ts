import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { StaticBatchMeshRender } from "./StaticBatchMeshRender";
import { StaticMeshMergeInfo } from "./StaticMeshMergeInfo";

/**
 * @internal
 */
export class StaticMeshBatchManager {

    private meshVertexDecSet: Set<StaticMeshMergeInfo>;

    constructor() {
        this.meshVertexDecSet = new Set();
    }
    /**
     * 合并
     * @param renders 
     * @returns 
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
    
    merge(info: StaticMeshMergeInfo) {
        let staticMeshRender = StaticBatchMeshRender.create(info);
        return staticMeshRender;
    }

}