<template>
  <a-modal :visible="isModalVisible" title="真人签到" :width="400" :footer="null" :closable="false">
    <a-form :model="formData" layout="vertical">
      <a-form-item label="姓名" name="name" :rules="[{ required: true, message: '请输入姓名' }]">
        <a-input v-model:value="formData.name" placeholder="输入姓名" />
      </a-form-item>

      <a-form-item label="学号" name="student_id" :rules="[{ required: true, message: '请输入学号' }]">
        <a-input v-model:value="formData.student_id" placeholder="输入学号" />
      </a-form-item>

      <a-form-item label="拍摄签到">
        <div class="photo-container">
          <div class="camera-preview">
            <video ref="videoElement" style="width: 100%; height: 100%; object-fit: cover" autoplay muted></video>
            <img v-if="photoUrl" :src="photoUrl" alt="拍摄的照片" class="captured-photo" />
          </div>
        </div>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" block @click="handleSubmit" :loading="loading">签到</a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { ref, reactive, watch, onUnmounted } from "vue";
import { message } from "ant-design-vue";
import { uploadFile, studentAttendance } from "@/api/distinguish";

export default {
  name: "RealNameCheckInModal",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: String,
      default: "1",
    },
    liveConfigId: {
      type: Number,
      default: 1,
    },
  },
  setup(props, { emit }) {
    const videoElement = ref(null);
    const isModalVisible = ref(false);
    const formData = reactive({
      name: "",
      student_id: "",
    });
    const photoUrl = ref(null);
    const serverPhoto = ref(null); // 用于存储服务器返回的照片URL和路径
    const loading = ref(false); // 签到按钮loading状态
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

    // 拍照处理 - 返回Promise
    const takePhoto = () => {
      return new Promise((resolve, reject) => {
        if (!videoElement.value || !stream) {
          const errorMsg = "摄像头未准备就绪";
          message.error(errorMsg);
          reject(new Error(errorMsg));
          return;
        }

        const video = videoElement.value;
        // 确保视频元素已经准备好播放
        if (video.readyState !== 4) { // HAVE_ENOUGH_DATA
          const errorMsg = "视频尚未准备好，请稍后再试";
          message.error(errorMsg);
          reject(new Error(errorMsg));
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || video.width;
        canvas.height = video.videoHeight || video.height;
        
        // 检查canvas上下文是否可用
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          const errorMsg = "无法创建画布上下文";
          message.error(errorMsg);
          reject(new Error(errorMsg));
          return;
        }
        
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        } catch (e) {
          console.error("绘制图像失败:", e);
          const errorMsg = "拍照失败，请重试";
          message.error(errorMsg);
          reject(new Error(errorMsg));
          return;
        }

        // 转换为图片URL
        canvas.toBlob(async blob => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            photoUrl.value = url;

            // 创建FormData对象用于上传
            const formData = new FormData();
            formData.append("file", blob, "checkin-photo.png");

            try {
              // 上传照片到服务器
              const response = await uploadFile(formData);
              console.log("照片上传成功:", response);
              // 存储服务器返回的照片URL和路径
              if (response.data) serverPhoto.value = { url: response.data.url, path: response.data.path };
              resolve(response.data);
            } catch (error) {
              console.error("照片上传失败:", error);
              const errorMsg = "照片上传失败";
              message.error(errorMsg);
              reject(new Error(errorMsg));
            }
          } else {
            const errorMsg = "无法生成照片数据";
            message.error(errorMsg);
            reject(new Error(errorMsg));
          }
        }, "image/png");
      });
    };

    // 提交表单（包含拍摄和上传逻辑）
    const handleSubmit = async () => {
      // 校验表单数据
      if (!formData.name || !formData.student_id) {
        message.error("请填写完整信息");
        return;
      }

      // 开始加载状态
      loading.value = true;

      try {
        // 使用改造后的takePhoto方法拍摄照片并上传
        await takePhoto();

        // 构造发送数据
        let sendData = {
          user_id: props.userId,
          live_config_id: props.liveConfigId,
          ...formData,
          ...serverPhoto.value,
        };

        // 提交表单数据
        console.log("提交表单:", sendData);
        const res = await studentAttendance(sendData);
        if (res.status) {
          message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        emit("submit", sendData);
      } catch (error) {
        console.error("签到失败:", error);
        // 错误信息已经在takePhoto方法中显示，这里不需要重复显示
      } finally {
        // 结束加载状态
        loading.value = false;
      }
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
          formData.student_id = "";
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
      serverPhoto,
      takePhoto,
      handleSubmit,
      loading,
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
  content: "";
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
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
</style>
