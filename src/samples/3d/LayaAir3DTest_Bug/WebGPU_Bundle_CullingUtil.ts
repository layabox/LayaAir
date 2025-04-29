import { Color } from "laya/maths/Color";
import { Vector4 } from "laya/maths/Vector4";
import { ShaderDataType } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Shader3D, ShaderFeatureType } from "laya/RenderEngine/RenderShader/Shader3D";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { WebGPU_Bundle_Culling } from "./WebGPU_Bundle_Culling";
import { WebGPURenderElement3D } from "laya/RenderDriver/WebGPUDriver/3DRenderPass/WebGPURenderElement3D";
import { WebGPURenderContext3D } from "laya/RenderDriver/WebGPUDriver/3DRenderPass/WebGPURenderContext3D";
import { WebGPURenderCommandEncoder } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderBundle } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { BaseRender } from "laya/d3/core/render/BaseRender";
import { Vector3 } from "laya/maths/Vector3";
import { Bounds } from "laya/d3/math/Bounds";
import { RenderContext3D } from "laya/d3/core/render/RenderContext3D";
import { Plane } from "laya/d3/math/Plane";
import { LayaGL } from "laya/layagl/LayaGL";
import { ComputeShader } from "laya/RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeShader";
import { ComputeCommandBuffer } from "laya/RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeCommandBuffer";
import { WebGPUShaderData } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUShaderInstance";
import { WebGPUBindGroup, WebGPUBindGroupHelper } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUBindGroupHelper";
import { WebGPURenderEngine } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPURenderEngine";
import { Stat } from "laya/utils/Stat";
import { IRenderContext3D } from "laya/RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { Camera } from "laya/d3/core/Camera";
import { BaseCamera } from "laya/d3/core/BaseCamera";

export class WebGPU_Bundle_CullingUtil {

    //config
    //每个renderelement渲染多少物体
    static MAX_INSTANCES_PER_DRAWABLE = 1000;//PC 1000
    //每个computeshader  计算组是多少
    static CULLING_WORKGROUP_SIZE = 64;
    //是否使用调试视角
    static useoverHeadView: boolean = true;
    //是否使用绑定命令的方案渲染
    static useRenderBundle: boolean = true;

    static Cull_RenderBundle_ComputeShader: ComputeShader;
    static initShader() {

        let uniformMap = {

            "u_color": ShaderDataType.Color,
        };

        let defaultValue = {
            "u_color": Color.WHITE,
        }

        let vsCode = `
        #include "Camera.glsl";

        #ifdef STORAGEBUFFER
            layout(set = 2, binding = 0) readonly buffer Instances {
                mat4 instances[];
            };

            struct CulledInstances {
                uint indirectIndex;
                uint instances[${WebGPU_Bundle_CullingUtil.MAX_INSTANCES_PER_DRAWABLE}];  // 动态数组
            };
            layout(set = 2, binding = 1) readonly buffer Culled {
                CulledInstances culled;
            };
        #endif

        varying vec3 v_Normal;

        void main()
        {
            vec4 position = a_Position;
            vec3 normal = a_Normal.xyz;
            vec2 uv = a_Texcoord0;
            uint Instanceindex = gl_InstanceIndex;
            uint modelIndex = culled.instances[Instanceindex];
            mat4 worldmat = instances[modelIndex];

            vec3 normalWS = normalize((worldmat * vec4(a_Position.xyz, 0.0)).xyz);
            v_Normal = normalWS;
            vec3 positionWS = (worldmat*position).xyz;
            gl_Position=getPositionCS(positionWS);
            gl_Position=remapPositionZ(gl_Position);
        }
        `;

        let fsCode = `
        varying vec3 v_Normal;
        
        void main()
        {
            vec4 color = u_color;
            vec3 lightDir = vec3(0.25, 0.5, 1.0);
            vec3 lightColor = vec3(1, 1, 1);
            vec3 ambientColor = vec3(0.03, 0.03, 0.03);

            vec3 L = normalize(lightDir);
            float NDotL = max(dot(v_Normal, L), 0.0);
            vec3 surfaceColor = (u_color.rgb * ambientColor) + (u_color.rgb * NDotL);

            gl_FragColor = vec4(surfaceColor,1.0);
        }
        `;
        let shader = Shader3D.add("colorShader", true, false);
        shader.shaderType = ShaderFeatureType.D3;
        let subShader = new SubShader(SubShader.DefaultAttributeMap, uniformMap, defaultValue);
        shader.addSubShader(subShader);
        let forwardPass = subShader.addShaderPass(vsCode, fsCode);
    }

