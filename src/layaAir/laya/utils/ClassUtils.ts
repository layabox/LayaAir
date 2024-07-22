/**
 * @en The ClassUtils is a utility class for class operations.
 * @zh ClassUtils 是一个类工具的类。
 */
export class ClassUtils {
    static _classMap: Record<string, any> = {};

    /**
     * @en Registers a class mapping for easy retrieval during class reflection.
     * @param className The name or alias for the class mapping.
     * @param classDef The full name of the class or a reference to the class.
     * @zh 注册 Class 映射，方便在类反射时获取。
     * @param className 映射的名字或者别名。
     * @param classDef 类的全名或者类的引用，全名比如："laya.Sprite"。
     */
    static regClass(className: string, classDef: any): void {
        ClassUtils._classMap[className] = classDef;
    }

    /**
     * @en Returns the class object based on the class name.
     * @param className The class name (e.g., "laya.display.Sprite") or a registered alias (e.g., "Sprite").
     * @return The class object.
     * @zh 根据类名返回类对象。
     * @param className 类名（比如 "laya.display.Sprite"）或者注册的别名（比如 "Sprite"）。
     * @return 类对象。
     */
    static getClass(className: string): any {
        return ClassUtils._classMap[className];
    }

    /**
     * @en Creates an instance of a class based on the class name.
     * @param className The class name (e.g., "laya.display.Sprite") or a registered alias (e.g., "Sprite").
     * @return An instance of the class.
     * @zh 根据名称创建 Class 实例。
     * @param className 类名（比如 "laya.display.Sprite"）或者注册的别名（比如 "Sprite"）。
     * @return 返回类的实例。
     */
    static getInstance(className: string): any {
        var compClass: any = ClassUtils.getClass(className);
        if (compClass) return new compClass();
        else console.warn("[error] Undefined class:", className);
        return null;
    }
}

