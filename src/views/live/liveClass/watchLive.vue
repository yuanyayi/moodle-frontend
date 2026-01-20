<template>
  <div id="watchLivePage">
    <!-- 倒计时弹窗，仅在直播模式下显示 -->
    <CountdownModal ref="countdownModal" v-if="countdownTimestamp && mode === 'live'"
      :countdownTimestamp="countdownTimestamp" @cutout="handleEnterLive"
      @countdown-finished="handleCountdownFinished" />

    <!-- 真人签到弹窗，仅在直播模式且为学生角色时显示 -->
    <RealNameCheckInModal v-if="role === 'student' && mode === 'live'" :visible="checkInModalVisible" :user-id="userId"
      :live-config-id="liveConfigId" @submit="handleCheckInSubmit" @cancel="hideCheckInModal" />

    <!-- 设备测试弹窗，仅在直播模式且为学生角色时显示 -->
    <!-- <LiveDeviceTestModal v-if="role === 'student' && mode === 'live'" :visible="deviceTestModalVisible" @confirm="handleDeviceConfirm" @cancel="handleDeviceCancel" /> -->

    <!-- 主要内容区域 -->
    <!-- <div class="volcLiveApp" v-if="mode === 'live'">
      <div v-if="role === 'student' && mode !== 'replay'">
        <camera-capture
          ref="cameraCapture"
          :user-id="userId"
          :live-config-id="liveConfigId"
          @photoCaptured="handlePhotoCaptured"
          @autoCaptureStarted="handleAutoCaptureStarted"
          @autoCaptureStopped="handleAutoCaptureStopped" />
      </div>

      <div class="content">
        <div class="menu-top">
          <div id="player" class="player"></div>
          <div id="menu" class="menu"></div>
        </div>
        <div id="menu2" class="menu-bottom"></div>
      </div>
    </div> -->
    <div style="display: flex; flex-flow: row nowrap">
      <div v-if="role === 'student' && mode !== 'replay'" style="flex: 0 0 auto">
        <CameraCapture ref="cameraCapture" :user-id="userId" :live-config-id="liveConfigId"
          @photoCaptured="handlePhotoCaptured" @photoCaptureError="handlePhotoCaptureError"
          @autoCaptureStarted="handleAutoCaptureStarted" @autoCaptureStopped="handleAutoCaptureStopped"
          @autoCaptureError="handleAutoCaptureError" />

        <div style="text-align: center; font-size: 16px; padding: 20px 0">
          <div style="margin-bottom:10px"><a-button @click="goHome"><a-icon type="home"
                theme="filled" />返回直播平台</a-button></div>
          <span v-if="feedback.id && !feedback.handle" style="color: #f01c08"> 问题已反馈，等待处理 </span>
          <span v-if="feedback.id && feedback.handle" style="color: #44d0c8"> 问题已处理 </span>
          <a-button type="primary" ghost v-if="!feedback.id || feedback.handle" @click="handUp" style="width:138px"><a-icon type="message" />{{
            feedback.id ? "继续反馈"
              : "问题反馈" }}</a-button>
        </div>
      </div>
      <div style="flex: 1">
        <div class="player-header" v-if="mode === 'replay'">
          <div class="title">{{ replayDetail.name }}的回放</div>
          <div class="info">
            <span>观看人数:{{ replayDetail.view_number }}</span><span>点赞数：{{ replayDetail.like_number }}</span>
          </div>
        </div>
        <iframe :src="isCheckedIn && liveUrl" class="player-iframe"
          allow="fullscreen; clipboard-read *; clipboard-write *; camera; microphone;midi;"></iframe>
      </div>
    </div>
    <VideoNotes v-if="mode === 'replay'" :vid="liveConfigId" :showEditor="role === 'student'"
      style="background-color: #fff" />
  </div>
</template>

<script>
import CameraCapture from "@/components/CameraCapture.vue";
import { prepareLivePage2, prepareReplay, getLiveCountdownTime, handUp, getFeedbackResult } from "@/api/livepage";
import VideoNotes from "@/components/VideoNotes.vue";
import { mapGetters } from "vuex";
import CountdownModal from "@/components/CountdownModal";
import RealNameCheckInModal from "@/components/RealNameCheckInModal.vue";
import LiveDeviceTestModal from "@/components/LiveDeviceTestModal.vue";

