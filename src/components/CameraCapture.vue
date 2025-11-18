<template>
  <div class="camera-capture-component">
    <div id="distinguishBox" class="distinguish-box">
      <div class="camera-section">
        <h3 class="section-title">摄像头采集</h3>

        <!-- 摄像头预览区域 -->
        <div class="camera-container">
          <video ref="cameraVideo" class="camera-video" autoplay muted></video>

          <!-- 摄像头状态覆盖层 -->
          <div v-if="cameraStatus !== 'ready'" class="camera-overlay">
            <div class="status-content">
              <div v-if="cameraStatus === 'loading'" class="loading">
                <div class="spinner"></div>
                <p>正在启动摄像头...</p>
              </div>
              <div v-else-if="cameraStatus === 'error'" class="error">
                <i class="fa fa-exclamation-circle text-red-500 text-2xl"></i>
                <p>摄像头启动失败</p>
                <button @click="onRetryClick" class="retry-btn">重试</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div v-if="false" class="control-buttons">
          <button v-if="cameraStatus === 'ready'" @click="capturePhoto" class="capture-btn">抓拍</button>
          <button v-if="cameraStatus === 'ready'" @click="toggleAutoCapture" :class="['auto-capture-btn', { active: isAutoCapturing }]">
            {{ isAutoCapturing ? "停止自动抓拍" : "开始自动抓拍" }}
          </button>
        </div>

        <!-- 抓拍照片预览 -->
        <div v-if="false && capturedPhotos.length > 0" class="photos-preview">
          <h4 class="photos-title">抓拍记录</h4>
          <div class="photos-grid">
            <div v-for="(photo, index) in capturedPhotos" :key="index" class="photo-item">
              <img :src="photo.url" :alt="`抓拍照片 ${index + 1}`" />
              <div class="photo-info">{{ photo.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏的canvas用于抓拍 -->
    <canvas ref="captureCanvas" class="hidden"></canvas>
  </div>
</template>

<script>
import { uploadStudentPhoto } from "@/api/distinguish";
export default {
  name: "CameraCapture",
  props: {
    userId: {
      type: Number,
      required: true,
    },
    liveConfigId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      // 摄像头相关数据
      cameraStatus: "loading", // loading, ready, error
      isAutoCapturing: false,
      autoCaptureInterval: null,
      capturedPhotos: [],
      photoCount: 0,
      AUTO_CAPTURE_INTERVAL: 300000, // 5分钟自动抓拍间隔
    };
  },
  async mounted() {
    await this.initCamera();
    // 组件加载完成后启动自动抓拍

    this.startAutoCapture();
    console.log("ready");
  },
  beforeDestroy() {
    this.stopAutoCapture();
    this.stopCamera();

    // 清理所有 blob URLs
    this.capturedPhotos.forEach(photo => {
      if (photo.url.startsWith("blob:")) {
        URL.revokeObjectURL(photo.url);
      }
    });
  },
  methods: {
    // 摄像头相关方法
    async initCamera() {
      this.cameraStatus = "loading";

      // 清理之前可能存在的流
      this.stopCamera();

      try {
        // 先检查是否有权限
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        });

        if (this.$refs.cameraVideo) {
          this.$refs.cameraVideo.srcObject = stream;
          this.cameraStatus = "ready";

          // 设置canvas尺寸
          const setCanvasDimensions = () => {
            if (this.$refs.captureCanvas && this.$refs.cameraVideo) {
              this.$refs.captureCanvas.width = this.$refs.cameraVideo.videoWidth;
              this.$refs.captureCanvas.height = this.$refs.cameraVideo.videoHeight;
            }
          };

          if (this.$refs.cameraVideo.readyState >= 2) {
            setCanvasDimensions();
          } else {
            this.$refs.cameraVideo.onloadedmetadata = setCanvasDimensions;
          }
        }
      } catch (error) {
        console.error("摄像头初始化失败:", error);
        this.cameraStatus = "error";

        // 提供具体的错误提示
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          this.$message.error("摄像头访问被拒绝，请点击重试按钮并授予权限");
        } else if (error.name === "NotFoundError" || error.name === "OverconstrainedError") {
          this.$message.error("未找到可用的摄像头设备");
        } else if (error.name === "NotReadableError") {
          this.$message.error("摄像头设备已被占用，请检查其他应用是否正在使用摄像头");
        } else {
          this.$message.error("无法访问摄像头: " + error.message);
        }
      }
    },

    stopCamera() {
      const stream = this.$refs.cameraVideo?.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    },

    async capturePhoto() {
      if (this.cameraStatus !== "ready") return;

      const canvas = this.$refs.captureCanvas;
      const video = this.$refs.cameraVideo;
      const ctx = canvas.getContext("2d");

      console.log("拍照中...");

      try {
        // 绘制当前视频帧到canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 使用 toBlob 方法替代 fetch 方式获取 blob
        const blob = await new Promise(resolve => {
          canvas.toBlob(resolve, "image/png");
        });

        if (!blob) {
          throw new Error("无法生成图片数据");
        }

        // 转换为 File 对象
        const file = new File([blob], `student-photo-${Date.now()}.png`, {
          type: "image/png",
        });

        // 构造 FormData
        const formData = new FormData();
        formData.append("file", file);
        formData.append("user_id", this.userId);
        formData.append("live_config_id", this.liveConfigId);

        // 调用接口上传
        const res = await uploadStudentPhoto(formData);
        console.log("上传成功:", res);

        // 转换为图片数据用于预览
        const imageUrl = URL.createObjectURL(blob);

        // 添加到抓拍记录
        this.photoCount++;
        this.capturedPhotos.unshift({
          url: imageUrl,
          time: new Date().toLocaleTimeString(),
          id: this.photoCount,
        });

        // 限制显示最近的12张照片
        if (this.capturedPhotos.length > 12) {
          // 清理最旧照片的 URL 对象以释放内存
          const oldPhoto = this.capturedPhotos.pop();
          if (oldPhoto && oldPhoto.url.startsWith("blob:")) {
            URL.revokeObjectURL(oldPhoto.url);
          }
        }

        // 触发事件
        this.$emit("photoCaptured", {
          url: imageUrl,
          time: new Date().toLocaleTimeString(),
          id: this.photoCount,
        });
      } catch (error) {
        console.error("拍照或上传失败:", error);
        // 不要使用$message.error，因为这可能会导致页面跳转
        // 只在控制台打印错误日志

        // 触发错误事件，让父组件处理
        this.$emit("photoCaptureError", error);
      }
    },

    async resetAndInitCamera() {
      try {
        // 先停止所有摄像头流
        this.stopCamera();

        // 清除之前的错误状态
        this.cameraStatus = "loading";

        // 延迟一小段时间确保资源释放
        await new Promise(resolve => setTimeout(resolve, 100));

        // 重新初始化摄像头
        await this.initCamera();
      } catch (error) {
        console.error("重置摄像头失败:", error);
        this.cameraStatus = "error";
        this.$message.error("重置摄像头失败: " + (error.message || "未知错误"));
      }
    },

    // 修改重试按钮的点击处理
    async onRetryClick() {
      try {
        // 明确请求摄像头权限
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        });

        // 如果成功获取权限，先停止这个测试流，然后重新初始化摄像头
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        await this.resetAndInitCamera();
      } catch (error) {
        console.error("权限请求失败:", error);
        // 提供具体的错误提示
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          this.$message.error("摄像头访问被拒绝，请在浏览器设置中授予权限后重试");
        } else {
          this.$message.error("请求摄像头权限失败: " + (error.message || "未知错误"));
        }

        // 保持错误状态以便用户再次点击重试
        this.cameraStatus = "error";
      }
    },

    toggleAutoCapture() {
      if (this.isAutoCapturing) {
        this.stopAutoCapture();
      } else {
        this.startAutoCapture();
      }
    },

    startAutoCapture() {
      this.isAutoCapturing = true;
      this.autoCaptureInterval = setInterval(async () => {
        try {
          await this.capturePhoto();
        } catch (error) {
          console.error("自动抓拍失败:", error);
          // 如果是权限问题，停止自动抓拍并显示错误
          if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
            this.stopAutoCapture();
            // 不使用$message.error，避免页面跳转
            console.error("摄像头权限问题，自动抓拍已停止，请重新授予权限");
            // 触发事件通知父组件
            this.$emit("autoCaptureError", "摄像头权限问题，自动抓拍已停止，请重新授予权限");
          }
        }
      }, this.AUTO_CAPTURE_INTERVAL);

      // 触发自动捕获开始事件
      this.$emit("autoCaptureStarted");
    },

    stopAutoCapture() {
      this.isAutoCapturing = false;
      if (this.autoCaptureInterval) {
        clearInterval(this.autoCaptureInterval);
        this.autoCaptureInterval = null;
      }

      // 触发自动捕获停止事件
      this.$emit("autoCaptureStopped");
    },
  },
};
</script>

