import { PixelLineSprite3D } from "./PixelLineSprite3D";
import { PixelLineData } from "./PixelLineData";
import { GeometryElement } from "../GeometryElement";
import { RenderContext3D } from "../render/RenderContext3D";
/**
 * <code>PixelLineFilter</code> 类用于线过滤器。
 */
export declare class PixelLineFilter extends GeometryElement {
    constructor(owner: PixelLineSprite3D, maxLineCount: number);
    /**
     *	{@inheritDoc PixelLineFilter._getType}
     *	@override
     */
    _getType(): number;
    /**
     * 获取线段数据
     * @return 线段数据。
     */
    _getLineData(index: number, out: PixelLineData): void;
    /**
     * @inheritDoc
     * @override
     */
    _prepareRender(state: RenderContext3D): boolean;
    /**
     * @inheritDoc
     * @override
     */
    _render(state: RenderContext3D): void;
    /**
     * @inheritDoc
     * @override
     */
    destroy(): void;
}
