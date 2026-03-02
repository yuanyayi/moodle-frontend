<template>
  <a-modal v-model="visible" title="悬浮视窗" :width="'400px'" :mask="false" :closable="true" :zIndex="1000"
    :bodyStyle="{ padding: 0, height: 'auto', }" :footer="null">
    <div class="player-content">
      <FlvPlayer v-if="videoUrl" ref="flvPlayerRef" :src="videoUrl" width="100%" height="100%" :autoplay="true"
        :muted="true" />
      <div v-else class="loading-placeholder">
        <a-spin />
        <p>正在加载视频...</p>
      </div>
    </div>

    <slot></slot>
  </a-modal>
</template>

<script>
import FlvPlayer from "./FlvPlayer.vue";
import { getPutStreamUrl } from "@/api/livepage";

export default {
  name: "FloatingVideoPlayer",
  components: {
    FlvPlayer,
  },
  props: {
    // 直播配置ID，用于从后端获取视频地址
    liveConfigId: {
      type: [Number, String],
      required: true,
    },
    open: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isMinimized: false,
      visible: false,
      videoUrl: "",
      dragState: {
        isDragging: false,
        startX: 0,
        startY: 0,
        startRight: 0,
        startTop: 0,
      },
    };
  },
  watch: {
    open: {
      immediate: true,
      async handler(newVal) {
        this.visible = newVal;
        if (newVal) {
          await this.loadVideoUrl();
        }
      },
    },
  },
  async mounted() {
    // 监听页面可见性变化
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  },
  beforeDestroy() {
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);

    // 在组件销毁时停止视频播放
    if (this.$refs.flvPlayerRef) {
      this.$refs.flvPlayerRef.pause();
    }
  },
  methods: {
    async loadVideoUrl() {
      try {
        // 使用正确的API接口获取视频地址
        const response = await getPutStreamUrl(this.liveConfigId);
        if (response && response.data) {
          this.videoUrl = response.data;
          // this.videoUrl =
          //   "https://pull-hs-f5.flive.zebracdn.com/rtmlive/stream-118546170669695760.flv?major_anchor_level=common&rtm_expr_tag=empty_device_type&t_id=000-2025122316384644F92F9B0AFD003FBFE6-HQ4Cok&unique_id=stream-118546170669695760_784_flv&livesaas_sign=DgSotXGzA15p6mv7xHaqB8b6lJU5PKVvZJz7nu4L3DROqQyFxKofUzHGC3tZ5uAbKrBCWfCAqf3L18KCXqrHag==&session_id=2025122316384644F92F9B0AFD003FBFE6";
        } else {
          console.error("未获取到视频地址");
        }
      } catch (error) {
        console.error("加载视频地址失败:", error);
      }
    },

    toggleMinimize() {
      this.isMinimized = !this.isMinimized;
    },

    closePlayer() {
      // 在关闭前停止视频播放
      if (this.$refs.flvPlayerRef) {
        this.$refs.flvPlayerRef.pause();
      }
      this.$emit("close");
    },



    // 处理页面可见性变化 - 确保页面进入后台时继续播放
    async handleVisibilityChange() {
      console.log("visibilitychange,hidden: " + document.hidden);
      // 只有当页面从不可见变为可见时，才尝试播放视频
      if (!document.hidden && this.$refs.flvPlayerRef) {
        await this.loadVideoUrl();
        this.$nextTick(() => {
          // 尝试播放视频，当页面回到前台时恢复播放
          this.$refs.flvPlayerRef.play();
        });
      }
    },
  },
};
</script>

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.header-controls {
  display: flex;
}

.control-btn {
  margin-left: 10px;
  cursor: pointer;
  font-size: 12px;
  width: 18px;
  text-align: center;
  line-height: 18px;
  height: 18px;
  border-radius: 2px;
}

.control-btn:hover {
  background: #e6e6e6;
}

.player-content {
  height: auto;
  margin: 8px 20px;
  border-radius: 12px;
  overflow: hidden;
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  font-size: 14px;
}

/* 调整a-modal的样式 */
:deep(.ant-modal-header) {
  padding: 10px 24px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.ant-modal-content) {
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
