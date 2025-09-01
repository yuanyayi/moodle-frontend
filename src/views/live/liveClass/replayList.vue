<template>
  <a-card :bordered="false" style="margin-bottom: 24px">
    <a-card title="直播基本信息" style="margin-bottom: 24px">
      <a-descriptions :column="2" :bordered="false" :dataSource="detail" :size="'small'">
        <a-descriptions-item v-for="(desc, field) in fieldsMap" :key="field" :label="desc.label">{{ detail[field] }} </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-row :gutter="[10, 10]">
      <template v-for="(detail, index) in tableList">
        <a-col :span="8">
          <div class="tableItem" @click="gotoReplay(detail.id)">
            <div class="frame">
              <img v-show="detail.img" :src="detail.img" :alt="detail.subject" />
              <a-icon type="play-circle" style="font-size: 50px" />
            </div>
            <div class="content">
              <p style="font-size: 18px; font-weight: 500">{{ detail.name }}</p>
              <p>{{ detail.teacher_name }} {{ formatDate(+detail.start_time, "YYYY-MM-DD") }}</p>

              <!-- <a-button class="greenBtn" @click="gotoReplayList(detail.id)">直播回放{{ detail.status === 3 }}</a-button> -->
            </div>
          </div>
        </a-col>
      </template>
    </a-row>
    <Empty v-if="!tableList.length" />

    <a-pagination style="float: right" v-bind="pagination" @change="paginationChangeHandler" />
  </a-card>
</template>

<script>
import APagination from "ant-design-vue/es/pagination";
import Empty from "@/components/Empty.vue";
import DetailList from "@/components/DetailList";
import { formatDate } from "@/utils/common";
import { getLiveConfigDetail, getLiveMaps } from "@/api/live";
import { getReplayList } from "@/api/livepage";

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
      statusList: [],
    };
  },
  computed: {
    role() {
      return this.$route.params.role || "teacher";
    },
    configId() {
      return this.$route.params.configId;
    },
  },
  created() {
    this.getMaps();
    this.fetchDetail();
    this.fetch();
  },
  methods: {
    getMaps() {
      getLiveMaps().then(map => {
        this.statusList = map.liveStatusMap;
      });
    },
    fetchDetail() {
      getLiveConfigDetail(this.configId).then(res => {
        this.detail = res.data;
      });
    },
    fetch() {
      this.loading = true;
      getReplayList(this.configId, {
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
    gotoCourseLive(id) {
      this.$router.push({
        name: "sheetDetail",
        params: { level_name: this.level, id },
      });
    },
    gotoReplay(liveId) {
      this.$router.push({
        name: "watch",
        params: { liveId },
        query: { mode: "replay" },
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
      return this.statusList.find(el => el.value == s)?.label || "未知的状态";
    },
    formatDate,
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
  display: block;
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
    width: 100%;
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