    static createComputeShader() {
        //创建ComputeShader
        let code = `
        struct CameraUniforms {
           frustum: array<vec4f, 6>
        }
        @group(0) @binding(0) var<uniform> camera:CameraUniforms;
        
        @group(1) @binding(0) var<storage, read> instances: array<mat4x4f>;
        struct CulledInstances {
          indirectIndex: u32,
          instances: array<u32>,
        }
        
        @group(1) @binding(1) var<storage, read_write> culled: CulledInstances;

        struct IndirectArgs {
          drawCount: u32,
          instanceCount: atomic<u32>,
          reserved0: u32,
          reserved1: u32,
          reserved2: u32,
        }
        @group(1) @binding(2) var<storage, read_write> indirectArgs: array<IndirectArgs>;


        fn isVisible(instanceIndex: u32) -> bool {
          let model = instances[instanceIndex];
          let pos = model * vec4(0, 0, 0, 1);
          let radius = 1.0; // Just fudging it. None of the meshes should be bigger than this.

          for (var i = 0; i < 6; i++) {
            if (dot(camera.frustum[i], pos) < -radius) {
              return false;
            }
          }
          return true;
        }

        @compute @workgroup_size(${WebGPU_Bundle_CullingUtil.CULLING_WORKGROUP_SIZE})
        fn computeMain(@builtin(global_invocation_id) gloablId: vec3u) {
          let instanceIndex = gloablId.x;
          if (instanceIndex >= ${WebGPU_Bundle_CullingUtil.MAX_INSTANCES_PER_DRAWABLE}) {
            return;
          }

          if (!isVisible(instanceIndex)) { return; }

          let culledIndex = atomicAdd(&indirectArgs[culled.indirectIndex].instanceCount, 1u);
          culled.instances[culledIndex] = instanceIndex;
        }
      `;
        let uniformCommandMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("cameraCull");
        uniformCommandMap.addShaderUniformArray(Shader3D.propertyNameToID("frustum"), "frustum", ShaderDataType.Vector4, 6);

        let uniformCommandMap2 = LayaGL.renderDeviceFactory.createGlobalUniformMap("CullDataGroup");
        uniformCommandMap2.addShaderUniform(Shader3D.propertyNameToID("instances"), "instances", ShaderDataType.ReadOnlyDeviceBuffer);
        uniformCommandMap2.addShaderUniform(Shader3D.propertyNameToID("culled"), "culled", ShaderDataType.DeviceBuffer);
        uniformCommandMap2.addShaderUniform(Shader3D.propertyNameToID("indirectArgs"), "indirectArgs", ShaderDataType.DeviceBuffer);

        WebGPU_Bundle_CullingUtil.Cull_RenderBundle_ComputeShader = ComputeShader.createComputeShader("cullRenderBundle", code, [uniformCommandMap, uniformCommandMap2]);
    }

    static createCullSpriteCommandMap() {
        const spriteParms = LayaGL.renderDeviceFactory.createGlobalUniformMap("cullSprite");
        spriteParms.addShaderUniform(Shader3D.propertyNameToID("instances"), "instances", ShaderDataType.ReadOnlyDeviceBuffer);
        spriteParms.addShaderUniform(Shader3D.propertyNameToID("culled"), "culled", ShaderDataType.ReadOnlyDeviceBuffer);
    }
}


export class webgpuDrawCullingELement extends WebGPURenderElement3D {
    cullShaderData: WebGPUShaderData;
    constructor() {
        super();
        this.cullShaderData = LayaGL.renderDeviceFactory.createShaderData() as any;
        this.isRender = true;
    }

    _preUpdatePre(context: WebGPURenderContext3D) {
        //编译着色器
        this._compileShader(context);
        // material ubo
        let subShader = this.subShader;
        let matSubBuffer = this.materialShaderData.createSubUniformBuffer("Material", subShader.owner.name, (subShader as any)._uniformMap);
        if (matSubBuffer.needUpload) {
            matSubBuffer.bufferBlock.needUpload();
        }
    }

