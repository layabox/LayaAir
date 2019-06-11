import { ShaderPass } from "././ShaderPass";
import { ShaderVariable } from "././ShaderVariable";
import { ShaderData } from "././ShaderData";
import { BaseCamera } from "../core/BaseCamera";
import { Transform3D } from "../core/Transform3D";
import { BaseMaterial } from "../core/material/BaseMaterial";
import { BaseRender } from "../core/render/BaseRender";
import { Scene3D } from "../core/scene/Scene3D";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { CommandEncoder } from "laya/layagl/CommandEncoder";
import { Resource } from "laya/resource/Resource";
import { BaseTexture } from "laya/resource/BaseTexture";
/**
 * @private
 * <code>ShaderInstance</code> 类用于实现ShaderInstance。
 */
export declare class ShaderInstance extends Resource {
    /**@private */
    private _attributeMap;
    /**@private */
    private _uniformMap;
    /**@private */
    private _shaderPass;
    /**@private */
    private _vs;
    /**@private */
    private _ps;
    /**@private */
    private _curActTexIndex;
    /**@private */
    private _vshader;
    /**@private */
    private _pshader;
    /**@private */
    private _program;
    /**@private */
    _sceneUniformParamsMap: CommandEncoder;
    /**@private */
    _cameraUniformParamsMap: CommandEncoder;
    /**@private */
    _spriteUniformParamsMap: CommandEncoder;
    /**@private */
    _materialUniformParamsMap: CommandEncoder;
    /**@private */
    private _customUniformParamsMap;
    /**@private */
    private _stateParamsMap;
    /**@private */
    _uploadMark: number;
    /**@private */
    _uploadMaterial: BaseMaterial;
    /**@private */
    _uploadRender: BaseRender;
    /** @private */
    _uploadRenderType: number;
    /**@private */
    _uploadCamera: BaseCamera;
    /**@private */
    _uploadScene: Scene3D;
    /**
     * 创建一个 <code>ShaderInstance</code> 实例。
     */
    constructor(vs: string, ps: string, attributeMap: any, uniformMap: any, shaderPass: ShaderPass);
    /**
     *@private
     */
    private _create;
    /**
     * @private
     */
    private _getRenderState;
    /**
     * @inheritDoc
     */
    protected _disposeResource(): void;
    /**
     * @private
     */
    _addShaderUnifiormFun(one: ShaderVariable): void;
    /**
     * @private
     */
    private _createShader;
    /**
     * @private
     */
    _uniform1f(one: any, value: any): number;
    /**
     * @private
     */
    _uniform1fv(one: any, value: any): number;
    /**
     * @private
     */
    _uniform_vec2(one: any, v: Vector2): number;
    /**
     * @private
     */
    _uniform_vec2v(one: any, value: Float32Array): number;
    /**
     * @private
     */
    _uniform_vec3(one: any, v: Vector3): number;
    /**
     * @private
     */
    _uniform_vec3v(one: any, v: Float32Array): number;
    /**
     * @private
     */
    _uniform_vec4(one: any, v: Vector4): number;
    /**
     * @private
     */
    _uniform_vec4v(one: any, v: Float32Array): number;
    /**
     * @private
     */
    _uniformMatrix2fv(one: any, value: any): number;
    /**
     * @private
     */
    _uniformMatrix3fv(one: any, value: any): number;
    /**
     * @private
     */
    _uniformMatrix4f(one: any, m: Matrix4x4): number;
    /**
     * @private
     */
    _uniformMatrix4fv(one: any, m: Float32Array): number;
    /**
     * @private
     */
    _uniform1i(one: any, value: any): number;
    /**
     * @private
     */
    _uniform1iv(one: any, value: any): number;
    /**
     * @private
     */
    _uniform_ivec2(one: any, value: any): number;
    /**
     * @private
     */
    _uniform_ivec2v(one: any, value: any): number;
    /**
     * @private
     */
    _uniform_vec3i(one: any, value: any): number;
    /**
     * @private
     */
    _uniform_vec3vi(one: any, value: any): number;
    /**
     * @private
     */
    _uniform_vec4i(one: any, value: any): number;
    /**
     * @private
     */
    _uniform_vec4vi(one: any, value: any): number;
    /**
     * @private
     */
    _uniform_sampler2D(one: any, texture: BaseTexture): number;
    _uniform_sampler3D(one: any, texture: BaseTexture): number;
    /**
     * @private
     */
    _uniform_samplerCube(one: any, texture: BaseTexture): number;
    /**
     * @private
     */
    bind(): boolean;
    /**
     * @private
     */
    uploadUniforms(shaderUniform: CommandEncoder, shaderDatas: ShaderData, uploadUnTexture: boolean): void;
    /**
     * @private
     */
    uploadRenderStateBlendDepth(shaderDatas: ShaderData): void;
    /**
     * @private
     */
    uploadRenderStateFrontFace(shaderDatas: ShaderData, isTarget: boolean, transform: Transform3D): void;
    /**
     * @private
     */
    uploadCustomUniform(index: number, data: any): void;
    /**
     * @private
     * [NATIVE]
     */
    _uniformMatrix2fvForNative(one: any, value: any): number;
    /**
     * @private
     * [NATIVE]
     */
    _uniformMatrix3fvForNative(one: any, value: any): number;
    /**
     * @private
     * [NATIVE]
     */
    _uniformMatrix4fvForNative(one: any, m: Float32Array): number;
}
