<template>
  <Empty v-bind="finalProps" />
</template>
<script>
import { Empty } from "ant-design-vue";
export default {
  components: { Empty },
  props: {
    opt: Object,
  },
  computed: {
    finalProps() {
      return Object.assign(
        { image: Empty.PRESENTED_IMAGE_SIMPLE, description: "暂无数据" },
        this.opt
      );
    },
  },
};
</script>
