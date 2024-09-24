import { RenderElement } from "../../core/render/RenderElement";

/**
 * @internal
 */
export class StaticBatchMeshRenderElement extends RenderElement {

    constructor() {
        super();
    }

    /** @internal */
    getInvertFront(): boolean {
        return false;
    }

}