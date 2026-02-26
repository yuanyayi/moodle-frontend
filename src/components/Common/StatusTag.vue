<template>
  <a-tag :style="tagStyle" class="custom-tag">
    <span class="tag-dot" :style="{ backgroundColor: color }"></span>
    <span class="tag-text">{{ text }}</span>
  </a-tag>
</template>

<script>
export default {
  name: 'StatusTag',
  props: {
    color: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    }
  },
  computed: {
    tagStyle() {
      return {
        backgroundColor: this.hexToRgba(this.color, 0.08),
        borderColor: this.hexToRgba(this.color, 0.2),
        color: this.color
      }
    }
  },
  methods: {
    hexToRgba(hex, alpha) {
      // 移除#号
      hex = hex.replace('#', '');

      // 转换为RGB
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // 返回RGBA
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
}
</script>

<style scoped>
.custom-tag {
  border-radius: 10px;
  padding: 0 12px;
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  border: 1px solid;

  .tag-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 6px;
    flex-shrink: 0;
    vertical-align: middle;
  }

  .tag-text {
    color: #111;
    line-height: 22px;
    font-weight: 400;
  }
}
</style>