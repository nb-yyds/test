import axios from "axios";
import qs from "qs";

// 北京时间接口
const timeApi = "https://apps.game.qq.com/CommArticle/app/reg/gdate.php";
// 刷步数接口
const stepApi = `https://api.faithxy.com/motion/api/motion/Xiaomi?t=${Date.now()}`;
// 刷步数请求头
const stepApiHeaders = {
  accept: "*/*",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7,zh-TW;q=0.6",
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  Host: "api.faithxy.com",
  Origin: "http://8.140.250.130",
  Referer: "http://8.140.250.130/",
  "sec-ch-ua":
    '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
};

// 刷步数请求
async function handlePostStep(data) {
  const tip = `准备发送请求：\n账号信息：${data.phone}, \n需要刷的步数：${data.num}`;
  console.info(tip);

  // 请求
  try {
    const res = await axios.post(stepApi, data, {
      headers: stepApiHeaders,
      transformRequest: [
        // 借用qs插件实现序列化
        (data) => {
          return qs.stringify(data);
        },
      ],
    });
    console.log("刷步数请求结果：", res.data);
  } catch (error) {
    throw Error("发送刷步数请求失败", error);
  }
}

// 根据北京时间,在一定的时间内，刷对应的步数
async function computedStepCount(userInfo) {
  //  获取北京时间,在一定的时间内，刷对应的步数
  try {
    const { data, status } = await axios.get(timeApi);
    if (status != 200) {
      throw Error("北京时间获取失败");
    }
    let regex = /'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})'/;
    let matches = data.match(regex);
    if (matches) {
      let fullBeijingTime = matches[1]; // 2025-01-05 18:42:14
      let hour = fullBeijingTime.split(" ")[1].split(":")[0]; // 18
      let minute = fullBeijingTime.split(" ")[1].split(":")[1]; // 42

      console.log("完整的北京时间：", fullBeijingTime); // 输出：2025-01-05 18:42:14
      console.log("小时：", hour); // 输出：18
      console.log("分钟：", minute); // 输出：42

      // 在时间范围内，刷对应的步数
      let step = 26328;
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
      handlePostStep({
        phone: userInfo.USER,
        pwd: userInfo.PWD,
        num: step,
      });
    }
  } catch (error) {
    throw Error(error || "北京时间获取失败");
  }
}

// 主程序
async function signIn() {
  const userInfo = JSON.parse(process.env.CONFIG || "{}");
  if (Object.keys(userInfo).length === 0) {
    throw Error("获取账号信息失败");
  } else {
    computedStepCount(userInfo);
  }
}

signIn();
