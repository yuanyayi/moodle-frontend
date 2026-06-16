import { axios } from "@/utils/request";

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
 * 获取助教数据列表（原接口，保留备用）
 * POST /assistant/dataPage
 * 
 * @param {Object} params
 * @param {number} params.page
 * @param {number} params.pageSize
 * @param {number} params.semester_id
 * @param {string} params.course_id
 * @param {number} params.start_time_begin
 * @param {number} params.start_time_stop
 */
export function fetchAssistantListOld(params) {
  return axios({
    url: "/assistant/dataPage",
    method: "post",
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