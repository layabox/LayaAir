import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { SingletonList } from "../../../utils/SingletonList";
import { InternalRenderTarget } from "../RenderDevice/InternalRenderTarget";
import { IRenderCMD } from "../RenderDevice/IRenderCMD";
import { ShaderData } from "../RenderDevice/ShaderData";
import { IRenderElement2D } from "./IRenderElement2D";

/**
 * @blueprintIgnore
 */
export interface IRenderContext2D {

    invertY: boolean;
    pipelineMode: string;
    passData: ShaderData;
    setRenderTarget(value: InternalRenderTarget, clear: boolean, clearColor: Color): void;
    getRenderTarget(): InternalRenderTarget;
    setOffscreenView(width: number, height: number, x?: number, y?: number): void;
    getOffscreenView(out: Vector4): void;
    drawRenderElementOne(node: IRenderElement2D): void;
    drawRenderElementList(list: SingletonList<IRenderElement2D>): number;
    runOneCMD(cmd: IRenderCMD): void
    runCMDList(cmds: IRenderCMD[]): void;
}