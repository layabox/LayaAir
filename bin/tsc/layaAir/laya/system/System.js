/**
 * @private
 */
export class System {
    /**
     * 替换指定名称的定义。用来动态更改类的定义。
     * @param	name 属性名。
     * @param	classObj 属性值。
     */
    //TODO:coverage
    static changeDefinition(name, classObj) {
        window.Laya[name] = classObj;
        var str = name + "=classObj";
        window['eval'](str);
    }
}
