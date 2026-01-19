import router, { resetRouter } from "./router";
import store from "./store";
import storage from "store";
import NProgress from "nprogress"; // progress bar
import "@/components/NProgress/nprogress.less"; // progress bar custom style
import notification from "ant-design-vue/es/notification";
import { setDocumentTitle, domTitle } from "@/utils/domUtil";
import { ACCESS_TOKEN } from "@/store/mutation-types";
import { i18nRender } from "@/locales";

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const allowList = ["login", "register", "registerResult"]; // no redirect allowList
const loginRoutePath = "/user/login";
// 将默认路由路径改为函数，动态计算用户首页
const getDefaultRoutePath = () => {
  // 如果store还未初始化，或者用户没有角色信息，默认返回/live/list
  if (!store || !store.getters.roles || !store.getters.roles.permissionList) {
    return "/live/list";
  }
  
  // 获取用户权限列表
  const permissionList = store.getters.roles.permissionList || [];
  
  // 根据权限优先级顺序检查
  if (permissionList.includes("live")) {
    return "/live/list";
  } else if (permissionList.includes("analysis")) {
    return "/live/analysis";
  } else if (permissionList.includes("distinguish")) {
    return "/live/distinguish";
  }
  
  // 默认返回/live/list
  return "/live/list";
};

router.beforeEach((to, from, next) => {
  NProgress.start(); // start progress bar
  to.meta && typeof to.meta.title !== "undefined" && setDocumentTitle(`${i18nRender(to.meta.title)} - ${domTitle}`);
  const urlToken = to.query.token;
  const storedToken = storage.get(ACCESS_TOKEN);
  const token = urlToken || storedToken;

  if (token) {
    if (to.path === loginRoutePath) {
      next({ path: getDefaultRoutePath() });
      NProgress.done();
    } else {
      // check login user.roles is null
      if (store.getters.roles.length === 0) {
        // request login userInfo
        store
          .dispatch("GetInfo")
          .then(res => {
            /* has token */
            storage.set(ACCESS_TOKEN, token, new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
            // 根据用户权限信息生成可访问的路由表
            store.dispatch("GenerateRoutes", { token, ...res }).then(() => {
              // 动态添加可访问路由表
              // VueRouter@3.5.0+ New API
              resetRouter(); // 重置路由 防止退出重新登录或者 token 过期后页面未刷新，导致的路由重复添加
              store.getters.addRouters.forEach(r => {
                router.addRoute(r);
              });
              // 请求带有 redirect 重定向时，登录自动重定向到该地址
              const redirect = decodeURIComponent(from.query.redirect || to.path);
              if (to.path === redirect) {
                // set the replace: true so the navigation will not leave a history record
                next({ ...to, replace: true });
              } else {
                // 跳转到目的路由
                next({ path: redirect });
              }
            });
          })
          .catch(err => {
            console.log(err);
            notification.error({
              message: "错误",
              description: "请求用户信息失败，请重试",
            });
            // 失败时，获取用户信息失败时，调用登出，来清空历史保留信息
            store.dispatch("Logout").then(() => {
              next({ path: loginRoutePath, query: { redirect: to.fullPath } });
            });
          });
      } else {
        next();
      }
    }
  } else {
    if (allowList.includes(to.name)) {
      // 在免登录名单，直接进入
      next();
    } else {
      next({ path: loginRoutePath, query: { redirect: to.fullPath } });
      NProgress.done(); // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
});

router.afterEach(() => {
  NProgress.done(); // finish progress bar
});