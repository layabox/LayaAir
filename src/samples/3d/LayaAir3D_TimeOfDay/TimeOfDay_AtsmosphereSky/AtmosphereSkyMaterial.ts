import { Material } from "laya/d3/core/material/Material";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { SubShader } from "laya/d3/shader/SubShader";
import LensFlaresVS from "./Shader/AtmoSphereSky.vs";
import LensFlaresFS from "./Shader/AtmoSphereSky.fs";
import SkyUtil from "./Shader/SkyUtil.glsl";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { ShaderPass } from "laya/d3/shader/ShaderPass";

export class AtmosphereSkyMaterial extends Material{
    /**@internal */
	static KRadius: number = Shader3D.propertyNameToID("u_kradius");
	/**@internal */
	static KScale: number = Shader3D.propertyNameToID("u_kScale");
	/**@internal */
	static K4PI: number = Shader3D.propertyNameToID("u_k4PI");
	/**@internal */
	static KSun: number = Shader3D.propertyNameToID("u_kSun");
	/**@internal */
	static SunSkyColor: number = Shader3D.propertyNameToID("u_SunSkyColor");
	/**@internal */
	static MoonSkyColor: number = Shader3D.propertyNameToID("u_MoonSkyColor");
    /**@internal */
	static LocalSunDirection: number = Shader3D.propertyNameToID("u_LocalSunDirection");
	/**@internal */
	static LocalMoonDirection: number = Shader3D.propertyNameToID("u_LocalMoonDirection");
	/**@internal */
	static KBetaMIE: number = Shader3D.propertyNameToID("u_kBetaMie");
	/**@internal */
	static MoonHaloPower: number = Shader3D.propertyNameToID("u_MoonHaloPower");
	/**@internal */
	static MoonHaloColor: number = Shader3D.propertyNameToID("u_MoonHaloColor");
	/**@internal */
	static GroundColor: number = Shader3D.propertyNameToID("u_GroundColor");
    /**@internal */
    static FogColor: number = Shader3D.propertyNameToID("u_FogColor");
	/**@internal */
	static Contrast: number = Shader3D.propertyNameToID("u_Contrast");
	/**@internal */
	static Brightness: number = Shader3D.propertyNameToID("u_Brightness");
    /**@internal */
	static Fogginess: number = Shader3D.propertyNameToID("u_Fogginess");
	/**@internal */
	static NoonColor: number = Shader3D.propertyNameToID("u_noonColor");

    static ISINIT:boolean = false;

    static init(){
        AtmosphereSkyMaterial.ISINIT = true;
        Shader3D.addInclude("SkyUtil.glsl", SkyUtil);
        let attributeMap = {
			'a_Position': VertexMesh.MESH_POSITION0
		};
		let uniformMap = {
			'u_kradius': Shader3D.PERIOD_MATERIAL,
			'u_kScale': Shader3D.PERIOD_MATERIAL,
			'u_k4PI': Shader3D.PERIOD_MATERIAL,
			'u_kSun': Shader3D.PERIOD_MATERIAL,
			
            'u_SunSkyColor': Shader3D.PERIOD_MATERIAL,
			'u_MoonSkyColor': Shader3D.PERIOD_MATERIAL,
            'u_LocalSunDirection': Shader3D.PERIOD_MATERIAL,
			'u_LocalMoonDirection': Shader3D.PERIOD_MATERIAL,
			
            'u_kBetaMie': Shader3D.PERIOD_MATERIAL,
			'u_MoonHaloPower': Shader3D.PERIOD_MATERIAL,
			'u_MoonHaloColor': Shader3D.PERIOD_MATERIAL,
			'u_GroundColor': Shader3D.PERIOD_MATERIAL,

            'u_FogColor': Shader3D.PERIOD_MATERIAL,
            'u_Contrast':Shader3D.PERIOD_MATERIAL,
			'u_Brightness': Shader3D.PERIOD_MATERIAL,
			'u_Fogginess': Shader3D.PERIOD_MATERIAL,
			'u_noonColor': Shader3D.PERIOD_MATERIAL,

			'u_ViewProjection': Shader3D.PERIOD_CAMERA,//TODO:优化
		};
		let shader = Shader3D.add("AtmosphereSky");
		let subShader = new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		subShader.addShaderPass(LensFlaresVS, LensFlaresFS);

    }
    constructor(){
        if(!AtmosphereSkyMaterial.ISINIT){
            AtmosphereSkyMaterial.init();
        }
        super();
        this.setShaderName("AtmosphereSky");
        this.shaderData.setVector(AtmosphereSkyMaterial.KRadius,new Vector4(1,1,1,1.1));
        this.shaderData.setVector(AtmosphereSkyMaterial.KScale,new Vector4(24,0.25,160,0.001));
        this.shaderData.setVector(AtmosphereSkyMaterial.K4PI,new Vector4(0.13,0.24,0.49,0.025));
        this.shaderData.setVector(AtmosphereSkyMaterial.KSun,new Vector4(0.42,0.76,1.6,1.5));

        this.shaderData.setVector3(AtmosphereSkyMaterial.SunSkyColor,new Vector3(1.0,0.95,0.92));
        this.shaderData.setVector3(AtmosphereSkyMaterial.NoonColor,new Vector3(0.303,0.303,0.462));
        this.shaderData.setVector3(AtmosphereSkyMaterial.LocalSunDirection,new Vector3(0,1,0));
        this.shaderData.setVector3(AtmosphereSkyMaterial.MoonSkyColor,new Vector3(0.0,0.04,0.4));
        this.shaderData.setVector3(AtmosphereSkyMaterial.MoonHaloColor,new Vector3(0.66,0.57,0.32));
        this.shaderData.setVector3(AtmosphereSkyMaterial.LocalMoonDirection,new Vector3(0,-1,0));
        this.shaderData.setVector3(AtmosphereSkyMaterial.KBetaMIE,new Vector3(0.13,1.5,-1.4));
        this.shaderData.setVector3(AtmosphereSkyMaterial.GroundColor,new Vector3(0.37,0.35,0.34));
        this.shaderData.setVector3(AtmosphereSkyMaterial.FogColor,new Vector3(0.75,0.75,0.75));

        this.shaderData.setNumber(AtmosphereSkyMaterial.MoonHaloPower,100);
        this.shaderData.setNumber(AtmosphereSkyMaterial.Fogginess,0.0);
        this.shaderData.setNumber(AtmosphereSkyMaterial.Contrast,1.5);
        this.shaderData.setNumber(AtmosphereSkyMaterial.Brightness,1.5);
    }
    /**
     * 太阳方向
     */
    set sonDirection(value:Vector3){
        this.shaderData.setVector3(AtmosphereSkyMaterial.LocalSunDirection,value);
    }
    /**
     * 月亮方向
     */
    set moonDirection(value:Vector3){
        this.shaderData.setVector3(AtmosphereSkyMaterial.LocalMoonDirection,value);
    }


}