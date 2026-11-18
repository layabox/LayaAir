import { DecalMaterial } from "laya/d3/core/material/DecalMaterial";
import { DecalShaderInit } from "laya/d3/shader/decal/DecalShaderInit";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { ShaderDataType } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Color } from "laya/maths/Color";
import WaterSurface from "./FlowingWaterDecalSurface.glsl";

/** Sample-only water surface; projection and filtering use the built-in decal passes.
 * 仅用于示例的水渍表面；投射与过滤使用引擎内置贴花 pass。 */
export class FlowingWaterDecalMaterial extends DecalMaterial {
    private static readonly _shaderName = "SampleFlowingWaterDecal";
    private static _time: number;
    private static _speed: number;

    constructor() {
        super();
        FlowingWaterDecalMaterial._time = Shader3D.propertyNameToID("u_WaterTime");
        FlowingWaterDecalMaterial._speed = Shader3D.propertyNameToID("u_WaterFlowSpeed");
        DecalShaderInit.createShader(FlowingWaterDecalMaterial._shaderName, {
            uniforms: { u_WaterTime: ShaderDataType.Float, u_WaterFlowSpeed: ShaderDataType.Float, u_WaterTint: ShaderDataType.Color },
            defaults: { u_WaterTime: 0, u_WaterFlowSpeed: 0.16, u_WaterTint: new Color(0.24, 0.27, 0.28, 0.95) },
            fragmentPrelude: "#define DECAL_SURFACE_MODIFIER\n" + WaterSurface + "\n"
        });
        this.setShaderName(FlowingWaterDecalMaterial._shaderName);
        this.albedoOpacity = 0.68;
        this.normalOpacity = 0.8;
        this.maosOpacity = 0.95;
    }

    /** Flow time in seconds. Holding this value freezes the water pattern.
     * 流动时间，单位为秒；保持该值不变即可冻结水渍图案。 */
    get time(): number { return this.shaderData.getNumber(FlowingWaterDecalMaterial._time); }
    set time(value: number) {
        if (!isFinite(value)) throw new RangeError("FlowingWaterDecalMaterial.time must be finite.");
        this.shaderData.setNumber(FlowingWaterDecalMaterial._time, value);
    }

    /** Downward speed in projector UV units per second; the sample wall height is 2.35.
     * 向下流动速度，单位为投射器 UV/秒；示例墙面的高度为 2.35。 */
    get flowSpeed(): number { return this.shaderData.getNumber(FlowingWaterDecalMaterial._speed); }
    set flowSpeed(value: number) {
        if (!isFinite(value)) throw new RangeError("FlowingWaterDecalMaterial.flowSpeed must be finite.");
        this.shaderData.setNumber(FlowingWaterDecalMaterial._speed, Math.max(0, Math.min(2, value)));
    }

    clone(): FlowingWaterDecalMaterial {
        const material = new FlowingWaterDecalMaterial();
        this.cloneTo(material);
        return material;
    }
}
