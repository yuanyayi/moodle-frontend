import request from "@/utils/request";

const userApi = {
  Login: "/auth/login",
  Logout: "/auth/logout",
  ForgePassword: "/auth/forge-password",
  Register: "/auth/register",
  // twoStepCode: "/auth/2step-code",
  SendSms: "/account/sms",
  SendSmsErr: "/account/sms_err",
  // get my info
  UserMenu: "/user/nav",
  // go to smart platform
  ToSmart: "/login/toSmart",
};

/**
 * login func
 * parameter: {
 *     username: '',
 *     password: '',
 *     remember_me: true,
 *     captcha: '12345'
 * }
 * @param parameter
 * @returns {*}
 */
export function login(parameter) {
  // return request({
  //   url: userApi.Login,
  //   method: 'post',
  //   data: parameter,
  // })
  return Promise.resolve({
    status: 0,
    msg: "登录成功",
    result: {
      id: "4291d7da9005377ec9aec4a71ea837f",
      name: "天野远子",
      username: "admin",
      password: "",
      avatar: "/avatar2.jpg",
      status: 1,
      telephone: "",
      lastLoginIp: "27.154.74.117",
      lastLoginTime: 1534837621348,
      creatorId: "admin",
      createTime: 1497160610259,
      merchantCode: "TLif2btpzg079h15bk",
      deleted: 0,
      roleId: "admin",
      role: {
        id: "admin",
        name: "管理员",
        describe: "拥有所有权限",
        status: 1,
        creatorId: "system",
        createTime: 1497160610259,
        deleted: 0,
        permissions: [
          {
            roleId: "admin",
            permissionId: "dashboard",
            permissionName: "仪表盘",
            actions:
              '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"query","defaultCheck":false,"describe":"查询"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
            actionEntitySet: [
              {
                action: "add",
                describe: "新增",
                defaultCheck: false,
              },
              {
                action: "query",
                describe: "查询",
                defaultCheck: false,
              },
              {
                action: "get",
                describe: "详情",
                defaultCheck: false,
              },
              {
                action: "update",
                describe: "修改",
                defaultCheck: false,
              },
              {
                action: "delete",
                describe: "删除",
                defaultCheck: false,
              },
            ],
            actionList: ["add", "query", "get", "update", "delete"],
            dataAccess: null,
          },
          {
            roleId: "admin",
            permissionId: "exception",
            permissionName: "异常页面权限",
            actions:
              '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"query","defaultCheck":false,"describe":"查询"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
            actionEntitySet: [
              {
                action: "add",
                describe: "新增",
                defaultCheck: false,
              },
              {
                action: "query",
                describe: "查询",
                defaultCheck: false,
              },
              {
                action: "get",
                describe: "详情",
                defaultCheck: false,
              },
              {
                action: "update",
                describe: "修改",
                defaultCheck: false,
              },
              {
                action: "delete",
                describe: "删除",
                defaultCheck: false,
              },
            ],
            actionList: ["add", "query", "get", "update", "delete"],
            dataAccess: null,
          },
          {
            roleId: "admin",
            permissionId: "result",
            permissionName: "结果权限",
            actions:
              '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"query","defaultCheck":false,"describe":"查询"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
            actionEntitySet: [
              {
                action: "add",
                describe: "新增",
                defaultCheck: false,
              },
              {
                action: "query",
                describe: "查询",
                defaultCheck: false,
              },
              {
                action: "get",
                describe: "详情",
                defaultCheck: false,
              },
              {
                action: "update",
                describe: "修改",
                defaultCheck: false,
              },
              {
                action: "delete",
                describe: "删除",
                defaultCheck: false,
              },
            ],
            actionList: ["add", "query", "get", "update", "delete"],
            dataAccess: null,
          },
          {
            roleId: "admin",
            permissionId: "profile",
            permissionName: "详细页权限",
            actions:
              '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"query","defaultCheck":false,"describe":"查询"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
            actionEntitySet: [
              {
                action: "add",
                describe: "新增",
                defaultCheck: false,
              },
              {
                action: "query",
                describe: "查询",
                defaultCheck: false,
              },
              {
                action: "get",
                describe: "详情",
                defaultCheck: false,
              },
              {
                action: "update",
                describe: "修改",
                defaultCheck: false,
              },
              {
                action: "delete",
                describe: "删除",
                defaultCheck: false,
              },
            ],
            actionList: ["add", "query", "get", "update", "delete"],
            dataAccess: null,
          },
          {
            roleId: "admin",
            permissionId: "table",
            permissionName: "表格权限",
            actions:
              '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"import","defaultCheck":false,"describe":"导入"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"}]',
            actionEntitySet: [
              {
                action: "add",
                describe: "新增",
                defaultCheck: false,
              },
              {
                action: "import",
                describe: "导入",
                defaultCheck: false,
              },
              {
                action: "get",
                describe: "详情",
                defaultCheck: false,
              },
              {
                action: "update",
                describe: "修改",
                defaultCheck: false,
              },
            ],
            actionList: ["add", "import", "get", "update"],
            dataAccess: null,
          },
          {
            roleId: "admin",
            permissionId: "form",
            permissionName: "表单权限",
            actions:
              '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"query","defaultCheck":false,"describe":"查询"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
            actionEntitySet: [
              {
                action: "add",
                describe: "新增",
                defaultCheck: false,
              },
              {
                action: "get",
                describe: "详情",
                defaultCheck: false,
              },
              {
                action: "query",
                describe: "查询",
                defaultCheck: false,
              },
              {
                action: "update",
                describe: "修改",
                defaultCheck: false,
              },
              {
                action: "delete",
                describe: "删除",
                defaultCheck: false,
              },
            ],
            actionList: ["add", "get", "query", "update", "delete"],
            dataAccess: null,
          },
          {
            roleId: "admin",
            permissionId: "order",
            permissionName: "订单管理",
            actions:
              '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"query","defaultCheck":false,"describe":"查询"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
            actionEntitySet: [
              {
                action: "add",
                describe: "新增",
                defaultCheck: false,
              },
              {
                action: "query",
                describe: "查询",
                defaultCheck: false,
              },
              {
                action: "get",
                describe: "详情",
                defaultCheck: false,
              },
              {
                action: "update",
                describe: "修改",
                defaultCheck: false,
              },
              {
                action: "delete",
                describe: "删除",
                defaultCheck: false,
              },
            ],
            actionList: ["add", "query", "get", "update", "delete"],
            dataAccess: null,
          },
          {
            roleId: "admin",
            permissionId: "permission",
            permissionName: "权限管理",
            actions:
              '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
            actionEntitySet: [
              {
                action: "add",
                describe: "新增",
                defaultCheck: false,
              },
              {
                action: "get",
                describe: "详情",
                defaultCheck: false,
              },
              {
                action: "update",
                describe: "修改",
                defaultCheck: false,
              },
              {
                action: "delete",
                describe: "删除",
                defaultCheck: false,
              },
            ],
            actionList: ["add", "get", "update", "delete"],
            dataAccess: null,
          },
          {
            roleId: "admin",
            permissionId: "role",
            permissionName: "角色管理",
            actions:
              '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
            actionEntitySet: [
              {
                action: "add",
                describe: "新增",
                defaultCheck: false,
              },
              {
                action: "get",
                describe: "详情",
                defaultCheck: false,
              },
              {
                action: "update",
                describe: "修改",
                defaultCheck: false,
              },
              {
                action: "delete",
                describe: "删除",
                defaultCheck: false,
              },
            ],
            actionList: ["add", "get", "update", "delete"],
            dataAccess: null,
          },
          {
            roleId: "admin",
            permissionId: "table",
            permissionName: "桌子管理",
            actions:
              '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"query","defaultCheck":false,"describe":"查询"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
            actionEntitySet: [
              {
                action: "add",
                describe: "新增",
                defaultCheck: false,
              },
              {
                action: "get",
                describe: "详情",
                defaultCheck: false,
              },
              {
                action: "query",
                describe: "查询",
                defaultCheck: false,
              },
              {
                action: "update",
                describe: "修改",
                defaultCheck: false,
              },
              {
                action: "delete",
                describe: "删除",
                defaultCheck: false,
              },
            ],
            actionList: ["add", "get", "query", "update", "delete"],
            dataAccess: null,
          },
          {
            roleId: "admin",
            permissionId: "user",
            permissionName: "用户管理",
            actions:
              '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"import","defaultCheck":false,"describe":"导入"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"},{"action":"export","defaultCheck":false,"describe":"导出"}]',
            actionEntitySet: [
              {
                action: "add",
                describe: "新增",
                defaultCheck: false,
              },
              {
                action: "import",
                describe: "导入",
                defaultCheck: false,
              },
              {
                action: "get",
                describe: "详情",
                defaultCheck: false,
              },
              {
                action: "update",
                describe: "修改",
                defaultCheck: false,
              },
              {
                action: "delete",
                describe: "删除",
                defaultCheck: false,
              },
              {
                action: "export",
                describe: "导出",
                defaultCheck: false,
              },
            ],
            actionList: ["add", "import", "get", "update", "delete", "export"],
            dataAccess: null,
          },
          {
            roleId: "admin",
            permissionId: "support",
            permissionName: "超级模块",
            actions:
              '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"import","defaultCheck":false,"describe":"导入"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"},{"action":"export","defaultCheck":false,"describe":"导出"}]',
            actionEntitySet: [
              {
                action: "add",
                describe: "新增",
                defaultCheck: false,
              },
              {
                action: "import",
                describe: "导入",
                defaultCheck: false,
              },
              {
                action: "get",
                describe: "详情",
                defaultCheck: false,
              },
              {
                action: "update",
                describe: "修改",
                defaultCheck: false,
              },
              {
                action: "delete",
                describe: "删除",
                defaultCheck: false,
              },
              {
                action: "export",
                describe: "导出",
                defaultCheck: false,
              },
            ],
            actionList: ["add", "import", "get", "update", "delete", "export"],
            dataAccess: null,
          },
        ],
        permissionList: ["dashboard", "exception", "result", "profile", "table", "form", "order", "permission", "role", "table", "user", "support"],
      },
    },
  });
}

