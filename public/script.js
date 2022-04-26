const socket = io('/');
const videoGrid = document.getElementById('video-screens');
var peer = new Peer();
// var peer = new Peer(undefined, {
//     path: '/peerjs',
//     host: '/',
//     port: '443'
// })
console.log(videoGrid);
const myVideo = document.createElement('video');
myVideo.muted = true;

let peers = {};
let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId) => {
        console.log("user is connected now");
        setTimeout(function() {
            connectToNewUser(userId, stream);
        }, 1000)
    })


    // let text = $("input");
    // let username = $("#username");
    // $('html').keydown(function(e) {
    //     if (e.which == 13 && text.val().length !== 0) { //Enter key pressed
    //         console.log(text.val());
    //         socket.emit('message', text.val());
    //         //Emit text and username

    //         text.val(''); //Clear input
    //     }
    // });
    // socket.on("createMessage", message => {
    //     //append message on screen chat window
    //     $("ul").append(` < li class = "messages" > < b > user < /b><br/ > ${message} < /li>`);
    //     scrollToBottom()
    // })
    let text = $("#chat_message");




    let username = $("#username");


    $('html').keydown(function(e) {
        if (e.which == 13 && text.val().length !== 0) { //Enter key pressed
            if (username.val().length == 0) {
                alert("Please enter your name");
            } else {

                socket.emit('message', { username: username.val(), text: text.val() });
            }

            text.val(''); //Clear input

        }
    });

    socket.on("createMessage", data => {
        //append message on screen chat window
        $("ul").append(`<li class = "messages"><b> ${data.username} </b><br/> ${data.text} </li>`);
        scrollToBottom()
    })

})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call;
}


socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();

    })
    videoGrid.append(video);
}

const scrollToBottom = () => {
    var displ = $('.main__chat_window');
    displ.scrollTop(displ.prop("scrollHeight"));
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

function chatPop() {
    var x = document.getElementById("main__chat_window");
    var y = document.getElementById("chat_block");
    var vc = document.getElementsByClassName("vc_content");
    if (x.style.display === "none") {
        x.style.display = "block";
        y.style.display = "flex";
    } else {
        x.style.display = "none";
        y.style.display = "none";
    }

}



function greenbuttonevent() {
    var element = document.body;
    // element.classList.toggle("green_col");
    element.style.backgroundColor = '#006137';

}

function bluebuttonevent() {
    var element = document.body;
    element.style.backgroundColor = '#014893';

}

function purplebuttonevent() {
    var element = document.body;
    element.style.backgroundColor = '#871C74';

}

function pinkbuttonevent() {
    var element = document.body;
    element.style.backgroundColor = '#9E0047';
}

function defaultbuttonevent() {
    var element = document.body;
    element.style.backgroundColor = 'black';
}


const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

$(document).ready(function() {

    var mousePos = {};

    function getRandomInt(min, max) {
        return Math.round(Math.random() * (max - min + 1)) + min;
    }

    $(window).mousemove(function(e) {
        mousePos.x = e.pageX;
        mousePos.y = e.pageY;
    });

    $(window).mouseleave(function(e) {
        mousePos.x = -1;
        mousePos.y = -1;
    });

    var draw = setInterval(function() {
        if (mousePos.x > 0 && mousePos.y > 0) {

            var range = 15;

            var color = "background: rgb(" + getRandomInt(0, 255) + "," + getRandomInt(0, 255) + "," + getRandomInt(0, 255) + ");";

            var sizeInt = getRandomInt(10, 30);
            size = "height: " + sizeInt + "px; width: " + sizeInt + "px;";

            var left = "left: " + getRandomInt(mousePos.x - range - sizeInt, mousePos.x + range) + "px;";

            var top = "top: " + getRandomInt(mousePos.y - range - sizeInt, mousePos.y + range) + "px;";

            var style = left + top + color + size;
            $("<div class='ball' style='" + style + "'></div>").appendTo('#wrap').one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function() { $(this).remove(); });
        }
    }, 1);
});


// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}