    _render(context: WebGPURenderContext3D, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        //生成RenderBundle  调用
        let shaders: WebGPUShaderInstance[] = (this._shaderInstances as any).elements;
        if (!this.isRender) {
            return 0;
        }

        for (let j: number = 0, m: number = (this as any)._shaderInstances.length; j < m; j++) {
            if (!shaders[j].complete)
                continue;
            let shaderInstance = shaders[j];
            //TODO 先创建RenderPipeline  后续讨论如何Cache RenderPipeline的方案
            command.setPipeline(this._getWebGPURenderPipeline(shaderInstance, context.destRT, context));  //新建渲染管线
            this._bindGroup(context, shaderInstance, command); //绑定资源组
            this._uploadGeometry(command); //上传几何数据 draw
        }

        return 0;
    }

    /**
      * 绑定资源组
      * @param shaderInstance 
      * @param command 
      * @param bundle 
      */
    protected _bindGroup(context: WebGPURenderContext3D, shaderInstance: WebGPUShaderInstance, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        if (shaderInstance.uniformSetMap.get(0).length > 0) {
            command.setBindGroup(0, context._getSceneBindGroup(shaderInstance._bindCacheKeyPerDraw, shaderInstance));
        }
        if (shaderInstance.uniformSetMap.get(1).length > 0) {
            command.setBindGroup(1, context._cameraBindGroup);
        }
        //if (shaderInstance.uniformSetMap.get(2).length > 0) {//additional & Sprite3D NodeModule
        if (this.owner) {
            let bindgroup = this.getBaseRender3DNodeBindGroup(context, shaderInstance);
            command.setBindGroup(2, bindgroup);
        }
        if (shaderInstance.uniformSetMap.get(3).length > 0) {
            command.setBindGroup(3, this.materialShaderData._createOrGetBindGroupByBindInfoArray("Material", this.subShader.owner.name, shaderInstance, 3, shaderInstance.uniformSetMap.get(3)));
        }
    }

    private bindGroup: Map<number, WebGPUBindGroup> = new Map();

    private getBaseRender3DNodeBindGroup(context: WebGPURenderContext3D, shaderInstance: WebGPUShaderInstance): WebGPUBindGroup {//一帧调用一次
        let recreateBindGroup: boolean = false;
        let bindgroup = this.bindGroup.get((shaderInstance as any)._id);
        let shaderInstanceID = (shaderInstance as any)._id;
        //处理BindGroup
        //判断是否要重新创建BindGroup
        if (!bindgroup) {
            recreateBindGroup = true;
        } else {
            if (bindgroup.isNeedCreate((this.cullShaderData as WebGPUShaderData)._getBindGroupLastUpdateMask(`${this.owner._commonUniformMap[0]}_${shaderInstanceID}`))) {
                recreateBindGroup = true;
            }
        }

        if (recreateBindGroup) {//创建BindGroup
            //creat BindGroup
            let bindGroupArray = shaderInstance.uniformSetMap.get(2);
            //填充bindgroupEntriys
            let shaderData = this.cullShaderData as WebGPUShaderData;
            let bindgroupEntriys: GPUBindGroupEntry[] = [];
            for (var com of this.owner._commonUniformMap) {
                let comMap = LayaGL.renderDeviceFactory.createGlobalUniformMap(com) as any;
                if (comMap._ishasBuffer)
                    shaderData.createSubUniformBuffer(com, com, comMap._idata);
                shaderData.fillBindGroupEntry(com, `${com}_${shaderInstanceID}`, bindgroupEntriys, bindGroupArray);
            }

            let groupLayout: GPUBindGroupLayout = WebGPUBindGroupHelper.createBindGroupEntryLayout(bindGroupArray);
            let bindGroupDescriptor: GPUBindGroupDescriptor = {
                label: "GPUBindGroupDescriptor",
                layout: groupLayout,
                entries: bindgroupEntriys
            };
            let bindGroupgpu = WebGPURenderEngine._instance.getDevice().createBindGroup(bindGroupDescriptor);
            bindgroup = new WebGPUBindGroup();
            bindgroup.gpuRS = bindGroupgpu;
            bindgroup.createMask = Stat.loopCount;
            this.bindGroup.set(shaderInstanceID, bindgroup);
        }
        return bindgroup;
    }
}


export class webgpuRenderBundleElement extends WebGPURenderElement3D {
    private _renderelements: webgpuDrawCullingELement[] = [];
    private _needRecreateRenderBundle: boolean = false;
    private _commadnBundle: WebGPURenderBundle = new WebGPURenderBundle();

