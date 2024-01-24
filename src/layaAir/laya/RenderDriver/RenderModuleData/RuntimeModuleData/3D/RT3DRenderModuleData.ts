import { ShaderPass } from "../../../../RenderEngine/RenderShader/ShaderPass";
import { NativeShaderInstance } from "../../../../d3/RenderObjs/NativeOBJ/NativeShaderInstance";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { ICameraNodeData, ISceneNodeData, IShaderPassData, ISubshaderData } from "../../Design/3D/I3DRenderModuleData";
import { IDefineDatas } from "../../Design/IDefineDatas";
import { RTDefineDatas } from "../RTDefineDatas";
import { RTRenderState } from "../RTRenderState";
import { NativeTransform3D } from "./NativeTransform3D";

export class RTCameraNodeData implements ICameraNodeData {
    private _transform: NativeTransform3D;
    public get transform(): NativeTransform3D {
        return this._transform;
    }
    public set transform(value: NativeTransform3D) {
        this._transform = value;
        this._nativeObj.setTransform(value._nativeObj);
    }
    public get farplane(): number {
        return this._nativeObj._farplane;
    }
    public set farplane(value: number) {
        this._nativeObj._farplane = value;
    }

    public get nearplane(): number {
        return this._nativeObj._nearplane;
    }
    public set nearplane(value: number) {
        this._nativeObj._nearplane = value;
    }

    public get fieldOfView(): number {
        return this._nativeObj._fieldOfView;
    }
    public set fieldOfView(value: number) {
        this._nativeObj._fieldOfView = value;
    }

    public get aspectRatio(): number {
        return this._nativeObj._aspectRatio;
    }
    public set aspectRatio(value: number) {
        this._nativeObj._aspectRatio = value;
    }

    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchRTCameraNodeData();
    }

    setProjectionViewMatrix(value: Matrix4x4): void {
        value && this._nativeObj.setProjectionViewMatrix(value.elements);
    }
}

export class RTSceneNodeData implements ISceneNodeData {
    public get lightmapDirtyFlag(): number {
        return this._nativeObj._lightmapDirtyFlag;
    }
    public set lightmapDirtyFlag(value: number) {
        this._nativeObj._lightmapDirtyFlag = value;
    }

    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchRTSceneNodeData();
    }
}


export class RTSubShader implements ISubshaderData {

    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchSubShader();
    }
    destroy(): void {
        this._nativeObj.destroy();
    }
    addShaderPass(pass: RTShaderPass): void {
        this._nativeObj.addShaderPass(pass._nativeObj);
    }
}

export class RTShaderPass implements IShaderPassData {
    static TempDefine: IDefineDatas;//native 创建Shader要同步这个defineData
    pipelineMode: string;
    statefirst: boolean;
    validDefine: RTDefineDatas = new RTDefineDatas();
    private _createShaderInstanceFun: any;//想办法把这个传下去
    _nativeObj: any;
    private _pass: ShaderPass;
    constructor(pass: ShaderPass) {
        this._nativeObj = new (window as any).conchShaderPass();
        this._createShaderInstanceFun = this.nativeCreateShaderInstance.bind(this);
    }
    renderState: RTRenderState;

    nativeCreateShaderInstance() {
        let instance = ShaderPass.createShaderInstance(this._pass, false, RTShaderPass.TempDefine) as NativeShaderInstance;
        this.setCacheShader(RTShaderPass.TempDefine, instance);
    }

    destory(): void {
        //TODO
    }

    setCacheShader(defines: IDefineDatas, shaderInstance: NativeShaderInstance): void {
        this._nativeObj.setCacheShader(defines, shaderInstance._nativeObj);
    }

    getCacheShader(defines: IDefineDatas): NativeShaderInstance {
        //TODO  不会调用到
        return null;
    }
}

