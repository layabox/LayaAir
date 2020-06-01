export class ShaderDefinesBase {

    /**@internal */
    _value: number = 0;

    private _name2int: { [id: string]: number };
    private _int2name: any[];
    private _int2nameMap: any[];

    constructor(name2int: any, int2name: any[], int2nameMap: any[]) {
        this._name2int = name2int;
        this._int2name = int2name;
        this._int2nameMap = int2nameMap;
    }

    //TODO:coverage
    add(value: any): number {
        if (typeof (value) == 'string') {
            this._value |= this._name2int[(<string>value)];
        } else {
            this._value |= value;
        }
        return this._value;
    }

    addInt(value: number): number {
        this._value |= value;
        return this._value;
    }

    //TODO:coverage
    remove(value: any): number {
        if (typeof (value) == 'string') {
            this._value &= ~(this._name2int[(<string>value)]);
        } else {
            this._value &= (~value);
        }
        return this._value;
    }

    //TODO:coverage
    isDefine(def: number): boolean {
        return (this._value & def) === def;
    }

    //TODO:coverage
    getValue(): number {
        return this._value;
    }

    setValue(value: number): void {
        this._value = value;
    }

    toNameDic(): any {
        var r: string = this._int2nameMap[this._value];
        return r ? r : ShaderDefinesBase._toText(this._value, this._int2name, this._int2nameMap);
    }

    static _reg(name: string, value: number, _name2int: any, _int2name: any[]): void {
        _name2int[name] = value;
        _int2name[value] = name;
    }

    static _toText(value: number, _int2name: any[], _int2nameMap: any): any {
        var r: string = _int2nameMap[value];
        if (r) return r;
        var o: any = {};
        var d: number = 1;
        for (var i: number = 0; i < 32; i++) {
            d = 1 << i;
            if (d > value) break;
            if (value & d) {
                var name: string = _int2name[d];
                name && (o[name] = "");
            }
        }
        _int2nameMap[value] = o;
        return o;
    }

    //TODO:coverage
    static _toInt(names: string, _name2int: any): number {
        var words: any[] = names.split('.');
        var num: number = 0;
        for (var i: number = 0, n: number = words.length; i < n; i++) {
            var value: number = _name2int[words[i]];
            if (!value) throw new Error("Defines to int err:" + names + "/" + words[i]);
            num |= value;
        }
        return num;
    }
}