    constructor() {
        super();
        this.isRender = true;
        this.materialRenderQueue = 2000;
        this.materialShaderData = new WebGPUShaderData();
    }

    addrenderElement(element: webgpuDrawCullingELement) {
        this._renderelements.push(element);
        this._needRecreateRenderBundle = true;
    }

    _preUpdatePre(context: WebGPURenderContext3D) {
        for (var i = 0; i < this._renderelements.length; i++) {
            this._renderelements[i]._preUpdatePre(context);
        }
    }

    _render(context: WebGPURenderContext3D, command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        if (this._needRecreateRenderBundle) {
            this._commadnBundle.startRender(context.destRT, "renderCullBundle");
            for (var i = 0; i < this._renderelements.length; i++) {
                this._renderelements[i]._render(context, this._commadnBundle);
            }
            this._commadnBundle.finish("renderCullBundle");
            this._needRecreateRenderBundle = false;
        }
        (command as WebGPURenderCommandEncoder).excuteBundle([this._commadnBundle._gpuBundle])
        return 0;
    }
}

export class BundleCullingRender extends BaseRender {

    private _renderelements: webgpuDrawCullingELement[] = [];
    private _renderBundleElement: webgpuRenderBundleElement;
    private elementChange = false;
    private cullPlaneData: Float32Array = new Float32Array(4 * 6);
    computeCommand = new ComputeCommandBuffer();
    private ViewCamera: Camera;
    constructor() {
        super();
        this.geometryBounds = new Bounds(new Vector3(-1000, -1000, -1000), new Vector3(1000, 1000, 1000));
        this.ViewCamera = new Camera(0, 0.1, 500);
        this.ViewCamera.transform.position = new Vector3(0, 200, 0);
        this.ViewCamera.transform.rotationEuler = new Vector3(-90, 0, 0);

    }

    protected _getcommonUniformMap(): Array<string> {
        return ["cullSprite"];
    }

    onEnable(): void {
        if (WebGPU_Bundle_CullingUtil.useRenderBundle) {
            this._renderBundleElement = new webgpuRenderBundleElement();
            this._renderBundleElement.transform = this.owner.transform;
            this._renderBundleElement.renderShaderData = this.renderNode.shaderData as any;
            this._renderBundleElement.owner = this.renderNode as any;
            this.elementChange = true;
        }
    }

    addrenderElement(element: webgpuDrawCullingELement) {
        if (WebGPU_Bundle_CullingUtil.useRenderBundle) {
            this._renderBundleElement.addrenderElement(element);
            element.transform = this.owner.transform;
            element.renderShaderData = this.renderNode.shaderData as any;
            element.owner = this.renderNode as any;
        } else {
            this._renderelements.push(element);
            element.transform = this.owner.transform;
            element.renderShaderData = this.renderNode.shaderData as any;
            element.owner = this.renderNode as any;
            this.elementChange = true;
        }

    }

    _renderUpdate(context: IRenderContext3D): void {
        if (this.elementChange) {
            this._setRenderElements();
        }
        let camera = RenderContext3D._instance.camera;
        let boundFrustum = camera.boundFrustum;

        let fillCullData = (plane: Plane, index: number) => {
            this.cullPlaneData[index] = plane.normal.x;
            this.cullPlaneData[index + 1] = plane.normal.y;
            this.cullPlaneData[index + 2] = plane.normal.z;
            this.cullPlaneData[index + 3] = plane.distance;
        }
        fillCullData(boundFrustum.near, 0);
        fillCullData(boundFrustum.far, 4);
        fillCullData(boundFrustum.left, 8);
        fillCullData(boundFrustum.right, 12);
        fillCullData(boundFrustum.top, 16);
        fillCullData(boundFrustum.bottom, 20);
        this.renderNode.shaderData.setBuffer(Shader3D.propertyNameToID("frustum"), this.cullPlaneData);
        this.computeCommand.executeCMDs();

        if (WebGPU_Bundle_CullingUtil.useoverHeadView) {
            (camera as any)._shaderValues.setMatrix4x4((BaseCamera as any).VIEWPROJECTMATRIX, this.ViewCamera.projectionViewMatrix);
        }
    }

    protected _setRenderElements() {
        if (WebGPU_Bundle_CullingUtil.useRenderBundle)
            this.renderNode.setRenderelements([this._renderBundleElement]);
        else
            this.renderNode.setRenderelements(this._renderelements as any);
        this.elementChange = false;
    }
}