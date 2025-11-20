// eslint-disable-next-line
import { UserLayout, BasicLayout, BlankLayout, PageView } from "@/layouts";
// import { bxAnaalyse } from "@/core/icons";

// const RouteView = {
//   name: "RouteView",
//   render: h => h("router-view"),
// };

export const asyncRouterMap = [
  {
    path: "/",
    name: "index",
    component: BasicLayout,
    meta: { title: "首页" },
    redirect: to => {
      // 获取用户角色权限
      const store = require('@/store').default;
      
      // 如果store还未初始化，或者用户没有角色信息，默认跳转到/live/list
      if (!store || !store.getters.roles || !store.getters.roles.permissionList) {
        return "/live/list";
      }
      
      // 获取用户权限列表
      const permissionList = store.getters.roles.permissionList || [];
      
      // 根据权限优先级顺序检查
      if (permissionList.includes("live")) {
        return "/live/list";
      } else if (permissionList.includes("anaylsis")) {
        return "/live/anaylsis";
      } else if (permissionList.includes("distinguish")) {
        return "/live/distinguish";
      }
      
      // 默认跳转到/live/list
      return "/live/list";
    },
    children: [
      // 直播平台
      {
        path: "/live",
        name: "live",
        component: PageView,
        redirect: "/live/list",
        meta: { title: "直播平台", icon: "home-o" },
        children: [
          // 直播列表
          {
            path: "list",
            name: "liveList",
            component: () => import("@/views/live/list"),
            meta: { title: "直播列表", permission: ["live"] },
          },
          {
            path: "/live/replay/:configId([1-9]\\d*)+",
            name: "replayList",
            component: () => import("@/views/live/liveClass/replayList"),
            meta: { title: "直播回放", permission: ["live"] },
            hidden: true,
          },
          {
            // 课程开播
            path: "/live/broadcast/:liveConfigId([1-9]\\d*)+/",
            name: "broadcast",
            meta: { title: "课程开播页", permission: ["live"] },
            component: () => import("@/views/live/liveClass/broadcast"),
            hidden: true,
          },
          {
            // 课程观播
            path: "/live/watch/:liveConfigId([1-9]\\d*)+/",
            name: "watch",
            meta: { title: "课程直播页", permission: ["live"] },
            component: () => import("@/views/live/liveClass/watchLive"),
            hidden: true,
          },
          // 直播统计
          {
            path: "/live/anaylsis/",
            name: "anaylsis",
            meta: { title: "直播统计", permission: ["anaylsis"] },
            component: () => import("@/views/anaylsis/"),
          },
          // 人脸识别记录
          {
            path: "/live/distinguish",
            name: "distinguishList",
            meta: { title: "人脸识别记录", permission: ["distinguish"] },
            component: () => import("@/views/distinguish/list"),
          },
          {
            path: "/live/distinguish/detail/:id([1-9]\\d*)+/",
            name: "distinguishDetail",
            meta: { title: "班级记录", permission: ["distinguish"] },
            component: () => import("@/views/distinguish/detail"),
            hidden: true,
          },
          {
            path: "/live/distinguish/detail/student/:id([1-9]\\d*)+/", // attendance_status_id
            name: "studentDetail",
            meta: { title: "学生记录", permission: ["distinguish"] },
            component: () => import("@/views/distinguish/studentDetail"),
            hidden: true,
          },
        ],
      },
      {
        // 设备测试页面
        path: "/device-test",
        name: "deviceTest",
        meta: { title: "设备测试", permission: ["live"] },
        component: () => import("@/views/live/deviceTest"),
        hidden: true,
      },
    ],
  },
  {
    path: "*",
    redirect: "/404",
    hidden: true,
  },
];

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: "/user",
    component: UserLayout,
    redirect: "/user/login",
    hidden: true,
    children: [
      {
        path: "login",
        name: "login",
        component: () => import(/* webpackChunkName: "user" */ "@/views/user/Login"),
      },
      {
        path: "register",
        name: "register",
        component: () => import(/* webpackChunkName: "user" */ "@/views/user/Register"),
      },
      {
        path: "register-result",
        name: "registerResult",
        component: () => import(/* webpackChunkName: "user" */ "@/views/user/RegisterResult"),
      },
      {
        path: "recover",
        name: "recover",
        component: undefined,
      },
    ],
  },

  {
    path: "/404",
    component: () => import(/* webpackChunkName: "fail" */ "@/views/exception/404"),
  },
];
