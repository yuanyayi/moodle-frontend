<template>
  <a-modal :visible="isModalVisible" title="真人签到" :width="400" :footer="null" :closable="false" :z-index="1001">
    <a-form :model="formData" layout="vertical">
      <a-form-item label="姓名" name="name" :rules="[{ required: true, message: '请输入姓名' }]">
        <a-input v-model:value="formData.name" placeholder="输入姓名" />
      </a-form-item>

      <a-form-item label="学号" name="studentId" :rules="[{ required: true, message: '请输入学号' }]">
        <a-input v-model:value="formData.studentId" placeholder="输入学号" />
      </a-form-item>

      <a-form-item label="拍摄签到">
        <div class="photo-container">
          <div class="camera-preview">
            <video ref="videoElement" style="width: 100%; height: 100%; object-fit: cover" autoplay muted></video>
            <img v-if="photoUrl" :src="photoUrl" alt="拍摄的照片" class="captured-photo" />
          </div>
          <div style="text-align: center; margin-top: 10px">
            <a-button type="primary" icon="camera" @click="takePhoto">拍摄</a-button>
          </div>
        </div>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" block @click="handleSubmit">签到</a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { ref, reactive, watch, onUnmounted } from "vue";
import { message } from "ant-design-vue";

export default {
  name: "RealNameCheckInModal",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Number,
      default: 1,
    },
    liveConfigId: {
      type: Number,
      default: 1,
    },
  },
  emits: ["submit", "cancel"],
  setup(props, { emit }) {
    const videoElement = ref(null);
    const isModalVisible = ref(false);
    const formData = reactive({
      name: "",
      studentId: "",
    });
    const photoUrl = ref(null);
    let stream = null;

    // 初始化摄像头
    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });

        if (videoElement.value) {
          videoElement.value.srcObject = stream;
        }
      } catch (error) {
        console.error("无法访问摄像头:", error);
        message.error("无法访问摄像头，请检查权限设置");
      }
    };

    // 停止摄像头
    const stopCamera = () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        stream = null;
      }
    };

    // 拍照处理
    const takePhoto = () => {
      if (!videoElement.value || !stream) {
        message.error("摄像头未准备就绪");
        return;
      }

      const video = videoElement.value;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 转换为图片URL
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          photoUrl.value = url;
        }
      }, "image/png");
    };

    // 提交表单
    const handleSubmit = () => {
      if (!formData.name || !formData.studentId) {
        message.error("请填写完整信息");
        return;
      }

      if (!photoUrl.value) {
        message.error("请拍摄照片");
        return;
      }

      // 这里可以添加实际的提交逻辑
      console.log("提交表单:", formData, photoUrl.value);
      emit("submit", { ...formData, photoUrl: photoUrl.value });
    };

    // 同步 visible 属性
    watch(
      () => props.visible,
      async val => {
        isModalVisible.value = val;

        if (val) {
          // 当模态框打开时，初始化摄像头
          await initCamera();
        } else {
          // 当模态框关闭时，停止摄像头并重置表单
          stopCamera();
          formData.name = "";
          formData.studentId = "";
          photoUrl.value = null;

          // 清理图片URL对象以释放内存
          if (photoUrl.value) {
            URL.revokeObjectURL(photoUrl.value);
          }
        }
      }
    );

    // 组件卸载时停止摄像头
    onUnmounted(() => {
      stopCamera();

      // 清理图片URL对象以释放内存
      if (photoUrl.value) {
        URL.revokeObjectURL(photoUrl.value);
      }
    });

    return {
      videoElement,
      isModalVisible,
      formData,
      photoUrl,
      takePhoto,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.photo-container {
  text-align: center;
  margin: 20px 0;
}

.camera-preview {
  width: 100%;
  height: 200px;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.camera-preview::before {
  content: "摄像头画面";
  color: #999;
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 1;
  pointer-events: none;
}

.camera-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captured-photo {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.photo-container img {
  width: 150px;
  height: auto;
  border-radius: 8px;
}
</style>
