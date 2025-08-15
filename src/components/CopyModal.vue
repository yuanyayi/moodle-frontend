<template>
  <!-- 显示指定的文字，允许修改，提供一键复制 -->
  <a-modal
    :title="title"
    centered
    v-model="showModal"
    width="60%"
    @ok="clearAll"
    @cancel="clearAll"
  >
    <a-textarea ref="copyarea" :resize="false" :placeholder="title" :rows="12" v-model="tempStr" />
    <template slot="footer">
      <a-button type="primary" @click="copyAll">复制全部文字</a-button>
    </template>
  </a-modal>
</template>

<script>
export default {
  name: 'CopyModal',
  props: {
    title: {
      type: String,
      default: '数据视图' // 历史遗留问题
    }
  },
  data () {
    return {
      showModal: false,
      tempStr: ''
    }
  },
  methods: {
    open (str) {
      this.tempStr = str
      this.showModal = true
    },
    copyAll () {
      this.$refs.copyarea.$refs.resizableTextArea.$el.select()
      const copied = document.execCommand('copy')
      if (copied) {
        this.$message.success('复制成功')
      } else {
        this.$message.error('复制失败，请手动复制')
      }
    },
    clearAll () {
      this.tempStr = ''
    }
  }
}
</script>
