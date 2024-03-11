/**
 * ...
 * @author xie
 */
export class SubmitKey {
    blendShader: number;
    submitType: number;
    other: number;

    constructor() {
        this.clear();
    }

    clear(): void {
        this.submitType = -1;
        this.blendShader = this.other = 0;
        //alpha = 1;
    }
}


