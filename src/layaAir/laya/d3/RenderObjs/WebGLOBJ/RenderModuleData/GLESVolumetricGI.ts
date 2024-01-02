import { ShaderData } from "../../../../RenderEngine/RenderShader/ShaderData";
import { Vector3 } from "../../../../maths/Vector3";
import { IVolumetricGIData } from "../../../RenderDriverLayer/RenderModuleData/IVolumetricGIData";
import { Bounds } from "../../../math/Bounds";

export class GLESVolumetricGI implements IVolumetricGIData {
    irradiance: number;
    distance: number;
    normalBias: number;
    viewBais: number;
    bound: Bounds;
    intensity: number;
    _probeCounts: Vector3 = new Vector3();
    _probeStep: Vector3 = new Vector3();

    setProbeCounts(value: Vector3): void {
        value.cloneTo(this._probeCounts);
    }

    setProbeStep(value: Vector3): void {
        value.cloneTo(this._probeStep);
    }

    applyRenderData(data: ShaderData): number {
        throw new Error("Method not implemented.");
    }

}