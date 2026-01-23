<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <!-- 搜索功能 -->
      <SearchForm :queryField="queryField" :queryParam="queryParam" :autoCreatedFetch="false" @queryFilter="queryFilter"
        @clearQuery="clearQuery"></SearchForm>
    </div>

    <a-table :columns="columns" :data-source="tableList" :pagination="pagination" :loading="loading" row-key="id"
      @change="tableChangeHandler">
      <template v-for="col in ['action']" :slot="col" slot-scope="text, record">
        <template v-if="col === 'action'">
          <a-button type="link" @click="viewDetail(record.id)">查看详情</a-button>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script>
import SearchForm from "@/components/SearchForm.vue";
import { fetchLiveStatPage, getStatisticsMaps, getCourseList } from "@/api/analysis";
import { formatTime } from "@/utils/common";
import { mapGetters } from "vuex";

export default {
  name: "CourseData",
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
      columns: [
        {
          title: "相关课程",
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
          title: "开始时间",
          dataIndex: "start_time",
          key: "start_time",
          customRender: (text) => formatTime(text, "YYYY-MM-DD HH:mm"),
        },
        {
          title: "操作",
          key: "action",
          width: 120,
          scopedSlots: { customRender: "action" },
        },
      ],
      pagination: {
        current: 1,
        total: 0,
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

      fetchLiveStatPage({
        ...queryParam,
        ...this.listParam,
      })
        .then(res => {
          this.tableList = res.pageBean?.list || [];
          this.pagination.current = res.pageBean?.currentPage || 1;
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
        course_id: undefined,
      };
      this.fetch();
    },
    tableChangeHandler(pagination) {
      this.listParam = {
        page: pagination.current,
        pageSize: pagination.pageSize
      };
      this.fetch();
    },
    viewDetail(id) {
      // 跳转到详情页
      this.$router.push({
        name: "courseDetail",
        params: { id }
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
</style>