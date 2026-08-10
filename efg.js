var body = $response.body;
var url = $request.url;

try {
    var obj = JSON.parse(body);
    var vipKeys = ['vip_status', 'is_vip', 'isVip', 'vip', 'member', 'level', 'role', 'vip_level'];
    var timeKeys = ['vip_time', 'vip_expire', 'expire_time', 'expireAt', 'vip_expire_at'];
    
    function deepInject(target) {
        if (!target || typeof target !== "object") return;
        for (var key in target) {
            var value = target[key];
            if (vipKeys.indexOf(key) !== -1) {
                if (typeof value === "boolean") target[key] = true;
                else if (typeof value === "number") target[key] = 3;
                else if (typeof value === "string" && value === "0") target[key] = "1";
            }
            if (timeKeys.indexOf(key) !== -1) {
                target[key] = "2099-12-31T23:59:59.000Z";
            }
            if (typeof value === "object" && value !== null) {
                deepInject(value);
            }
        }
    }
    
    deepInject(obj);
    obj.vip_status = true;
    obj.is_vip = true;
    obj.vip_level = 3;
    obj.vip_time = "2099-12-31T23:59:59.000Z";
    
    // ========== 欧路词典 (api.esdict.cn) 特化修改 ==========
    if (url.indexOf("api.esdict.cn") !== -1) {
        if (obj.data) {
            obj.data.balance = 99999;
            obj.data.transvip = true;
            obj.data.transvip_endtime = "2099-12-31T23:59:59.000Z";
            if (obj.data.tingvip) {
                obj.data.tingvip.istingvip = true;
                obj.data.tingvip.tingvipendtime = "2099-12-31T23:59:59.000Z";
                obj.data.tingvip.tingviptype = "vip";
            }
        }
    }
    // ===================================================
    
    $done({ body: JSON.stringify(obj) });
} catch (e) {
    $done({});
}
