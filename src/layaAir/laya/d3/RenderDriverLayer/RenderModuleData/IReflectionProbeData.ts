import { ShaderData } from "../../../RenderEngine/RenderShader/ShaderData";
import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { TextureCube } from "../../../resource/TextureCube";
import { AmbientMode } from "../../core/scene/AmbientMode";
import { Bounds } from "../../math/Bounds";

export interface IReflectionProbeData {

    boxProjection: boolean;
    bound: Bounds;
    ambientMode: AmbientMode;
    ambientSH: Float32Array;
    ambientIntensity: number;
    reflectionIntensity: number;
    reflectionTexture: TextureCube;
    iblTex: TextureCube;//textureCube id
    //Legency 
    setShCoefficients(value: Vector4[]): void;
    setprobePosition(value: Vector3): void;
    setAmbientColor(value: Color): void;
    applyRenderData(data: ShaderData): number;
}