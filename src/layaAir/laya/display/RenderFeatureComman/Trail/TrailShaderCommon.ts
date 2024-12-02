import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import TrailVertexUtilGLSL from "./Shader/TrailVertexUtil.glsl";
import { VertexTrail } from "./VertexTrail";

export class TrailShaderCommon {
    /**@internal */
    static CURTIME: number;
    /**@internal */
    static LIFETIME: number;
    /**@internal */
    static WIDTHCURVE: number;
    /**@internal */
    static WIDTHCURVEKEYLENGTH: number;
    /**@internal */
    static inited: boolean = false;
    /**@internal */
    static attributeMap: { [name: string]: [number, ShaderDataType] };
    /**@internal */
    static uniformMap: { [name: string]: ShaderDataType };
    /**@internal */
    static defaultValue: { [name: string]: any };
    /**@internal */
    static init() {
        if (this.inited)
            return;
        TrailShaderCommon.CURTIME = Shader3D.propertyNameToID("u_CurTime");
        TrailShaderCommon.LIFETIME = Shader3D.propertyNameToID("u_LifeTime");
        TrailShaderCommon.WIDTHCURVE = Shader3D.propertyNameToID("u_WidthCurve");
        TrailShaderCommon.WIDTHCURVEKEYLENGTH = Shader3D.propertyNameToID("u_WidthCurveKeyLength");

        const spriteParms = LayaGL.renderDeviceFactory.createGlobalUniformMap("TrailRender");
        spriteParms.addShaderUniform(TrailShaderCommon.CURTIME, "u_CurTime", ShaderDataType.Float);
        spriteParms.addShaderUniform(TrailShaderCommon.LIFETIME, "u_LifeTime", ShaderDataType.Float);
        spriteParms.addShaderUniform(TrailShaderCommon.WIDTHCURVE, "u_WidthCurve", ShaderDataType.Buffer);
        spriteParms.addShaderUniform(TrailShaderCommon.WIDTHCURVEKEYLENGTH, "u_WidthCurveKeyLength", ShaderDataType.Int);

        TrailShaderCommon.attributeMap = {
            'a_position': [VertexTrail.TRAIL_POSITION0, ShaderDataType.Vector4],
            'a_OffsetVector': [VertexTrail.TRAIL_OFFSETVECTOR, ShaderDataType.Vector3],
            'a_Texcoord0X': [VertexTrail.TRAIL_TEXTURECOORDINATE0X, ShaderDataType.Float],
            'a_Texcoord0Y': [VertexTrail.TRAIL_TEXTURECOORDINATE0Y, ShaderDataType.Float],
            'a_BirthTime': [VertexTrail.TRAIL_TIME0, ShaderDataType.Float],
            'a_Color': [VertexTrail.TRAIL_COLOR, ShaderDataType.Vector4],
        };

        TrailShaderCommon.uniformMap = {
            "u_TilingOffset": ShaderDataType.Vector4,
            "u_MainTexture": ShaderDataType.Texture2D,
            "u_MainColor": ShaderDataType.Color,
        };

        TrailShaderCommon.defaultValue = {
            "u_MainColor": Color.WHITE,
            "u_TilingOffset": new Vector4(1, 1, 0, 0),
        };

        Shader3D.addInclude("TrailVertexUtil.glsl", TrailVertexUtilGLSL);
        //vertexDeclaration
        VertexTrail.__init__();
        this.inited = true;
    }
}
