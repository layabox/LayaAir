/**
 * uniform字段
 */
interface UniformField {
    type: string; //字段类型
    name: string; //字段名称
    precision?: string; //精度限定符
    isArray: boolean; //是否是数组
    arrayLength?: number; //数组长度
};

/**
 * GLSLUniform块定义
 */
export class WebGPU_GLSLUniform {
    all: string; //完整的uniform定义
    name: string; //名称
    fields: UniformField; //字段

    constructor(all: string) {
        this.all = all;
        this._parse(all);
    }

    /**
     * 解析uniform定义
     * @param all 
     */
    private _parse(all: string) {
        const fieldRegex = /((lowp|mediump|highp)\s+)?(\w+)\s+(\w+)\s*(\[(\d+)\])?;/g;

        let fieldMatch;
        if ((fieldMatch = fieldRegex.exec(all)) !== null) {
            const [, precision, , type, name, , array] = fieldMatch;
            const isArray = array !== undefined;
            let arrayLength = undefined;
            if (isArray)
                arrayLength = parseInt(array.replace(/\D/g, ''));
            this.fields = {
                type,
                name,
                precision,
                isArray,
                arrayLength
            };
            this.name = name;
        }
    }
}