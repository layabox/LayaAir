/**
description
 WebGPU Indirect Draw Demo - GPU Frustum Culling with Compute Shader

 This demo demonstrates:
 1. Using ComputeShader for GPU-based frustum culling
 2. Indirect Draw for efficient GPU-driven rendering
 3. Storage buffers for instance data management

 It renders 4 types of meshes (cube, sphere, cylinder, cone) x 14 colors = 56 drawables,
 each with up to MAX_INSTANCES_PER_DRAWABLE instances, using GPU compute shader for
 frustum culling and indirect draw for rendering.
 */
import { Laya } from "Laya";
import { BaseCamera } from "laya/d3/core/BaseCamera";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { BaseRender } from "laya/d3/core/render/BaseRender";
import { RenderContext3D } from "laya/d3/core/render/RenderContext3D";
import { Bounds } from "laya/d3/math/Bounds";
import { Plane } from "laya/d3/math/Plane";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { LayaGL } from "laya/layagl/LayaGL";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Quaternion } from "laya/maths/Quaternion";
import { Vector3 } from "laya/maths/Vector3";
import { DrawType } from "laya/RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "laya/RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "laya/RenderEngine/RenderEnum/RenderPologyMode";
import { Shader3D, ShaderFeatureType } from "laya/RenderEngine/RenderShader/Shader3D";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { IRenderContext3D } from "laya/RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { ComputeCommandBuffer } from "laya/RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeCommandBuffer";
import { ComputeShader } from "laya/RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeShader";
import { EDeviceBufferUsage, IDeviceBuffer } from "laya/RenderDriver/DriverDesign/RenderDevice/IDeviceBuffer";
import { ShaderDataType } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Material, MaterialRenderMode } from "laya/resource/Material";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../../../3d/common/CameraMoveScript";
import { Laya3D } from "Laya3D";
import { Laya3DRender } from "laya/d3/RenderObjs/Laya3DRender";


//=============================================================================
// Config
//=============================================================================

/** max instances per drawable element */
const MAX_INSTANCES_PER_DRAWABLE = 1000;
/** compute shader workgroup size */
const CULLING_WORKGROUP_SIZE = 64;
/** whether to use an overhead camera view for debug */
const USE_OVERHEAD_VIEW = true;

//=============================================================================
// Shader initialization (no external resources)
//=============================================================================

let cullComputeShader: ComputeShader;

