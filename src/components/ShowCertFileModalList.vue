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
    <!-- {{ list }} -->
    <template v-for="item in list">
      {{ item.label }}:<br />
      <img
        v-if="!!item.showCertFileUrl"
        :src="item.showCertFileUrl"
        style="display: block; margin: auto; max-width: 100%; max-height: 80vh"
      />
      <a
        v-else-if="!!item.showFileUrl"
        :href="item.showFileUrl"
        target="_blank"
        style="display: block"
        >{{ self_btnTxt || btnTxt }}</a
      >
      <a-empty v-else />
    </template>
  </a-modal>
</template>

<script>
function isUrlExist(url) {
  if ([undefined, null, "--", ""].indexOf(url) !== -1) return false;
  return true;
}

export default {
  name: "ShowCertFileModalList",
  props: {
    title: {
      type: String,
      default: "预览图片",
    },
    btnTxt: {
      type: String,
      default: "查看图片文件",
    },
  },
  data() {
    return {
      self_title: "",
      self_btnTxt: "",
      // 预览营业执照
      showCertFileModal: false,
      showCertFileUrl: "",
      showFileUrl: "",
      list: [],
    };
  },
  watch: {
    title: function (newVal) {
      this.self_title = newVal;
    },
    btnTxt: function (newVal) {
      this.self_btnTxt = newVal;
    },
  },
  methods: {
    showCertFile(urls = [], config = {}) {
      this.showCertFileModal = true;
      this.self_title = config.title || this.title;
      this.self_btnTxt = config.btnTxt || this.btnTxt;
      let label = config.label || "label";
      this.list = [];
      for (let item of urls) {
        console.log(item);
        let url = item.url;
        if (label !== "label") {
          item.label = item[label];
        }
        if (!isUrlExist(url)) {
          this.list.push({
            ...item,
            showCertFileUrl: "",
            showFileUrl: "",
          });
          return;
        }
        const FileExt = url.replace(/.+\./, "").toLowerCase();
        let temp = { ...item };
        if (
          ["png", "jpg", "jpeg", "gif", "svg", "bmp", "ico"].indexOf(FileExt) >
          -1
        ) {
          temp.showCertFileUrl = url;
        } else {
          temp.showFileUrl = url;
        }
        this.list.push(temp);
      }
    },
    clearAll() {
      this.showCertFileModal = false;
    },
  },
};
</script>
