import { Color } from "../../../../maths/Color";
import { Vector4 } from "../../../../maths/Vector4";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Texture } from "../../../../resource/Texture";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRender2DPass } from "./IRender2DPass";

export interface IRender2DDataHandle {
    inheriteRenderData(context: IRenderContext2D): void;
}

export interface I2DPrimitiveDataHandle extends IRender2DDataHandle {
    textureHost: Texture | BaseTexture;
}

export interface I2DBaseRenderDataHandle extends IRender2DDataHandle {
    lightReceive: boolean;

}

export interface IMesh2DRenderDataHandle extends I2DBaseRenderDataHandle {
    baseColor: Color;
    baseTexture: BaseTexture;
    baseTextureRange: Vector4;
    textureRangeIsClip: boolean;
    normal2DTexture: BaseTexture;
    normal2DStrength: number;
}