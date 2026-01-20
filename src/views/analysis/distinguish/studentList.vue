<template>
  <a-card :bordered="false" class="student-face-record-container">
    <div class="table-page-search-wrapper">
      <!-- 搜索功能 -->
      <SearchForm :queryField="queryField" :queryParam="queryParam" :autoCreatedFetch="false" @queryFilter="queryFilter" @clearQuery="clearQuery"></SearchForm>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <a-table :columns="columns" :data-source="tableList" :pagination="pagination" :loading="loading" :row-key="record => record.id" @change="handleTableChange"> </a-table>
    </div>
  </a-card>
</template>

<script>
import SearchForm from "@/components/SearchForm.vue";
import Empty from "@/components/Empty.vue";
import { formatTime } from "@/utils/common";
import { getLiveMaps, getCourseList } from "@/api/live";
import { getStudentDistinguishList } from "@/api/distinguish";
import { mapGetters } from "vuex";

export default {
  name: "studentFaceRecordList",
  components: {
    SearchForm,
    Empty,
  },
  data() {
    return {
      loading: false,
      queryField: {
        semester_id: {
          type: "select",
          label: "学期",
          list: [],
          onChange: this.getCoursesBySemester,
        },
        course_id: {
          type: "select",
          label: "相关课程",
          list: [],
        },
      },
      queryParam: {
        semester_id: undefined,
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
      },
      // 考勤状态映射
      attendanceStatusMap: [],
      // 表格列配置
      columns: [
        {
          title: <div class='nowrap'>课程名称</div>,
          dataIndex: "course_name",
          key: "course_name",
        },
        {
          title: <div class='nowrap'>老师</div>,
          dataIndex: "teacher_name",
          key: "teacher_name",
        },
        {
          title: <div class='nowrap'>直播时间</div>,
          dataIndex: "start_time",
          key: "start_time",
          customRender: val => {
            return this.formatTime(val, "YYYY-MM-DD HH:mm");
          },
        },
        {
          title: <div class='nowrap'>人脸识别次数</div>,
          dataIndex: "count",
          key: "count",
        },
        {
          title: <div class='nowrap'>匹配成功次数</div>,
          dataIndex: "match_count",
          key: "match_count",
        },
        {
          title: <div class='nowrap'>考勤状态</div>,
          dataIndex: "status",
          key: "status",
          customRender: val => {
            // 从考勤状态映射中查找对应的中文名称
            const statusItem = this.attendanceStatusMap.find(item => item.value === val);
            const statusName = statusItem ? statusItem.label : val;
            
            // 根据状态设置不同的颜色
            let color = '';
            switch(val) {
              case 1:
                color = 'green';
                break;
              case 0:
                color = 'red';
                break;
              default:
                color = '';
            }
            
            return color ? <span style={`color:${color}`}>{statusName}</span> : statusName;
          },
        },
        {
          title: <div class='nowrap'>操作</div>,
          dataIndex: "id",
          key: "action",
          customRender: live_id => {
            return (
              <a-button size='small' type="link" onClick={() => this.gotoDetail(live_id)}>
                查看详情
              </a-button>
            );
          },
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["roles", "userInfo"]),
    role() {
      return this.roles.id || "student";
    },
    userId() {
      return this.userInfo.id || 0;
    },
  },
  created() {
    this.getMaps().then(() => {
      this.fetch();
    });
  },
  methods: {
    getMaps() {
      // 先获取学期和考勤状态映射
      return getLiveMaps(["semester", "attendanceStatus"]).then(map => {
        this.queryField.semester_id.list = map.semesterMap;
        this.attendanceStatusMap = map.attendanceStatusMap || [];

        if (map.semesterMap.length > 0) {
          this.queryParam.semester_id = map.semesterMap[0].value;
          // 在获取映射之后获取课程列表
          return getCourseList(map.semesterMap[0].value).then(courseMap => {
            this.queryField.course_id.list = courseMap.courseMap || [];
          });
        }
        return Promise.resolve();
      });
    },
    fetch() {
      this.loading = true;
      if (!this.queryParam.semester_id) {
        this.$message.error("请选择学期！");
        return;
      }
      let queryParam = { ...this.queryParam };

      getStudentDistinguishList({
        ...this.listParam,
        ...queryParam,
      })
        .then(res => {
          this.tableList = res.pageBean.list;
          this.pagination.current = res.pageBean.currentPage;
          this.pagination.total = res.pageBean.allRow;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 添加根据学期ID获取课程列表的方法
    getCoursesBySemester(semesterId) {
      // 清空之前选择的课程
      this.queryParam.course_id = undefined;

      // 如果没有选择学期，则清空课程列表
      if (!semesterId) {
        this.queryField.course_id.list = [];
        return;
      }

      // 根据选择的学期获取课程列表
      getCourseList(semesterId)
        .then(res => {
          this.queryField.course_id.list = res.courseMap || [];
        })
        .catch(error => {
          console.error("获取课程列表失败:", error);
          this.$message.error("获取课程列表失败");
          this.queryField.course_id.list = [];
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
        course_id: undefined,
      };
      this.fetch();
    },
    handleTableChange(pagination, filters, sorter) {
      // 处理表格排序和筛选变化
      this.listParam.page = pagination.current;
      this.listParam.pageSize = pagination.pageSize;
      this.fetch();
    },
    gotoDetail(live_id) {
      // 跳转到学生人脸识别记录详情页
      this.$router.push({
        name: "studentFaceDetail",
        params: { id: live_id },
      });
    },
    // ---------- Filters ---------- //
    formatTime,
  },
};
</script>

<style scoped>
.student-face-record-container {
  padding: 16px;
}

.table-page-search-wrapper {
  padding-bottom: 16px;
}
</style>