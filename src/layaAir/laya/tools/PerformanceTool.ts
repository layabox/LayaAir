export class PerfTools {
    static begin(block: string) {

    }
    static end(block: string) {

    }
}

export class PerformanceDefine {
    //--------PerformanceGlobalDefine--------
    static T_FPS: string;
    //upload uniform count
    static C_UniformBufferUploadCount: string;//GPUEngineStatisticsInfo
    //buffer change count
    static C_GeometryBufferUploadCount: string;//GPUEngineStatisticsInfo
    //overdraw
    static C_overdraw: string; //TODO
    //triangle count
    static C_trangleCount: string;//GPUEngineStatisticsInfo
    //drawCall
    static C_SetRenderPassCount: string;//GPUEngineStatisticsInfo
    static C_DrawCallCount: string;//GPUEngineStatisticsInfo
    static C_Instancing_DrawCallCount: string;//GPUEngineStatisticsInfo
    static C_TransDrawCall: string;//Stat.transdrawcall     
    static C_OpaqueDrawCall: string;//Stat.opaqueDrawCall   
    static C_DepthCastDrawCall: string;//Stat.depthCastDrawCall 
    static C_ShadowDrawCall:string;//Stat.shadowMapDrawCall
    //shader compile
    static C_ShaderCompile: string;//GPUEngineStatisticsInfo
    static T_ShaderCompile: string;//GPUEngineStatisticsInfo
    //Memory
    static M_GPUBuffer: string;//GPUEngineStatisticsInfo
    static M_VertexBuffer: string;//GPUEngineStatisticsInfo
    static M_IndexBuffer: string;//GPUEngineStatisticsInfo
    static M_UniformBlockBuffer: string;//GPUEngineStatisticsInfo
    static RC_GPUBuffer: string;//GPUEngineStatisticsInfo
    static RC_VertexBuffer: string;//GPUEngineStatisticsInfo
    static RC_IndexBuffer: string;//GPUEngineStatisticsInfo
    static RC_UniformBlockBuffer: string;//GPUEngineStatisticsInfo
    //Texture
    static M_ALLTexture: string;//GPUEngineStatisticsInfo
    static M_Texture2D: string;//GPUEngineStatisticsInfo
    static M_TextureCube: string;//GPUEngineStatisticsInfo
    static M_Texture3D: string;//GPUEngineStatisticsInfo
    static M_Texture2DArray: string;//GPUEngineStatisticsInfo
    static RC_ALLTexture: string;//GPUEngineStatisticsInfo
    static RC_Texture2D: string;//GPUEngineStatisticsInfo
    static RC_TextureCube: string;//GPUEngineStatisticsInfo
    static RC_Texture3D: string;//GPUEngineStatisticsInfo
    static RC_Texture2DArray: string;//GPUEngineStatisticsInfo
    static M_ALLRenderTexture: string;//GPUEngineStatisticsInfo
    static RC_ALLRenderTexture: string;//GPUEngineStatisticsInfo
    //--------Performance3DRenderDefine--------
    //render module time
    static T_CameraRender: string;//Stat.renderPassStatArray
    static T_Render_OpaqueRender: string;//Stat.renderPassStatArray
    static T_Render_TransparentRender: string;//Stat.renderPassStatArray
    static T_Render_PostProcess: string;//Stat.renderPassStatArray
    static T_Render_CameraEventCMD: string;//Stat.renderPassStatArray
    static T_Render_ShadowPassMode: string;//Stat.renderPassStatArray
    static T_Render_CameraOtherDest: string;//Stat.renderPassStatArray
    static T_RenderPreUpdate: string;//Stat.renderPassStatArray
    static T_CameraMainCull: string;//Stat.renderPassStatArray
    static T_ShadowMapCull: string;//Stat.renderPassStatArray
    //Volume TODO
    //OtherSceneManager TODO
    //render type time
    static T_OnlyMeshRender: string;//Stat.renderPassStatArray
    static T_OnlySkinnedMeshRender: string;//Stat.renderPassStatArray
    static T_OnlyShurikenParticleRender: string;//Stat.renderPassStatArray
    static T_OtherRender: string;//Stat.renderPassStatArray
    //render count
    static C_Sprite3DCount: string;//Stat.sprite3DCount
    static C_BaseRenderCount: string;//Stat.renderNode
    static C_MeshRenderCount: string;//Stat.meshRenderNode
    static C_SkinnedMeshRenderCount: string;//Stat.skinRenderNode
    static C_ShurikenParticleRenderCount: string;//Stat.ParticleRenderNode
    //Animator
    static T_AnimatorUpdate: string;
    static T_SkinBoneUpdate: string;
    static T_ShurikenUpdate: string;
    //--------Performance3DPhysicsDefine--------
    static T_Physics_Simulation: string;
    static T_Physics_UpdateNode: string;
    static T_PhysicsEvent: string;
    static C_PhysicsEventCount: string;
    static T_PhysicsCollider: string;
    static T_PhysicsTrigger: string;
    static T_PhysicsColliderEnter: string;
    static T_PhysicsColliderExit: string;
    static T_PhysicsColliderStay: string;
    static T_PhysicsTriggerEnter: string;
    static T_PhysicsTriggerExit: string;
    static T_PhysicsTriggerStay: string;
    static C_PhysicaDynamicRigidBody: string;
    static C_PhysicaStaticRigidBody: string;
    static C_PhysicaKinematicRigidBody: string;
    static C_PhysicaCharacterController: string;
    static C_PhysicsJoint: string;
    //--------PerformanceLoadDefine--------
    static T_LoadResourceTime: string;//Loader.LoaderStat_LoadResourceTime
    static C_LoadResourceCount: string;//Loader.LoaderStat_LoaderResourceCount
    static C_LoadRequestCount: string;//Loader.LoaderStat_LoadRequestCount
    static T_LoadRequestTime:string//Loader.LoaderStat_LoadRequestTime
    //--------Performance2DRenderDefine--------
    static T_UITime: string;
    static C_UICount: string;
    static C_DrawCount: string;
    static T_UIRender: string;
    //--------Performance2DPhysicsDefine--------
}
(window as any).PerformanceDefine = PerformanceDefine;

/**
 * 性能统计开始
 * @param block 统计标识（例如：PerformanceDefine.SCENE3D_RENDER）
 * @constructor
 */
export function PERF_BEGIN(block: string): void {
    PerfTools.begin(block);
}
(window as any).PERF_BEGIN = PERF_BEGIN;
/**
 * 性能统计结束
 * @param block 统计标识（例如：PerformanceDefine.SCENE3D_RENDER）
 * @constructor
 */
export function PERF_END(block: string): void {
    PerfTools.end(block);
}

(window as any).PERF_BEGIN = PERF_END;


export function PERF_FRAMECLEAR() {
    //清空上一帧的统计数据
    //除了M和RC的统计数据，其他的都需要清空
}
(window as any).PERF_FRAMECLEAR = PERF_FRAMECLEAR;
