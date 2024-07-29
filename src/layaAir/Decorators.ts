import { Loader } from "./laya/net/Loader";
import { ClassUtils } from "./laya/utils/ClassUtils";

export type FEnumDescriptor = {
    name: string,
    value: any,
    extend?: FEnumDescriptor,
    [index: string]: any,
}[] | any[] | Object | string;

export type FPropertyType = string | Function | Object | [FPropertyType] | ["Record", FPropertyType];

export interface FPropertyDescriptor {
    /** 属性名称。一般不需要设定。 */
    name: string;
    /** 
     * 属性类型。
     * 基础类型有：number,string,boolean,any，注意是使用字符串，不是类型。
     * 复合类型有：数组，使用类似["number"]这样的方式表达；字典，使用类似["Record", "number"]这样的方式表达，第一个元素固定为Record，第二个元素为实际类型。
     * 其他对象类型可以直接使用类名，但要注意该类必须有使用regClass装饰器。也支持枚举类型。枚举类型不需要regClass。
     * 如果不提供type，表示只用于ui样式，没有实际对应数据，和不会序列化
     */
    type: FPropertyType;

    /** 该属性在原型中的初始值。这个值也用于序列化时比较，如果相同则不序列化这个属性，所以必须保证这里设置的值就是类中变量的初始值。*/
    default?: any;

    /** 标题。如果不提供，则使用name。 */
    caption: string;
    /** 提示文字 */
    tips: string;

    /** 属性栏目。为多个属性设置相同的值，可以将它们显示在同一个Inspector栏目内。 */
    catalog: string;
    /* 栏目标题。不提供则直接使用栏目名称。 */
    catalogCaption: string;
    /* 栏目的显示顺序，数值越小显示在前面。不提供则按属性出现的顺序。*/
    catalogOrder: number;

    /**
     * 编辑这个属性的控件。内置有：number,string,boolean,color,vec2,vec3,vec4,asset
     * 
     *      number : 数字输入。
     *      string : 字符串输入。默认为单行输入，如果是多行，需要激活multiline选项。
     *      boolean : 布尔值输入，用于单选框或多选框。
     *      color : 一个颜色框+调色盘+拾色器
     *      vec2 : XY输入的组合
     *      vec3 : XYZ输入的组合
     *      vec4 : XYZW输入的组合
     *      asset : 选择资源
     * 
     * 一般来说，不需要设置这个选项，编辑器会自动根据属性类型选择适合的控件，但在某些情况下可以需要强制指定。
     * 例如，如果数据类型是Vector4，但其实它表达的是颜色，用默认编辑Vector4的控件不适合，需要在这里设置为“color”。
     * 
     * 显式设置inspector为null，则不会为属性构造inspector。这与hidden设置为true不同。hidden为true是创建但不可见，
     * inspector为null的话则是完全不创建。
     */
    inspector: string;

    /** 隐藏控制:true隐藏，false显示。常用于关联属性的情况。
     * 1. 可以用表达式，通过将条件表达式放到字符串里，获得布尔类型的运算结果，例如"!data.a && !data.b"，表示属性a和属性b均为空时，条件成立（true），隐藏这个属性。
     * 2. 这里的data为当前组件的对象数据，data.a与data.b属性字段的a与b就是指当前组件中的a与b属性值，通过这种方法取到组件对象数据中的属性值，用于条件判断，作用于当前属性是否隐藏。
     */
    hidden: boolean | string;

    /** 只读控制。
     * 1. 可以用表达式，通过将条件表达式放到字符串里，获得布尔类型的运算结果，例如"!data.a && !data.b"，表示属性a和属性b均为空时，条件成立（true），该属性只读。
     * 2. 这里的data为当前组件的对象数据，data.a与data.b属性字段的a与b就是指当前组件中的a与b属性值，通过这种方法取到组件对象数据中的属性值，用于条件判断，作用于当前属性是否隐藏。
     */
    readonly: boolean | string;

