import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { ShaderPass } from "laya/d3/shader/ShaderPass";
import { SubShader } from "laya/d3/shader/SubShader";

import UnityGrassVS from "./shader/GrassShaderVS.vs";
import UnityGrassFS from "./shader/GrassShaderFS.fs";
import { Material } from "laya/d3/core/material/Material";
import { RenderState } from "laya/d3/core/material/RenderState";
import { Vector2 } from "laya/d3/math/Vector2";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { BaseTexture } from "laya/resource/BaseTexture";
import value from "*.glsl";
import { Loader } from "laya/net/Loader";

export class GrassMaterial extends Material {
    static hasInited: boolean = false;
	/**@internal */
    static WINDAINTENSITY: number = Shader3D.propertyNameToID("u_WindAIntensity");
    /**@internal */
    static WINDAFREQUECY:number = Shader3D.propertyNameToID("u_WindAFrequency");
    /**@internal */
    static WINDATILING:number = Shader3D.propertyNameToID("u_WindATiling");
    /**@internal */
    static WINDAWRAP:number = Shader3D.propertyNameToID("u_WindAWrap");

	/**@internal */
    static WINDBINTENSITY: number = Shader3D.propertyNameToID("u_WindBIntensity");
    /**@internal */
    static WINDBFREQUECY:number = Shader3D.propertyNameToID("u_WindBFrequency");
    /**@internal */
    static WINDBTILING:number = Shader3D.propertyNameToID("u_WindBTiling");
    /**@internal */
    static WINDBWRAP:number = Shader3D.propertyNameToID("u_WindBWrap");

    /**@internal */
    static WINDCINTENSITY: number = Shader3D.propertyNameToID("u_WindCIntensity");
    /**@internal */
    static WINDCFREQUECY:number = Shader3D.propertyNameToID("u_WindCFrequency");
    /**@internal */
    static WINDCTILING:number = Shader3D.propertyNameToID("u_WindCTiling");
    /**@internal */
    static WINDCWRAP:number = Shader3D.propertyNameToID("u_WindCWrap");

    //grass hight width
    static GRASSHEIGHT:number = Shader3D.propertyNameToID("u_grassHeight");
    static GRASSWIDTH:number = Shader3D.propertyNameToID("u_grassWidth");
    //grass Bound 必须和草系统里面的UV相同才能得到很好的效果
    static GRASSBOUND:number = Shader3D.propertyNameToID("u_BoundSize");
    //地面颜色
    static GROUNDCOLOR:number = Shader3D.propertyNameToID("u_GroundColor");
    static ALBEDOTEXTURE:number = Shader3D.propertyNameToID("u_albedoTexture");



    static __init__(): void {

        var attributeMap: any = {
            'a_Position': VertexMesh.MESH_POSITION0,
            'a_Normal': VertexMesh.MESH_NORMAL0,
            'a_Color': VertexMesh.MESH_COLOR0,
            'a_Tangent0': VertexMesh.MESH_TANGENT0,
            'a_privotPosition':VertexMesh.MESH_CUSTOME0
        };

        var uniformMap: any = {
            'u_AlbedoTexture': Shader3D.PERIOD_MATERIAL,
            'u_AlbedoColor': Shader3D.PERIOD_MATERIAL,
            'u_TilingOffset': Shader3D.PERIOD_MATERIAL,
            'u_MvpMatrix': Shader3D.PERIOD_SPRITE,
            'u_CameraDirection': Shader3D.PERIOD_CAMERA,
            'u_CameraUp': Shader3D.PERIOD_CAMERA,
            'u_CameraPos': Shader3D.PERIOD_CAMERA,
            'u_View': Shader3D.PERIOD_CAMERA,
            'u_Projection': Shader3D.PERIOD_CAMERA,
            "u_Time": Shader3D.PERIOD_SCENE,
            'u_ViewProjection': Shader3D.PERIOD_CAMERA,
            //wind
            "u_WindAIntensity":Shader3D.PERIOD_MATERIAL,
            "u_WindAFrequency":Shader3D.PERIOD_MATERIAL,
            "u_WindATiling":Shader3D.PERIOD_MATERIAL,
            "u_WindAWrap":Shader3D.PERIOD_MATERIAL,
            "u_WindBIntensity":Shader3D.PERIOD_MATERIAL,
            "u_WindBFrequency":Shader3D.PERIOD_MATERIAL,
            "u_WindBTiling":Shader3D.PERIOD_MATERIAL,
            "u_WindBWrap":Shader3D.PERIOD_MATERIAL,
            "u_WindCIntensity":Shader3D.PERIOD_MATERIAL,
            "u_WindCFrequency":Shader3D.PERIOD_MATERIAL,
            "u_WindCTiling":Shader3D.PERIOD_MATERIAL,
            "u_WindCWrap":Shader3D.PERIOD_MATERIAL,
            //grass
            "u_grassHeight":Shader3D.PERIOD_MATERIAL,
            "u_grassWidth":Shader3D.PERIOD_MATERIAL,
            "u_BoundSize":Shader3D.PERIOD_MATERIAL,
            "u_GroundColor":Shader3D.PERIOD_MATERIAL,
            "u_albedoTexture":Shader3D.PERIOD_MATERIAL

        };

        var stateMap = {
            's_Cull': Shader3D.RENDER_STATE_CULL,
            's_Blend': Shader3D.RENDER_STATE_BLEND,
            's_BlendSrc': Shader3D.RENDER_STATE_BLEND_SRC,
            's_BlendDst': Shader3D.RENDER_STATE_BLEND_DST,
            's_DepthTest': Shader3D.RENDER_STATE_DEPTH_TEST,
            's_DepthWrite': Shader3D.RENDER_STATE_DEPTH_WRITE
        };

        var shader: Shader3D = Shader3D.add("GrassShader", attributeMap, uniformMap, false, false);
        var subShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        var pass: ShaderPass = subShader.addShaderPass(UnityGrassVS, UnityGrassFS, stateMap, "Forward");
        pass.renderState.cull = RenderState.CULL_BACK;

    }




