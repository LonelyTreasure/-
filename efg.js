var body = $response.body;

try {
    var obj = JSON.parse(body);
    var allKeys = ['vip_status','is_vip','isVip','vip','member','level','vip_level','user_level','grade','vip_grade','rank','vip_rank','class','vip_class','type','vip_type','role','user_role','membership','isPro','is_premium','svip','isSvip','super_vip','isSuperVip','supreme','isSupreme','is_supreme','diamond','platinum','ultimate'];
    var timeKeys = ['vip_time','vip_expire','expire_time','expireAt','vip_expire_at','membership_end','end_time','deadline'];
    
    function deepInject(target) {
        if (!target || typeof target !== "object") return;
        if (Array.isArray(target)) {
            for (var i = 0; i < target.length; i++) deepInject(target[i]);
            return;
        }
        for (var key in target) {
            var value = target[key];
            for (var i = 0; i < allKeys.length; i++) {
                if (key.toLowerCase() === allKeys[i].toLowerCase() || key.toLowerCase().indexOf(allKeys[i].toLowerCase()) !== -1) {
                    if (typeof value === "boolean") target[key] = true;
                    else if (typeof value === "number") target[key] = 999;
                    else if (typeof value === "string") target[key] = "ultimate";
                }
            }
            for (var i = 0; i < timeKeys.length; i++) {
                if (key.toLowerCase().indexOf(timeKeys[i].toLowerCase()) !== -1) {
                    target[key] = "2099-12-31T23:59:59.000Z";
                }
            }
            if (typeof value === "object" && value !== null) deepInject(value);
        }
    }
    
    deepInject(obj);
    $done({ body: JSON.stringify(obj) });
} catch (e) {
    $done({});
}
