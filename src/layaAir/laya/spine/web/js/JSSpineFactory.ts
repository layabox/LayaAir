import { ISpineFactory } from "../../interface/ISpineFactory";
import { ISpineTempletParser } from "../../interface/ISpineParse";
import { ISpineRender } from "../../interface/ISpineRender";
import { SpineOptimizeRender } from "../base/optimize/SpineOptimizeRender";
import { WebSpineTempletParser } from "./parse/WebSpineTempletParser";

export class JSSpineFactory implements ISpineFactory {
    createSpineTempletParser(): ISpineTempletParser {
        return new WebSpineTempletParser();
    }
    createSpineRender(): ISpineRender {
        return new SpineOptimizeRender();
    }
}