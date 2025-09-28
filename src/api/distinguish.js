import { axios } from "@/utils/request";

export function getDistinguishList(params) {
  return axios({
    url: "/distinguishPage",
    params,
  });
}

export function getStudentAttendanceList(params) {
  return axios({
    url: `/livedistinguishPage/${params.live_id}`,
    params,
  });
}

// 获取学生照片
export function getStudentDetail(attendance_status_id, params) {
  return axios({
    url: "/studentRecordPage/" + attendance_status_id,
    method: "get",
    params,
  });
}

export function updateAttendanceState(attendance_status_id, status) {
  return axios({
    url: `/updateAttendanceState/${attendance_status_id}`,
    params: { status },
    method: "post",
  });
}

// 上传学生照片
export function uploadStudentPhoto(formData) {
  return axios({
    url: "/uploadStudentPhoto",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
}