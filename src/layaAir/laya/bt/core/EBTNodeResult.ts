export enum EBTNodeResult {
    // 正在进行时
    InProgress,
    // 结束返回成功
    Succeeded,
    // 结束返回失败
    Failed,
    // finished aborting = failure
    Aborted
}