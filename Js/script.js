let currentsong = new Audio();
let currentPlaylist = []; // Add this at the top with other global variables
let songs;
let currFolder;

const play = document.getElementById("play");
const previous = document.getElementById("previous");
const next = document.getElementById("next");


function convertTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);//It is used to convert decimal into round of in minutes 
    const remainingSeconds = Math.floor(seconds % 60);//It is used to convert decimal into round of in seconds 

    // Pad with zeros if needed
    const displayMinutes = String(minutes).padStart(2, '0');
    const displaySeconds = String(remainingSeconds).padStart(2, '0');
    //     String Conversion:
    //     String(minutes) converts the number to a string
    // For example: 5 becomes "5"
    //     padStart() Method: (make '5' to '05')
    //     padStart(2, '0') adds zeros at the start until the string is 2 characters long


    return `${displayMinutes}:${displaySeconds}`;
}

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
}

const playMusic = (track) => {
    // track.trim clears all space and make the song look exactly as in local storage
    currentsong.src = `/${currFolder}/` + track.trim();
    currentsong.play();
    play.src = "img/pause.svg";
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00 : 00 / 00 : 00";

    // From here the Volume button process starts

    let vol = document.querySelector(".volume");
    vol.innerHTML = `<img src="img/volume.svg" style="width: 25px; cursor:pointer;" alt="volbutton">`
    let rangeDiv = document.createElement("div");
    rangeDiv.className = "range invert";
    rangeDiv.innerHTML = `<input type="range" style="accent-color:black; cursor : pointer;">`;
    vol.appendChild(rangeDiv);

    // Add an eventlistener for volume
    let range = document.querySelector(".range").getElementsByTagName("input")[0];
    range.addEventListener("change", (e) => {
        let volume = e.target.value / 100;
        currentsong.volume = volume;
        if (volume === 0) {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/mutesong.svg";
        } else {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/volume.svg";
        }
    });

    // Add Event listener for direct muting song

    document.querySelector(".volume").getElementsByTagName("img")[0].addEventListener("click", () => {
        if (currentsong.volume > 0) {
            currentsong.lastVolume = currentsong.volume; // Store the current volume before muting
            currentsong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/mutesong.svg";
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0; //Handles range input
        } else {
            // Restore the previous volume, or set to 1 if not stored
            currentsong.volume = currentsong.lastVolume || 0.5; //dataset userdefined property //1 is 100% volume
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/volume.svg";
            document.querySelector(".range").getElementsByTagName("input")[0].value = currentsong.volume * 100; //give previous song value 
        }
    });
}

const playFirstSong = () => {
    if (currentPlaylist.length > 0) {
        playMusic(decodeURI(currentPlaylist[0]));//decodeURI use for removing trash things other than music name 
        // eg %20 without changing file name
    }
}

 // Display All Albums On the Page Dynamically
async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folders = (e.href.split("/").slice(-2)[0]);
            let a = await fetch(`/songs/${folders}/info.json`);
            let response = await a.json();
            cardcontainer.innerHTML += `<div data-folder="${folders}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" color="black" fill="white">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
                        <path d="M15.9453 12.3948C15.7686 13.0215 14.9333 13.4644 13.2629 14.3502C11.648 15.2064 10.8406 15.6346 10.1899 15.4625C9.9209 15.3913 9.6758 15.2562 9.47812 15.0701C9 14.6198 9 13.7465 9 12C9 10.2535 9 9.38018 9.47812 8.92995C9.6758 8.74381 9.9209 8.60868 10.1899 8.53753C10.8406 8.36544 11.648 8.79357 13.2629 9.64983C14.9333 10.5356 15.7686 10.9785 15.9453 11.6052C16.0182 11.8639 16.0182 12.1361 15.9453 12.3948Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="/songs/${folders}/cover.png" alt="cardimg">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async (item) => {
            await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            currentPlaylist = songs;
            playMusic(decodeURI(songs[0]));

            let songUL = document.querySelector(".songList ul");
            songUL.innerHTML = "";
            for (const song of songs) {
                songUL.innerHTML += `<li> 
                    <img src="img/music.svg" class="invert" alt="music">
                    <div class="info">
                        <div> ${decodeURI(song.replaceAll("%20", " "))} </div>
                        <div>Reyan</div>
                    </div>
                    <div class="playnow">
                        <span>Play now</span>
                        <img src="img/play.svg" class="invert" alt="play2">
                    </div>
                </li>`;
            }
            
            Array.from(songUL.getElementsByTagName("li")).forEach((li, idx) => {
                li.addEventListener("click", () => {
                    playMusic(decodeURI(songs[idx]));
                });
            });
        });
    });
}


async function main() {
    await getsongs(`songs/Alan`);
    currentPlaylist = songs;

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li> 
            <img src="img/music.svg" class="invert" alt="music">
            <div class="info">
                <div> ${decodeURI(song.replaceAll("%20", " "))} </div>
                <div>Reyan</div>
            </div>
            <div class="playnow">
                <span>Play now</span>
                <img src="img/play.svg" class="invert" alt="play2">
            </div>
        </li>`;
    }
    
    Array.from(songUL.getElementsByTagName("li")).forEach((li, idx) => {
        li.addEventListener("click", () => {
            playMusic(decodeURI(songs[idx]));
        });
    });

    // attach an event listener to play,next and previous 
    play.addEventListener("click", () => { //here play is id of html of an element 
        if (currentsong.paused) {
            // If no song is loaded yet, play the first song
            if (!currentsong.src) {
                playFirstSong();
            } else {
                currentsong.play();
                play.src = "img/pause.svg"
            }
        }
        else {
            currentsong.pause();
            play.src = "img/play.svg"
        }
    })

    // listen for time update event
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertTime(currentsong.currentTime)}/${convertTime(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + '%'//Eg : (60(current)/240(duration)) * 100 = 25%
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + '%'//e.offsetX: The x-coordinate of the click relative to the seekbar element
        // e.target.getBoundingClientRect().width: Gets the total width of the seekbar
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;//here 100 cancels "percent (* 100)"
    })

    // Add and Event Listener For Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%"
    })

    // For Closing the hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add Eventlistener for previous and Next
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1].replaceAll("%20", " "))
        }
    })

    //it says that it split songs into arrays where the "/" is present slice get elements from the last element(i.e -1) , [0] gives string value present at split array at [0] index

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1].replaceAll("%20", " "))
        }
    })

}

function whitemode() {
    const a = document.getElementsByClassName("off")[0];
    a.classList.toggle("white");
    if (a.classList.contains("white")) {
        a.querySelector(".off > img").src = "/img/sun.svg";
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
        a.querySelector(".off > img").src = "/img/moon.svg";
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

displayAlbums()
main()