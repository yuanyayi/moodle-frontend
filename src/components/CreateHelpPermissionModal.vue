<template>
  <a-modal :title="addOrEdit === 'add' ? '添加配置' : '修改配置'" :visible="modalVisible" width="600px" @cancel="handleCancel">
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <CFormItem v-for="(fieldDesc, field) in fieldsMap" v-bind="{ fieldDesc, field }" :key="field"></CFormItem>
      </a-form>
    </a-spin>

    <template slot="footer">
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleSubmit" :loading="confirmLoading">完成</a-button>
    </template>
  </a-modal>
</template>

<script>
import CFormItem from "@/components/CFormItem";
import { getTeacherInfo, getJxb, saveOrUpdateAssistant } from "@/api/helpPermission";

export default {
  name: "CreateHelpPermissionModal",
  components: { CFormItem },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    semester_id: {
      type: Number,
      default: undefined,
    },
    semester_name: {
      type: String,
      default: "",
    },
    courseList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      form: this.$form.createForm(this),
      modalVisible: false,
      confirmLoading: false,
      addOrEdit: "add",
      currentRecord: null,
      fieldsMap: {
        assistant_teacher_id: {
          label: "助教名称",
          type: "select",
          list: [],
          inputSearch: true,
          options: {
            rules: [{ required: true, message: "请选择助教" }],
          },
          props: {
            placeholder: "输入教师工号/名称进行选择",
            disabled: this.disabled,
          },
          onSearch: this.handleTeacherSearch,
        },
        role: {
          label: "角色",
          type: "select",
          list: [{ value: "助教", label: "助教" }],
          options: {
            rules: [{ required: true }],
            initialValue: "助教",
          },
          props: {
            disabled: true,
          },
        },
        semester_id: {
          label: "学期",
          type: "select",
          list: [],
          options: {
            rules: [{ required: true }],
          },
          props: {
            disabled: true,
          },
        },
        course_info: {
          label: "所属课程",
          type: "children",
          options: {
            initialValue: { course_id: undefined, jxb: undefined },
          },
          onChange: this.handleCourseInfoChange,
          children: {
            course_id: {
              label: "",
              type: "select",
              list: [],
              options: {
                rules: [{ required: true, message: "请选择课程" }],
              },
              props: {
                placeholder: "请选择课程",
                disabled: this.disabled,
                style: {
                  width: "40%",
                },
              },
            },
            jxb: {
              label: "",
              type: "select",
              list: [],
              options: {
                rules: [{ required: true, message: "请选择课程班级" }],
              },
              props: {
                placeholder: "请选择课程班级",
                disabled: true,
                style: {
                  width: "40%",
                  marginLeft: "10px",
                },
              },
            },
          },
        },
      },
    };
  },
  methods: {
    add() {
      this.addOrEdit = "add";
      this.currentRecord = null;
      this.fieldsMap.semester_id.list = [{ value: this.semester_id, label: this.semester_name }];
      this.fieldsMap.course_info.children.course_id.list = this.courseList;
      this.fieldsMap.course_info.children.jxb.list = [];
      this.fieldsMap.course_info.children.jxb.props.disabled = true;

      this.modalVisible = true;

      this.$nextTick(() => {
        let initData = {
          role: "助教",
          semester_id: this.semester_id,
          assistant_teacher_id: undefined,
          course_info: { course_id: undefined, jxb: undefined },
        };
        this.form.setFieldsValue(initData);
      });
    },

    edit(record) {
      this.addOrEdit = "edit";
      this.currentRecord = record;

      this.fieldsMap.semester_id.list = [{ value: record.semester_id, label: record.semester_name }];
      this.fieldsMap.course_info.children.course_id.list = this.courseList;
      // 加载助教名称列表
      if (record.assistant_teacher_id) {
        this.handleTeacherSearch(record.assistant_teacher_id);
      }
      // 先加载教学班列表
      if (record.course_id) {
        this.loadJxb(record.semester_id, record.course_id);
      } else {
        this.fieldsMap.course_info.children.jxb.list = [];
        this.fieldsMap.course_info.children.jxb.props.disabled = true;
      }

      this.modalVisible = true;

      this.$nextTick(() => {
        let initData = {
          role: "助教",
          semester_id: record.semester_id,
          assistant_teacher_id: record.assistant_teacher_id,
          course_info: { course_id: record.course_id, jxb: record.jxb },
        };
        this.form.setFieldsValue(initData);
      });
    },

    handleTeacherSearch(query) {
      if (!query.trim()) {
        this.fieldsMap.assistant_teacher_id.list = [];
        return;
      }

      getTeacherInfo({ query: query.trim() })
        .then(res => {
          if (res.status === 0 && res.data) {
            this.fieldsMap.assistant_teacher_id.list = res.data.map(item => ({
              value: item.teacher_id,
              label: `${item.department}/${item.name}/${item.teacher_id}`,
            }));
          } else {
            this.fieldsMap.assistant_teacher_id.list = [];
          }
        })
        .catch(() => {
          this.fieldsMap.assistant_teacher_id.list = [];
        });
    },

    handleCourseInfoChange(value, changedFields) {
      // 判断是哪个子字段发生了变化
      if (changedFields && changedFields.course_id !== undefined) {
        const courseId = changedFields.course_id;
        // 清空已选的教学班
        this.form.setFieldsValue({ "course_info.jxb": undefined });

        if (!courseId) {
          this.fieldsMap.course_info.children.jxb.list = [];
          this.fieldsMap.course_info.children.jxb.props.disabled = true;
          return;
        }

        // 获取当前表单中的学期ID
        const semesterId = this.form.getFieldValue("semester_id");
        if (!semesterId) {
          this.$message.error("请先选择学期！");
          return;
        }

        this.loadJxb(semesterId, courseId);
      }
    },

    loadJxb(semesterId, courseId) {
      getJxb({
        semester_id: semesterId,
        course_id: courseId,
      })
        .then(res => {
          if (res.status === 0 && res.data) {
            this.fieldsMap.course_info.children.jxb.list = res.data.map(item => ({
              value: item.value,
              label: item.label,
            }));
            this.fieldsMap.course_info.children.jxb.props.disabled = false;
          } else {
            this.fieldsMap.course_info.children.jxb.list = [];
            this.fieldsMap.course_info.children.jxb.props.disabled = true;
          }
        })
        .catch(() => {
          this.fieldsMap.course_info.children.jxb.list = [];
          this.fieldsMap.course_info.children.jxb.props.disabled = true;
        });
    },

    handleSubmit() {
      this.form.validateFields((err, values) => {
        if (err) {
          return;
        }

        // 获取教学班名称
        const jxbItem = this.fieldsMap.course_info.children.jxb.list.find(item => item.value === values.course_info.jxb);
        const jxb_name = jxbItem ? jxbItem.label : "";

        let sendData = {
          is_modify: this.addOrEdit === "edit",
          id: this.currentRecord?.id,
          ...values,
          ...values.course_info,
          jxb_name: jxb_name,
        };
        delete sendData.course_info;

        this.confirmLoading = true;
        saveOrUpdateAssistant(sendData)
          .then(res => {
            if (res.status === 0) {
              this.$message.success(this.addOrEdit === "edit" ? "修改成功！" : "添加成功！");
              this.$emit("ok");
              this.handleCancel();
            } else {
              this.$message.error(res.msg || "操作失败，请稍后重试！");
            }
          })
          .catch(() => {
            this.$message.error("操作失败，请稍后重试！");
          })
          .finally(() => {
            this.confirmLoading = false;
          });
      });
    },

    handleCancel() {
      this.form.resetFields();
      this.modalVisible = false;
      this.currentRecord = null;
      this.fieldsMap.assistant_teacher_id.list = [];
      this.fieldsMap.course_info.children.jxb.list = [];
      this.fieldsMap.course_info.children.jxb.props.disabled = true;
    },
  },
};
</script>
