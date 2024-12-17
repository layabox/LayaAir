import { LayaGL } from "../../../layagl/LayaGL";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { GLSLCodeGenerator } from "../../../RenderEngine/RenderShader/GLSLCodeGenerator";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { NotImplementedError } from "../../../utils/Error";
import { Config3D } from "../../../../Config3D";
/**
 * @internal
 * <code>ShaderInstance</code> 类用于实现ShaderInstance。
 */
export class GLESShaderInstance implements IShaderInstance {

	_nativeObj: any;

	/**@internal */
	private _shaderPass: ShaderPass;
	/**@internal */
	private _attributeMapTemp: Map<string, number> = new Map();
	constructor() {

	}
	_serializeShader(): ArrayBuffer {
		throw new NotImplementedError();
	}
	_deserialize(buffer: ArrayBuffer): boolean {
		throw new NotImplementedError();
	}

	_create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): void {
		this._shaderPass = shaderPass;
		let useMaterial = Config3D._matUseUBO;//TODO 临时解决2D Mat
		Config3D._matUseUBO = (!shaderProcessInfo.is2D) && Config3D._matUseUBO;
		let shaderObj = GLSLCodeGenerator.GLShaderLanguageProcess3D(shaderProcessInfo.defineString, shaderProcessInfo.attributeMap, shaderProcessInfo.uniformMap, shaderProcessInfo.vs, shaderProcessInfo.ps);
		Config3D._matUseUBO = useMaterial;
		this._attributeMapTemp.clear();
		for (var k in shaderProcessInfo.attributeMap) {
			this._attributeMapTemp.set(k, shaderProcessInfo.attributeMap[k][0]);
		}

		this._nativeObj = new (window as any).conchGLESShaderInstance(shaderProcessInfo.is2D, shaderObj.vs, shaderObj.fs, this._attributeMapTemp, (shaderPass.moduleData as any)._nativeObj);

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