    constructor() {

        if (!GrassMaterial.hasInited) {
            GrassMaterial.__init__();
            GrassMaterial.hasInited = true;
        }

        super();
        this.setShaderName("GrassShader");
        // todo  渲染队列选择
        this.alphaTest = false;
        this.renderQueue = Material.RENDERQUEUE_OPAQUE;
        this.depthWrite = true;
        this.cull = RenderState.CULL_BACK;
        this.blend = RenderState.BLEND_DISABLE;
        this.depthTest = RenderState.DEPTHTEST_LESS;
        this.setWindA(1.77,4,new Vector2(0.1,0.1),new Vector2(0.5,0.5));
        this.setWindB(0.25,7.7,new Vector2(0.37,3),new Vector2(0.5,0.5));
        this.setWindC(0.125,11.7,new Vector2(0.77,3),new Vector2(0.5,0.5));
        this.grassHight = 1.0;
        this.grassWidth = 1.0;
        this.grassGroundColor = new Vector3(0.25, 0.49, 0.23);
        this.grassBoundSize = new Vector4(-105,-105,210,210);
        this.albedoTexture = Loader.getRes("res/InstancedIndirectGrassVertexColor.jpg");
    }

    setWindA(windIntensity:number,windFrequency:number,windTiling:Vector2,windWrap:Vector2){
        this._shaderValues.setNumber(GrassMaterial.WINDAINTENSITY,windIntensity);
        this._shaderValues.setNumber(GrassMaterial.WINDAFREQUECY,windFrequency);
        this._shaderValues.setVector2(GrassMaterial.WINDATILING,windTiling);
        this._shaderValues.setVector2(GrassMaterial.WINDAWRAP,windWrap);
    }

    setWindB(windIntensity:number,windFrequency:number,windTiling:Vector2,windWrap:Vector2){
        this._shaderValues.setNumber(GrassMaterial.WINDBINTENSITY,windIntensity);
        this._shaderValues.setNumber(GrassMaterial.WINDBFREQUECY,windFrequency);
        this._shaderValues.setVector2(GrassMaterial.WINDBTILING,windTiling);
        this._shaderValues.setVector2(GrassMaterial.WINDBWRAP,windWrap);
    }

    setWindC(windIntensity:number,windFrequency:number,windTiling:Vector2,windWrap:Vector2){
        this._shaderValues.setNumber(GrassMaterial.WINDCINTENSITY,windIntensity);
        this._shaderValues.setNumber(GrassMaterial.WINDCFREQUECY,windFrequency);
        this._shaderValues.setVector2(GrassMaterial.WINDCTILING,windTiling);
        this._shaderValues.setVector2(GrassMaterial.WINDCWRAP,windWrap);
    }

    set grassHight(value:number){
        this._shaderValues.setNumber(GrassMaterial.GRASSHEIGHT,value);
    }

    set grassWidth(value:number){
        this._shaderValues.setNumber(GrassMaterial.GRASSWIDTH,value);
    }

    set grassGroundColor(value:Vector3){
        this._shaderValues.setVector3(GrassMaterial.GROUNDCOLOR,value);
    }

    set grassBoundSize(value:Vector4){
        this._shaderValues.setVector(GrassMaterial.GRASSBOUND,value);
    }

    set albedoTexture(value:BaseTexture){
        this._shaderValues.setTexture(GrassMaterial.ALBEDOTEXTURE,value);
    }


    
}