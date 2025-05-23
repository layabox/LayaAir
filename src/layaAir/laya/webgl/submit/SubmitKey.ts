import { BlendMode } from "../canvas/BlendMode";

/**
 * ...
 * @author xie
 */
export class SubmitKey {
    blendShader: BlendMode;
    // submitType: number;
    other: number;

    constructor() {
        this.clear();
    }

    clear(): void {
        // this.submitType = -1;
        this.blendShader = this.other = 0;
        //alpha = 1;
    }
}


