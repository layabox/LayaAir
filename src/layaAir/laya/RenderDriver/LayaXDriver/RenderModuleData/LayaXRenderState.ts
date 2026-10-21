import { RenderState } from "../../RenderModuleData/Design/RenderState";

/**
 * TS render-state value object. ShaderPass and render elements snapshot these
 * fields into immutable C++ render-state handles when preparing a draw.
 */
export class LayaXRenderState extends RenderState {
    constructor() {
        super();
    }

    cloneTo(dest: RenderState): void {
        super.cloneTo(dest);
    }

    clone(): RenderState {
        let state = new LayaXRenderState();
        this.cloneTo(state);
        return state;
    }
}
