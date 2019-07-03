import { Transform } from "./Transform";
import { Texture } from "../../resource/Texture";
export declare class SkinSlotDisplayData {
    name: string;
    attachmentName: string;
    type: number;
    transform: Transform;
    width: number;
    height: number;
    texture: Texture;
    bones: any[];
    uvs: any[];
    weights: any[];
    triangles: any[];
    vertices: any[];
    lengths: any[];
    verLen: number;
    createTexture(currTexture: Texture): Texture;
    destory(): void;
}
