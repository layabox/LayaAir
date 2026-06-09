import { VFXState } from "../VFXState";
import { VisualEffect } from "../VisualEffect";
import { ComputeCommandBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeCommandBuffer";

export abstract class VFXSystem {

    effect: VisualEffect;

    abstract init(): void;

    abstract update(state: VFXState, cmd: ComputeCommandBuffer): void;

    abstract release(): void;
}
