import { Color } from "../../../maths/Color";
import { SingletonList } from "../../../utils/SingletonList";
import { InternalRenderTarget } from "../RenderDevice/InternalRenderTarget";
import { IRenderCMD } from "../RenderDevice/IRenderCMD";
import { ShaderData } from "../RenderDevice/ShaderData";
import { IRenderElement2D } from "./IRenderElement2D";

export interface IRenderContext2D {

    invertY: boolean;
    pipelineMode: string;
    sceneData: ShaderData;
    setRenderTarget(value: InternalRenderTarget, clear: boolean, clearColor: Color): void;
    setOffscreenView(width: number, height: number): void;
    drawRenderElementOne(node: IRenderElement2D): void;
    drawRenderElementList(list: SingletonList<IRenderElement2D>): number;
    runOneCMD(cmd: IRenderCMD): void
    runCMDList(cmds: IRenderCMD[]): void;
}