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
        var _factory = Physics.I._factory;
        if (this._joint && _factory.getJoint_userData(this._joint) && !_factory.getJoint_userData_destroy(this._joint)) {
            Physics.I._removeJoint(this._joint);
        }
        this._joint = null;
    }
}
