import { RenderState } from "../../../../d3/core/material/RenderState";
import { CommandUniformMap } from "../../../../d3/core/scene/Scene3DShaderDeclaration";
import { ShaderPass } from "../../../../d3/shader/ShaderPass";
import { CommandEncoder } from "../../../../layagl/CommandEncoder";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Stat } from "../../../../utils/Stat";
import { ShaderCompileDefineBase } from "../../../../webgl/utils/ShaderCompileDefineBase";
import { CullMode } from "../../../RenderEnum/CullMode";
import { RenderStateType } from "../../../RenderEnum/RenderStateType";
import { IRenderShaderInstance } from "../../../RenderInterface/IRenderShaderInstance";
import { Shader3D } from "../../../RenderShader/Shader3D";
import { ShaderData } from "../../../RenderShader/ShaderData";
import { ShaderVariable } from "../../../RenderShader/ShaderVariable";
import { RenderStateCommand } from "../../../RenderStateCommand";
import { RenderStateContext } from "../../../RenderStateContext";


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
export class NativeShaderInstance {

	/**@internal */
	private _customUniformParamsMap: any[] = [];

	private _nativeObj: any;

	constructor(vs: string, ps: string, attributeMap: any, shaderPass: ShaderCompileDefineBase) {
	
		var pConchAttributeMap: any = new (window as any).conchAttributeMap();
		for (var k in attributeMap) {
			pConchAttributeMap.setAttributeValue(k, attributeMap[k]);
		}

		var stateMap: {[key:string]:number} = (<ShaderPass>shaderPass)._stateMap;
		for (var s in stateMap) {
			pConchAttributeMap.setStateValues(stateMap[s], Shader3D.propertyNameToID(s));
		}

		this._nativeObj = new (window as any).conchShaderInstance((LayaGL.renderEngine as any)._nativeObj, vs, ps, pConchAttributeMap);
	}
	/**
	 * @inheritDoc
	 * @override
	 */
	protected _disposeResource(): void {
		this._nativeObj.destroy();
	}
	

	bind(){
		return this._nativeObj.bind();
	}

	uploadUniforms(shaderUniform: CommandEncoder, shaderDatas: ShaderData, uploadUnTexture: boolean){
		Stat.shaderCall += this._nativeObj.uploadUniforms(shaderUniform, shaderDatas, uploadUnTexture);
	}

	/**
	 * @internal
	 */
	uploadCustomUniform(index: number, data: any): void {
		Stat.shaderCall += this._nativeObj.uploadCustomUniforms(this._customUniformParamsMap, index, data);
	}
	get _sceneUniformParamsMap(): CommandEncoder {
		return (UniformParamsMapType.Scene as unknown as CommandEncoder);
	}

	get _cameraUniformParamsMap():CommandEncoder {
		return (UniformParamsMapType.Camera as unknown as CommandEncoder);
	}

	get _spriteUniformParamsMap():CommandEncoder {
		return (UniformParamsMapType.Sprite as unknown as CommandEncoder);
	}

	get _materialUniformParamsMap():CommandEncoder {
		return (UniformParamsMapType.Material as unknown as CommandEncoder);
	}
}

