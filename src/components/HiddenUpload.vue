<template>
  <div class="hiddenUpload">
    <a-upload
      :name="name"
      :fileList="fileList"
      @change="uploadHandleChange"
      :customRequest="uploadAPI ? customRequest : undefined"
      v-bind="props"
    >
      <div ref="upload"></div>
    </a-upload>
  </div>
</template>

<script>
export default {
  name: "HiddenUpload",
  props: {
    name: {
      type: String,
      default: "file",
    },
    preFileList: Array,
    uploadAPI: [Function, undefined],
    uploadParams: { type: Object, default: (_) => {} },
    okMsg: {
      type: String,
      default: "导入文件成功！",
    },
    errMsg: {
      type: String,
      default: "导入文件失败，请稍后重试！",
    },
    props: { type: Object, default: (_) => {} },
    lenth: { type: Number, default: 1 },
  },
  data() {
    return {
      fileList: [],
    };
  },
  methods: {
    click() {
      if (this.preFileList) {
        this.fileList = [...this.preFileList];
      }
      this.$refs.upload.click();
    },
    // 修改文件：
    uploadHandleChange(info) {
      let fileList = [...info.fileList];
      fileList = fileList.slice(-this.lenth); // 目前只能放一个
      fileList = fileList.map((file) => {
        if (file.response) {
          file.url = file.response.url;
          if (file.response?.status) {
            file.status = "error";
          }
        }
        return file;
      });
      this.fileList = fileList;
      info.fileList = fileList;
      this.$emit("change", info);
      if (fileList.every((file) => file.status === "done")) {
        this.$emit("ok", info);
      } else {
        let temp = fileList.filter((file) => file.status === "error");
        if (temp && temp.length) {
          this.$emit("error", info);
        }
      }
    },
    // 上传文件
    customRequest({ file, onError, onProgress, onSuccess }) {
      const sendFile = new FormData();
      sendFile.append("file", file);
      let percent = 0;
      const timer = setInterval(() => {
        percent = percent + 4 + +(Math.random() * 6).toFixed(2);
        percent = percent > 100 ? 100 : percent;
        onProgress({ percent }, file);
      }, 100);

      this.uploadAPI(
        Object.assign({}, this.uploadParams, { [this.name]: sendFile }),
        onProgress
      )
        .then((res) => {
          clearInterval(timer);
          if (res.status != 0) {
            this.$error({
              title: "上传失败",
              content: res.msg || this.errMsg,
            });
            onError();
          } else {
            this.$message.success(this.okMsg);
            onSuccess(res, file);
            this.$emit("ok", res);
          }
        })
        .catch((err) => {
          clearInterval(timer);
          onError(err);
        });
    },
  },
};
</script>

<style>
.hiddenUpload {
  display: inline-block;
  position: relative;
  margin: auto 1em;
  .ant-upload-select-text {
    position: absolute;
    z-index: -1;
  }
  .ant-upload-list-item-info {
    padding-right: 22px;
  }
}
</style>
