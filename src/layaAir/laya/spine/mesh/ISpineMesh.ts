import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { Graphics } from "../../display/Graphics";
import { Material } from "../../resource/Material";
import { ISlotExtend } from "../slot/ISlotExtend";


export interface ISpineMesh {
    appendSlot(slot: ISlotExtend, getBoneId: (boneIndex: number) => number): void;

    clone(): ISpineMesh;
    
    vertexDeclarition: VertexDeclaration;

    material: Material;

    draw(graphics: Graphics): void;
}