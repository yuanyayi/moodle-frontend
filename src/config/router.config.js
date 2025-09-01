// eslint-disable-next-line
import { UserLayout, BasicLayout, BlankLayout, PageView } from "@/layouts";
import { bxAnaalyse } from "@/core/icons";

const RouteView = {
  name: "RouteView",
  render: h => h("router-view"),
};

export const asyncRouterMap = [
  {
    path: "/",
    name: "index",
    component: BasicLayout,
    meta: { title: "首页" },
    redirect: "/live/list",
    children: [
      // 直播平台
      {
        path: "/live",
        name: "live",
        component: PageView,
        meta: { title: "直播平台", icon: "home-o" },
        children: [
          // 直播列表
          {
            path: "/live/list",
            name: "liveList",
            component: () => import("@/views/live/list"),
            meta: { title: "直播列表" },
            // permission: ['live']
          },
          {
            path: "/live/replay/:configId([1-9]\\d*)+",
            name: "replayList",
            component: () => import("@/views/live/liveClass/replayList"),
            meta: { title: "直播回放" },
            // permission: ['live']
            hidden: true,
          },
          {
            // 课程开播
            path: "/live/broadcast/:liveId([1-9]\\d*)+/",
            name: "broadcast",
            meta: { title: "课程开播页" },
            component: () => import("@/views/live/liveClass/broadcast"),
            hidden: true,
          },
          {
            // 课程观播
            path: "/live/watch/:liveId([1-9]\\d*)+/",
            name: "watch",
            meta: { title: "课程直播页" },
            component: () => import("@/views/live/liveClass/watchLive"),
            hidden: true,
          },
        ],
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
