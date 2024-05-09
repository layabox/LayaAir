export class WebGPUShaderDefine {
    /**
     * 查找代码中的数字宏定义
     * @param code 
     * @param map 
     */
    static findNumberDefine(code: string, map?: Map<string, string>) {
        //定义用于匹配宏定义的正则表达式
        const pattern = /^\s*#define\s+(\w+)\s+([1-9]\d*)(?=\s*($|\/\/))/gm;
        //创建一个Map用于存储宏名称和其替换文本
        if (!map)
            map = new Map<string, string>();
        //用正则表达式匹配全部宏定义
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(code)) !== null) {
            //match[1]是宏名称，match[2]是替换文本
            map.set(match[1], match[2]);
        }
        return map;
    }
}