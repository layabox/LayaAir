import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { WebGPURenderElement3D } from "laya/RenderDriver/WebGPUDriver/3DRenderPass/WebGPURenderElement3D";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { IRenderGeometryElement } from "laya/RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { Material, MaterialRenderMode } from "laya/resource/Material";
import { BundleCullingRender, WebGPU_Bundle_CullingUtil, webgpuDrawCullingELement } from "./WebGPU_Bundle_CullingUtil";
import { LayaGL } from "laya/layagl/LayaGL";
import { MeshTopology } from "laya/RenderEngine/RenderEnum/RenderPologyMode";
import { DrawType } from "laya/RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "laya/RenderEngine/RenderEnum/IndexFormat";
import { EDeviceBufferUsage, IDeviceBuffer } from "laya/RenderDriver/DriverDesign/RenderDevice/IDeviceBuffer";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Quaternion } from "laya/maths/Quaternion";
import { BaseRender } from "laya/d3/core/render/BaseRender";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { ComputeCommandBuffer } from "laya/RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeCommandBuffer";
import { IRenderElement3D } from "laya/RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";

export class WebGPU_Bundle_Culling {
    //一次渲染多少个
    //config

    static tempFloatArray: Float32Array = new Float32Array(WebGPU_Bundle_CullingUtil.MAX_INSTANCES_PER_DRAWABLE * 16);
    static tempvec0: Vector3 = new Vector3();
    static tempvec1: Vector3 = new Vector3();
    static tempQuaternion0: Quaternion = new Quaternion();
    static tempMatrix: Matrix4x4 = new Matrix4x4();

    private _darwElementCount: number = 0;
    private meshArray: Mesh[] = [];
    private materialArray: Material[] = [];
    private geometrys: IRenderGeometryElement[] = [];
    private renderelements: webgpuDrawCullingELement[] = [];
    private instanceBuffer: IDeviceBuffer[] = [];
    private indirectDrawBuffer: IDeviceBuffer;
    private indirectCullBuffers: IDeviceBuffer[] = [];

