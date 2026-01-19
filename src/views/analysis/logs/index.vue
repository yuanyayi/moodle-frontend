<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <!-- 搜索功能 -->
      <SearchForm :queryField="queryField" :queryParam="queryParams" :autoCreatedFetch="false" @queryFilter="queryFilter" @clearQuery="clearQuery"></SearchForm>
    </div>
    <a-table v-bind="table" @change="handleTableChange"></a-table>
  </a-card>
</template>

<script>
import { fetchLogs } from "@/api/logs";
import SearchForm from "@/components/SearchForm.vue";
import { getStatisticsMaps, getCourseList } from "@/api/analysis";
import { formatTime } from "@/utils/common";

export default {
  name: "components",
  components: {
    SearchForm,
  },
  data() {
    return {
      queryParams: {
        semester_id: undefined,
        course_id: undefined,
      },
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
      table: {
        columns: [
          {
            title: "相关课程",
            dataIndex: "course_name",
          },
          {
            title: "直播名称",
            dataIndex: "subject",
          },
          {
            title: "主持人",
            dataIndex: "teacher_name",
          },
          {
            title: "直播时间",
            dataIndex: "start_time",
            customRender: (text) => formatTime(text, "YYYY-MM-DD HH:mm"),
          },
          {
            title: "操作",
            dataIndex: "id",
            customRender: (id) => {
              return <a-button size="small" type="link" onClick={() => this.viewDetail(id)}>查看详情</a-button>;
            },
          },
        ],
        dataSource: [],
        pagination: {
          pageSize: 20,
          total: 0,
          current: 1,
        },
      },
      listParams: {
        page: 1,
        pageSize: 20,
      },
    };
  },
  created() {
    this.fetchMaps();
  },
  methods: {
    fetchMaps() {
      getStatisticsMaps().then((res) => {
        this.queryField.semester_id.list = res.semesterMap || [];
        
        if (res.semesterMap && res.semesterMap.length > 0) {
          this.queryParams.semester_id = res.semesterMap[0].value;
          this.getCoursesBySemester(res.semesterMap[0].value);
        }
        
        this.fetch();
      });
    },
    getCoursesBySemester(semesterId) {
      // 清空之前选择的课程
      this.queryParams.course_id = undefined;
      
      // 如果没有选择学期，则清空课程列表
      if (!semesterId) {
        this.queryField.course_id.list = [];
        return;
      }
      
      // 根据选择的学期获取课程列表
      getCourseList(semesterId).then((res) => {
        this.queryField.course_id.list = res.courseMap || [];
      }).catch(error => {
        console.error("获取课程列表失败:", error);
        this.$message.error("获取课程列表失败");
        this.queryField.course_id.list = [];
      });
    },
    fetch() {
      fetchLogs({...this.queryParams,...this.listParams}).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        this.table.dataSource = res.pageBean.list;
        this.table.pagination.current = res.pageBean.currentPage;
        this.table.pagination.total = res.pageBean.allRow;
      });
    },
    handleTableChange(pagination) {
      this.listParams.page = pagination.current;
      this.listParams.pageSize = pagination.pageSize;
      this.fetch();
    },
    queryFilter() {
      this.listParams.page = 1;
      this.fetch();
    },
    clearQuery() {
      this.listParams.page = 1;
      this.queryParams = {
        semester_id: this.queryField.semester_id.list[0]?.value || undefined,
        course_id: undefined,
      };
      this.fetch();
    },
    viewDetail(id) {
      // 跳转到oneLiveLogs页面
      this.$router.push({
        name: "oneLiveLogs",
        params: { live_config_id: id },
      });
    },
    formatTime,
  },
};
</script>

<style lang="less" scoped>
.table-page-search-wrapper {
  padding-bottom: 16px;
}
</style>
