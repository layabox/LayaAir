import { ShaderData } from "../../../RenderEngine/RenderShader/ShaderData";
import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { TextureCube } from "../../../resource/TextureCube";
import { AmbientMode } from "../../core/scene/AmbientMode";
import { Bounds } from "../../math/Bounds";

export interface IReflectionProbeData{

    boxProjection:boolean;
    probePosition:Vector3;
    bound:Bounds;
    ambientMode:AmbientMode ;
    abientColor:Color ;
    iblTex:TextureCube;//textureCube id
    ambientSH:Float32Array;
    ambientIntensity:number;
    reflectionIntensity:number;

    //Legency 
    shCoefficients:Vector4[];
    reflectionTexture:TextureCube;
  
    applyRenderData(data:ShaderData):number;
}