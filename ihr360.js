/*
QX
重写设置：
^https://www.ihr360.com/gateway/attendance/sign/attendanceSign/getCondition url script-request-header ihr360.js
^https://www.ihr360.com/gateway/attendance/sign/attendanceSign/doSign url script-request-body ihr360.js


MITM:www.ihr360.com

定时任务：
25 8 * * * ihr360.js, tag=i人事, enabled=true
*/


const $ = new API('ihr360', true)
const cookieName = "Cookie_ihr360";
const bodyName = "Cookie_body";
const img = "https://raw.githubusercontent.com/Orz-3/task/master/jrtt.png";
$.log("i人事脚本开始执行...");
try {
    if (typeof $request != "undefined") {
        $.log("开始获取Cookie/Body");
        if ($request.url.indexOf("https://www.ihr360.com/gateway/attendance/sign/attendanceSign/getCondition?isApp=true") > -1) {
            getCookie($request);
        }
        if ($request.url.indexOf("https://www.ihr360.com/gateway/attendance/sign/attendanceSign/doSign") > -1) {
            var bodyInfo = JSON.parse($request.body);
            var model = {
                wifiName=bodyInfo.wifiName,
                longitude=bodyInfo.longitude,
                locationName=bodyInfo.locationName,
                wifiMac=bodyInfo.wifiMac,
                latitude=bodyInfo.latitude,
                signSource=bodyInfo.signSource,
                phoneName=bodyInfo.phoneName,
                deviceToken=bodyInfo.deviceToken
            };
            var data = JSON.stringify(model);
            $.write(data, bodyName);
            $.log('获取打卡body：\n' + data);
            $.notify("i人事", "获取打卡Body成功", data, { "media-url": img });
        }

        $.done();
    }
    else {
        $.log("开始请求打卡");
        doSign().then(() => $.done()).catch(() => $.done());
    }
} catch (e) {
    $.log(e);
    $.notify("i人事", "代码发生异常", e, { "media-url": img });
    $.done();
}

//获取Cookie
function getCookie(request) {
    var udid = request.headers["udid"];
    var irenshilocale = request.headers["irenshilocale"];
    var userId = request.headers["userId"];
    var appVersion = request.headers["appVersion"];
    var os = request.headers["os"];
    var ver = request.headers["ver"];
    var userAgent = request.headers["User-Agent"];
    var appKey = request.headers["appKey"];
    var staffId = request.headers["staffId"];
    var companyId = request.headers["companyId"];
    var osVersion = request.headers["osVersion"];
    var cookie = request.headers["Cookie"];
    if (cookie) {
        var model = {
            udid: udid,
            irenshilocale: irenshilocale,
            userId: userId,
            appVersion: appVersion,
            os: os,
            ver: ver,
            userAgent: userAgent,
            appKey: appKey,
            staffId: staffId,
            companyId: companyId,
            cookie: cookie,
            osVersion: osVersion
        }
        var data = JSON.stringify(model);
        $.write(data, cookieName);
        $.log("获取Cookie：\n" + data);
        $.notify("i人事", "获取Cookie成功", data, { "media-url": img });
    }
    else {
        $.notify("i人事", "获取Cookie失败", "", { "media-url": img });
    }
}

//打开处理
function doSign() {
    return new Promise((resolve, reject) => {
        var cookie = $.read(cookieName);
        var body = $.read(bodyName);
        if (!cookie) {
            $.log("Cookie不存在，请先获取Cookie");
            $.notify("i人事", "打卡失败", "Cookie不存在，请先获取Cookie", { "media-url": img });
            resolve();
            return;
        }
        if (!body) {
            $.log("打卡Body不存在，请先手动打卡一次");
            $.notify("i人事", "打卡失败", "打卡Body不存在，请先手动打卡一次", { "media-url": img });
            resolve();
            return;
        }
        var model = JSON.parse(cookie);
        var url = 'https://www.ihr360.com/gateway/attendance/sign/attendanceSign/doSign';
        var method = 'POST';
        var headers = {
            'Host': 'www.ihr360.com',
            'Content-Type': 'application/json',
            'Accept': 'application/json; charset=utf-8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cookie': model.cookie,
            'Connection': 'keep-alive',
            'User-Agent': model.userAgent,
            'Accept-Language': 'zh-Hans-CN;q=1, zh-Hant-CN;q=0.9, en-CN;q=0.8',
            'udid': model.udid,
            'irenshilocale': model.irenshilocale,
            'userId': model.userId,
            'appVersion': model.appVersion,
            'os': model.os,
            'ver': model.ver,
            'staffId': model.staffId,
            'appKey': model.appKey,
            'companyId': model.companyId,
            'osVersion': model.osVersion
        };
        var options = {
            url: url,
            method: method,
            headers: headers,
            body: body,
            timeout: 60000
        };
        $.log("发送请求:\n" + JSON.stringify(options));
        $.http.post(options).then((response) => {
            $.log("返回信息:\n" + JSON.stringify(response));
            var body = JSON.parse(response.body);
            if (body.result == true || body.result == "true") {
                var msg = "打卡时间:" + formatDate(body.data);
                $.notify("i人事", "打卡成功", msg, { "media-url": img });
            }
            else {
                $.notify("i人事", "打卡失败", body.errorMessage, { "media-url": img });
            }
            resolve();
        }).catch((e) => {
            $.log(e);
            reject();
        });
    })
}

//时间戳转换为日期格式
function formatDate(ts) {
    var date = new Date(ts + 8 * 3600 * 1000);
    return date.toJSON().substr(0, 19).replace('T', ' ');
}


