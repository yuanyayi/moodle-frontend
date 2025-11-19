<template>
  <div class="device-test-page">
    <a-card title="直播设备测试" style="max-width: 1200px; margin: 20px auto; min-height: 80vh;">
      <a-row :gutter="24">
        <a-col :span="24">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2>直播设备测试页面</h2>
            <p>此页面用于测试直播设备调试组件的功能</p>
          </div>
        </a-col>
      </a-row>
      
      <a-row :gutter="24" justify="center">
        <a-col :span="24" style="text-align: center; margin-bottom: 30px;">
          <a-button type="primary" size="large" @click="showDeviceTestModal = true">
            打开设备测试弹窗
          </a-button>
        </a-col>
      </a-row>
      
      <a-row :gutter="24">
        <a-col :span="24">
          <a-card title="测试说明" size="small">
            <p>点击上方按钮打开设备测试弹窗，可以进行以下测试：</p>
            <ul>
              <li>摄像头设备选择与预览</li>
              <li>麦克风设备选择与音量测试</li>
              <li>扬声器设备选择与声音测试</li>
              <li>设备权限状态检查</li>
            </ul>
            <p>确认设备无误后，点击"确认设备，开始直播"按钮完成测试。</p>
          </a-card>
        </a-col>
      </a-row>
      
      <a-row :gutter="24" style="margin-top: 20px;">
        <a-col :span="24">
          <a-card title="测试结果" size="small">
            <div v-if="testResult">
              <a-alert type="success" :message="`设备测试完成: ${testResult}`" show-icon />
            </div>
            <div v-else>
              <a-alert type="info" message="尚未进行设备测试" show-icon />
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
    
    <!-- 设备测试弹窗 -->
    <LiveDeviceTestModal 
      :visible="showDeviceTestModal"
      @confirm="handleDeviceConfirm"
      @cancel="handleDeviceCancel"
    />
  </div>
</template>

<script>
import LiveDeviceTestModal from '@/components/LiveDeviceTestModal.vue';

export default {
  name: 'DeviceTest',
  components: {
    LiveDeviceTestModal
  },
  data() {
    return {
      showDeviceTestModal: false,
      testResult: null
    };
  },
  methods: {
    handleDeviceConfirm(deviceInfo) {
      console.log('设备确认:', deviceInfo);
      this.testResult = `摄像头: ${deviceInfo.cameraId}, 麦克风: ${deviceInfo.microphoneId}, 扬声器: ${deviceInfo.speakerId}`;
      this.showDeviceTestModal = false;
      this.$message.success('设备测试完成！');
    },
    
    handleDeviceCancel() {
      console.log('设备测试取消');
      this.showDeviceTestModal = false;
      this.$message.info('设备测试已取消');
    }
  }
};
</script>

<style lang="less" scoped>
.device-test-page {
  background-color: #f0f2f5;
  min-height: 100vh;
  padding: 20px 0;
}

ul {
  padding-left: 20px;
}

ul li {
  margin-bottom: 10px;
}
</style>