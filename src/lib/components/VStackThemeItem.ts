import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import VStackTheme from './VStackTheme';

export interface VStackThemeItemProps {
  color?: string;
  flat?: boolean;
  outline?: boolean;
}

export interface VStackThemeItemEmits {}

export interface VStackThemeItemScopedSlots {}

@Component({
  name: 'v-stack-theme-item',
  inject: {
    parentTheme: {
      default: null,
    },
  },
})
export default class VStackThemeItem extends Vue {
  parentTheme!: VStackTheme | null;

  @Prop({ type: String }) color?: string;
  @Prop({ type: Boolean }) flat!: boolean;
  @Prop({ type: Boolean }) outline!: boolean;

  get fill(): boolean {
    return !this.outline && !this.flat;
  }

  get computedColor() {
    return this.color || 'primary';
  }

  get themeContext() {
    return this.parentTheme || this.$vstack;
  }

  get computedTheme() {
    return this.themeContext.computedTheme;
  }

  get themeSettings() {
    return this.$vstackSettings.themes[this.computedTheme];
  }

  get contextColor() {
    return this.themeContext.getThemeContextColor(this.computedColor);
  }

  get contextColorStyles() {
    const { contextColor } = this;
    if (this.flat) {
      return {
        color: contextColor.base,
      };
    } else if (this.outline) {
      return {
        color: contextColor.base,
        borderColor: contextColor.base,
      };
    } else if (this.fill) {
      return {
        backgroundColor: contextColor.base,
        color: contextColor.text,
      };
    }
  }
}
