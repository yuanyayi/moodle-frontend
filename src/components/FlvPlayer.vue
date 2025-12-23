<template>
  <div class="flv-player-container">
    <video 
      ref="videoPlayer" 
      class="video-player"
      :style="{ width: width, height: height }"
      controls
      :muted="muted"
      :loop="loop"
      :preload="preload"
    ></video>
  </div>
</template>

<script>
export default {
  name: 'FlvPlayer',
  props: {
    src: {
      type: String,
      required: true,
      validator: function (value) {
        return value && (value.startsWith('http') || value.startsWith('https'))
      }
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '400px'
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    muted: {
      type: Boolean,
      default: false
    },
    loop: {
      type: Boolean,
      default: false
    },
    preload: {
      type: String,
      default: 'metadata'
    }
  },
  data() {
    return {
      flvPlayer: null,
      flvjs: null,
      isFlvSupported: false
    }
  },
  watch: {
    src: {
      handler(newSrc) {
        if (newSrc) {
          this.$nextTick(() => {
            this.destroyPlayer()
            this.initPlayer()
          })
        }
      },
      immediate: true
    }
  },
  async mounted() {
    // 异步加载flv.js以避免初始化冲突
    try {
      // 使用import()动态导入，避免构建时的依赖冲突
      const flvjsModule = await import(/* webpackChunkName: "flvjs" */ 'flv.js')
      this.flvjs = flvjsModule.default
      
      if (this.flvjs && this.flvjs.isSupported()) {
        this.isFlvSupported = true
        if (this.src) {
          this.$nextTick(() => {
            this.initPlayer()
          })
        }
      } else {
        console.error('flv.js is not supported in this browser')
        this.$emit('error', 'flv.js is not supported in this browser')
      }
    } catch (error) {
      console.error('Failed to load flv.js:', error)
      this.$emit('error', 'Failed to load flv.js')
    }
  },
  beforeDestroy() {
    this.destroyPlayer()
  },
  methods: {
    initPlayer() {
      if (!this.src || !this.$refs.videoPlayer || !this.flvjs || !this.isFlvSupported) {
        console.warn('Video element, source URL, flv.js or browser support not ready')
        return
      }

      try {
        // 创建flv.js播放器实例
        this.flvPlayer = this.flvjs.createPlayer({
          type: 'flv',
          url: this.src
        }, {
          enableWorker: false, // 禁用worker以避免兼容性问题
          lazyLoad: true,
          enableStashBuffer: false,
          stashInitialSize: 128,
          isLive: true // 设置为直播模式
        })

        // 将播放器附加到视频元素
        this.flvPlayer.attachMediaElement(this.$refs.videoPlayer)
        this.flvPlayer.load()
        
        if (this.autoplay) {
          this.flvPlayer.play()
        }
        
        // 监听播放器事件
        this.flvPlayer.on(this.flvjs.Events.ERROR, (errType, errDetail) => {
          console.error('FLV Player Error:', errType, errDetail)
          this.$emit('error', { type: errType, detail: errDetail })
        })
        
        this.flvPlayer.on(this.flvjs.Events.STATISTICS_INFO, (stats) => {
          this.$emit('statistics', stats)
        })
      } catch (error) {
        console.error('Failed to initialize flv player:', error)
        this.$emit('error', error)
      }
    },
    destroyPlayer() {
      if (this.flvPlayer) {
        // 确保播放器存在时才调用相关方法
        try {
          this.flvPlayer.unload()
          this.flvPlayer.detachMediaElement()
          this.flvPlayer.destroy()
        } catch (e) {
          console.error('Error while destroying player:', e)
        }
        this.flvPlayer = null
      }
    },
    
    // 播放控制方法
    play() {
      if (this.flvPlayer) {
        return this.flvPlayer.play()
      }
    },
    
    pause() {
      if (this.flvPlayer) {
        this.flvPlayer.pause()
      }
    },
    
    seek(time) {
      if (this.flvPlayer && !isNaN(time)) {
        this.flvPlayer.currentTime = time
      }
    },
    
    setVolume(volume) {
      if (this.$refs.videoPlayer) {
        this.$refs.videoPlayer.volume = volume
      }
    },
    
    setPlaybackRate(rate) {
      if (this.$refs.videoPlayer) {
        this.$refs.videoPlayer.playbackRate = rate
      }
    },
    
    // 获取播放状态
    getCurrentTime() {
      return this.$refs.videoPlayer ? this.$refs.videoPlayer.currentTime : 0
    },
    
    getDuration() {
      return this.$refs.videoPlayer ? this.$refs.videoPlayer.duration : 0
    },
    
    getVolume() {
      return this.$refs.videoPlayer ? this.$refs.videoPlayer.volume : 1
    },
    
    getPlaybackRate() {
      return this.$refs.videoPlayer ? this.$refs.videoPlayer.playbackRate : 1
    }
  }
}
</script>

<style scoped>
.flv-player-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
}

.video-player {
  max-width: 100%;
  height: auto;
}
</style>