function initColorShader(): void {
    let uniformMap: Record<string, ShaderDataType> = {
        "u_color": ShaderDataType.Color,
    };
    let defaultValue: Record<string, any> = {
        "u_color": Color.WHITE,
    };

    let vsCode = `
    #include "Camera.glsl";

    #ifdef STORAGEBUFFER
        layout(set = 2, binding = 0) readonly buffer Instances {
            mat4 instances[];
        };

        struct CulledInstances {
            uint indirectIndex;
            uint instances[${MAX_INSTANCES_PER_DRAWABLE}];
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
    subShader.addShaderPass(vsCode, fsCode);
}

function initComputeShader(): void {
    // Compute shader must be GLSL format (engine pipeline: GLSL -> SPIR-V -> WGSL)
    // Note: `frustum` uniform is auto-declared from the uniform map below
    let code = `
readonly buffer instances
{
    mat4 models[];
};

buffer culled
{
    uint indirectIndex;
    uint culledIndices[];
};

struct IndirectArgs {
    uint drawCount;
    uint instanceCount;
    uint reserved0;
    uint reserved1;
    uint reserved2;
};

buffer indirectArgs
{
    IndirectArgs args[];
};

layout(local_size_x = ${CULLING_WORKGROUP_SIZE}, local_size_y = 1, local_size_z = 1) in;

bool isVisible(uint instanceIndex)
{
    mat4 model = models[instanceIndex];
    vec4 pos = model * vec4(0.0, 0.0, 0.0, 1.0);
    float radius = 1.0;

    for (int i = 0; i < 6; i++) {
        if (dot(frustum[i], pos) < -radius) {
            return false;
        }
    }
    return true;
}

void main()
{
    uint instanceIndex = gl_LocalInvocationID.x + gl_WorkGroupID.x * ${CULLING_WORKGROUP_SIZE}u;
    if (instanceIndex >= ${MAX_INSTANCES_PER_DRAWABLE}u) {
        return;
    }

    if (!isVisible(instanceIndex)) {
        return;
    }

    uint culledIndex = atomicAdd(args[indirectIndex].instanceCount, 1u);
    culledIndices[culledIndex] = instanceIndex;
}
    `;

    let uniformCommandMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("cameraCull");
    uniformCommandMap.addShaderUniformArray(Shader3D.propertyNameToID("frustum"), "frustum", ShaderDataType.Vector4, 6);

    let uniformCommandMap2 = LayaGL.renderDeviceFactory.createGlobalUniformMap("CullDataGroup");
    uniformCommandMap2.addShaderUniform(Shader3D.propertyNameToID("instances"), "instances", ShaderDataType.ReadOnlyDeviceBuffer);
    uniformCommandMap2.addShaderUniform(Shader3D.propertyNameToID("culled"), "culled", ShaderDataType.DeviceBuffer);
    uniformCommandMap2.addShaderUniform(Shader3D.propertyNameToID("indirectArgs"), "indirectArgs", ShaderDataType.DeviceBuffer);

    cullComputeShader = ComputeShader.createComputeShader("cullRenderBundle", code, [uniformCommandMap, uniformCommandMap2]);
}

function initCullSpriteCommandMap(): void {
    const spriteParms = LayaGL.renderDeviceFactory.createGlobalUniformMap("cullSprite");
    spriteParms.addShaderUniform(Shader3D.propertyNameToID("instances"), "instances", ShaderDataType.ReadOnlyDeviceBuffer);
    spriteParms.addShaderUniform(Shader3D.propertyNameToID("culled"), "culled", ShaderDataType.ReadOnlyDeviceBuffer);
}

//=============================================================================
// BaseRender: one instance per drawable (mesh × material)
//=============================================================================

class IndirectDrawBaseRender extends BaseRender {
    private cullPlaneData: Float32Array = new Float32Array(4 * 6);
    computeCommand: ComputeCommandBuffer;
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

    setup(
        mesh: Mesh,
        material: Material,
        instanceBuffer: IDeviceBuffer,
        cullBuffer: IDeviceBuffer,
        indirectBuffer: IDeviceBuffer,
        drawIndex: number,
    ): void {
        let geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElementIndirect);
        let meshBufferState = mesh.getSubMesh(0).bufferState._deviceBufferState;
        let vertexBuffers = meshBufferState._vertexBuffers.slice();
        let indexBuffer = meshBufferState._bindedIndexBuffer;
        geometry.drawType = DrawType.DrawElementIndirect;
        geometry.bufferState = LayaGL.renderDeviceFactory.createBufferState();
        geometry.bufferState.applyState(vertexBuffers, indexBuffer);
        geometry.indexFormat = IndexFormat.UInt16;
        geometry.setIndirectDrawBuffer(indirectBuffer, drawIndex * 20);

        let element = Laya3DRender.Render3DPassFactory.createRenderElement3D();
        element.isRender = true;
        element.materialShaderData = material.shaderData;
        element.materialId = material.id;
        element.subShader = material.shader.getSubShaderAt(0);
        element.geometry = geometry;
        element.transform = this.owner.transform;
        element.renderShaderData = this.renderNode.shaderData;
        element.owner = this.renderNode;

        this.renderNode.setRenderelements([element]);

        let shaderData = this.renderNode.shaderData;
        shaderData.setDeviceBuffer(Shader3D.propertyNameToID("instances"), instanceBuffer as any);
        shaderData.setDeviceBuffer(Shader3D.propertyNameToID("culled"), cullBuffer as any);
        shaderData.setDeviceBuffer(Shader3D.propertyNameToID("indirectArgs"), indirectBuffer as any);

        this.computeCommand = new ComputeCommandBuffer();
        this.computeCommand.addClearBufferCommand(indirectBuffer, drawIndex * 20 + 4, 4);
        let shaderDefine = LayaGL.unitRenderModuleDataFactory.createDefineDatas();
        this.computeCommand.addDispatchCommand(
            cullComputeShader,
            shaderDefine,
            [shaderData, shaderData],
            new Vector3(Math.ceil(MAX_INSTANCES_PER_DRAWABLE / CULLING_WORKGROUP_SIZE), 1, 1)
        );
    }

    _renderUpdate(context: IRenderContext3D): void {
        let camera = RenderContext3D._instance.camera;
        let boundFrustum = camera.boundFrustum;

        let fillCullData = (plane: Plane, index: number) => {
            this.cullPlaneData[index] = plane.normal.x;
            this.cullPlaneData[index + 1] = plane.normal.y;
            this.cullPlaneData[index + 2] = plane.normal.z;
            this.cullPlaneData[index + 3] = plane.distance;
        };
        fillCullData(boundFrustum.near, 0);
        fillCullData(boundFrustum.far, 4);
        fillCullData(boundFrustum.left, 8);
        fillCullData(boundFrustum.right, 12);
        fillCullData(boundFrustum.top, 16);
        fillCullData(boundFrustum.bottom, 20);

        this.renderNode.shaderData.setBuffer(Shader3D.propertyNameToID("frustum"), this.cullPlaneData);
        this.computeCommand.executeCMDs();

        if (USE_OVERHEAD_VIEW) {
            (camera as any)._shaderValues.setMatrix4x4((BaseCamera as any).VIEWPROJECTMATRIX, this.ViewCamera.projectionViewMatrix);
        }
    }
}

//=============================================================================
// Main demo class
//=============================================================================

export class IndirectDrawDemo {

    private static tempFloatArray: Float32Array = new Float32Array(MAX_INSTANCES_PER_DRAWABLE * 16);
    private static tempVec0: Vector3 = new Vector3();
    private static tempVec1: Vector3 = new Vector3();
    private static tempQuat: Quaternion = new Quaternion();
    private static tempMat: Matrix4x4 = new Matrix4x4();

    private drawElementCount: number = 0;
    private meshArray: Mesh[] = [];
    private materialArray: Material[] = [];
    private instanceBuffers: IDeviceBuffer[] = [];
    private indirectDrawBuffer: IDeviceBuffer;
    private indirectCullBuffers: IDeviceBuffer[] = [];

    constructor() {
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Stat.show();

            let scene: Scene3D = Laya.stage.addChild(new Scene3D()) as Scene3D;

            let camera: Camera = scene.addChild(new Camera(0, 0.1, 500)) as Camera;
            camera.transform.translate(new Vector3(0, 0, 0));
            camera.transform.rotate(new Vector3(0, 0, 0), true, false);
            camera.addComponent(CameraMoveScript);
            camera.clearColor = new Color(0.0, 0.0, 0.0, 1.0);

            initCullSpriteCommandMap();
            initColorShader();
            initComputeShader();

            this.createMeshes();
            this.createMaterials();
            this.drawElementCount = this.meshArray.length * this.materialArray.length;

            this.createIndirectDrawBuffer();
            this.createInstanceCullBuffer();
            this.createInstanceDataBuffer();

            this.createDrawables(scene);
        });
    }

    private createMeshes(): void {
        this.meshArray.push(PrimitiveMesh.createBox(1, 1, 1));
        this.meshArray.push(PrimitiveMesh.createSphere(0.5));
        this.meshArray.push(PrimitiveMesh.createCylinder(0.5, 1));
        this.meshArray.push(PrimitiveMesh.createCone(0.5, 1));
    }

    private createMaterials(): void {
        let createMat = (r: number, g: number, b: number): Material => {
            let mat = new Material();
            mat.setShaderName("colorShader");
            mat.materialRenderMode = MaterialRenderMode.RENDERMODE_OPAQUE;
            mat.setColor("u_color", new Color(r, g, b, 1));
            return mat;
        };
        this.materialArray.push(createMat(1, 1, 1));
        this.materialArray.push(createMat(1, 0, 0));
        this.materialArray.push(createMat(0, 1, 0));
        this.materialArray.push(createMat(0, 0, 1));
        this.materialArray.push(createMat(1, 1, 0));
        this.materialArray.push(createMat(1, 0, 1));
        this.materialArray.push(createMat(0, 1, 1));
        this.materialArray.push(createMat(0.5, 0.5, 0.5));
        this.materialArray.push(createMat(0.5, 0, 0));
        this.materialArray.push(createMat(0, 0.5, 0));
        this.materialArray.push(createMat(0, 0, 0.5));
        this.materialArray.push(createMat(0.5, 0.5, 0));
        this.materialArray.push(createMat(0.5, 0, 0.5));
        this.materialArray.push(createMat(0, 0.5, 0.5));
    }

    private createIndirectDrawBuffer(): void {
        let meshCount = this.meshArray.length;
        let usage = EDeviceBufferUsage.INDIRECT | EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST;
        // Each indirect draw command: 5 x uint32 = 20 bytes
        let byteLength = 20 * this.drawElementCount;
        this.indirectDrawBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(usage);
        this.indirectDrawBuffer.setDataLength(byteLength);

        let indirectDrawArray = new Uint32Array(this.drawElementCount * 5);
        for (let i = 0; i < this.materialArray.length; i++) {
            for (let j = 0; j < meshCount; j++) {
                let index = (i * meshCount + j) * 5;
                let mesh = this.meshArray[j];
                indirectDrawArray[index] = mesh.getSubMesh(0).indexCount;       // indexCount
                indirectDrawArray[index + 1] = MAX_INSTANCES_PER_DRAWABLE;       // instanceCount (will be overwritten by compute)
                indirectDrawArray[index + 2] = 0;                                // firstIndex
                // index + 3: baseVertex (0)
                // index + 4: firstInstance (0)
            }
        }
        this.indirectDrawBuffer.setData(indirectDrawArray.buffer, 0, 0, indirectDrawArray.byteLength);
    }

    private createInstanceCullBuffer(): void {
        let meshCount = this.meshArray.length;
        let usage = EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST;
        // First uint32 is the indirect index, rest are culled instance indices
        let byteLength = MAX_INSTANCES_PER_DRAWABLE * Uint32Array.BYTES_PER_ELEMENT + 4;

        let index = 0;
        let tempArray = new Uint32Array(byteLength / Uint32Array.BYTES_PER_ELEMENT);
        for (let i = 0; i < this.materialArray.length; i++) {
            for (let j = 0; j < meshCount; j++) {
                tempArray[0] = index;
                let cullBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(usage);
                cullBuffer.setDataLength(byteLength);
                cullBuffer.setData(tempArray.buffer, 0, 0, tempArray.byteLength);
                this.indirectCullBuffers.push(cullBuffer);
                index++;
            }
        }
    }

    private createInstanceDataBuffer(): void {
        let usage = EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST;
        let byteLength = 16 * 4 * MAX_INSTANCES_PER_DRAWABLE;

        for (let i = 0; i < this.drawElementCount; i++) {
            let deviceBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(usage);
            deviceBuffer.setDataLength(byteLength);
            this.instanceBuffers.push(deviceBuffer);

            for (let j = 0; j < MAX_INSTANCES_PER_DRAWABLE; j++) {
                let matrix = this.createRandomMatrix();
                IndirectDrawDemo.tempFloatArray.set(matrix.elements, j * 16);
            }
            deviceBuffer.setData(IndirectDrawDemo.tempFloatArray.buffer, 0, 0, IndirectDrawDemo.tempFloatArray.byteLength);
        }
    }

    private createRandomMatrix(): Matrix4x4 {
        IndirectDrawDemo.tempVec0.set(
            (Math.random() * 2 - 1) * 100,
            (Math.random() * 2 - 1) * 100,
            (Math.random() * 2 - 1) * 100
        );
        const scale = Math.random() + 0.5;
        IndirectDrawDemo.tempVec1.set(scale, scale, scale);

        Quaternion.createFromYawPitchRoll(
            (Math.random() * 2 - 1) * Math.PI,
            (Math.random() * 2 - 1) * Math.PI,
            (Math.random() * 2 - 1) * Math.PI,
            IndirectDrawDemo.tempQuat
        );
        Matrix4x4.createAffineTransformation(
            IndirectDrawDemo.tempVec0,
            IndirectDrawDemo.tempQuat,
            IndirectDrawDemo.tempVec1,
            IndirectDrawDemo.tempMat
        );
        return IndirectDrawDemo.tempMat;
    }

    private createDrawables(scene: Scene3D): void {
        let meshCount = this.meshArray.length;
        let index = 0;
        for (let i = 0; i < this.materialArray.length; i++) {
            for (let j = 0; j < meshCount; j++) {
                let sprite = scene.addChild(new Sprite3D()) as Sprite3D;
                let baseRender = sprite.addComponent(IndirectDrawBaseRender) as IndirectDrawBaseRender;
                baseRender.setup(
                    this.meshArray[j],
                    this.materialArray[i],
                    this.instanceBuffers[index],
                    this.indirectCullBuffers[index],
                    this.indirectDrawBuffer,
                    index,
                );
                index++;
            }
        }
    }
}
