<template></template>
<script>
const pendingCalls = [];
let initialized = false; // declaring initialized to false

let soundManager;
// Allow server side rendering
if (typeof window !== "undefined") {
  if (process.env.NODE_ENV !== "production") {
    ({ soundManager } = require("soundmanager2"));
  } else {
    ({ soundManager } = require("soundmanager2/script/soundmanager2-nodebug"));
  }

  soundManager.onready(() => {
    pendingCalls.slice().forEach((cb) => cb());
  });
}

function createSound(options, cb) {
  if (soundManager.ok()) {
    cb(soundManager.createSound(options));
    return () => {};
  } else {
    if (!initialized) {
      initialized = true;
      soundManager.beginDelayedInit();
    }

    const call = () => {
      cb(soundManager.createSound(options));
    };

    pendingCalls.push(call);

    return () => {
      pendingCalls.splice(pendingCalls.indexOf(call), 1);
    };
  }
}

function noop() {}

const playStatuses = {
  PLAYING: "PLAYING",
  STOPPED: "STOPPED",
  PAUSED: "PAUSED",
};
//import { soundManager } from "soundmanager2";
/*soundManager.setup({
  url: "/swf/",
  debugMode: false,
}); */
export default {
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
      this.createSound((sound) => this.updateSound(sound));
    },
  },
  mounted() {
    this.createSound((sound) => this.updateSound(sound));
  },
  destroyed() {
    this.removeSound();
  },
  methods: {
    createSound(callback) {
      this.removeSound();

      const instance = this;

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
          whileloading() {
            instance.onLoading(this);
          },
          whileplaying() {
            instance.onPlaying(this);
          },
          onerror(errorCode, description) {
            instance.onError(errorCode, description, this);
          },
          onload() {
            instance.onLoad(this);
          },
          onpause() {
            instance.onPause(this);
          },
          onresume() {
            instance.onResume(this);
          },
          onstop() {
            instance.onStop(this);
          },
          onfinish() {
            if (instance.loop && instance.playStatus === playStatuses.PLAYING) {
              instance.sound.play();
            } else {
              instance.onFinishedPlaying();
            }
          },
          onbufferchange() {
            instance.onBufferChange(this.isBuffering);
          },
        },
        (sound) => {
          this.sound = sound;
          callback(sound);
        }
      );
    },
    updateSound(sound, prevProps = {}) {
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
    removeSound() {
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
    createRandUrl(url) {
      if (!this.randUrl) {
        return url;
      }
      return url + (url.indexOf("?") === -1 ? "?" : "&") + "q=" + Math.random();
    },
  },
};
</script>

<style>
</style>
