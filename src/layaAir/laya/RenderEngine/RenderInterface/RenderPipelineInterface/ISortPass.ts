import { SingletonList } from "../../../d3/component/SingletonList";
import { RenderElement } from "../../../d3/core/render/RenderElement";
import { IRenderElement } from "./IRenderElement";

export interface ISortPass {
    /**
     * 排序
     * @param elements 
     * @param left 
     * @param right 
     */
    sort(elements: SingletonList<RenderElement>, isTransparent: boolean, left: number, right: number): void;
}