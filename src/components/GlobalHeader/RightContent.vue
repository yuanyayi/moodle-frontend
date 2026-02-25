<template>
  <div :class="wrpCls">
    <a-button type="link" @click="goToSmartPlatform" style="color:#1890ff;" class="capsule-container">
      <a-icon :component="backHome" style="font-size:18px; vertical-align: -4px;" />返回教学平台
    </a-button>
    <avatar-dropdown :menu="showMenu" :current-user="currentUser" :class="prefixCls" />
    <!-- <select-lang :class="prefixCls" /> -->
  </div>
</template>

<script>
import AvatarDropdown from "./AvatarDropdown";
// import SelectLang from "@/components/SelectLang";
import { mapGetters } from "vuex";
import { toSmartPlatform } from "@/api/login";
import { backHome } from "@/core/icons";

export default {
  name: "RightContent",
  components: {
    AvatarDropdown,
    // SelectLang,
  },
  props: {
    prefixCls: {
      type: String,
      default: "ant-pro-global-header-index-action",
    },
    isMobile: {
      type: Boolean,
      default: () => false,
    },
    topMenu: {
      type: Boolean,
      required: true,
    },
    theme: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showMenu: true,
      backHome,
    };
  },
  computed: {
    ...mapGetters(["nickname", "userInfo"]),
    currentUser() {
      return {
        name: this.nickname || (this.userInfo && this.userInfo.name) || "用户名称",
      };
    },
    wrpCls() {
      return {
        "ant-pro-global-header-index-right": true,
        [`ant-pro-global-header-index-${this.isMobile || !this.topMenu ? "light" : this.theme}`]: true,
      };
    },
  },
  methods: {
    // 跳转到智慧平台
    goToSmartPlatform() {
      // 调用接口获取跳转地址
      toSmartPlatform()
        .then(res => {
          if (res.data) {
            // 跳转到获取的地址
            window.location.href = res.data;
          } else {
            console.error("获取跳转地址失败");
          }
        })
        .catch(error => {
          console.error("调用跳转接口失败:", error);
        });
    },
  },
};
</script>

<style lang="less" scoped>
.capsule-container {
  height: 32px;
  border-radius: 30px;
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.4);
  box-sizing: border-box;
  border: 1px solid #FFFFFF;


  /* 文字样式 */
  color: #1890ff;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.6);
  }
}
</style>
