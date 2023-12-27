import { SingletonList } from "../../../../../utils/SingletonList";
import { RenderElementOBJ } from "../../../RenderObj/RenderElementOBJ";
import { GLESRenderContext3D } from "../../GLESRenderContext3D";
import { QuickSort } from "./QuickSort";


export class GLESRenderQueueList {
    /** @internal */
    _elements: SingletonList<RenderElementOBJ> = new SingletonList<RenderElementOBJ>();
    private quickSort: QuickSort;
    private _isTransparent: boolean;

    constructor(isTransParent: boolean) {
        this._isTransparent = isTransParent;
        this.quickSort = new QuickSort();
    }

    addRenderElement(renderelement: RenderElementOBJ) {
        this._elements.add(renderelement);
    }

    renderQueue(context: GLESRenderContext3D) {
        //this._batchQueue();//合并的地方
        var count: number = this._elements.length;
        this.quickSort.sort(this._elements, this._isTransparent, 0, count - 1);
        context.drawRenderElementList(this._elements);
    }

    clear(): void {
        this._elements.length = 0;
    }
}