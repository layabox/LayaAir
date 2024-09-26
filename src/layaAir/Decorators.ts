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
    /**
    * @en Property name. Generally does not need to be set.
    * @zh 属性名称。一般不需要设定。
    */
    name: string;
    /**
     * @en Property type.
     * Basic types are: "number", "string", "boolean", "any", note that these are used as strings, not types.
     * Composite types are: arrays, expressed as ["number"]; dictionaries, expressed as ["Record", "number"], where the first element is fixed as "Record" and the second element is the actual type.
     * Other object types can directly use the class name, but note that the class must use the regClass decorator. Enum types are also supported. Enum types do not need regClass.
     * If type is not provided, it indicates that it is only used for UI style, has no actual corresponding data, and will not be serialized.
     * @zh 属性类型。
     * 基础类型有：number,string,boolean,any，注意是使用字符串，不是类型。
     * 复合类型有：数组，使用类似["number"]这样的方式表达；字典，使用类似["Record", "number"]这样的方式表达，第一个元素固定为Record，第二个元素为实际类型。
     * 其他对象类型可以直接使用类名，但要注意该类必须有使用regClass装饰器。也支持枚举类型。枚举类型不需要regClass。
     * 如果不提供type，表示只用于ui样式，没有实际对应数据，和不会序列化
     */
    type: FPropertyType;

    /**
     * @en The initial value of the property in the prototype. This value is also used for comparison during serialization, so if they are the same, this property will not be serialized. It must be ensured that the value set here is the initial value of the variable in the class.
     * @zh 该属性在原型中的初始值。这个值也用于序列化时比较，如果相同则不序列化这个属性，所以必须保证这里设置的值就是类中变量的初始值。
     */
    default?: any;

    /**
     * @en Title. If not provided, the name will be used.
     * @zh 标题。如果不提供，则使用name。
     */
    caption: string;
    /**
     * @en Tooltip text
     * @zh 提示文字
     */
    tips: string;

    /**
     * @en Property category. Setting the same value for multiple properties can display them in the same Inspector category.
     * @zh 属性栏目。为多个属性设置相同的值，可以将它们显示在同一个属性栏目内。
     */
    catalog: string;

    /**
     * @en Category title. If not provided, the category name will be used directly.
     * @zh 栏目标题。不提供则直接使用栏目名称。
     */
    catalogCaption: string;

    /**
     * @en The display order of the category, lower values are displayed in front. If not provided, it follows the order in which properties appear.
     * @zh 栏目的显示顺序，数值越小显示在前面。不提供则按属性出现的顺序。
     */
    catalogOrder: number;

    /**
     * @en The control for editing this property. Built-in ones include: number, string, boolean, color, vec2, vec3, vec4, asset
     * - number : Number input.
     * - string : String input. Default is single-line input, for multi-line, need to activate the multiline option.
     * - boolean : Boolean input, used for checkboxes or radio buttons.
     * - color : A color box + palette + color picker
     * - vec2 : Combination of X and Y inputs
     * - vec3 : Combination of X, Y, and Z inputs
     * - vec4 : Combination of X, Y, Z, and W inputs
     * - asset : Select resource
     * - Generally, you don't need to set this option, the editor will automatically select the appropriate control based on the property type, but in some cases you may need to specify it forcefully.
     * - For example, if the data type is Vector4, but it actually expresses a color, the default control for editing Vector4 is not suitable, and you need to set it to "color" here.
     * - Explicitly setting inspector to null will not construct an inspector for the property. This is different from setting hidden to true. When hidden is true, it is created but not visible,
     * while when inspector is null, it is not created at all.
     * @zh 编辑这个属性的控件。内置有：number,string,boolean,color,vec2,vec3,vec4,asset
     * - number : 数字输入。
     * - string : 字符串输入。默认为单行输入，如果是多行，需要激活multiline选项。
     * - boolean : 布尔值输入，用于单选框或多选框。
     * - color : 一个颜色框+调色盘+拾色器
     * - vec2 : XY输入的组合
     * - vec3 : XYZ输入的组合
     * - vec4 : XYZW输入的组合
     * - asset : 选择资源
     * - 一般来说，不需要设置这个选项，编辑器会自动根据属性类型选择适合的控件，但在某些情况下可以需要强制指定。
     * - 例如，如果数据类型是Vector4，但其实它表达的是颜色，用默认编辑Vector4的控件不适合，需要在这里设置为"color"。
     * - 显式设置inspector为null，则不会为属性构造inspector。这与hidden设置为true不同。hidden为true是创建但不可见，
     * inspector为null的话则是完全不创建。
     */
    inspector: string;

    /**
     * @en Hide control: true to hide, false to show. Often used in cases of associated properties.
     * - 1. Can use expressions by putting condition expressions in strings to get boolean type calculation results, for example "!data.a && !data.b" means when properties a and b are both empty, the condition is true, and this property is hidden.
     * - 2. Here, data is the object data of the current component, data.a and data.b property fields a and b refer to the a and b property values in the current component, by this method to get the property values in the component object data, used for conditional judgment, acting on whether the current property is hidden.
     * @zh 隐藏控制:true隐藏，false显示。常用于关联属性的情况。
     * - 1. 可以用表达式，通过将条件表达式放到字符串里，获得布尔类型的运算结果，例如"!data.a && !data.b"，表示属性a和属性b均为空时，条件成立（true），隐藏这个属性。
     * - 2. 这里的data为当前组件的对象数据，data.a与data.b属性字段的a与b就是指当前组件中的a与b属性值，通过这种方法取到组件对象数据中的属性值，用于条件判断，作用于当前属性是否隐藏。
     */
    hidden: boolean | string;

    /**
     * @en Read-only control.
     * - 1. Can use expressions by putting condition expressions in strings to get boolean type calculation results, for example "!data.a && !data.b" means when properties a and b are both empty, the condition is true, and this property is read-only.
     * - 2. Here, data is the object data of the current component, data.a and data.b property fields a and b refer to the a and b property values in the current component, by this method to get the property values in the component object data, used for conditional judgment, acting on whether the current property is hidden.
     * @zh 只读控制。
     * - 1. 可以用表达式，通过将条件表达式放到字符串里，获得布尔类型的运算结果，例如"!data.a && !data.b"，表示属性a和属性b均为空时，条件成立（true），该属性只读。
     * - 2. 这里的data为当前组件的对象数据，data.a与data.b属性字段的a与b就是指当前组件中的a与b属性值，通过这种方法取到组件对象数据中的属性值，用于条件判断，作用于当前属性是否隐藏。
     */
    readonly: boolean | string;

    /**
     * @en Data checking mechanism.
     * - 1. Pass in a string including expressions to judge whether it meets the conditions of the expression. If it meets the conditions, it needs to return an error message.
     * - 2. Usage example: "if(value == data.a) return 'Cannot be the same as the value of a'"
     * Where value is the value entered by the user for this property, data is the object data of the current component, data.a is the a property value in the current component
     * @zh 数据检查机制。
     * - 1. 将包括表达式的字符串传入，用于判断检查是否符合表达式的条件。符合条件，需要返回报错信息。
     * - 2. 使用示例为："if(value == data.a) return '不能与a的值相同'"
     * 其中的value为当前用户在该属性输入的值，data为当前组件的对象数据，data.a是当前组件中的a属性值
     */
    validator: string;

    /**
     * @en Whether to allow the data to be empty.
     * Can use expressions to return true or false results.
     * @zh 是否允许数据为空值。
     * 可以用表达式，返回true或者false的结果。
     */
    required: boolean | string;

    /**
     * @en Whether to serialize
     * @zh 是否序列化
     */
    serializable: boolean;

    /**
     * @en When the property does not participate in serialization, if its data may be affected by other serializable properties, fill in the names of other properties here. This is usually used to determine whether prefab properties are overridden.
     * @zh 属性在不参与序列化时，如果它的数据可能受其他可序列化的属性影响，在这里填写其他属性名称。这通常用于判断预制体属性是否覆盖。
     */
    affectBy: string;

    /**
     * @en Whether it's multi-line text input
     * @zh 是否多行文本输入
     */
    multiline: boolean;

    /**
     * @en Whether it's password input
     * @zh 是否密码输入
     */
    password: boolean;

    /**
     * @en If true or default, text input is submitted every time; otherwise, it's only submitted when losing focus
     * @zh 如果true或者缺省，文本输入每次输入都提交；否则只有在失焦时才提交
     */
    submitOnTyping: boolean;

    /**
     * @en If it's a text type, it's the prompt information for input text; if it's a boolean type, it's the title of the checkbox.
     * @zh 如果是文本类型，是输入文本的提示信息；如果是布尔类型，是多选框的标题。
     */
    prompt: string;

    /**
     * @en Define enumeration
     * @zh 定义枚举
     */
    enumSource: FEnumDescriptor;

    /**
     * @en Hide this property when the data source is empty
     * @zh 当数据源为空时，隐藏这个属性
     */
    hideIfEnumSourceEmpty: boolean;

    /**
     * @en Whether to invert the boolean value. For example, when the property value is true, the checkbox is displayed as unchecked.
     * @zh 是否反转布尔值。例如当属性值为true时，多选框显示为不勾选。
     */
    reverseBool: boolean;

    /**
     * @en Whether to allow null values. Default is true.
     * @zh 是否允许null值。默认为true。
     */
    nullable: boolean;

    /**
     * @en Minimum value for numbers
     * @zh 数字的最小值
     */
    min: number,

    /**
     * @en Maximum value for numbers
     * @zh 数字的最大值
     */
    max: number,

    /**
     * @en Value range, equivalent to setting min and max at once.
     * @zh 数值范围，等同于一次性设置min和max。
     */
    range: [number, number];

    /**
     * @en The magnitude of value change each time when changing the value by dragging.
     * @zh 拖动方式改变数值时，每次数值改变的幅度。
     */
    step: number;

    /**
     * @en Number of decimal places
     * @zh 小数点后的位数
     */
    fractionDigits: number;

    /**
     * @en Display as percentage
     * @zh 显示为百分比
     */
    percentage: boolean;

    /**
     * @en Applicable to array type properties. Indicates that the array is of fixed length and not allowed to be modified.
     * @zh 对数组类型属性适用。表示数组是固定长度，不允许修改。
     */
    fixedLength: boolean;

    /**
     * @en Applicable to array type properties. If not provided, it means the array allows all operations, if provided, only the listed operations are allowed.
     * @zh 对数组类型属性适用。如果不提供，则表示数组允许所有操作，如果提供，则只允许列出的操作。
     */
    arrayActions: Array<"append" | "insert" | "delete" | "move">;

    /**
     * @en Applicable to array type properties. Here you can define the properties of array elements
     * @zh 对数组类型属性适用。这里可以定义数组元素的属性
     */
    elementProps: Partial<FPropertyDescriptor>;

    /**
     * @en Applicable to color type properties. Indicates whether to provide modification of the transparency a value.
     * @zh 对颜色类型属性适用。表示是否提供透明度a值的修改。
     */
    showAlpha: boolean;

    /**
     * @en Applicable to color type properties. It differs from the default value in that when default is null, defaultColor can define a non-null default value.
     * @zh 对颜色类型属性适用。它与default值不同的是，当default是null时，可以用defaultColor定义一个非null时的默认值。
     */
    defaultColor: any;

    /**
     * @en Applicable to color type properties. Allows displaying a checkbox to determine whether the color is null.
     * @zh 对颜色类型属性适用。允许显示一个checkbox决定颜色是否为null。
     */
    colorNullable: boolean;

    /**
     * @en Applicable to object type properties. If true, hide the object's title, and the display indentation of the properties under the object will be reduced by one level.
     * @zh 对对象类型属性适用。如果为true，隐藏对象的标题，同时对象下的属性的显示缩进会减少一级。
     */
    hideHeader: boolean;

    /**
     * @en Applicable to object type properties. When creating an object, you can select a type from a dropdown menu. If explicitly set to null, the menu is disabled. By default, a menu for creating the base class is displayed.
     * @zh 对对象类型属性适用。对象创建时可以下拉选择一个类型。如果显示设置为null，则禁止菜单。默认是显示一个创建基类的菜单。
     */
    createObjectMenu: Array<string>;

    /**
     * @en Applicable to object type properties. Indicates that this property type has struct-like behavior characteristics, that is, it is always used as a whole.
     * For example, if the value of property b of object obj is a1, a1 is an instance of type T, and the structLike of type T is true, then when the properties of a1 change, the editor will simultaneously call obj.b = a1.
     * Default is false.
     * @zh 对对象类型属性适用。表示这个属性类型有类似结构体的行为特性，即总是作为一个整体使用。
     * 例如，obj对象的某个属性b的值是a1，a1是T类型的实例，且T类型的structLike为true，那么当a1的属性改变时，编辑器将同时调用obj.b = a1。
     * 默认为false。
     */
    structLike: boolean;

    /**
     * @en Indicates that this property is a reference to a resource
     * @zh 说明此属性是引用一个资源
     */
    isAsset: boolean;

    /**
     * @en Applicable to resource type properties. Multiple resource types are separated by commas, for example "Image,Audio".
     * @zh 对资源类型的属性适用。多个资源类型用逗号分隔，例如"Image,Audio"。
     */
    assetTypeFilter: string;

    /**
     * @en If the property type is string, and when selecting a resource, this option determines whether the property value is the original path of the resource or in the format of res://uuid. If true, it's the original path of the resource. Default is false.
     * @zh 如果属性类型是string，并且进行资源选择时，这个选项决定属性值是资源原始路径还是res://uuid这样的格式。如果是true，则是资源原始路径。默认false。
     */
    useAssetPath: boolean;

    /**
     * @en Applicable to resource type properties. Whether to allow selection of internal resources when choosing a resource
     * @zh 对资源类型的属性适用。选择资源时是否允许选择内部资源
     */
    allowInternalAssets: boolean;

    /**
     * @en Applicable to resource type properties. You can set a custom filter. The filter needs to be registered first through EditorEnv.assetMgr.customAssetFilters.
     * @zh 对资源类型的属性适用。可以设置一个自定义的过滤器。过滤器需要先通过EditorEnv.assetMgr.customAssetFilters注册。
     */
    customAssetFilter: string;

    /**
     * @en Applicable to properties of type Node or Component. If not null, when deserialization is performed in the actual runtime environment, the referenced object is no longer instantiated, but its serialized data is saved as-is to the specified property.
     * @zh 对类型是Node或者Component的属性适用。如果不为null，当在实际运行环境里执行反序列化时，引用对象不再实例化，而是将它的序列化数据原样保存到指定的属性中。
     */
    toTemplate: string;

    /**
     * @en Display position. Syntax: before xxx/after xxx/first/last.
     * @zh 显示位置。语法：before xxx/after xxx/first/last。
     */
    position: string;

    /**
     * @en Increase indentation, unit is level, not pixels.
     * @zh 增加缩进，单位是层级，不是像素。
     */
    addIndent?: number;

    /**
     * @en Default collapsed state of sub-properties
     * @zh 子属性默认折叠状态
     */
    collapsed?: boolean;

    /**
     * @en Indicates that the property is a private property. Private properties will not be displayed in the Inspector, but will be serialized and saved.
     * @zh 表示属性是私有属性。私有属性不会显示在Inspector里，但会序列化保存。
     */
    "private": boolean;

    /**
     * @en Indicates whether the property is allowed to be edited in multiple selection situations. Default is true.
     * @zh 表示属性是否允许多选情况下编辑。默认true。
     */
    allowMultipleObjects: boolean;

    /**
     * @en Indicates that the property is not displayed in the property table of derived classes
     * @zh 表示属性不显示在派生类的属性表中
     */
    hideInDeriveType: boolean;

    /**
     * @en When the property changes, additionally call a function of the object, this is the function name.
     * The function prototype is func(key?:string). Where key is passed when changing internal properties of members.
     * For example, when changing the internal properties of an element of the data, key is the index of this element.
     * @zh 属性改变时额外调用对象的一个函数，这里是函数名称。
     * 函数原型是func(key?:string)。其中key在改变成员内部属性时会传递。
     * 例如改变数据某个元素的内部属性，则key是这个元素的索引。
     */
    onChange: string;

    /**
     * @en Additional options
     * @zh 额外的选项
     */
    options: Record<string, any>;
}

