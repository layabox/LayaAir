import { Sprite } from "../display/Sprite";
import { Spine2DRenderNode } from "./Spine2DRenderNode";

export class SpineComponent extends Sprite {
    constructor() {
        super();
        this.addComponent(Spine2DRenderNode);
    }
}