<template>
  <div
    class="floating-video-player"
    :style="{
      right: `${position.right}px`,
      top: `${position.top}px`,
      width: isMinimized ? '200px' : '400px',
      height: isMinimized ? '30px' : '300px',
      zIndex: zIndex,
    }">
    <div class="player-header" @mousedown="startDrag" @dblclick="toggleMinimize">
      <span class="header-title">视频播放器</span>
      <div class="header-controls">
        <span @click="toggleMinimize" class="control-btn">{{ isMinimized ? "□" : "—" }}</span>
        <span @click="closePlayer" class="control-btn">×</span>
      </div>
    </div>

    <div v-show="!isMinimized" class="player-content">
      <FlvPlayer v-if="videoUrl" ref="flvPlayerRef" :src="videoUrl" width="100%" height="100%" :autoplay="true" :muted="true" />
      <div v-else class="loading-placeholder">
        <a-spin />
        <p>正在加载视频...</p>
      </div>
    </div>
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
  },
  data() {
    return {
      isMinimized: false,
      position: {
        right: 20,
        top: 100,
      },
      zIndex: 1000,
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
  async mounted() {
    // 组件挂载时获取视频地址
    await this.loadVideoUrl();

    document.addEventListener("mousemove", this.handleDrag);
    document.addEventListener("mouseup", this.stopDrag);
  },
  beforeDestroy() {
    document.removeEventListener("mousemove", this.handleDrag);
    document.removeEventListener("mouseup", this.stopDrag);
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
      this.$emit("close");
    },

    startDrag(event) {
      this.dragState.isDragging = true;
      this.dragState.startX = event.clientX;
      this.dragState.startY = event.clientY;
      this.dragState.startRight = this.position.right;
      this.dragState.startTop = this.position.top;
      this.zIndex = 9999; // 拖拽时提高层级
    },
    handleDrag(event) {
      if (!this.dragState.isDragging) return;

      const deltaX = event.clientX - this.dragState.startX;
      const deltaY = event.clientY - this.dragState.startY;

      // 修复：鼠标移动方向与元素移动方向应保持一致
      // 当鼠标向下移动时（deltaY > 0），元素也应该向下移动（top 值增大）
      // 当鼠标向右移动时（deltaX > 0），由于使用的是 right 属性，元素应向左移动（right 值增大）
      this.position.top = this.dragState.startTop + deltaY;
      this.position.right = this.dragState.startRight - deltaX;
    },
    stopDrag() {
      this.dragState.isDragging = false;
      this.zIndex = 1000;
    },
  },
};
</script>

<style scoped>
.floating-video-player {
  position: fixed;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: #fff;
  overflow: hidden;
  transition: width 0.3s ease, height 0.3s ease;
}

.player-header {
  height: 30px;
  background: #f0f2f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  cursor: move;
  user-select: none;
  border-bottom: 1px solid #d9d9d9;
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
  height: 100%;
  padding: 5px;
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
