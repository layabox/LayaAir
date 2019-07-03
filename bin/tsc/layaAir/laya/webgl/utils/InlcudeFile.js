import { ILaya } from "../../../ILaya";
//import { ShaderCompile } from "./ShaderCompile";
export class InlcudeFile {
    constructor(txt) {
        this.codes = {};
        this.funs = {};
        this.curUseID = -1;
        this.funnames = "";
        this.script = txt;
        var begin = 0, ofs, end;
        while (true) {
            begin = txt.indexOf("#begin", begin);
            if (begin < 0)
                break;
            end = begin + 5;
            while (true) {
                end = txt.indexOf("#end", end);
                if (end < 0)
                    break;
                if (txt.charAt(end + 4) === 'i')
                    end += 5;
                else
                    break;
            }
            if (end < 0) {
                throw "add include err,no #end:" + txt;
            }
            ofs = txt.indexOf('\n', begin);
            var words = ILaya.ShaderCompile.splitToWords(txt.substr(begin, ofs - begin), null);
            if (words[1] == 'code') {
                this.codes[words[2]] = txt.substr(ofs + 1, end - ofs - 1);
            }
            else if (words[1] == 'function') //#begin function void test()
             {
                ofs = txt.indexOf("function", begin);
                ofs += "function".length;
                this.funs[words[3]] = txt.substr(ofs + 1, end - ofs - 1);
                this.funnames += words[3] + ";";
            }
            begin = end + 1;
        }
    }
    getWith(name = null) {
        var r = name ? this.codes[name] : this.script;
        if (!r) {
            throw "get with error:" + name;
        }
        return r;
    }
    getFunsScript(funsdef) {
        var r = "";
        for (var i in this.funs) {
            if (funsdef.indexOf(i + ";") >= 0) {
                r += this.funs[i];
            }
        }
        return r;
    }
}
