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
import { getLiveMaps, removeLiveConfig } from "@/api/live";
import { getDistinguishList } from "@/api/distinguish";
import moment from "moment";

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
          title: "班级名称",
          dataIndex: "course_name",
          key: "course_name",
        },
        {
          title: "直播名称",
          dataIndex: "subject",
          key: "subject",
        },
        {
          title: "主持人",
          dataIndex: "teacher_name",
          key: "teacher_name",
        },
        {
          title: "直播时间",
          dataIndex: "start_time",
          key: "start_time",
          customRender: ({ text }) => {
            return this.formatTime(text, "YYYY-MM-DD HH:mm");
          },
        },
        {
          title: "人脸识别次数",
          dataIndex: "count",
          key: "count",
        },
        {
          title: "匹配成功次数",
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
          title: "操作",
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
    role() {
      return this.$route.params.role || "teacher";
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
      getDistinguishList({
        ...this.listParam,
        ...this.queryParam,
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
        semester_id: "",
        subject: "",
        start_time: [],
        course_id: "",
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
