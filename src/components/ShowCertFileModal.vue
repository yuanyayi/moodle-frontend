<template>
  <!-- 预览营业执照 -->
  <a-modal
    :title="self_title || title"
    centered
    v-model="showCertFileModal"
    wrapClassName="showCertFileModal"
    :footer="null"
    width="60%"
    @ok="clearAll"
    @cancel="clearAll"
  >
    <img
      v-if="!!showCertFileUrl"
      :src="showCertFileUrl"
      style="display:block; margin:auto; max-width:100%; max-height:80vh"
    />
    <a v-else-if="!!showFileUrl" :href="showFileUrl" target="_blank">{{
      self_btnTxt || btnTxt
    }}</a>
    <a-empty v-else />
  </a-modal>
</template>

<script>
function isUrlExist(url) {
  if ([undefined, null, "--", ""].indexOf(url) !== -1) return false;
  return true;
}

export default {
  name: "ShowCertFileModal",
  props: {
    title: {
      type: String,
      default: "预览图片"
    },
    btnTxt: {
      type: String,
      default: "查看图片文件"
    }
  },
  data() {
    return {
      self_title: "",
      self_btnTxt: "",
      // 预览营业执照
      showCertFileModal: false,
      showCertFileUrl: "",
      showFileUrl: "",
    };
  },
  watch: {
    title: function(newVal) {
      this.self_title = newVal;
    },
    btnTxt: function(newVal) {
      this.self_btnTxt = newVal;
    }
  },
  methods: {
    showCertFile(url, config = {}) {
      if (!isUrlExist(url)) {
        this.showCertFileUrl = "";
        this.showFileUrl = "";
        this.showCertFileModal = true;
        return;
      }
      this.self_title = config.title || this.title;
      this.self_btnTxt = config.btnTxt || this.btnTxt;
      const FileExt = url.replace(/.+\./, "").toLowerCase();
      if (
        ["png", "jpg", "jpeg", "gif", "svg", "bmp", "ico"].indexOf(FileExt) > -1
      ) {
        this.showCertFileUrl = url;
      } else {
        this.showFileUrl = url;
      }
      this.showCertFileModal = true;
    },
    clearAll() {
      this.showCertFileModal = false;
      this.showCertFileUrl = "";
      this.showFileUrl = "";
    }
  }
};
</script>
