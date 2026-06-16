<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <!-- 搜索功能 -->
      <SearchForm :queryField="queryField" :queryParam="queryParam" :autoCreatedFetch="false" @queryFilter="queryFilter" @clearQuery="clearQuery"></SearchForm>
    </div>

    <a-table :columns="columns" :data-source="tableList" :pagination="pagination" :loading="loading" row-key="id" @change="tableChangeHandler"> </a-table>
  </a-card>
</template>

<script>
import SearchForm from "@/components/SearchForm.vue";
import { fetchAssistantDataPage, getStatisticsMaps, getCourseList } from "@/api/analysis";
import { formatTime } from "@/utils/common";
import { mapGetters } from "vuex";

export default {
  name: "HelpAnalysis",
  components: {
    SearchForm,
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
        start_time: {
          type: "dateRange",
          label: "直播时间",
          list: [], //_begin,_stop
        },
      },
      queryParam: {
        semester_id: undefined,
        course_id: [],
      },
      listParam: {
        page: 1,
        pageSize: 10,
      },
      tableList: [],
      columns: [
        {
          title: "课程名称",
          dataIndex: "course_name",
          key: "course_name",
        },
        {
          title: "直播名称",
          dataIndex: "subject",
          key: "subject",
        },
        {
          title: "老师",
          dataIndex: "teacher_name",
          key: "teacher_name",
        },
        {
          title: "助教",
          dataIndex: "assistant_teacher_name",
          key: "assistant_teacher_name",
          customRender: text => text || "-",
        },
        {
          title: "直播时间",
          key: "time_range",
          customRender: (text, record) => {
            return `${formatTime(record.start_time, "YYYY年M月D日")}${record.start_period || ""} - ${record.end_period || ""}${formatTime(record.end_time, "(周dd)")}`;
          },
        },
        {
          title: "进入直播时间",
          dataIndex: "enter_time",
          key: "enter_time",
          customRender: text => (text ? formatTime(text, "YYYY-MM-DD HH:mm") : "-"),
        },
        {
          title: "助播离开次数",
          dataIndex: "leave_count",
          key: "leave_count",
        },
        {
          title: "助播在线时长",
          dataIndex: "online_duration",
          key: "online_duration",
          customRender: text => text + "分钟",
        },
      ],
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: total => `共 ${total} 条数据`,
      },
    };
  },
  computed: {
    ...mapGetters(["roles"]),
    role() {
      return this.roles.id || "student";
    },
  },
  created() {
    this.getMaps().then(() => {
      this.fetch();
    });
  },
  methods: {
    getMaps() {
      // 获取学期和课程映射
      return getStatisticsMaps(["semester"]).then(map => {
        this.queryField.semester_id.list = map.semesterMap;

        if (map.semesterMap.length > 0) {
          this.queryParam.semester_id = map.semesterMap[0].value;
          // 获取课程列表
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
      if (queryParam.start_time?.length) {
        let [date1, date2] = queryParam.start_time;
        queryParam.start_time_begin = date1.startOf("day").format("x");
        queryParam.start_time_stop = date2.endOf("day").format("x");
        delete queryParam.start_time;
      }

      fetchAssistantDataPage({
        ...queryParam,
        ...this.listParam,
      })
        .then(res => {
          this.tableList = res.pageBean?.list || [];
          this.pagination.current = res.pageBean?.currentPage || 1;
          this.pagination.pageSize = res.pageBean?.pageSize || 10;
          this.pagination.total = res.pageBean?.allRow || 0;
        })
        .catch(error => {
          console.error("获取直播统计数据失败:", error);
          this.$message.error("获取直播统计数据失败");
        })
        .finally(() => {
          this.loading = false;
        });
    },
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
        .then(courseMap => {
          this.queryField.course_id.list = courseMap.courseMap || [];
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
        course_id: [],
      };
      this.fetch();
    },
    tableChangeHandler(pagination) {
      this.listParam = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      };
      this.fetch();
    },
    viewDetail(id) {
      // 跳转到详情页
      this.$router.push({
        name: "courseDetail",
        params: { id },
      });
    },
    // ---------- Filters ---------- //
    formatTime,
    // 添加t方法解决国际化问题
    t(key) {
      return this.$t(key);
    },
  },
};
</script>

<style scoped>
.table-page-search-wrapper {
  padding-bottom: 16px;
}
::v-deep .ant-table .ant-table-thead > tr > th {
  text-wrap: nowrap;
}
</style>
