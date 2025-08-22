import { axios } from "@/utils/request";
// import { obj2arr, fileDownload, baseUrl, encodeRequest } from '@/utils/common'

export function prepareLivePage(liveId, userId = 1, username = "trendy") {
  return axios({
    url: `/getVolcLiveUrl`,
    params: { username, liveId },
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
