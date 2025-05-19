/**
 * @en ShaderDefine class is used to define macro data.
 * @zh ShaderDefine类用于定义宏数据。
 */
export class ShaderDefine {
    /**
     * @en The macro index.
     * @zh 宏索引。
     */
    _index: number;

    /**
     * @en The macro value.
     * @zh 宏值。
     */
    _value: number;

    /**
     * @en Creates an instance of the macro definition.
     * @zh 创建一个宏定义的实例。
     * @param index 宏索引
     * @param value 宏值
     */
    constructor(index: number, value: number) {
        this._index = index;
        this._value = value;
    }
}