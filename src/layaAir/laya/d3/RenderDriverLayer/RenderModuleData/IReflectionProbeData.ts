import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";
import { TextureCube } from "../../../resource/TextureCube";
import { AmbientMode } from "../../core/scene/AmbientMode";
import { Bounds } from "../../math/Bounds";

export interface IReflectionProbeData {
    /**@internal */
    boxProjection: boolean;
    /**@internal */
    bound: Bounds;
    /**@internal */
    ambientMode: AmbientMode;
    /**@internal */
    ambientSH: Float32Array;
    /**@internal */
    ambientIntensity: number;
    /**@internal */
    reflectionIntensity: number;
    /**@internal */
    reflectionTexture: TextureCube;
    /**@internal */
    iblTex: TextureCube;//textureCube id
    /**@internal */
    updateMark: number;
    /**@internal */
    iblTexRGBD: boolean;
    /**@internal */
    setprobePosition(value: Vector3): void;
    /**@internal */
    setAmbientColor(value: Color): void;
    /**@internal */
    setAmbientSH(value: Float32Array): void
}