export default {
  name: "watchLive",
  components: {
    CameraCapture,
    VideoNotes,
    CountdownModal,
    RealNameCheckInModal,
    LiveDeviceTestModal,
  },
  data() {
    return {
      activityId: "",
      liveUrl: "",
      liveToken: "",
      webSDK: null,
      content: "",
      countdownTimestamp: 0, // 默认倒计时时间
      isCheckInDialogVisible: false,
      formData: {
        name: "",
        studentId: "",
      },
      photoUrl: null,
      // 添加新组件的属性
      checkInModalVisible: false,
      deviceTestModalVisible: false, // 新增：设备测试弹窗可见性
      // 签到状态
      isCheckedIn: false,
      view_number: 0,
      replayDetail: {},
      feedback: {
        id: 0,
        handle: false,
      },
      feedbackPollTimer: null, // 轮询定时器
    };
  },
  computed: {
    liveConfigId() {
      return +this.$route.params.liveConfigId;
    },
    mode() {
      return this.$route.query.mode || "live"; // "replay"
    },
    ...mapGetters(["roles", "userInfo"]),
    role() {
      // 从store中获取用户角色
      return this.roles.id || "student";
    },
    userId() {
      // 从store中获取用户ID，转换为字符串
      return String(this.userInfo.id || "1"); // 转换为字符串类型，默认为"1"
    },
  },
  mounted() {
    this.mode === "live" ? this.initLive() : this.initReplay();
    // 仅在直播模式下显示倒计时弹窗
    if (this.mode === "live") {
      this.showCountdownModal();
    }
    // 学生端且在直播模式下
    if (this.role === "student" && this.mode === "live") {
      // 显示真人签到弹窗
      this.checkAndShowCheckInModal();
      // 刷新feedback ID
      this.handUp(true);
    }
    // 只有学生需要手动签到
    if (this.role !== "student" || this.mode === "replay") {
      this.isCheckedIn = true;
    }
  },
  methods: {
    initLive() {
      prepareLivePage2(this.liveConfigId, this.userId).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        const { activityId, viewUrl } = res.data;
        this.liveUrl = viewUrl;

        return;
        this.activityId = res.data.activityId;
        this.liveToken = res.data.liveToken;

        this.loadScript()
          .then(() => {
            var webSDK = new window.ByteLiveWebSDK({
              activityId: this.activityId,
              token: this.liveToken,
              service: "liveDemo",
              mode: 1,
              modules: [
                {
                  id: "player",
                  mode: "player",
                },
                {
                  id: "menu",
                  mode: "menu",
                  menu: ["comment", "imagetext", "cardlist"],
                },
                {
                  id: "menu2",
                  mode: "menu",
                  menu: ["bandcontent"],
                },
              ],
              options: {
                pcPlayerHeader: true,
                mobileBackgroundTransparent: true,
                saveUserInfo: true,
              },
            });
            webSDK.on("error", console.log);
            this.webSDK = webSDK;
          })
          .catch(err => {
            console.error("Failed to load script:", err);
          });
      });
    },
    initReplay() {
      prepareReplay(this.liveConfigId, this.userId).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        const { url } = res.data;
        this.liveUrl = url;
        this.replayDetail = res.data;
      });
    },
    loadScript() {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.id = "volcWebSDK";
        script.src = "https://mediaservice-fe.volccdn.com/obj/vcloud-fe/livesaas-client/pc/js/index.2.1.28.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    },

    // 摄像头事件处理
    handlePhotoCaptured(photoData) {
      console.log("照片已捕获:", photoData);
      // 更新照片URL
      this.photoUrl = photoData.url;
      // 触发上传
      this.uploadPhoto(photoData.url);
    },

    handleAutoCaptureStarted() {
      console.log("自动抓拍已开始");
    },

    handleAutoCaptureStopped() {
      console.log("自动抓拍已停止");
    },

    handlePhotoCaptureError(error) {
      console.error("拍照过程中发生错误:", error);
      // 只在控制台输出错误，不触发页面跳转
    },

    handleAutoCaptureError(error) {
      console.error("自动抓拍过程中发生错误:", error);
      // 只在控制台输出错误，不触发页面跳转
    },

    uploadPhoto(imageUrl) {
      // 模拟上传照片
      console.log("上传照片:", imageUrl);
      // 实际项目中这里应该调用上传API
    },
    // 编辑器内容变化监听
    handleContentChange(html) {
      console.log("编辑器内容变化:", html);
    },

    // 显示倒计时弹窗
    showCountdownModal() {
      // 仅在直播模式下显示倒计时
      if (this.mode !== "live") {
        return;
      }

      // 这里可以调用接口获取倒计时时间
      getLiveCountdownTime(this.liveConfigId)
        .then(res => {
          if (res.status) {
            this.$message.error(res.msg || "获取数据失败，请稍后再试。");
            return;
          }
          if (res.data <= new Date().getTime()) return;
          this.countdownTimestamp = res.data;
          this.$refs.countdownModal.show();
        })
        .catch(() => {
          // 出错时使用默认时间
          this.$refs.countdownModal.show();
        });
    },

    // 处理进入直播
    handleEnterLive() {
      console.log("用户点击了进入直播按钮");
      // 这里可以添加进入直播间的逻辑
    },

    // 处理倒计时结束
    handleCountdownFinished() {
      console.log("倒计时结束");
      // 倒计时结束后显示签到弹窗
      if (this.role === "student" && this.mode === "live") {
        this.checkAndShowCheckInModal();
      }
    },

    // 检查并显示签到弹窗
    checkAndShowCheckInModal() {
      // 检查页面内的签到状态
      if (!this.isCheckedIn) {
        // 未签到，显示签到弹窗
        this.showCheckInModal();
      }
      // 已签到则不显示弹窗
    },

    // 显示真人签到弹窗
    showCheckInModal() {
      this.checkInModalVisible = true;
    },

    // 隐藏真人签到弹窗
    hideCheckInModal() {
      this.checkInModalVisible = false;
    },

    // 处理提交
    handleCheckInSubmit(data) {
      console.log("收到签到数据:", data);
      // 更新页面内的签到状态
      this.isCheckedIn = true;
      // 这里可以添加实际的提交逻辑
      this.hideCheckInModal();
      // 签到完成后显示设备测试弹窗
      // this.showDeviceTestModal();
    },

    // 显示设备测试弹窗
    showDeviceTestModal() {
      this.deviceTestModalVisible = true;
    },

    // 处理设备测试确认
    handleDeviceConfirm(deviceInfo) {
      console.log("设备确认:", deviceInfo);
      this.deviceTestModalVisible = false;
      this.$message.success("设备测试完成！");
    },

    // 处理设备测试取消
    handleDeviceCancel() {
      console.log("设备测试取消");
      this.deviceTestModalVisible = false;
      this.$message.info("设备测试已取消");
    },
    handUp(obtain = false) {
      obtain = typeof obtain === "boolean" ? obtain : false;
      handUp(this.userId, this.liveConfigId, obtain).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        this.feedback.id = res.data;
        this.feedback.handle = false;

        // 如果有feedback.id且未处理，则启动轮询
        if (this.feedback.id) {
          this.startFeedbackPolling();
        }
      });
    },
    getFeedbackResult() {
      getFeedbackResult(this.userId, this.feedback.id).then(res => {
        if (!res.status) {
          this.feedback.handle = res.data;

          // 如果反馈已处理，则停止轮询
          if (this.feedback.handle) {
            this.stopFeedbackPolling();
          }
        }
      });
    },

    // 启动反馈轮询
    startFeedbackPolling() {
      // 先停止可能存在的轮询
      this.stopFeedbackPolling();

      this.getFeedbackResult();
      // 启动新的轮询，每分钟执行一次
      this.feedbackPollTimer = setInterval(() => {
        this.getFeedbackResult();
      }, 30000);
    },

    // 停止反馈轮询
    stopFeedbackPolling() {
      if (this.feedbackPollTimer) {
        clearInterval(this.feedbackPollTimer);
        this.feedbackPollTimer = null;
      }
    },

    goHome() {
      this.$router.push({ path: "/live/list" });
    }
  },
  destroyed() {
    // 组件销毁时停止轮询
    this.stopFeedbackPolling();
    this.webSDK && this.webSDK.destroy();
  },
};
</script>