// prettier-ignore
/*********************************** API *************************************/
function ENV() { const e = "undefined" != typeof $task, t = "undefined" != typeof $loon, s = "undefined" != typeof $httpClient && !t, o = "function" == typeof require && "undefined" != typeof $jsbox; return { isQX: e, isLoon: t, isSurge: s, isNode: "function" == typeof require && !o, isJSBox: o, isRequest: "undefined" != typeof $request, isScriptable: "undefined" != typeof importModule } } function HTTP(e = { baseURL: "" }) { const { isQX: t, isLoon: s, isSurge: o, isScriptable: i, isNode: n } = ENV(), r = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/; const u = {}; return ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"].forEach(l => u[l.toLowerCase()] = (u => (function (u, l) { l = "string" == typeof l ? { url: l } : l; const a = e.baseURL; a && !r.test(l.url || "") && (l.url = a ? a + l.url : l.url); const h = (l = { ...e, ...l }).timeout, c = { onRequest: () => { }, onResponse: e => e, onTimeout: () => { }, ...l.events }; let f, d; if (c.onRequest(u, l), t) f = $task.fetch({ method: u, ...l }); else if (s || o || n) f = new Promise((e, t) => { (n ? require("request") : $httpClient)[u.toLowerCase()](l, (s, o, i) => { s ? t(s) : e({ statusCode: o.status || o.statusCode, headers: o.headers, body: i }) }) }); else if (i) { const e = new Request(l.url); e.method = u, e.headers = l.headers, e.body = l.body, f = new Promise((t, s) => { e.loadString().then(s => { t({ statusCode: e.response.statusCode, headers: e.response.headers, body: s }) }).catch(e => s(e)) }) } const $ = h ? new Promise((e, t) => { d = setTimeout(() => (c.onTimeout(), t(`${u} URL: ${l.url} exceeds the timeout ${h} ms`)), h) }) : null; return ($ ? Promise.race([$, f]).then(e => (clearTimeout(d), e)) : f).then(e => c.onResponse(e)) })(l, u))), u } function API(e = "untitled", t = !1) { const { isQX: s, isLoon: o, isSurge: i, isNode: n, isJSBox: r, isScriptable: u } = ENV(); return new class { constructor(e, t) { this.name = e, this.debug = t, this.http = HTTP(), this.env = ENV(), this.node = (() => { if (n) { return { fs: require("fs") } } return null })(), this.initCache(); Promise.prototype.delay = function (e) { return this.then(function (t) { return ((e, t) => new Promise(function (s) { setTimeout(s.bind(null, t), e) }))(e, t) }) } } initCache() { if (s && (this.cache = JSON.parse($prefs.valueForKey(this.name) || "{}")), (o || i) && (this.cache = JSON.parse($persistentStore.read(this.name) || "{}")), n) { let e = "root.json"; this.node.fs.existsSync(e) || this.node.fs.writeFileSync(e, JSON.stringify({}), { flag: "wx" }, e => console.log(e)), this.root = {}, e = `${this.name}.json`, this.node.fs.existsSync(e) ? this.cache = JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)) : (this.node.fs.writeFileSync(e, JSON.stringify({}), { flag: "wx" }, e => console.log(e)), this.cache = {}) } } persistCache() { const e = JSON.stringify(this.cache, null, 2); s && $prefs.setValueForKey(e, this.name), (o || i) && $persistentStore.write(e, this.name), n && (this.node.fs.writeFileSync(`${this.name}.json`, e, { flag: "w" }, e => console.log(e)), this.node.fs.writeFileSync("root.json", JSON.stringify(this.root, null, 2), { flag: "w" }, e => console.log(e))) } write(e, t) { if (this.log(`SET ${t}`), -1 !== t.indexOf("#")) { if (t = t.substr(1), i || o) return $persistentStore.write(e, t); if (s) return $prefs.setValueForKey(e, t); n && (this.root[t] = e) } else this.cache[t] = e; this.persistCache() } read(e) { return this.log(`READ ${e}`), -1 === e.indexOf("#") ? this.cache[e] : (e = e.substr(1), i || o ? $persistentStore.read(e) : s ? $prefs.valueForKey(e) : n ? this.root[e] : void 0) } delete(e) { if (this.log(`DELETE ${e}`), -1 !== e.indexOf("#")) { if (e = e.substr(1), i || o) return $persistentStore.write(null, e); if (s) return $prefs.removeValueForKey(e); n && delete this.root[e] } else delete this.cache[e]; this.persistCache() } notify(e, t = "", l = "", a = {}) { const h = a["open-url"], c = a["media-url"]; if (s && $notify(e, t, l, a), i && $notification.post(e, t, l + `${c ? "\n多媒体:" + c : ""}`, { url: h }), o) { let s = {}; h && (s.openUrl = h), c && (s.mediaUrl = c), "{}" === JSON.stringify(s) ? $notification.post(e, t, l) : $notification.post(e, t, l, s) } if (n || u) { const s = l + (h ? `\n点击跳转: ${h}` : "") + (c ? `\n多媒体: ${c}` : ""); if (r) { require("push").schedule({ title: e, body: (t ? t + "\n" : "") + s }) } else console.log(`${e}\n${t}\n${s}\n\n`) } } log(e) { this.debug && console.log(`[${this.name}] LOG: ${e}`) } info(e) { console.log(`[${this.name}] INFO: ${e}`) } error(e) { console.log(`[${this.name}] ERROR: ${e}`) } wait(e) { return new Promise(t => setTimeout(t, e)) } done(e = {}) { s || o || i ? $done(e) : n && !r && "undefined" != typeof $context && ($context.headers = e.headers, $context.statusCode = e.statusCode, $context.body = e.body) } }(e, t) }
/*****************************************************************************/