export interface FTypeDescriptor {
    /**
     * @en Title. If not provided, the name will be used.
     * @zh 标题。如果不提供，则使用name。
     */
    caption: string;

    /**
     * @en URL of the help documentation.
     * @zh 帮助文档url地址。
     */
    help: string;

    /**
     * @en Add to the component menu.
     * @zh 添加到组件菜单。
     */
    menu: string;

    /**
     * @en Icon.
     * @zh 图标。
     */
    icon: string;

    /**
     * @en Whether it's a resource type.
     * @zh 是否资源类型。
     */
    isAsset: boolean;

    /**
     * @en Applicable to properties of resource types. Multiple resource types are separated by commas, e.g., "Image,Audio".
     * Available values can be found in editor/public/IAssetInfo.ts.
     * @zh 对资源类型的属性适用。多个资源类型用逗号分隔，例如"Image,Audio"。
     * 可用值参考editor/public/IAssetInfo.ts。
     */
    assetTypeFilter: string;

    /**
     * @en Indicates that this type has struct-like behavior, i.e., it's always used as a whole.
     * For example, if the value of property b of object obj is a1, a1 is an instance of type T, 
     * and T's structLike is true, then when a1's properties change, the editor will also call obj.b = a1.
     * Default is false.
     * @zh 表示这个类型有类似结构体的行为特性，即总是作为一个整体使用。
     * 例如，obj对象的某个属性b的值是a1，a1是T类型的实例，且T类型的structLike为true，
     * 那么当a1的属性改变时，编辑器将同时调用obj.b = a1。
     * 默认为false。
     */
    structLike: boolean;

