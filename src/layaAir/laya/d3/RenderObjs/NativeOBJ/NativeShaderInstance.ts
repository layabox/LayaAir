import { CommandEncoder } from "../../../layagl/CommandEncoder";
import { LayaGL } from "../../../layagl/LayaGL";
import { NativeShaderData } from "../../../RenderEngine/RenderEngine/NativeGLEngine/NativeShaderData";
import { ShaderDataType } from "../../../RenderEngine/RenderInterface/ShaderData";
import { GLSLCodeGenerator } from "../../../RenderEngine/RenderShader/GLSLCodeGenerator";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";

/**
 * @internal
 * <code>ShaderInstance</code> 类用于实现ShaderInstance。
 */
export class NativeShaderInstance/* extends ShaderInstance */ {

	_nativeObj: any;

	/**@internal */
	private _shaderPass: ShaderCompileDefineBase | ShaderPass;

	constructor() {

	}
	
	_create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase): void {
		this._shaderPass = shaderPass;
		let shaderObj = GLSLCodeGenerator.GLShaderLanguageProcess3D(shaderProcessInfo.defineString, shaderProcessInfo.attributeMap, shaderProcessInfo.uniformMap, shaderProcessInfo.vs, shaderProcessInfo.ps);
		var pConchAttributeMap: any = new (window as any).conchAttributeMap();
		for (var k in shaderProcessInfo.attributeMap) {
			pConchAttributeMap.setAttributeValue(k, shaderProcessInfo.attributeMap[k][0]);
		}

		var stateMap: { [stateID: number]: number } = {};
		for (var s in stateMap) {
			pConchAttributeMap.setStateValue(parseInt(s), stateMap[s]);
		}

		var renderState: any = (<ShaderPass>shaderPass).renderState;
		this._nativeObj = new (window as any).conchShaderInstance((LayaGL.renderEngine as any)._nativeObj, shaderObj.vs, shaderObj.fs, pConchAttributeMap, renderState._nativeObj);
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	_disposeResource(): void {
		this._nativeObj.destroy();
	}
}