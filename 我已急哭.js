// 动听 VIP 解锁脚本
var body = $response.body;
var url = $request.url;

// 只处理你的目标接口 (把下面的路径换成动听实际的接口路径)
if (url.indexOf("/api/users/check-auth") !== -1) {  // ← 这里要换成动听的接口路径
    try {
        var obj = JSON.parse(body);
        
        // 定义要注入的 VIP 数据 (和 ListenSoul 完全一样)
        var VIP_PATCH = {
            vip_status: true,
            vip_time: "2099-12-31T23:59:59.000Z",
            vip_level: 3,
            is_vip: true
        };
        
        // 修改 user 对象 (ListenSoul 的结构)
        if (obj.user) {
            Object.assign(obj.user, VIP_PATCH);
        }
        
        // 修改 vip_info 对象 (ListenSoul 的结构)
        if (obj.vip_info) {
            Object.assign(obj.vip_info, VIP_PATCH);
        }
        
        // 如果动听的返回数据结构不同, 在这里调整注入位置
        // 比如如果数据在 obj.data 里, 就改成:
        // if (obj.data) Object.assign(obj.data, VIP_PATCH);
        
        // 顶层也注入, 确保覆盖
        Object.assign(obj, VIP_PATCH);
        
        var modifiedBody = JSON.stringify(obj);
        $done({ body: modifiedBody });
        console.log("[动听VIP] ✅ 注入成功: " + url);
        
    } catch (e) {
        console.log("[动听VIP] ❌ 解析失败: " + e.message);
        $done({});
    }
} else {
    $done({});
}
