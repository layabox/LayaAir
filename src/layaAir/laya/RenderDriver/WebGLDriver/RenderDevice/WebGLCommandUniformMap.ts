import { CommandUniformMap, UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";

export class WebGLCommandUniformMap extends CommandUniformMap {

    /**@internal */
    _idata: {
        [key: number]: {
            block: string,
            propertyName: string,
            arrayLength: number, //兼容WGSL
            uniformtype: ShaderDataType,
            blockProperty: UniformProperty[]//block property,if not in block  lenth = 0
        }
    } = {};
    _stateName: string;

    constructor(stateName: string) {
        super(stateName);
        this._stateName = stateName;
    }

    hasPtrID(propertyID: number): boolean {
        return !!(this._idata[propertyID] != null);
    }

    /**
     * 增加一个Uniform参数
     * @internal
     * @param propertyID 
     * @param propertyKey 
     */
    addShaderUniform(propertyID: number, propertyKey: string, uniformtype: ShaderDataType, block: string = ""): void {
        this._idata[propertyID] = { uniformtype: uniformtype, propertyName: propertyKey, arrayLength: 0, block: block, blockProperty: null };
    }

    /**
     * 增加一个UniformArray参数
     * @internal
     * @param propertyID 
     * @param propertyName 
     */
    addShaderUniformArray(propertyID: number, propertyName: string, uniformtype: ShaderDataType, arrayLength: number, block: string = ""): void {
        this._idata[propertyID] = { uniformtype, propertyName, arrayLength, block, blockProperty: null };
    } //兼容WGSL

    /**
     * 增加一个Uniform
     * @param propertyID 
     * @param propertyKey 
     */
    addShaderBlockUniform(propertyID: number, blockname: string, blockProperty: UniformProperty[]): void {
        this._idata[propertyID] = { propertyName: blockname, arrayLength: 0, blockProperty: blockProperty, uniformtype: ShaderDataType.None, block: "" };
        blockProperty.forEach(element => {
            this.addShaderUniform(element.id, element.propertyName, element.uniformtype, blockname);
        });
    }
}