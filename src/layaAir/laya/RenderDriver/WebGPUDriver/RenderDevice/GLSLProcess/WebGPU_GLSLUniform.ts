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
    set: number = 0;
    binding: number = 0;
    fields: UniformField[] = []; //字段列表

    constructor(all: string) {
        this.all = all;
        this._parse(all);
    }

    /**
     * 解析uniform定义
     * @param all 
     */
    private _parse(all: string) {
        const headRegex = /layout\s*\(\s*set\s*=\s*(\d+),\s*binding\s*=\s*(\d+)\)\s*uniform\s+(\w+)\s*\{/;
        const fieldRegex = /((lowp|mediump|highp)\s+)?(\w+)\s+(\w+)\s*(\[(\d+)\])?;/g;

        const headerMatch = headRegex.exec(all);
        const [, set, binding, name] = headerMatch;

        this.name = name;
        this.set = parseInt(set);
        this.binding = parseInt(binding);

        let fieldMatch;
        while ((fieldMatch = fieldRegex.exec(all)) !== null) {
            const [, precision, , type, name, , array] = fieldMatch;
            const isArray = array !== undefined;
            let arrayLength = undefined;
            if (isArray)
                arrayLength = parseInt(array.replace(/\D/g, ''));
            this.fields.push({
                type,
                name,
                precision,
                isArray,
                arrayLength
            });
        }
    }

    /**
     * 获取字段
     * @param name 字段名称
     * @param isArray 是否是数组
     * @returns 字段
     */
    getArrayField(name: string, isArray: boolean = false) {
        for (let i = this.fields.length - 1; i > -1; i--)
            if (this.fields[i].name === name && this.fields[i].isArray === isArray)
                return this.fields[i];
        return undefined;
    }
}