    /** 数据检查机制。
     * 1. 将包括表达式的字符串传入，用于判断检查是否符合表达式的条件。符合条件，需要返回报错信息。
     * 2. 使用示例为："if(value == data.a) return '不能与a的值相同'"
     * 其中的value为当前用户在该属性输入的值，data为当前组件的对象数据，data.a是当前组件中的a属性值
     */
    validator: string;
    /** 是否允许数据为空值。
     * 可以用表达式，返回true或者false的结果。
     */
    required: boolean | string;

    /** 是否序列化 */
    serializable: boolean;
    /** 属性在不参与序列化时，如果它的数据可能受其他可序列化的属性影响，在这里填写其他属性名称。这通常用于判断预制体属性是否覆盖。*/
    affectBy: string;

    /** 是否多行文本输入 */
    multiline: boolean;
    /** 是否密码输入 */
    password: boolean;
    /** 如果true或者缺省，文本输入每次输入都提交；否则只有在失焦时才提交 */
    submitOnTyping: boolean;
    /** 如果是文本类型，是输入文本的提示信息；如果是布尔类型，是多选框的标题。 */
    prompt: string;

    /** 定义枚举 */
    enumSource: FEnumDescriptor;
    /** 当数据源为空时，隐藏这个属性 */
    hideIfEnumSourceEmpty: boolean;

    /** 是否反转布尔值。例如当属性值为true时，多选框显示为不勾选。 */
    reverseBool: boolean;

    /** 是否允许null值。默认为true。*/
    nullable: boolean;

    /** 数字的最小值 */
    min: number,
    /** 数字的最大值 */
    max: number,
    /** 数值范围，等同于一次性设置min和max。 */
    range: [number, number];
    /** 拖动方式改变数值时，每次数值改变的幅度。 */
    step: number;
    /** 小数点后的位数 */
    fractionDigits: number;
    /** 显示为百分比 */
    percentage: boolean;

    /** 对数组类型属性适用。表示数组是固定长度，不允许修改。*/
    fixedLength: boolean;
    /** 对数组类型属性适用。如果不提供，则表示数组允许所有操作，如果提供，则只允许列出的操作。*/
    arrayActions: Array<"append" | "insert" | "delete" | "move">;
    /** 对数组类型属性适用。这里可以定义数组元素的属性 */
    elementProps: Partial<FPropertyDescriptor>;

    /** 对颜色类型属性适用。表示是否提供透明度a值的修改。 */
    showAlpha: boolean;
    /** 对颜色类型属性适用。它与default值不同的是，当default是null时，可以用defaultColor定义一个非null时的默认值。*/
    defaultColor: any;
    /** 对颜色类型属性适用。允许显示一个checkbox决定颜色是否为null。 */
    colorNullable: boolean;

    /** 对对象类型属性适用。如果为true，隐藏对象的标题，同时对象下的属性的显示缩进会减少一级。*/
    hideHeader: boolean;
    /** 对对象类型属性适用。对象创建时可以下拉选择一个类型。如果显示设置为null，则禁止菜单。默认是显示一个创建基类的菜单。*/
    createObjectMenu: Array<string>;
    /** 对对象类型属性适用。表示这个属性类型有类似结构体的行为特性，即总是作为一个整体使用。
     * 例如，obj对象的某个属性b的值是a1，a1是T类型的实例，且T类型的structLike为true，那么当a1的属性改变时，编辑器将同时调用obj.b = a1。
     * 默认为false。
     */
    structLike: boolean;

    /** 说明此属性是引用一个资源 */
    isAsset: boolean;
    /** 对资源类型的属性适用。多个资源类型用逗号分隔，例如“Image,Audio"。*/
    assetTypeFilter: string;
    /** 如果属性类型是string，并且进行资源选择时，这个选项决定属性值是资源原始路径还是res://uuid这样的格式。如果是true，则是资源原始路径。默认false。*/
    useAssetPath: boolean;
    /** 对资源类型的属性适用。选择资源时是否允许选择内部资源 */
    allowInternalAssets: boolean;
    /** 对资源类型的属性适用。可以设置一个自定义的过滤器。过滤器需要先通过EditorEnv.assetMgr.customAssetFilters注册。 */
    customAssetFilter: string;

    /** 对类型是Node或者Component的属性适用。如果不为null，当在实际运行环境里执行反序列化时，引用对象不再实例化，而是将它的序列化数据原样保存到指定的属性中。*/
    toTemplate: string;

