/**
 * 引脚方向
 */
export enum EPinDirection {
    //输入
    Input,
    //输出
    Output,
    //所有
    All
}

/**
 * 节点类型 
 */
export enum EBlueNodeType {
    Unknow="unkown",
    Event="event",
    Fun="fun",
    Pure="pure",
    GetVariable="var",
    SetVarialbe="setVar",
    Branch="branch",
    Sequnece="sequnece"
}
/**
 * 引脚类型
 */
export enum EPinType {
    Exec,
    BPFun,
    Other
}

