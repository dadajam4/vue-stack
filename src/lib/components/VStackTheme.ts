import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { VueStackThemeName } from '../settings';

@Component({
  name: 'v-stack-theme',
  provide() {
    return {
      parentTheme: this,
    };
  },
  inject: {
    parentTheme: {
      default: null,
    },
  },
})
export default class VStackTheme extends Vue {
  parentTheme!: VStackTheme | null;

  @Prop({ type: String }) theme?: VueStackThemeName;

  get themeContext() {
    return this.parentTheme || this.$vstack;
  }

  get computedTheme() {
    return this.theme || this.themeContext.computedTheme;
  }

  get themeSettings() {
    return this.$vstackSettings.themes[this.computedTheme];
  }

  get themeBackgroundColor() {
    return this.themeSettings.background;
  }

  get themeTextColor() {
    return this.themeSettings.text;
  }

  get themeStyles() {
    return {
      backgroundColor: this.themeBackgroundColor,
      color: this.themeTextColor,
    };
  }

  get themeCaptionColor() {
    return this.themeSettings.text;
  }

  getThemeContextColor(key: string) {
    return this.$vstack.getThemeContextColor(key, this.computedTheme);
  }
}
