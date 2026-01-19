import { axios } from "@/utils/request";
import { fileDownload } from "@/utils/common";

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
      "Content-Type": "multipart/form-data",
    },
  });
}

export function downloadExcel(live_external_id) {
  return axios({
    url: `/downloadLivedistinguish/${live_external_id}`,
  }).then(res => {
    if (res.status) {
      this.$message.error(res.msg || "获取数据失败，请稍后再试。");
      return;
    }
    fileDownload(res.data.url);
  });
}

export function uploadFile(data){
  return axios({
    url: `/file/uploadFile`,
    method: "post",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export function studentAttendance(params){
  return axios({
    url: `/studentAttendance`,
    params,
  })
}

/**
 * 学生人脸识别记录列表接口
 */
export function getStudentDistinguishList(params){
  return axios({
    url: `/student/distinguishPage`,
    method: "get",
    params,
  })
}

/**
 * 学生信息记录接口
 */
export function getStudentRecordPage(attendance_status_id, params){
  return axios({
    url: `/student/studentRecordPage/${attendance_status_id}`,
    method: "get",
    params,
  })
}

// ---------- face record ---------- //
/**
 * 人脸识别记录列表接口
 */
export function fetchFaceRecordPage(params) {
  return axios({
    url: "/faceRecordPage",
    method: "get",
    params,
  });
}

/**
 * 人脸识别记录详情接口
 */
export function fetchFaceRecordDetail(id) {
  return axios({
    url: `/faceRecord/${id}`,
    method: "get",
  });
}

/**
 * 人脸识别详细记录列表接口
 */
export function fetchFaceRecognitionList(params) {
  return axios({
    url: "/faceRecognitionList",
    method: "get",
    params,
  });
}