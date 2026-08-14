import { Color } from "../../maths/Color";
import { Vector2 } from "../../maths/Vector2";
import { I2DBaseRenderDataHandle } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";

/**
 * @en Platform-specific Spine 2D render-data handle.
 * @zh 平台对应的 Spine 2D 渲染数据句柄。
 * @blueprintIgnore
 */
export interface ISpineRenderDataHandle extends I2DBaseRenderDataHandle {
    baseColor: Color;
    skeleton: spine.Skeleton;
    offset: Vector2;
    /**
     * @internal
     * @en Matrix version already consumed by the current Spine render data.
     * @zh 当前 Spine 渲染数据已经处理的矩阵版本。
     */
    renderMatrixVersion: number;
}