    /**
     * @en Initial value. This value is only used in the panel, it specifies the initial value 
     * given to the property when creating an object from the interface.
     * @zh 初始值。这个值只在面板中使用，它指从界面上创建对象时赋予属性的初始值。
     */
    init: any;

    /**
     * @en List of properties.
     * @zh 属性列表。
     */
    properties: Array<Partial<FPropertyDescriptor>>;

    /**
     * @en Control for editing instances of this class.
     * @zh 编辑这个类实例的控件。
     */
    inspector: string;

    /**
     * @en Applicable to Components, indicates the type of node this component can be mounted on. Default is null.
     * @zh 对Component使用，表示这个组件允许挂载的节点类型。默认null。
     */
    worldType: "2d" | "3d" | null;

    /** 
     * @en Applicable to Components, when AddComponent, add dependent Components at the same time.
     * @zh 对Component适用，当AddComponent时同时添加依赖的Component。
     */
    requireComponents?: Array<string>;

    /** 
     * @en When creating a new node or adding a component, the dependent engine library is automatically added for Node and Component. For example: ["laya. physicals3D"]
     * @zh 对Node和Component使用，当新建Node或者添加Component时，自动添加依赖的引擎库。例如：["laya.physics3D"]
     */
    requireEngineLibs?: Array<string>;

