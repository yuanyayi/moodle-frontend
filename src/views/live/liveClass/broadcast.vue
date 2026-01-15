<template>
  <div id="broadcastPage">
    <!-- <div style="flex: 0 0 auto"> -->
    <!-- 固定位置的悬浮视频播放器 -->
    <!-- <FloatingVideoPlayer :liveConfigId="liveConfigId" positionOpt="relative" /> -->
    <!-- 反馈提醒 -->
    <!-- <FeedbackReminder :liveConfigId="liveConfigId" style="margin-top: 20px" /> -->
    <!-- </div> -->
    <div style="flex: 1">
      <iframe
        v-if="broadcastUrl"
        :src="broadcastUrl"
        width="100%"
        height="100%"
        style="min-height: 100vh; min-width: 100vh"
        frameborder="0"
        scrolling="no"
        allow="microphone;camera;midi;encrypted-media;display-capture;fullscreen; clipboard-read *; clipboard-write *; "></iframe>
      <div v-else style="background-color: #fff; padding: 20px">
        <Empty :opt="{ description: errorMsg }" />
      </div>
    </div>

    <!-- 悬浮视窗 -->
    <FloatingVideoPlayer v-show="showFloatingPlayer" :open="showFloatingPlayer" :liveConfigId="liveConfigId" @close="showFloatingPlayer = false">
      <FeedbackReminder :liveConfigId="liveConfigId" style="margin-top: 20px" @count-change="handleFeedbackCountChange" />
    </FloatingVideoPlayer>

    <!-- 显示悬浮视窗的按钮 -->
    <div class="floating-player-toggle">
      <a-button type="primary" shape="circle" @click="openFloatingPlayer" :style="{ position: 'fixed', right: '20px', top: '50px', zIndex: 999, width: '52px', height: '52px', lineHeight: '52px' }">
        <a-badge :dot="feedbackCount - readedFeedbackCount > 0" :offset="[5, -2]" :numberStyle="{ width: '10px', height: '10px' }">
          <a-icon :component="nav06" :style="{ fontSize: '32px', verticalAlign: 'middle' }" />
        </a-badge>
      </a-button>
    </div>

    <!-- 倒计时弹窗 -->
    <CountdownModal ref="countdownModal" :countdownTimestamp="countdownTimestamp" />
  </div>
</template>

<script>
import { prepareBroadcast, getLiveCountdownTime } from "@/api/livepage";
import Empty from "@/components/Empty.vue";
import CountdownModal from "@/components/CountdownModal.vue";
import { mapGetters } from "vuex";
import FloatingVideoPlayer from "@/components/FloatingVideoPlayer.vue"; // 导入悬浮播放器组件
import FeedbackReminder from "@/components/FeedbackReminder.vue";
import { nav06 } from "@/core/icons";

export default {
  name: "broadcast",
  components: {
    Empty,
    CountdownModal,
    FloatingVideoPlayer,
    FeedbackReminder,
  },
  data() {
    return {
      broadcastUrl: "",
      errorMsg: "",
      countdownTimestamp: 0,
      countdownFinished: false,
      // 悬浮播放器相关
      showFloatingPlayer: false,
      nav06,
      feedbackCount: 0, // 总反馈数
      readedFeedbackCount: 0, // 已读反馈数
    };
  },
  computed: {
    liveConfigId() {
      return this.$route.params.liveConfigId;
    },
    ...mapGetters(["userInfo"]),
    userId() {
      // 从store中获取用户ID
      return String(this.userInfo.id || "1"); // 转换为字符串类型，默认为"1"
    },
  },
  mounted() {
    this.loadBroadcastData();
    this.loadBroadcastPage();
  },
  methods: {
    loadBroadcastData() {
      // 先获取倒计时时间
      getLiveCountdownTime(this.liveConfigId).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取直播信息失败，请稍后再试。");
          return;
        }

        // 如果返回了倒计时时间，则显示倒计时弹窗
        if (res.data && res.data > Date.now()) {
          this.countdownTimestamp = res.data;
          this.$nextTick(this.$refs.countdownModal.show);
          return;
        }
      });
    },

    loadBroadcastPage() {
      prepareBroadcast(this.liveConfigId, this.userId).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          this.errorMsg = res.msg || "获取数据失败，请稍后再试。";
          return;
        }
        this.broadcastUrl = res.data;
      });
    },

    // 处理反馈计数变化
    handleFeedbackCountChange(totalCount) {
      this.feedbackCount = totalCount;
    },

    // 当打开悬浮窗口时，将未读反馈计数设置为0（表示全部视为已读）
    openFloatingPlayer() {
      this.showFloatingPlayer = true;
      this.readedFeedbackCount = this.feedbackCount;
    },
  },
};
</script>

<style lang="less" scoped>
#broadcastPage {
  width: 100%;
  height: 80vh;
  display: flex;
  flex-flow: row nowrap;

  .floating-player-toggle {
    position: fixed;
    right: 20px;
    top: 50px;
    z-index: 999;
  }
}
</style>
