/**
 * <code>IDestroy</code> 是对象销毁的接口。
 */
export interface IDestroy {
    destroyed: boolean;
    destroy(): void;
}
