import axios from "axios";
import qs from "qs";
import dayjs from "dayjs";

// 北京时间接口
const timeApi = "https://apps.game.qq.com/CommArticle/app/reg/gdate.php";

// 2024——刷步数接口
// const stepApi = `https://api.faithxy.com/motion/api/motion/Xiaomi?t=${Date.now()}`;
// 2025——刷步数接口
const stepApi = `http://8.140.250.130:8888/api/motion/Xiaomi?t=${Date.now()}`;

// 刷步数请求头
const stepApiHeaders = {
  accept: "*/*",
  // "User-Agent": getRandomUserAgent(),
  // "X-Forwarded-For": generateIp(),

  "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2",
};

// 随便找的国内IP段：223.64.0.0 - 223.117.255.255
function generateIp() {
  const random = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  return `223.${random(64, 117)}.${random(0, 255)}.${random(0, 255)}`;
}

// 用户代理池
const USER_AGENTS = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0",
  "Mozilla/5.0 (Linux; Android 10; SM-A505FN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.93 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 9; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.92 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 12; Pixel 6 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 10; Pixel 4 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 9; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.89 Mobile Safari/537.36",
];

// Function to get a random user agent
function getRandomUserAgent() {
  const randomIndex = Math.floor(Math.random() * USER_AGENTS.length);
  return USER_AGENTS[randomIndex];
}

// 延迟执行函数，github如果不间断发送请求，很大概率会失败
function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// 获取code
function resMatchCode(location) {
  const regex = /access=([a-zA-Z0-9]+)/;
  const match = location.match(regex);
  if (match) {
    return match[1];
  }
  throw new Error("Code not found");
}
async function getHuaMiCode({ phone, pwd }) {
  const url = "https://api-user.huami.com/registrations/" + phone + "/tokens";

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2",
  };

  const data = {
    client_id: "HuaMi",
    password: pwd,
    redirect_uri: "https://s3-us-west-2.amazonaws.com/hm-registration/successsignin.html",
    token: "access",
  };

  // 请求
  try {
    const response = await axios.post(url, data, {
      headers: headers,
      transformRequest: [
        // 借用qs插件实现序列化
        (data) => {
          return qs.stringify(data);
        },
      ],
    });
    // 得到的location：其实就是redirect重定向的url
    // https://s3-us-west-2.amazonaws.com/hm-registration/successsignin.html?region=us-west-2&access=ZQVBQDZOQmJaR0YyajYmWnJoBAgAAAAAAYT1aalZyUWFCcnFrUXVzNFdBQmt5RVJCQUFBQVpVUEhHaEcmcj0xMiZ0PWh1YW1pJnRpPXl5ZHNAMTYzLmNuJmg9MTczOTcxNTM1NzEwNCZpPTg2NDAwMCZ1c2VybmFtZT15eWRzyf4KPuwRhTEVaHebQRJ8kQ&country_code=CN&expiration=1740579357
    console.log(111, response.request)
    const code = resMatchCode(response.data);
    // 1min 后再发送请求
    await delay(60);
    getHuaMiToken(code);
  } catch (error) {
    throw Error("获取当前账号【code码】失败", error);
  }
}

// 获取token
async function getHuaMiToken(code) {
  const url = "https://account.huami.com/v2/client/login";

  const data = {
    "allow_registration=": "false",
    app_name: "com.xiaomi.hm.health",
    app_version: "6.3.5",
    code: code,
    country_code: "CN",
    device_id: "2C8B4939-0CCD-4E94-8CBA-CB8EA6E613A1",
    device_model: "phone",
    dn: "api-user.huami.com%2Capi-mifit.huami.com%2Capp-analytics.huami.com",
    grant_type: "access_token",
    lang: "zh_CN",
    os_version: "1.5.0",
    source: "com.xiaomi.hm.health",
    third_name: "email",
  };

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2",
  };

  // 请求
  try {
    const response = await axios.post(url, data, {
      headers: headers,
      transformRequest: [
        // 借用qs插件实现序列化
        (data) => {
          return qs.stringify(data);
        },
      ],
    });
    console.log("获取当前账号的token结果：", response);
  } catch (error) {
    throw Error("获取当前账号【token码】失败", error);
  }
}

// 根据北京时间,在一定的时间内，刷对应的步数
function computedStepCount(userInfo) {
  //  获取北京时间,在一定的时间内，刷对应的步数
  try {
    const niuyueFullTime = dayjs().endOf().format("YYYY-MM-DD HH:mm:ss");
    const niuyueHour = dayjs().startOf("hour").format("HH");
    const minute = dayjs().startOf("minute").format("mm");
    const hour = niuyueHour * 1 + 8;

    // 北京时间比美国纽约时间少8小时，需要加上
    console.log("美国纽约时间：", niuyueFullTime); // 输出：2025-01-05 18:42:14+
    console.log("当前美国小时：", niuyueHour); // 输出：2025-01-05 18:42:14+
    console.log("当前北京小时：", hour); // 输出：18
    console.log("当前分钟数：", minute); // 输出：42

    // 在时间范围内，刷对应的步数
    let step = 23328;
    if (7 <= hour && hour < 13) {
      // 早上：一般在9:30分触发
      step = Math.floor(Math.random() * (10000 - 18000 + 1)) + 18000;
    } else if (13 <= hour && hour < 18) {
      // 下午：一般在13：50分触发
      step = Math.floor(Math.random() * (20000 - 23000 + 1)) + 23000;
    } else if (18 <= hour && hour < 23) {
      // 晚上：18点-23点
      step = Math.floor(Math.random() * (23100 - 26999 + 1)) + 26999;
    } else {
      step = Math.max(Math.floor((1000 * (hour + minute)) / 10), 1);
    }

    // 发送刷步数请求
    getHuaMiCode({
      phone: userInfo.USER,
      pwd: userInfo.PWD,
      num: step,
    });
  } catch (error) {
    throw Error(error || "北京时间获取失败");
  }
}

// 主程序
async function signIn() {
  // const userInfo = JSON.parse(process.env.CONFIG || "{}");
  const userInfo = {
    USER: "yyds@163.cn",
    PWD: "qq1216484317",
    MIN_STEP: "18000",
    MAX_STEP: "25000",
    PUSH_PLUS_TOKEN: "",
    PUSH_PLUS_HOUR: "",
    PUSH_PLUS_MAX: "30",
    SLEEP_GAP: "5",
    USE_CONCURRENT: "False",
  };
  if (Object.keys(userInfo).length === 0) {
    throw Error("获取账号信息失败");
  } else {
    computedStepCount(userInfo);
  }
}

signIn();
