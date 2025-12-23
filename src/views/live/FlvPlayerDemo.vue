<template>
  <div class="flv-demo">
    <a-card title="FLV播放器示例" :bordered="false">
      <div class="player-container">
        <FlvPlayer 
          ref="flvPlayerRef"
          :src="flvUrl" 
          width="100%" 
          height="500px"
          :autoplay="false"
          :muted="false"
          @error="handleError"
          @statistics="handleStatistics"
        />
      </div>
      
      <div class="controls" style="margin-top: 20px;">
        <a-form layout="vertical">
          <a-row :gutter="16">
            <a-col :md="24" :lg="24">
              <a-form-item label="FLV视频流地址">
                <a-input 
                  v-model="flvUrl" 
                  placeholder="请输入FLV视频流地址，例如：http://example.com/live/demo.flv" 
                />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-row :gutter="16">
            <a-col :md="8" :lg="8">
              <a-form-item label="播放控制">
                <a-button-group>
                  <a-button @click="play" type="primary">播放</a-button>
                  <a-button @click="pause">暂停</a-button>
                  <a-button @click="reload">重载</a-button>
                </a-button-group>
              </a-form-item>
            </a-col>
            
            <a-col :md="8" :lg="8">
              <a-form-item label="音量控制">
                <a-slider 
                  v-model="volume" 
                  :max="1" 
                  :step="0.01" 
                  @change="setVolume"
                />
              </a-form-item>
            </a-col>
            
            <a-col :md="8" :lg="8">
              <a-form-item label="播放速度">
                <a-select 
                  v-model="playbackRate" 
                  style="width: 100%" 
                  @change="setPlaybackRate"
                >
                  <a-select-option :value="0.5">0.5x</a-select-option>
                  <a-select-option :value="1">1x</a-select-option>
                  <a-select-option :value="1.25">1.25x</a-select-option>
                  <a-select-option :value="1.5">1.5x</a-select-option>
                  <a-select-option :value="2">2x</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-row :gutter="16">
            <a-col :md="24" :lg="24">
              <a-form-item label="时间控制">
                <a-slider 
                  v-model="seekTime" 
                  :max="duration" 
                  :tip-formatter="formatTime"
                  @change="seekToTime"
                />
                <div class="time-display">
                  <span>{{ formatTime(currentTime) }}</span>
                  <span>{{ formatTime(duration) }}</span>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      
      <div class="info" style="margin-top: 20px;">
        <a-card title="播放器信息">
          <p>当前状态: {{ playerStatus }}</p>
          <p v-if="statisticsInfo">码率: {{ statisticsInfo.bitrate }} kbps</p>
          <p>当前时间: {{ formatTime(currentTime) }} / {{ formatTime(duration) }}</p>
        </a-card>
      </div>
    </a-card>
  </div>
</template>

<script>
import FlvPlayer from '@/components/FlvPlayer.vue'

export default {
  name: 'FlvPlayerDemo',
  components: {
    FlvPlayer
  },
  data() {
    return {
      flvUrl: 'https://pull-hs-f5.flive.zebracdn.com/rtmlive/stream-118546170669695760.flv?major_anchor_level=common&rtm_expr_tag=empty_device_type&t_id=000-2025122316384644F92F9B0AFD003FBFE6-HQ4Cok&unique_id=stream-118546170669695760_784_flv&livesaas_sign=DgSotXGzA15p6mv7xHaqB8b6lJU5PKVvZJz7nu4L3DROqQyFxKofUzHGC3tZ5uAbKrBCWfCAqf3L18KCXqrHag==&session_id=2025122316384644F92F9B0AFD003FBFE6', // 使用一个测试流，实际项目中需要替换为真正的flv流
      volume: 0,
      playbackRate: 1,
      playerStatus: '未初始化',
      statisticsInfo: null,
      currentTime: 0,
      duration: 0,
      seekTime: 0,
      updateTimer: null
    }
  },
  mounted() {
    // 定期更新播放时间
    this.updateTimer = setInterval(() => {
      if (this.$refs.flvPlayerRef) {
        // 直接通过ref调用FlvPlayer组件的方法
        this.currentTime = this.$refs.flvPlayerRef.getCurrentTime()
        this.duration = this.$refs.flvPlayerRef.getDuration()
        this.seekTime = this.currentTime
      }
    }, 1000)
  },
  beforeDestroy() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }
  },
  methods: {
    play() {
      if (this.$refs.flvPlayerRef) {
        this.$refs.flvPlayerRef.play()
        this.playerStatus = '播放中'
      }
    },
    pause() {
      if (this.$refs.flvPlayerRef) {
        this.$refs.flvPlayerRef.pause()
        this.playerStatus = '已暂停'
      }
    },
    reload() {
      this.playerStatus = '重载中'
      // 重置src属性以触发重新加载
      const currentSrc = this.flvUrl
      this.flvUrl = ''
      this.$nextTick(() => {
        this.flvUrl = currentSrc
        this.playerStatus = '已重载'
      })
    },
    setVolume(value) {
      if (this.$refs.flvPlayerRef) {
        this.$refs.flvPlayerRef.setVolume(value)
        this.volume = value
      }
    },
    setPlaybackRate(value) {
      if (this.$refs.flvPlayerRef) {
        this.$refs.flvPlayerRef.setPlaybackRate(value)
        this.playbackRate = value
      }
    },
    seekToTime(time) {
      if (this.$refs.flvPlayerRef) {
        this.$refs.flvPlayerRef.seek(time)
      }
    },
    formatTime(seconds) {
      if (isNaN(seconds)) return '00:00'
      const h = Math.floor(seconds / 3600)
      const m = Math.floor((seconds % 3600) / 60)
      const s = Math.floor(seconds % 60)
      if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      }
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    },
    handleError(error) {
      console.error('播放器错误:', error)
      this.playerStatus = '播放错误'
    },
    handleStatistics(stats) {
      this.statisticsInfo = stats
    }
  }
}
</script>

<style lang="less" scoped>
.flv-demo {
  padding: 24px;
  
  .player-container {
    background: #000;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .controls {
    background: #fafafa;
    padding: 20px;
    border-radius: 4px;
  }
  
  .info {
    p {
      margin-bottom: 8px;
    }
  }
  
  .time-display {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
  }
}
</style>