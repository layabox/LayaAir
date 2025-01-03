import { LayaGL } from "../../layagl/LayaGL";
import { IIndexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { ShaderDataType } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { Shader3D, ShaderFeatureType } from "../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../RenderEngine/RenderShader/SubShader";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../renders/VertexElement";
import { VertexElementFormat } from "../../renders/VertexElementFormat";
import LineFs from "./2DLine.fs";
import LineVs from "./2DLine.vs";

export class LineShader {
    static LINEWIDTH: number;
    static DASHED: number;
    static TILINGOFFSET: number;

    static linePoisitionDesc: VertexDeclaration;

    static lineLengthDesc: VertexDeclaration;

    /**
     * @internal
     */
    static _vbs: IVertexBuffer;


    /**
     * @internal
     */
    static _ibs: IIndexBuffer;
    private static _isInit: boolean = false;
    static __init__() {
        if (LineShader._isInit) return;
        LineShader._isInit = true;
        let attributeMap: { [name: string]: [number, ShaderDataType] } = {
            'a_position': [0, ShaderDataType.Vector3],
            'a_linePos': [2, ShaderDataType.Vector4],
            "a_linelength": [3, ShaderDataType.Float],
        };
        let uniformMap = {
        };
        let shader = Shader3D.add("LineShader", true, false);
        shader.shaderType = ShaderFeatureType.DEFAULT;
        let subShader = new SubShader(attributeMap, uniformMap, {});
        shader.addSubShader(subShader);
        let forwardPass = subShader.addShaderPass(LineVs, LineFs);

        LineShader.LINEWIDTH = Shader3D.propertyNameToID("u_lineWidth");
        LineShader.DASHED = Shader3D.propertyNameToID("u_dashed");
        LineShader.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");


        const commandUniform = LayaGL.renderDeviceFactory.createGlobalUniformMap("Line2DRender");
        commandUniform.addShaderUniform(LineShader.LINEWIDTH, "u_lineWidth", ShaderDataType.Float);
        commandUniform.addShaderUniform(LineShader.DASHED, "u_dashed", ShaderDataType.Vector3);
        commandUniform.addShaderUniform(LineShader.TILINGOFFSET, "u_TilingOffset", ShaderDataType.Vector4);


        let vertexs: Float32Array = new Float32Array([
            -0.5, -0.5, 0,
            0.5, -0.5, 0,
            0.5, 0.5, 0,
            - 0.5, 0.5, 0]);
        let index: Uint16Array = new Uint16Array([0, 1, 2, 0, 2, 3]);
        var declaration = new VertexDeclaration(12, [
            new VertexElement(0, VertexElementFormat.Vector3, 0),
        ]);
        let vertex = LineShader._vbs = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        vertex.vertexDeclaration = declaration;
        vertex.instanceBuffer = false;
        vertex.setDataLength(vertexs.byteLength);
        vertex.setData(vertexs.buffer, 0, 0, vertexs.byteLength);

        let ibs = LineShader._ibs = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
        ibs._setIndexDataLength(index.buffer.byteLength);
        ibs._setIndexData(index, 0);

        LineShader.linePoisitionDesc = new VertexDeclaration(16, [
            new VertexElement(0, VertexElementFormat.Vector4, 2),
        ]);

        LineShader.lineLengthDesc = new VertexDeclaration(4, [
            new VertexElement(0, VertexElementFormat.Single, 3),
        ]);

    }
}
