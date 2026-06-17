<template>
  <a-card :bordered="false">
    <!-- 搜索区域 -->
    <div class="table-page-search-wrapper" style="margin-bottom: 16px">
      <SearchForm :queryField="queryField" :queryParam="queryParam" :autoCreatedFetch="false" @queryFilter="queryFilter" @clearQuery="clearQuery"></SearchForm>
    </div>

    <!-- 添加权限按钮 -->
    <a-button type="primary" style="margin-bottom: 16px" @click="handleAdd"> 添加权限 </a-button>

    <!-- 表格 -->
    <a-table :columns="columns" :data-source="tableList" :pagination="pagination" :loading="loading" @change="handleTableChange">
      <template slot="operation" slot-scope="text, record">
        <a-button type="link" @click="editAssistant(record)">编辑</a-button>
        <a-button type="link" class="ant-btn-danger" @click="deleteAssistant(record)">删除</a-button>
      </template>
    </a-table>

    <!-- 添加/编辑模态框 -->
    <CreateHelpPermissionModal ref="createModal" :semester_id="currentSemesterId" :semester_name="currentSemesterName" :courseList="courseOptions" @ok="handleModalOk"></CreateHelpPermissionModal>
  </a-card>
</template>

<script>
import SearchForm from "@/components/SearchForm.vue";
import CreateHelpPermissionModal from "@/components/CreateHelpPermissionModal.vue";
import { fetchAssistantList, deleteAssistant } from "@/api/helpPermission";
import { getLiveMaps, getCourseList } from "@/api/live";

export default {
  name: "helpPermission",
  components: {
    SearchForm,
    CreateHelpPermissionModal,
  },
  data() {
    return {
      loading: false,
      queryField: {
        semester_id: {
          type: "select",
          label: "学期",
          list: [],
          onChange: this.handleSemesterChange,
        },
        name: {
          type: "text",
          label: "助教名称",
        },
        course_id: {
          type: "select",
          label: "课程名称",
          list: [],
        },
      },
      queryParam: {
        semester_id: undefined,
        name: undefined,
        course_id: undefined,
      },
      listParam: {
        page: 1,
        pageSize: 10,
      },
      tableList: [],
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: total => `共 ${total} 条数据`,
      },
      currentSemesterId: undefined,
      currentSemesterName: "",
      courseOptions: [],
    };
  },
  created() {
    this.init();
  },
  computed: {
    columns() {
      return [
        {
          title: "助教名称",
          dataIndex: "assistant_teacher_name",
        },
        {
          title: "身份",
          dataIndex: "role_name",
        },
        {
          title: "课程名称",
          dataIndex: "course_name",
        },
        {
          title: "课程班级",
          dataIndex: "jxb_name",
        },
        {
          title: "操作",
          key: "operation",
          scopedSlots: { customRender: "operation" },
        },
      ];
    },
  },
  methods: {
    async init() {
      // 获取学期列表
      const map = await getLiveMaps(["semester"]);
      this.queryField.semester_id.list = map.semesterMap;

      // 默认选择第一个学期
      if (map.semesterMap.length > 0) {
        this.queryParam.semester_id = map.semesterMap[0].value;
        this.currentSemesterId = map.semesterMap[0].value;
        this.currentSemesterName = map.semesterMap[0].label;
        // 获取对应课程列表
        await this.loadCourseList(map.semesterMap[0].value);
      }

      // 初始化表格数据
      this.fetch();
    },

    async loadCourseList(semesterId) {
      if (!semesterId) {
        this.queryField.course_id.list = [];
        this.courseOptions = [];
        return;
      }

      const result = await getCourseList(semesterId);
      this.queryField.course_id.list = result.courseMap || [];
      this.courseOptions = result.courseMap || [];
    },

    handleSemesterChange(semesterId) {
      // 清空之前选择的课程
      this.queryParam.course_id = undefined;
      // 更新当前学期信息
      const semester = this.queryField.semester_id.list.find(item => item.value === semesterId);
      if (semester) {
        this.currentSemesterId = semesterId;
        this.currentSemesterName = semester.label;
      }
      // 加载对应课程列表
      this.loadCourseList(semesterId);
    },

    fetch() {
      this.loading = true;

      let params = {
        ...this.queryParam,
        ...this.listParam,
      };

      // 移除未选中的参数
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === null || params[key] === "") {
          delete params[key];
        }
      });

      fetchAssistantList(params)
        .then(res => {
          if (res.pageBean && res.pageBean.list) {
            this.tableList = res.pageBean.list.map(item => ({
              key: item.id,
              ...item,
              identity: "助教",
            }));
            this.pagination.current = res.pageBean.currentPage;
            this.pagination.total = res.pageBean.allRow;
          } else {
            this.tableList = [];
            this.pagination.total = 0;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },

    queryFilter() {
      this.listParam.page = 1;
      this.fetch();
    },

    clearQuery() {
      this.listParam.page = 1;
      this.queryParam = {
        semester_id: this.queryField.semester_id.list[0]?.value || undefined,
        name: undefined,
        course_id: undefined,
      };
      this.fetch();
    },

    handleTableChange(pagination) {
      this.listParam = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      };
      this.fetch();
    },

    handleAdd() {
      this.$refs.createModal.add();
    },

    editAssistant(record) {
      this.$refs.createModal.edit(record);
    },

    handleModalOk() {
      this.fetch();
    },

    deleteAssistant(record) {
      this.$confirm({
        title: "删除权限",
        content: `确定要删除助教「${record.assistant_teacher_name}」的权限吗？`,
        icon: "warning",
        onOk: () => {
          deleteAssistant(record.id)
            .then(res => {
              if (res.status === 0) {
                this.$message.success("操作成功！");
                this.fetch();
              } else {
                this.$message.error(res.msg || "操作失败，请稍后重试！");
              }
            })
            .catch(() => {
              this.$message.error("操作失败，请稍后重试！");
            });
        },
        okText: "删除",
        okType: "danger",
      });
    },
  },
};
</script>

<style lang="less" scoped></style>
