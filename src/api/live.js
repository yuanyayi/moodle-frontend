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
 *
 */
export function getLiveMaps(list = ["liveStatus", "repeat", "semester", "course", "attendanceStatus"], id = 1, courseName = "") {
  const params = {};
  list.forEach(el => (params[el] = true));
  let p2 = undefined;
  if (list.includes("course")) {
    p2 = axios({
      url: `/selectCourse`,
      params: { name: courseName },
    });
  }
  return Promise.all([
    axios({
      url: `/mapping/${id}`,
      params,
    }),
    p2,
  ]).then(([r1, r2]) => {
    if (r1.status) {
      throw r1;
    }
    let res = r1;
    if (r2 && r2.data) {
      res.data.courseMap = r2.data;
    }
    let map = {};
    for (let k in res.data) {
      map[k] = obj2arr(res.data[k]);
    }
    return map;
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
