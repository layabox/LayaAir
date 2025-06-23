import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { GCA_BatchType } from "./GCA_InsBatchAgent";
import { GCA_InstanceRenderElementCollect } from "./GCA_InstanceRenderElementCollect";
import { GCA_OneBatchInfo } from "./GCA_OneBatchInfo";
import { GCA_BatchRenderElement } from "./GCA_BatchRenderElement";
import { GCA_BatchBundleElement } from "./GCA_BundleRenderElement";

export class GCA_Config {
    static MaxBatchCountLittle: number = 4;
    static LittleGCValue: number = 0.7;//little空袭率达到多少，重新压缩资源
    static MaxBatchCountSome: number = 16;
    static SomeGCValue: number = 0.5;//some空袭率达到多少，重新压缩资源
    static MaxBatchCountQuit: number = 128;
    static QuitGCValue: number = 0.5;//quit空袭率达到多少，重新压缩资源
    static MaxBatchCountLarge: number = 2048;
    static CULLING_WORKGROUP_SIZE = 64;
    static MaxBatchComputeCount: number = 2048;
    static EnableRenderBundle: boolean = true;
    static lodConfig: number[][];

    static factory: GCA_BaseFactory;

    static init() {
        GCA_OneBatchInfo.GCA_StorageBuffer = Shader3D.getDefineByName("GCA_StorageBuffer");
    }
}

export class GCA_BaseFactory {
    create_OneBatch(batchID: number) {
        return new GCA_OneBatchInfo(batchID);
    }

    create_GCA_InstanceRenderElementCollect(type: GCA_BatchType) {
        return GCA_InstanceRenderElementCollect.getFromPool(type);
    }

    release_GCA_InstanceRenderElementCollect(instance: GCA_InstanceRenderElementCollect) {
        GCA_InstanceRenderElementCollect.releaseToPool(instance);
    }

    clear_Pool_InstanceRenderElementCollect() {
        let map = GCA_InstanceRenderElementCollect._poolMap;
        for (var [key, collects] of map) {
            if (!collects)
                continue;
            for (var i = 0; i < collects.length; i++) {
                let collect = collects[i];
                collect.destroy();
            }
        }
    }

    create_GCA_BatchRenderELement() {
        return new GCA_BatchRenderElement();
    }

    create_GCA_BundleRenderElement() {
        return new GCA_BatchBundleElement();
    }
}