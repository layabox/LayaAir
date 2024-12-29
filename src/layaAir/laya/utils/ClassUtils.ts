/**
 * @en The ClassUtils is a utility class for class operations.
 * @zh ClassUtils 是一个类工具的类。
 */
export class ClassUtils {
    static _classMap: Record<string, any> = {};
    static _runtimeMap: Record<string, Function> = {};

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
     * @en Registers a runtime class.
     * @param url The url of the prefab.
     * @param cls The class definition. 
     * @zh 动态注册一个runtime类。
     * @param url prefab的url。
     * @param cls 类定义。
     */
    public static regRuntime(url: string, cls: Function) {
        ClassUtils._runtimeMap[url] = cls;
    }

    /**
     * @en Get runtime class by prefab url.
     * @param url The url of the prefab. 
     * @returns The class definition.
     * @zh 通过 prefab url 获取 runtime 类。
     * @param url prefab的url。
     * @return 类定义。 
     */
    public static getRuntime(url: string) {
        return ClassUtils._runtimeMap[url];
    }
}

