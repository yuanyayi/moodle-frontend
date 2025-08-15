<!-- 给单张图片设计的预览框，用于upload图片预览。 -->
<script>
import EmptyVue from "./Empty.vue";

export default {
  name: "ImageFrame",
  props: {
    width: { type: Number, default: 400 },
    src: { type: String },
    alt: { type: String, default: "缩略图预览" },
  },
  render() {
    let { width, src, alt } = this;
    return (
      <div class="imageFrame">
        <span role="button">
          {src ? (
            <img
              class="previewImage"
              style={{ width: width + "px" }}
              src={src}
              alt={alt}
            />
          ) : (
            <EmptyVue opt={{ style: { width: width + "px" } }} />
          )}
        </span>
      </div>
    );
  },
};
</script>

<style lang="less" scoped>
.imageFrame {
  display: table;
  width: 104px;
  height: 104px;
  margin-right: 8px;
  margin-bottom: 8px;
  text-align: center;
  vertical-align: top;
  background-color: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  -webkit-transition: border-color 0.3s ease;
  transition: border-color 0.3s ease;
  & > span {
    display: table-cell;
    width: 100%;
    height: 100%;
    padding: 8px;
    text-align: center;
    vertical-align: middle;
    & > img {
      display: block;
    }
  }
}
</style>
