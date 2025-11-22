import { axios } from "@/utils/request";
import { obj2arr, fileDownload } from "@/utils/common";

export function downloadExcel() {
  return axios({
    url: `/log/downloadLiveUserLog`,
  }).then(res => {
    res.data?.url && fileDownload(res.data?.url);
  });
}

export function getLogs(params) {
  return axios({
    url: `/log/logPage`,
    params,
  });
}
