var body = $response.body;

try {
    var obj = JSON.parse(body);
    var vipKeys = ['vip_status', 'is_vip', 'isVip', 'vip', 'member', 'level', 'role', 'vip_level'];
    var timeKeys = ['vip_time', 'vip_expire', 'expire_time', 'expireAt', 'vip_expire_at'];
    var balanceKeys = ['balance'];
    var transKeys = ['transvip', 'istingvip'];
    
    function deepInject(target) {
        if (!target || typeof target !== "object") return;
        for (var key in target) {
            var value = target[key];
            
            // 原有 VIP 状态修改
            if (vipKeys.indexOf(key) !== -1) {
                if (typeof value === "boolean") target[key] = true;
                else if (typeof value === "number") target[key] = 3;
                else if (typeof value === "string" && value === "0") target[key] = "1";
            }
            
            // 原有时间字段修改
            if (timeKeys.indexOf(key) !== -1) {
                target[key] = "2099-12-31T23:59:59.000Z";
            }
            
            // 余额修改
            if (balanceKeys.indexOf(key) !== -1 && typeof value === "number") {
                target[key] = 99999;
            }
            
            // 欧路词典：VIP 布尔值修改
            if (transKeys.indexOf(key) !== -1 && typeof value === "boolean") {
                target[key] = true;
            }
            
            // 欧路词典：VIP 类型字符串修改
            if (key === 'tingviptype' && typeof value === "string") {
                target[key] = "vip";
            }
            
            // ===== 新增：翻译配置中的 VIP 限制移除 =====
            if (key === 'support_trans_vip' && typeof value === "boolean") {
                target[key] = false;  // false 表示不需要 VIP 即可使用
            }
            // =========================================
            
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
    
    $done({ body: JSON.stringify(obj) });
} catch (e) {
    $done({});
}
