<template>
  <a-modal :visible="visible" title="直播设备调试" :width="800" :footer="null" :closable="true" :z-index="1001" @cancel="handleClose">
    <div class="device-test-container">
      <!-- 设备选择区域 -->
      <a-row :gutter="24">
        <a-col :span="12">
          <a-card title="摄像头设置" size="small">
            <div class="device-selector">
              <a-select v-model:value="selectedCamera" style="width: 100%" @change="handleCameraChange" :loading="isCameraLoading">
                <a-select-option v-for="device in cameraDevices" :key="device.deviceId" :value="device.deviceId">
                  {{ device.label }}
                </a-select-option>
              </a-select>
            </div>
            <div class="camera-preview">
              <video
                ref="cameraPreview"
                autoplay
                playsinline
                muted
                controlslist="nodownload"
                disablepictureinpicture
                style="width: 100%; height: 150px; background-color: #000; border-radius: 4px"></video>
            </div>
          </a-card>
        </a-col>

        <a-col :span="12">
          <a-card title="麦克风设置" size="small">
            <div class="device-selector">
              <a-select v-model:value="selectedMicrophone" style="width: 100%" @change="handleMicrophoneChange" :loading="isMicrophoneLoading">
                <a-select-option v-for="device in microphoneDevices" :key="device.deviceId" :value="device.deviceId">
                  {{ device.label }}
                </a-select-option>
              </a-select>
            </div>
            <div class="microphone-test">
              <div class="audio-level">
                <div class="level-bar" :style="{ width: audioLevel + '%' }"></div>
              </div>
              <div class="test-button">
                <a-button :type="isRecording ? 'primary' : 'default'" @click="toggleRecording">
                  {{ isRecording ? "停止测试" : "开始测试" }}
                </a-button>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <a-row :gutter="24" style="margin-top: 24px">
        <a-col :span="12">
          <a-card title="扬声器设置" size="small">
            <div class="device-selector">
              <a-select v-model:value="selectedSpeaker" style="width: 100%" @change="handleSpeakerChange" :loading="isSpeakerLoading">
                <a-select-option v-for="device in speakerDevices" :key="device.deviceId" :value="device.deviceId">
                  {{ device.label }}
                </a-select-option>
              </a-select>
            </div>
            <div class="speaker-test">
              <a-button type="primary" @click="playTestSound" :loading="isPlayingTestSound"> 播放测试声音 </a-button>
            </div>
          </a-card>
        </a-col>

        <a-col :span="12">
          <a-card title="设备状态" size="small">
            <div class="device-status">
              <a-alert v-if="cameraStatus === 'granted'" type="success" message="摄像头权限已获取" show-icon />
              <a-alert v-else-if="cameraStatus === 'denied'" type="error" message="摄像头权限被拒绝" show-icon />
              <a-alert v-else type="info" message="等待摄像头权限" show-icon />

              <a-alert v-if="microphoneStatus === 'granted'" type="success" message="麦克风权限已获取" show-icon style="margin-top: 10px" />
              <a-alert v-else-if="microphoneStatus === 'denied'" type="error" message="麦克风权限被拒绝" show-icon style="margin-top: 10px" />
              <a-alert v-else type="info" message="等待麦克风权限" show-icon style="margin-top: 10px" />
            </div>

            <div class="action-buttons" style="margin-top: 20px">
              <a-button type="primary" @click="handleConfirm" :disabled="!isDeviceReady" block> 确认设备，开始直播 </a-button>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </a-modal>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";

