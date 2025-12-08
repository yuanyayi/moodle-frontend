import { axios } from "@/utils/request";
import { obj2arr } from "@/utils/common";

/**
 * ConfigList
 */
export function fetchLiveList(params) {
  return axios({
    url: `/liveConfigPage`,
    params,
  });
}

/**
 * 获取映射数据
 */
export function getLiveMaps(list = ["liveStatus", "repeat", "semester", "attendanceStatus"], id = 1) {
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

export function getLiveConfigDetail(id) {
  return axios({
    url: `/liveConfigDetail/${id}`,
  });
}
export function fetchLiveReplayList(liveConfigId, params) {
  return axios({
    url: `/liveRecordPage/${liveConfigId}`,
    params,
  });
}

export function createLiveConfig(params) {
  return axios({
    url: `/liveConfig`,
    method: "post",
    params,
  });
}

export function removeLiveConfig(id) {
  return axios({
    url: `/deleteLiveConfig/${id}`,
    method: "post",
  });
}

export function removeLiveRecord(id) {
  return axios({
    url: `/deleteLiveRecord/${id}`,
    method: "post",
  });
}

export function getVideoNoteList(liveRecordId, params = {}) {
  return axios({
    url: `/${liveRecordId}/getNotes`,
    params,
  });
}

export function createVideoNote(liveRecordId, note) {
  return axios({
    url: `/${liveRecordId}/addNote`,
    params: { note },
    method: "post",
  });
}

export function getSummary(liveRecordId) {
  return axios({
    url: `/${liveRecordId}/summary`,
  });
}

export function prepareSummary(liveRecordId) {
  return axios({
    url: `/${liveRecordId}/prepareSummary`,
  });
}
