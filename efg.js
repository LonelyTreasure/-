var body = $response.body;
var url = $request.url;

console.log("[VIP] 触发: " + url);

try {
    var obj = JSON.parse(body);
    var changed = [];

    var vipKeys = ['vip_status','is_vip','isVip','vip','member','level','role','vip_level','member_level','user_level','premium','isPremium','is_pro','isPro'];
    var timeKeys = ['vip_time','vip_expire','expire_time','expireAt','vip_expire_at','member_expire','expireDate'];

    function deepInject(target, path) {
        if (!target || typeof target !== "object") return;
        for (var key in target) {
            var value = target[key];
            var fullPath = path ? path + "." + key : key;

            if (vipKeys.indexOf(key) !== -1) {
                if (typeof value === "boolean") {
                    target[key] = true;
                    changed.push(fullPath + ":" + value + "→true");
                } else if (typeof value === "number") {
                    target[key] = 3;
                    changed.push(fullPath + ":" + value + "→3");
                } else if (typeof value === "string") {
                    target[key] = "1";
                    changed.push(fullPath + ":" + value + "→1");
                }
            }

            if (timeKeys.indexOf(key) !== -1) {
                target[key] = "2099-12-31T23:59:59.000Z";
                changed.push(fullPath + ":" + value + "→2099");
            }

            if (typeof value === "object" && value !== null) {
                deepInject(value, fullPath);
            }
        }
    }

    deepInject(obj, "");

    if (obj.user) {
        obj.user.vip_status = true;
        obj.user.vip_time = "2099-12-31T23:59:59.000Z";
    }
    if (obj.vip_info) {
        obj.vip_info.vip_status = true;
        obj.vip_info.vip_time = "2099-12-31T23:59:59.000Z";
    }
    if (obj.data) {
        obj.data.vip_status = true;
        obj.data.vip_time = "2099-12-31T23:59:59.000Z";
    }
    obj.vip_status = true;
    obj.is_vip = true;
    obj.vip_level = 3;
    obj.vip_time = "2099-12-31T23:59:59.000Z";

    console.log("[VIP] 修改字段: " + (changed.length ? changed.join(", ") : "无（响应里没有匹配的VIP字段）"));
    console.log("[VIP] 修改后前300字: " + JSON.stringify(obj).substring(0, 300));

    $done({ body: JSON.stringify(obj) });
} catch (e) {
    console.log("[VIP] 解析失败: " + e.message);
    console.log("[VIP] 原始body前100字: " + (body ? body.substring(0, 100) : "空"));
    $done({});
}
