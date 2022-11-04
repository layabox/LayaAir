import { BaseRender } from "../../../../d3/core/render/BaseRender";
import { Transform3D } from "../../../../d3/core/Transform3D";
import { Bounds } from "../../../../d3/math/Bounds";
import { IBaseRenderNode } from "../../../RenderInterface/RenderPipelineInterface/IBaseRenderNode";

export class NativeBaseRenderNode implements IBaseRenderNode {

    private _nativeObj: any;
    private _bounds: Bounds = null;
    private _geometryBounds: Bounds = null;
    private _transform: Transform3D = null;
    constructor() {
        this._nativeObj = new (window as any).conchRenderNode();
    }
    set boundsChange(value: boolean) {
        this._nativeObj.boundsChange = value;
    }
    get boundsChange(): boolean {
        return this._nativeObj.boundsChange;
    }

    set layer(value: number) {
        this._nativeObj.layer = value;
    }

    get layer(): number {
        return this._nativeObj.layer;
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

    get bounds(): Bounds {
        return this._bounds;
    }
    set bounds(value: Bounds) {
        this._bounds = value;
        this._nativeObj.bounds = (value as any)._imp._nativeObj;
    }

    sortingFudge: number;

    get distanceForSort(): number {
        return this._nativeObj.distanceForSort;
    }
    set distanceForSort(value: number) {
        this._nativeObj.distanceForSort = value;
    }

    get transform(): Transform3D {
        return this._transform;
    }
    set transform(value: Transform3D) {
        this._transform = value;
        this._nativeObj.transform = value ? (value as any)._nativeObj : null;
    }
    
    get owner(): BaseRender | null {
        return this._nativeObj.owner;
    }
    set owner(value: BaseRender | null) {
        this._nativeObj.owner = value;
    }

    get geometryBounds(): Bounds | null {
        return this._geometryBounds;
    }

    set geometryBounds(value: Bounds | null) {
        this._geometryBounds = value;
        this._nativeObj.geometryBounds = (value as any)._imp._nativeObj;
    }

    get renderbitFlag(): number {
        return this._nativeObj.renderbitFlag;
    }
    set renderbitFlag(value: number | null) {
        this._nativeObj.renderbitFlag = value;
    }
    get staticMask(): number {
        return this._nativeObj.staticMask;
    }
    set staticMask(value: number | null) {
        this._nativeObj.staticMask = value;
    }
}