import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "../../../RenderEngine/RenderShader/VertexMesh";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { Laya3DRender } from "../../../d3/RenderObjs/Laya3DRender";
import { IndexBuffer3D } from "../../../d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../../d3/graphics/VertexBuffer3D";
import { VertexElement } from "../../../renders/VertexElement";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import { Material } from "../../../resource/Material";
import { SingletonList } from "../../../utils/SingletonList";
import { TextureSV } from "../../../webgl/shader/d2/value/TextureSV";
import { RenderSpriteData, Value2D } from "../../../webgl/shader/d2/value/Value2D";
import { BufferState } from "../../../webgl/utils/BufferState";
import { IRenderElement2D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { WebGLBufferState } from "../RenderDevice/WebGLBufferState";
import { WebGLEngine } from "../RenderDevice/WebGLEngine";
import { WebGLIndexBuffer } from "../RenderDevice/WebGLIndexBuffer";
import { WebGLRenderGeometryElement } from "../RenderDevice/WebGLRenderGeometryElement";
import { WebGLShaderInstance } from "../RenderDevice/WebGLShaderInstance";
import { WebGLVertexBuffer } from "../RenderDevice/WebGLVertexBuffer";
import { WebGLRenderContext3D } from "./WebGLRenderContext3D";

class Context2D{
    worldData:Value2D;
    //texture;
}

export class WebGLRenderElement2D implements IRenderElement2D {
    materialShaderData: ShaderData;
    value2DShaderData: ShaderData;
    subShader: SubShader;
    private _material:Material;
    _shaderInstances: SingletonList<WebGLShaderInstance>=new SingletonList<WebGLShaderInstance>();
    geometry: WebGLRenderGeometryElement;

    init(){
        let vertCount=10;
        let stride=4;
        var vertexBuffer = new WebGLVertexBuffer(vertCount * stride, BufferUsage.Dynamic);

        //TODO VertextElement也是上层概念
        let elements:VertexElement[]=[];
        let offset = 0;
        let element = new VertexElement(offset, VertexElementFormat.Vector3, VertexMesh.MESH_POSITION0);        
        elements.push(element);
        let vertDecl = new VertexDeclaration(offset, elements);
        var vertexFloatStride: number = vertDecl.vertexStride / 4;

        vertexBuffer.vertexDeclaration = vertDecl;
        //vertexBuffer.setData(vertices.buffer);
        //TODO 按理说这里不能访问BufferTargetType
        var indexBuffer = new WebGLIndexBuffer(BufferTargetType.ELEMENT_ARRAY_BUFFER, BufferUsage.Dynamic);// : IndexBuffer3D = Laya3DRender.renderOBJCreate.createIndexBuffer3D(IndexFormat.UInt16, indices.length, BufferUsage.Static, true);
        //indexBuffer.setData(indices);
        let bufferstate = new WebGLBufferState();
        bufferstate.applyState([vertexBuffer],indexBuffer);        

        let shaderValueTexture = new TextureSV();
        //this.value2DShaderData = shaderValueTexture;
        this.subShader = shaderValueTexture._defaultShader._subShaders[0]
    }

    set material(mtl:Material){

    }

    get material(){
        return this._material;
    }

    setGeometry(geometry:any){
    }

    render(context:WebGLRenderContext3D): void {
        var forceInvertFace = context.invertY;
        var updateMark = context.cameraUpdateMask;
        var sceneShaderData = context.sceneData ;
        var cameraShaderData = context.cameraData ;
        var passes = this._shaderInstances.elements;
        for (let j = 0, m = this._shaderInstances.length; j < m; j++) {
            const shaderIns = passes[j];
            if (!shaderIns.complete)
                continue;
            var shaderChanged = shaderIns.bind();    //上一次的shader就是这个，则返回false
            var switchUpdateMark = (updateMark !== shaderIns._uploadMark);
            var uploadScene = (shaderIns._uploadScene !== sceneShaderData) || switchUpdateMark;
            //Scene
            if (uploadScene || shaderChanged) {
                sceneShaderData && shaderIns.uploadUniforms(shaderIns._sceneUniformParamsMap, sceneShaderData, uploadScene);
                shaderIns._uploadScene = sceneShaderData;
            }
            //render
            // if (this.renderShaderData) {
            //     var uploadSprite3D: boolean = (shaderIns._uploadRender !== this.renderShaderData) || switchUpdateMark;
            //     if (uploadSprite3D || switchShader) {
            //         shaderIns.uploadUniforms(shaderIns._spriteUniformParamsMap, this.renderShaderData, uploadSprite3D);
            //         shaderIns._uploadRender = this.renderShaderData;
            //     }
            // }
            //camera
            var uploadCamera = shaderIns._uploadCameraShaderValue !== cameraShaderData || switchUpdateMark;
            if (uploadCamera || shaderChanged) {
                cameraShaderData && shaderIns.uploadUniforms(shaderIns._cameraUniformParamsMap, cameraShaderData, uploadCamera);
                shaderIns._uploadCameraShaderValue = cameraShaderData;
            }
            //material
            var uploadMaterial = (shaderIns._uploadMaterial !== this.materialShaderData) || switchUpdateMark;
            if (uploadMaterial || shaderChanged) {
                //shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, this.materialShaderData, uploadMaterial);
                shaderIns._uploadMaterial = this.materialShaderData;
                //GlobalData
                context.globalShaderData && shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, context.globalShaderData, uploadMaterial);
            }
            //renderData update
            //TODO：Renderstate as a Object to less upload
            shaderIns.uploadRenderStateBlendDepth(this.materialShaderData);
            //shaderIns.uploadRenderStateFrontFace(this.materialShaderData, forceInvertFace, this._invertFront);
            this.drawGeometry(shaderIns);
        }
    }

    drawGeometry(shaderIns: WebGLShaderInstance) {
        WebGLEngine.instance.getDrawContext().drawGeometryElement(this.geometry);
     }
 
        
    destroy(): void {
        this.geometry = null;
    }
}