# vue-soundmanager

Sound component to play audio in your web apps. Backed by the mighty [soundmanager2](https://github.com/scottschiller/SoundManager2) library.

## How to install

`npm install  @serh/vue-soundmanager --save`

## Example

```vue
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
```

### Props

* *url (string)*: The url of the sound to play.
* *playStatus (Sound.status.{PLAYING,STOPPED,PAUSED})*: The current sound playing status. Change it in successive renders to play, stop, pause and resume the sound.
* *randUrl(boolean)*: Used to generate a random url part to avoid caching(adding to the end of the url: ?q=0.7082691772731812)
* *playFromPosition (number)*: Seeks to the position specified by this prop, any time it changes. After that, the sound will continue playing (or not, if the `playStatus` is not `PLAYING`). Use this prop to seek to different positions in the sound, but not use it as a controlled component. You should use either this prop or `position`, but not both.
* *position (number)*: The current position the sound is at. Use this to make the component a controlled component, meaning that you must update this prop on every `onPlaying` callback. You should use either this prop or `playFromPosition`, but not both.
* *volume (number)*: The current sound's volume. A value between 0 and 100.
* *playbackRate (number)*: Number affecting sound playback. A value between 0.5 and 4 of normal rate (1).
* *autoLoad (boolean)*: If the sound should start loading automatically (defaults to `false`).
* *loop (boolean)*: If the sound should continue playing in a loop (defaults to `false`).
* *onError (function)*: Function that gets called when the sound fails to load, or fails during load or playback. It receives the arguments `errorCode` and `description` with details about the error.
* *onLoading (function)*: Function that gets called while the sound is loading. It receives an object with properties `bytesLoaded`, `bytesTotal` and `duration`.
* *onLoad (function)*: Function that gets called after the sound has finished loading. It receives an object with property `loaded`, a boolean set to true if the sound has finished loading successfully.
* *onPlaying (function)*: Function that gets called while the sound is playing. It receives an object with properties `position` and `duration`.
* *onPause (function)*: Function that gets called when the sound is paused. It receives an object with properties `position` and `duration`.
* *onResume (function)*: Function that gets called while the sound is resumed playing. It receives an object with properties `position` and `duration`.
* *onStop (function)*: Function that gets called while the sound playback is stopped. It receives an object with properties `position` and `duration`.
* *onFinishedPlaying (function)*: Function that gets called when the sound finishes playing (reached end of sound). It receives no parameters.
* *onBufferChange (function)*: Function that gets called when the sound buffering status changes. It receives a single boolean representing the buffer state.