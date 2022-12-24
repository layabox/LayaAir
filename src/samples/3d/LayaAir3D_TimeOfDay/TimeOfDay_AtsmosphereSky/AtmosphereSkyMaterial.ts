import { Material } from "laya/d3/core/material/Material";
import LensFlaresVS from "./Shader/AtmoSphereSky.vs";
import LensFlaresFS from "./Shader/AtmoSphereSky.fs";
import SkyUtil from "./Shader/SkyUtil.glsl";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Vector3 } from "laya/maths/Vector3";
import { Vector4 } from "laya/maths/Vector4";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";

export class AtmosphereSkyMaterial extends Material {
    /**@internal */
    static KRadius: number;
    /**@internal */
    static KScale: number;
    /**@internal */
    static K4PI: number;
    /**@internal */
    static KSun: number;
    /**@internal */
    static SunSkyColor: number;
    /**@internal */
    static MoonSkyColor: number;
    /**@internal */
    static LocalSunDirection: number;
    /**@internal */
    static LocalMoonDirection: number;
    /**@internal */
    static KBetaMIE: number;
    /**@internal */
    static MoonHaloPower: number;
    /**@internal */
    static MoonHaloColor: number;
    /**@internal */
    static GroundColor: number;
    /**@internal */
    static FogColor: number;
    /**@internal */
    static Contrast: number;
    /**@internal */
    static Brightness: number;
    /**@internal */
    static Fogginess: number;
    /**@internal */
    static NoonColor: number;

    static ISINIT: boolean = false;

    static init() {
        AtmosphereSkyMaterial.KRadius = Shader3D.propertyNameToID("u_kradius");
        AtmosphereSkyMaterial.KScale = Shader3D.propertyNameToID("u_kScale");
        AtmosphereSkyMaterial.K4PI = Shader3D.propertyNameToID("u_k4PI");
        AtmosphereSkyMaterial.KSun = Shader3D.propertyNameToID("u_kSun");
        AtmosphereSkyMaterial.SunSkyColor = Shader3D.propertyNameToID("u_SunSkyColor");
        AtmosphereSkyMaterial.MoonSkyColor = Shader3D.propertyNameToID("u_MoonSkyColor");
        AtmosphereSkyMaterial.LocalSunDirection = Shader3D.propertyNameToID("u_LocalSunDirection");
        AtmosphereSkyMaterial.LocalMoonDirection = Shader3D.propertyNameToID("u_LocalMoonDirection");
        AtmosphereSkyMaterial.KBetaMIE = Shader3D.propertyNameToID("u_kBetaMie");
        AtmosphereSkyMaterial.MoonHaloPower = Shader3D.propertyNameToID("u_MoonHaloPower");
        AtmosphereSkyMaterial.MoonHaloColor = Shader3D.propertyNameToID("u_MoonHaloColor");
        AtmosphereSkyMaterial.GroundColor = Shader3D.propertyNameToID("u_GroundColor");
        AtmosphereSkyMaterial.FogColor = Shader3D.propertyNameToID("u_FogColor");
        AtmosphereSkyMaterial.Contrast = Shader3D.propertyNameToID("u_Contrast");
        AtmosphereSkyMaterial.Brightness = Shader3D.propertyNameToID("u_Brightness");
        AtmosphereSkyMaterial.Fogginess = Shader3D.propertyNameToID("u_Fogginess");
        AtmosphereSkyMaterial.NoonColor = Shader3D.propertyNameToID("u_noonColor");

        AtmosphereSkyMaterial.ISINIT = true;
        Shader3D.addInclude("SkyUtil.glsl", SkyUtil);
        let shader = Shader3D.add("AtmosphereSky");
        let subShader = new SubShader();
        shader.addSubShader(subShader);
        subShader.addShaderPass(LensFlaresVS, LensFlaresFS);
    }
    constructor() {
        if (!AtmosphereSkyMaterial.ISINIT) {
            AtmosphereSkyMaterial.init();
        }
        super();
        this.setShaderName("AtmosphereSky");
        this.shaderData.setVector(AtmosphereSkyMaterial.KRadius, new Vector4(1, 1, 1, 1.1));
        this.shaderData.setVector(AtmosphereSkyMaterial.KScale, new Vector4(24, 0.25, 160, 0.001));
        this.shaderData.setVector(AtmosphereSkyMaterial.K4PI, new Vector4(0.13, 0.24, 0.49, 0.025));
        this.shaderData.setVector(AtmosphereSkyMaterial.KSun, new Vector4(0.42, 0.76, 1.6, 1.5));

        this.shaderData.setVector3(AtmosphereSkyMaterial.SunSkyColor, new Vector3(1.0, 0.95, 0.92));
        this.shaderData.setVector3(AtmosphereSkyMaterial.NoonColor, new Vector3(0.303, 0.303, 0.462));
        this.shaderData.setVector3(AtmosphereSkyMaterial.LocalSunDirection, new Vector3(0, 1, 0));
        this.shaderData.setVector3(AtmosphereSkyMaterial.MoonSkyColor, new Vector3(0.0, 0.04, 0.4));
        this.shaderData.setVector3(AtmosphereSkyMaterial.MoonHaloColor, new Vector3(0.66, 0.57, 0.32));
        this.shaderData.setVector3(AtmosphereSkyMaterial.LocalMoonDirection, new Vector3(0, -1, 0));
        this.shaderData.setVector3(AtmosphereSkyMaterial.KBetaMIE, new Vector3(0.13, 1.5, -1.4));
        this.shaderData.setVector3(AtmosphereSkyMaterial.GroundColor, new Vector3(0.37, 0.35, 0.34));
        this.shaderData.setVector3(AtmosphereSkyMaterial.FogColor, new Vector3(0.75, 0.75, 0.75));

        this.shaderData.setNumber(AtmosphereSkyMaterial.MoonHaloPower, 100);
        this.shaderData.setNumber(AtmosphereSkyMaterial.Fogginess, 0.0);
        this.shaderData.setNumber(AtmosphereSkyMaterial.Contrast, 1.5);
        this.shaderData.setNumber(AtmosphereSkyMaterial.Brightness, 1.5);
    }
    /**
     * 太阳方向
     */
    set sonDirection(value: Vector3) {
        this.shaderData.setVector3(AtmosphereSkyMaterial.LocalSunDirection, value);
    }
    /**
     * 月亮方向
     */
    set moonDirection(value: Vector3) {
        this.shaderData.setVector3(AtmosphereSkyMaterial.LocalMoonDirection, value);
    }


}