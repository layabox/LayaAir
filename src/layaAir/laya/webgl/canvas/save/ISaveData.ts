import { GraphicsRunner } from "../../../display/Scene2DSpecial/GraphicsRunner";
export interface ISaveData {
    isSaveMark(): boolean;
    restore(runner: GraphicsRunner): void;
}
