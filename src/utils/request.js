import axios from "axios";
import store from "@/store";
import storage from "store";
import notification from "ant-design-vue/es/notification";
import { VueAxios } from "./axios";
import { ACCESS_TOKEN } from "@/store/mutation-types";

// 防抖，限制多次重复的登录失败弹窗。
let showLogoutNote = 1;
// 创建 axios 实例
const service = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL, // api base_url
  withCredentials: true, // send cookies when cross-domain requests
  headers: {
    "content-type": "application/json",
  }, // CORS
  timeout: 40000, // 请求超时时间
});

const err = error => {
  if (error.response) {
    // 从 localstorage 获取 token
    const token = storage.get(ACCESS_TOKEN);
    const res = error.response.data;

    if (error.response.status == 1) {
      notification.error({
        message: "请求错误",
        description: res.msg,
      });
    }

    if (error.response.status == 2) {
      showLogoutNote &&
        notification.error({
          message: "账号验证异常",
          description: res.msg || "账号过期或没有权限，请重新登录！",
        });
      holdAnotherNotification();
      if (token) {
        store.dispatch("Logout").finally(() => {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        });
      }
    }
  }
  return Promise.reject(error);
};

// request interceptor
service.interceptors.request.use(config => {
  // 从URL查询参数中获取token
  let urlToken = null;
  if (typeof window !== "undefined" && window.location && window.location.search) {
    const urlParams = new URLSearchParams(window.location.search);
    urlToken = urlParams.get("token");
  }
  const token = urlToken || storage.get(ACCESS_TOKEN);
  // console.log(token);
  if (token) {
    //     config.headers['Access-Token'] = token // 让每个请求携带自定义 token 请根据实际情况自行修改
    config.params = Object.assign({}, config.params, {
      token,
    });
  }
  return config;
}, err);

// response interceptor
service.interceptors.response.use(response => {
  // 更新token判断
  const tempToken = response.data.token;
  if (tempToken && tempToken !== storage.get(ACCESS_TOKEN)) {
    storage.set(ACCESS_TOKEN, tempToken);
  }

  if ([0, 1].indexOf(+response.data.status) === -1) {
    showLogoutNote &&
      notification.error({
        message: "登录错误",
        description: response.msg || "登录信息失效，请重新登录！",
      });
    holdAnotherNotification();
    store.dispatch("Logout").finally(() => {
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    });
  }
  return response.data;
}, err);

const installer = {
  vm: {},
  install(Vue) {
    Vue.use(VueAxios, service);
  },
};

function holdAnotherNotification() {
  if (showLogoutNote) {
    showLogoutNote = 0;
    setTimeout(() => {
      showLogoutNote = 1;
    }, 4500);
  }
}
export default service;

export { installer as VueAxios, service as axios };
