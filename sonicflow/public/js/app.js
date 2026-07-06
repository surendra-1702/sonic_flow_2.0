(function () {
  if (!getToken()) {
    window.location.href = '/auth.html';
    return;
  }

  const app = document.getElementById('app');

  app.innerHTML = `
    <nav class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <i class="fas fa-headphones"></i>
        <span>SonicFlow</span>
      </div>
      <div class="sidebar-nav">
        <a href="#" class="nav-item active" data-view="home"><i class="fas fa-home"></i> Home</a>
        <a href="#" class="nav-item" data-view="search"><i class="fas fa-search"></i> Search</a>
        <a href="#" class="nav-item" data-view="library"><i class="fas fa-book"></i> Library</a>
      </div>
      <div class="sidebar-playlists">
        <div class="sidebar-section-title">Playlists</div>
        <div class="playlist-list" id="playlistList"></div>
        <button class="create-playlist-btn" id="createPlaylistBtn">
          <i class="fas fa-plus"></i> Create Playlist
        </button>
      </div>
      <div class="sidebar-user" id="sidebarUser">
        <div class="user-avatar"><i class="fas fa-user"></i></div>
        <div class="user-name" id="sidebarUserName"></div>
        <button class="logout-btn" id="logoutBtn" title="Sign out"><i class="fas fa-sign-out-alt"></i></button>
      </div>
    </nav>

    <main class="main-content" id="mainContent">
      <div class="view" id="viewHome"></div>
      <div class="view hidden" id="viewSearch"></div>
      <div class="view hidden" id="viewLibrary"></div>
      <div class="view hidden" id="viewArtist"></div>
      <div class="view hidden" id="viewAlbum"></div>
    </main>

    <aside class="queue-panel hidden" id="queuePanel">
      <div class="queue-panel-header">
        <h3>Queue</h3>
        <button id="queuePanelClose"><i class="fas fa-times"></i></button>
      </div>
      <div class="queue-panel-now-playing" id="queueNowPlaying">
        <div class="queue-now-label">Now Playing</div>
        <div class="queue-now-song" id="queueNowSong">-</div>
      </div>
      <div class="queue-panel-next" id="queueNextSection">
        <div class="queue-next-label">Next Up <span id="queueCount"></span></div>
        <div class="queue-list" id="queueList"></div>
      </div>
      <div class="queue-empty" id="queueEmpty">
        <i class="fas fa-music"></i>
        <p>Your queue is empty</p>
        <p class="queue-empty-hint">Play a song or add one from the library</p>
      </div>
      <button class="queue-clear-btn" id="queueClearBtn"><i class="fas fa-trash-alt"></i> Clear Queue</button>
    </aside>

    <div class="player-bar" id="playerBar">
      <div class="player-left">
        <img class="player-cover" id="playerCover" src="" alt="">
        <div class="player-info">
          <div class="player-title" id="playerTitle">No song playing</div>
          <div class="player-artist" id="playerArtist">Select a song to begin</div>
        </div>
        <button class="player-fav" id="playerFav" title="Like"><i class="far fa-heart"></i></button>
      </div>
      <div class="player-center">
        <div class="player-controls">
          <button id="shuffleBtn" class="mobile-hide" title="Shuffle"><i class="fas fa-random"></i></button>
          <button id="prevBtn" title="Previous"><i class="fas fa-step-backward"></i></button>
          <button class="play-btn" id="playBtn" title="Play"><i class="fas fa-play"></i></button>
          <button id="nextBtn" title="Next"><i class="fas fa-step-forward"></i></button>
          <button id="repeatBtn" class="mobile-hide" title="Repeat"><i class="fas fa-repeat"></i></button>
        </div>
        <div class="player-progress">
          <span class="time" id="currentTime">0:00</span>
          <div class="progress-bar" id="progressBar">
            <div class="progress-fill" id="progressFill"></div>
          </div>
          <span class="time" id="duration">0:00</span>
        </div>
      </div>
      <div class="player-right">
        <button id="queueBtn" class="mobile-hide" title="Queue"><i class="fas fa-list"></i></button>
        <button id="muteBtn" class="mobile-hide" title="Mute"><i class="fas fa-volume-up"></i></button>
        <div class="volume-bar">
          <div class="progress-bar volume-progress" id="volumeBar">
            <div class="progress-fill" id="volumeFill"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="player-expanded hidden" id="playerExpanded">
      <div class="player-expanded-content">
        <button class="player-expanded-close" id="playerExpandedClose"><i class="fas fa-chevron-down"></i></button>
        <div class="player-expanded-art">
          <img id="playerExpandedCover" src="" alt="">
        </div>
        <div class="player-expanded-info">
          <div class="player-expanded-title" id="playerExpandedTitle">No song playing</div>
          <div class="player-expanded-artist" id="playerExpandedArtist">Select a song to begin</div>
        </div>
        <div class="player-expanded-progress">
          <span class="time" id="expCurrentTime">0:00</span>
          <div class="progress-bar" id="expProgressBar">
            <div class="progress-fill" id="expProgressFill"></div>
          </div>
          <span class="time" id="expDuration">0:00</span>
        </div>
        <div class="player-expanded-controls">
          <button id="expShuffleBtn" title="Shuffle"><i class="fas fa-random"></i></button>
          <button id="expPrevBtn" title="Previous"><i class="fas fa-step-backward"></i></button>
          <button class="play-btn" id="expPlayBtn" title="Play"><i class="fas fa-play"></i></button>
          <button id="expNextBtn" title="Next"><i class="fas fa-step-forward"></i></button>
          <button id="expRepeatBtn" title="Repeat"><i class="fas fa-repeat"></i></button>
        </div>
        <div class="player-expanded-extras">
          <button id="expFavBtn" title="Like"><i class="far fa-heart"></i></button>
          <div class="player-expanded-volume">
            <button id="expMuteBtn" title="Volume"><i class="fas fa-volume-up"></i></button>
            <div class="progress-bar volume-progress" id="expVolumeBar">
              <div class="progress-fill" id="expVolumeFill"></div>
            </div>
          </div>
          <button id="expQueueBtn" title="Queue"><i class="fas fa-list"></i></button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('sidebarUserName').textContent = getUser()?.username || 'User';
  document.getElementById('logoutBtn').addEventListener('click', logout);

  const user = getUser();
  if (user) {
    const avatar = document.querySelector('.user-avatar');
    avatar.innerHTML = user.username
      ? user.username.charAt(0).toUpperCase()
      : '<i class="fas fa-user"></i>';
    avatar.style.fontWeight = '700';
    avatar.style.fontSize = '1.1rem';
    avatar.style.color = '#00bfff';
  }

  // ─── Mobile Sidebar ───
  let sidebarOpen = false;

  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger';
  hamburger.setAttribute('aria-label', 'Toggle navigation menu');
  hamburger.innerHTML = '<i class="fas fa-bars"></i>';

  const sidebarBackdrop = document.createElement('div');
  sidebarBackdrop.className = 'hamburger-backdrop';
  sidebarBackdrop.setAttribute('aria-hidden', 'true');

  document.getElementById('mainContent').prepend(hamburger);
  document.getElementById('app').appendChild(sidebarBackdrop);

  function openSidebar() {
    sidebarOpen = true;
    document.getElementById('sidebar').classList.add('open');
    sidebarBackdrop.classList.add('active');
    document.body.classList.add('sidebar-open');
    hamburger.innerHTML = '<i class="fas fa-times"></i>';
  }

  function closeSidebar() {
    sidebarOpen = false;
    document.getElementById('sidebar').classList.remove('open');
    sidebarBackdrop.classList.remove('active');
    document.body.classList.remove('sidebar-open');
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
  }

  hamburger.addEventListener('click', () => {
    if (sidebarOpen) closeSidebar();
    else openSidebar();
  });

  sidebarBackdrop.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebarOpen) closeSidebar();
  });

  // ─── Event Delegation ───
  function initEventDelegation() {
    const views = ['viewHome', 'viewSearch', 'viewLibrary', 'viewArtist', 'viewAlbum'];
    views.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', handleViewClick);
    });
    document.getElementById('queuePanel').addEventListener('click', handleQueuePanelClick);
  }

  function handleViewClick(e) {
    const view = e.currentTarget;
    const actionBtn = e.target.closest('[data-action]');
    const songCard = e.target.closest('.song-card');
    const trackRow = e.target.closest('.track-row');
    const artistCard = e.target.closest('.artist-card');
    const albumCard = e.target.closest('.album-card');
    const action = actionBtn?.dataset.action;

    if (songCard) {
      if (action === 'add-to-playlist') {
        e.stopPropagation();
        showAddToPlaylist(songCard.dataset.id);
        return;
      }
      const section = songCard.closest('.content-section');
      const context = section ? section._context : (view._context || []);
      playSongNow(songCard.dataset.id, context);
      return;
    }

    if (trackRow) {
      if (action === 'remove-track') {
        e.stopPropagation();
        const plId = trackRow.dataset.playlist;
        if (plId) {
          removeFromPlaylist(plId, trackRow.dataset.id).then(() => showPlaylistDetail(plId));
        }
        return;
      }
      const section = trackRow.closest('.content-section');
      const ctx = section ? section._context : (view._context || []);
      playSongNow(trackRow.dataset.id, ctx);
      return;
    }

    if (artistCard) {
      window.location.hash = '#artist/' + artistCard.dataset.id;
      return;
    }

    if (albumCard) {
      window.location.hash = '#album/' + albumCard.dataset.id;
      return;
    }

    if (actionBtn) {
      switch (action) {
        case 'play-playlist':
          playPlaylist(actionBtn.dataset.id);
          break;
        case 'shuffle-playlist':
          shufflePlaylist(actionBtn.dataset.id);
          break;
        case 'add-songs':
          showAddSongsModal(actionBtn.dataset.id);
          break;
        case 'delete-playlist':
          deletePlaylist(actionBtn.dataset.id);
          break;
        case 'picker-create-playlist': {
          showCreatePlaylistModal();
          break;
        }
        case 'close-modal': {
          const modal = actionBtn.closest('.modal-overlay');
          if (modal) modal.remove();
          break;
        }
      }
    }
  }

  function handleQueuePanelClick(e) {
    const actionBtn = e.target.closest('[data-action]');
    const queueItem = e.target.closest('.queue-item');
    const action = actionBtn?.dataset.action;

    if (queueItem) {
      const index = parseInt(queueItem.dataset.index);
      if (isNaN(index) || index < 0) return;

      if (action === 'queue-remove') {
        removeFromServerQueue(index);
        return;
      }

      if (index >= 0 && index < Player.queue.length) {
        Player.playQueue(Player.queue, index);
        renderQueuePanel();
      }
    }

  }

  // ─── Playback ───
  async function playSongNow(songId, contextSongs = []) {
    try {
      let songs = contextSongs;
      let startIndex = 0;

      if (songs.length > 0) {
        startIndex = songs.findIndex((s) => s._id === songId);
        if (startIndex === -1) {
          const data = await apiFetch(`/songs/${songId}`);
          songs = [data.song];
          startIndex = 0;
        }
      } else {
        const data = await apiFetch(`/songs/${songId}`);
        songs = [data.song];
      }

      Player.startPlayback('direct', songs, startIndex);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // ─── Renderers ───
  function renderSongCard(song) {
    const artistName = typeof song.artist === 'object' && song.artist ? song.artist.name : (song.artist || 'Unknown');
    const cover = getCoverUrl(song);
    return `
      <div class="song-card" data-id="${song._id}">
        <div class="song-card-img">
          <img src="${cover}" alt="${song.title}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%231e1e1e%22 width=%22200%22 height=%22200%22/><text fill=%22%23555%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2240%22>🎵</text></svg>'">
          <button class="song-card-play" data-action="play">
            <i class="fas fa-play"></i>
          </button>
          <button class="song-card-add" data-action="add-to-playlist" title="Add to playlist">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        <div class="song-card-body">
          <div class="song-card-title">${song.title}</div>
          <div class="song-card-artist">${artistName}</div>
        </div>
      </div>
    `;
  }

  function renderTrackRow(song, index, showRemove = false, playlistId = '', subtitle) {
    const artistName = typeof song.artist === 'object' && song.artist ? song.artist.name : 'Unknown';
    const cover = getCoverUrl(song);
    const displaySub = subtitle !== undefined ? subtitle : artistName;
    const attrs = showRemove && playlistId ? `data-playlist="${playlistId}"` : '';
    const removeBtn = showRemove
      ? `<button class="track-remove" data-action="remove-track" title="Remove"><i class="fas fa-times"></i></button>`
      : '';
    return `
      <div class="track-row" data-id="${song._id}" ${attrs}>
        <span class="track-num">${index + 1}</span>
        <img class="track-cover" src="${cover}" alt="" loading="lazy" onerror="this.style.display='none'">
        <div class="track-info">
          <div class="track-title">${song.title}</div>
          <div class="track-artist">${displaySub}</div>
        </div>
        <span class="track-duration">${formatTime(song.duration)}</span>
        ${removeBtn}
      </div>
    `;
  }

  function renderArtistCard(artist) {
    const img = artist.image || '';
    return `
      <div class="artist-card" data-id="${artist._id}">
        <div class="artist-card-img">
          <img src="${img}" alt="${artist.name}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%231e1e1e%22 width=%22200%22 height=%22200%22/><text fill=%22%23555%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2240%22>🎤</text></svg>'">
        </div>
        <div class="artist-card-body">
          <div class="artist-card-name">${artist.name}</div>
          <div class="artist-card-label">Artist</div>
        </div>
      </div>
    `;
  }

  function renderAlbumCard(album) {
    const artistName = typeof album.artist === 'object' && album.artist ? album.artist.name : 'Unknown';
    const cover = album.coverImage || '';
    return `
      <div class="album-card" data-id="${album._id}">
        <div class="album-card-img">
          <img src="${cover}" alt="${album.title}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%231e1e1e%22 width=%22200%22 height=%22200%22/><text fill=%22%23555%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2240%22>💿</text></svg>'">
        </div>
        <div class="album-card-body">
          <div class="album-card-name">${album.title}</div>
          <div class="album-card-artist">${artistName}</div>
        </div>
      </div>
    `;
  }

  function renderSection(title, cardsHtml) {
    return `
      <section class="content-section">
        <div class="section-header-row">
          <h2>${title}</h2>
        </div>
        <div class="card-row">${cardsHtml}</div>
      </section>
    `;
  }

  function renderEmpty(message) {
    return `
      <div class="empty-state">
        <i class="fas fa-music"></i>
        <p>${message}</p>
      </div>
    `;
  }

  // ─── View Navigation ───
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.view').forEach((v) => v.classList.add('hidden'));
      const viewId = 'view' + item.dataset.view.charAt(0).toUpperCase() + item.dataset.view.slice(1);
      const view = document.getElementById(viewId);
      if (view) {
        view.classList.remove('hidden');
        if (item.dataset.view === 'library') loadLibraryView();
        if (item.dataset.view === 'search') loadSearchView();
      }
      if (window.innerWidth < 768) closeSidebar();
    });
  });

  // ─── Home Page ───
  async function loadHome() {
    const homeEl = document.getElementById('viewHome');
    homeEl.innerHTML = skeleton(6);

    try {
      const [recentlyAdded, trending, historyData] = await Promise.all([
        apiFetch('/songs/recently-added').catch(() => ({ songs: [] })),
        apiFetch('/songs/trending').catch(() => ({ songs: [] })),
        apiFetch('/history').catch(() => ({ history: [] })),
      ]);

      let html = '<div class="home-greeting"><h1>Good ' + (new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening') + '</h1></div>';

      const contexts = [];

      if (historyData.history && historyData.history.length > 0) {
        const songs = historyData.history.map((h) => h.song).filter(Boolean).slice(0, 10);
        const cards = songs.map((s) => renderSongCard(s)).join('');
        html += renderSection('Recently Played', cards);
        contexts.push({ songs });
      }

      if (trending.songs && trending.songs.length > 0) {
        const cards = trending.songs.map((s) => renderSongCard(s)).join('');
        html += renderSection('Trending Now', cards);
        contexts.push({ songs: trending.songs });
      }

      if (recentlyAdded.songs && recentlyAdded.songs.length > 0) {
        const cards = recentlyAdded.songs.map((s) => renderSongCard(s)).join('');
        html += renderSection('Recently Added', cards);
        contexts.push({ songs: recentlyAdded.songs });
      }

      try {
        const artistsData = await apiFetch('/artists');
        if (artistsData.artists && artistsData.artists.length > 0) {
          const cards = artistsData.artists.map((a) => renderArtistCard(a)).join('');
          html += renderSection('Popular Artists', cards);
          contexts.push(null);
        }
      } catch {}

      if (!historyData.history?.length && !trending.songs?.length && !recentlyAdded.songs?.length) {
        html += renderEmpty('No songs yet. Run the seed script to add music!');
      }

      homeEl.innerHTML = html;

      const sections = homeEl.querySelectorAll('.content-section');
      sections.forEach((section, i) => {
        if (contexts[i]) section._context = contexts[i].songs;
      });
    } catch (err) {
      homeEl.innerHTML = renderEmpty('Failed to load. Make sure the server is running and database is seeded.');
    }
  }

  // ─── Playlist Functions ───
  async function loadSidebarPlaylists() {
    try {
      const data = await apiFetch('/playlists');
      const list = document.getElementById('playlistList');
      if (!data.playlists || data.playlists.length === 0) {
        list.innerHTML = '<div class="playlist-empty">No playlists yet</div>';
        return;
      }
      list.innerHTML = data.playlists.map((p) =>
        `<div class="playlist-item" data-id="${p._id}">${p.name}</div>`
      ).join('');
      list.querySelectorAll('.playlist-item').forEach((el) => {
        el.addEventListener('click', () => showPlaylistDetail(el.dataset.id));
      });
    } catch {}
  }

  async function createPlaylist(name) {
    const data = await apiFetch('/playlists', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    loadSidebarPlaylists();
    return data.playlist;
  }

  async function deletePlaylist(id) {
    showDeleteConfirmModal(id);
  }

  async function deletePlaylistConfirmed(id) {
    try {
      await apiFetch(`/playlists/${id}`, { method: 'DELETE' });
      showToast('Playlist deleted');
      loadSidebarPlaylists();
      const view = document.getElementById('viewLibrary');
      view.innerHTML = '';
      loadLibraryView();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function addToPlaylist(playlistId, songId) {
    try {
      await apiFetch(`/playlists/${playlistId}/songs`, {
        method: 'POST',
        body: JSON.stringify({ songId }),
      });
      showToast('Added to playlist');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  }

  async function removeFromPlaylist(playlistId, songId) {
    try {
      await apiFetch(`/playlists/${playlistId}/songs/${songId}`, { method: 'DELETE' });
      showToast('Removed from playlist');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function showPlaylistDetail(id) {
    document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
    document.querySelectorAll('.view').forEach((v) => v.classList.add('hidden'));
    const lib = document.getElementById('viewLibrary');
    lib.classList.remove('hidden');
    lib.innerHTML = skeleton(4);

    try {
      const data = await apiFetch(`/playlists/${id}`);
      const pl = data.playlist;
      const songs = pl.songs || [];

      lib._context = songs;

      let html = `
        <div class="playlist-detail-header">
          <div class="playlist-detail-cover">
            <i class="fas fa-music"></i>
          </div>
          <div class="playlist-detail-info">
            <span class="playlist-detail-label">PLAYLIST</span>
            <h1>${pl.name}</h1>
            <p class="playlist-detail-meta">${songs.length} song${songs.length !== 1 ? 's' : ''}</p>
            <div class="playlist-detail-actions">
              <button class="btn-primary-mini" data-action="play-playlist" data-id="${id}"><i class="fas fa-play"></i> Play</button>
              <button class="btn-outline-mini" data-action="shuffle-playlist" data-id="${id}"><i class="fas fa-random"></i> Shuffle</button>
              <button class="btn-outline-mini" data-action="add-songs" data-id="${id}"><i class="fas fa-plus"></i> Add Songs</button>
              <button class="btn-delete-mini" data-action="delete-playlist" data-id="${id}"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        </div>
      `;

      if (songs.length === 0) {
        html += `
          <div class="empty-state">
            <i class="fas fa-music"></i>
            <p>This playlist is empty.</p>
            <div class="empty-state-actions" style="margin-top:20px">
              <button class="btn-primary-mini" data-action="add-songs" data-id="${id}"><i class="fas fa-plus"></i> Add Songs</button>
            </div>
          </div>
        `;
      } else {
        html += '<div class="playlist-tracks">';
        songs.forEach((s, i) => {
          html += renderTrackRow(s, i, true, id);
        });
        html += '</div>';
      }

      lib.innerHTML = html;
    } catch (err) {
      lib.innerHTML = renderEmpty('Could not load playlist');
    }
  }

  async function playPlaylist(id) {
    try {
      const data = await apiFetch(`/playlists/${id}`);
      const songs = data.playlist.songs || [];
      if (songs.length === 0) return showToast('Playlist is empty');
      const view = document.getElementById('viewLibrary');
      view._context = songs;
      Player.startPlayback('playlist', songs, 0);
    } catch {}
  }

  async function shufflePlaylist(id) {
    try {
      const data = await apiFetch(`/playlists/${id}`);
      const songs = [...(data.playlist.songs || [])];
      if (songs.length === 0) return showToast('Playlist is empty');
      for (let i = songs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [songs[i], songs[j]] = [songs[j], songs[i]];
      }
      const view = document.getElementById('viewLibrary');
      view._context = songs;
      Player.startPlayback('playlist', songs, 0);
      Player.shuffle = true;
      Player.dom.shuffleBtn.classList.add('active-btn');
      showToast('Shuffling playlist');
    } catch {}
  }

  // ─── Add to Playlist Modal ───
  function showAddToPlaylist(songId) {
    if (document.getElementById('addToPlaylistModal')) {
      document.getElementById('addToPlaylistModal').remove();
    }

    const overlay = createModal('Add to Playlist', `
      <div class="playlist-picker-search">
        <input type="text" class="modal-input" id="pickerFilterInput" placeholder="Filter playlists..." style="margin-bottom:8px">
      </div>
      <button class="picker-item picker-create-btn" id="pickerCreateBtn" data-action="picker-create-playlist">
        <i class="fas fa-plus"></i> Create New Playlist
      </button>
      <div id="playlistPickerBody"></div>
    `);
    overlay.id = 'addToPlaylistModal';

    function loadPlaylistPicker(filter = '') {
      apiFetch('/playlists').then((data) => {
        const body = document.getElementById('playlistPickerBody');
        const list = data.playlists || [];
        const filtered = filter ? list.filter(p => p.name.toLowerCase().includes(filter.toLowerCase())) : list;
        if (filtered.length === 0) {
          body.innerHTML = '<p class="picker-empty" style="padding:20px;text-align:center;color:var(--text-dim)">No playlists match</p>';
          return;
        }
        body.innerHTML = filtered.map((p) => {
          const hasSong = p.songs && p.songs.some(s => (s._id || s) === songId);
          return `<button class="picker-item${hasSong ? ' already-added' : ''}" data-playlist-id="${p._id}">${p.name}</button>`;
        }).join('');
        body.querySelectorAll('.picker-item:not(.already-added)').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const ok = await addToPlaylist(btn.dataset.playlistId, songId);
            if (ok) overlay.remove();
          });
        });
      }).catch(() => {
        document.getElementById('playlistPickerBody').innerHTML = '<p class="picker-empty">Failed to load playlists</p>';
      });
    }

    loadPlaylistPicker();

    const filterInput = document.getElementById('pickerFilterInput');
    if (filterInput) {
      filterInput.addEventListener('input', (e) => loadPlaylistPicker(e.target.value));
    }
  }

  // ─── Add Songs to Playlist Modal ───
  async function showAddSongsModal(playlistId) {
    const overlay = createModal('Add Songs', '<div class="add-songs-loading"><i class="fas fa-circle-notch fa-spin"></i></div>');
    overlay.classList.add('add-songs-modal');

    try {
      const [songsData, playlistData] = await Promise.all([
        apiFetch('/songs?limit=200'),
        apiFetch(`/playlists/${playlistId}`),
      ]);

      const allSongs = songsData.songs || [];
      const playlistSongs = playlistData.playlist.songs || [];
      const existingIds = new Set(playlistSongs.map(s => s._id));

      overlay.querySelector('.modal-box-body').innerHTML = `
        <div class="add-songs-search">
          <i class="fas fa-search"></i>
          <input type="text" class="modal-input" id="addSongsSearch" placeholder="Search songs..." autofocus>
        </div>
        <div class="add-songs-list" id="addSongsList"></div>
        <div class="add-songs-empty hidden" id="addSongsEmpty">
          <p>No songs found</p>
        </div>
      `;

      function renderSongList(filter = '') {
        const list = document.getElementById('addSongsList');
        const empty = document.getElementById('addSongsEmpty');
        const q = filter.toLowerCase().trim();

        const filtered = q
          ? allSongs.filter(s => {
              const title = (s.title || '').toLowerCase();
              const artist = (typeof s.artist === 'object' && s.artist ? s.artist.name : s.artist || '').toLowerCase();
              const album = (typeof s.album === 'object' && s.album ? s.album.title : '').toLowerCase();
              return title.includes(q) || artist.includes(q) || album.includes(q);
            })
          : allSongs;

        if (filtered.length === 0) {
          list.innerHTML = '';
          empty.classList.remove('hidden');
          return;
        }
        empty.classList.add('hidden');

        list.innerHTML = filtered.map(song => {
          const artist = typeof song.artist === 'object' && song.artist ? song.artist.name : (song.artist || 'Unknown');
          const album = typeof song.album === 'object' && song.album ? song.album.title : '';
          const cover = getCoverUrl(song);
          const alreadyAdded = existingIds.has(song._id);

          return `
            <div class="add-song-item" data-id="${song._id}">
              <img class="add-song-cover" src="${cover}" alt="" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><rect fill=%22%23333%22 width=%2240%22 height=%2240%22/></svg>'">
              <div class="add-song-info">
                <div class="add-song-title">${song.title}</div>
                <div class="add-song-sub">${album ? artist + ' \u00B7 ' + album : artist}</div>
              </div>
              <button class="add-song-btn${alreadyAdded ? ' added' : ''}" data-song-id="${song._id}"${alreadyAdded ? ' disabled' : ''}>
                ${alreadyAdded ? 'Added' : 'Add'}
              </button>
            </div>
          `;
        }).join('');

        list.querySelectorAll('.add-song-btn:not(.added)').forEach(btn => {
          btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.textContent = '...';
            try {
              await apiFetch(`/playlists/${playlistId}/songs`, {
                method: 'POST',
                body: JSON.stringify({ songId: btn.dataset.songId }),
              });
              showToast('Added to playlist');
              existingIds.add(btn.dataset.songId);
              btn.classList.add('added');
              btn.textContent = 'Added';
              btn.disabled = true;
              showPlaylistDetail(playlistId);
            } catch (err) {
              showToast(err.message || 'Failed to add song', 'error');
              btn.disabled = false;
              btn.textContent = 'Add';
            }
          });
        });
      }

      const input = document.getElementById('addSongsSearch');
      if (input) {
        input.addEventListener('input', () => renderSongList(input.value));
        setTimeout(() => input.focus(), 100);
      }

      renderSongList();
    } catch (err) {
      const body = overlay.querySelector('.modal-box-body');
      if (body) body.innerHTML = `<p class="picker-empty">Failed to load songs: ${err.message}</p>`;
    }
  }

  // ─── Reusable Modal Helper ───
  function createModal(title, bodyHtml) {
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-box-header">
          <h3>${title}</h3>
          <button class="modal-close-btn" data-action="close-modal">&times;</button>
        </div>
        <div class="modal-box-body">${bodyHtml}</div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('[data-action="close-modal"]')) {
        overlay.remove();
      }
    });

    const escHandler = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    const focusable = overlay.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) setTimeout(() => focusable[0].focus(), 50);

    return overlay;
  }

  // ─── Create Playlist Modal ───
  function showCreatePlaylistModal() {
    const overlay = createModal('Create Playlist', `
      <input type="text" class="modal-input" id="createPlaylistInput" placeholder="Enter playlist name..." maxlength="100" autofocus>
      <p class="modal-error" id="createPlaylistError">Please enter a name</p>
      <div class="modal-actions">
        <button class="btn-outline-mini" data-action="close-modal">Cancel</button>
        <button class="btn-primary-mini" id="createPlaylistConfirm">Create</button>
      </div>
    `);

    const input = document.getElementById('createPlaylistInput');
    const error = document.getElementById('createPlaylistError');
    const confirmBtn = document.getElementById('createPlaylistConfirm');

    function submit() {
      const name = input.value.trim();
      if (!name) {
        error.classList.add('visible');
        input.focus();
        return;
      }
      error.classList.remove('visible');
      confirmBtn.disabled = true;
      createPlaylist(name).then(() => {
        showToast('Playlist created');
        overlay.remove();
      }).catch((err) => {
        showToast(err.message, 'error');
        confirmBtn.disabled = false;
      });
    }

    confirmBtn.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    input.addEventListener('input', () => error.classList.remove('visible'));
  }

  // ─── Delete Confirmation Modal ───
  function showDeleteConfirmModal(playlistId) {
    const overlay = createModal('Delete Playlist', `
      <p style="margin-bottom:16px;color:var(--text-muted)">Are you sure you want to delete this playlist? This cannot be undone.</p>
      <div class="modal-actions">
        <button class="btn-outline-mini" data-action="close-modal">Cancel</button>
        <button class="btn-delete-mini" id="deletePlaylistConfirm" style="background:rgba(239,68,68,0.2);color:#ef4444;border-radius:24px;padding:10px 24px;width:auto">Delete</button>
      </div>
    `);

    document.getElementById('deletePlaylistConfirm').addEventListener('click', () => {
      overlay.remove();
      deletePlaylistConfirmed(playlistId);
    });
  }

  // ─── Library View ───
  async function loadLibraryView() {
    const lib = document.getElementById('viewLibrary');
    lib.innerHTML = skeleton(3);

    try {
      const [playlistsData, favoritesData] = await Promise.all([
        apiFetch('/playlists').catch(() => ({ playlists: [] })),
        apiFetch('/favorites').catch(() => ({ favorites: [] })),
      ]);

      let html = '<div class="home-greeting"><h1>Your Library</h1></div>';

      if (favoritesData.favorites && favoritesData.favorites.length > 0) {
        const songs = favoritesData.favorites.map((f) => f.song).filter(Boolean);
        const cards = songs.map((s) => renderSongCard(s)).join('');
        html += renderSection('Liked Songs', cards);
        lib._context = songs;
      } else {
        lib._context = [];
      }

      const playlists = playlistsData.playlists || [];
      html += '<div class="content-section"><div class="section-header-row"><h2>Playlists</h2></div>';
      if (playlists.length === 0) {
        html += '<div class="empty-state" style="padding:30px 0"><i class="fas fa-list"></i><p>No playlists yet. Create one from the sidebar.</p></div>';
      } else {
        html += '<div class="playlist-grid">';
        playlists.forEach((p) => {
          const count = p.songs ? p.songs.length : 0;
          html += `
            <div class="playlist-card" data-id="${p._id}">
              <div class="playlist-card-img">
                <i class="fas fa-music"></i>
              </div>
              <div class="playlist-card-body">
                <div class="playlist-card-name">${p.name}</div>
                <div class="playlist-card-count">${count} song${count !== 1 ? 's' : ''}</div>
              </div>
            </div>
          `;
        });
        html += '</div>';
      }
      html += '</div>';

      lib.innerHTML = html;

      lib.querySelectorAll('.playlist-card').forEach((card) => {
        card.addEventListener('click', () => showPlaylistDetail(card.dataset.id));
      });
    } catch (err) {
      lib.innerHTML = renderEmpty('Failed to load library');
    }
  }

  // ─── Search View ───
  let searchTerm = '';

  async function loadSearchView() {
    const el = document.getElementById('viewSearch');
    el.innerHTML = `
      <div class="search-container">
        <div class="search-input-wrap">
          <i class="fas fa-search"></i>
          <input type="text" class="search-input" id="searchInputField" placeholder="What do you want to listen to?" autofocus>
          <button class="search-clear" id="searchClearBtn"><i class="fas fa-times"></i></button>
        </div>
        <div class="search-results" id="searchResults">
          <div class="empty-state">
            <i class="fas fa-search"></i>
            <p>Search for songs, artists, or albums</p>
          </div>
        </div>
      </div>
    `;

    const input = document.getElementById('searchInputField');
    const clearBtn = document.getElementById('searchClearBtn');

    clearBtn.style.display = 'none';

    const doSearch = debounce(async (q) => {
      if (!q || q.length < 1) {
        document.getElementById('searchResults').innerHTML = `
          <div class="empty-state">
            <i class="fas fa-search"></i>
            <p>Start typing to search</p>
          </div>
        `;
        return;
      }

      const resultsEl = document.getElementById('searchResults');
      resultsEl.innerHTML = '<div class="search-loading"><i class="fas fa-circle-notch fa-spin"></i></div>';

      try {
        const data = await apiFetch(`/songs/search?q=${encodeURIComponent(q)}`);
        renderSearchResults(data);
      } catch (err) {
        resultsEl.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
      }
    }, 300);

    input.addEventListener('input', () => {
      const val = input.value.trim();
      searchTerm = val;
      clearBtn.style.display = val ? 'block' : 'none';
      doSearch(val);
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      searchTerm = '';
      clearBtn.style.display = 'none';
      document.getElementById('searchResults').innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <p>Search for songs, artists, or albums</p>
        </div>
      `;
      input.focus();
    });

    input.focus();
  }

  function renderSearchResults(data) {
    const resultsEl = document.getElementById('searchResults');
    const { songs = [], artists = [], albums = [], artistSongs = [] } = data;

    if (songs.length === 0 && artists.length === 0 && albums.length === 0 && artistSongs.length === 0) {
      resultsEl.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search-minus"></i>
          <p>No results found for "<strong>${searchTerm}</strong>"</p>
        </div>
      `;
      return;
    }

    let html = '';
    const contexts = [];

    if (artists.length > 0) {
      html += renderSection('Artists', artists.map((a) => renderArtistCard(a)).join(''));
      contexts.push(null);
    }

    if (artistSongs.length > 0) {
      const artistName = typeof artists[0] === 'object' ? artists[0].name : '';
      html += `<div class="content-section artist-songs-section">
        <div class="section-header-row"><h2>Songs by ${artistName}</h2></div>
        <div class="playlist-tracks">`;
      artistSongs.forEach((s, i) => {
        const albumName = typeof s.album === 'object' && s.album ? s.album.title : '';
        const an = typeof s.artist === 'object' && s.artist ? s.artist.name : (s.artist || '');
        html += renderTrackRow(s, i, false, '', albumName || an);
      });
      html += '</div></div>';
      contexts.push(artistSongs);
    }

    if (songs.length > 0) {
      html += renderSection('Songs', songs.map((s) => renderSongCard(s)).join(''));
      contexts.push(songs);
    }

    if (albums.length > 0) {
      html += renderSection('Albums', albums.map((a) => renderAlbumCard(a)).join(''));
      contexts.push(null);
    }

    resultsEl.innerHTML = html;

    const sections = resultsEl.querySelectorAll('.content-section');
    sections.forEach((section, i) => {
      if (contexts[i]) section._context = contexts[i];
    });
  }

  // ─── Artist View ───
  async function loadArtistView(id) {
    const el = document.getElementById('viewArtist');
    el.innerHTML = skeleton(4);
    el.classList.remove('hidden');

    try {
      const data = await apiFetch(`/artists/${id}`);
      const { artist, songs } = data;

      el._context = songs || [];

      let html = `
        <div class="detail-header">
          <div class="detail-header-img">
            <img src="${artist.image || ''}" alt="${artist.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23333%22 width=%22200%22 height=%22200%22/><text fill=%22%23666%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2260%22>🎤</text></svg>'">
          </div>
          <div class="detail-header-info">
            <span class="detail-header-label">ARTIST</span>
            <h1>${artist.name}</h1>
            <p class="detail-header-meta">${artist.songCount || songs.length || 0} song${(artist.songCount || songs.length || 0) !== 1 ? 's' : ''}</p>
          </div>
        </div>
      `;

      if (songs && songs.length > 0) {
        html += '<div class="playlist-tracks">';
        songs.forEach((s, i) => {
          const albumName = typeof s.album === 'object' && s.album ? s.album.title : '';
          html += renderTrackRow(s, i, false, '', albumName || artist.name);
        });
        html += '</div>';
      } else {
        html += renderEmpty('No songs found for this artist');
      }

      el.innerHTML = html;
    } catch (err) {
      el.innerHTML = renderEmpty('Could not load artist');
    }
  }

  // ─── Album View ───
  async function loadAlbumView(id) {
    const el = document.getElementById('viewAlbum');
    el.innerHTML = skeleton(4);
    el.classList.remove('hidden');

    try {
      const data = await apiFetch(`/albums/${id}`);
      const { album, songs } = data;

      el._context = songs || [];

      const artistName = typeof album.artist === 'object' && album.artist ? album.artist.name : 'Unknown';

      let html = `
        <div class="detail-header">
          <div class="detail-header-img">
            <img src="${album.coverImage || ''}" alt="${album.title}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23333%22 width=%22200%22 height=%22200%22/><text fill=%22%23666%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2260%22>💿</text></svg>'">
          </div>
          <div class="detail-header-info">
            <span class="detail-header-label">ALBUM</span>
            <h1>${album.title}</h1>
            <p class="detail-header-meta">${artistName} &middot; ${album.releaseYear || ''} &middot; ${songs ? songs.length : 0} song${(songs ? songs.length : 0) !== 1 ? 's' : ''}</p>
          </div>
        </div>
      `;

      if (songs && songs.length > 0) {
        html += '<div class="playlist-tracks">';
        songs.forEach((s, i) => {
          html += renderTrackRow(s, i);
        });
        html += '</div>';
      } else {
        html += renderEmpty('No tracks found for this album');
      }

      el.innerHTML = html;
    } catch (err) {
      el.innerHTML = renderEmpty('Could not load album');
    }
  }

  // ─── Hash Router ───
  function handleHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
    document.querySelectorAll('.view').forEach((v) => v.classList.add('hidden'));

    const parts = hash.split('/');
    if (parts[0] === 'artist' && parts[1]) {
      loadArtistView(parts[1]);
    } else if (parts[0] === 'album' && parts[1]) {
      loadAlbumView(parts[1]);
    }
  }

  window.addEventListener('hashchange', handleHash);

  // ─── Sidebar ───
  document.getElementById('createPlaylistBtn').addEventListener('click', () => {
    showCreatePlaylistModal();
  });

  // ─── Queue Panel ───
  let queuePanelOpen = false;

  function renderQueuePanel() {
    const list = document.getElementById('queueList');
    const empty = document.getElementById('queueEmpty');
    const nowSong = document.getElementById('queueNowSong');
    const count = document.getElementById('queueCount');
    const clearBtn = document.getElementById('queueClearBtn');

    const q = Player.queue || [];

    if (Player.currentSong) {
      const artistName = typeof Player.currentSong.artist === 'object'
        ? Player.currentSong.artist.name
        : (Player.currentSong.artist || '');
      nowSong.textContent = Player.currentSong.title + ' - ' + artistName;
    } else {
      nowSong.textContent = '-';
    }

    const queueSize = q.length;
    const hasUpcoming = queueSize > 1 || (queueSize === 1 && Player.currentIndex !== 0);

    if (!hasUpcoming) {
      list.innerHTML = '';
      empty.classList.remove('hidden');
      clearBtn.classList.add('hidden');
      count.textContent = '';
      return;
    }

    empty.classList.add('hidden');
    clearBtn.classList.remove('hidden');

    const upcoming = q.filter((_, i) => i !== Player.currentIndex);
    count.textContent = '(' + upcoming.length + ' song' + (upcoming.length !== 1 ? 's' : '') + ')';

    list.innerHTML = upcoming.map((song) => {
      const realIndex = q.findIndex((s) => s._id === song._id);
      const artistName = typeof song.artist === 'object' && song.artist ? song.artist.name : (song.artist || 'Unknown');
      const cover = getCoverUrl(song);
      return `
        <div class="queue-item" data-index="${realIndex}" data-id="${song._id}">
          <img class="queue-item-cover" src="${cover}" alt="" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><rect fill=%22%23333%22 width=%2240%22 height=%2240%22/></svg>'">
          <div class="queue-item-info">
            <div class="queue-item-title">${song.title}</div>
            <div class="queue-item-artist">${artistName}</div>
          </div>
          <button class="queue-item-play" data-action="queue-play"><i class="fas fa-play"></i></button>
          <button class="queue-item-remove" data-action="queue-remove"><i class="fas fa-times"></i></button>
        </div>
      `;
    }).join('');
  }

  async function loadQueueFromServer() {
    try {
      const data = await apiFetch('/queue');
      if (data.queue && data.queue.length > 0) {
        const songs = data.queue.map((q) => q.song).filter(Boolean);
        if (songs.length > 0) {
          Player.queue = songs;
        }
      }
    } catch {}
  }

  async function syncQueueToServer() {
    try {
      await apiFetch('/queue/clear', { method: 'DELETE' });
      for (const song of Player.queue) {
        await apiFetch('/queue', {
          method: 'POST',
          body: JSON.stringify({ songId: song._id }),
        });
      }
    } catch {}
  }

  async function removeFromServerQueue(index) {
    const wasCurrent = index === Player.currentIndex;
    Player.removeFromQueue(index);
    try {
      await apiFetch(`/queue/${index}`, { method: 'DELETE' });
    } catch {}
    renderQueuePanel();
    if (wasCurrent && Player.queue.length > 0) {
      const newIdx = Math.min(index, Player.queue.length - 1);
      Player.playQueue(Player.queue, newIdx);
    }
  }

  document.getElementById('queueBtn').addEventListener('click', async () => {
    queuePanelOpen = !queuePanelOpen;
    document.getElementById('queuePanel').classList.toggle('hidden', !queuePanelOpen);
    if (queuePanelOpen) {
      renderQueuePanel();
    }
  });

  document.getElementById('queuePanelClose').addEventListener('click', () => {
    queuePanelOpen = false;
    document.getElementById('queuePanel').classList.add('hidden');
  });

  document.getElementById('queueClearBtn').addEventListener('click', async () => {
    Player.clearQueue();
    await syncQueueToServer();
    renderQueuePanel();
  });

  // ─── Init ───
  Player.callbacks.onQueueChange = () => {
    renderQueuePanel();
    if (queuePanelOpen) syncQueueToServer();
  };

  Player.init();
  initEventDelegation();
  loadQueueFromServer().then(() => {
    loadHome();
  });
  loadSidebarPlaylists();
})();
