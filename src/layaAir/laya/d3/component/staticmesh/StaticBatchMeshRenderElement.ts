import { RenderElement } from "../../core/render/RenderElement";


export class StaticBatchMeshRenderElement extends RenderElement {

    constructor() {
        super();
    }

    getInvertFront(): boolean {
        return false;
    }

}