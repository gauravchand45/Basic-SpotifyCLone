let currentAudio = new Audio();
let songs;
function formatTime(totalSeconds) {
  if(isNaN(totalSeconds)||totalSeconds<0){
    return "00:00"
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

  const formattedTime = `${formattedMinutes}:${formattedSeconds}`;

  return formattedTime;
}

async function getSongs() {
  const res = await fetch("http://127.0.0.1:5500/songs/");
  const data = await res.text();
  // console.log(data); we get whole HTML structure of the songs folder...
  let div = document.createElement("div"); // Created a div and stored the  fetched HTML structure inside this div...
  div.innerHTML = data;
  let a = div.getElementsByTagName("a"); // To search for songs we only took the anchor tag <a>...
  // console.log(a); // Got an HTML collection of <a>...
  // Converting this HTML collection into an array
  let arr = Array.from(a);
  let songs = [];
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    if (element.href.endsWith(".mp3.preview")) {
      songs.push(element); // made an array called songs which only contains the <a> of the songs
    }
  }
  return songs;
}
function getTitleArtists(songs) {
  let titles = [];
  let Artists = [];
  songs.forEach((element) => {
    titles.push(
      element.title
        .replace(".mp3", "")
        .replaceAll(" ", "")
        .trim()
        .split("by")[0]
    );
    Artists.push(
      element.title
        .replace(".mp3", "")
        .replaceAll(" ", "")
        .trim()
        .split("by")[1]
    );
  });
  let TitleArtists = {};
  titles.forEach((key, value) => {
    TitleArtists[key] = Artists[value]; // converted two arrays into object of key-value pair
  });
  return TitleArtists;
}

function playSong(track, pause = false) {
  // console.log(currentAudio);
  currentAudio.src = track;
  if (!pause) {
    currentAudio.play();
    document.querySelector(".playButton img").src = "/svgImages/pause.svg";
  }

  track = track
    .replace("http://127.0.0.1:5500/songs/", "")
    .replaceAll("%20", "")
    .replace(".mp3", "")
    .split("by");
  document.querySelector(".songName").innerHTML = track[0];
  document.querySelector(".songArtist").innerHTML = track[1];
}

async function main() {
  let songs = await getSongs();
  playSong(songs[0].href.replace(".preview", ""), true);
  let TitleArtists = getTitleArtists(songs); // to get the title and artist of the song in the form of an object
  for (let key in TitleArtists) {
    // console.log(key, TitleArtists[key]);
    let songsList = document.querySelector(".songsList");
    songsList.innerHTML =
      songsList.innerHTML +
      `
          <div class="listcard">
            <div class="imgInfo">
                <div class="listcardimg">
                    <img src="/svgImages/music.svg" alt="songImg">
                </div>
                <div class="listcardinfo">
                    <p class="listcardinfoName">${key}</p>
                    <p class="listcardinfoArtist">${TitleArtists[key]}</p>
                </div>
            </div>
          
            <div class="playNow">
                <div class="playCursor">Play Now </div>
                <div class="playButton2 flexBox">
                    <img src="/svgImages/play.svg" alt="playButton2">
                </div>
            </div>
          </div>`;
  }

  const listsongs = document.querySelector(".songsList").children;          //.style.backgroundcolor="#1a1a1a";
  for (let i = 0; i < listsongs.length; i++) {
    const element = listsongs[i];
    element.addEventListener("click", () => {
      for (let i = 0; i < songs.length; i++) {
        const e = songs[i];
        if (
          e.href.includes(element.querySelector(".listcardinfoName").innerHTML)
        ) {
          playSong(e.href.replace(".preview", ""));
        }
      }
    });
  }

  document.querySelector(".playButton").addEventListener("click", (e) => {
    document.querySelector(".playButton img").click();
  });
  const playButton = document.querySelector(".playButton img");
  playButton.addEventListener("click", (e) => {
    e.stopPropagation();
    if (currentAudio.paused) {
      currentAudio.play();
      playButton.src = "/svgImages/pause.svg";
    } else {
      currentAudio.pause();
      playButton.src = "/svgImages/play.svg";
    }
  });

  currentAudio.addEventListener("timeupdate", () => {
    if (currentAudio.duration === 0 || currentAudio.duration === Infinity) {
      return;
    }
    const totalTime = formatTime(Math.floor(currentAudio.duration));
    document.querySelector(".durationPara").innerHTML = totalTime;
    const currentTime = formatTime(Math.floor(currentAudio.currentTime));
    document.querySelector(".currentPara").innerHTML = currentTime;
    document.querySelector(".circle").style.left =
    (currentAudio.currentTime / currentAudio.duration) * 100 + "%";
  });

  document.querySelector(".bar").addEventListener('click',(e)=>{
    let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100;
    document.querySelector(".circle").style.left=percent + "%";
    currentAudio.currentTime=((currentAudio.duration)*percent)/100 
  })

  document.querySelector('.prev').addEventListener('click',()=>{
    let music=[]
    for (let i = 0; i < songs.length; i++) {
      const element = songs[i];
      music.push(songs[i].href.replace(".preview",""));
    }
    let index=music.indexOf(currentAudio.src)
    console.log(music,index);
    if((index-1)>=0){
      playSong(music[index-1])
    }
    
  })
  document.querySelector('.next').addEventListener('click',()=>{
    let music=[]
    for (let i = 0; i < songs.length; i++) {
      const element = songs[i];
      music.push(songs[i].href.replace(".preview",""));
    }
    let index=music.indexOf(currentAudio.src)
    console.log(music,index);
    if((index+1)<music.length){
      playSong(music[index+1])
    }
    
  })

  document.querySelector('.range').getElementsByTagName("input")[0].addEventListener('mousemove',(e)=>{
    currentAudio.volume=parseInt(e.target.value)/100;
  })

}
main();
