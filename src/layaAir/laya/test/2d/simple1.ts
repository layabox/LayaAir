import { Laya } from "../../../Laya";
import "../../loaders/AtlasLoader";
import "../../loaders/TextureLoader";

import { WebGLShaderData } from "../../RenderDriver/RenderModuleData/WebModuleData/WebGLShaderData";
import { WebGLBufferState } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLBufferState";
import { WebGLEngine } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLEngine";
import { WebGLIndexBuffer } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLIndexBuffer";
import { WebGLRenderGeometryElement } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLRenderGeometryElement";
import { WebGLShaderInstance } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLShaderInstance";
import { WebGLVertexBuffer } from "../../RenderDriver/WebGLDriver/RenderDevice/WebGLVertexBuffer";
import { BufferTargetType, BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { Vector2 } from "../../maths/Vector2";
import { Vector4 } from "../../maths/Vector4";
import { VertexElement } from "../../renders/VertexElement";
import { VertexElementFormat } from "../../renders/VertexElementFormat";
import { BaseTexture } from "../../resource/BaseTexture";
import { Texture } from "../../resource/Texture";
import { Byte } from "../../utils/Byte";
import { Shader2D } from "../../webgl/shader/d2/Shader2D";
import { ShaderDefines2D } from "../../webgl/shader/d2/ShaderDefines2D";

/**
 * 这是一个不用2d引擎来画2d的例子
 */

var width=1024;
var height=1024;
var tex:Texture;
export default async function testSimple() {
    //初始化引擎
    await Laya.init(width,height);
    //根据这个目录下的 fileconfig.json 加载需要的资源和图集
    await Laya.loader.loadPackage('sample-resource/2d', null, null);    
    tex = await Laya.loader.load('atlas/comp/image.png')
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
    let uv = tex.uv;    //这是一个图集，要用uv，否则会显示整个图片
    vbop.writeFloat32(100); vbop.writeFloat32(100); vbop.writeFloat32(uv[0]); vbop.writeFloat32(uv[1]); vbop.writeInt32(0xffffffff), vbop.writeInt32(0xffffffff);
    vbop.writeFloat32(600); vbop.writeFloat32(100); vbop.writeFloat32(uv[2]); vbop.writeFloat32(uv[3]); vbop.writeInt32(0xffffffff), vbop.writeInt32(0xffffffff);
    vbop.writeFloat32(600); vbop.writeFloat32(600); vbop.writeFloat32(uv[4]); vbop.writeFloat32(uv[5]); vbop.writeInt32(0xffffffff), vbop.writeInt32(0xffffffff);
    vbop.writeFloat32(100); vbop.writeFloat32(600); vbop.writeFloat32(uv[6]); vbop.writeFloat32(uv[7]); vbop.writeInt32(0xffffffff), vbop.writeInt32(0xffffffff);

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
    shaderData.setVector2(ShaderDefines2D.UNIFORM_SIZE, new Vector2(width, height))
    shaderData.setVector(ShaderDefines2D.UNIFORM_CLIPMATDIR, new Vector4(width, 0, 0, height))
    shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE, tex as unknown as BaseTexture);

    //upload uniform
    let changed = shaderinst.bind()
    shaderinst.uploadUniforms(shaderinst._sprite2DUniformParamsMap, shaderData, true)

    WebGLEngine.instance.getDrawContext().drawGeometryElement(geo);
}

testSimple();