import { Camera, CameraEventFlags } from "laya/d3/core/Camera";
import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { DrawMeshInstancedCMD } from "laya/d3/core/render/command/DrawMeshInstancedCMD";
import { InstanceLocation, MaterialInstancePropertyBlock } from "laya/d3/core/render/command/MaterialInstancePropertyBlock";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { VertexMesh } from "laya/RenderEngine/RenderShader/VertexMesh";
import { VertexDeclaration } from "laya/RenderEngine/VertexDeclaration";
import { GrassMaterial } from "./GrassMaterial";
import { GrassRenderManager } from "./GrassRenderManager";

export class GlassRender{

    private grassManager:GrassRenderManager;
    private instanceCMD:DrawMeshInstancedCMD;
    private materialBlock:MaterialInstancePropertyBlock;
    private grassMaterial:GrassMaterial;
    private buf:CommandBuffer;
    private camera:Camera;
    constructor(manager:GrassRenderManager,camera:Camera){
        this.grassManager = manager;
        this.createCommandBuffer();
        this.camera = camera;
    }


    /**
     * @internal
     */
    private creatGrassMesh():Mesh{
        // 生成 单片 grass (一个 三角形)
        var vertexArray: Float32Array  = new Float32Array(3 * 3);
        vertexArray[0] = -0.25;  // p1.x
        vertexArray[3] = 0.25; // p2.x
        vertexArray[7] = 1;     // p3.y
        var indexArray: Uint16Array =  new Uint16Array([2, 1, 0]);
        var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION");
        //@ts-ignore
        var mesh = PrimitiveMesh._createMesh(vertexDeclaration,vertexArray,indexArray);
        return mesh;
    }

    /**
     * @internal
     */
    private createMaterial():GrassMaterial{
        var mat = new GrassMaterial();
        this.grassMaterial = mat;
        //set mat Property
        return mat;
    }

    /**
     * 创建CommandBuffer命令缓存流
     * @param camera 
     */
    createCommandBuffer(){
        DrawMeshInstancedCMD.maxInstanceCount = 1000000;
        //创建渲染命令流
        this.buf = new CommandBuffer();
        //创建材质instance属性块
        this.materialBlock= new MaterialInstancePropertyBlock();
        //设置属性
        this.materialBlock.setVector3Array("a_privotPosition",this.grassManager.dataArrayBuffer,InstanceLocation.CUSTOME0);
        // let matrixs =new Array<Matrix4x4>();
        // for(var i = 0;i<1000000;i++){
        //     matrixs.push(new Matrix4x4());
        // }
        this.instanceCMD = this.buf.drawMeshInstance(this.creatGrassMesh(),0,null,this.createMaterial(),0,this.materialBlock,this.grassManager.drawArrayLength);
        return;
    }

    removeCommandBuffer(){
        this.camera.removeCommandBuffer(CameraEventFlags.BeforeTransparent,this.buf);
    }

    addCommandBuffer(){
        this.camera.addCommandBuffer(CameraEventFlags.BeforeTransparent,this.buf);
    }

    changeDrawNums(){
        this.materialBlock.setVector3Array("a_privotPosition",this.grassManager.dataArrayBuffer,InstanceLocation.CUSTOME0);
        this.instanceCMD.setDrawNums(this.grassManager.drawArrayLength);
    }

    
}