<style lang="less" scoped>
.camera-capture-component {
  .distinguish-box {
    width: 200px;
    height: fit-content;
    background: #1a1f2d;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

    .camera-section {
      padding: 15px;

      .section-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 15px;
        color: #e2e8f0;
        text-align: center;
      }

      .camera-container {
        position: relative;
        width: 100%;
        height: 180px;
        background: #000;
        border-radius: 6px;
        overflow: hidden;
        margin-bottom: 15px;

        .camera-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .camera-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;

          .status-content {
            text-align: center;
            color: white;

            .loading {
              .spinner {
                width: 30px;
                height: 30px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: #3b82f6;
                animation: spin 1s linear infinite;
                margin: 0 auto 10px;
              }

              p {
                font-size: 12px;
              }
            }

            .error {
              p {
                margin: 10px 0;
                font-size: 12px;
              }

              .retry-btn {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;

                &:hover {
                  background: #2563eb;
                }
              }
            }
          }
        }
      }

      .control-buttons {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;

        button {
          flex: 1;
          padding: 8px;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;

          &.capture-btn {
            background: #3b82f6;
            color: white;

            &:hover {
              background: #2563eb;
            }
          }

          &.auto-capture-btn {
            background: #10b981;
            color: white;

            &.active {
              background: #ef4444;
            }

            &:hover {
              opacity: 0.9;
            }
          }
        }
      }

      .photos-preview {
        .photos-title {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #e2e8f0;
        }

        .photos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 5px;

          .photo-item {
            position: relative;
            border-radius: 4px;
            overflow: hidden;

            img {
              width: 100%;
              height: 60px;
              object-fit: cover;
              display: block;
            }

            .photo-info {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              background: rgba(0, 0, 0, 0.7);
              color: white;
              font-size: 8px;
              padding: 2px;
              text-align: center;
            }
          }
        }
      }
    }
  }

  .hidden {
    display: none;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .camera-capture-component {
    .distinguish-box {
      width: 100%;
    }
  }
}
</style>
