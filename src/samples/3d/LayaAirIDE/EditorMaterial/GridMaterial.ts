import { Material } from "laya/d3/core/material/Material";
import { SubShader } from "laya/d3/shader/SubShader";
import GridLineVS from "../EditorShader/GridLine.vs";
import GridLineFS from "../EditorShader/GridLine.fs";
import { ShaderPass } from "laya/d3/shader/ShaderPass";
import { RenderState } from "laya/d3/core/material/RenderState";
import { Vector4 } from "laya/d3/math/Vector4";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";

export class GridMaterial extends Material {

    static COLOR: number;
    static STEP: number;

    static __init__(): void {
        GridMaterial.COLOR = Shader3D.propertyNameToID("u_Color");
        GridMaterial.STEP = Shader3D.propertyNameToID("u_Step");
        var shader: Shader3D = Shader3D.add("_GridShader",  false, false);
        var subShader: SubShader = new SubShader();
        shader.addSubShader(subShader);
        
        var shaderPass: ShaderPass = subShader.addShaderPass(GridLineVS, GridLineFS);
        shaderPass.renderState.depthWrite = false;
        shaderPass.renderState.blend = RenderState.BLEND_ENABLE_ALL;
        shaderPass.renderState.srcBlend = RenderState.BLENDPARAM_SRC_ALPHA;
        shaderPass.renderState.dstBlend = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
        shaderPass.renderState.depthTest = RenderState.DEPTHTEST_LESS;
    }

    /**
     * 获取颜色。
     * @return 颜色。
     */
    get color(): Vector4 {
        return (<Vector4>this._shaderValues.getVector(GridMaterial.COLOR));
    }

    /**
     * 设置颜色。
     * @param value 颜色。
     */
    set color(value: Vector4) {
        this._shaderValues.setVector(GridMaterial.COLOR, value);
    }

    /** 
     * 
     */
    set step(value: number) {
        this._shaderValues.setNumber(GridMaterial.STEP, value);
    }

    get step(): number {
        return this._shaderValues.getNumber(GridMaterial.STEP);
    }

    constructor() {
        super();
        this.setShaderName("_GridShader");
        this._shaderValues.setNumber(GridMaterial.STEP, 10);
        this._shaderValues.setVector(GridMaterial.COLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
    }

    clone(): any {
        var dest: GridMaterial = new GridMaterial();
        this.cloneTo(dest);
        return dest;
    }
}