    /** 显示位置。语法：before xxx/after xxx/first/last。 */
    position: string;

    /** 增加缩进，单位是层级，不是像素。 */
    addIndent?: number;

    /** 子属性默认折叠状态 */
    collapsed?: boolean;

    /** 表示属性是私有属性。私有属性不会显示在Inspector里，但会序列化保存。 */
    "private": boolean;

    /** 表示属性是否允许多选情况下编辑。默认true。 */
    allowMultipleObjects: boolean;

    /** 表示属性不显示在派生类的属性表中 */
    hideInDeriveType: boolean;

    /** 属性改变时额外调用对象的一个函数，这里是函数名称。
     * 函数原型是func(key?:string)。其中key在改变成员内部属性时会传递。
     * 例如改变数据某个元素的内部属性，则key是这个元素的索引。 
     */
    onChange: string;

    /** 额外的选项 */
    options: Record<string, any>;
}

export interface FTypeDescriptor {
    /** 标题。如果不提供，则使用name。 */
    caption: string;
    /**帮助文档url地址 */
    help: string;
    /** 添加到组件菜单。 */
    menu: string;
    /** 图标。*/
    icon: string;
    /** 是否资源类型 */
    isAsset: boolean;
    /** 对资源类型的属性适用。多个资源类型用逗号分隔，例如“Image,Audio"。可用值参考editor/public/IAssetInfo.ts。 */
    assetTypeFilter: string;
    /** 表示这个类型有类似结构体的行为特性，即总是作为一个整体使用。
     * 例如，obj对象的某个属性b的值是a1，a1是T类型的实例，且T类型的structLike为true，那么当a1的属性改变时，编辑器将同时调用obj.b = a1。
     * 默认为false。
     */
    structLike: boolean;
    /** 初始值。这个值只在面板中使用，它指从界面上创建对象时赋予属性的初始值。*/
    init: any;
    /** 属性列表 */
    properties: Array<Partial<FPropertyDescriptor>>;
    /** 编辑这个类实例的控件 */
    inspector: string;
    /** 对Component使用，表示这个组件允许挂载的节点类型。默认null */
    worldType: "2d" | "3d" | null;
    /** 对Component使用，如果为true，并且定义了menu属性，则这个组件还会显示在层级面板的新建对象菜单上。 */
    inHierarchyMenu: boolean;
    /** 额外的选项 */
    options: Record<string, any>;
}

function dummy() { }

/**
 * 注册一个类型，注册后才能被序列化系统自动保存和载入。
 */
export function regClass(assetId?: string): any {
    return function (constructor: Function) {
        ClassUtils.regClass(assetId, constructor);
    };
}

/**
 * 设置类型的额外信息。
 * @param info 类型的额外信息
 */
export function classInfo(info?: Partial<FTypeDescriptor>): any { return dummy; }

/**
 * 设置组件可以在编辑器环境中执行完整生命周期。
 * @param constructor
 */
export function runInEditor(constructor: Function): void { }

/**
 * 设置组件可以添加多个实例到同一个节点上。
 * @param constructor 
 */
export function allowMultiple(constructor: Function): void {
    constructor.prototype._$singleton = false;
}

/**
 * 使用这个装饰器，可以使属性显示在编辑器属性设置面板上，并且能序列化保存。
 * @param info 属性的类型，如: Number,"number",[Number],["Record", Number]等。或传递对象描述详细信息，例如{ type: "string", multiline: true }。
 */
export function property(info: FPropertyType | Partial<FPropertyDescriptor>): any { return dummy; }

/**
 * 注册一种资源装载器。
 * @param fileExtensions 扩展名
 * @param type 类型标识。如果这种资源需要支持识别没有扩展名的情况，或者一个扩展名对应了多种资源类型的情况，那么指定type参数是个最优实践。
 * @param hotReloadable 是否支持热重载
 */
export function regLoader(fileExtensions: string[], type?: string, hotReloadable?: boolean) {
    return function (constructor: Function) {
        Loader.registerLoader(fileExtensions, <any>constructor, type, hotReloadable);
    };
}
