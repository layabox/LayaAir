import { Component } from "../../../components/Component";
import { Rigidbody3D } from "../Rigidbody3D";
import { Physics3D } from "../Physics3D";

/**
 * <code>ConstraintComponent</code> 类用于创建约束的父类。
 */
export class ConstraintComponent extends Component {
	/**@internal */
	private _btConstraint: any;
	/**@internal */
	private _breakingImpulseThreshold: number;
	/**@internal */
	private _connectedBody: Rigidbody3D;
	/**@internal */
	private _feedbackEnabled: boolean = false;

	/**
	 * @inheritDoc
	 * @override
	 */
	get enabled(): boolean {
		return super.enabled;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	set enabled(value: boolean) {
		this._btConstraint.IsEnabled = value;
		super.enabled = value;
	}

	/**
	 * 获取打破冲力阈值。
	 * @return 打破冲力阈值。
	 */
	get breakingImpulseThreshold(): number {
		return this._breakingImpulseThreshold;
	}

	/**
	 * 设置打破冲力阈值。
	 * @param value 打破冲力阈值。
	 */
	set breakingImpulseThreshold(value: number) {
		this._btConstraint.BreakingImpulseThreshold = value;
		this._breakingImpulseThreshold = value;
	}

	/**
	 * 获取应用的冲力。
	 */
	get appliedImpulse(): number {
		if (!this._feedbackEnabled) {
			this._btConstraint.EnableFeedback(true);
			this._feedbackEnabled = true;
		}
		return this._btConstraint.AppliedImpulse;
	}

	/**
	 * 获取已连接的刚体。
	 * @return 已连接刚体。
	 */
	get connectedBody(): Rigidbody3D {
		return this._connectedBody;
	}

	/**
	 * 设置已连接刚体。
	 * @param value 已连接刚体。
	 */
	set connectedBody(value: Rigidbody3D) {
		this._connectedBody = value;
	}

	/**
	 * 创建一个 <code>ConstraintComponent</code> 实例。
	 */
	constructor() {
		super();


	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _onDestroy(): void {
		var physics3D: any = Physics3D._bullet;
		physics3D.destroy(this._btConstraint);
		this._btConstraint = null;
	}
}

