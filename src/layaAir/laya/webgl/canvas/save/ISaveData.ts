import { GraphicsRunner } from "../../../display/Scene2DSpecial/GraphicsRunner";
import { Context } from "../../../renders/Context"
export interface ISaveData {
    isSaveMark(): boolean;
    restore(runner: GraphicsRunner): void;
}
