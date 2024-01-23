import { LayaGL } from "../../../layagl/LayaGL";
import { IShaderInstance } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IShaderInstance";
import { GLSLCodeGenerator } from "../../../RenderEngine/RenderShader/GLSLCodeGenerator";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";

/**
 * @internal
 * <code>ShaderInstance</code> 类用于实现ShaderInstance。
 */
export class NativeShaderInstance implements IShaderInstance {

	_nativeObj: any;

	/**@internal */
	private _shaderPass: ShaderPass;

	constructor() {

	}

	_create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): void {
		this._shaderPass = shaderPass;
		let shaderObj = GLSLCodeGenerator.GLShaderLanguageProcess3D(shaderProcessInfo.defineString, shaderProcessInfo.attributeMap, shaderProcessInfo.uniformMap, shaderProcessInfo.vs, shaderProcessInfo.ps);
		var attributeMap: { [name: string]: number } = {};
		for (var k in shaderProcessInfo.attributeMap) {
			attributeMap[k] = shaderProcessInfo.attributeMap[k][0];
		}
		var renderState: any = (<ShaderPass>shaderPass).renderState;
		this._nativeObj = new (window as any).conchShaderInstance((LayaGL.renderEngine as any)._nativeObj, shaderObj.vs, shaderObj.fs, attributeMap, renderState._nativeObj);
		
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	_disposeResource(): void {
		this._nativeObj.destroy();
		this._nativeObj = null;
	}
}