<template>
  <div id="broadcastPage">
    <!-- 倒计时弹窗 -->
    <CountdownModal 
      ref="countdownModal" 
      v-if="countdownTimestamp && !countdownFinished" 
      :countdownTimestamp="countdownTimestamp" 
      @enter-live="handleEnterLive" 
      @countdown-finished="handleCountdownFinished"
      :z-index="1001"
    />
    <iframe v-if="broadcastUrl" :src="broadcastUrl" width="100%" height="100%" frameborder="0" scrolling="no" allow="microphone;camera;midi;encrypted-media;display-capture;"></iframe>
    <div v-else style="background-color: #fff; padding: 20px">
      <Empty :opt="{ description: errorMsg }" />
    </div>
  </div>
</template>

<script>
import { prepareBroadcast, getLiveCountdownTime } from "@/api/livepage";
import Empty from "@/components/Empty.vue";
import CountdownModal from "@/components/CountdownModal.vue";
import { mapGetters } from "vuex";

export default {
  name: "broadcast",
  components: { Empty, CountdownModal },
  data() {
    return {
      broadcastUrl: "",
      errorMsg: "",
      countdownTimestamp: 0,
      countdownFinished: false,
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
  },
  methods: {
    loadBroadcastData() {
      // 先获取倒计时时间
      getLiveCountdownTime(this.liveConfigId)
        .then(res => {
          if (res.status) {
            this.$message.error(res.msg || "获取直播信息失败，请稍后再试。");
            return;
          }
          
          // 如果返回了倒计时时间，则显示倒计时弹窗
          if (res.data && res.data > Date.now()) {
            this.countdownTimestamp = res.data;
            this.$refs.countdownModal.show();
            return;
          }
          
          // 如果没有倒计时或已过开播时间，直接加载开播页面
          this.loadBroadcastPage();
        })
        .catch(() => {
          // 获取倒计时失败，直接加载开播页面
          this.loadBroadcastPage();
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
    
    // 处理进入直播
    handleEnterLive() {
      this.loadBroadcastPage();
    },
    
    // 处理倒计时结束
    handleCountdownFinished() {
      this.countdownFinished = true;
      this.loadBroadcastPage();
    }
  },
};
</script>

<style lang="less" scoped>
#broadcastPage {
  width: 100%;
  height: 80vh;
}
</style>