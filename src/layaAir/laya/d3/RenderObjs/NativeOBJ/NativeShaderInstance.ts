import { CommandEncoder } from "../../../layagl/CommandEncoder";
import { LayaGL } from "../../../layagl/LayaGL";
import { NativeShaderData } from "../../../RenderEngine/RenderEngine/NativeGLEngine/NativeShaderData";
import { ShaderDataType } from "../../../RenderEngine/RenderInterface/ShaderData";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderCompileDefineBase } from "../../../webgl/utils/ShaderCompileDefineBase";



enum UniformParamsMapType {
	Scene = 0,
	Camera,
	Sprite,
	Material,
}
/**
 * @internal
 * <code>ShaderInstance</code> 类用于实现ShaderInstance。
 */
export class NativeShaderInstance/* extends ShaderInstance */ {

	_nativeObj: any;

	/**@internal */
	private _shaderPass: ShaderCompileDefineBase | ShaderPass;

	constructor(vs: string, ps: string, attributeMap: { [name: string]: [number, ShaderDataType] }, shaderPass: ShaderCompileDefineBase) {
		//super(vs, ps, attributeMap, shaderPass);
		this._shaderPass = shaderPass;
		var pConchAttributeMap: any = new (window as any).conchAttributeMap();
		for (var k in attributeMap) {
			pConchAttributeMap.setAttributeValue(k, attributeMap[k][0]);
		}

		var stateMap: { [stateID: number]: number } = {};
		for (var s in stateMap) {
			pConchAttributeMap.setStateValue(parseInt(s), stateMap[s]);
		}
		pConchAttributeMap.statefirst = (<ShaderPass>this._shaderPass).statefirst;
		var renderState: any = (<ShaderPass>shaderPass).renderState;
		this._nativeObj = new (window as any).conchShaderInstance((LayaGL.renderEngine as any)._nativeObj, vs, ps, pConchAttributeMap, renderState._nativeObj);
	}
	/**
	 * @inheritDoc
	 * @override
	 */
	protected _disposeResource(): void {
		this._nativeObj.destroy();
	}


	bind() {
		return this._nativeObj.bind();
	}

	uploadUniforms(shaderUniform: CommandEncoder, shaderDatas: NativeShaderData, uploadUnTexture: boolean) {
		this._nativeObj.uploadUniforms(shaderUniform, (shaderDatas as any)._nativeObj, uploadUnTexture);
	}

	/**
	 * @internal
	 */
	uploadCustomUniform(index: number, data: any): void {
		this._nativeObj.uploadCustomUniforms(index, data);
	}
	get _sceneUniformParamsMap(): CommandEncoder {
		return (UniformParamsMapType.Scene as unknown as CommandEncoder);
	}

	get _cameraUniformParamsMap(): CommandEncoder {
		return (UniformParamsMapType.Camera as unknown as CommandEncoder);
	}

	get _spriteUniformParamsMap(): CommandEncoder {
		return (UniformParamsMapType.Sprite as unknown as CommandEncoder);
	}

	get _materialUniformParamsMap(): CommandEncoder {
		return (UniformParamsMapType.Material as unknown as CommandEncoder);
	}

	uploadRenderStateBlendDepth(shaderDatas: NativeShaderData): void {
		this._nativeObj.uploadRenderStateBlendDepth((shaderDatas as any)._nativeObj);
	}

	uploadRenderStateFrontFace(shaderDatas: NativeShaderData, isTarget: boolean, invertFront: boolean): void {
		this._nativeObj.uploadRenderStateFrontFace((shaderDatas as any)._nativeObj, isTarget, invertFront);
	}
}

