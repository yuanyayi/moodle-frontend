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
      const store = require("@/store").default;

      // 如果store还未初始化，或者用户没有角色信息，默认跳转到/live/list
      if (!store || !store.getters.roles || !store.getters.roles.permissionList) {
        return "/live/list";
      }

      // 获取用户权限列表
      const permissionList = store.getters.roles.permissionList || [];

      // 根据权限优先级顺序检查
      if (permissionList.includes("live")) {
        return "/live/list";
      } else if (permissionList.includes("analysis")) {
        return "/analysis/overview";
      }

      // 默认跳转到/live/list
      return "/live/list";
    },
    children: [
      {
        path: "/analysis",
        name: "analysis",
        component: PageView,
        meta: { title: "直播统计", icon: "area-chart", permission: ["analysis", "overview", "course", "distinguish", "logs"] },
        redirect: "/analysis/overview",
        children: [
          // 原直播统计改为直播概览
          {
            path: "overview",
            name: "analysisOverview",
            meta: { title: "直播概览", permission: ["analysis", "overview"] },
            component: () => import("@/views/analysis/"),
          },
          // 分直播统计保持不变
          {
            path: "detail",
            name: "analysisDetail",
            meta: { title: "分直播统计", permission: ["analysis", "course", "distinguish", "logs"] },
            component: BlankLayout,
            children: [
              {
                path: "course_data",
                name: "courseData",
                meta: { title: "直播统计", permission: ["analysis", "course"] },
                component: () => import("@/views/analysis/course"),
              },
              {
                path: "course/:id([1-9]\\d*)",
                name: "courseDetail",
                meta: { title: "课程详情", permission: ["analysis", "course"] },
                hidden: true,
                component: () => import("@/views/analysis/detail"),
              },
              // 整合distinguish模块的人脸识别记录功能
              {
                path: "face_record",
                name: "faceRecord",
                meta: { title: "人脸识别记录", permission: ["analysis", "distinguish"] },
                component: () => {
                  // 根据用户角色动态加载不同的组件
                  const store = require("@/store").default;
                  const role = store.getters?.roles?.id || "student";

                  if (role === "student") {
                    return import("@/views/analysis/distinguish/studentList");
                  } else {
                    return import("@/views/analysis/distinguish/list");
                  }
                },
              },
              {
                path: "face_record/detail/:id([1-9]\\d*)",
                name: "faceRecordDetail",
                meta: { title: "人脸识别记录详情", permission: ["analysis", "distinguish"] },
                hidden: true,
                component: () => import("@/views/analysis/distinguish/detail"),
              },
              {
                path: "face_record/detail/student/:id([1-9]\\d*)",
                name: "studentFaceDetail",
                meta: { title: "学生人脸识别记录", permission: ["analysis", "distinguish"] },
                hidden: true,
                component: () => import("@/views/analysis/distinguish/studentDetail"),
              },
              {
                path: "logs",
                name: "liveLogs",
                meta: { title: "直播日志", permission: ["analysis", "logs"] },
                component: () => import("@/views/analysis/logs"),
              },
              {
                path: "logs/:live_config_id([1-9]\\d*)",
                name: "oneLiveLogs",
                meta: { title: "直播日志详情", permission: ["analysis", "logs"] },
                hidden: true,
                component: () => import("@/views/analysis/logs/oneLiveLogs"),
              },
              {
                path: "logs/:live_config_id([1-9]\\d*)/student/:student_id",
                name: "studentLiveLogDetail",
                meta: { title: "学生直播日志详情", permission: ["analysis", "logs"] },
                hidden: true,
                component: () => import("@/views/analysis/logs/studentLiveLogDetail"),
              },
            ],
          },
        ],
      },
      // 直播平台
      {
        path: "/live",
        name: "live",
        component: PageView,
        redirect: "/live/list",
        meta: { title: "直播列表", icon: "home-o", permission: ["live"] },
        children: [
          // 直播列表
          {
            path: "list",
            name: "liveList",
            component: () => import("@/views/live/list"),
            meta: { title: "直播列表", permission: ["live"] },
          },
          {
            path: "replay/:configId([1-9]\\d*)/",
            name: "replayList",
            component: () => import("@/views/live/liveClass/replayList"),
            meta: { title: "直播回放", permission: ["live"] },
            hidden: true,
          },
          // 课程开播
          // 课程观播
          // 两个页面需抛弃BaseLayout
        ],
      },
      // {
      //   path: "/flv",
      //   name: "flvDemo",
      //   meta: { title: "flv测试", permission: ["live"] },
      //   component: () => import("@/views/live/FlvPlayerDemo"),
      // },
    ],
  },
  {
    // 课程开播
    path: "/live/broadcast/:liveConfigId([1-9]\\d*)/",
    name: "broadcast",
    meta: { title: "课程开播页", permission: ["live"] },
    component: () => import("@/views/live/liveClass/broadcast"),
    hidden: true,
  },
  {
    // 课程观播
    path: "/live/watch/:liveConfigId([1-9]\\d*)/",
    name: "watch",
    meta: { title: "课程直播页", permission: ["live"] },
    component: () => import("@/views/live/liveClass/watchLive"),
    hidden: true,
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
