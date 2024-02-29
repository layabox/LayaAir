import { Laya } from "../../Laya";
import { LengencyRenderEngine3DFactory } from "../../laya/RenderDriver/DriverDesign/3DRenderPass/LengencyRenderEngine3DFactory";
import { Web3DRenderModuleFactory } from "../../laya/RenderDriver/RenderModuleData/WebModuleData/3D/Web3DRenderModuleFactory";
import { WebGLShaderData } from "../../laya/RenderDriver/RenderModuleData/WebModuleData/WebGLShaderData";
import { WebUnitRenderModuleDataFactory } from "../../laya/RenderDriver/RenderModuleData/WebModuleData/WebUnitRenderModuleDataFactory";
import { WebGL3DRenderPassFactory } from "../../laya/RenderDriver/WebGLDriver/3DRenderPass/WebGL3DRenderPassFactory";
import { WebGLBufferState } from "../../laya/RenderDriver/WebGLDriver/RenderDevice/WebGLBufferState";
import { WebGLEngine } from "../../laya/RenderDriver/WebGLDriver/RenderDevice/WebGLEngine";
import { WebGLIndexBuffer } from "../../laya/RenderDriver/WebGLDriver/RenderDevice/WebGLIndexBuffer";
import { WebGLRenderDeviceFactory } from "../../laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderDeviceFactory";
import { WebGLRenderEngineFactory } from "../../laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderEngineFactory";
import { WebGLRenderGeometryElement } from "../../laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderGeometryElement";
import { WebGLShaderInstance } from "../../laya/RenderDriver/WebGLDriver/RenderDevice/WebGLShaderInstance";
import { WebGLVertexBuffer } from "../../laya/RenderDriver/WebGLDriver/RenderDevice/WebGLVertexBuffer";
import { BufferTargetType, BufferUsage } from "../../laya/RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../laya/RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../laya/RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../laya/RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../laya/RenderEngine/VertexDeclaration";
import { Laya3DRender } from "../../laya/d3/RenderObjs/Laya3DRender";
import { LayaGL } from "../../laya/layagl/LayaGL";
import { Vector2 } from "../../laya/maths/Vector2";
import { Vector4 } from "../../laya/maths/Vector4";
import { VertexElement } from "../../laya/renders/VertexElement";
import { VertexElementFormat } from "../../laya/renders/VertexElementFormat";
import { Byte } from "../../laya/utils/Byte";
import { Shader2D } from "../../laya/webgl/shader/d2/Shader2D";
import { ShaderDefines2D } from "../../laya/webgl/shader/d2/ShaderDefines2D";


console.log('')

async function testSimple() {
    LayaGL.unitRenderModuleDataFactory = new WebUnitRenderModuleDataFactory();
    LayaGL.renderDeviceFactory = new WebGLRenderDeviceFactory();
    Laya3DRender.renderOBJCreate = new LengencyRenderEngine3DFactory();
    Laya3DRender.Render3DModuleDataFactory = new Web3DRenderModuleFactory();
    Laya3DRender.Render3DPassFactory = new WebGL3DRenderPassFactory();
    LayaGL.renderOBJCreate = new WebGLRenderEngineFactory();
    //初始化引擎
    await Laya.init(0, 0);
    let geo = createMesh();

    function renderloop(){
        render(geo);
        requestAnimationFrame(renderloop);
    }
    requestAnimationFrame(renderloop)
}

function createMesh() {
    // 顶点定义
    let stride = 24
    //let stride  = 16
    let VertexDeclarition = new VertexDeclaration(stride, [
        new VertexElement(0, VertexElementFormat.Vector4, 0),
        new VertexElement(16, VertexElementFormat.Byte4, 1),
        new VertexElement(20, VertexElementFormat.Byte4, 2),
    ])

    let geo = new WebGLRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
    let mesh = new WebGLBufferState();
    geo.bufferState = mesh;
    let vb = new WebGLVertexBuffer(BufferTargetType.ARRAY_BUFFER, BufferUsage.Dynamic);
    vb.vertexDeclaration = VertexDeclarition;
    let ib = new WebGLIndexBuffer(BufferTargetType.ELEMENT_ARRAY_BUFFER, BufferUsage.Dynamic);

    //填充顶点数据
    //let memVB =new Float32Array(4*stride/4);
    let vbop = new Byte();
    //[x,y,u,v],color,flag
    vbop.writeFloat32(100); vbop.writeFloat32(100); vbop.writeFloat32(0); vbop.writeFloat32(0); vbop.writeInt32(0xffffffff), vbop.writeInt32(0xffffffff);
    vbop.writeFloat32(600); vbop.writeFloat32(100); vbop.writeFloat32(0); vbop.writeFloat32(0); vbop.writeInt32(0xffffffff), vbop.writeInt32(0xffffffff);
    vbop.writeFloat32(600); vbop.writeFloat32(600); vbop.writeFloat32(0); vbop.writeFloat32(0); vbop.writeInt32(0xffffffff), vbop.writeInt32(0xffffffff);
    vbop.writeFloat32(100); vbop.writeFloat32(600); vbop.writeFloat32(0); vbop.writeFloat32(0); vbop.writeInt32(0xffffffff), vbop.writeInt32(0xffffffff);

    vb.setDataLength(vbop.length)
    vb.setData(vbop.buffer, 0, 0, vbop.length)
    let memib = new Uint16Array([0, 2, 1, 0, 2, 3]);
    ib._setIndexDataLength(memib.byteLength)
    ib._setIndexData(memib, 0)
    mesh.applyState([vb], ib)

    geo.indexFormat = IndexFormat.UInt16;
    //画一个三角形
    geo.setDrawElemenParams(6, 0);
    return geo;
}

function render(geo: WebGLRenderGeometryElement) {
    let shaderData = new WebGLShaderData();
    let defs = shaderData.getDefineData();
    //let defs = new WebDefineDatas();
    defs.add(ShaderDefines2D.TEXTURESHADER);
    //defs.add(ShaderDefines2D.TEXTURE2D);
    let shader = Shader2D.textureShader._subShaders[0]._passes[0];

    // 这里会调用到 WebGLShaderInstance._create2D
    let shaderinst = shader.withCompile(defs, true) as WebGLShaderInstance;

    //shader data
    shaderData.setVector2(ShaderDefines2D.UNIFORM_SIZE, new Vector2(800, 800))
    shaderData.setVector(ShaderDefines2D.UNIFORM_CLIPMATDIR, new Vector4(800, 0, 0, 800))

    //upload uniform
    let changed = shaderinst.bind()
    shaderinst.uploadUniforms(shaderinst._sprite2DUniformParamsMap, shaderData, true)

    WebGLEngine.instance.getDrawContext().drawGeometryElement(geo);
}

testSimple();