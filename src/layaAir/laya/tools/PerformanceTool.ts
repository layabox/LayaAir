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
    static C_TransDrawCall: string;//Stat.transdrawcall     //TODO
    static C_OpaqueDrawCall :string;//Stat.opaqueDrawCall   //TODO
    static C_DepthCastDrawCall:string;//Stat.depthCastDrawCall //TODO
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
    static T_CameraRender: string;
    static T_Render_OpaqueRender: string;
    static T_Render_TransparentRender: string;
    static T_Render_PostProcess: string;
    static T_Render_CameraEventCMD: string;
    static T_Render_ShadowPassMode: string;
    static T_Render_CameraOtherDest: string;
    static T_RenderPreUpdate: string;//TODO
    //Volume TODO
    //OtherSceneManager TODO
    //render type time
    static T_OnlyMeshRender: string;//TODO
    static T_OnlySkinnedMeshRender: string;//TODO
    static T_OnlyShurikenParticleRender: string;//TODO
    //render count
    static C_Sprite3DCount: string;//Stat.sprite3DCount
    static C_BaseRenderCount: string;//Stat.renderNode
    static C_MeshRenderCount: string;//Stat.meshRenderNode
    static C_SkinnedMeshRenderCount: string;//Stat.skinRenderNode
    static C_ShurikenParticleRenderCount: string;//Stat.ParticleRenderNode
    //Animator
    static T_AnimatorUpdate: string;
    static T_SkinBoneUpdate: string;
    static T_shurikenUpdate: string;
    //--------Performance3DPhysicsDefine--------
    static T_Physics_Simulation: string;
    static T_Physics_UpdateNode:string;
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
    static T_LoadResourceTime: string;//TODO
    static C_LoadResourceCount: string;//TODO
    static C_LoadRequestCount: string;//TODO
    //--------Performance2DRenderDefine--------
    static T_UITime: string;
    static C_UICount: string;
    static C_DrawCount: string;
    static T_UIRender: string;
    //--------Performance2DPhysicsDefine--------
}
(window as any).PerformanceDefine = PerformanceDefine;

export class ReplaceMethod {
    clz: any;
    func: Function;
    tag: string;
}

export function getReplaceMethod(): ReplaceMethod[] {
    let replaceMethods: ReplaceMethod[] = [];
    // replaceMethods.push({ clz: Camera,func: Camera.prototype.render, tag: PerformanceDefine.T_CameraRender });
    // replaceMethods.push({ clz: SkinnedMeshRenderer,func: SkinnedMeshRenderer.prototype.renderUpdate, tag: PerformanceDefine.T_SkinBoneUpdate });
    // replaceMethods.push({ clz: WebGLForwardAddClusterRP,func: WebGLForwardAddClusterRP.prototype["_transparentListRender"], tag: PerformanceDefine.T_Render_TransparentRender });
    return replaceMethods;
}
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

/**
 * 性能统计装饰器，数量统计
 * @param block 统计标识（例如：PerformanceDefine.SCENE3D_RENDER）
 * @constructor
 */
export function PERT_COUNT(block: string, count: number) :MethodDecorator{
    //增加或者减少统计的数量 TODO
    return null;
}
(window as any).PERT_COUNT = PERT_COUNT;
/**
 * 性能统计装饰器，方法调用时间
 * @param block 统计标识（例如：PerformanceDefine.SCENE3D_RENDER）
 * @constructor
 */
export function PERF_STAT(block: string): MethodDecorator {
    return function (target: any, key: string | symbol, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const _block = (PerformanceDefine as any)[block];
            if (!_block) {
                return originalMethod.apply(this, args);
            } else {
                PerfTools.begin(_block);
                const result = originalMethod.apply(this, args);
                PerfTools.end(_block);
                return result;
            }
        }
        return descriptor;
    }
}
(window as any).PERF_STAT = PERF_STAT;

export function PERF_FRAMECLEAR() {
    //清空上一帧的统计数据
    //除了M和RC的统计数据，其他的都需要清空
}
(window as any).PERF_FRAMECLEAR = PERF_FRAMECLEAR;
