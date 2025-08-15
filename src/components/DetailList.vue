<script>
import {
  toThousands,
  readFromList,
  formatDate,
  formatTime,
} from "@/utils/common";
import ImageFrame from "./ImageFrame.vue";
let debug = false;

export default {
  name: "CDetailList",
  props: {
    fieldsMap: Object,
    detail: Object,
    layout: Object,
    emptyObj: { type: String, default: "<无>" },
  },
  data() {
    return {
      formItemLayout: {
        labelCol: {
          sm: 6,
        },
        wrapperCol: {
          sm: 18,
        },
      },
    };
  },
  components: { ImageFrame },
  created() {
    if (this.layout) {
      this.formItemLayout = {
        ...this.layout,
      };
    }
  },
  methods: {
    createRows(field, opt) {
      if (opt.detailSlot === "hidden" || opt.type === "hidden") return;
      if (opt.type === "divider")
        return (
          <a-col span={24}>
            <a-divider class="formDivider" orientation="left" props={opt.props}>
              {opt.label}
            </a-divider>
          </a-col>
        );
      let props = { ...this.formItemLayout.labelCol };
      return (
        <a-row gutter={10} type="flex" key={field}>
          <a-col class="title" props={props}>
            {opt.label}
          </a-col>
          {this.createCols(field, this.detail[field], opt)}
        </a-row>
      );
    },
    createCols(field, value, opt) {
      let props = { ...this.formItemLayout.wrapperCol };
      let classList = ["content"].concat(
        Array.isArray(opt.class) ? opt.class : [opt.class]
      );
      let content = undefined;
      if (opt.detailSlot) {
        if (typeof opt.detailSlot === "string") {
          // 接受组件中补充的template模版
          if (this.$scopedSlots[opt.detailSlot]) {
            debug && console.log("d1", field);
            content = this.$scopedSlots[opt.detailSlot](
              value,
              field,
              this.detail
            );
          } else {
            debug && console.log("d2", field);
            // 直接去预设里面找
            content = this.getStaticSlots(opt.detailSlot, value, opt);
          }
        } else if (typeof opt.detailSlot === "function") {
          debug && console.log("d3", field);
          // 接受组件中补充的function模版
          content = opt.detailSlot(value, this.detail, field, opt);
        }
      } else if (opt.type) {
        // 没有指定详情模版的，根据表单组件类型预设模版
        let map = {
          hidden: ["hidden", null],
          default: ["text", "textarea", "number", "", undefined],
          toThousands: ["price"],
          readFromList: ["select", "checkbox", "radio"],
          ObjectArray: ["tree", "checkboxTree"],
          image: ["upload", "customer-upload"],
          boolean: ["switch"],
          timerange: ["dateRange"],
          date: ["date"],
          slot: ["checkboxGroup", "slider", "slot"],
        };
        let detailSlot = undefined;
        Object.keys(map).some((el) => {
          if (map[el].indexOf(opt.type) !== -1) {
            detailSlot = el;
            return true;
          }
          return false;
        });
        // 直接去预设里面找
        if (!detailSlot) {
          console.error(field + "表单项没有适用的detailSlot！");
          console.table(opt);
          content = value;
        } else {
          debug && console.log("d4", field, detailSlot);
          content = this.getStaticSlots(detailSlot, value, opt);
        }
      }
      return (
        <a-col props={props} class={classList.join(" ")}>
          {content ||
            ([undefined, null, ""].indexOf(value) === -1
              ? opt.list
                ? readFromList(value, opt.list)
                : value
              : "<无>")}
        </a-col>
      );
    },
    getStaticSlots(detailSlot, value, opt) {
      try {
        switch (detailSlot) {
          case "ArrayString":
          case "JSONString":
            return formatArrayString(value, opt);
          case "Array":
            if (!Array.isArray(value) || !value.length) return "<无>";
            return value.join(",");
          case "readFromList":
            return [undefined, null, ""].indexOf(value) === -1
              ? opt.list
                ? readFromList(value, opt.list)
                : value
              : "<无>";
          case "ObjectList":
            return Array.isArray(value) && value.length
              ? value.map((el) => el.label || el).join("，")
              : "<无>";
          case "Object":
            return value && (value.label || value);
          case "toThousands":
            return toThousands(+value);
          case "timestamp":
            return formatTime(+value);
          case "timestamp2date":
            return formatDate(+value);
          case "date_range":
            return value.map((el) => el.format("YYYY/MM/DD")).join("~");
          case "boolean":
            return value ? "是" : "否";
          case "uploadImg":
            let src = Array.isArray(value) ? (src = value[0].thumbUrl) : value;
            return <ImageFrame src={src} />;
          case "frequency":
            return value.frequency
              ? `按${readFromList(
                  value.frequency_interval_type,
                  opt.children.frequency_interval_type.list
                )}${value.frequency}频控`
              : "";
          case "slot":
            console.error(
              field +
                "字段为slot类型但没有对应的detailSlot组件，请检查您的代码！"
            );
            return value;
          default:
            return value;
        }
      } catch (err) {
        return value;
      }
    },
  },
  render() {
    let { fieldsMap } = this;
    return (
      <div class="detail-list" on={this.$listeners}>
        {Object.keys(fieldsMap).map((field) => {
          return this.createRows(field, fieldsMap[field]);
        })}
        {this.$scopedSlots.default
          ? this.$scopedSlots.default(this.detail)
          : ""}
      </div>
    );
  },
};

function formatArrayString(value, opt) {
  if ([undefined, null, ""].indexOf(value) !== -1) {
    return "<无>";
  }
  try {
    let arr = JSON.parse(value);
    if (!Array.isArray(arr)) {
      console.error("格式出错！" + value);
      return value;
    }
    return opt.list ? this.readFromList(arr, opt.list) : arr.join("，");
  } catch (err) {
    console.error(err);
    return value;
  }
}
</script>

<style lang="less" scoped>
// [class^="ant-row"] {
//   margin-bottom: 18px;
// }
.detail-list {
  position: relative;
}
.ant-col {
  line-height: 39px;
}
.title {
  color: rgba(0, 0, 0, 0.85);
  text-align: right;
  font-size: 14px;
  font-weight: normal;
  margin-bottom: 0;
}
.title:after {
  content: ":";
  margin: 0 8px 0 2px;
  position: relative;
  top: -0.5px;
}
.content {
  word-break: break-all;
  margin: 0 !important;
}
.previewImage {
  max-width: 320px;
}
</style>
