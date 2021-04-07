import { Component } from "../../components/Component"
import { Physics } from "../Physics"
import { ClassUtils } from "../../utils/ClassUtils";
import { RigidBody } from "../RigidBody";

/**
 * 关节基类
 */
export class JointBase extends Component {
    /**原生关节对象*/
    protected _joint: any;

    /**[只读]原生关节对象*/
    get joint(): any {
        if (!this._joint) this._createJoint();
        return this._joint;
    }
    /**
     * @internal
     * @override
     */
    _onEnable(): void {
        this._createJoint();
    }
    /**
     * @internal
     * @override
     */
    _onAwake(): void {
        this._createJoint();
    }

    protected _createJoint(): void {
    }
    /**
     * @internal
     * @override
     */
    protected _onDisable(): void {
        if (this._joint&&this._joint.m_userData&&!this._joint.m_userData.isDestroy) {
            Physics.I._removeJoint(this._joint);
        }
        this._joint = null;
    }

    /**
     * 获取是否为单实例组件。
     * @override
     */
     get isSingleton(): boolean {
        return false;
    }
}

ClassUtils.regClass("laya.physics.joint.JointBase", JointBase);
ClassUtils.regClass("Laya.JointBase", JointBase);
