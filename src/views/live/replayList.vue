<template>
  <a-card :bordered="false" style="margin-bottom: 24px">
    <a-card title="直播基本信息">
      <a-descriptions :column="2" :bordered="false" :dataSource="detail" :size="'small'">
        <a-descriptions-item v-for="(desc, field) in fieldsMap" :key="field" :label="desc.label">{{ detail[field] }} </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <Empty v-if="!tableList.length" />
    <div v-for="(detail, index) in tableList" class="tableItem">
      <div class="frame">
        <img v-show="detail.img" :src="detail.img" :alt="detail.subject" />
        <a-icon type="play-circle" style="font-size: 50px" />
      </div>
      <div class="content">
        <p style="font-size: 18px">{{ detail.subject }}</p>
        <p><b>相关课程：</b>{{ detail.course_name }}</p>
        <p><b>主持人：</b>{{ detail.teacher_name }}</p>
        <p>
          <b>直播时间:</b>{{ formatTime(detail.start_time) }} - {{ formatTime(detail.end_time) }}
          <!-- <span>下次直播：</span> -->
        </p>
        <a-space>
          <a-button v-if="detail.status === 1" type="primary" @click="gotoCourseLive(detail.id)">进入直播间</a-button>
          <a-button v-if="detail.replay && detail.status === 3" class="greenBtn" @click="gotoReplayList(detail.id)">直播回放{{ detail.status === 3 }}</a-button>
          <template v-if="role === 'teacher'">
            <a-button type="info" @click="searchByTheme(detail.theme_id)">编辑</a-button>
            <a-button type="danger" @click="searchByTheme(detail.theme_id)">删除</a-button>
          </template>
        </a-space>
      </div>

      <div class="flag">
        <a-badge :color="getStatusColor(detail.table_status)" :text="getStatusText(detail.table_status)" />
      </div>
    </div>
    <a-pagination style="float: right" v-bind="pagination" @change="paginationChangeHandler" />
  </a-card>
</template>

<script>
import APagination from "ant-design-vue/es/pagination";
import Empty from "@/components/Empty.vue";
import DetailList from "@/components/DetailList";
import { formatTime } from "@/utils/common";
import { getLiveConfigDetail, fetchLiveReplayList, getLiveMaps } from "@/api/live";
import { mapGetters } from "vuex";

export default {
  name: "replayList",
  components: {
    DetailList,
    APagination,
    Empty,
  },
  data() {
    return {
      loading: false,
      listParam: {
        page: 1,
        pageSize: 10,
      },
      tableList: [],
      pagination: {
        simple: true,
        current: 1,
        total: 0,
      },
      detail: {},
      fieldsMap: {
        course_id: {
          label: "相关课程",
          type: "text",
        },
        subject: {
          label: "直播主题",
          type: "text",
        },
        start_time: {
          label: "开始时间",
          type: "slot",
          slotName: "start_time",
        },
        duration: {
          label: "时长",
          type: "number",
        },
        repeat: {
          label: "重复",
          type: "select",
          list: [],
        },
        end_time: {
          label: "结束于",
          type: "date", // true
        },
        replay: {
          label: "回放",
          type: "switch",
        },
      },
    };
  },
  computed: {
    configId() {
      return this.$route.params.configId;
    },
    ...mapGetters(["roles"]),
    role() {
      // 从store中获取用户角色，如果没有则默认为student

      return this.roles.id || "student";
    },
  },
  created() {
    this.getMaps();
    this.fetchDetail();
    this.fetch();
  },
  methods: {
    getMaps() {
      getLiveMaps().then(map => {});
    },
    fetchDetail() {
      getLiveConfigDetail(this.configId).then(res => {
        this.detail = res.data;
      });
    },
    fetch() {
      this.loading = true;
      fetchLiveReplayList(this.configId, {
        // ...this.queryParam,
        ...this.listParam,
      })
        .then(res => {
          this.tableList = res.pageBean.list;
          this.pagination.current = res.pageBean.currentPage;
          this.pagination.total = res.pageBean.allRow;
        })
        .finally(_ => {
          this.loading = false;
        });
    },
    searchByTheme(bid) {
      this.queryParam.theme = bid;
      this.fetch();
    },
    gotoCourseLive(liveConfigId) {
      this.$router.push({
        name: "watch",
        params: { liveConfigId },
      });
    },
    gotoReplayList(configId) {
      this.$router.push({
        name: "replayList",
        params: { configId },
      });
    },
    handleOk() {
      this.fetch();
    },
    paginationChangeHandler(page, pageSize) {
      this.listParam = { page, pageSize };
      this.fetch();
    },
    // ---------- Filters ---------- //
    getStatusText(s) {
      return this.queryField.status.list.find(el => el.value == s)?.label || "未知的状态";
    },
    formatTime,
    getStatusColor(s) {
      return ["gold", "#2db7f5", "#fff", "#87d068", "#ff4d4f", "#ff4d4f"][s] || "#87d068";
    },
  },
};
</script>

<style lang="less" scope>
.tableItem {
  box-sizing: border-box;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #dedede;
  display: flex;
  position: relative;
  &:hover {
    box-shadow: 2px 2px 3px #dedede;
  }
  p {
    margin-bottom: 0.3em;
  }
  .flag {
    margin-top: 10px;
    position: absolute;
    right: 0;
    top: 0;
    padding: 0 7px;
  }
  .frame {
    flex: 0 0 auto;
    width: 200px;
    height: 140px;
    text-align: center;
    position: relative;
    overflow: hidden;
    margin-right: 10px;
    background-color: #f0f0f0;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-color: red;
    }
    .anticon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      cursor: pointer;
    }
  }
}
.greenBtn {
  background-color: #52c41a;
  border-color: #52c41a;
  color: #fff;
  &:hover {
    background-color: #73d13d;
    border-color: #73d13d;
    color: #fff;
  }
}
</style>
