import { axios } from "@/utils/request";
import { obj2arr } from "@/utils/common";

//  ---------- overall ---------- //
export function fetch1(liveConfigId) {
  return axios({
    url: `/liveStatistics${liveConfigId ? `/${liveConfigId}` : ""}`,
  });
}

export function fetch2(liveConfigId) {
  return axios({
    url: `/behaviorStatistics${liveConfigId ? `/${liveConfigId}` : ""}`,
  });
}

export function ciyun1(liveConfigId) {
  return axios({
    url: `/teacherCommentStatistics${liveConfigId ? `/${liveConfigId}` : ""}`,
  });
}

export function ciyun2(liveConfigId) {
  return axios({
    url: `/studentCommentStatistics${liveConfigId ? `/${liveConfigId}` : ""}`,
  });
}

// ---------- course ---------- //
/**
 * 直播统计列表接口
 */
export function fetchLiveStatPage(params) {
  return axios({
    url: "/liveStatPage",
    method: "get",
    params,
  });
}

/**
 * 获取映射数据（学期、课程等）
 */
export function getStatisticsMaps(list = ["semester", "course"], id = 1) {
  const params = {};
  list.forEach(el => (params[el] = true));

  return axios({
    url: `/mapping/${id}`,
    params,
  }).then(res => {
    if (res.status) {
      throw res;
    }
    let map = {};
    for (let k in res.data) {
      if (k == "semesterMap") {
        map[k] = obj2arr(res.data[k]).sort((e1, e2) => e2.value - e1.value);
      } else {
        map[k] = obj2arr(res.data[k]);
      }
    }
    return map;
  });
}

/**
 * 根据名称和学期ID获取课程列表
 */
export function getCourseList(semester_id = 0, courseName = "") {
  if (semester_id === 0) {
    return console.error("请给出学期范围。courseName:" + courseName + ",semester_id:" + semester_id);
  }

  return axios({
    url: `/selectCourse`,
    params: { name: courseName, semester_id },
  }).then(res => {
    if (res && res.data) {
      return { courseMap: obj2arr(res.data) };
    }
    return {};
  });
}
