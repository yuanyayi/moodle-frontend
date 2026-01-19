import { axios } from "@/utils/request";
import { obj2arr, fileDownload } from "@/utils/common";

// ---------- live log ---------- //
/**
 * 直播日志列表接口
 */
export function fetchLogs(params) {
  return axios({
    url: "/log/logPage",
    method: "get",
    params,
  });
}

/**
 * 学生日志列表 接口 对应学生日志页面
 */
export function fetchLogsByLive(live_config_id, params) {
  return axios({
    url: `/log/studentLogPage/${live_config_id}`,
    method: "get",
    params
  });
}

/**
 * 学生日志详情 接口 对应学生日志详情页面
 */
export function fetchOneLiveDetailByStudent(live_config_id, student_id) {
  return axios({
    url: `/log/studentLogDetail/${live_config_id}/${student_id}`,
    method: "get",
  });
}