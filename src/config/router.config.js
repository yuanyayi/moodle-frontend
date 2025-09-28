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
    redirect: "/live/list",
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
            meta: { title: "直播列表" },
          },
          {
            path: "/live/replay/:configId([1-9]\\d*)+",
            name: "replayList",
            component: () => import("@/views/live/liveClass/replayList"),
            meta: { title: "直播回放" },
            hidden: true,
          },
          {
            // 课程开播
            path: "/live/broadcast/:liveConfigId([1-9]\\d*)+/",
            name: "broadcast",
            meta: { title: "课程开播页" },
            component: () => import("@/views/live/liveClass/broadcast"),
            hidden: true,
          },
          {
            // 课程观播
            path: "/live/watch/:liveConfigId([1-9]\\d*)+/",
            name: "watch",
            meta: { title: "课程直播页" },
            component: () => import("@/views/live/liveClass/watchLive"),
            hidden: true,
          },
          //
          {
            path: "/live/distinguish",
            name: "distinguishList",
            meta: { title: "人脸识别记录" },
            component: () => import("@/views/distinguish/list"),
          },
          {
            path: "/live/distinguish/detail/:id([1-9]\\d*)+/",
            name: "distinguishDetail",
            meta: { title: "班级记录" },
            component: () => import("@/views/distinguish/detail"),
            hidden: true,
          },
          {
            path: "/live/distinguish/detail/student/:id([1-9]\\d*)+/", // attendance_status_id
            name: "studentDetail",
            meta: { title: "学生记录" },
            component: () => import("@/views/distinguish/studentDetail"),
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
