import { Point } from "../../maths/Point";
import { Rectangle } from "../../maths/Rectangle";
import { ILayout } from "./ILayout";

export interface IListLayout extends ILayout {
    get numItems(): number;
    set numItems(value: number);

    get itemSize(): Point;
    set itemSize(value: Point);

    childIndexToItemIndex(index: number): number;
    itemIndexToChildIndex(index: number): number;

    getRectByItemIndex(index: number): Rectangle;

    refreshVirtualList(): void;

    /** @internal */
    _setVirtual(loop: boolean): void;
    /** @internal */
    readonly _virtual: boolean;
}