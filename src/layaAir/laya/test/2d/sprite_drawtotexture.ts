import { Sprite } from "../../display/Sprite";
import { Laya } from "../../../Laya";
import { LengencyRenderEngine3DFactory } from "../../RenderDriver/DriverDesign/3DRenderPass/LengencyRenderEngine3DFactory";
import { Web3DRenderModuleFactory } from "../../RenderDriver/RenderModuleData/WebModuleData/3D/Web3DRenderModuleFactory";
import { WebGLShaderData } from "../../RenderDriver/RenderModuleData/WebModuleData/WebGLShaderData";
import { WebUnitRenderModuleDataFactory } from "../../RenderDriver/RenderModuleData/WebModuleData/WebUnitRenderModuleDataFactory";
import { WebGL3DRenderPassFactory } from "../../RenderDriver/WebGLDriver/3DRenderPass/WebGL3DRenderPassFactory";
import { WebGLBufferState } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLBufferState";
import { WebGLEngine } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLEngine";
import { WebGLIndexBuffer } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLIndexBuffer";
import { WebGLRenderDeviceFactory } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLRenderDeviceFactory";
import { WebGLRenderEngineFactory } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLRenderEngineFactory";
import { WebGLRenderGeometryElement } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLRenderGeometryElement";
import { WebGLShaderInstance } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLShaderInstance";
import { WebGLVertexBuffer } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLVertexBuffer";
import { BufferTargetType, BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { Laya3DRender } from "../../d3/RenderObjs/Laya3DRender";
import { LayaGL } from "../../layagl/LayaGL";
import { Vector2 } from "../../maths/Vector2";
import { Vector4 } from "../../maths/Vector4";
import { VertexElement } from "../../renders/VertexElement";
import { VertexElementFormat } from "../../renders/VertexElementFormat";
import { BaseTexture } from "../../resource/BaseTexture";
import { Texture } from "../../resource/Texture";
import { Byte } from "../../utils/Byte";
import { Shader2D } from "../../webgl/shader/d2/Shader2D";
import { ShaderDefines2D } from "../../webgl/shader/d2/ShaderDefines2D";

var width=1024;
var height=1024;
async function test(){
    LayaGL.unitRenderModuleDataFactory = new WebUnitRenderModuleDataFactory();
    LayaGL.renderDeviceFactory = new WebGLRenderDeviceFactory();
    Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
    Laya3DRender.Render3DModuleDataFactory = new Web3DRenderModuleFactory();
    Laya3DRender.Render3DPassFactory = new WebGL3DRenderPassFactory();
    LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();
    //初始化引擎
    await Laya.init(width,height);

    let sp = new Sprite();
    sp.graphics.drawRect(0,0,100,100,'red');
    sp.graphics.drawRect(10,10,80,80,'green');
    sp.graphics.drawRect(80,0,20,20,'blue');
    Laya.stage.addChild(sp);

    let n = 0;
    function renderloop(){
        n++;
        if(n==10){
            let rt = Sprite.drawToTexture(sp,100,100,0,0,null)
            let sp2 = new Sprite();
            sp2.graphics.drawTexture( new Texture(rt,Texture.INV_UV));
            sp2.x=120;
            Laya.stage.addChild(sp2)
        }
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}


test();