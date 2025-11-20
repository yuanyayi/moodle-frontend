<template>
  <a-modal title="倒计时" :visible="visible" :footer="null" :closable="false" :maskClosable="false" width="300px" :z-index="1001">
    <div class="countdown-container">
      <div class="countdown-display">
        <div class="countdown-label">距离直播开始还有</div>
        <!-- <span class="time">{{ formatTime(hours) }}</span>
        <span class="separator">:</span> -->
        <span class="time">{{ formatTime(minutes) }}</span>
        <span class="separator">:</span>
        <span class="time">{{ formatTime(seconds) }}</span>
      </div>
      <div class="countdown-footer">
        <a-button type="primary" @click="cutoutCounter"> 进入直播 </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: "CountdownModal",
  props: {
    countdownTimestamp: {
      type: Number,
      default: null,
      required: false,
    },
  },
  data() {
    return {
      visible: false,
      hours: 0,
      minutes: 0,
      seconds: 0,
      timer: null,
      countdownFinished: false,
    };
  },
  watch: {
    countdownTimestamp: {
      handler(newValue) {
        this.visible === true && this.startCountdown();
      },
      immediate: true,
    },
  },
  methods: {
    show() {
      // 确保组件显示之前重置状态
      this.countdownFinished = false;
      this.visible = true;
      this.startCountdown();
    },

    hide() {
      this.visible = false;
      this.stopCountdown();
    },

    startCountdown() {
      this.stopCountdown(); // 先清除可能存在的定时器

      // 在开始新的倒计时前先计算一次时间
      this.calculateRemainingTime();

      // 只有在倒计时尚未结束时才启动定时器
      if (!this.countdownFinished) {
        this.timer = setInterval(() => {
          this.calculateRemainingTime();
        }, 1000);
      }
    },

    calculateRemainingTime() {
      // 如果没有提供倒计时时间，则默认30分钟后结束
      const targetTime = this.countdownTimestamp;
      const now = Date.now();
      const remaining = targetTime - now;

      if (remaining <= 0) {
        console.error("时间差错误。" + targetTime + "---" + now);
        // 倒计时结束
        this.stopCountdown();
        this.countdownFinished = true;
        this.hide();
        this.$emit("countdown-finished");
        return;
      }

      // 计算剩余的小时、分钟、秒
      const totalSeconds = Math.floor(remaining / 1000);
      this.hours = Math.floor(totalSeconds / 3600);
      this.minutes = Math.floor((totalSeconds % 3600) / 60);
      this.seconds = totalSeconds % 60;
    },

    stopCountdown() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },

    cutoutCounter() {
      this.hide();
      this.$emit("cutout");
    },

    formatTime(time) {
      return time < 10 ? `0${time}` : time;
    },
  },

  beforeDestroy() {
    this.stopCountdown();
  },
};
</script>

<style scoped>
.countdown-container {
  text-align: center;
  padding: 20px;
}

.countdown-display {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 10px;
  font-family: "Courier New", monospace;
}

.time {
  display: inline-block;
  width: 60px;
}

.separator {
  margin: 0 5px;
}

.countdown-label {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.countdown-footer {
  margin-top: 20px;
}
</style>
