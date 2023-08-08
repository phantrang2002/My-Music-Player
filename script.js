// Một số bài hát có thể bị lỗi do liên kết bị hỏng. Vui lòng thay thế liên kết khác để có thể phát
// Some songs may be faulty due to broken links. Please replace another link so that it can be played

/*
1. render songs
2. scroll top
3. play / pause / seek
4. CD rotate 
5. Next / prev 
6. Random
7. Next, repeat khi ended
8. Active song
9. Scroll active song into view 
- dung de khi ma scroll bai cuoi man hinh no 
tu chuyen xuong
10. Play song wwhen click
*/

/* Nhiệm vụ còn lại dành cho các bạn:
1. Hạn chế tối đa các bài hát bị lặp lại, tao mang dem++
2. Fix lỗi khi tua bài hát, click giữ một chút sẽ thấy lỗi, vì event updatetime nó liên tục chạy dẫn tới lỗi
3. Fix lỗi khi next tới 1-3 bài đầu danh sách thì không “scroll into view”
check co cach no + them pixel duoc k 
-> day no manh tay hon 0 dung nearest nua
index = 0123 thi k dung nearest
dung center

4. Lưu lại vị trí bài hát đang nghe, F5 lại ứng dụng không bị quay trở về bài đầu tiên
5. Thêm chức năng điều chỉnh âm lượng, lưu vị trí âm lượng người dùng đã chọn. Mặc định 100%
*/

//luu tru
const PlAYER_STORAGE_KEY = "F8_PLAYER";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const cd = $('.cd');
const player = $('.player');
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist"); 


