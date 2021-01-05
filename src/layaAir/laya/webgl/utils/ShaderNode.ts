import { ILaya } from "../../../ILaya";

//	import { ShaderCompile } from "./ShaderCompile"

export class ShaderNode {
    private static __id: number = 1;

    childs: any[] = [];
    text: string = "";
    parent: ShaderNode;
    name: string;
    noCompile: boolean;
    includefiles: any[];
    condition: any;
    conditionType: number;
    useFuns: string = "";
    z: number = 0;
    src: string;

    constructor(includefiles: any[]) {
        this.includefiles = includefiles;
    }

    setParent(parent: ShaderNode): void {
        parent.childs.push(this);
        this.z = parent.z + 1;
        this.parent = parent;
    }

    setCondition(condition: string, type: number): void {
        if (condition) {
            this.conditionType = type;
            condition = condition.replace(/(\s*$)/g, "");
            this.condition = function (): boolean {
                return (this as any)[condition];
            }
            this.condition.__condition = condition;
        }
    }

    toscript(def: any, out: any[]): any[] {
        return this._toscript(def, out, ++ShaderNode.__id);
    }

    private _toscript(def: any, out: any[], id: number): any[] {
        if (this.childs.length < 1 && !this.text) return out;
        var outIndex: number = out.length;
        if (this.condition) {
            var ifdef: boolean = !!this.condition.call(def);
            this.conditionType === ILaya.ShaderCompile.IFDEF_ELSE && (ifdef = !ifdef);
            if (!ifdef) return out;
        }
        if(this.noCompile)
        this.text && out.push(this.text);
        this.childs.length > 0 && this.childs.forEach(function (o: ShaderNode, index: number, arr: ShaderNode[]): void {
            o._toscript(def, out, id);
        });

        if (this.includefiles.length > 0 && this.useFuns.length > 0) {
            var funsCode: string;
            for (var i: number = 0, n: number = this.includefiles.length; i < n; i++) {
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


