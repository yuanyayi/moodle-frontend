import { axios } from "@/utils/request";
import { obj2arr } from "@/utils/common";

export function fetch1() {
  return axios({
    url: `/liveStatistics`,
  });
}

export function fetch2() {
  return axios({
    url: `/behaviorStatistics`,
  });
}

export function ciyun1() {
  return axios({
    url: `/teacherCommentStatistics`,
  });
}

export function ciyun2() {
  return axios({
    url: `/studentCommentStatistics`,
  });
}