const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  // (1/2) use localStorage
  config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},

  
  //0. nạp songs
  songs: [
    {
      name: "August",
      singer: "Taylor Swift",
      path: './assets/music/August.mp3',
      image: './assets/img/august.jpg'
    },
    {
      name: "Cardigan",
      singer: "Taylor Swift",
      path: './assets/music/Cardigan.mp3',
      image: './assets/img/cardigan.jpg'
    },
    {
      name: "Fearless",
      singer: "Taylor Swift",
      path: './assets/music/Fearless.mp3',
      image: './assets/img/fearless.jpeg'
    },
    {
      name: "Mirrorball",
      singer: "Taylor Swift",
      path: './assets/music/Mirrorball.mp3',
      image: './assets/img/mirrorball.jpg'
    },
    {
      name: "The Last Great American Dynasty",
      singer: "Taylor Swift",
      path: './assets/music/The Last Great American Dynasty.mp3',
      image: './assets/img/thelast.png'
    }
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    // (2/2) use localStorage
    localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  
  //1.----------- render songs 
  render: function() {
    const htmls = this.songs.map((song, index) => {
      //8.--------Active song
      return    ` <div class="song ${index === this.currentIndex ? 'active':''}" data-index="${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
    })
    $('.playlist').innerHTML = htmls.join('')
  },

  


  //2. -------------scroll top
  handleEvents: function() {
    const _this = this
    const cdWidth = cd.offsetWidth

    //xử lý phóng to/thu nhỏ cd
    document.onscroll = function(){      
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    }

    //4.---------------- Xử lý CD quay / dừng
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, // 10 seconds
      iterations: Infinity
    });
    cdThumbAnimate.pause();

  //3.---------------Play/ Pause/ Seek

   // Handle when click play
   playBtn.onclick = function () {
    if (_this.isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  // Khi song được play
  audio.onplay = function () {
    _this.isPlaying = true;
    player.classList.add("playing");
    cdThumbAnimate.play();
  };

  // Khi song bị pause
  audio.onpause = function () {
    _this.isPlaying = false;
    player.classList.remove("playing");
    cdThumbAnimate.pause();
  };

  // Khi tiến độ bài hát thay đổi
  audio.ontimeupdate = function () {
    if (audio.duration) {
      const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
      progress.value = progressPercent;
      }
    };

  // Xử lý khi tua song seek
  progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };


  //5.---------------Next,prev
    nextBtn.onclick = function(){
      if(_this.isRandom){
        _this.playRandomSong()
      }else{
        _this.nextSong();
        
      }   audio.play(); 
      
      //active song
      _this.render()
      _this.scrollToActiveSong()
    };

    prevBtn.onclick = function(){
      if(_this.isRandom){
        _this.playRandomSong()
      }else{
      _this.prevSong();
   
      }   audio.play();
      //active song
      _this.render()
      _this.scrollToActiveSong()


    };

  //6.---------------Random bật/tắt
    randomBtn.onclick = function(e){
      _this.isRandom = !_this.isRandom
      _this.setConfig("isRandom", _this.isRandom)
      //nhận đối số thứ 2 là boolean và remove/add
      randomBtn.classList.toggle('active',_this.isRandom) 
     
    };


  //7.-----------next khi audio ended/repeat
  //Khi click nut repeat (lam y nhu random thui ) 
  repeatBtn.onclick = function(){
    _this.isRepeat = !_this.isRepeat
    _this.setConfig("isRepeat", _this.isRepeat)

    //nhận đối số thứ 2 là boolean và remove/add
    repeatBtn.classList.toggle('active',_this.isRepeat) 
   
  }

  audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

  //10----------Khi click vao song in playlist
  playlist.onclick = function(e){
    const songNode = e.target.closest(".song:not(.active)");

      if (songNode || e.target.closest(".option")) {
        // Xử lý khi click vào song      
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }

        // Xử lý khi click vào song option (nut ba cham: them nut xoa nhe)
        if (e.target.closest(".option")) {
        }
      }
  }

  

},

 

 

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      }
    })
    
  },

  //Load currentSong
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;  
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  //next
  nextSong: function(){
    this.currentIndex++
    if(this.currentIndex >= this.songs.length ){
      this.currentIndex = 0
    }
    this.loadCurrentSong();

  },

  //prev
  prevSong: function(){
    this.currentIndex--
    if(this.currentIndex < 0){
      this.currentIndex = this.song.length -1
    }
    this.loadCurrentSong();

  },

  playRandomSong: function(){
    let newIndex
    do {
      newIndex = Math.floor(Math.random()*this.songs.length)
    }while(newIndex == this.currentIndex)

    this.currentIndex = newIndex
    this.loadCurrentSong();
  },




  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }, 300);
  },


  
  start: function() {
    // Gán cấu hình từ config vào ứng dụng
    // Assign configuration from config to application
    this.loadConfig();
    // Định nghĩa các thuộc tính cho object
    this.defineProperties();

    // Lắng nghe / xử lý các sự kiện (DOM events)
    this.handleEvents();

    //Tải thông tin bài hát đầu vào UI
    this.loadCurrentSong();

    // Render playlist
    this.render();

     // Hiển thị trạng thái ban đầu của button repeat & random
    // Display the initial state of the repeat & random button
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  }
};

app.start();



/*
const PlAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: {},
  // (1/2) Uncomment the line below to use localStorage
  // config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Click Pow Get Down",
      singer: "Raftaar x Fortnite",
      path: "https://mp3.vlcmusic.com/download.php?track_id=34737&format=320",
      image: "https://i.ytimg.com/vi/jTLhQf5KJSc/maxresdefault.jpg"
    },
    {
      name: "Tu Phir Se Aana",
      singer: "Raftaar x Salim Merchant x Karma",
      path: "https://mp3.vlcmusic.com/download.php?track_id=34213&format=320",
      image:
        "https://1.bp.blogspot.com/-kX21dGUuTdM/X85ij1SBeEI/AAAAAAAAKK4/feboCtDKkls19cZw3glZWRdJ6J8alCm-gCNcBGAsYHQ/s16000/Tu%2BAana%2BPhir%2BSe%2BRap%2BSong%2BLyrics%2BBy%2BRaftaar.jpg"
    },
    
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    // (2/2) Uncomment the line below to use localStorage
    // localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
                        <div class="song ${
                          index === this.currentIndex ? "active" : ""
                        }" data-index="${index}">
                            <div class="thumb"
                                style="background-image: url('${song.image}')">
                            </div>
                            <div class="body">
                                <h3 class="title">${song.name}</h3>
                                <p class="author">${song.singer}</p>
                            </div>
                            <div class="option">
                                <i class="fas fa-ellipsis-h"></i>
                            </div>
                        </div>
                    `;
    });
    playlist.innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      }
    });
  },
  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // Xử lý CD quay / dừng
    // Handle CD spins / stops
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, // 10 seconds
      iterations: Infinity
    });
    cdThumbAnimate.pause();

    // Xử lý phóng to / thu nhỏ CD
    // Handles CD enlargement / reduction
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lý khi click play
    // Handle when click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // Khi song được play
    // When the song is played
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Khi song bị pause
    // When the song is pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // Khi tiến độ bài hát thay đổi
    // When the song progress changes
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    // Xử lý khi tua song
    // Handling when seek
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    // Khi next song
    // When next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Khi prev song
    // When prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Xử lý bật / tắt random song
    // Handling on / off random song
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // Xử lý lặp lại một song
    // Single-parallel repeat processing
    repeatBtn.onclick = function (e) {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    // Xử lý next song khi audio ended
    // Handle next song when audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // Lắng nghe hành vi click vào playlist
    // Listen to playlist clicks
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");

      if (songNode || e.target.closest(".option")) {
        // Xử lý khi click vào song
        // Handle when clicking on the song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }

        // Xử lý khi click vào song option
        // Handle when clicking on the song option
        if (e.target.closest(".option")) {
        }
      }
    };
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }, 300);
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  start: function () {
    // Gán cấu hình từ config vào ứng dụng
    // Assign configuration from config to application
    this.loadConfig();

    // Định nghĩa các thuộc tính cho object
    // Defines properties for the object
    this.defineProperties();

    // Lắng nghe / xử lý các sự kiện (DOM events)
    // Listening / handling events (DOM events)
    this.handleEvents();

    // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    // Load the first song information into the UI when running the app
    this.loadCurrentSong();

    // Render playlist
    this.render();

    // Hiển thị trạng thái ban đầu của button repeat & random
    // Display the initial state of the repeat & random button
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  }
};

app.start();
*/