export function getSmsCaptcha(parameter) {
  return request({
    url: userApi.SendSms,
    method: "post",
    data: parameter,
  });
}

export function getInfo() {
  return request({
    url: "/login/userinfo",
    method: "get",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
    },
  }).then(res => {
    // 在这里判断角色和权限
    let permissionList = {
      0: ["live", "analysis", "distinguish", "logs"], // 0:管理员
      1: ["live", "distinguish"], // 1:学生
      2: ["live", "analysis"], // 2:老师
      3: ["analysis"], // 3:教务
    }[res.data.role];
    let roleId = ["admin", "student", "teacher", "dean"][res.data.role];
    let permissions = permissionList.map(per => {
      return {
        roleId,
        ...[
          {
            permissionId: "live",
            permissionName: "直播列表",
            dataAccess: null,
          },
          {
            permissionId: "analysis",
            permissionName: "直播统计",
            dataAccess: null,
          },
          {
            permissionId: "distinguish",
            permissionName: "人脸识别",
            dataAccess: null,
          },
          {
            permissionId: "logs",
            permissionName: "日志",
            dataAccess: null,
          },
        ].find(item => item.permissionId === per),
      };
    });
    return {
      status: 0,
      msg: "获取用户信息成功",
      result: {
        id: res.data.user_id,
        name: res.data.nick_name,
        username: roleId,
        avatar: "/avatar2.jpg",
        roleId: roleId,
        role: {
          id: roleId,
          name: ["管理员", "学生", "教师", "教务"][res.data.role],
          permissions: permissions,
          permissionList: permissionList,
        },
      },
    };
  });
}

export function getCurrentUserNav() {
  return request({
    url: userApi.UserMenu,
    method: "get",
  });
}

export function logout() {
  // return request({
  //   url: userApi.Logout,
  //   method: "post",
  //   headers: {
  //     "Content-Type": "application/json;charset=UTF-8",
  //   },
  // });
  return new Promise(resolve =>
    resolve({
      status: 0,
      msg: "[测试接口] 注销成功",
      data: {},
    })
  );
}

/**
 * get user 2step code open?
 * @param parameter {*}
 */
// export function get2step(parameter) {
//   return request({
//     url: userApi.twoStepCode,
//     method: "post",
//     data: parameter,
//   });
// }

/**
 * go to smart platform
 * @param parameter {*}
 */
export function toSmartPlatform() {
  return request({
    url: userApi.ToSmart,
    method: "get"
  });
}
