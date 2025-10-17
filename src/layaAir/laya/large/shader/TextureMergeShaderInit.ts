import TexMergeVS from "./TexMerge.vs";
import TexMergeFS from "./TexMerge.fs";
import { ShaderData, ShaderDataType } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { LayaGL } from "../../layagl/LayaGL";
import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { ShaderDefine } from "../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "../../RenderEngine/RenderShader/VertexMesh";


export class TextureMergeShaderInit {

    /** @internal */
    static _sdNotChange: ShaderData; //着色器数据（颜色空间不变
    /** @internal */
    static _sdGammaToLinear: ShaderData; //着色器数据（伽马转线性）
    /** @internal */
    static _sdLinearToGamma: ShaderData; //着色器数据（线性转伽马）
    
        
    private static LINEAR_TO_GAMMA: ShaderDefine;
    
    private static GAMMA_TO_LINEAR: ShaderDefine;

    static init() {
        const attributeMap: { [name: string]: [number, ShaderDataType] } = {
            "a_PositionTexcoord": [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4]
        };

        const uniformMap = {
            "u_MainTex": ShaderDataType.Texture2D,
            "u_OffsetScale": ShaderDataType.Vector4,
        };

        this.LINEAR_TO_GAMMA = Shader3D.getDefineByName("LINEAR_TO_GAMMA");
        this.GAMMA_TO_LINEAR = Shader3D.getDefineByName("GAMMA_TO_LINEAR");

        this._sdNotChange = LayaGL.renderDeviceFactory.createShaderData(null);
        this._sdGammaToLinear = LayaGL.renderDeviceFactory.createShaderData(null);
        this._sdGammaToLinear.addDefine(this.GAMMA_TO_LINEAR);
        this._sdLinearToGamma = LayaGL.renderDeviceFactory.createShaderData(null);
        this._sdLinearToGamma.addDefine(this.LINEAR_TO_GAMMA);

        const shader = Shader3D.add("TexMerge");
        const subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        const blitPass = subShader.addShaderPass(TexMergeVS, TexMergeFS);
        const blitState = blitPass.renderState;
        blitState.depthTest = RenderState.DEPTHTEST_ALWAYS;
        blitState.depthWrite = false;
        blitState.cull = RenderState.CULL_NONE;
        blitState.blend = RenderState.BLEND_DISABLE;
    }
}