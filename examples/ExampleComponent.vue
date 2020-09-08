<template>
  <div>
    <div v-if="loading">loading</div>
    <button @click="play" type="button">play</button>
    <button @click="stop" type="button">stop</button>
    <vue-soundmanager
      :onPlaying="eventPlaying"
      :randUrl="randUrl"
      :url="url"
      :playStatus="playStatus"
    ></vue-soundmanager>
  </div>
</template>

<script>
import VueSoundmanager from "@serh/vue-soundmanager";
export default {
  data: function () {
    return {
      loading: false,
      randUrl: true,
      playStatus: "STOPPED",
      url: "https://stream.rockland.de/rockland.mp3",
    };
  },
  components: {
    VueSoundmanager,
  },
  methods: {
    play() {
      this.playStatus = "PLAYING";
      this.loading = true;
    },
    stop() {
      this.playStatus = "STOPPED";
    },
    eventPlaying() {
      this.loading = false;
    },
  },
};
</script>