<style lang="less" scoped>
#watchLivePage {
  font-size: 10px;
  margin: 0;
  // background-color: #080b12;
  height: 100vh;

  .volcLiveApp {
    background-image: url(//p6-live.byteimg.com/tos-cn-i-gjr78lqtd0/faa3e534621e30f31b5fd87bcd31a11d.jpg~tplv-gjr78lqtd0-image.image);
    background-size: 100% auto;
    background-repeat: no-repeat;
    height: 100%;
    width: 100%;
    flex: 1;
    display: flex;

    .content {
      width: 100%;
      min-width: 600px;
      // max-width: 1612px;
      margin: 0 auto;
      padding-top: 120px;
      padding-bottom: 80px;
    }

    .menu-top {
      width: 100%;
      display: flex;
    }

    .player {
      width: calc(100% - 282px);
      height: calc((90vw - 282px) / 16 * 9 + 55px);
      min-width: 640px;
      max-width: 1280px;
      min-height: 360px;
      max-height: 775px;
    }

    .menu {
      width: 270px;
      margin-left: 12px;
      height: calc((90vw - 282px) / 16 * 9 + 55px);
      max-height: 775px;
      min-height: 415px;
    }

    .menu-bottom {
      width: 100%;
      margin-top: 12px;
      height: calc(66vw + 100px);
      max-height: 1300px;
      min-height: 800px;
    }
  }

  .player-iframe {
    width: 100%;
    // height: calc(100vh - 202px);
    aspect-ratio: 16 / 10;
    min-height: 415px;
    border: none;
  }

  .player-header {
    background: #fff;
    font-size: 16px;
    padding: 5px 10px;

    span {
      margin-right: 1em;
    }

    .info {
      font-size: 14px;
      color: #a4a4a4;
    }
  }
}
</style>
