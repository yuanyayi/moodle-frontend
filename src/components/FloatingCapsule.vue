<template>
  <div class="floating-capsule" :class="{ 'is-dragging': isDragging }" :style="capsuleStyle"
    @mousedown="startDrag">
    <div class="capsule-content">
      <a-tooltip v-for="(item, index) in visibleItems" :key="index" :title="item.title"
        :placement="position.x < window.innerWidth / 2 ? 'right' : 'left'">
        <div class="capsule-item" @click="handleItemClick(item)">
          <a-badge v-if="item.badge && (typeof item.badge === 'function' ? item.badge() : item.badge)" dot
            :offset="[0, 0]" :numberStyle="{ width: '8px', height: '8px', boxShadow: '0 0 0 1px #fff' }">
            <a-icon v-if="item.icon" :type="item.icon" class="item-icon" />
            <a-icon v-else-if="item.component" :component="item.component" class="item-icon" />
          </a-badge>
          <template v-else>
            <a-icon v-if="item.icon" :type="item.icon" class="item-icon" />
            <a-icon v-else-if="item.component" :component="item.component" class="item-icon" />
          </template>
        </div>
      </a-tooltip>
    </div>
    <div class="capsule-drag-handle" title="拖拽移动">
      <a-icon :component="dragIcon" class="drag-icon" />
    </div>
  </div>
</template>

<script>
import { drag } from "@/core/icons";

export default {
  name: 'FloatingCapsule',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    initialPosition: {
      type: Object,
      default: () => ({ x: null, y: window.innerHeight / 3 })
    }
  },
  data() {
    return {
      isDragging: false,
      position: { x: window.innerWidth - 100, y: window.innerHeight / 3 },
      dragOffset: { x: 0, y: 0 },
      windowWidth: window.innerWidth,
      dragIcon: drag
    }
  },
  computed: {
    capsuleStyle() {
      const style = {
        top: `${this.position.y}px`,
        left: `${this.position.x}px`,
        zIndex: 999,
        position: 'fixed'
      }
      return style
    },
    visibleItems() {
      return this.items.filter(item => {
        if (typeof item.show === 'function') {
          return item.show()
        }
        return item.show !== false
      })
    }
  },
  mounted() {
    if (this.initialPosition.x !== null) {
      this.position.x = this.initialPosition.x
    }
    if (this.initialPosition.y !== null) {
      this.position.y = this.initialPosition.y
    }
    this.checkPosition()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth
      this.checkPosition()
    },
    checkPosition() {
      // 检查并限制在屏幕范围内
      const capsuleWidth = 80 // 估算胶囊宽度
      const capsuleHeight = 200 // 估算胶囊高度
      
      this.position.x = Math.max(0, Math.min(this.position.x, window.innerWidth - capsuleWidth))
      this.position.y = Math.max(0, Math.min(this.position.y, window.innerHeight - capsuleHeight))
    },
    startDrag(e) {
      this.isDragging = true
      // 计算鼠标相对于胶囊的偏移量
      const rect = this.$el.getBoundingClientRect()
      this.dragOffset.x = e.clientX - rect.left
      this.dragOffset.y = e.clientY - rect.top

      document.addEventListener('mousemove', this.onDrag, { passive: false })
      document.addEventListener('mouseup', this.stopDrag)
      document.addEventListener('mouseleave', this.stopDrag)
      e.preventDefault()
    },
    onDrag(e) {
      if (!this.isDragging) return

      let newX = e.clientX - this.dragOffset.x
      let newY = e.clientY - this.dragOffset.y

      // 限制在屏幕范围内
      const capsuleWidth = 80 // 估算胶囊宽度
      const capsuleHeight = 200 // 估算胶囊高度
      
      newX = Math.max(0, Math.min(newX, window.innerWidth - capsuleWidth))
      newY = Math.max(0, Math.min(newY, window.innerHeight - capsuleHeight))

      this.position.x = newX
      this.position.y = newY
    },
    stopDrag() {
      this.isDragging = false
      this.checkPosition()

      document.removeEventListener('mousemove', this.onDrag)
      document.removeEventListener('mouseup', this.stopDrag)
      document.removeEventListener('mouseleave', this.stopDrag)
    },
    handleItemClick(item) {
      if (item.onClick && typeof item.onClick === 'function') {
        item.onClick()
      }
      this.$emit('itemClick', item)
    }
  }
}
</script>

<style lang="less" scoped>
.floating-capsule {
  position: fixed;
  background: rgba(255, 255, 255, 0.6);
  box-sizing: border-box;
  border: 2px solid #fff;
  border-radius: 100px;
  box-shadow: -4px 0px 16px 0px rgba(0, 92, 173, 0.1);
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  user-select: none;
  z-index: 995;

  &.is-dragging {
    cursor: grabbing;
    box-shadow: -4px 0px 20px 0px rgba(0, 92, 173, 0.2);
  }



  &:hover {
    background-color: #fff;
  }
}

.capsule-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.capsule-item {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  .item-icon {
    width: 28px;
    height: 28px;
    font-size: 28px;
  }

  .item-icon+.item-icon {
    margin-top: 16px;
  }
}

.capsule-drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  margin-top: 16px;

  &:active {
    cursor: grabbing;
  }

  .drag-icon {
    width: 16px;
    height: 4px;
    fill: #999999;
    font-size: 16px;
  }

  &:hover .drag-icon {
    fill: #666666;
  }
}
</style>
