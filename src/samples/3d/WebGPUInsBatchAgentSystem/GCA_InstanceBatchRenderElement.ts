import { WebGPURenderElement3D } from "laya/RenderDriver/WebGPUDriver/3DRenderPass/WebGPURenderElement3D";

export class GCA_InstanceBatchRenderElement extends WebGPURenderElement3D {

}


export class GCA_CullComputeShader{

    shaderInit(){
        let computeCode = `
        //裁剪Plane的数据
        struct CullPlanes {
           frustum: array<vec4f, 6>
        }
        @group(0) @binding(0) var<uniform> camera:CullPlanes;
        
        struct CameraUniforms {
           frustum: array<vec4f, 6>
        }
        
        @group(1) @binding(0) var<storage, read> instances: array<mat4x4f>;
        @group(1) @binding(1) var<storage, read> cullPlanes: array<CullPlanes>;
        struct CulledInstances {
          indirectIndex: u32,
          curInsCount:u32,
          instances: array<u32>,
        }
        
        @group(1) @binding(1) var<storage, read_write> culled: array<CulledInstances>;

        struct IndirectArgs {
          drawCount: u32,
          instanceCount: atomic<u32>,
          reserved0: u32,
          reserved1: u32,
          reserved2: u32,
        }
        @group(1) @binding(2) var<storage, read_write> indirectArgs: array<IndirectArgs>;

        `
    }

}