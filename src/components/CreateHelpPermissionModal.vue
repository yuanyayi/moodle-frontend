<template>
  <a-modal title="添加配置" :visible="visible" :footer="null" width="600px" @cancel="handleCancel">
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <CFormItem v-for="(fieldDesc, field) in fieldsMap" v-bind="{ fieldDesc, field }" :key="field">
          <template v-slot:course_info>
            <a-row :gutter="12">
              <a-col :span="11">
                <a-select v-model="formData.course_id" :disabled="disabled" placeholder="请选择课程" @change="handleCourseChange">
                  <a-select-option v-for="course in courseList" :key="course.value" :value="course.value">
                    {{ course.label }}
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col :span="11">
                <a-select v-model="formData.jxb" :disabled="!formData.course_id || disabled" placeholder="请选择课程班级" :not-found-content="jxbLoading ? '加载中...' : '--无结果--'">
                  <a-select-option v-for="jxb in jxbList" :key="jxb.value" :value="jxb.value">
                    {{ jxb.label }}
                  </a-select-option>
                </a-select>
              </a-col>
            </a-row>
          </template>
        </CFormItem>
      </a-form>
    </a-spin>

    <div style="text-align: center; margin-top: 24px">
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleSubmit" style="margin-left: 8px" :loading="confirmLoading">完成</a-button>
    </div>
  </a-modal>
</template>

<script>
import CFormItem from "@/components/CFormItem";
import { getTeacherInfo, getJxb, saveOrUpdateAssistant } from "@/api/helpPermission";

export default {
  name: "CreateHelpPermissionModal",
  components: { CFormItem },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    semester_id: {
      type: Number,
      default: undefined,
    },
    semesterLabel: {
      type: String,
      default: "",
    },
    courseList: {
      type: Array,
      default: () => [],
    },
    record: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      form: this.$form.createForm(this),
      confirmLoading: false,
      formData: {
        id: undefined,
        assistant_teacher_id: undefined,
        course_id: undefined,
        semester_id: undefined,
        jxb: undefined,
        jxb_name: undefined,
      },
      teacherList: [],
      jxbList: [],
      jxbLoading: false,
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
        semester: {
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
          type: "slot",
          slotName: "course_info",
        },
      },
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.initForm();
      }
    },
  },
  methods: {
    initForm() {
      this.form.resetFields();
      this.fieldsMap.semester.list = [{ value: this.semesterLabel, label: this.semesterLabel }];

      if (this.record) {
        this.formData = {
          id: this.record.id,
          assistant_teacher_id: this.record.assistant_teacher_id,
          course_id: this.record.course_id,
          semester_id: this.record.semester_id,
          jxb: this.record.jxb,
          jxb_name: this.record.jxb_name,
        };

        this.form.setFieldsValue({
          assistant_teacher_id: this.record.assistant_teacher_id,
          role: "助教",
          semester: this.semesterLabel,
        });

        if (this.formData.course_id) {
          this.loadJxb(this.formData.course_id);
        }
      } else {
        this.formData = {
          id: undefined,
          assistant_teacher_id: undefined,
          course_id: undefined,
          semester_id: this.semester_id,
          jxb: undefined,
          jxb_name: undefined,
        };

        this.form.setFieldsValue({
          role: "助教",
          semester: this.semesterLabel,
        });

        this.jxbList = [];
      }
      this.teacherList = [];
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
              value: item.id,
              label: `${item.department}/${item.name}/${item.id}`,
            }));
          } else {
            this.fieldsMap.assistant_teacher_id.list = [];
          }
        })
        .catch(() => {
          this.fieldsMap.assistant_teacher_id.list = [];
        });
    },

    handleCourseChange(courseId) {
      this.formData.course_id = courseId;

      if (!courseId || !this.formData.semester_id) {
        this.jxbList = [];
        this.formData.jxb = undefined;
        this.formData.jxb_name = undefined;
        return;
      }

      this.loadJxb(courseId);
    },

    loadJxb(courseId) {
      this.jxbLoading = true;
      getJxb({
        semester_id: this.formData.semester_id,
        course_id: courseId,
      })
        .then(res => {
          if (res.status === 0 && res.data) {
            this.jxbList = res.data.map(item => ({
              value: item.value,
              label: item.label,
            }));
          } else {
            this.jxbList = [];
          }
        })
        .catch(() => {
          this.jxbList = [];
        })
        .finally(() => {
          this.jxbLoading = false;
        });
    },

    handleSubmit() {
      this.form.validateFields((err, values) => {
        if (err) {
          return;
        }

        if (!this.formData.course_id) {
          this.$message.error("请选择课程");
          return;
        }
        if (!this.formData.jxb) {
          this.$message.error("请选择课程班级");
          return;
        }

        const jxbItem = this.jxbList.find(item => item.value === this.formData.jxb);
        if (jxbItem) {
          this.formData.jxb_name = jxbItem.label;
        }

        this.confirmLoading = true;
        saveOrUpdateAssistant({
          is_modify: !!this.formData.id,
          id: this.formData.id,
          assistant_teacher_id: values.assistant_teacher_id,
          course_id: this.formData.course_id,
          semester_id: this.formData.semester_id,
          jxb: this.formData.jxb,
          jxb_name: this.formData.jxb_name,
        })
          .then(res => {
            if (res.status === 0) {
              this.$message.success(this.formData.id ? "修改成功！" : "添加成功！");
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
      this.$emit("cancel");
    },
  },
};
</script>
