let currentsong = new Audio();
let currentPlaylist = [];
let songs;
let currFolder;

const play = document.getElementById("play");
const previous = document.getElementById("previous");
const next = document.getElementById("next");

function convertTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// ✅ Load songs from info.json
async function getsongs(folder) {
    currFolder = folder;
    let res = await fetch(`./${folder}/info.json`);
    let data = await res.json();
    songs = data.tracks;
    return data;
}

const playMusic = (track) => {
    currentsong.src = `./${currFolder}/` + track.trim();
    currentsong.play();
    play.src = "./img/pause.svg";
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00 : 00 / 00 : 00";

    // volume controls
    let vol = document.querySelector(".volume");
    vol.innerHTML = `<img src="./img/volume.svg" style="width:25px;cursor:pointer;" alt="volbutton">`;
    let rangeDiv = document.createElement("div");
    rangeDiv.className = "range invert";
    rangeDiv.innerHTML = `<input type="range" style="accent-color:black;cursor:pointer;">`;
    vol.appendChild(rangeDiv);

    let range = document.querySelector(".range input");
    range.addEventListener("change", (e) => {
        let volume = e.target.value / 100;
        currentsong.volume = volume;
        document.querySelector(".volume img").src = volume === 0 ? "./img/mutesong.svg" : "./img/volume.svg";
    });

    document.querySelector(".volume img").addEventListener("click", () => {
        if (currentsong.volume > 0) {
            currentsong.lastVolume = currentsong.volume;
            currentsong.volume = 0;
            document.querySelector(".volume img").src = "./img/mutesong.svg";
            document.querySelector(".range input").value = 0;
        } else {
            currentsong.volume = currentsong.lastVolume || 0.5;
            document.querySelector(".volume img").src = "./img/volume.svg";
            document.querySelector(".range input").value = currentsong.volume * 100;
        }
    });
}

const playFirstSong = () => {
    if (currentPlaylist.length > 0) playMusic(decodeURI(currentPlaylist[0]));
}

// ✅ Display albums dynamically
async function displayAlbums() {
    const albums = ["Alan" ,"Diljit songs" , "Hindi Songs" , "International" , "Karan Aujla" ,"Lofi" , "NCS" , "Pokemon(lofi)" , "Qawali" , "Raps" , "Sidhu Moosewala"]; // add all album folders here
    let cardcontainer = document.querySelector(".cardcontainer");

    for (const folder of albums) {
        try {
            let res = await fetch(`./songs/${folder}/info.json`);
            let data = await res.json();

            cardcontainer.innerHTML += `
            <div data-folder="songs/${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" color="black" fill="white">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                        <path d="M15.9 12.39C15.7 13 14.9 13.4 13.2 14.3C11.6 15.2 10.8 15.6 10.1 15.4C9.9 15.3 9.7 15.2 9.5 15C9 14.6 9 13.7 9 12C9 10.3 9 9.4 9.5 9C9.7 8.7 9.9 8.6 10.1 8.5C10.8 8.3 11.6 8.8 13.2 9.6C14.9 10.5 15.7 10.9 15.9 11.6C16 11.9 16 12.1 15.9 12.4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                    </svg>
                </div>
                <img src="./songs/${folder}/cover.png" alt="cover">
                <h2>${data.title}</h2>
                <p>${data.description}</p>
            </div>`;
        } catch (err) {
            console.error(`Error loading album ${folder}`, err);
        }
    }

    // when clicking album card
    Array.from(document.getElementsByClassName("card")).forEach((card) => {
        card.addEventListener("click", async (item) => {
            let folder = item.currentTarget.dataset.folder;
            let albumData = await getsongs(folder);
            currentPlaylist = songs;
            playMusic(decodeURI(songs[0]));

            let songUL = document.querySelector(".songList ul");
            songUL.innerHTML = "";
            for (const track of songs) {
                songUL.innerHTML += `
                <li>
                    <img src="./img/music.svg" class="invert" alt="music">
                    <div class="info">
                        <div>${decodeURI(track)}</div>
                        <div>${albumData.title}</div>
                    </div>
                    <div class="playnow">
                        <span>Play now</span>
                        <img src="./img/play.svg" class="invert" alt="play2">
                    </div>
                </li>`;
            }

            Array.from(songUL.getElementsByTagName("li")).forEach((li, idx) => {
                li.addEventListener("click", () => playMusic(decodeURI(songs[idx])));
            });
        });
    });
}

async function main() {
    let albumData = await getsongs(`songs/Alan`);
    currentPlaylist = songs;

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const track of songs) {
        songUL.innerHTML += `
        <li>
            <img src="./img/music.svg" class="invert" alt="music">
            <div class="info">
                <div>${decodeURI(track)}</div>
                <div>${albumData.title}</div>
            </div>
            <div class="playnow">
                <span>Play now</span>
                <img src="./img/play.svg" class="invert" alt="play2">
            </div>
        </li>`;
    }

    Array.from(songUL.getElementsByTagName("li")).forEach((li, idx) => {
        li.addEventListener("click", () => playMusic(decodeURI(songs[idx])));
    });

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            if (!currentsong.src) playFirstSong();
            else {
                currentsong.play();
                play.src = "./img/pause.svg";
            }
        } else {
            currentsong.pause();
            play.src = "./img/play.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${convertTime(currentsong.currentTime)}/${convertTime(currentsong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentsong.currentTime / currentsong.duration) * 100 + '%';
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + '%';
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(decodeURI(currentsong.src.split("/").slice(-1)[0]));
        if (index > 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(decodeURI(currentsong.src.split("/").slice(-1)[0]));
        if (index + 1 < songs.length) playMusic(songs[index + 1]);
    });
}

function whitemode() {
    const a = document.getElementsByClassName("off")[0];
    a.classList.toggle("white");
    if (a.classList.contains("white")) {
        a.querySelector(".off > img").src = "./img/sun.svg";
        document.querySelector(".left").classList.add("white");
        document.querySelector(".header").style.background = "grey";
        document.querySelector(".buttons > .signupbtn").style.color = "black";
        document.querySelector(".buttons > .signupbtn").style.background = "grey";
        document.querySelector(".buttons > .loginbtn").style.background = "black";
        document.querySelector(".buttons > .loginbtn").style.color = "white";
        document.querySelector(".right").style.background = "white";
        document.querySelectorAll(".card").forEach(card => card.style.background = "grey");
        document.querySelectorAll(".card h2").forEach(h2 => h2.style.color = "black");
        document.querySelectorAll("p").forEach(h2 => h2.style.color = "black");
        document.querySelector(".nav").style.filter = "invert(1)";
        document.querySelector("h1").style.filter = "invert(1)";
    } else {
        a.querySelector(".off > img").src = "./img/moon.svg";
        document.querySelector(".left").classList.remove("white");
        document.querySelector(".header").style.background = "";
        document.querySelector(".buttons > .signupbtn").style.color = "";
        document.querySelector(".buttons > .signupbtn").style.background = "";
        document.querySelector(".buttons > .loginbtn").style.background = "";
        document.querySelector(".buttons > .loginbtn").style.color = "";
        document.querySelector(".right").style.background = "";
        document.querySelectorAll(".card").forEach(card => card.style.background = "");
        document.querySelectorAll(".card h2").forEach(h2 => h2.style.color = "");
        document.querySelectorAll("p").forEach(h2 => h2.style.color = "");
        document.querySelector(".nav").style.filter = "";
        document.querySelector("h1").style.filter = "";
    }
}

displayAlbums();
main();
