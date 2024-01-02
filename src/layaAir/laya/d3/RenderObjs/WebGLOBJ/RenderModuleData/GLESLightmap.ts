import { Texture2D } from "../../../../resource/Texture2D";
import { ILightMapData } from "../../../RenderDriverLayer/RenderModuleData/ILightMapData";

export class GLESLightmap implements ILightMapData{
    lightmapColor: Texture2D;
    lightmapDirection: Texture2D;

}