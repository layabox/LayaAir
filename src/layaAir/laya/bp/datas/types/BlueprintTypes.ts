export enum BPType {
    Event,
    Function,
    Operator,
    GetValue,
    SetValue,
    ///
    Pure,
    Branch,
    Sequnece,
    NewTarget,
}
export enum ComponentType {
    boolean = "boolean",
    number = "number",
    color = "color",
    string = "string",
}




export interface TBPStageData {
    //events: string[],
    name: string,
    uiData?: {
        /**场景的x坐标位置 */
        x: number;
        /**场景的y坐标位置 */
        y: number;
        /**场景的缩放 */
        scale: number;
    },
    arr: Array<TBPNode>;
    /**保存的时候不会有这个值，这是build的时候传值用的 */
    varMap?: Record<string, TBPVarProperty>;
}
export interface TBPVarProperty {
    name: string,
    aliasName?: string,
    value?: any,
    type: TypeParameter,
    desc?: string,
    const?: boolean,
}
export interface TBPProperty {
    title?: string,
    type: string,
    data: any,
}
/**
 * 蓝图数据最终的保存结构
 */
export interface TBPSaveData {
    autoID: number,
    extends:string,
    //_$type: string,
    //blueprintMap: Record<string, TBPStageData>,
    blueprintArr: TBPStageData[],
    variable: TBPVarProperty[],
    functions: TBPStageData[],
}
export interface TBPCOutput {
    /** 插槽名称 */
    name?: string,
    /** 插槽允许的输出连接类型，输入字符串表示仅能连接该类型，数组表示可连接数组内类型*/
    type: TypeParameter | ((nodeId: number, index: number) => TypeParameter),
    /**output简介提示，UI上显示使用，鼠标挪动到UI上会出现该提示信息 */
    alt?: string,
}
export interface TBPOutput {
    infoArr: TBPConnType[],
}
export interface TBPCInput {
    /** 插槽名称 */
    name?: string,
    /** 插槽允许的连接类型，输入字符串表示仅能连接该类型，数组表示可连接数组类型*/
    type: TypeParameter | ((nodeId: number, id: number, index: number) => TypeParameter),
    /** 默认值*/
    value?: any,
    /**input简介提示，UI上显示使用，鼠标挪动到UI上会出现该提示信息 */
    alt?: string,
    /**是否隐藏该节点 */
    hidden?: boolean | ((nodeId: number, id: number, index: number) => boolean),
}
export interface TBPInput {
    type?: TypeParameter,
    /**插槽连接上的默认值，输入节点有组件的一般就会有默认值 */
    value?: any,
    /**插槽注释 */
    desc?: string,
}
export interface TBPConnType {
    /** 插槽连接到的另一个节点的id */
    nodeId: number,
    /** 插槽连接到的另一个节点的第n个插槽 */
    index?: number,
    /**连接到的input或者output的ID号 */
    id?: string,
    /**连接到的input或者output的name */
    name?: string,
}


export interface TBPCNode {
    /**程序中用到的名字 */
    name: string,
    /**来源的类 */
    target?: string,
    /** 数据唯一的id号,可以不写，默认为name*/
    id?: string,
    /**该节点的类型 */
    type: BPType,
    /**鼠标右键里面的菜单路径,如果填写none则代表不在菜单中显示 */
    menuPath?: string,
    /**版本号 */
    ver?: number,
    /**别名，一般用于多语言，有这个名字UI会优先显示这个名字 */
    aliasName?: string;
    /**函数的简介，UI上显示使用，鼠标挪动到UI上会出现该提示信息 */
    alt?: string;
    input?: TBPCInput[];
    output?: TBPCOutput[];
}
export interface TBPNode {
    /** 数据唯一的id号*/
    id: number;
    ver?: number;
    /** constData的id号 */
    cid: string;
    /**如果是var类型定义，则会有这个值 */
    varName?: string;
    /**所有UI所用到的数据 */
    uiData?: {
        /**数据的x坐标位置 */
        x: number;
        /**数据的y坐标位置 */
        y: number;
        /**函数注释 */
        desc?: any;
        /**是否隐藏 */
        isHidden?: boolean,
        /**是否显示desc的气泡 */
        isShowDesc?: boolean;
    },
    input?: Record<string, TBPInput>;
    output?: Record<string, TBPOutput>;
}

export type TypeParameter = string | [TypeParameter] | ["Record", TypeParameter] | ["Map", TypeParameter];

export type TypeExtendsData = Record<string, Record<string,
    {
        extends?: string,
        return?: TypeParameter,
        parameter?: { name: string, type: TypeParameter }[],
    } | string>>;