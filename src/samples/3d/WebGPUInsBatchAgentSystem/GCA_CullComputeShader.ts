import { LayaGL } from "laya/layagl/LayaGL";
import { ComputeShader } from "laya/RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeShader";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { GCA_Config } from "./GCA_Config";
import { ShaderDataType } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";

export class GCA_CullComputeShader {
  static computeshaderCodeInit(blockCount: number) {
    let computeCode = `
        //裁剪Plane的数据
        struct Plane {
            normal: vec3<f32>,  // 法向量 (a, b, c)
            distance: f32,      // 距离 d
        }

        @group(0) @binding(0) var<uniform> cullPlanes: array<vec4<f32>, 6>;
       
        struct AABB {
            min: vec4<f32>,//x,y,z 表示min,w大于0 表示这个地方的数据为null,裁剪直接返回false
            max: vec4<f32>,
        }
        @group(1) @binding(0) var<storage, read> aabbs: array<AABB>;
        
        
        struct CulledInstances {
          indirectIndex: u32,
          curInsCount:u32,//当前组内实例数量,必须小于BlockCount
          instancesIndexArray: array<u32>,//裁剪通过的id放入这里
        }
        
        @group(1) @binding(1) var<storage, read_write> culled: array<u32>;
        

        struct IndirectArgs {
          drawCount: u32,
          instanceCount: atomic<u32>,//instance渲染几个
          reserved0: u32,
          reserved1: u32,
          reserved2: u32,
        }
        @group(1) @binding(2) var<storage, read_write> indirectArgs: array<IndirectArgs>;


        fn distanceToPlane(point: vec3<f32>, plane: Plane) -> f32 {
           return dot(plane.normal, point) + plane.distance;
        }

        // 检查AABB是否与平面相交或在平面正面
        fn isAABBInFrontOfPlane(aabb: AABB, plane: Plane) -> bool {
            // 计算AABB的中心点
            let center = (aabb.min.xyz + aabb.max.xyz) * 0.5;
            
            // 计算AABB的半尺寸
            let halfSize = (aabb.max.xyz - aabb.min.xyz) * 0.5;
            
            // 计算AABB在平面法向量上的投影半径
            let projectionRadius = dot(abs(plane.normal), halfSize);
            
            // 计算中心点到平面的距离
            let distanceToCenter = distanceToPlane(center, plane);
            
            // 如果距离大于负的投影半径,则AABB至少部分在平面正面
            return distanceToCenter > -projectionRadius;
        }

        fn isAABBVisible(aabb: AABB) -> bool {
        // 遍历所有cull planes
          if(aabb.min.w > 0.0){
            return false;
          }
          for (var i = 0u; i < 6u; i = i + 1u) {
              // 如果AABB完全在任何一个平面的背面,则被剔除
              let cullPlane = Plane(cullPlanes[i].xyz, cullPlanes[i].w);
              if (!isAABBInFrontOfPlane(aabb, cullPlane)) {
                  return false;
              }
          }
          return true;
        }


         @compute @workgroup_size(${GCA_Config.CULLING_WORKGROUP_SIZE})
        fn computeMain(@builtin(global_invocation_id) gloablId: vec3u) {
          var blockCount: u32 = ${blockCount};  
          let instanceIndex = gloablId.x;
          if (instanceIndex >= ${GCA_Config.MaxBatchComputeCount}) {//大于最大的裁剪数 直接退出
            return;
          }
          let blockIndex = instanceIndex / blockCount;//计算当前的blockIndex

          let blockInstanceOffset = blockIndex * (blockCount + 2);//计算当前的blockInstanceOffset
          if(culled[blockInstanceOffset + 1] <= (instanceIndex-blockCount*blockIndex)){
            return;
          }

          if (!isAABBVisible(aabbs[instanceIndex])) {
            return;
          }

          let culledIndex = atomicAdd(&indirectArgs[culled[blockInstanceOffset]].instanceCount, 1u);
          culled[blockInstanceOffset+2+culledIndex] = instanceIndex;
        }
        `

    let uniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("GCA_CullCompute_CullInfo");
    uniformMap.addShaderUniformArray(Shader3D.propertyNameToID("cullPlanes"), "cullPlanes", ShaderDataType.Vector4, 6);


    let uniformMap1 = LayaGL.renderDeviceFactory.createGlobalUniformMap("GCA_CullCompute_BufferInfoF");
    uniformMap1.addShaderUniform(Shader3D.propertyNameToID("aabbs"), "aabbs", ShaderDataType.ReadOnlyDeviceBuffer);
    uniformMap1.addShaderUniform(Shader3D.propertyNameToID("culled"), "culled", ShaderDataType.DeviceBuffer);
    uniformMap1.addShaderUniform(Shader3D.propertyNameToID("indirectArgs"), "indirectArgs", ShaderDataType.DeviceBuffer);

    let computeShader = ComputeShader.createComputeShader(`GCA_CullComputeShader_${blockCount}`, computeCode, [uniformMap, uniformMap1]);

    return computeShader;
  }

  static clearBufferComputeShaderInit() {
    let clearBufferComputeCode = `
     struct IndirectArgs {
          drawCount: u32,
          instanceCount: atomic<u32>,//instance渲染几个
          reserved0: u32,
          reserved1: u32,
          reserved2: u32,
        }
     @group(0) @binding(0) var<storage, read_write> indirectArgs: array<IndirectArgs>;
      @group(0) @binding(1) var<storage, read_write> culled: array<u32>;
      @group(0) @binding(2) var<storage, read> clearBuffer: array<u32>;
    @compute @workgroup_size(1)
      fn computeMain(@builtin(global_invocation_id) gloablId: vec3u) {
        indirectArgs[gloablId.x].instanceCount = 0u;
        culled[gloablId.x*blockCount+2+1] = clearBuffer[gloablId.x];
      }
   `
    let uniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("GCA_CullCompute_clearBuffer");
    uniformMap.addShaderUniform(Shader3D.propertyNameToID("indirectArgs"), "indirectArgs", ShaderDataType.DeviceBuffer);
    uniformMap.addShaderUniform(Shader3D.propertyNameToID("culled"), "culled", ShaderDataType.DeviceBuffer);
    uniformMap.addShaderUniform(Shader3D.propertyNameToID("clearBuffer"), "clearBuffer", ShaderDataType.ReadOnlyDeviceBuffer);
    let computeShader = ComputeShader.createComputeShader(`GCA_clearBufferShader`, clearBufferComputeCode, [uniformMap]);
    return computeShader;
  }
}