    constructor() {
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            //Stat.show();
            var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

            var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 500)));
            camera.transform.translate(new Vector3(0, 0, 0));
            camera.transform.rotate(new Vector3(0, 0, 0), true, false);
            camera.addComponent(CameraMoveScript);
            camera.clearColor = new Color(0.0, 0.0, 0.0, 1.0);
            console.log("test WebGPU_Bundle_Culling Demo");
            WebGPU_Bundle_CullingUtil.createCullSpriteCommandMap();
            WebGPU_Bundle_CullingUtil.initShader();//创建渲染shader
            WebGPU_Bundle_CullingUtil.createComputeShader();
            this.createMesh();//创建了四个mesh的模型
            this.createMaterial();//创建Material
            this._darwElementCount = this.meshArray.length * this.materialArray.length;
            this._createIndirectDrawBuffer();
            this._createInstanceCullBuffer();
            this._createInstanceDataDeviceBuffer();
            let sprite = scene.addChild(new Sprite3D());
            let baseRender = sprite.addComponent(BundleCullingRender);
            this._createRenderElement(baseRender);
            this._createComputeCommand(baseRender);
        });
    }

    //创建mesh
    private createMesh() {
        let cubeMesh = PrimitiveMesh.createBox(1, 1, 1);
        this.meshArray.push(cubeMesh);
        let sphere = PrimitiveMesh.createSphere(0.5);
        this.meshArray.push(sphere);
        let cylinder = PrimitiveMesh.createCylinder(0.5, 1);
        this.meshArray.push(cylinder);
        let cone = PrimitiveMesh.createCone(0.5, 1);
        this.meshArray.push(cone);
    }

    //创建材质
    private createMaterial() {
        let createOneMaterial = (r: number, g: number, b: number): Material => {
            let mat = new Material();
            mat.setShaderName("colorShader");
            mat.materialRenderMode = MaterialRenderMode.RENDERMODE_OPAQUE;
            mat.setColor("u_color", new Color(r, g, b, 1));
            return mat;
        }
        this.materialArray.push(createOneMaterial(1, 1, 1));
        this.materialArray.push(createOneMaterial(1, 0, 0));
        this.materialArray.push(createOneMaterial(0, 1, 0));
        this.materialArray.push(createOneMaterial(0, 0, 1));
        this.materialArray.push(createOneMaterial(1, 1, 0));
        this.materialArray.push(createOneMaterial(1, 0, 1));
        this.materialArray.push(createOneMaterial(0, 1, 1));
        this.materialArray.push(createOneMaterial(0.5, 0.5, 0.5));
        this.materialArray.push(createOneMaterial(0.5, 0, 0));
        this.materialArray.push(createOneMaterial(0, 0.5, 0));
        this.materialArray.push(createOneMaterial(0, 0, 0.5));
        this.materialArray.push(createOneMaterial(0.5, 0.5, 0));
        this.materialArray.push(createOneMaterial(0.5, 0, 0.5));
        this.materialArray.push(createOneMaterial(0, 0.5, 0.5));
    }


    private _createIndirectDrawBuffer() {
        let usage = EDeviceBufferUsage.INDIRECT | EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST;
        let byteLength = 20 * this._darwElementCount * 4;
        this.indirectDrawBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(usage);
        this.indirectDrawBuffer.setDataLength(byteLength);
        let indirectDrawArray = new Uint32Array(this._darwElementCount * 5);
        for (var i = 0; i < this.materialArray.length; i++) {
            for (var j = 0; j < this.meshArray.length; j++) {
                let index = i * j * 5;
                let mesh = this.meshArray[j];
                indirectDrawArray[index] = mesh.getSubMesh(0).indexCount;
                indirectDrawArray[index + 1] = WebGPU_Bundle_CullingUtil.MAX_INSTANCES_PER_DRAWABLE;
                indirectDrawArray[index + 2] = 0;
            }
        }
        this.indirectDrawBuffer.setData(indirectDrawArray.buffer, 0, 0, indirectDrawArray.byteLength);
    }

    private _createInstanceDataDeviceBuffer() {
        let createOnePosGeometry = (): Matrix4x4 => {
            WebGPU_Bundle_Culling.tempvec0.set(
                (Math.random() * 2 - 1) * 100,
                (Math.random() * 2 - 1) * 100,
                (Math.random() * 2 - 1) * 100);
            const scale = Math.random() + 0.5;
            WebGPU_Bundle_Culling.tempvec1.set(scale, scale, scale);//大小 0-1

            let quaternion = WebGPU_Bundle_Culling.tempQuaternion0;
            Quaternion.createFromYawPitchRoll((Math.random() * 2 - 1) * Math.PI,
                (Math.random() * 2 - 1) * Math.PI,
                (Math.random() * 2 - 1) * Math.PI, quaternion
            );
            let worldMatrix = WebGPU_Bundle_Culling.tempMatrix;
            Matrix4x4.createAffineTransformation(WebGPU_Bundle_Culling.tempvec0, quaternion, WebGPU_Bundle_Culling.tempvec1, worldMatrix);
            return worldMatrix;
        }
        let usage = EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST;
        let bytelength = 16 * 4 * WebGPU_Bundle_CullingUtil.MAX_INSTANCES_PER_DRAWABLE;
        for (var i = 0; i < this._darwElementCount; i++) {
            let deviceBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(usage);
            deviceBuffer.setDataLength(bytelength);
            this.instanceBuffer.push(deviceBuffer);
            for (var j = 0; j < WebGPU_Bundle_CullingUtil.MAX_INSTANCES_PER_DRAWABLE; j++) {
                let matrix = createOnePosGeometry();
                let offset = j * 16;
                WebGPU_Bundle_Culling.tempFloatArray.set(matrix.elements, offset);
            }
            deviceBuffer.setData(WebGPU_Bundle_Culling.tempFloatArray.buffer, 0, 0, WebGPU_Bundle_Culling.tempFloatArray.byteLength);
        }
    }


    private _createInstanceCullBuffer() {
        let usage = EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST;
        //第一位是渲染多少个，后面是渲染哪些index的数据
        let byteLength = WebGPU_Bundle_CullingUtil.MAX_INSTANCES_PER_DRAWABLE * Uint32Array.BYTES_PER_ELEMENT + 4;

        let index = 0;
        let tempArray = new Uint32Array(byteLength / Uint32Array.BYTES_PER_ELEMENT);
        for (var i = 0; i < this.materialArray.length; i++) {
            for (var j = 0; j < this.meshArray.length; j++) {
                tempArray[0] = index;
                let indirectCullBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(usage);
                indirectCullBuffer.setDataLength(byteLength);
                indirectCullBuffer.setData(tempArray.buffer, 0, 0, tempArray.byteLength);
                this.indirectCullBuffers.push(indirectCullBuffer);
                index++;
            }
        }

    }

    private _createRenderElement(rendernode: BundleCullingRender) {
        let createOneGeometryGeometry = (mesh: Mesh, index: number, deviceBuffer: IDeviceBuffer): IRenderGeometryElement => {
            let geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElementIndirect);
            let meshBufferState = mesh.getSubMesh(0).bufferState._deviceBufferState;
            let vertexbuffers = meshBufferState._vertexBuffers.slice();
            let indexbuffer = meshBufferState._bindedIndexBuffer;
            geometry.drawType = DrawType.DrawElementIndirect;
            geometry.bufferState = LayaGL.renderDeviceFactory.createBufferState();
            geometry.bufferState.applyState(vertexbuffers, indexbuffer);
            geometry.indexFormat = IndexFormat.UInt16;
            geometry.setIndirectDrawBuffer(deviceBuffer, index * 20);
            return geometry;
        }
        let createWebGPURenderElement = (geometry: IRenderGeometryElement, material: Material) => {
            let renderelement = new webgpuDrawCullingELement();
            renderelement.materialShaderData = material.shaderData as any;
            renderelement.materialId = material.id;
            renderelement.subShader = material.shader.getSubShaderAt(0);
            renderelement.geometry = geometry as any;
            return renderelement;
        }
        let index = 0;
        for (var i = 0; i < this.materialArray.length; i++) {
            for (var j = 0; j < this.meshArray.length; j++) {
                let geometry = createOneGeometryGeometry(this.meshArray[j], index, this.indirectDrawBuffer);
                let element = createWebGPURenderElement(geometry, this.materialArray[i]);
                rendernode.addrenderElement(element);
                this.renderelements.push(element);
                element.cullShaderData.setDeviceBuffer(Shader3D.propertyNameToID("instances"), this.instanceBuffer[index] as any);
                element.cullShaderData.setDeviceBuffer(Shader3D.propertyNameToID("culled"), this.indirectCullBuffers[index] as any);
                element.cullShaderData.setDeviceBuffer(Shader3D.propertyNameToID("indirectArgs"), this.indirectDrawBuffer as any);
                index++;
            }
        }
    }

    private _createComputeCommand(rendernode: BundleCullingRender) {
        let commandBuffer = rendernode.computeCommand = new ComputeCommandBuffer();
        let drawlength = this.renderelements.length;
        //clearBuffer
        for (let i = 0; i < drawlength; i++) {
            commandBuffer.addClearBufferCommand(this.indirectDrawBuffer, i * 20 + 4, 4);
        }
        let shaderDefine = LayaGL.unitRenderModuleDataFactory.createDefineDatas();

        //compute dispatch
        for (let i = 0; i < drawlength; i++) {
            commandBuffer.addDispatchCommand(WebGPU_Bundle_CullingUtil.Cull_RenderBundle_ComputeShader,
                "computeMain",
                shaderDefine,
                [rendernode.renderNode.shaderData, this.renderelements[i].cullShaderData],
                new Vector3(Math.ceil(WebGPU_Bundle_CullingUtil.MAX_INSTANCES_PER_DRAWABLE / WebGPU_Bundle_CullingUtil.CULLING_WORKGROUP_SIZE), 1, 1));
        }
    }
}


