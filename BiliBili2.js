/*
哔哩哔哩每日任务 - Shadowrocket专用精简版 (修复版)
仅保留核心功能:登录/观看/分享/投币/银瓜子兑换
只适配Shadowrocket环境
*/

// ==================== Env类(Shadowrocket专用) ====================
class Env {
    constructor(e) {
        this.name = e
        this.startTime = Date.now()
    }
    toObj(e) { try { return JSON.parse(e) } catch { return null } }
    toStr(e) { try { return JSON.stringify(e) } catch { return null } }
    getItem(e, t = null) {
        let s = $persistentStore.read(e)
        try { s = JSON.parse(s) } catch (e) {}
        return s ?? t
    }
    setItem(e, t) {
        if (typeof t === "object") t = JSON.stringify(t)
        return $persistentStore.write(t, e)
    }
    async fetch(e) {
        return new Promise((resolve, reject) => {
            const method = (e.method || "GET").toLowerCase()
            const callback = (err, resp, body) => {
                if (err) { reject(err); return }
                resp.body = body
                resolve(resp)
            }
            // 修复:动态调用,和原版一致
            $httpClient[method](e, callback)
        })
    }
    time(e, t) {
        let s = t ? new Date(t) : new Date()
        let o = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds() }
        if (/(y+)/.test(e)) e = e.replace(RegExp.$1, (s.getFullYear() + "").slice(4 - RegExp.$1.length))
        for (let t in o) {
            if (new RegExp("(" + t + ")").test(e)) {
                e = e.replace(RegExp.$1, RegExp.$1.length === 1 ? o[t] : ("00" + o[t]).slice(("" + o[t]).length))
            }
        }
        return e
    }
    getTimestamp() { return Math.floor(Date.now() / 1000) }
    queryStr(e) { let t = []; for (let s in e) { if (e.hasOwnProperty(s)) t.push(s + "=" + e[s]) } return t.join("&") }
    msg(e, t, s) { $notification.post(e, t, s) }
    log(...e) { console.log(e.join(" ")) }
    logErr(e, t) { console.log("❌ 错误:", e, t) }
    wait(e) { return new Promise(t => setTimeout(t, e)) }
    done() {}
}

// 修复:$ 只在开头定义一次
const $ = new Env("bilibili")

// ==================== 工具函数 ====================
const format = (ts, fmt = 'yyyy-MM-dd HH:mm:ss') => $.time(fmt, ts)
const startTime = format()

const check = key =>
    !config.hasOwnProperty(key) ||
    !config[key].hasOwnProperty("time") ||
    !(config[key]["num"] > 0) ||
    format(new Date().toDateString()) > config[key].time

const isNotComplete = exec_times =>
    config.user.num === 0 ||
    config.watch.num === 0 ||
    config.share.num === 0 ||
    (config.coins.num < exec_times * 10 && Math.floor(config.user.money) > 5)

const generateSign = body => md5(
    $.queryStr(Object.fromEntries(new Map(Array.from(Object.entries(body)).sort()))) +
    'c2ed53a74eeefe3cf99fbd01d8c9c375'
)

// ==================== 硬编码Cookie ====================
let config = $.getItem("bilibili_daily_bonus", {});
[['cookie'], ['user'], ['watch'], ['share'], ['coins']].forEach(key => !config[key] && (config[key] = {}))

config.cookie = {
    "SESSDATA": "c346a059%2C1797054091%2Ca260cf61",
    "bili_jct": "dc6292ce14330c2a5e481b1022e47315",
    "DedeUserID": "3493110606727596",
    "DedeUserID__ckMd5": "65df2d25aa0cacf4",
    "sid": "7pfjumlu",
    "buvid3": "742B43B7-8335-48FC-8D14-F21115C4F87C82616infoc"
}
config.cookieStr = `DedeUserID=${config.cookie.DedeUserID}; DedeUserID__ckMd5=${config.cookie.DedeUserID__ckMd5}; SESSDATA=${config.cookie.SESSDATA}; bili_jct=${config.cookie.bili_jct}; sid=${config.cookie.sid}`
config.key = "e2452b2eb61b82a3f78cee972d509a61"
$.setItem("bilibili_daily_bonus", $.toStr(config))
$.log("✅ 已注入硬编码Cookie")

