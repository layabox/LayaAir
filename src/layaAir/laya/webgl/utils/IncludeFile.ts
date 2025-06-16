import { ShaderNode } from "./ShaderNode";

export class IncludeFile {
    static splitToWords(str: string, block: ShaderNode): string[] {//这里要修改
        let out: string[] = [];
        let c: string;
        let ofs: number = -1;
        let word: string;
        let n = str.length;
        for (let i: number = 0; i < n; i++) {
            c = str.charAt(i);
            if (" \t=+-*/&%!<>()'\",;".indexOf(c) >= 0) {
                if (ofs >= 0 && (i - ofs) > 1) {
                    word = str.substring(ofs, i);
                    out.push(word);
                }
                if (c == '"' || c == "'") {
                    let ofs2: number = str.indexOf(c, i + 1);
                    if (ofs2 < 0) {
                        throw "Sharder err:" + str;
                    }
                    out.push(str.substring(i + 1, ofs2));
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
            word = str.substring(ofs, n);
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
        let begin: number = 0, ofs: number, end: number;
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
            let words = IncludeFile.splitToWords(txt.substring(begin, ofs), null);
            if (words[1] == 'code') {
                this.codes[words[2]] = txt.substring(ofs + 1, end);
            } else if (words[1] == 'function')//#begin function void test()
            {
                ofs = txt.indexOf("function", begin);
                ofs += "function".length;
                this.funs[words[3]] = txt.substring(ofs + 1, end);
                this.funnames += words[3] + ";";
            }

            begin = end + 1;
        }
    }

    getWith(name: string | null = null): string {
        let r: string = name ? this.codes[name] : this.script;
        if (!r) {
            throw "get with error:" + name;
        }
        return r;
    }

    getFunsScript(funsdef: string): string {
        let r: string = "";
        for (let i in this.funs) {
            if (funsdef.indexOf(i + ";") >= 0) {
                r += this.funs[i];
            }
        }
        return r;
    }

}


