export class ParseJSON {
    static parse(str: string) {
        return this.parseStart(str);
    }

    private static findIndex(str: string, i: number, fstr: string, len: number) {
        var fi = str.indexOf(fstr, i + 1);
        if (0 > fi) {
            fi = len;
        }
        return { str: str.substring(i + 1, fi), i: fi };

    }
    private static finCurrObj(cobj: { k?: string, val: any }, currArr: { k?: string, val: any }[], ret: any): any {
        if (null == cobj) {
            return null;
        }
        if (0 == currArr.length) {
            if (cobj.k) {
                ret[cobj.k] = cobj.val;
            }
            return null;
        } else {
            var pobj = currArr.pop()!;
            if (cobj.k) {
                if (Array.isArray(pobj.val)) {
                    if (null != cobj.k) {
                        var obj: any = {};
                        obj[cobj.k] = cobj.val;
                        pobj.val.push(obj);
                    } else {
                        //没有key，应该常见的时候已经push进去了
                        //pobj.val.push(cobj.val);
                    }
                } else {
                    pobj.val[cobj.k] = cobj.val;
                }
            } else if (Array.isArray(cobj.val)) {
                if (Array.isArray(pobj.val)) {
                    pobj.val.push(cobj.val);
                } else {
                    pobj.val = cobj.val;
                }
            } else {
                //console.log("应该是已经被push过的obj对象，无需处理");
            }
            return pobj;
        }
    }

    private static formatVal(str: string) {
        var numVal = Number(str);
        if (!isNaN(numVal)) {
            return numVal;
        }
        return str;
    }

    private static parseStart(str: string) {
        var len = str.length;
        var i = 0;
        var ret = {};
        var currStr = null;
        var currArr: { k?: string, val: any }[] = [];
        var cobj: any = null;
        var type = 0;//type为0代表没有找到任何状态，1为当前在寻找key，2为当前在寻找val


        while (i < len) {
            var c = str.charAt(i);
            if ("/" == c) {
                if (i + 1 < len) {
                    i += 1;
                    var cNext = str.charAt(i);
                    var cstr = null;
                    if ("/" == cNext) {
                        //单行注释
                        cstr = "\n";
                    } else if ("*" == cNext) {
                        //多行注释
                        cstr = "*/"
                    }
                    if (null != cstr) {


                        if (null != currStr) {
                            currStr = (currStr as any).trim();
                            if ("" != currStr) {
                                if (null != cobj) {
                                    if (Array.isArray(cobj.val)) {
                                        cobj.val.push(this.formatVal(currStr));
                                    } else {
                                        cobj.val = this.formatVal(currStr);
                                        cobj = this.finCurrObj(cobj, currArr, ret);
                                        type = 1;
                                    }
                                }
                                currStr = "";
                            }
                        }



                        var fi = str.indexOf(cstr, i);
                        if (0 > fi) {
                            console.log("没有找到注释结尾，应该是一直注释到最后了");
                            i = len;
                        } else {
                            i = fi + cstr.length - 1;
                        }
                    }
                }
            } else if ("}" == c) {
                if (null != cobj) {
                    if (currStr) {
                        currStr = currStr.trim();
                        if ("" != currStr) {
                            if (Array.isArray(cobj.val)) {
                                cobj.val.push(this.formatVal(currStr));
                            } else {
                                cobj.val = this.formatVal(currStr);
                                cobj = this.finCurrObj(cobj, currArr, ret);
                            }
                        }
                    }
                    if (null != cobj) {
                        cobj = this.finCurrObj(cobj, currArr, ret);
                    }
                }
                currStr = "";
                type = 1;
                //obj结束
            } else if ("{" == c) {
                currStr = "";
                type = 1;




            } else if ("'" == c || "\"" == c || "‘" == c || "“" == c) {
                //检测发现这里是字符串
                if ("‘" == c) {
                    c = "’";
                } else if ("“" == c) {
                    c = "”";
                }
                var obj = this.findIndex(str, i, c, len);

                if (null != cobj && Array.isArray(cobj.val)) {
                    if (null != currStr) {
                        currStr = currStr.trim();
                        if ("" != currStr) {
                            cobj.val.push(this.formatVal(currStr));
                        }
                    }
                    cobj.val.push(obj.str);
                    currStr = "";
                } else if (null != currStr) {
                    currStr += obj.str;
                }
                i = obj.i;
            } else if (";" == c || "," == c || "\n" == c) {
                if (null != currStr) {
                    currStr = (currStr as any).trim();
                    if ("" != currStr) {
                        if (null != cobj) {
                            if (Array.isArray(cobj.val)) {
                                cobj.val.push(this.formatVal(currStr));
                            } else {
                                cobj.val = this.formatVal(currStr);
                                cobj = this.finCurrObj(cobj, currArr, ret);
                                type = 1;
                            }
                        }
                        currStr = "";
                    }


                }
            } else if ("]" == c) {
                //数组结束
                if (null != currStr && null != cobj && Array.isArray(cobj.val)) {
                    currStr = currStr.trim();
                    if ("" != currStr) {
                        cobj.val.push(this.formatVal(currStr));
                    }
                }
                if (null != cobj) {
                    //数组需要完成两次才算结束出去
                    cobj = this.finCurrObj(cobj, currArr, ret);
                    cobj = this.finCurrObj(cobj, currArr, ret);
                    type = 1;
                }
                currStr = "";
            } else if ("[" == c) {
                if (2 != type) {
                    console.warn("没有key值，忽略掉一个数组");
                } else {
                    if (null != cobj) {
                        currArr.push(cobj);
                    }
                    cobj = { val: [] };
                }
            } else if (":" == c) {
                if (null != currStr && 1 == type) {
                    type = 2;
                    if (null != cobj) {
                        currArr.push(cobj);
                    }
                    if (null != cobj && Array.isArray(cobj.val)) {
                        //数组中的obj对象 eg: {b:[{aa:3,bb:4}],}
                        var pcobj = cobj;
                        cobj = { val: {} };
                        pcobj.val.push(cobj.val);
                        currArr.push(cobj);

                    }
                    cobj = { k: currStr.trim(), val: {} };



                    currStr = "";
                }
            } else if (null != currStr) {
                currStr += c;
            }
            i++;
        }
        return ret;
    }


}