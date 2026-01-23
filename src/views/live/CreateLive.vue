<template>
  <a-modal :title="addOrEdit === 'add' ? '创建直播' : '修改直播'" :width="640" :visible="visible" :confirmLoading="confirmLoading" :closable="true" :maskClosable="false" @cancel="handleCancel">
    <a-spin :spinning="confirmLoading">
      <!-- step1 -->
      <a-form :form="form">
        <CFormItem v-for="(fieldDesc, field) in fieldsMap" v-bind="{ fieldDesc, field }" :key="field">
          <template v-slot:start_time>
            <DateAndTime v-decorator="[field, fieldDesc.options]" />
          </template>
        </CFormItem>
      </a-form>
    </a-spin>
    <template slot="footer">
      <a-button key="cancel" @click="handleCancel">取消</a-button>
      <a-button key="forward" :loading="confirmLoading" type="primary" @click="lastStep">完成</a-button>
    </template>
  </a-modal>
</template>

<script>
import { createLiveConfig, getLiveMaps, getCourseList } from "@/api/live";
import CFormItem from "@/components/CFormItem";
import DateAndTime from "./DateAndTime";
import moment from "moment";

export default {
  name: "createCamp",
  components: { CFormItem, DateAndTime },
  data() {
    return {
      detail: { id: 0 },
      // 字段整理
      fieldsMap: {
        semester_id: {
          label: "学期",
          type: "select",
          list: [],
          options: {
            rules: [{ required: true }],
          },
          onChange: this.getCoursesBySemester,
        },
        course_id: {
          label: "相关课程",
          type: "select",
          list: [],
          options: {
            rules: [{ required: true }],
          },
          props: {
            placeholder: "请注意先选择学期",
          },
        },
        subject: {
          label: "直播名称",
          type: "text",
          options: {
            rules: [{ required: true }],
          },
        },
        start_time: {
          label: "开始时间",
          type: "slot",
          slotName: "start_time",
          options: {
            rules: [{ required: true }],
            initialValue: moment().add(11, "minutes"),
          },
        },
        duration: {
          label: "时长",
          type: "number",
          options: {
            rules: [{ required: true }],
          },
        },
        repeat: {
          label: "重复",
          type: "select",
          list: [],
          options: {
            rules: [{ required: true }],
            initialValue: 0, // 默认不重复
          },
          onChange: value => {
            this.fieldsMap.end_time.invisible = value === 0;
          },
        },
        end_time: {
          label: "结束于",
          invisible: true,
          type: "date", // true
          options: {
            rules: [
              { required: true },
              {
                validator: function (rule, value, callback) {
                  let { start_time } = this.form.getFieldsValue(["start_time"]);
                  if (!start_time) {
                    callback("请先选择开始时间");
                  } else if (value && value.isBefore(start_time)) {
                    callback("结束时间不能早于开始时间");
                  } else {
                    callback();
                  }
                }.bind(this),
              },
            ],
          },
        },
        replay: {
          label: "回放",
          type: "switch",
          options: {
            rules: [{ required: true }],
            initialValue: false,
          },
          props: {
            ps: {
              text: "开放回放",
            },
          },
        },
      },
      // 展示
      visible: false,
      confirmLoading: false,
      currentStep: 0,
      addOrEdit: "add",
      form: this.$form.createForm(this),
      // 确认数据
      confirmData: {},
    };
  },
  created() {
    this.getMaps();
  },
  methods: {
    add() {
      this.addOrEdit = "add";
      this.visible = true;
      this.form.resetFields();
    },
    edit(detail) {
      this.addOrEdit = "edit";
      this.visible = true;
      this.detail = detail;
      // 设置导入值:
      let initData = {};
      Object.keys(this.fieldsMap).forEach(field => {
        if (field === "start_time" || field === "end_time") {
          initData[field] = detail[field] ? moment(detail[field]) : null;
        } else if (field === "replay") {
          initData[field] = detail[field] ? true : false;
        } else if (field === "repeat") {
          initData[field] = detail[field] || 0; // 默认不重复
        } else if (field === "duration") {
          initData[field] = detail[field] || 0; // 默认时长为0
        } else if (detail[field] !== undefined) {
          initData[field] = detail[field];
        }
      });

      setTimeout(() => {
        this.form.setFieldsValue(initData);
      }, 0);
    },
    getMaps() {
      getLiveMaps(["semester", "repeat"]).then(map => {
        this.fieldsMap.semester_id.list = map.semesterMap;
        this.fieldsMap.repeat.list = map.repeatMap;
        // this.fieldsMap.course_id.list = map.courseMap;
      });
    },
    // 添加根据学期ID获取课程列表的方法
    getCoursesBySemester(semesterId) {
      // 清空之前选择的课程
      this.form.setFieldsValue({ course_id: undefined });

      // 如果没有选择学期，则清空课程列表
      if (!semesterId) {
        this.fieldsMap.course_id.list = [];
        return;
      }

      // 根据选择的学期获取课程列表
      getCourseList(semesterId)
        .then(res => {
          if (res && res.courseMap) {
            this.fieldsMap.course_id.list = res.courseMap;
          } else {
            this.fieldsMap.course_id.list = [];
          }
        })
        .catch(error => {
          console.error("获取课程列表失败:", error);
          this.$message.error("获取课程列表失败");
          this.fieldsMap.course_id.list = [];
        });
    },
    lastStep() {
      const {
        form: { validateFields },
      } = this;
      validateFields((errors, values) => {
        this.confirmData = values;
        if (!errors) {
          const sendData = {
            is_modify: this.addOrEdit === "edit",
            id: this.detail.id || 0,
            ...values,
            replay: values.replay ? true : false,
          };
          Object.keys(values).forEach(key => {
            if (key === "start_time" || key === "end_time") {
              sendData[key] = sendData[key].format("x");
            }
          });
          // console.log(sendData)
          // return

          this.confirmLoading = true;
          createLiveConfig(sendData)
            .then(res => {
              if (res.status) {
                this.$message.error(res.msg || "操作失败，请稍后重试！");
              } else {
                this.$emit("ok");
                this.$message.success("操作成功！");
                this.handleCancel();
              }
            })
            .finally(res => {
              this.confirmLoading = false;
            });
        }
      });
    },
    backward() {
      this.currentStep--;
    },
    handleCancel() {
      // clear form & currentStep
      this.visible = false;
      this.confirmLoading = false;
      this.currentStep = 0;
    },
    beforeUploadImage(f, l) {
      // M size
      const maxSize = 1.5 * 1024 * 1024;
      // console.log(f.size);
      if (f.size > maxSize) {
        this.$message.error(f.name + "文件大小超出限制，请修改后重新上传");
        return false;
      }
      return true;
    },
    onRepeatChange(value) {
      this.fieldsMap.end_time.invisible = value !== 0;
    },
  },
};
</script>

<style scoped lang="less">
.list-title {
  padding: 3px 7px;
  background: #fafafa;
  color: #333;
  margin: 5px 0;
}
.previewImage {
  display: block;
  width: 300px !important;
}
/* you can make up upload button and sample style by using stylesheets */
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