    /**
     * @en Used for Component, if true and menu property is defined, this component will also 
     * be displayed in the new object menu of the hierarchy panel.
     * @zh 对Component使用，如果为true，并且定义了menu属性，则这个组件还会显示在层级面板的新建对象菜单上。
     */
    inHierarchyMenu: boolean;

    /**
     * @en Additional options.
     * @zh 额外的选项。
     */
    options: Record<string, any>;
}
function dummy() { }

/**
 * @en Register a class so it can be automatically saved and loaded by the serialization system.
 * @param assetId The asset ID for the class.
 * @zh 注册一个类型，注册后才能被序列化系统自动保存和载入。
 * @param assetId 类型的资源ID。
 */
export function regClass(assetId?: string): any {
    return function (constructor: Function) {
        ClassUtils.regClass(assetId, constructor);
    };
}

/**
 * @en Set additional information for a class type.
 * @param info Additional information for the class type.
 * @zh 设置类型的额外信息。
 * @param info 类型的额外信息。
 */
export function classInfo(info?: Partial<FTypeDescriptor>): any { return dummy; }

/**
 * @en Set the component to execute a complete lifecycle in the editor environment.
 * @param constructor The constructor of the component.
 * @zh 设置组件可以在编辑器环境中执行完整生命周期。
 * @param constructor 组件的构造函数。
 */
