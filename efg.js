var body = $response.body;

try {
    var obj = JSON.parse(body);
    
    var vipKeys = [
        'vip_status', 'is_vip', 'isVip', 'vip', 'member', 
        'level', 'vip_level', 'user_level', 'grade', 'vip_grade',
        'rank', 'vip_rank', 'class', 'vip_class', 'type', 'vip_type',
        'role', 'user_role', 'membership', 'isPro', 'is_premium',
        'svip', 'isSvip', 'super_vip', 'isSuperVip'
    ];
    var timeKeys = [
        'vip_time', 'vip_expire', 'expire_time', 'expireAt', 
        'vip_expire_at', 'membership_end', 'end_time', 'deadline'
    ];
    
    function deepInject(target) {
        if (!target || typeof target !== "object") return;
        
        if (Array.isArray(target)) {
            for (var i = 0; i < target.length; i++) {
                deepInject(target[i]);
            }
            return;
        }
        
        for (var key in target) {
            var value = target[key];
            
            var isVipKey = false;
            for (var i = 0; i < vipKeys.length; i++) {
                if (key.toLowerCase().indexOf(vipKeys[i].toLowerCase()) !== -1) {
                    isVipKey = true;
                    break;
                }
            }
            
            if (isVipKey) {
                if (typeof value === "boolean") target[key] = true;
                else if (typeof value === "number") target[key] = 999;
                else if (typeof value === "string") {
                    if (value === "0" || value === "false" || value === "no") {
                        target[key] = "1";
                    } else {
                        target[key] = "ultimate";
                    }
                }
            }
            
            var isTimeKey = false;
            for (var i = 0; i < timeKeys.length; i++) {
                if (key.toLowerCase().indexOf(timeKeys[i].toLowerCase()) !== -1) {
                    isTimeKey = true;
                    break;
                }
            }
            
            if (isTimeKey) {
                target[key] = "2099-12-31T23:59:59.000Z";
            }
            
            if (typeof value === "object" && value !== null) {
                deepInject(value);
            }
        }
    }
    
    deepInject(obj);
    obj.vip_status = true;
    if (obj.vip_time !== undefined) {
        obj.vip_time = "2099-12-31T23:59:59.000Z";
    }
    obj.is_vip = true;
    
    $done({ body: JSON.stringify(obj) });
} catch (e) {
    $done({});
}
