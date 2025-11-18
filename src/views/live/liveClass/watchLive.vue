<template>
  <div id="watchLivePage">
    <!-- 倒计时弹窗 -->
    <countdown-modal ref="countdownModal" v-if="countdownTimestamp" :countdownTimestamp="countdownTimestamp" @cutout="handleEnterLive" @countdown-finished="handleCountdownFinished" />

    <!-- <div class="volcLiveApp" v-if="mode === 'live'">
      <div v-if="role === 'student' && mode !== 'replay'">
        <camera-capture
          ref="cameraCapture"
          :user-id="1"
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
        <!-- TODO: 拍照接口调用，右侧iframe自动跳系统首页 -->
        <camera-capture
          ref="cameraCapture"
          :user-id="1"
          :live-config-id="liveConfigId"
          @photoCaptured="handlePhotoCaptured"
          @autoCaptureStarted="handleAutoCaptureStarted"
          @autoCaptureStopped="handleAutoCaptureStopped" />
      </div>
      <div style="flex: 1">
        <iframe :src="liveUrl" class="player-iframe" allow="fullscreen; clipboard-read *; clipboard-write *;"></iframe>
      </div>
    </div>
    <video-notes :vid="liveConfigId" :showEditor="role === 'student'" style="background-color: #fff" />
  </div>
</template>

<script>
import CameraCapture from "@/components/CameraCapture.vue";
import { prepareLivePage, prepareReplay, getLiveCountdownTime } from "@/api/livepage";
import VideoNotes from "@/components/VideoNotes.vue";
import { mapGetters } from "vuex";
import CountdownModal from "@/components/CountdownModal";
import RealNameCheckInModal from "@/components/RealNameCheckInModal.vue";

export default {
  name: "watchLive",
  components: {
    CameraCapture,
    VideoNotes,
    CountdownModal,
    RealNameCheckInModal,
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
    };
  },
  computed: {
    liveConfigId() {
      return +this.$route.params.liveConfigId;
    },
    mode() {
      return this.$route.query.mode || "live"; // "replay"
    },
    ...mapGetters(["roles"]),
    role() {
      // 从store中获取用户角色
      return this.roles.id || "student";
    },
  },
  mounted() {
    // this.mode === "live" ? this.initLive() :
    // DEBUG:
    // this.initReplay();
    // 显示倒计时弹窗
    this.showCountdownModal();
    // 学生端，真人签到弹窗
    console.log(this.role === "student" && this.mode === "live");
    this.role === "student" && this.mode === "live" && this.showCheckInModal();
  },
  methods: {
    initLive() {
      prepareLivePage(this.liveConfigId).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
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
      prepareReplay(this.liveConfigId).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        const { url } = res.data;
        this.liveUrl = url;
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
      // 这里可以调用接口获取倒计时时间
      getLiveCountdownTime(this.liveConfigId)
        .then(res => {
          this.countdownTimestamp = new Date().getTime() + 400000;
          // if (res.status) {
          //   this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          //   return;
          // }
          // this.countdownTimestamp = res.data;
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
      // 这里可以添加倒计时结束的处理逻辑
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
      // 这里可以添加实际的提交逻辑
      this.hideCheckInModal();
    },
  },
  destroyed() {
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
}
</style>
