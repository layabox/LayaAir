import { IMeshRenderNode } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { LayaXBaseRenderNode } from "./LayaXBaseRenderNode";

/**
 * LayaX MeshRenderNode bridge.
 *
 * Extends LayaXBaseRenderNode and implements IMeshRenderNode.
 * Creates `conchLayaXMeshRenderNode`, whose C++ wrapper owns the LayaX mesh node handle.
 */
export class LayaXMeshRenderNode extends LayaXBaseRenderNode implements IMeshRenderNode {

    /** @internal */
    protected _getNativeObj(): void {
        // The mesh node has a distinct native constructor registered by the module factory.
        this._nativeObj = new (window as any).conchLayaXMeshRenderNode();
    }
}
