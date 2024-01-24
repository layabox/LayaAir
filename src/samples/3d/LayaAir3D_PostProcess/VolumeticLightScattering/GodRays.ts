import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "laya/RenderEngine/RenderShader/VertexMesh";
import { PostProcessEffect } from "laya/d3/core/render/PostProcessEffect";
import { PostProcessRenderContext } from "laya/d3/core/render/PostProcessRenderContext";
import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { RenderTexture } from "laya/resource/RenderTexture";
import BlitVS from "./FarBlitScreen.vs";
import BlitFS from "./ScallerBlitFS.fs";
import BlitOCFS from "./OcBlitFS.fs";
import AddBlitFS from "./AddBlitFS.fs";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { Color } from "laya/maths/Color";
import { Vector4 } from "laya/maths/Vector4";
import { Texture2D } from "laya/resource/Texture2D";
import { Camera } from "laya/d3/core/Camera";
import { Vector3 } from "laya/maths/Vector3";
import { Vector2 } from "laya/maths/Vector2";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { LayaGL } from "laya/layagl/LayaGL";
import { ShaderDataType, ShaderData } from "laya/RenderDriver/RenderModuleData/Design/ShaderData";
import { RenderState } from "laya/RenderDriver/RenderModuleData/Design/RenderState";

export class GodRay extends PostProcessEffect {
    static init() {
        //godrayColor
        let attributeMap: { [name: string]: [number, ShaderDataType] } = {
            "a_PositionTexcoord": [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4]
        };

        let uniformMap = {
            "u_OffsetScale": ShaderDataType.Vector4,
            "u_MainTex": ShaderDataType.Texture2D,
            "u_MainTex_TexelSize": ShaderDataType.Vector4, //x:width,y:height,z:1/width,w:1/height
            "u_Center": ShaderDataType.Vector2,
            "u_Intensity": ShaderDataType.Float,
            "u_BlurWidth": ShaderDataType.Float,
            "u_scatterColor": ShaderDataType.Color
        };
        let shader = Shader3D.add("godRayScaller");
        let subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        let blitPass = subShader.addShaderPass(BlitVS, BlitFS);
        blitPass.statefirst = true;
        let blitState = blitPass.renderState;
        blitState.depthTest = RenderState.DEPTHTEST_ALWAYS;
        blitState.depthWrite = false;
        blitState.cull = RenderState.CULL_NONE;
        blitState.blend = RenderState.BLEND_DISABLE;



        //OcclusionShader
        let uniformMapOc = {
            "u_OffsetScale": ShaderDataType.Vector4,
            "u_MainTex": ShaderDataType.Texture2D,
            "u_MainTex_TexelSize": ShaderDataType.Vector4, //x:width,y:height,z:1/width,w:1/height
            "u_Center": ShaderDataType.Vector2,
            "u_AspecTratio": ShaderDataType.Float,
            "u_sunSize":ShaderDataType.Float
        };
        let shaderOc = Shader3D.add("OcShader");
        subShader = new SubShader(attributeMap, uniformMapOc);
        shaderOc.addSubShader(subShader);
        blitPass = subShader.addShaderPass(BlitVS, BlitOCFS);
        blitPass.statefirst = true;
        blitState = blitPass.renderState;
        blitState.depthTest = RenderState.DEPTHTEST_LEQUAL;
        blitState.depthWrite = false;
        blitState.cull = RenderState.CULL_NONE;
        blitState.blend = RenderState.BLEND_DISABLE;
        let uniformMapAdd = {
            "u_OffsetScale": ShaderDataType.Vector4,
            "u_MainTex": ShaderDataType.Texture2D,
            "u_MainTex_TexelSize": ShaderDataType.Vector4, //x:width,y:height,z:1/width,w:1/height
            "u_addTexture": ShaderDataType.Texture2D
        };

        //addShader
        let shaderAdd = Shader3D.add("AddShader");
        subShader = new SubShader(attributeMap, uniformMapAdd);
        shaderAdd.addSubShader(subShader);
        blitPass = subShader.addShaderPass(BlitVS, AddBlitFS);
        blitPass.statefirst = true;
        blitState = blitPass.renderState;
        blitState.depthTest = RenderState.DEPTHTEST_ALWAYS;
        blitState.depthWrite = false;
        blitState.cull = RenderState.CULL_NONE;
        blitState.blend = RenderState.BLEND_DISABLE;
    }

