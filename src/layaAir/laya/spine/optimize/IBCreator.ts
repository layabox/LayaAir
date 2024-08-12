import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { SpineMeshBase } from "../mesh/SpineMeshBase";
import { MultiRenderData } from "./MultiRenderData";

export class IBCreator {
    type:IndexFormat;
    size:number;
    ib: Uint16Array|Uint32Array|Uint8Array;
    ibLength: number;
    maxIndexCount:number
    outRenderData: MultiRenderData;

    get realIb(): Uint16Array|Uint32Array|Uint8Array {
        return this.ib;
    }

    constructor(type:IndexFormat , maxIndexCount : number ) {
        this.type = type;
        this.maxIndexCount = maxIndexCount;
        // this.ib = new Uint16Array(SpineMeshBase.maxVertex * 3);
        switch (type) {
            case IndexFormat.UInt16:
                this.size = 2;
                this.ib = new Uint16Array(maxIndexCount);
                break;
            case IndexFormat.UInt8:
                this.size = 1;
                this.ib = new Uint8Array(maxIndexCount);
                break;
                
            case IndexFormat.UInt32:
                this.size = 4
                this.ib = new Uint32Array(maxIndexCount);
                break;
        }
        this.ibLength = 0;
    }
}