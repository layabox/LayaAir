import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";


export class NativeRenderState {
	_nativeObj: any;

	set cull(value: number) {
		this._nativeObj.cull = value;
	}
	get cull(): number {
		return this._nativeObj.cull;
	}

	set blend(value: number) {
		this._nativeObj.blend = value;
	}
	get blend(): number {
		return this._nativeObj.blend;
	}

	set srcBlend(value: number) {
		this._nativeObj.srcBlend = value;
	}
	get srcBlend(): number {
		return this._nativeObj.srcBlend;
	}

	set dstBlend(value: number) {
		this._nativeObj.dstBlend = value;
	}
	get dstBlend(): number {
		return this._nativeObj.dstBlend;
	}
	
	set srcBlendRGB(value: number) {
		this._nativeObj.srcBlendRGB = value;
	}
	get srcBlendRGB(): number {
		return this._nativeObj.srcBlendRGB;
	}
	
	set dstBlendRGB(value: number) {
		this._nativeObj.dstBlendRGB = value;
	}
	get dstBlendRGB(): number {
		return this._nativeObj.dstBlendRGB;
	}
	
	set srcBlendAlpha(value: number) {
		this._nativeObj.srcBlendAlpha = value;
	}
	get srcBlendAlpha(): number {
		return this._nativeObj.srcBlendAlpha;
	}
	
	set dstBlendAlpha(value: number) {
		this._nativeObj.dstBlendAlpha = value;
	}
	get dstBlendAlpha(): number {
		return this._nativeObj.dstBlendAlpha;
	}

	set blendConstColor(color: Vector4) {
		this._nativeObj.setBlendConstColor(color.x, color.y, color.z, color.w);
	}
	
	set blendEquation(value: number) {
		this._nativeObj.blendEquation = value;
	}
	get blendEquation(): number {
		return this._nativeObj.blendEquation;
	}
	
	set blendEquationRGB(value: number) {
		this._nativeObj.blendEquationRGB = value;
	}
	get blendEquationRGB(): number {
		return this._nativeObj.blendEquationRGB;
	}
	
	set blendEquationAlpha(value: number) {
		this._nativeObj.blendEquationAlpha = value;
	}
	get blendEquationAlpha(): number {
		return this._nativeObj.blendEquationAlpha;
	}
	
	set depthTest(value: number) {
		this._nativeObj.depthTest = value;
	}
	get depthTest(): number {
		return this._nativeObj.depthTest;
	}
	
	set depthWrite(value: boolean) {
		this._nativeObj.depthWrite = value;
	}
	get depthWrite(): boolean {
		return this._nativeObj.depthWrite;
	}
	
	set stencilWrite(value: boolean) {
		this._nativeObj.stencilWrite = value;
	}
	get stencilWrite(): boolean {
		return this._nativeObj.stencilWrite;
	}
	
	set stencilTest(value: number) {
		this._nativeObj.stencilTest = value;
	}
	get stencilTest(): number {
		return this._nativeObj.stencilTest;
	}
	
	set stencilRef(value: number) {
		this._nativeObj.stencilRef = value;
	}
	get stencilRef(): number {
		return this._nativeObj.stencilRef;
	}

	set stencilOp(value: Vector3) {
		this._nativeObj.setStencilOp(value.x, value.y, value.z);
	}
	constructor() {
		this._nativeObj = new (window as any).conchRenderState();
	}

}


