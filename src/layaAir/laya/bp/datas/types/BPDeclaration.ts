type TBPDeclaration = {
    /** 包名 */
    module?: string;
    /** 当前描述名 */
    name: string;
    /** 当前描述的具体类型 */
    type: string,
    /** 继承的类型数组，按次序从为父类的父类  */
    extends?: string[];
    /** 实现的接口名 */
    implements?: string[];
    /** 该描述的属性列表 */
    props?: TBPDeclarationProp[];
    /** 该描述的方法列表 */
    funcs?: TBPDeclarationFunction[];
    /** 构造函数 */
    construct?: TBPDeclarationConstructor;
}

type TBPDeclarationConstructor = {
    params?: TBPDeclarationParam[];
}

type TBPDeclarationProp = {
    /** 变量名称 */
    name: string;
    /** 变量类型 */
    type?: string;
    /** 是否是私有函数 */
    isPrivate?: boolean;
    /** 是否是公共函数 ，没有该字段 */
    isPublic?: boolean;
    /** 是否是受保护的 */
    isProtected?: boolean;
    /** 是否是静态变量 */
    isStatic?: boolean;
    /** 是否有getter 方法 */
    getter?: boolean;
    /** 是否有setter 方法 */
    setter?: boolean;
    /** 是否为只读参数 */
    isReadonly?: boolean;
    /** 是否来自父类 */
    fromParent?: boolean;
}

type TBPDeclarationFunction = {
    /** 方法名称 */
    name: string;
    /** 方法的返回类型 */
    return: string;
    /** 方法的参数列表 */
    params?: TBPDeclarationParam[];
    /** 是否是受保护的 */
    isProtected?: boolean;
    /** 是否是静态函数 */
    isStatic?: boolean;
    /** 是否是私有函数 */
    isPrivate?: boolean;
    /** 是否是公共函数 ，没有该字段 */
    isPublic?: boolean;
    /** 是否来自父类 */
    fromParent?: boolean;
}

type TBPDeclarationParam = {
    /** 参数名称 */
    name: string;
    /** 参数类型 */
    type: string;
    /** 是否为可选项 */
    optional?: boolean;
    /** 是否为...方法 */
    dotdotdot?:boolean;
}