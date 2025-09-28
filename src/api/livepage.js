// 火山直播接口

import { axios } from "@/utils/request";
// import { obj2arr, fileDownload, baseUrl, encodeRequest } from '@/utils/common'

export function prepareLivePage(liveConfigId, userId = 1, username = "trendy") {
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

export function prepareBroadcast(liveConfigId, userId = 1, username = "trendy") {
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
export function prepareReplay(liveId, userId = 1, username = "trendy") {
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

export function deleteLiveRecord(id){
  return axios({
    url: `/deleteLiveRecord/${id}`,
    method: "post",
  })
}
