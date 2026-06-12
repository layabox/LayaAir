import { ISceneNodeData } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";

/**
 * LayaX SceneNodeData bridge.
 *
 * Wraps scene-level data (currently just the lightmap dirty flag) for the Rust
 * rendering pipeline via `conchLayaXSceneNodeData`.
 */
export class LayaXSceneNodeData implements ISceneNodeData {

    /** @internal */
    _nativeObj: any;

    public get lightmapDirtyFlag(): number {
        return this._nativeObj._lightmapDirtyFlag;
    }
    public set lightmapDirtyFlag(value: number) {
        this._nativeObj._lightmapDirtyFlag = value;
    }

    constructor() {
        this._nativeObj = new (window as any).conchLayaXSceneNodeData();
    }
}
