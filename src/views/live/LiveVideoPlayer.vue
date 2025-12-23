<template>
  <div class="live-video-player">
    <a-card title="直播视频播放" :bordered="false">
      <div class="player-controls">
        <a-form layout="vertical">
          <a-row :gutter="16">
            <a-col :md="12" :lg="12">
              <a-form-item label="直播ID">
                <a-input v-model="liveId" placeholder="请输入直播ID" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :lg="12">
              <a-form-item label="操作">
                <a-button type="primary" @click="loadVideoUrl">加载视频</a-button>
                <a-button @click="showFloatingPlayer = true" style="margin-left: 10px" :disabled="!videoUrl">
                  显示悬浮播放器
                </a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      
      <div v-if="videoUrl" class="embedded-player">
        <FlvPlayer
          :src="videoUrl"
          width="100%"
          height="400px"
          :autoplay="true"
          :muted="false"
        />
      </div>
      
      <div v-else class="no-video">
        <a-empty description="暂无视频流，请先加载视频" />
      </div>
    </a-card>
    
    <FloatingVideoPlayer
      v-if="showFloatingPlayer"
      :videoUrl="videoUrl"
      @close="showFloatingPlayer = false"
    />
  </div>
</template>

<script>
import FlvPlayer from '@/components/FlvPlayer.vue'
import FloatingVideoPlayer from '@/components/FloatingVideoPlayer.vue'
import { getVideoUrl } from '@/api/live'

export default {
  name: 'LiveVideoPlayer',
  components: {
    FlvPlayer,
    FloatingVideoPlayer
  },
  data() {
    return {
      liveId: '',
      videoUrl: '',
      showFloatingPlayer: false
    }
  },
  methods: {
    async loadVideoUrl() {
      if (!this.liveId) {
        this.$message.warning('请输入直播ID')
        return
      }
      
      try {
        const response = await getVideoUrl({ id: this.liveId })
        if (response && response.data && response.data.url) {
          this.videoUrl = response.data.url
          this.$message.success('视频地址加载成功')
        } else {
          this.$message.error('未获取到视频地址')
        }
      } catch (error) {
        console.error('加载视频地址失败:', error)
        this.$message.error('加载视频地址失败')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.live-video-player {
  padding: 24px;
  
  .player-controls {
    margin-bottom: 24px;
  }
  
  .embedded-player {
    margin-top: 20px;
  }
  
  .no-video {
    text-align: center;
    padding: 60px 0;
  }
}
</style>