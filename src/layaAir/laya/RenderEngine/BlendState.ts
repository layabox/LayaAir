import { BlendEquationSeparate } from "./RenderEnum/BlendEquationSeparate";
import { BlendFactor } from "./RenderEnum/BlendFactor";
import { BlendType } from "./RenderEnum/BlendType";

export class BlendState {
    static _blend_All_pool: any = {};
    static _blend_seperate_pool: any = {};
    static create(blendType: number, colorBlendhash: BlendComponent, alphaBlendComponent: BlendComponent) {

    }
    /** Whether to enable blend. */
    blendType: BlendType = 0;
    colorBlendComponent: BlendComponent;
    alphaBlendComponent: BlendComponent;
    constructor(blendType: number) {

    }
}

export class BlendComponent {
    static _pool: any = {};
    static getHash(blendOperationGLData: number, sourceBlendFactor: number, destinationFactor: number): number {
        return (blendOperationGLData) + (sourceBlendFactor << 3) + (destinationFactor << 7);
    }
    static getBlendComponent(blendOperationGLData: number, sourceBlendFactor: number, destinationFactor: number) {
        let index = BlendComponent.getHash(blendOperationGLData, sourceBlendFactor, destinationFactor);
        if (!BlendComponent._pool[index])
            BlendComponent._pool[index] = new BlendComponent(blendOperationGLData, sourceBlendFactor, destinationFactor, index);
        return BlendComponent._pool[index];
    }
    _blendOperation: BlendEquationSeparate;
    _blendOperationGLData: number;
    _sourceBlendFactor: BlendFactor;
    _sourceBlendFactorGLData: number;
    _destinationFactor: BlendFactor;
    _destinationFactorGLData: number;
    _hashIndex = 0;
    constructor(blendOperationGLData: BlendEquationSeparate, sourceBlendFactor: BlendFactor, destinationFactor: BlendFactor, hashindex: number) {
        this._hashIndex = hashindex;
        this._blendOperationGLData = blendOperationGLData;
        this._sourceBlendFactor = sourceBlendFactor;
        this._destinationFactor = destinationFactor;
    }




}