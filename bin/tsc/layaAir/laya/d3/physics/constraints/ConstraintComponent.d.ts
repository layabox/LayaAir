import { Rigidbody3D } from "../Rigidbody3D";
import { Component } from "../../../components/Component";
/**
 * <code>ConstraintComponent</code> 类用于创建约束的父类。
 */
export declare class ConstraintComponent extends Component {
    /**@private */
    private _nativeConstraint;
    /**@private */
    private _breakingImpulseThreshold;
    /**@private */
    private _connectedBody;
    /**@private */
    private _feedbackEnabled;
    /**
     * @inheritDoc
     */
    /**
    * @inheritDoc
    */
    /*override*/ enabled: boolean;
    /**
     * 获取打破冲力阈值。
     * @return 打破冲力阈值。
     */
    /**
    * 设置打破冲力阈值。
    * @param value 打破冲力阈值。
    */
    breakingImpulseThreshold: number;
    /**
     * 获取应用的冲力。
     */
    readonly appliedImpulse: number;
    /**
     * 获取已连接的刚体。
     * @return 已连接刚体。
     */
    /**
    * 设置已连接刚体。
    * @param value 已连接刚体。
    */
    connectedBody: Rigidbody3D;
    /**
     * 创建一个 <code>ConstraintComponent</code> 实例。
     */
    constructor();
    /**
     * @inheritDoc
     */
    protected _onDestroy(): void;
}
