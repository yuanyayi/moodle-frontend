<template>
  <a-card :bordered="false" class="live-list-container">
    <!-- 搜索区域 -->
    <div class="table-page-search-wrapper">
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
import { getDistinguishList } from "@/api/distinguish";
import { mapGetters } from "vuex";

export default {
  name: "liveList",
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
        status: -1,
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
      repeatMap: [],
      // 表格列配置
      columns: [
        {
          title: <div class='nowrap'>班级名称</div>,
          dataIndex: "course_name",
          key: "course_name",
        },
        {
          title: <div class='nowrap'>直播名称</div>,
          dataIndex: "subject",
          key: "subject",
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
          customRender: (val, { count }) => {
            if (val / count < 0.8) {
              return <span style='color:red'>{val}</span>;
            }
            return val;
          },
        },
        {
          title: <div class='nowrap'>操作</div>,
          dataIndex: "id",
          key: "action",
          customRender: live_id => {
            return (
              <a-button size='small' onClick={() => this.gotoDetail(live_id)}>
                查看详情
              </a-button>
            );
          },
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["roles"]),
    role() {
      // 从store中获取用户角色，如果没有则默认为teacher
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
      // 先获取学期和课程映射
      return getLiveMaps(["semester"]).then(map => {
        this.queryField.semester_id.list = map.semesterMap;
        this.queryField.course_id.list = map.courseMap;

        this.queryParam.semester_id = map.semesterMap[0].value;
        // 在获取映射之后获取课程列表
        return getCourseList(map.semesterMap[0].value).then(courseMap => {
          this.queryField.course_id.list = courseMap.courseMap || [];
        });
      });
    },
    fetch() {
      this.loading = true;
      if (!this.queryParam.semester_id) {
        this.$message.error("请选择学期！");
        return;
      }
      let queryParam = { ...this.queryParam };


      getDistinguishList({
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
          if (res && res.courseMap) {
            this.queryField.course_id.list = res.courseMap;
          } else {
            this.queryField.course_id.list = [];
          }
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
        semester_id: this.queryField.semester_id.list[0].value || undefined,
        status: -1,
        course_id: undefined,
      };
      this.fetch();
    },
    gotoDetail(live_id) {
      // 直接跳转到analysis模块中的人脸识别记录详情页
      this.$router.push({
        name: "faceRecordDetail",
        params: { id: live_id },
      });
    },
    handleTableChange(pagination, filters, sorter) {
      // 处理表格排序和筛选变化
      this.listParam.page = pagination.current;
      this.listParam.pageSize = pagination.pageSize;
      this.fetch();
    },
    // ---------- Filters ---------- //
    formatTime,
  },
};
</script>
