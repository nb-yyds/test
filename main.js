// import signIn from './sign_in.js'
import axios from "axios";
import dotenv from 'dotenv'

async function get_beijing_time() {}

async function signIn() {
  console.log(222, "dotenv.config()", dotenv.config())
  const json = JSON.parse(process.env.CONFIG || "{}");
  console.log("获取当前信息", json);
}

signIn()
//   .then(() => {
//     console.log("执行签到成功！");
//   })
//   .catch((error) => {
//     console.error("执行签到失败：", error.message);
//     process.exit(1);
//   });