const baseHeaders = {
    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/621.1.15.10.7 (KHTML, like Gecko) Mobile/22E252 BiliApp/84400100 os/ios model/iPhone 16 Pro Max mobi_app/iphone build/84400100 osVer/18.3 network/2 channel/AppStore c_locale/zh-Hans_CN s_locale/zh-Hans_CN disable_rcmd/0',
    'cookie': config.cookieStr
}

let cards = []

// ==================== 主流程 ====================
!(async () => {
    await signBiliBili()
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

// ==================== 核心任务函数 ====================
async function signBiliBili() {
    if (config.cookie && await me()) {
        await queryStatus()
        const exec_times = Number(config.Settings?.exec ?? 5)
        const real_times = Math.max(0, exec_times - (Number(config.coins.num) / 10))
        let flag = isNotComplete(exec_times)

        if (flag) {
            await dynamic()
            if (cards.length) {
                let item = cards[Math.floor(Math.random() * cards.length)]
                let card = $.toObj(item.card)
                short_link = encodeURIComponent(card?.short_link_v2.replace(/\\\//g, '/'))
                await watch(item.desc.rid, item.desc.bvid, card.cid)
                await share(item.desc.rid, card.cid, short_link)
            } else {
                $.log("❌ 获取视频失败")
            }

            $.log("3️⃣ 投币任务")
            config.coins?.failures > 0 && (config.coins.failures = 0)
            if (real_times === 0) {
                $.log(`- 今日已完成 记录于${config.coins.time}`)
            } else {
                for (let i = 0; i < real_times && (Math.floor(config.user.money) > 5 || ($.log("- 硬币不足"), false)); i++) await coin()
            }
            $.log("✅ 经验值任务已完成")
        } else {
            $.log("✅ 经验值任务已完成")
        }

        await silver2coin()

        flag = !isNotComplete(exec_times)
        let title = `登录${config.user.num}/观看${config.watch.num}/分享${config.share.num}/投币${config.coins.num/10} ${flag?"✅完成":"❌未完成"}`

        $.msg(
            `B站 [${config.user.uname}]`,
            flag ? "✅ 任务完成" : "❗有未完成的任务",
            `登录+观看${check("watch")?"❌":"+10exp"} 分享${check("share")?"❌":"+5exp"} 投币${check("coins")?"0":`+${real_times*10}exp`}\n` +
            `经验:${config.user.level_info.current_exp}/${config.user.level_info.next_exp}\n` +
            `等级:${config.user.level_info.current_level}级 升满级最快${Math.max(0,Math.ceil((28800-config.user.level_info.current_exp)/65))}天`
        )
    } else {
        $.msg("B站任务失败", "请检查Cookie是否正确", "")
    }
}

async function watch(aid, bvid, cid) {
    $.log("1️⃣ 观看任务")
    if (check("watch")) {
        $.log(`- 正在观看(${bvid})`)
        const body = {
            aid, cid, bvid,
            mid: config.user.mid,
            csrf: config.cookie.bili_jct,
            played_time: 1, real_played_time: 1, realtime: 1,
            start_ts: $.getTimestamp(), type: 3, dt: 2, play_type: 0,
            from_spmid: 0, spmid: 0, auto_continued_play: 0,
            refer_url: "https%3A%2F%2Ft.bilibili.com%2F", bsource: ""
        }
        const myRequest = {
            url: 'https://api.bilibili.com/x/click-interface/web/heartbeat',
            headers: { ...baseHeaders, "referrer": `https://www.bilibili.com/video/${bvid}` },
            body: $.queryStr(body),
            method: "POST"
        }
        await $.fetch(myRequest).then(response => {
            const body = $.toObj(response.body)
            if (body?.code === 0) {
                config.user.num = (config.user.num || 0) + 1
                config.watch.num = (config.watch.num || 0) + 1
                $.setItem("bilibili_daily_bonus", $.toStr(config))
                $.log("✅ 观看成功")
            } else {
                $.log("- 观看失败: " + body?.message)
            }
        })
    } else {
        $.log(`- 今日已观看 记录于${config.watch.time}`)
    }
}

async function share(aid, cid, short_link) {
    $.log("2️⃣ 分享任务")
    if (check("share")) {
        $.log("- 正在分享")
        const body = {
            access_key: config.key, actionKey: 'appkey', appkey: '27eb53fc9058f8c3',
            build: '72700100', c_locale: 'zh-Hans_CN', device: 'phone', disable_rcmd: 0,
            link: short_link, mobi_app: 'iphone', object_extra_fields: '%7B%7D',
            oid: aid, panel_type: 1, platform: 'ios', s_locale: 'zh-Hans_CN',
            share_channel: 'WEIXIN', share_id: 'main.ugc-video-detail.0.0.pv',
            share_origin: 'vinfo_share', sid: cid, spm_id: 'main.ugc-video-detail.0.0',
            statistics: '%7B%22appId%22%3A1%2C%22version%22%3A%228.44.0%22%2C%22abtest%22%3A%22%22%2C%22platform%22%3A1%7D',
            success: 1, ts: $.getTimestamp()
        }
        body.sign = generateSign(body)
        const myRequest = {
            url: 'https://api.bilibili.com/x/share/finish',
            headers: {},
            body: $.queryStr(Object.fromEntries(new Map(Array.from(Object.entries(body)).sort()))),
            method: "POST"
        }
        await $.fetch(myRequest).then(response => {
            const body = $.toObj(response.body)
            if (body?.code === 0) {
                config.share.num = (config.share.num || 0) + 1
                $.setItem("bilibili_daily_bonus", $.toStr(config))
                $.log("✅ 分享成功")
            } else {
                $.log("- 分享失败: " + body?.message)
            }
        })
    } else {
        $.log(`- 今日已分享 记录于${config.share.time}`)
    }
}

async function coin() {
    if (config.coins.num >= 50) {
        $.log(`- 今日已完成 记录于${config.coins.time}`)
        return
    }
    let like_uid_list = await getFavUid()
    if (like_uid_list && like_uid_list.length > 0) {
        let aid = await getFavAid(like_uid_list)
        if (aid !== 0) {
            const body = { access_key: config.key, aid, multiply: 1, select_like: 0 }
            const myRequest = {
                url: "https://app.bilibili.com/x/v2/view/coin/add",
                headers: { ...baseHeaders, 'accept-encoding': 'gzip, deflate, br', 'content-type': 'application/x-www-form-urlencoded', 'app-key': 'iphone' },
                body: $.queryStr(body),
                method: "POST"
            }
            await $.fetch(myRequest).then(async response => {
                try {
                    const body = $.toObj(response.body)
                    if (body?.code === 0 && body?.message === "0") {
                        $.log("✅ 投币成功")
                        config.user.money -= 1
                        config.coins.num += 10
                        config.coins.time = startTime
                        $.setItem("bilibili_daily_bonus", $.toStr(config))
                    } else {
                        $.log("- 投币失败: " + body.message)
                        config.coins.failures = (config.coins.failures || 0) + 1
                        $.setItem("bilibili_daily_bonus", $.toStr(config))
                        if (config.coins.failures < 11) {
                            $.log(`- 重试 ${config.coins.failures}/10`)
                            await $.wait(300)
                            await coin()
                        }
                    }
                } catch (e) { $.logErr(e, response) }
            })
        } else {
            $.log("- 获取投币视频失败")
        }
    } else {
        $.log("- 获取关注列表失败")
    }
}

async function getFavUid() {
    const myRequest = {
        url: `https://api.bilibili.com/x/relation/followings?vmid=${config.cookie.DedeUserID}&ps=10&order_type=attention`,
        headers: { ...baseHeaders }
    }
    return await $.fetch(myRequest).then(response => {
        try {
            const body = $.toObj(response.body)
            let like_uid_list = []
            if (body?.code === 0) {
                let like_list = body?.data?.list
                for (let i = 0; i < like_list.length; i++) like_uid_list[i] = like_list[i].mid
                return like_uid_list
            } else {
                $.log("- 获取关注列表失败: " + body?.message)
                return like_uid_list
            }
        } catch (e) { $.logErr(e, response) }
    })
}

async function getFavAid(arr) {
    let random_int = Math.floor((Math.random() * arr.length))
    let random_mid = arr[random_int]
    let wbiSigns = getWbiSigns({ mid: random_mid })
    const myRequest = {
        url: `https://api.bilibili.com/x/space/wbi/arc/search?${wbiSigns}`,
        headers: { ...baseHeaders, 'referer': 'https://space.bilibili.com' }
    }
    return await $.fetch(myRequest).then(response => {
        try {
            const body = $.toObj(response.body)
            if (body?.code === 0 && body.data?.list?.vlist.some(Boolean)) {
                let vlist = body.data?.list?.vlist
                let random_v_int = Math.floor((Math.random() * vlist.length))
                let aid = vlist[random_v_int]?.aid
                $.log("- 作者: " + vlist[random_v_int]['author'] + "; 标题: " + vlist[random_v_int]['title'])
                return aid
            } else {
                $.log("- 获取投币视频失败: " + body?.message)
                return 0
            }
        } catch (e) { $.logErr(e, response) }
    })
}

async function silver2coin() {
    $.log("💰 银瓜子兑换硬币")
    const body = { csrf: config.cookie.bili_jct, csrf_token: config.cookie.bili_jct }
    const myRequest = {
        url: "https://api.live.bilibili.com/xlive/revenue/v1/wallet/silver2coin",
        headers: { 'cookie': config.cookieStr },
        body: $.queryStr(body),
        method: "POST"
    }
    await $.fetch(myRequest).then(response => {
        try {
            const body = $.toObj(response.body)
            if (body && body.code === 0) {
                $.log(`✅ 成功兑换: ${body.data.coin}个硬币`)
            } else if (body && body.code === 403) {
                $.log("- 未成功兑换: " + body.message)
            } else {
                $.log("- 兑换失败: " + body?.message)
            }
        } catch (e) { $.logErr(e, response) }
    })
}

// ==================== 辅助函数 ====================
async function me() {
    $.log("📋 获取用户信息")
    const myRequest = {
        url: 'https://api.bilibili.com/x/web-interface/nav',
        headers: { ...baseHeaders }
    }
    return await $.fetch(myRequest).then(response => {
        try {
            const body = $.toObj(response.body)
            if (body?.code) {
                $.log("❌ 获取用户信息失败,请检查Cookie")
                return false
            } else {
                config.user = body?.data
                config.user.num = check("user") ? 1 : (config.user.num || 0) + 1
                $.setItem("bilibili_daily_bonus", $.toStr(config))
                $.log(`👤 ${config.user.uname} (Lv${config.user.level_info.current_level}) 硬币:${Math.floor(config.user.money)}`)
                return true
            }
        } catch (e) { $.logErr(e, response) }
    })
}

async function queryStatus() {
    $.log("📊 检查任务进度")
    const myRequest = {
        url: "https://api.bilibili.com/x/member/web/exp/reward",
        headers: { ...baseHeaders }
    }
    await $.fetch(myRequest).then(response => {
        try {
            const body = $.toObj(response.body)
            if (body?.code === 0) {
                config.user.num = body.data.login ? (config.user?.num || 1) : 0
                config.watch.num = body.data.watch ? (config.watch?.num || 1) : 0
                config.share.num = body.data.share ? (config.share?.num || 1) : 0
                config.coins.num = body.data.coins
                if (body.data.login && !config.user.time) config.user.time = startTime
                if (body.data.watch && !config.watch.time) config.watch.time = startTime
                if (body.data.share && !config.share.time) config.share.time = startTime
                if (body.data.coins === 50 && !config.coins.time) config.coins.time = startTime
                $.setItem("bilibili_daily_bonus", $.toStr(config))
                $.log(`登录:${config.user.num} 观看:${config.watch.num} 分享:${config.share.num} 投币:${config.coins.num/10}`)
            }
        } catch (e) { $.logErr(e, response) }
    })
}

async function dynamic() {
    const myRequest = {
        url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${config.cookie.DedeUserID}&type_list=8&from=&platform=web`,
        headers: { ...baseHeaders }
    }
    await $.fetch(myRequest).then(response => {
        try {
            const body = $.toObj(response.body)
            if (body?.data?.cards) {
                cards = body.data.cards
                config.user.time = config.watch.time = config.share.time = startTime
            }
        } catch (e) { $.logErr(e, response) }
    })
}

// ==================== WBI签名 & MD5 ====================
function getWbiSigns(r) {
    function t(r) { let t = ""; return e.forEach(s => { t += r[s] }), t.slice(0, 32) }

    function s(r, s, u) {
        const e = t(s + u), i = parseInt($.startTime / 1e3);
        let n = "";
        r = Object.assign(r, { wts: i }), n = $.queryStr(Object.fromEntries(new Map(Array.from(Object.entries(r)).sort())));
        const l = md5(n + e);
        return n + "&w_rid=" + l
    }

    function u() {
        return img_url = config.user.wbi_img.img_url, sub_url = config.user.wbi_img.sub_url, {
            img_key: img_url.substring(img_url.lastIndexOf("/") + 1, img_url.length).split(".")[0],
            sub_key: sub_url.substring(sub_url.lastIndexOf("/") + 1, sub_url.length).split(".")[0]
        }
    }
    const e = [46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52],
        i = u();
    return s(r, i.img_key, i.sub_key)
}

function md5(r) {
    function n(r, n) { return r << n | r >>> 32 - n }

    function t(r, n) { var t, o, e, u, f; return e = 2147483648 & r, u = 2147483648 & n, t = 1073741824 & r, o = 1073741824 & n, f = (1073741823 & r) + (1073741823 & n), t & o ? 2147483648 ^ f ^ e ^ u : t | o ? 1073741824 & f ? 3221225472 ^ f ^ e ^ u : 1073741824 ^ f ^ e ^ u : f ^ e ^ u }

    function o(r, n, t) { return r & n | ~r & t }

    function e(r, n, t) { return r & t | n & ~t }

    function u(r, n, t) { return r ^ n ^ t }

    function f(r, n, t) { return n ^ (r | ~t) }

    function i(r, e, u, f, i, a, c) { return r = t(r, t(t(o(e, u, f), i), c)), t(n(r, a), e) }

    function a(r, o, u, f, i, a, c) { return r = t(r, t(t(e(o, u, f), i), c)), t(n(r, a), o) }

    function c(r, o, e, f, i, a, c) { return r = t(r, t(t(u(o, e, f), i), c)), t(n(r, a), o) }

    function C(r, o, e, u, i, a, c) { return r = t(r, t(t(f(o, e, u), i), c)), t(n(r, a), o) }

    function g(r) { for (var n, t = r.length, o = t + 8, e = (o - o % 64) / 64, u = 16 * (e + 1), f = Array(u - 1), i = 0, a = 0; a < t;) n = (a - a % 4) / 4, i = a % 4 * 8, f[n] = f[n] | r.charCodeAt(a) << i, a++; return n = (a - a % 4) / 4, i = a % 4 * 8, f[n] = f[n] | 128 << i, f[u - 2] = t << 3, f[u - 1] = t >>> 29, f }

    function h(r) { var n, t, o = "", e = ""; for (t = 0; t <= 3; t++) n = r >>> 8 * t & 255, e = "0" + n.toString(16), o += e.slice(-2); return o }

    function d(r) { r = r.replace(/\r\n/g, "\n"); for (var n = "", t = 0; t < r.length; t++) { var o = r.charCodeAt(t); o < 128 ? n += String.fromCharCode(o) : o > 127 && o < 2048 ? (n += String.fromCharCode(o >> 6 | 192), n += String.fromCharCode(63 & o | 128)) : (n += String.fromCharCode(o >> 12 | 224), n += String.fromCharCode(o >> 6 & 63 | 128), n += String.fromCharCode(63 & o | 128)) } return n }
    var m, S, v, l, A, s, y, p, w, L = Array(),
        b = 7,
        j = 12,
        k = 17,
        q = 22,
        x = 5,
        z = 9,
        B = 14,
        D = 20,
        E = 4,
        F = 11,
        G = 16,
        H = 23,
        I = 6,
        J = 10,
        K = 15,
        M = 21;
    for (r = d(r), L = g(r), s = 1732584193, y = 4023233417, p = 2562383102, w = 271733878, m = 0; m < L.length; m += 16) S = s, v = y, l = p, A = w, s = i(s, y, p, w, L[m + 0], b, 3614090360), w = i(w, s, y, p, L[m + 1], j, 3905402710), p = i(p, w, s, y, L[m + 2], k, 606105819), y = i(y, p, w, s, L[m + 3], q, 3250441966), s = i(s, y, p, w, L[m + 4], b, 4118548399), w = i(w, s, y, p, L[m + 5], j, 1200080426), p = i(p, w, s, y, L[m + 6], k, 2821735955), y = i(y, p, w, s, L[m + 7], q, 4249261313), s = i(s, y, p, w, L[m + 8], b, 1770035416), w = i(w, s, y, p, L[m + 9], j, 2336552879), p = i(p, w, s, y, L[m + 10], k, 4294925233), y = i(y, p, w, s, L[m + 11], q, 2304563134), s = i(s, y, p, w, L[m + 12], b, 1804603682), w = i(w, s, y, p, L[m + 13], j, 4254626195), p = i(p, w, s, y, L[m + 14], k, 2792965006), y = i(y, p, w, s, L[m + 15], q, 1236535329), s = a(s, y, p, w, L[m + 1], x, 4129170786), w = a(w, s, y, p, L[m + 6], z, 3225465664), p = a(p, w, s, y, L[m + 11], B, 643717713), y = a(y, p, w, s, L[m + 0], D, 3921069994), s = a(s, y, p, w, L[m + 5], x, 3593408605), w = a(w, s, y, p, L[m + 10], z, 38016083), p = a(p, w, s, y, L[m + 15], B, 3634488961), y = a(y, p, w, s, L[m + 4], D, 3889429448), s = a(s, y, p, w, L[m + 9], x, 568446438), w = a(w, s, y, p, L[m + 14], z, 3275163606), p = a(p, w, s, y, L[m + 3], B, 4107603335), y = a(y, p, w, s, L[m + 8], D, 1163531501), s = a(s, y, p, w, L[m + 13], x, 2850285829), w = a(w, s, y, p, L[m + 2], z, 4243563512), p = a(p, w, s, y, L[m + 7], B, 1735328473), y = a(y, p, w, s, L[m + 12], D, 2368359562), s = c(s, y, p, w, L[m + 5], E, 4294588738), w = c(w, s, y, p, L[m + 8], F, 2272392833), p = c(p, w, s, y, L[m + 11], G, 1839030562), y = c(y, p, w, s, L[m + 14], H, 4259657740), s = c(s, y, p, w, L[m + 1], E, 2763975236), w = c(w, s, y, p, L[m + 4], F, 1272893353), p = c(p, w, s, y, L[m + 7], G, 4139469664), y = c(y, p, w, s, L[m + 10], H, 3200236656), s = c(s, y, p, w, L[m + 13], E, 681279174), w = c(w, s, y, p, L[m + 0], F, 3936430074), p = c(p, w, s, y, L[m + 3], G, 3572445317), y = c(y, p, w, s, L[m + 6], H, 76029189), s = c(s, y, p, w, L[m + 9], E, 3654602809), w = c(w, s, y, p, L[m + 12], F, 3873151461), p = c(p, w, s, y, L[m + 15], G, 530742520), y = c(y, p, w, s, L[m + 2], H, 3299628645), s = C(s, y, p, w, L[m + 0], I, 4096336452), w = C(w, s, y, p, L[m + 7], J, 1126891415), p = C(p, w, s, y, L[m + 14], K, 2878612391), y = C(y, p, w, s, L[m + 5], M, 4237533241), s = C(s, y, p, w, L[m + 12], I, 1700485571), w = C(w, s, y, p, L[m + 3], J, 2399980690), p = C(p, w, s, y, L[m + 10], K, 4293915773), y = C(y, p, w, s, L[m + 1], M, 2240044497), s = C(s, y, p, w, L[m + 8], I, 1873313359), w = C(w, s, y, p, L[m + 15], J, 4264355552), p = C(p, w, s, y, L[m + 6], K, 2734768916), y = C(y, p, w, s, L[m + 13], M, 1309151649), s = C(s, y, p, w, L[m + 4], I, 4149444226), w = C(w, s, y, p, L[m + 11], J, 3174756917), p = C(p, w, s, y, L[m + 2], K, 718787259), y = C(y, p, w, s, L[m + 9], M, 3951481745), s = t(s, S), y = t(y, v), p = t(p, l), w = t(w, A);
    return (h(s) + h(y) + h(p) + h(w)).toLowerCase()
}