export function runInEditor(constructor: Function): void { }

/**
 * @en Allow multiple instances of the component to be added to the same node.
 * @param constructor The constructor of the component.
 * @zh 设置组件可以添加多个实例到同一个节点上。
 * @param constructor 组件的构造函数。
 */
export function allowMultiple(constructor: Function): void {
    constructor.prototype._$singleton = false;
}

/**
 * @en Use this decorator to make a property visible in the editor's property panel and serializable.
 * @param info The type of the property, such as Number, "number", [Number], ["Record", Number], etc. 
 * Or pass an object describing detailed information, e.g., { type: "string", multiline: true }.
 * @zh 使用这个装饰器，可以使属性显示在编辑器属性设置面板上，并且能序列化保存。
 * @param info 属性的类型，如: Number,"number",[Number],["Record", Number]等。
 * 或传递对象描述详细信息，例如{ type: "string", multiline: true }。
 */
export function property(info: FPropertyType | Partial<FPropertyDescriptor>): any { return dummy; }

/**
 * @en Register a resource loader.
 * @param fileExtensions File extensions that this loader can handle.
 * @param type Type identifier. If this resource needs to support identification without extension, 
 * or if one extension corresponds to multiple resource types, specifying the type parameter is a best practice.
 * @param hotReloadable Whether it supports hot reloading.
 * @zh 注册一种资源装载器。
 * @param fileExtensions 扩展名。
 * @param type 类型标识。如果这种资源需要支持识别没有扩展名的情况，
 * 或者一个扩展名对应了多种资源类型的情况，那么指定type参数是个最优实践。
 * @param hotReloadable 是否支持热重载。
 */
export function regLoader(fileExtensions: string[], type?: string, hotReloadable?: boolean) {
    return function (constructor: Function) {
        Loader.registerLoader(fileExtensions, <any>constructor, type, hotReloadable);
    };
}