    /**@internal */
    private _addShader: Shader3D;
    /**@internal */
    private _addData: ShaderData;
    /**@internal */
    private _ocShader: Shader3D;
    /**@internal */
    private _ocData: ShaderData;
    /**@internal */
    private _godRayShader: Shader3D;
    /**@internal */
    private _godRayData: ShaderData;
    /**@internal */
    private tempv2: Vector2;

    /**
     * 实例化GodRay后期处理
     */
    constructor() {
        super();
        this.active = true;
        this._godRayData = LayaGL.unitRenderModuleDataFactory.createShaderData(null);
        this._godRayShader = Shader3D.find("godRayScaller");
        this._ocData = LayaGL.unitRenderModuleDataFactory.createShaderData(null);
        this._ocShader = Shader3D.find("OcShader");
        this._addData = LayaGL.unitRenderModuleDataFactory.createShaderData(null);
        this._addShader = Shader3D.find("AddShader");
        this.tempv2 = new Vector2();
        this.scatterColor = new Color(1.0, 1.0, 1.0, 1.0);
        this.sunSize = 0.3;
    }

    /**
     * 散射强度
     */
    set intensity(value: number) {
        this._godRayData.setNumber(Shader3D.propertyNameToID("u_Intensity"), value);
    }

    /**
     * 散射范围
     */
    set blurWidth(value: number) {
        this._godRayData.setNumber(Shader3D.propertyNameToID("u_BlurWidth"), value);
    }

    /**
     * 散射颜色
     */
    set scatterColor(color: Color) {
        this._godRayData.setColor(Shader3D.propertyNameToID("u_scatterColor"), color);
    }

    /**
     * 0-1
     */
    set sunSize(value: number) {
        this._ocData.setNumber(Shader3D.propertyNameToID("u_sunSize"), value);
    }


    /**
     * 计算太阳光的UV
     * @param camera 
     * @param scene 
     * @param aspecTratio 
     */
    private getcenter(camera: Camera, scene: Scene3D, aspecTratio: number) {

        //@ts-ignore
        let dir: Vector3 = scene._sundir;
        camera.transform.position.vsub(dir, dir);
        let vec4: Vector4 = new Vector4();
        camera.worldToNormalizedViewportPoint(dir, vec4);


        this.tempv2.setValue(vec4.x, 1.0 - vec4.y);
        this._ocData.setVector2(Shader3D.propertyNameToID("u_Center"), this.tempv2);
        this._godRayData.setVector2(Shader3D.propertyNameToID("u_Center"), this.tempv2);
        this._ocData.setNumber(Shader3D.propertyNameToID("u_AspecTratio"), aspecTratio)
        //console.log(this.tempv2.y);
    }

    /**
     * 渲染流程
     * @param context 
     * @returns 
     */
    render(context: PostProcessRenderContext) {
        var cmd: CommandBuffer = context.command;
        //@ts-ignore
        let source: RenderTexture = context.camera._internalRenderTexture;
        this.getcenter(context.camera, context.camera.scene, source.width / source.height);
        //getOcTexture
        let copyRT = RenderTexture.createFromPool(source.width, source.height, source.colorFormat, RenderTargetFormat.None, false, 1, false,true);
        cmd.setRenderTarget(source);
        cmd.clearRenderTarget(true, false, Color.BLACK);
        cmd.blitScreenQuad(Texture2D.whiteTexture, source, null, this._ocShader, this._ocData);
        //get scallerTexture
        cmd.blitScreenQuad(source, copyRT, null, this._godRayShader, this._godRayData);
        //compelit
        this._addData.setTexture(Shader3D.propertyNameToID("u_addTexture"), copyRT);
        cmd.blitScreenQuad(context.indirectTarget, context.destination, null, this._addShader, this._addData);
        context.deferredReleaseTextures.push(copyRT);
    }
}