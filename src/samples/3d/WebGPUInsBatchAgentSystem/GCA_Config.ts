import { GCA_BatchType } from "./GCA_InsBatchAgent";
import { GCA_InstanceRenderElementCollect } from "./GCA_InstanceRenderElementCollect";
import { GCA_OneBatchInfo } from "./GCA_OneBatchInfo";

export class GCA_Config {
    static MaxBatchCountLittle: number = 4;
    static LittleGCValue: number = 0.7;//little空袭率达到多少，重新压缩资源
    static MaxBatchCountSome: number = 32;
    static SomeGCValue: number = 0.5;//some空袭率达到多少，重新压缩资源
    static MaxBatchCountQuit: number = 128;
    static QuitGCValue: number = 0.5;//quit空袭率达到多少，重新压缩资源
    static MaxBatchCountLarge: number = 1024;
    static CULLING_WORKGROUP_SIZE = 64;
    static MaxBatchComputeCount: number = 1024;

    static factory: GCA_Factory;
}

export class GCA_Factory {
    create_OneBatch(batchID: number) {
        return new GCA_OneBatchInfo(batchID);
    }

    create_GCA_InstanceRenderElementCollect(type: GCA_BatchType) {
        return new GCA_InstanceRenderElementCollect(type);
    }
}