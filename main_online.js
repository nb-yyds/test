import axios from 'axios'
import qs from 'qs'
import dayjs from 'dayjs'

// 使用别人搭建的在线刷步数接口：
// 1、修改stepApi为对应接口地址
// 2、修改stepApiHeaders为对应接口请求头
// 3、修改handlePostStep方法中的data参数为对应接口参数
// 4、修改 .github/workflows/run.yml 文件中的启动命令：node main_online.js
// 5、剩下的不需要改动
// 6、本地调试：从gitee中下载lenovo仓库进行本地调试

// 2025——在线刷步数接口
const stepApi = `https://wzz.wangzouzou.com/motion/api/motion/Xiaomi?t=${Date.now()}`

// 刷步数请求头
const stepApiHeaders = {
  accept: '*/*',
  'accept-language': 'zh-CN,zh;q=0.9',
  'accept-encoding': 'gzip, deflate, br, zstd',
  'cache-control': 'no-cache',
  connection: 'keep-alive',
  'content-length': '47',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'sec-ch-ua':
    '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  // 检查是否需要更改
  host: 'wzz.wangzouzou.com',
  Origin: 'http://8.140.250.130',
  pragma: 'no-cache',
  Referer: 'http://8.140.250.130/',
  'X-Forwarded-For': generateIp()
}

// 随便找的国内IP段：223.64.0.0 - 223.117.255.255
function generateIp() {
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  return `223.${random(64, 117)}.${random(0, 255)}.${random(0, 255)}`
}

// 刷步数请求
async function handlePostStep(data) {
  const tip = `账号信息：${data.phone}, \n需要刷的步数：${data.num}`
  console.log('=================准备发送请求：==========================')
  console.info(tip)
  console.log('=================准备发送请求：==========================')

  // 请求
  try {
    const res = await axios.post(stepApi, data, {
      headers: stepApiHeaders,
      transformRequest: [
        // 借用qs插件实现序列化
        (data) => {
          return qs.stringify(data)
        }
      ]
    })
    console.log('刷步数请求结果：', res.data)
  } catch (error) {
    throw Error('发送刷步数请求失败', error)
  }
}

// 根据北京时间,在一定的时间内，刷对应的步数
function computedStepCount(userInfo) {
  //  获取北京时间,在一定的时间内，刷对应的步数
  try {
    const niuyueFullTime = dayjs().endOf().format('YYYY-MM-DD HH:mm:ss')
    const niuyueHour = dayjs().startOf('hour').format('HH')
    const minute = dayjs().startOf('minute').format('mm')
    const hour = niuyueHour * 1 + 8

    // 北京时间比美国纽约时间少8小时，需要加上
    console.log('美国纽约时间：', niuyueFullTime) // 输出：2025-01-05 18:42:14+
    console.log('当前美国小时：', niuyueHour) // 输出：2025-01-05 18:42:14+
    console.log('当前北京小时：', hour) // 输出：18
    console.log('当前分钟数：', minute) // 输出：42

    // 在时间范围内，刷对应的步数
    let step = 26888
    if (7 <= hour && hour < 13) {
      // 早上：一般在9:30分触发
      step = Math.floor(Math.random() * (10000 - 15000 + 1)) + 15000
    } else if (13 <= hour && hour < 18) {
      // 下午：一般在13：50分触发
      step = Math.floor(Math.random() * (16000 - 21000 + 1)) + 21000
    } else if (18 <= hour && hour < 23) {
      // 晚上：18点-23点
      step = Math.floor(Math.random() * (22999 - 25999 + 1)) + 25999
    } else {
      step = 26888
    }

    // 发送刷步数请求
    handlePostStep({
      phone: userInfo.USER,
      pwd: userInfo.PWD,
      num: step
    })
    console.log('通过当前时间计算出step值为：', step)
  } catch (error) {
    throw Error(error || '北京时间获取失败')
  }
}

// 主程序
async function signIn() {
  const userInfo = JSON.parse(process.env.CONFIG || '{}')
  if (Object.keys(userInfo).length === 0) {
    throw Error('获取账号信息失败')
  } else {
    computedStepCount(userInfo)
  }
}

signIn()
