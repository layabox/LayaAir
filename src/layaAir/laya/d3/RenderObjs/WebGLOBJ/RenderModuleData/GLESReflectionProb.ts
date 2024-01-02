import { ShaderData } from "../../../../RenderEngine/RenderShader/ShaderData";
import { Color } from "../../../../maths/Color";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { TextureCube } from "../../../../resource/TextureCube";
import { IReflectionProbeData } from "../../../RenderDriverLayer/RenderModuleData/IReflectionProbeData";
import { AmbientMode } from "../../../core/scene/AmbientMode";
import { Bounds } from "../../../math/Bounds";

export class GLESReflectionProbe implements IReflectionProbeData{
    boxProjection: boolean;
    bound: Bounds;
    ambientMode: AmbientMode;
    ambientSH: Float32Array;
    ambientIntensity: number;
    reflectionIntensity: number;
    reflectionTexture: TextureCube;
    iblTex: TextureCube;
    setShCoefficients(value: Vector4[]): void {
        throw new Error("Method not implemented.");
    }
    setprobePosition(value: Vector3): void {
        throw new Error("Method not implemented.");
    }
    setAmbientColor(value: Color): void {
        throw new Error("Method not implemented.");
    }
    applyRenderData(data: ShaderData): number {
        throw new Error("Method not implemented.");
    }
    
}