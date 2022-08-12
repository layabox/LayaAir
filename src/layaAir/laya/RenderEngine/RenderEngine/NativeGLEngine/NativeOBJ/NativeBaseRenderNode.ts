import { BaseRender } from "../../../../d3/core/render/BaseRender";
import { RenderBounds } from "../../../../d3/core/RenderBounds";
import { Transform3D } from "../../../../d3/core/Transform3D";
import { IBaseRenderNode } from "../../../RenderInterface/RenderPipelineInterface/IBaseRenderNode";

export class NativeBaseRenderNode implements IBaseRenderNode {

    private _nativeObj: any;
    private _bounds: RenderBounds = null;
    private _geometryBounds: RenderBounds = null;
    constructor() {
        this._nativeObj = new (window as any).conchRenderNode();
    }
    set layer(value: number) {
        this._nativeObj.layer = value;
    }

    get renderId(): number {
        return this._nativeObj.renderId;
    }
    set renderId(value: number) {
        this._nativeObj.renderId = value;
    }

    get receiveShadow(): boolean {
        return this._nativeObj.receiveShadow;
    }
    set receiveShadow(value: boolean) {
        this._nativeObj.receiveShadow = value;
    }

    get castShadow(): boolean {
        return this._nativeObj.castShadow;
    }
    set castShadow(value: boolean) {
        this._nativeObj.castShadow = value;
    }

    get bounds(): RenderBounds {
        return this._bounds;
    }
    set bounds(value: RenderBounds) {
        this._bounds = value;
        this._nativeObj.bounds = value ? (value as any)._nativeObj : null;
    }

    sortingFudge: number;

    get distanceForSort(): number {
        return this._nativeObj.distanceForSort;
    }
    set distanceForSort(value: number) {
        this._nativeObj.distanceForSort = value;
    }

    get transform(): Transform3D {
        return null;
    }
    set transform(value: Transform3D) {
        this._nativeObj.transform = value ? (value as any)._nativeObj : null;
    }
    
    get owner(): BaseRender | null {
        return this._nativeObj.owner;
    }
    set owner(value: BaseRender | null) {
        this._nativeObj.owner = value;
    }

    get geometryBounds(): RenderBounds | null {
        return this._geometryBounds;
    }

    set geometryBounds(value: RenderBounds | null) {
        this._geometryBounds = value;
        this._nativeObj.geometryBounds = value ? (value as any)._nativeObj : null;
    }
}