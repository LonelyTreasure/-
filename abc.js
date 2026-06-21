// ========== 通用 VIP 注入脚本 ==========
var body = $response.body;
var url = $request.url;

// 只在目标域名下执行
if (url.indexOf("api.new.listensoul.top") !== -1) {
    try {
        var obj = JSON.parse(body);
        
        // 递归修改函数:遍历所有层级,修改常见的 VIP 字段
        function deepInject(target) {
            if (!target || typeof target !== "object") return;
            
            // 需要修改的字段名列表
            var vipKeys = ['vip_status', 'is_vip', 'isVip', 'vip', 'member', 'level', 'role', 'vip_level'];
            var timeKeys = ['vip_time', 'vip_expire', 'expire_time', 'expireAt', 'vip_expire_at'];
            
            for (var key in target) {
                var value = target[key];
                
                // 如果字段名匹配 VIP 状态,且值是布尔或数字,改为 true/3
                if (vipKeys.indexOf(key) !== -1) {
                    if (typeof value === "boolean") {
                        target[key] = true;
                    } else if (typeof value === "number") {
                        target[key] = 3; // 3 通常代表高级会员
                    } else if (typeof value === "string" && value === "0") {
                        target[key] = "1";
                    }
                }
                
                // 如果字段名匹配时间,改为未来时间
                if (timeKeys.indexOf(key) !== -1) {
                    target[key] = "2099-12-31T23:59:59.000Z";
                }
                
                // 如果值是对象或数组,递归深入
                if (typeof value === "object" && value !== null) {
                    deepInject(value);
                }
            }
        }
        
        // 执行深度注入
        deepInject(obj);
        
        // 在顶层也强行加上一组 VIP 字段,确保万无一失
        obj.vip_status = true;
        obj.is_vip = true;
        obj.vip_level = 3;
        obj.vip_time = "2099-12-31T23:59:59.000Z";
        
        var modifiedBody = JSON.stringify(obj);
        $done({ body: modifiedBody });
        console.log("[VIP Unlock] ✅ 注入成功: " + url);
        
    } catch (e) {
        console.log("[VIP Unlock] ❌ 解析失败: " + e.message);
        $done({});
    }
} else {
    $done({});
}
