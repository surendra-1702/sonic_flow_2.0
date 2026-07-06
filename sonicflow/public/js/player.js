const Player = {
  audio: new Audio(),
  currentSong: null,

  context: null,

  queue: [],
  currentIndex: -1,
  shuffle: false,
  repeat: 'off',

  volume: 0.7,
  isSeeking: false,
  callbacks: {},

  dom: {},

  init() {
    this.dom = {
      cover: document.getElementById('playerCover'),
      title: document.getElementById('playerTitle'),
      artist: document.getElementById('playerArtist'),
      fav: document.getElementById('playerFav'),
      playBtn: document.getElementById('playBtn'),
      prevBtn: document.getElementById('prevBtn'),
      nextBtn: document.getElementById('nextBtn'),
      shuffleBtn: document.getElementById('shuffleBtn'),
      repeatBtn: document.getElementById('repeatBtn'),
      currentTime: document.getElementById('currentTime'),
      duration: document.getElementById('duration'),
      progressBar: document.getElementById('progressBar'),
      progressFill: document.getElementById('progressFill'),
      muteBtn: document.getElementById('muteBtn'),
      volumeBar: document.getElementById('volumeBar'),
      volumeFill: document.getElementById('volumeFill'),
      queueBtn: document.getElementById('queueBtn'),
      expCover: document.getElementById('playerExpandedCover'),
      expTitle: document.getElementById('playerExpandedTitle'),
      expArtist: document.getElementById('playerExpandedArtist'),
      expFav: document.getElementById('expFavBtn'),
      expPlayBtn: document.getElementById('expPlayBtn'),
      expPrevBtn: document.getElementById('expPrevBtn'),
      expNextBtn: document.getElementById('expNextBtn'),
      expShuffleBtn: document.getElementById('expShuffleBtn'),
      expRepeatBtn: document.getElementById('expRepeatBtn'),
      expMuteBtn: document.getElementById('expMuteBtn'),
      expVolumeBar: document.getElementById('expVolumeBar'),
      expVolumeFill: document.getElementById('expVolumeFill'),
      expQueueBtn: document.getElementById('expQueueBtn'),
      expCurrentTime: document.getElementById('expCurrentTime'),
      expDuration: document.getElementById('expDuration'),
      expProgressBar: document.getElementById('expProgressBar'),
      expProgressFill: document.getElementById('expProgressFill'),
    };

    this.audio.volume = this.volume;

    this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.audio.addEventListener('loadedmetadata', () => this.onLoadedMeta());
    this.audio.addEventListener('ended', () => this.onEnded());
    this.audio.addEventListener('error', (e) => {
      const err = this.audio.error;
      let msg = 'Failed to load audio';
      if (err) {
        const codes = { 1: 'aborted', 2: 'network error', 3: 'decode error', 4: 'not supported' };
        msg += ' (' + (codes[err.code] || err.code) + ')';
      }
      showToast(msg, 'error');
    });

    this.bindControls();
    this.bindExpandedControls();
    this.bindKeyboard();
  },

  bindControls() {
    this.dom.playBtn.addEventListener('click', () => this.togglePlay());
    this.dom.prevBtn.addEventListener('click', () => this.prev());
    this.dom.nextBtn.addEventListener('click', () => this.next());
    this.dom.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
    this.dom.repeatBtn.addEventListener('click', () => this.toggleRepeat());
    this.dom.muteBtn.addEventListener('click', () => this.toggleMute());
    this.dom.fav.addEventListener('click', () => this.toggleFav());

    this.dom.progressBar.addEventListener('click', (e) => {
      if (!this.audio.duration) return;
      const rect = this.dom.progressBar.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      this.seek(ratio * this.audio.duration);
    });

    let dragging = false;
    const onMove = (e) => {
      if (!dragging || !this.audio.duration) return;
      const rect = this.dom.progressBar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.dom.progressFill.style.width = `${ratio * 100}%`;
      this.dom.currentTime.textContent = formatTime(ratio * this.audio.duration);
    };
    this.dom.progressBar.addEventListener('mousedown', () => { dragging = true; });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', () => {
      if (dragging) {
        dragging = false;
        const w = parseFloat(this.dom.progressFill.style.width);
        if (this.audio.duration) {
          this.seek((w / 100) * this.audio.duration);
        }
      }
    });

    this.dom.volumeBar.addEventListener('click', (e) => {
      const rect = this.dom.volumeBar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.setVolume(ratio);
    });
  },

  bindExpandedControls() {
    if (this.dom.expPlayBtn) {
      this.dom.expPlayBtn.addEventListener('click', () => this.togglePlay());
      this.dom.expPrevBtn.addEventListener('click', () => this.prev());
      this.dom.expNextBtn.addEventListener('click', () => this.next());
      this.dom.expShuffleBtn.addEventListener('click', () => this.toggleShuffle());
      this.dom.expRepeatBtn.addEventListener('click', () => this.toggleRepeat());
      this.dom.expMuteBtn.addEventListener('click', () => this.toggleMute());
      this.dom.expFav.addEventListener('click', () => this.toggleFav());
      this.dom.expQueueBtn.addEventListener('click', () => {
        document.getElementById('queueBtn')?.click();
      });
      document.getElementById('playerExpandedClose')?.addEventListener('click', () => this.hideExpanded());
      document.getElementById('playerExpanded')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) this.hideExpanded();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !document.getElementById('playerExpanded')?.classList.contains('hidden')) {
          this.hideExpanded();
        }
      });

      this.dom.expVolumeBar.addEventListener('click', (e) => {
        const rect = this.dom.expVolumeBar.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.setVolume(ratio);
      });

      this.dom.expProgressBar.addEventListener('click', (e) => {
        if (!this.audio.duration) return;
        const rect = this.dom.expProgressBar.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        this.seek(ratio * this.audio.duration);
      });

      this.dom.cover.addEventListener('click', () => this.showExpanded());
      document.querySelector('.player-info')?.addEventListener('click', () => this.showExpanded());
      this.dom.expCover.addEventListener('click', (e) => e.stopPropagation());
    }
  },

  showExpanded() {
    const el = document.getElementById('playerExpanded');
    if (!el) return;
    if (window.innerWidth >= 768) return;
    el.classList.remove('hidden');
  },

  hideExpanded() {
    const el = document.getElementById('playerExpanded');
    if (el) el.classList.add('hidden');
  },

  bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          this.togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.seek(Math.max(0, (this.audio.currentTime || 0) - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.seek(Math.min(this.audio.duration || 0, (this.audio.currentTime || 0) + 5));
          break;
      }
    });
  },

  startPlayback(type, songs, startIndex = 0) {
    if (!songs || songs.length === 0) return;

    this.context = {
      type,
      queue: [...songs],
      currentIndex: startIndex,
      originalQueue: [...songs],
      shuffledQueue: null,
    };

    this.queue = this.context.queue;
    this.currentIndex = startIndex;
    this.shuffle = false;
    this.dom.shuffleBtn.classList.remove('active-btn');
    if (this.dom.expShuffleBtn) this.dom.expShuffleBtn.classList.remove('active-btn');

    this.load(songs[startIndex]);
    this.play();
    this.saveHistory(songs[startIndex]);

    if (this.callbacks.onQueueChange) this.callbacks.onQueueChange();
  },

  load(song) {
    if (!song) return;
    this.currentSong = song;

    this.audio.src = `/api/audio/${song._id}`;
    this.audio.load();

    const coverSrc = getCoverUrl(song);
    const titleText = song.title || 'Unknown';
    const artistName = typeof song.artist === 'object' ? song.artist.name : (song.artist || 'Unknown');

    this.dom.cover.src = coverSrc;
    this.dom.cover.alt = titleText;
    this.dom.title.textContent = titleText;
    this.dom.artist.textContent = artistName;

    this.dom.fav.innerHTML = '<i class="far fa-heart"></i>';
    this.dom.fav.classList.remove('liked');

    if (this.dom.expCover) {
      this.dom.expCover.src = coverSrc;
      this.dom.expCover.alt = titleText;
      this.dom.expTitle.textContent = titleText;
      this.dom.expArtist.textContent = artistName;
      this.dom.expFav.innerHTML = '<i class="far fa-heart"></i>';
      this.dom.expFav.classList.remove('liked');
    }

    document.title = `${titleText} - SonicFlow`;
  },

  play() {
    const promise = this.audio.play();
    if (promise !== undefined) {
      promise.catch((err) => {
        if (err.name === 'NotAllowedError') {
          showToast('Click play to start listening', 'info');
        }
      });
    }
    this.dom.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    this.dom.playBtn.title = 'Pause';
    if (this.dom.expPlayBtn) {
      this.dom.expPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
      this.dom.expPlayBtn.title = 'Pause';
    }
  },

  pause() {
    this.audio.pause();
    this.dom.playBtn.innerHTML = '<i class="fas fa-play"></i>';
    this.dom.playBtn.title = 'Play';
    if (this.dom.expPlayBtn) {
      this.dom.expPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
      this.dom.expPlayBtn.title = 'Play';
    }
  },

  togglePlay() {
    if (!this.currentSong) return;
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  },

  next() {
    if (this.queue.length === 0) return;
    if (this.repeat === 'one') {
      this.seek(0);
      this.play();
      return;
    }
    const idx = this.currentIndex + 1;
    if (idx >= this.queue.length) {
      if (this.repeat === 'all') {
        this.currentIndex = 0;
        this.load(this.queue[0]);
        this.play();
        this.saveHistory(this.queue[0]);
      } else {
        this.pause();
        this.seek(0);
      }
      return;
    }
    this.currentIndex = idx;
    this.load(this.queue[idx]);
    this.play();
    this.saveHistory(this.queue[idx]);
  },

  prev() {
    if (this.queue.length === 0) return;
    if (this.audio.currentTime > 3) {
      this.seek(0);
      return;
    }
    const idx = this.currentIndex - 1;
    if (idx < 0) {
      if (this.repeat === 'all') {
        this.currentIndex = this.queue.length - 1;
        this.load(this.queue[this.queue.length - 1]);
        this.play();
        this.saveHistory(this.queue[this.queue.length - 1]);
      } else {
        this.seek(0);
      }
      return;
    }
    this.currentIndex = idx;
    this.load(this.queue[idx]);
    this.play();
    this.saveHistory(this.queue[idx]);
  },

  seek(time) {
    if (!this.audio.duration) return;
    this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration));
  },

  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
    this.audio.volume = this.volume;
    this.audio.muted = false;
    this.dom.volumeFill.style.width = `${this.volume * 100}%`;
    if (this.dom.expVolumeFill) {
      this.dom.expVolumeFill.style.width = `${this.volume * 100}%`;
    }
    this.updateMuteIcon();
  },

  toggleMute() {
    this.audio.muted = !this.audio.muted;
    this.updateMuteIcon();
  },

  updateMuteIcon() {
    const muted = this.audio.muted || this.volume === 0;
    const html = muted
      ? '<i class="fas fa-volume-mute"></i>'
      : this.volume > 0.5
        ? '<i class="fas fa-volume-up"></i>'
        : '<i class="fas fa-volume-down"></i>';
    this.dom.muteBtn.innerHTML = html;
    if (this.dom.expMuteBtn) {
      this.dom.expMuteBtn.innerHTML = html;
    }
  },

  toggleShuffle() {
    if (!this.context) return;

    if (this.shuffle) {
      this.queue = [...this.context.originalQueue];
      this.currentIndex = this.queue.findIndex(s => s._id === this.currentSong._id);
      if (this.currentIndex === -1) this.currentIndex = 0;
      this.context.queue = this.queue;
      this.context.shuffledQueue = null;
      this.shuffle = false;
      this.dom.shuffleBtn.classList.remove('active-btn');
      if (this.dom.expShuffleBtn) this.dom.expShuffleBtn.classList.remove('active-btn');
      showToast('Shuffle off');
    } else {
      this.context.originalQueue = [...this.queue];

      const current = this.queue[this.currentIndex];
      const rest = this.queue.filter((_, i) => i !== this.currentIndex);
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }

      const shuffled = [current, ...rest];
      this.context.shuffledQueue = shuffled;
      this.queue = shuffled;
      this.context.queue = shuffled;
      this.currentIndex = 0;
      this.shuffle = true;
      this.dom.shuffleBtn.classList.add('active-btn');
      if (this.dom.expShuffleBtn) this.dom.expShuffleBtn.classList.add('active-btn');
      showToast('Shuffle on');
    }

    if (this.callbacks.onQueueChange) this.callbacks.onQueueChange();
  },

  toggleRepeat() {
    const modes = ['off', 'all', 'one'];
    const idx = modes.indexOf(this.repeat);
    this.repeat = modes[(idx + 1) % 3];
    this.dom.repeatBtn.classList.toggle('active-btn', this.repeat !== 'off');
    if (this.dom.expRepeatBtn) this.dom.expRepeatBtn.classList.toggle('active-btn', this.repeat !== 'off');
    const icons = { off: 'fa-repeat', all: 'fa-repeat', one: 'fa-repeat-1' };
    this.dom.repeatBtn.innerHTML = `<i class="fas ${icons[this.repeat]}"></i>`;
    if (this.dom.expRepeatBtn) {
      this.dom.expRepeatBtn.innerHTML = `<i class="fas ${icons[this.repeat]}"></i>`;
    }
    if (this.repeat === 'one') {
      ['repeatBtn', 'expRepeatBtn'].forEach(id => {
        const el = this.dom[id === 'repeatBtn' ? 'repeatBtn' : 'expRepeatBtn'];
        if (!el) return;
        const i = el.querySelector('i');
        if (i) { i.style.position = 'relative'; i.textContent = '1'; i.style.fontSize = '0.75rem'; }
      });
    }
    const labels = { off: 'Repeat off', all: 'Repeat all', one: 'Repeat one' };
    showToast(labels[this.repeat]);
  },

  async toggleFav() {
    if (!this.currentSong) return;
    const isLiked = this.dom.fav.classList.contains('liked');
    const id = this.currentSong._id;
    try {
      if (isLiked) {
        await apiFetch(`/favorites/${id}`, { method: 'DELETE' });
        this.dom.fav.innerHTML = '<i class="far fa-heart"></i>';
        this.dom.fav.classList.remove('liked');
        if (this.dom.expFav) {
          this.dom.expFav.innerHTML = '<i class="far fa-heart"></i>';
          this.dom.expFav.classList.remove('liked');
        }
        showToast('Removed from favorites');
      } else {
        await apiFetch(`/favorites/${id}`, { method: 'POST' });
        this.dom.fav.innerHTML = '<i class="fas fa-heart"></i>';
        this.dom.fav.classList.add('liked');
        if (this.dom.expFav) {
          this.dom.expFav.innerHTML = '<i class="fas fa-heart"></i>';
          this.dom.expFav.classList.add('liked');
        }
        showToast('Added to favorites');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  async saveHistory(song) {
    if (!song || !song._id) return;
    try {
      await apiFetch('/history', {
        method: 'POST',
        body: JSON.stringify({ songId: song._id }),
      });
    } catch {}
  },

  playSong(song, queue = []) {
    if (queue.length > 0) {
      this.startPlayback('direct', queue, queue.findIndex(s => s._id === song._id));
    } else {
      this.startPlayback('direct', [song], 0);
    }
  },

  playQueue(queue, startIndex = 0) {
    this.startPlayback('direct', queue, startIndex);
  },

  addToQueue(song) {
    if (!this.context) {
      this.startPlayback('direct', [song], 0);
      return;
    }
    this.queue.push(song);
    this.context.originalQueue.push(song);
    showToast('Added to queue');
    if (this.callbacks.onQueueChange) this.callbacks.onQueueChange();
  },

  playNext(song) {
    if (!this.context) {
      this.startPlayback('direct', [song], 0);
      return;
    }
    this.queue.splice(this.currentIndex + 1, 0, song);
    this.context.originalQueue.splice(this.currentIndex + 1, 0, song);
    showToast('Will play next');
    if (this.callbacks.onQueueChange) this.callbacks.onQueueChange();
  },

  removeFromQueue(index) {
    if (index < 0 || index >= this.queue.length) return;
    const removedId = this.queue[index]._id;
    this.queue.splice(index, 1);
    if (this.context) {
      const origIdx = this.context.originalQueue.findIndex(s => s._id === removedId);
      if (origIdx !== -1) this.context.originalQueue.splice(origIdx, 1);
    }
    if (index < this.currentIndex) this.currentIndex--;
    else if (this.currentIndex >= this.queue.length) this.currentIndex = this.queue.length - 1;
    showToast('Removed from queue');
    if (this.callbacks.onQueueChange) this.callbacks.onQueueChange();
  },

  clearQueue() {
    this.queue = [];
    this.currentIndex = -1;
    if (this.context) {
      this.context.queue = [];
      this.context.originalQueue = [];
      this.context.shuffledQueue = null;
      this.context.currentIndex = -1;
    }
    this.shuffle = false;
    this.dom.shuffleBtn.classList.remove('active-btn');
    if (this.dom.expShuffleBtn) this.dom.expShuffleBtn.classList.remove('active-btn');
    showToast('Queue cleared');
    if (this.callbacks.onQueueChange) this.callbacks.onQueueChange();
  },

  onTimeUpdate() {
    if (this.isSeeking) return;
    const current = this.audio.currentTime || 0;
    const dur = this.audio.duration || 0;
    const timeStr = formatTime(current);
    this.dom.currentTime.textContent = timeStr;
    if (this.dom.expCurrentTime) this.dom.expCurrentTime.textContent = timeStr;
    if (dur) {
      const pct = `${(current / dur) * 100}%`;
      this.dom.progressFill.style.width = pct;
      if (this.dom.expProgressFill) this.dom.expProgressFill.style.width = pct;
    }
  },

  onLoadedMeta() {
    const durStr = formatTime(this.audio.duration);
    this.dom.duration.textContent = durStr;
    if (this.dom.expDuration) this.dom.expDuration.textContent = durStr;
  },

  onEnded() {
    if (this.repeat === 'one') {
      this.seek(0);
      this.play();
    } else {
      this.next();
    }
  },
};