export default {
  name: "LiveDeviceTestModal",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["confirm", "cancel"],
  setup(props, { emit }) {
    // 设备列表
    const cameraDevices = ref([]);
    const microphoneDevices = ref([]);
    const speakerDevices = ref([]);

    // 选中的设备
    const selectedCamera = ref("");
    const selectedMicrophone = ref("");
    const selectedSpeaker = ref("");

    // 加载状态
    const isCameraLoading = ref(false);
    const isMicrophoneLoading = ref(false);
    const isSpeakerLoading = ref(false);

    // 设备状态
    const cameraStatus = ref("pending"); // 'pending', 'granted', 'denied'
    const microphoneStatus = ref("pending"); // 'pending', 'granted', 'denied'

    // 音频测试
    const isRecording = ref(false);
    const audioLevel = ref(0);
    const audioContext = ref(null);
    const analyser = ref(null);
    const microphoneStream = ref(null);
    const animationFrameId = ref(null);

    // 扬声器测试
    const isPlayingTestSound = ref(false);

    // 设备是否就绪
    const isDeviceReady = ref(false);

    // DOM引用
    const cameraPreview = ref(null);
    const cameraStream = ref(null);

    // 获取设备列表
    const enumerateDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        cameraDevices.value = devices.filter(device => device.kind === "videoinput");
        microphoneDevices.value = devices.filter(device => device.kind === "audioinput");
        speakerDevices.value = devices.filter(device => device.kind === "audiooutput");

        // 设置默认设备
        if (cameraDevices.value.length > 0 && !selectedCamera.value) {
          selectedCamera.value = cameraDevices.value[0].deviceId;
        }

        if (microphoneDevices.value.length > 0 && !selectedMicrophone.value) {
          selectedMicrophone.value = microphoneDevices.value[0].deviceId;
        }

        if (speakerDevices.value.length > 0 && !selectedSpeaker.value) {
          selectedSpeaker.value = speakerDevices.value[0].deviceId;
        }

        // 如果已经有设备且状态是pending，则更新为granted
        if (cameraDevices.value.length > 0 && cameraStatus.value === "pending") {
          cameraStatus.value = "granted";
        }
        
        if (microphoneDevices.value.length > 0 && microphoneStatus.value === "pending") {
          microphoneStatus.value = "granted";
        }

        updateDeviceReadyStatus();
      } catch (error) {
        console.error("获取设备列表失败:", error);
      }
    };

    // 更新设备就绪状态
    const updateDeviceReadyStatus = () => {
      isDeviceReady.value = cameraStatus.value === "granted" && microphoneStatus.value === "granted" && cameraDevices.value.length > 0 && microphoneDevices.value.length > 0;
    };

    // 初始化摄像头
    const initCamera = async () => {
      if (!selectedCamera.value) return;

      try {
        isCameraLoading.value = true;

        // 停止之前的流
        if (cameraStream.value) {
          cameraStream.value.getTracks().forEach(track => track.stop());
        }

        // 获取新的流
        const constraints = {
          video: {
            deviceId: selectedCamera.value ? { exact: selectedCamera.value } : undefined,
          },
        };

        cameraStream.value = await navigator.mediaDevices.getUserMedia(constraints);
        cameraStatus.value = "granted";

        // 等待DOM渲染完成
        await nextTick();

        // 设置视频源
        if (cameraPreview.value) {
          cameraPreview.value.srcObject = cameraStream.value;

          // 尝试播放视频
          try {
            await cameraPreview.value.play();
          } catch (playError) {
            console.warn("视频自动播放失败:", playError);
            // 即使自动播放失败，只要srcObject设置成功，视频也可能正常显示
          }
        }
      } catch (error) {
        console.error("初始化摄像头失败:", error);
        cameraStatus.value = "denied";
      } finally {
        isCameraLoading.value = false;
        updateDeviceReadyStatus();
      }
    };

    // 摄像头设备变更
    const handleCameraChange = () => {
      initCamera();
    };

    // 初始化麦克风
    const initMicrophone = async () => {
      if (!selectedMicrophone.value) return;

      try {
        isMicrophoneLoading.value = true;

        // 停止之前的流
        if (microphoneStream.value) {
          microphoneStream.value.getTracks().forEach(track => track.stop());
        }

        // 获取新的流
        const constraints = {
          audio: {
            deviceId: selectedMicrophone.value ? { exact: selectedMicrophone.value } : undefined,
          },
        };

        microphoneStream.value = await navigator.mediaDevices.getUserMedia(constraints);
        microphoneStatus.value = "granted";

        // 初始化音频分析器
        initAudioAnalyser();
      } catch (error) {
        console.error("初始化麦克风失败:", error);
        microphoneStatus.value = "denied";
      } finally {
        isMicrophoneLoading.value = false;
        updateDeviceReadyStatus();
      }
    };

    // 初始化音频分析器
    const initAudioAnalyser = () => {
      if (!microphoneStream.value) return;

      // 创建音频上下文
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
      analyser.value = audioContext.value.createAnalyser();
      analyser.value.fftSize = 256;

      // 连接音频节点
      const source = audioContext.value.createMediaStreamSource(microphoneStream.value);
      source.connect(analyser.value);

      // 开始分析音频级别
      if (isRecording.value) {
        analyzeAudioLevel();
      }
    };

    // 分析音频级别
    const analyzeAudioLevel = () => {
      if (!analyser.value) return;

      const bufferLength = analyser.value.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        analyser.value.value.getByteFrequencyData(dataArray);

        // 计算平均音量
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // 转换为百分比 (0-100)
        audioLevel.value = Math.min(100, Math.round(average / 2.55));

        if (isRecording.value) {
          animationFrameId.value = requestAnimationFrame(updateLevel);
        }
      };

      updateLevel();
    };

    // 麦克风设备变更
    const handleMicrophoneChange = () => {
      initMicrophone();
    };
    // 切换录音状态
    const toggleRecording = () => {
      isRecording.value = !isRecording.value;

      if (isRecording.value) {
        // 开始录音测试
        if (!microphoneStream.value) {
          initMicrophone();
        } else {
          analyzeAudioLevel();
        }
      } else {
        // 停止录音测试
        if (animationFrameId.value) {
          cancelAnimationFrame(animationFrameId.value);
        }
        audioLevel.value = 0;
      }
    };

    // 扬声器设备变更
    const handleSpeakerChange = () => {
      // 扬声器变更不需要特殊处理
    };

    // 播放测试声音
    const playTestSound = async () => {
      try {
        isPlayingTestSound.value = true;

        // 创建测试音频
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // 设置音频参数
        oscillator.type = "sine";
        oscillator.frequency.value = 440; // A音
        gainNode.gain.value = 0.5;

        // 如果指定了扬声器设备，尝试使用它
        if (selectedSpeaker.value && "setSinkId" in HTMLAudioElement.prototype) {
          const audio = new Audio();
          await audio.setSinkId(selectedSpeaker.value);
          oscillator.connect(audioContext.destination);
        }

        // 播放声音
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1); // 1秒后停止

        // 等待播放完成
        setTimeout(() => {
          isPlayingTestSound.value = false;
        }, 1000);
      } catch (error) {
        console.error("播放测试声音失败:", error);
        isPlayingTestSound.value = false;
      }
    };

    // 获取用户媒体权限
    const requestUserMedia = async () => {
      try {
        // 请求摄像头和麦克风权限
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // 更新状态
        cameraStatus.value = "granted";
        microphoneStatus.value = "granted";

        // 停止所有轨道
        stream.getTracks().forEach(track => track.stop());

        // 获取设备列表
        await enumerateDevices();

        // 初始化设备
        initCamera();
        initMicrophone();
      } catch (error) {
        console.error("获取用户媒体权限失败:", error);
        // 即使出现错误，也尝试枚举设备以检查实际权限状态
        await enumerateDevices();
        
        // 检查是否真的没有权限，还是只是设备不存在
        if (cameraDevices.value.length > 0) {
          // 有摄像头设备，尝试初始化
          await initCamera();
        } else {
          // 没有摄像头设备或者权限被拒绝
          cameraStatus.value = error.name === "NotAllowedError" ? "denied" : "pending";
        }
        
        if (microphoneDevices.value.length > 0) {
          // 有麦克风设备，尝试初始化
          await initMicrophone();
        } else {
          // 没有麦克风设备或者权限被拒绝
          microphoneStatus.value = error.name === "NotAllowedError" ? "denied" : "pending";
        }
      }
    };

    // 确认设备
    const handleConfirm = () => {
      emit("confirm", {
        cameraId: selectedCamera.value,
        microphoneId: selectedMicrophone.value,
        speakerId: selectedSpeaker.value,
      });
    };

    // 关闭弹窗
    const handleClose = () => {
      emit("cancel");
    };

    // 强制刷新设备状态
    const refreshDeviceStatus = async () => {
      try {
        // 先尝试获取媒体流以确保权限
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        // 成功获取后停止所有轨道
        stream.getTracks().forEach(track => track.stop());
        
        // 更新状态为已授权
        cameraStatus.value = "granted";
        microphoneStatus.value = "granted";
        
        // 重新枚举设备
        await enumerateDevices();
        
        // 重新初始化设备
        await initCamera();
        await initMicrophone();
      } catch (error) {
        console.error("刷新设备状态失败:", error);
        // 仍然尝试枚举设备
        await enumerateDevices();
      }
    };

    // 组件挂载时
    onMounted(async () => {
      // 添加小延迟确保DOM完全渲染
      setTimeout(async () => {
        await requestUserMedia();
      }, 100);
    });
    
    // 监听visible属性变化，当弹窗显示时刷新设备状态
    watch(() => props.visible, async (newVal) => {
      if (newVal) {
        // 弹窗显示时，刷新设备状态
        setTimeout(async () => {
          await refreshDeviceStatus();
        }, 100);
      }
    });

    // 组件卸载时
    onUnmounted(() => {
      // 停止所有流
      if (cameraStream.value) {
        cameraStream.value.getTracks().forEach(track => track.stop());
      }

      if (microphoneStream.value) {
        microphoneStream.value.getTracks().forEach(track => track.stop());
      }

      // 停止音频分析
      if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId.value);
      }

      // 关闭音频上下文
      if (audioContext.value) {
        audioContext.value.close();
      }
    });

    return {
      // 设备列表
      cameraDevices,
      microphoneDevices,
      speakerDevices,

      // 选中的设备
      selectedCamera,
      selectedMicrophone,
      selectedSpeaker,

      // 加载状态
      isCameraLoading,
      isMicrophoneLoading,
      isSpeakerLoading,

      // 设备状态
      cameraStatus,
      microphoneStatus,

      // 音频测试
      isRecording,
      audioLevel,

      // 扬声器测试
      isPlayingTestSound,

      // 设备就绪状态
      isDeviceReady,

      // DOM引用
      cameraPreview,

      // 方法
      handleCameraChange,
      handleMicrophoneChange,
      handleSpeakerChange,
      toggleRecording,
      playTestSound,
      handleConfirm,
      handleClose,
    };
  },
};
</script>

<style scoped>
.device-test-container {
  padding: 20px 0;
}

.device-selector {
  margin-bottom: 15px;
}

.camera-preview {
  display: flex;
  justify-content: center;
  align-items: center;
}

.microphone-test {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.audio-level {
  width: 100%;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 15px;
}

.level-bar {
  height: 100%;
  background-color: #1890ff;
  transition: width 0.1s ease;
}

.speaker-test {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.device-status {
  min-height: 100px;
}

.action-buttons {
  display: flex;
  justify-content: center;
}
</style>
