var body = $response.body;
var url = $request.url;

// 备用假数据：如果网络异常（如 530、DNS失败），用这个兜底
var backupData = {
    "isLoggedIn": true,
    "session": {
        "token": "eyJ2IjoxLCJ1c2VySWQiOiIxMzI3MSIsImRldmljZUlkIjoiREFCRUJBRDYtMzkwNi00QUJCLUI2MzAtQURBQ0Y2QUFBQkY0IiwiaXNzdWVkQXQiOjE3OTMzODAxMDEyMTIsImV4cGlyZXNBdCI6MTgwMTE1NjEwMTIxMiwibm9uY2UiOiI5OTY4YzIwNmVhMjlkOTM3NTNkZjEyNmIwNTA3ODM5NSJ9.KABnRyk0hKEg37LH2bE0UV8k2N4PSs7ilvOKDFJGyAg",
        "userId": "13271",
        "deviceId": "DABEBAD6-3906-4ABB-B630-ADACF6AAABF4",
        "expiresAt": 1801156101212
    },
    "user": {
        "id": 13271,
        "username": "LonelyTreasure",
        "email": "2012379431@qq.com",
        "email_verified_at": "2026-06-17T06:45:15.000Z",
        "nickname": null,
        "avatar_base64": null,
        "signature": null,
        "activated_card_code": null,
        "created_at": "2026-06-17T03:03:34.000Z",
        "vip_status": true,
        "vip_time": "2099-12-31T23:59:59.000Z",
        "max_devices": 1,
        "device_ids": "DABEBAD6-3906-4ABB-B630-ADACF6AAABF4",
        "isPC": false
    },
    "vip_info": {
        "vip_status": true,
        "vip_time": "2099-12-31T23:59:59.000Z",
        "device_count": 1,
        "max_devices": 1
    },
    "message": "用户已登录"
};

try {
    // 尝试解析真实的响应数据
    var obj = JSON.parse(body);
    
    // 如果真实数据里包含 user 或 vip_info，说明请求是通的
    if (obj.user || obj.vip_info) {
        if (obj.user) {
            obj.user.vip_status = true;
            obj.user.vip_time = "2099-12-31T23:59:59.000Z";
        }
        if (obj.vip_info) {
            obj.vip_info.vip_status = true;
            obj.vip_info.vip_time = "2099-12-31T23:59:59.000Z";
        }
        console.log("[动听] 真实请求正常，仅替换 VIP 字段");
        $done({ body: JSON.stringify(obj) });
    } else {
        // 如果数据结构不对，直接用备用数据
        console.log("[动听] 数据结构异常，使用备用数据");
        $done({ body: JSON.stringify(backupData) });
    }
} catch (e) {
    // 如果解析失败（比如 530 错误页、乱码等），直接用备用假数据兜底
    console.log("[动听] 解析失败(可能530或报错)，使用备用数据: " + e.message);
    $done({ body: JSON.stringify(backupData) });
}
