<template>
  <div class="feedback-float-window" v-if="visible">
    <div class="window-content">
      <div class="window-header">
        <h3>问题反馈</h3>
        <a-icon type="close" @click="close" class="close-icon" />
      </div>
      <div class="window-body">
        <div class="feedback-status">
          <span v-if="feedback.id && !feedback.handle" style="color: #f01c08"> 问题已反馈，等待处理 </span>
          <span v-if="feedback.id && feedback.handle" style="color: #44d0c8"> 问题已处理 </span>
        </div>
        <div class="feedback-button">
          <a-button type="primary" ghost v-if="!feedback.id || feedback.handle" @click="handUp(1)" style="width: 138px; margin-bottom: 10px"><a-icon type="message" />听不到声音</a-button>
          <a-button type="primary" ghost v-if="!feedback.id || feedback.handle" @click="handUp(2)" style="width: 138px"><a-icon type="message" />看不到共享屏幕画面</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FeedbackFloatWindow",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    feedback: {
      type: Object,
      default: () => ({ id: 0, handle: false }),
    },
  },
  methods: {
    close() {
      this.$emit("close");
    },
    handUp(type) {
      this.$emit("handUp", type);
    },
  },
};
</script>

<style lang="less" scoped>
.feedback-float-window {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 300px;

  .window-content {
    padding: 20px;

    .window-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }

      .close-icon {
        cursor: pointer;
        font-size: 16px;
        color: #999;

        &:hover {
          color: #666;
        }
      }
    }

    .window-body {
      text-align: center;

      .feedback-status {
        margin-bottom: 20px;
        font-size: 14px;
      }

      .feedback-button {
        margin-top: 10px;
      }
    }
  }
}
</style>
