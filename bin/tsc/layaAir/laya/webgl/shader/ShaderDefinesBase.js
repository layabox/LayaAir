export class ShaderDefinesBase {
    constructor(name2int, int2name, int2nameMap) {
        /**@internal */
        this._value = 0;
        this._name2int = name2int;
        this._int2name = int2name;
        this._int2nameMap = int2nameMap;
    }
    //TODO:coverage
    add(value) {
        if (typeof (value) == 'string') {
            this._value |= this._name2int[value];
        }
        else {
            this._value |= value;
        }
        return this._value;
    }
    addInt(value) {
        this._value |= value;
        return this._value;
    }
    //TODO:coverage
    remove(value) {
        if (typeof (value) == 'string') {
            this._value &= ~(this._name2int[value]);
        }
        else {
            this._value &= (~value);
        }
        return this._value;
    }
    //TODO:coverage
    isDefine(def) {
        return (this._value & def) === def;
    }
    //TODO:coverage
    getValue() {
        return this._value;
    }
    setValue(value) {
        this._value = value;
    }
    toNameDic() {
        var r = this._int2nameMap[this._value];
        return r ? r : ShaderDefinesBase._toText(this._value, this._int2name, this._int2nameMap);
    }
    static _reg(name, value, _name2int, _int2name) {
        _name2int[name] = value;
        _int2name[value] = name;
    }
    static _toText(value, _int2name, _int2nameMap) {
        var r = _int2nameMap[value];
        if (r)
            return r;
        var o = {};
        var d = 1;
        for (var i = 0; i < 32; i++) {
            d = 1 << i;
            if (d > value)
                break;
            if (value & d) {
                var name = _int2name[d];
                name && (o[name] = "");
            }
        }
        _int2nameMap[value] = o;
        return o;
    }
    //TODO:coverage
    static _toInt(names, _name2int) {
        var words = names.split('.');
        var num = 0;
        for (var i = 0, n = words.length; i < n; i++) {
            var value = _name2int[words[i]];
            if (!value)
                throw new Error("Defines to int err:" + names + "/" + words[i]);
            num |= value;
        }
        return num;
    }
}
