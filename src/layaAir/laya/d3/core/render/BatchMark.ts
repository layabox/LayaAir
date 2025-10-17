import { IRenderElement3D } from "../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";

/**
 * @internal
 */
export class BatchMark {
	/**@internal */
	updateMark: number = -1;
	/**@internal */
	indexInList: number = -1;
	/**@internal */
	batched: boolean = false;

	/**@internal */
	_curBindElementIndex: number = 0;

	_cacheRenderElement: IRenderElement3D[] = [];
	//userCacheData:any = null;
}

