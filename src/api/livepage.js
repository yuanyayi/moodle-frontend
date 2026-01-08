// 火山直播接口

import { axios } from "@/utils/request";
// import { obj2arr, fileDownload, baseUrl, encodeRequest } from '@/utils/common'

export function prepareLivePage2(liveConfigId, userId = "1", username = "trendy") {
  return axios({
    url: `/getVolcLiveUrl`,
    params: { username, liveConfigId },
  });
}

export function prepareLivePage(liveConfigId, userId = "1", username = "trendy") {
  return axios({
    url: `/getVolcLiveUrl`,
    params: { username, liveConfigId },
  }).then(res => {
    if (res.status) {
      this.$message.error(res.msg || "获取数据失败，请稍后再试。");
      return res;
    }
    const { activityId, viewUrl } = res.data;
    return axios({
      url: `/getVolcSdkToken`,
      params: { userId, activityId },
    }).then(res2 => {
      if (res2.status) {
        this.$message.error(res.msg || "获取数据失败，请稍后再试。");
        return res2;
      }
      return {
        ...res2,
        data: {
          activityId,
          liveUrl: viewUrl,
          liveToken: res2.data,
        },
      };
    });
  });
}

export function prepareBroadcast(liveConfigId, userId = "1", username = "trending") {
  return axios({
    url: `/broadcastUrl`,
    params: { liveConfigId, userId, username },
  });
}

export function getReplayList(liveConfigId) {
  return axios({
    url: `/liveRecordPage/${liveConfigId}`,
  });
}
export function prepareReplay(liveId, userId = "1", username = "trending") {
  return axios({
    url: `/liveRecordDetail/${liveId}`,
    params: { liveId, userId, username },
  });
}

export function renameLiveRecord(id, name) {
  return axios({
    url: `/renameLiveRecord/${id}`,
    params: { name },
    method: "post",
  });
}

export function deleteLiveRecord(id) {
  return axios({
    url: `/deleteLiveRecord/${id}`,
    method: "post",
  });
}

export function updateOpen(liveRecordId, open) {
  return axios({
    url: `/${liveRecordId}/updateOpen`,
    method: "post",
    params: { open },
  });
}

export function getLiveCountdownTime(id) {
  return axios({
    url: `/nextLiveTime/${id}`,
  });
}

export function getPutStreamUrl(liveConfigId) {
  return axios({
    url: `/pullStreamUrl/`,
    params: { liveConfigId },
  });
}
/**
 * For teacher
 * @param {Int} liveConfigId
 * @param {Object} params
 * @returns
 */
export function getFeedbackList(liveConfigId, params) {
  return axios({
    url: `/feedback/page`,
    params: { liveConfigId, ...params },
  });
}

/**
 * For teacher
 * @param {*} id
 * @returns
 */
export function handleFeedback(id) {
  return axios({
    url: `/feedback/handle`,
    params: { id },
  });
}

/**
 * For student
 * @param {*} userId
 * @param {*} liveConfigId
 * @returns
 */
export function handUp(userId, liveConfigId) {
  return axios({
    url: `/feedback/submit`,
    params: { userId, liveConfigId },
  });
}

/**
 * For student
 */
export function getFeedbackResult(userId, id) {
  return axios({
    url: `/feedback/result`,
    params: { userId, id },
  });
}
