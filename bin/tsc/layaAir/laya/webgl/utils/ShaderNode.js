import { ILaya } from "../../../ILaya";
//	import { ShaderCompile } from "./ShaderCompile"
export class ShaderNode {
    constructor(includefiles) {
        this.childs = [];
        this.text = "";
        this.useFuns = "";
        this.z = 0;
        this.includefiles = includefiles;
    }
    setParent(parent) {
        parent.childs.push(this);
        this.z = parent.z + 1;
        this.parent = parent;
    }
    setCondition(condition, type) {
        if (condition) {
            this.conditionType = type;
            condition = condition.replace(/(\s*$)/g, "");
            this.condition = function () {
                return this[condition];
            };
            this.condition.__condition = condition;
        }
    }
    toscript(def, out) {
        return this._toscript(def, out, ++ShaderNode.__id);
    }
    _toscript(def, out, id) {
        if (this.childs.length < 1 && !this.text)
            return out;
        var outIndex = out.length;
        if (this.condition) {
            var ifdef = !!this.condition.call(def);
            this.conditionType === ILaya.ShaderCompile.IFDEF_ELSE && (ifdef = !ifdef);
            if (!ifdef)
                return out;
        }
        this.text && out.push(this.text);
        this.childs.length > 0 && this.childs.forEach(function (o, index, arr) {
            o._toscript(def, out, id);
        });
        if (this.includefiles.length > 0 && this.useFuns.length > 0) {
            var funsCode;
            for (var i = 0, n = this.includefiles.length; i < n; i++) {
                //如果已经加入了，就不要再加
                if (this.includefiles[i].curUseID == id) {
                    continue;
                }
                funsCode = this.includefiles[i].file.getFunsScript(this.useFuns);
                if (funsCode.length > 0) {
                    this.includefiles[i].curUseID = id;
                    out[0] = funsCode + out[0];
                }
            }
        }
        return out;
    }
}
ShaderNode.__id = 1;
