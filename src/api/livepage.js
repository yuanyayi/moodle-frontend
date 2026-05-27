// 火山直播接口

import { axios } from "@/utils/request";
// import { obj2arr, fileDownload, baseUrl, encodeRequest } from '@/utils/common'

export function prepareAssitantLive(liveConfigId) {
  return axios({
    url: `/assistantUrl`,
    params: { liveConfigId },
  });
}

/**
 * 助播上报接口
 * 使用 setInterval 实现心跳，确保即使切换标签页也能持续发送
 * @param {number} liveConfigId - 直播配置ID
 * @param {number} ts - 时间戳
 */

// 心跳定时器管理
const heartbeatTimers = new Map();
const HEARTBEAT_INTERVAL = 60000; // 60秒间隔

// 发送单次心跳请求
function sendHeartbeatRequest(liveConfigId) {
  console.log('Sending heartbeat for liveConfigId:', liveConfigId, 'at:', new Date().toLocaleString());
  return axios({
    url: `/assistant/heartbeat/${liveConfigId}`,
    method: "post",
    params: { ts: Date.now() },
  });
}

// 启动心跳循环
function startHeartbeatLoop(liveConfigId) {
  console.log('Starting heartbeat loop for liveConfigId:', liveConfigId);
  
  // 如果已有心跳在运行，不再重复启动
  if (heartbeatTimers.has(liveConfigId)) {
    console.log('Heartbeat already running for liveConfigId:', liveConfigId);
    return;
  }
  
  // 立即发送第一次心跳
  sendHeartbeatRequest(liveConfigId).catch(err => {
    console.error('Heartbeat failed:', err);
  });
  
  // 使用 setInterval 定时发送心跳
  const timerId = setInterval(() => {
    sendHeartbeatRequest(liveConfigId).catch(err => {
      console.error('Heartbeat failed:', err);
    });
  }, HEARTBEAT_INTERVAL);
  
  // 保存定时器ID以便取消
  heartbeatTimers.set(liveConfigId, timerId);
}

export function assistantHeartbeat(liveConfigId) {
  console.log("assistantHeart called for liveConfigId:", liveConfigId, Date.now());
  
  // 启动心跳循环（幂等操作，多次调用不会重复启动）
  startHeartbeatLoop(liveConfigId);
  
  // 同时发送一次即时心跳
  return sendHeartbeatRequest(liveConfigId);
}

/**
 * 停止心跳
 */
export function stopHeartbeat(liveConfigId) {
  const timerId = heartbeatTimers.get(liveConfigId);
  if (timerId) {
    clearInterval(timerId);
    console.log('Stopped heartbeat for liveConfigId:', liveConfigId);
  }
  heartbeatTimers.delete(liveConfigId);
}

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
    method: "post",
    params: { id },
  });
}

/**
 * For student
 * @param {*} userId
 * @param {*} liveConfigId
 * @param {*} type 问题类型：1-听不到声音，2-看不到共享屏幕画面
 * @returns
 */
export function handUp(userId, liveConfigId, type = 0, obtain = false) {
  return axios({
    url: `/feedback/submit`,
    method: "post",
    params: { userId, liveConfigId, type, obtain },
  });
}

/**
 * For student
 */
export function getFeedbackResult(userId, id) {
  return axios({
    url: `/feedback/result`,
    method: "post",
    params: { userId, id },
  });
}
