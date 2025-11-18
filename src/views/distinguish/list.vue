<template>
  <a-card :bordered="false" class="live-list-container">
    <!-- 搜索区域 -->
    <div class="table-page-search-wrapper">
      <SearchForm :queryField="queryField" :queryParam="queryParam" @queryFilter="queryFilter" @clearQuery="clearQuery"></SearchForm>
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
import { getLiveMaps } from "@/api/live";
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
        },
        subject: {
          type: "text",
          label: "直播主题",
        },
        start_time: {
          type: "dateRange",
          label: "直播开始时间",
        },
        course_id: {
          type: "text",
          label: "相关课程",
        },
      },
      queryParam: {
        semester_id: undefined,
        status: -1,
        subject: undefined,
        start_time: [],
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
          title: <div class="nowrap">班级名称</div>,
          dataIndex: "course_name",
          key: "course_name",
        },
        {
          title: <div class="nowrap">直播名称</div>,
          dataIndex: "subject",
          key: "subject",
        },
        {
          title: <div class="nowrap">主持人</div>,
          dataIndex: "teacher_name",
          key: "teacher_name",
        },
        {
          title: <div class="nowrap">直播时间</div>,
          dataIndex: "start_time",
          key: "start_time",
          customRender: val => {
            return this.formatTime(val, "YYYY-MM-DD HH:mm");
          },
        },
        {
          title: <div class="nowrap">人脸识别次数</div>,
          dataIndex: "count",
          key: "count",
        },
        {
          title: <div class="nowrap">匹配成功次数</div>,
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
          title: <div class="nowrap">操作</div>,
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
    this.getMaps();
  },
  methods: {
    getMaps() {
      getLiveMaps(["semester"]).then(map => {
        this.queryField.semester_id.list = map.semesterMap;
      });
    },
    fetch() {
      this.loading = true;
      let queryParam = { ...this.queryParam };
      if (queryParam.start_time.length) {
        queryParam.start_time_begin = queryParam.start_time[0].format("x");
        queryParam.start_time_stop = queryParam.start_time[1].format("x");
        delete queryParam.start_time;
      }

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
    queryFilter() {
      this.listParam.page = 1;
      this.fetch();
    },
    clearQuery() {
      this.listParam.page = 1;
      this.queryParam = {
        semester_id: undefined,
        status: -1,
        subject: undefined,
        start_time: [],
        course_id: undefined,
      };
      this.fetch();
    },
    gotoDetail(live_id) {
      this.$router.push({
        name: "distinguishDetail",
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
