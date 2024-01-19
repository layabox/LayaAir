import { DefineDatas } from "../../../RenderEngine/RenderShader/DefineDatas";
import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Transform3D } from "../../core/Transform3D";

export interface ICameraNodeData {
    transform: Transform3D;
    farplane: number;
    nearplane: number;
    fieldOfView: number;
    aspectRatio: number;
    setProjectionViewMatrix(value: Matrix4x4): void;
}

export interface ISceneNodeData {
    lightmapDirtyFlag: number;
}


export interface IShaderPassData {
    pipelineMode:string;
    statefirst:boolean;
    getCacheShader(defines:DefineDatas):ShaderInstance;
    setCacheShader(defines:DefineDatas):ShaderInstance;
}


export interface ISubshaderData {
    addOneShaderPass(value: IShaderPassData): void;
    

}