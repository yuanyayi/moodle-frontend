<template>
  <div v-if="visible" class="floating-video-player" :style="playerStyle">
    <div class="player-header" @mousedown="startDrag">
      <div class="header-title">悬浮视窗</div>
      <div class="header-controls">
        <div class="control-btn" @click="closePlayer">×</div>
      </div>
    </div>
    <div class="player-content">
      <FlvPlayer v-if="videoUrl" ref="flvPlayerRef" :src="videoUrl" width="100%" height="100%" :autoplay="true"
        :muted="true" />
      <div v-else class="loading-placeholder">
        <a-spin />
        <p>正在加载视频...</p>
      </div>
    </div>

    <slot></slot>
  </div>
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
      visible: false,
      videoUrl: "",
      position: {
        right: 20,
        bottom: 20,
      },
      isDragging: false,
      dragOffset: {
        x: 0,
        y: 0,
      },
    };
  },
  computed: {
    playerStyle() {
      return {
        position: 'fixed',
        width: '400px',
        right: `${this.position.right}px`,
        bottom: `${this.position.bottom}px`,
        zIndex: 1000,
      };
    },
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
  mounted() {
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.stopDrag);
  },
  beforeDestroy() {
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);

    if (this.$refs.flvPlayerRef) {
      this.$refs.flvPlayerRef.pause();
    }
  },
  methods: {
    startDrag(e) {
      this.isDragging = true;
      this.dragOffset.x = e.clientX;
      this.dragOffset.y = e.clientY;
    },
    onDrag(e) {
      if (!this.isDragging) return;

      const deltaX = this.dragOffset.x - e.clientX;
      const deltaY = this.dragOffset.y - e.clientY;

      this.position.right += deltaX;
      this.position.bottom += deltaY;

      this.dragOffset.x = e.clientX;
      this.dragOffset.y = e.clientY;

      // 限制在屏幕范围内
      this.position.right = Math.max(0, Math.min(this.position.right, window.innerWidth - 400));
      this.position.bottom = Math.max(0, Math.min(this.position.bottom, window.innerHeight - 300));
    },
    stopDrag() {
      this.isDragging = false;
    },
    async loadVideoUrl() {
      try {
        const response = await getPutStreamUrl(this.liveConfigId);
        if (response && response.data) {
          this.videoUrl = response.data;
        } else {
          console.error("未获取到视频地址");
        }
      } catch (error) {
        console.error("加载视频地址失败:", error);
      }
    },
    closePlayer() {
      if (this.$refs.flvPlayerRef) {
        this.$refs.flvPlayerRef.pause();
      }
      this.$emit("close");
    },
    async handleVisibilityChange() {
      console.log("visibilitychange,hidden: " + document.hidden);
      if (!document.hidden && this.$refs.flvPlayerRef) {
        await this.loadVideoUrl();
        this.$nextTick(() => {
          this.$refs.flvPlayerRef.play();
        });
      }
    },
  },
};
</script>

<style scoped>
.floating-video-player {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #f0f2f5;
  border-bottom: 1px solid #d9d9d9;
  cursor: move;
  user-select: none;
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
  font-size: 16px;
  width: 20px;
  text-align: center;
  line-height: 20px;
  height: 20px;
  border-radius: 2px;
  color: #666;
}

.control-btn:hover {
  background: #e6e6e6;
  color: #333;
}

.player-content {
  margin: 16px;
  overflow: hidden;
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}
</style>
