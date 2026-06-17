import { axios } from "@/utils/request";
import { obj2arr } from "@/utils/common";

/**
 * 获取助教配置列表（新接口）
 * GET /assistant/listPage
 *
 * @param {Object} params
 * @param {number} params.page
 * @param {number} params.pageSize
 * @param {number} params.semester_id - 学期
 * @param {string} params.course_id - 课程名称
 * @param {string} params.name - 助教名称
 */
export function fetchAssistantList(params) {
  return axios({
    url: "/assistant/listPage",
    method: "get",
    params,
  });
}

/**
 * 删除助教配置
 * POST /assistant/delete/{id}
 *
 * @param {number} id
 */
export function deleteAssistant(id) {
  return axios({
    url: `/assistant/delete/${id}`,
    method: "post",
  });
}

/**
 * 根据学期、课程获取教学班
 * GET /assistant/getJxb
 *
 * @param {Object} params
 * @param {number} params.semester_id
 * @param {string} params.course_id
 */
export function getJxb(params) {
  return axios({
    url: "/assistant/getJxb",
    method: "get",
    params,
  }).then(res => {
    res.data = res.data ? obj2arr(res.data) : [];
    return res;
  });
}

/**
 * 新增或修改助教配置
 * POST /assistant/saveOrUpdateAssistant
 *
 * @param {Object} params
 * @param {boolean} params.is_modify - 判断是否是修改
 * @param {number} [params.id]
 * @param {string} params.course_id - 课程id
 * @param {number} [params.semester_id] - 学期编码
 * @param {string} [params.assistant_teacher_id] - 助教id
 * @param {string} [params.jxb] - 教学班
 * @param {string} [params.jxb_name] - 教学班名称
 */
export function saveOrUpdateAssistant(params) {
  return axios({
    url: "/assistant/saveOrUpdateAssistant",
    method: "post",
    params,
  });
}

/**
 * 根据工号或姓名获取教师信息
 * GET /assistant/getTeacherInfo
 *
 * @param {Object} params
 * @param {string} params.query - 教师工号或姓名
 */
export function getTeacherInfo(params) {
  return axios({
    url: "/assistant/getTeacherInfo",
    method: "get",
    params,
  });
}
