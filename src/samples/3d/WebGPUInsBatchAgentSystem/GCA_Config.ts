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
}

export class GCA_Stat {
    
}