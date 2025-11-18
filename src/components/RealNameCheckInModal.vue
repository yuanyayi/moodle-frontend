<template>
  <a-modal
    :visible="isModalVisible"
    title="真人签到"
    :width="400"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :z-index="1001"
  >
    <a-form :model="formData" layout="vertical">
      <a-form-item
        label="姓名"
        name="name"
        :rules="[
          { required: true, message: '请输入姓名' },
        ]"
      >
        <a-input v-model:value="formData.name" placeholder="输入姓名" />
      </a-form-item>
      
      <a-form-item
        label="学号"
        name="studentId"
        :rules="[
          { required: true, message: '请输入学号' },
        ]"
      >
        <a-input v-model:value="formData.studentId" placeholder="输入学号" />
      </a-form-item>
      
      <a-form-item label="拍摄签到">
        <div class="photo-container">
          <img v-if="photoUrl" :src="photoUrl" alt="拍摄的照片" style="width: 150px; height: auto; border-radius: 8px;" />
          <div v-else style="text-align: center; padding: 20px;">
            <a-upload
              :file-list="fileList"
              :custom-request="uploadPhoto"
              accept="image/*"
              :show-upload-list="false"
            >
              <a-button type="primary" icon="camera">拍摄</a-button>
            </a-upload>
          </div>
          <a-button type="primary" block @click="takePhoto" style="margin-top: 10px;">重新拍摄</a-button>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { ref, reactive, watch } from 'vue';
import { message } from 'ant-design-vue';

export default {
  name: 'RealNameCheckInModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const isModalVisible = ref(false);
    const formData = reactive({
      name: '',
      studentId: ''
    });
    const photoUrl = ref(null);
    const fileList = ref([]);
    
    // 拍照处理
    const takePhoto = () => {
      // 通过 ref 获取 CameraCapture 实例
      if (window.cameraCapture && window.cameraCapture.takePhoto) {
        window.cameraCapture.takePhoto();
      }
    };
    
    // 上传照片
    const uploadPhoto = ({ file }) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        photoUrl.value = e.target.result;
        fileList.value = [{ uid: Date.now(), name: 'photo.jpg', url: photoUrl.value }];
      };
      reader.readAsDataURL(file);
    };
    
    // 提交表单
    const handleSubmit = () => {
      if (!formData.name || !formData.studentId || !photoUrl.value) {
        message.error('请填写完整信息并拍摄照片');
        return;
      }
      
      // 这里可以添加实际的提交逻辑
      console.log('提交表单:', formData, photoUrl.value);
      emit('submit', { ...formData, photoUrl: photoUrl.value });
      emit('cancel'); // 关闭弹窗
    };
    
    // 取消
    const handleCancel = () => {
      emit('cancel');
    };
    
    // 同步 visible 属性
    watch(() => props.visible, (val) => {
      isModalVisible.value = val;
    });

    return {
      isModalVisible,
      formData,
      photoUrl,
      fileList,
      takePhoto,
      uploadPhoto,
      handleSubmit,
      handleCancel
    };
  }
};
</script>

<style scoped>
.photo-container {
  text-align: center;
  margin: 20px 0;
}

.photo-container img {
  width: 150px;
  height: auto;
  border-radius: 8px;
}
</style>