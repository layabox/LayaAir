/**
 * <code>ClassUtils</code> 是一个类工具类。
 */
export class ClassUtils {
    static _classMap: Record<string, any> = {};

    /**
     * 注册 Class 映射，方便在class反射时获取。
     * @param	className 映射的名字或者别名。
     * @param	classDef 类的全名或者类的引用，全名比如:"laya.Sprite"。
     */
    static regClass(className: string, classDef: any): void {
        ClassUtils._classMap[className] = classDef;
    }

    /**
     * 根据名字返回类对象。
     * @param	className 类名(比如laya.display.Sprite)或者注册的别名(比如Sprite)。
     * @return 类对象
     */
    static getClass(className: string): any {
        return ClassUtils._classMap[className];
    }

    /**
     * 根据名称创建 Class 实例。
     * @param	className 类名(比如laya.display.Sprite)或者注册的别名(比如Sprite)。
     * @return	返回类的实例。
     */
    static getInstance(className: string): any {
        var compClass: any = ClassUtils.getClass(className);
        if (compClass) return new compClass();
        else console.warn("[error] Undefined class:", className);
        return null;
    }
}

