import { RenderState } from "../../RenderModuleData/Design/RenderState";

/**
 * LayaX RenderState — Rust-backed render state.
 *
 * Inherits all state storage from base RenderState.
 * TODO: Add FFI sync to Rust when RenderState FFI is implemented.
 */
export class LayaXRenderState extends RenderState {
    _nativeObj: any;

    protected createObj(): void {
        // TODO: create native object when FFI sync is implemented
        this._nativeObj = null;
    }

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
