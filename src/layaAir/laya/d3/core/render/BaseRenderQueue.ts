import { IRenderQueue } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderQueue";
import { SingletonList } from "../../component/SingletonList";
import { RenderElement } from "./RenderElement";

export class BaseRenderQueue{
    /** @interanl */
    isTransparent:boolean = false;
    /** @internal */
	elements: SingletonList<RenderElement> = new SingletonList<RenderElement>();
    renderQueueOBJ:IRenderQueue;


}