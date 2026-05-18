import { IMeshRenderNode } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { LayaXBaseRenderNode } from "./LayaXBaseRenderNode";

/**
 * LayaX MeshRenderNode bridge.
 *
 * Extends LayaXBaseRenderNode and implements IMeshRenderNode.
 * Currently identical to the base — the native class `conchLayaXMeshRenderNode`
 * may carry additional mesh-specific state on the Rust side.
 */
export class LayaXMeshRenderNode extends LayaXBaseRenderNode implements IMeshRenderNode {

    /** @internal */
    protected _getNativeObj(): void {
        // TODO(Q13): Confirm if LayaX needs a distinct native class for mesh render nodes
        // or if conchLayaXBaseRenderNode is sufficient.
        this._nativeObj = new (window as any).conchLayaXMeshRenderNode();
    }
}
