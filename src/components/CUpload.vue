<template>
  <div :class="{ onlyPicture: _uploadProps.limit == 1 }">
    <!-- 上传 -->
    <a-upload
      v-bind="_uploadProps"
      :fileList="fileList"
      @change="handleChange"
      @preview="handlePreview"
      @download="handleDownload"
      @reject="handleReject"
      @click="handleClick"
    >
      <div v-if="fileList.length < (_uploadProps.limit || 1)">
        <slot name="uploadBtn">
          <a-icon type="plus" />
          <div class="ant-upload-text">上传图片</div>
        </slot>
      </div>
    </a-upload>
    <!-- 图片预览 -->
    <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<script>
import { mixinObj } from "@/utils/common";
const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://8.140.52.100:8082"
    : process.env.VUE_APP_API_BASE_URL;
export default {
  name: "CUpload",
  props: {
    field: {
      type: String,
      default: "upload",
    },
    fieldDesc: Object,
    value: Array,
  },
  data() {
    return {
      fileList: [],
      // 预览处理
      previewVisible: false,
      previewImage: "",
      imgLoading: false,
    };
  },
  watch: {
    value: function (newVal) {
      if (Array.isArray(newVal)) {
        this.fileList = [
          ...newVal.map((el) => {
            if (!el.thumbUrl) el.thumbUrl = el.url;
            return el;
          }),
        ];
      }
    },
  },
  computed: {
    _uploadProps(newVal) {
      let initProps = {
        listType: "picture-card",
        showUploadList: true,
        accept: "image/*",
        limit: 1,
      };
      if (!/^http[s]?:\/\//.test(this.fieldDesc.props.action)) {
        this.fieldDesc.props.action = baseURL + this.fieldDesc.props.action;
      }
      // console.log(mixinObj(initProps, this.fieldDesc.props).action);
      return mixinObj(initProps, this.fieldDesc.props);
    },
  },
  methods: {
    click() {
      this.$refs.upload.click();
    },
    triggerChange() {
      this.$emit("change", this.fileList);
    },
    // 修改文件：
    handleChange(info) {
      this.fileList = info.fileList;
      if (info.file.status === "uploading") {
        this.imgLoading = true;
        return;
      }
      if (info.file.status === "done") {
        this.imgLoading = false;
        let fileList = [...info.fileList];
        fileList = fileList.slice(-1); // 目前只能放一个
        fileList = fileList.map((file) => {
          if (file.response) {
            file.url = file.response.url;
          }
          return file;
        });
        this.fileList = fileList;
        info.fileList = fileList;
        this.$emit("change", info);
        this.triggerChange();
      } else if (info.file.status === "error") {
        this.$message.error(`${info.file.name} 上传失败，请稍后重试。`);
      }
    },
    // 预览
    handlePreview(file) {
      // console.log(file);
      try {
        this.previewImage = file.response.data.url;
      } catch (err) {
        this.previewImage = file.url || file.thumbUrl || "";
      }
      if (!this.previewImage) {
        this.$message.error("图片预览出错");
      } else {
        const FileExt = this.previewImage.replace(/.+\./, "").toLowerCase();
        const isBase64 = new RegExp("^data:image/png;base64").test(
          this.previewImage
        );
        if (
          isBase64 ||
          ["png", "jpg", "jpeg", "gif", "svg", "bmp", "ico"].indexOf(FileExt) >
            -1
        ) {
          this.previewVisible = true;
        } else {
          window.open(file.url);
        }
      }
      this.$emit("preview", file);
    },
    handleCancel() {
      this.previewVisible = false;
    },
    handleDownload(file) {
      console.log("download");
      this.$emit("download", file);
    },
    handleReject(fileList) {
      console.log("reject");
      this.$emit("reject", fileList);
    },
    handleClick(ev) {
      console.log(ev);
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

<style scoped lang="less">
.onlyPicture {
  /deep/ .ant-upload-list-picture-card-container {
    width: auto !important;
    height: auto !important;
  }
  /deep/ .ant-upload-list-picture-card .ant-upload-list-item {
    width: 300px !important;
    height: auto !important;
  }
}
</style>
