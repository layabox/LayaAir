/**
 * 结构体字段
 */
interface StructField {
    type: string; //字段类型
    name: string; //字段名称
    precision?: string; //精度限定符
    isArray?: boolean; //是否是数组
    arrayLength?: number; //数组长度
};

/**
 * GLSL结构体定义
 */
export class WebGPU_GLSLStruct {
    all: string; //完整的结构体定义
    name: string; //结构体名称
    fields: StructField[] = []; //结构体字段

    constructor(all: string) {
        this.all = all;
        this._parse(all);
    }

    /**
     * 解析结构体定义
     * @param all 
     */
    private _parse(all: string) {
        const headRegex = /struct\s+(\w+)\s*\{/;
        const fieldRegex = /((lowp|mediump|highp)\s+)?([\w]+)\s+([\w]+)\s*(\[\d*\])?;/g;

        const headerMatch = headRegex.exec(all);
        this.name = headerMatch[1];

        let match;
        while ((match = fieldRegex.exec(all)) !== null) {
            const [, precision, , type, name, array] = match;
            const isArray = array !== undefined;
            let arrayLength = undefined;
            if (isArray)
                arrayLength = parseInt(array.replace(/\D/g, ''));
            this.fields.push({
                name,
                type,
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