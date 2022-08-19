import { Component } from "../../components/Component"
import { Physics } from "../Physics"

/**
 * 关节基类
 */
export class JointBase extends Component {
    /**原生关节对象*/
    protected _joint: any;

    constructor() {
        super();

        this._singleton = false;
    }

    /**[只读]原生关节对象*/
    get joint(): any {
        if (!this._joint) this._createJoint();
        return this._joint;
    }

    protected _onEnable(): void {
        this._createJoint();
    }

    protected _onAwake(): void {
        this._createJoint();
    }

    protected _createJoint(): void {
    }

    protected _onDisable(): void {
        if (this._joint && this._joint.m_userData && !this._joint.m_userData.isDestroy) {
            Physics.I._removeJoint(this._joint);
        }
        this._joint = null;
    }
}
