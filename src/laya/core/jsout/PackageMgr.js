export function regClassToEngine(name, cls) {
    var laya = window.Laya || (window.Laya = {});
    laya[name] = cls;
}
