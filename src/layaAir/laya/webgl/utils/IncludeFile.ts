import { ShaderCompile } from "./ShaderCompile";
import { ShaderNode } from "./ShaderNode";

export class IncludeFile {
    static splitToWords(str: string, block: ShaderNode): any[] {//这里要修改
        var out: any[] = [];
        /*
           var words:Array = str.split(_splitToWordExps);
           trace(str);
           trace(words);
         */
        var c: string;
        var ofs: number = -1;
        var word: string;
        for (var i: number = 0, n: number = str.length; i < n; i++) {
            c = str.charAt(i);
            if (" \t=+-*/&%!<>()'\",;".indexOf(c) >= 0) {
                if (ofs >= 0 && (i - ofs) > 1) {
                    word = str.substr(ofs, i - ofs);
                    out.push(word);
                }
                if (c == '"' || c == "'") {
                    var ofs2: number = str.indexOf(c, i + 1);
                    if (ofs2 < 0) {
                        throw "Sharder err:" + str;
                    }
                    out.push(str.substr(i + 1, ofs2 - i - 1));
                    i = ofs2;
                    ofs = -1;
                    continue;
                }
                if (c == '(' && block && out.length > 0) {
                    word = out[out.length - 1] + ";";
                    if ("vec4;main;".indexOf(word) < 0)
                        block.useFuns += word;
                }
                ofs = -1;
                continue;
            }
            if (ofs < 0) ofs = i;
        }
        if (ofs < n && (n - ofs) > 1) {
            word = str.substr(ofs, n - ofs);
            out.push(word);
        }
        return out;
    }


    script: string;
    codes: any = {};
    funs: any = {};
    curUseID: number = -1;
    funnames: string = "";

    constructor(txt: string) {
        this.script = txt;
        var begin: number = 0, ofs: number, end: number;
        while (true) {
            begin = txt.indexOf("#begin", begin);
            if (begin < 0) break;

            end = begin + 5;
            while (true) {
                end = txt.indexOf("#end", end);
                if (end < 0) break;
                if (txt.charAt(end + 4) === 'i')
                    end += 5;
                else break;
            }

            if (end < 0) {
                throw "add include err,no #end:" + txt;
            }

            ofs = txt.indexOf('\n', begin);
            var words: any[] = IncludeFile.splitToWords(txt.substr(begin, ofs - begin), null);
            if (words[1] == 'code') {
                this.codes[words[2]] = txt.substr(ofs + 1, end - ofs - 1);
            } else if (words[1] == 'function')//#begin function void test()
            {
                ofs = txt.indexOf("function", begin);
                ofs += "function".length;
                this.funs[words[3]] = txt.substr(ofs + 1, end - ofs - 1);
                this.funnames += words[3] + ";";
            }

            begin = end + 1;
        }
    }

    getWith(name: string | null = null): string {
        var r: string = name ? this.codes[name] : this.script;
        if (!r) {
            throw "get with error:" + name;
        }
        return r;
    }

    getFunsScript(funsdef: string): string {
        var r: string = "";
        for (var i in this.funs) {
            if (funsdef.indexOf(i + ";") >= 0) {
                r += this.funs[i];
            }
        }
        return r;
    }

}


