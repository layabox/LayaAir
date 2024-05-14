import { Vector4 } from "../../maths/Vector4";
import { Material } from "../../resource/Material";
import { Texture } from "../../resource/Texture";

export interface IOptimizeMaterial extends Material{
    boneMat: Float32Array;
    blendMode:number;
    texture:Texture;
    color:Vector4;
    nMatrix: Float32Array
}