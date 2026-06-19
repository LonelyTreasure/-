// ESA / Backup 英语 - VIP 解锁脚本(全 /app/ 目录匹配)
// 适用于 Surge / Quantumult X / Loon

// ========== 配置区 ==========
const TARGET_HOSTS = [
    "esa.enbanglish.top",
    "backup.enbanglish.top"
];

// 伪造的 VIP 数据
const VIP_PATCH = {
    vip_status: true,
    vip_level: 3,
    vip_expire: "2099-12-31T23:59:59.000Z",
    is_vip: true,
    is_pro: true,
    vip: true,
    member_level: 3
};

// ========== 核心注入函数 ==========
function injectVIP(obj) {
    if (!obj || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => injectVIP(item));
    }

    const result = JSON.parse(JSON.stringify(obj));

    const injectFields = (target) => {
        if (target && typeof target === "object") {
            Object.assign(target, VIP_PATCH);
        }
    };

    // 遍历所有可能的用户数据字段
    const userFields = ["user", "userInfo", "data", "userData", "profile", "member", "info", "result"];
    for (const field of userFields) {
        if (result[field]) {
            injectFields(result[field]);
            if (field === "data" || field === "result") {
                for (const subField of ["user", "userInfo", "profile", "member"]) {
                    if (result[field][subField]) {
                        injectFields(result[field][subField]);
                    }
                }
            }
        }
    }

    // 顶层直接注入
    injectFields(result);

    return result;
}

// ========== 判断是否需要处理 ==========
function shouldProcess(url) {
    // 检查域名是否匹配
    let hostMatched = false;
    for (const host of TARGET_HOSTS) {
        if (url.indexOf(host) !== -1) {
            hostMatched = true;
            break;
        }
    }
    if (!hostMatched) return false;

    // 匹配 /app/ 目录下的任何路径
    return url.indexOf("/app/") !== -1;
}

// ========== 主流程 ==========
var url = $request.url;
var body = $response.body;

if (shouldProcess(url)) {
    try {
        var obj = JSON.parse(body);
        var modified = injectVIP(obj);
        var newBody = JSON.stringify(modified);
        console.log("[VIP Unlock] ✅ 注入成功 - " + url);
        console.log("[VIP Unlock] 原始长度: " + body.length + " → 新长度: " + newBody.length);
        $done({ body: newBody });
    } catch (e) {
        console.log("[VIP Unlock] ❌ 解析失败: " + e.message);
        $done({});
    }
} else {
    $done({});
}
