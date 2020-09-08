(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('soundmanager2'), require('soundmanager2/script/soundmanager2-nodebug')) :
  typeof define === 'function' && define.amd ? define(['exports', 'soundmanager2', 'soundmanager2/script/soundmanager2-nodebug'], factory) :
  (global = global || self, factory(global.VueSoundmanager = {}, global.soundmanager2, global.soundmanager2Nodebug));
}(this, (function (exports, soundmanager2, soundmanager2Nodebug) { 'use strict';

  soundmanager2 = soundmanager2 && Object.prototype.hasOwnProperty.call(soundmanager2, 'default') ? soundmanager2['default'] : soundmanager2;
  soundmanager2Nodebug = soundmanager2Nodebug && Object.prototype.hasOwnProperty.call(soundmanager2Nodebug, 'default') ? soundmanager2Nodebug['default'] : soundmanager2Nodebug;

  var assign, assign$1;

  //

  var pendingCalls = [];
  var initialized = false; // declaring initialized to false

  var soundManager;
  // Allow server side rendering
  if (typeof window !== "undefined") {
    if (process.env.NODE_ENV !== "production") {
      ((assign = soundmanager2, soundManager = assign.soundManager));
    } else {
      ((assign$1 = soundmanager2Nodebug, soundManager = assign$1.soundManager));
    }

    soundManager.onready(function () {
      pendingCalls.slice().forEach(function (cb) { return cb(); });
    });
  }

  function createSound(options, cb) {
    if (soundManager.ok()) {
      cb(soundManager.createSound(options));
      return function () {};
    } else {
      if (!initialized) {
        initialized = true;
        soundManager.beginDelayedInit();
      }

      var call = function () {
        cb(soundManager.createSound(options));
      };

      pendingCalls.push(call);

      return function () {
        pendingCalls.splice(pendingCalls.indexOf(call), 1);
      };
    }
  }

  function noop() {}

  var playStatuses = {
    PLAYING: "PLAYING",
    STOPPED: "STOPPED",
    PAUSED: "PAUSED",
  };
  //import { soundManager } from "soundmanager2";
  /*soundManager.setup({
    url: "/swf/",
    debugMode: false,
  }); */
  var script = {
    props: {
      url: {
        type: String,
        required: true,
      },
      playStatus: {
        type: String,
        validator: function (value) {
          return Object.keys(playStatuses).indexOf(value) !== -1;
        },
        required: true,
      },
      position: {
        type: Number,
      },
      playFromPosition: {
        type: Number,
      },
      volume: {
        type: Number,
        default: 100,
      },
      playbackRate: {
        type: Number,
        default: 1,
      },

      onError: {
        type: Function,
        default: noop,
      },
      onLoading: { type: Function, default: noop },
      onPlaying: { type: Function, default: noop },
      onLoad: { type: Function, default: noop },
      onPause: { type: Function, default: noop },
      onResume: { type: Function, default: noop },
      onStop: { type: Function, default: noop },
      onFinishedPlaying: { type: Function, default: noop },
      onBufferChange: { type: Function, default: noop },
      autoLoad: { type: Boolean, default: false },
      loop: { type: Boolean, default: false },
      randUrl: { type: Boolean, default: false },
    },
    //data: function () {
    // return {
    //stopCreatingSound: null,
    //sound: null,
    //};
    //},
    watch: {
      playStatus: function () {
        var this$1 = this;

        this.createSound(function (sound) { return this$1.updateSound(sound); });
      },
    },
    mounted: function mounted() {
      var this$1 = this;

      this.createSound(function (sound) { return this$1.updateSound(sound); });
    },
    destroyed: function destroyed() {
      this.removeSound();
    },
    methods: {
      createSound: function createSound$1(callback) {
        var this$1 = this;

        this.removeSound();

        var instance = this;

        if (!this.url) {
          return;
        }

        this.stopCreatingSound = createSound(
          {
            url: this.createRandUrl(this.url),
            autoLoad: this.autoLoad,
            volume: this.volume,
            position: this.playFromPosition || this.position || 0,
            playbackRate: this.playbackRate,
            whileloading: function whileloading() {
              instance.onLoading(this);
            },
            whileplaying: function whileplaying() {
              instance.onPlaying(this);
            },
            onerror: function onerror(errorCode, description) {
              instance.onError(errorCode, description, this);
            },
            onload: function onload() {
              instance.onLoad(this);
            },
            onpause: function onpause() {
              instance.onPause(this);
            },
            onresume: function onresume() {
              instance.onResume(this);
            },
            onstop: function onstop() {
              instance.onStop(this);
            },
            onfinish: function onfinish() {
              if (instance.loop && instance.playStatus === playStatuses.PLAYING) {
                instance.sound.play();
              } else {
                instance.onFinishedPlaying();
              }
            },
            onbufferchange: function onbufferchange() {
              instance.onBufferChange(this.isBuffering);
            },
          },
          function (sound) {
            this$1.sound = sound;
            callback(sound);
          }
        );
      },
      updateSound: function updateSound(sound, prevProps) {
        if ( prevProps === void 0 ) prevProps = {};

        if (!sound) {
          return;
        }
        if (this.playStatus === playStatuses.PLAYING) {
          if (sound.playState === 0) {
            sound.play();
          }

          if (sound.paused) {
            sound.resume();
          }
        } else if (this.playStatus === playStatuses.STOPPED) {
          if (sound.playState !== 0) {
            sound.stop();
          }
        } else {
          // this.playStatus === playStatuses.PAUSED
          if (!sound.paused) {
            sound.pause();
          }
        }

        if (this.playFromPosition != null) {
          if (this.playFromPosition !== prevProps.playFromPosition) {
            sound.setPosition(this.playFromPosition);
          }
        }

        if (this.position != null) {
          if (
            sound.position !== this.position &&
            Math.round(sound.position) !== Math.round(this.position)
          ) {
            sound.setPosition(this.position);
          }
        }

        if (this.volume !== prevProps.volume) {
          sound.setVolume(this.volume);
        }

        if (this.playbackRate !== prevProps.playbackRate) {
          sound.setPlaybackRate(this.playbackRate);
        }
      },
      removeSound: function removeSound() {
        if (this.stopCreatingSound) {
          this.stopCreatingSound();
          delete this.stopCreatingSound;
        }

        if (this.sound) {
          try {
            this.sound.destruct();
          } catch (e) {} // eslint-disable-line

          delete this.sound;
        }
      },
      createRandUrl: function createRandUrl(url) {
        if (!this.randUrl) {
          return url;
        }
        return url + (url.indexOf("?") === -1 ? "?" : "&") + "q=" + Math.random();
      },
    },
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
          createInjectorSSR = createInjector;
          createInjector = shadowMode;
          shadowMode = false;
      }
      // Vue.extend constructor export interop.
      var options = typeof script === 'function' ? script.options : script;
      // render functions
      if (template && template.render) {
          options.render = template.render;
          options.staticRenderFns = template.staticRenderFns;
          options._compiled = true;
          // functional template
          if (isFunctionalTemplate) {
              options.functional = true;
          }
      }
      // scopedId
      if (scopeId) {
          options._scopeId = scopeId;
      }
      var hook;
      if (moduleIdentifier) {
          // server build
          hook = function (context) {
              // 2.3 injection
              context =
                  context || // cached call
                      (this.$vnode && this.$vnode.ssrContext) || // stateful
                      (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
              // 2.2 with runInNewContext: true
              if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                  context = __VUE_SSR_CONTEXT__;
              }
              // inject component styles
              if (style) {
                  style.call(this, createInjectorSSR(context));
              }
              // register component module identifier for async chunk inference
              if (context && context._registeredComponents) {
                  context._registeredComponents.add(moduleIdentifier);
              }
          };
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook;
      }
      else if (style) {
          hook = shadowMode
              ? function (context) {
                  style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
              }
              : function (context) {
                  style.call(this, createInjector(context));
              };
      }
      if (hook) {
          if (options.functional) {
              // register for functional component in vue file
              var originalRender = options.render;
              options.render = function renderWithStyleInjection(h, context) {
                  hook.call(context);
                  return originalRender(h, context);
              };
          }
          else {
              // inject component registration as beforeCreate hook
              var existing = options.beforeCreate;
              options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
      }
      return script;
  }

  var isOldIE = typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
  function createInjector(context) {
      return function (id, style) { return addStyle(id, style); };
  }
  var HEAD;
  var styles = {};
  function addStyle(id, css) {
      var group = isOldIE ? css.media || 'default' : id;
      var style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
      if (!style.ids.has(id)) {
          style.ids.add(id);
          var code = css.source;
          if (css.map) {
              // https://developer.chrome.com/devtools/docs/javascript-debugging
              // this makes source maps inside style tags work properly in Chrome
              code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
              // http://stackoverflow.com/a/26603875
              code +=
                  '\n/*# sourceMappingURL=data:application/json;base64,' +
                      btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                      ' */';
          }
          if (!style.element) {
              style.element = document.createElement('style');
              style.element.type = 'text/css';
              if (css.media)
                  { style.element.setAttribute('media', css.media); }
              if (HEAD === undefined) {
                  HEAD = document.head || document.getElementsByTagName('head')[0];
              }
              HEAD.appendChild(style.element);
          }
          if ('styleSheet' in style.element) {
              style.styles.push(code);
              style.element.styleSheet.cssText = style.styles
                  .filter(Boolean)
                  .join('\n');
          }
          else {
              var index = style.ids.size - 1;
              var textNode = document.createTextNode(code);
              var nodes = style.element.childNodes;
              if (nodes[index])
                  { style.element.removeChild(nodes[index]); }
              if (nodes.length)
                  { style.element.insertBefore(textNode, nodes[index]); }
              else
                  { style.element.appendChild(textNode); }
          }
      }
  }

  /* script */
  var __vue_script__ = script;

  /* template */
  var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div")
  };
  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;

    /* style */
    var __vue_inject_styles__ = function (inject) {
      if (!inject) { return }
      inject("data-v-16f447e0_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", map: {"version":3,"sources":[],"names":[],"mappings":"","file":"vue-soundmanager.vue"}, media: undefined });

    };
    /* scoped */
    var __vue_scope_id__ = undefined;
    /* module identifier */
    var __vue_module_identifier__ = undefined;
    /* functional template */
    var __vue_is_functional_template__ = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    var __vue_component__ = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
      __vue_inject_styles__,
      __vue_script__,
      __vue_scope_id__,
      __vue_is_functional_template__,
      __vue_module_identifier__,
      false,
      createInjector,
      undefined,
      undefined
    );

  // Импорт vue компонента

  // Declare install function executed by Vue.use()
  function install(Vue) {
    if (install.installed) { return; }
    install.installed = true;
    Vue.component('VueSoundmanager', __vue_component__);
  }

  // Create module definition for Vue.use()
  var plugin = {
    install: install
  };

  // Auto-install when vue is found (eg. in browser via <script> tag)
  var GlobalVue = null;
  if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
  } else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue;
  }
  if (GlobalVue) {
    GlobalVue.use(plugin);
  }

  exports.default = __vue_component__;
  exports.install = install;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
