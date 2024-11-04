import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { ShaderDataItem, ShaderDataType, ShaderData } from "./ShaderData";

export enum RenderCMDType {
    DrawNode,
    DrawElement,
    Blit,
    ChangeData,
    ChangeShaderDefine,
    ChangeViewPort,
    ChangeRenderTarget
}

export interface IRenderCMD {
    type: RenderCMDType;
    apply(context: any): void;
}

export class SetRenderDataCMD implements IRenderCMD {
    /**
     * @en render cmd type
     * @zh 渲染指令类型
     */
    type: RenderCMDType;

    protected _value: ShaderDataItem;

    protected _dataType: ShaderDataType;

    protected _propertyID: number;

    protected _dest: ShaderData;

    get value(): ShaderDataItem {
        return this._value;
    }

    set value(value: ShaderDataItem) {
        this._value = value;
    }

    get dataType(): ShaderDataType {
        return this._dataType;
    }

    set dataType(value: ShaderDataType) {
        this._dataType = value;
    }

    get propertyID(): number {
        return this._propertyID;
    }

    set propertyID(value: number) {
        this._propertyID = value;
    }

    get dest(): ShaderData {
        return this._dest;
    }

    set dest(value: ShaderData) {
        this._dest = value;
    }

    apply(context: any): void {
        throw new Error("Method not implemented.");
    }
}

export class SetShaderDefineCMD implements IRenderCMD {
    /**
     * @en render cmd type
     * @zh 渲染指令类型
     */
    type: RenderCMDType;

    protected _define: ShaderDefine;

    protected _dest: ShaderData;

    protected _add: boolean;

    get define(): ShaderDefine {
        return this._define;
    }

    set define(value: ShaderDefine) {
        this._define = value;
    }

    get dest(): ShaderData {
        return this._dest;
    }

    set dest(value: ShaderData) {
        this._dest = value;
    }

    get add(): boolean {
        return this._add;
    }

    set add(value: boolean) {
        this._add = value;
    }

    apply(context: any): void {
        throw new Error("Method not implemented.");
    }
}
