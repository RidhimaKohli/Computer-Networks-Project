import h from './func.js';

window.addEventListener('load', () => {
    const room = h.getQString(location.href, 'room');
    const username = sessionStorage.getItem('username');
    //user session loads

    if (!room) {
        document.querySelector('#room-create').attributes.removeNamedItem('hidden');
    } else if (!username) {
        document.querySelector('#username-set').attributes.removeNamedItem('hidden');
    } else {
        let commElem = document.getElementsByClassName('room-comm');

        for (let i = 0; i < commElem.length; i++) {
            commElem[i].attributes.removeNamedItem('hidden');
        }
        // fix this
        var pc = [];

        let socket = io('/stream');

        var socketId = '';
        var myStream = '';
        var screen = '';
        var recordedStream = [];
        var mediaRecorder = '';

        getAndSetUserStream();


        socket.on('connect', () => {

            socketId = socket.io.engine.id;


            socket.emit('subscribe', {
                room: room,
                socketId: socketId
            });


            socket.on('new user', (data) => {
                socket.emit('clientAdded', { to: data.socketId, sender: socketId });
                pc.push(data.socketId);
                init(true, data.socketId);
            });


            socket.on('clientAdded', (data) => {
                pc.push(data.sender);
                init(false, data.sender);
            });
            //ok

            socket.on('ice candidates', async(data) => {
                data.candidate ? await pc[data.sender].addIceCandidate(new RTCIceCandidate(data.candidate)) : '';
            });

            //ok
            socket.on('sdp', async(data) => {
                if (data.description.type === 'offer') {
                    data.description ? await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description)) : '';

                    h.getUserFullMedia().then(async(stream) => {
                        if (!document.getElementById('local').srcObject) {
                            h.setLocalStream(stream);
                        }

                        //save 
                        myStream = stream;

                        stream.getTracks().forEach((track) => {
                            pc[data.sender].addTrack(track, stream);
                        });

                        let answer = await pc[data.sender].createAnswer();

                        await pc[data.sender].setLocalDescription(answer);

                        socket.emit('sdp', { description: pc[data.sender].localDescription, to: data.sender, sender: socketId });
                    }).catch((e) => {
                        console.error(e);
                    });
                } else if (data.description.type === 'answer') {
                    await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description));
                }
            });


            socket.on('chat', (data) => {
                h.addChat(data, 'remote');
            });
        });

        const scrollToBottom = () => {
            let d = $('.main-chat-window');
            d.scrollTop(d.prop("scrollHeight"));
        }

        function getAndSetUserStream() {
            h.getUserFullMedia().then((stream) => {
                //save
                myStream = stream;

                h.setLocalStream(stream);
            }).catch((e) => {
                console.error(`stream error: ${ e }`);
            });
        }


        function sendMsg(msg) {
            let data = {
                room: room,
                msg: msg,
                sender: username
            };
            socket.emit('chat', data);

            h.addChat(data, 'local');
        }



        function init(createOffer, otherClient) {
            pc[otherClient] = new RTCPeerConnection(h.getIceServer());

            if (screen && screen.getTracks().length) {
                screen.getTracks().forEach((track) => {
                    pc[otherClient].addTrack(track, screen);
                });
            } else if (myStream) {
                myStream.getTracks().forEach((track) => {
                    pc[otherClient].addTrack(track, myStream);
                });
            } else {
                h.getUserFullMedia().then((stream) => {

                    myStream = stream;

                    stream.getTracks().forEach((track) => {
                        pc[otherClient].addTrack(track, stream);
                    });

                    h.setLocalStream(stream);
                }).catch((e) => {
                    console.error(`stream error: ${ e }`);
                });
            }



            //create offer
            if (createOffer) {
                pc[otherClient].onnegotiationneeded = async() => {
                    let offer = await pc[otherClient].createOffer();

                    await pc[otherClient].setLocalDescription(offer);

                    socket.emit('sdp', { description: pc[otherClient].localDescription, to: otherClient, sender: socketId });
                };
            }




            pc[otherClient].onicecandidate = ({ candidate }) => {
                socket.emit('ice candidates', { candidate: candidate, to: otherClient, sender: socketId });
            };




            pc[otherClient].ontrack = (e) => {
                let str = e.streams[0];
                if (document.getElementById(`${ otherClient }-video`)) {
                    document.getElementById(`${ otherClient }-video`).srcObject = str;
                } else {

                    let newVid = document.createElement('video');
                    newVid.id = `${ otherClient }-video`;
                    newVid.srcObject = str;
                    newVid.autoplay = true;
                    newVid.className = 'remote-video';

                    // template
                    let controlDiv = document.createElement('div');
                    controlDiv.className = 'remote-video-controls';
                    controlDiv.innerHTML = `<i class="fa fa-microphone text-white pr-3 mute-remote-mic" title="Mute"></i>
                        <i class="fa fa-expand text-white expand-remote-video" title="Expand"></i>`;

                    //template
                    let cardDiv = document.createElement('div');
                    cardDiv.className = 'card card-sm';
                    cardDiv.id = otherClient;
                    cardDiv.appendChild(newVid);
                    cardDiv.appendChild(controlDiv);
                    document.getElementById('videos').appendChild(cardDiv);

                    h.adjustVideoElemSize();
                }
            };



            pc[otherClient].onconnectionstatechange = (d) => {
                switch (pc[otherClient].iceConnectionState) {
                    case 'disconnected':
                    case 'failed':
                        h.closeVideo(otherClient);
                        break;

                    case 'closed':
                        h.closeVideo(otherClient);
                        break;
                }
            };



            pc[otherClient].onsignalingstatechange = (d) => {
                switch (pc[otherClient].signalingState) {
                    case 'closed':
                        console.log("Signalling state is 'closed'");
                        h.closeVideo(otherClient);
                        break;
                }
            };
        }
        const muteUnmute = () => {
            x = document.getElementById('toggle-mute');
            console.log(myStream);
            const enabled = myStream.getAudioTracks()[0].enabled;
            if (enabled) {
                myStream.getAudioTracks()[0].enabled = false;
                setUnmuteButton();
            } else {
                setMuteButton();
                myStream.getAudioTracks()[0].enabled = true;

            }
        }

        const setMuteButton = () => {
            const html = `
            <i class="fas fa-microphone"></i>
            <span>Mute</span>
          `
            document.querySelector('.main-mute-button').innerHTML = html;
        }

        const setUnmuteButton = () => {
            const html = `
            <i class="unmute fas fa-microphone-slash"></i>
            <span>Unmute</span>
          `
            document.querySelector('.main-mute-button').innerHTML = html;
        }


        function shareScreen() {
            h.shareScreen().then((stream) => {
                h.toggleShareIcons(true);

                h.toggleVideoBtnDisabled(true);

                screen = stream;


                broadcastNewTracks(stream, 'video', false);
                screen.getVideoTracks()[0].addEventListener('ended', () => {
                    stopSharingScreen();
                });
            }).catch((e) => {
                console.error(e);
            });
        }



        function stopSharingScreen() {

            h.toggleVideoBtnDisabled(false);

            return new Promise((res, rej) => {
                screen.getTracks().length ? screen.getTracks().forEach(track => track.stop()) : '';

                res();
            }).then(() => {
                h.toggleShareIcons(false);
                broadcastNewTracks(myStream, 'video');
            }).catch((e) => {
                console.error(e);
            });
        }



        function broadcastNewTracks(stream, type, mirrorMode = true) {
            h.setLocalStream(stream, mirrorMode);

            let track = type == 'audio' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];

            for (let p in pc) {
                let pName = pc[p];

                if (typeof pc[pName] == 'object') {
                    h.replaceTrack(track, pc[pName]);
                }
            }
        }


        function toggleRecordingIcons(isRecording) {
            let e = document.getElementById('record');

            if (isRecording) {
                e.setAttribute('title', 'Stop recording');
                e.children[0].classList.add('text-danger');
                e.children[0].classList.remove('text-white');
            } else {
                e.setAttribute('title', 'Record');
                e.children[0].classList.add('text-white');
                e.children[0].classList.remove('text-danger');
            }
        }


        function startRecording(stream) {
            mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });

            mediaRecorder.start(1000);
            toggleRecordingIcons(true);

            mediaRecorder.ondataavailable = function(e) {
                recordedStream.push(e.data);
            };

            mediaRecorder.onstop = function() {
                toggleRecordingIcons(false);

                h.saveRecordedStream(recordedStream, username);

                setTimeout(() => {
                    recordedStream = [];
                }, 3000);
            };

            mediaRecorder.onerror = function(e) {
                console.error(e);
            };
        }



        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.which === 13 && (e.target.value.trim())) {
                e.preventDefault();

                sendMsg(e.target.value);

                setTimeout(() => {
                    e.target.value = '';
                }, 50);
            }
        });

        const playStop = () => {

            let enabled = VideoShownStream.getVideoTracks()[0].enabled;
            if (enabled) {
                VideoShownStream.getVideoTracks()[0].enabled = false;
                setPlayVideo();
            } else {
                setStopVideo();
                VideoShownStream.getVideoTracks()[0].enabled = true;

            }
        }

        const setStopVideo = () => {
            const html = `
              <i class="fas fa-video"></i>
              <span>Stop Video</span>
            `
            document.querySelector('.main-video-button').innerHTML = html;
        }

        const setPlayVideo = () => {
            const html = `
            <i class="stop fas fa-video-slash"></i>
              <span>Play Video</span>
            `
            document.querySelector('.main-video-button').innerHTML = html;
        }


        document.getElementById('toggle-video').addEventListener('click', (e) => {
            e.preventDefault();

            let elem = document.getElementById('toggle-video');

            if (myStream.getVideoTracks()[0].enabled) {
                e.target.classList.remove('fa-video');
                e.target.classList.add('fa-video-slash');
                elem.setAttribute('title', 'Show Video');

                myStream.getVideoTracks()[0].enabled = false;
            } else {
                e.target.classList.remove('fa-video-slash');
                e.target.classList.add('fa-video');
                elem.setAttribute('title', 'Hide Video');

                myStream.getVideoTracks()[0].enabled = true;
            }

            broadcastNewTracks(myStream, 'video');
        });



        document.getElementById('toggle-mute').addEventListener('click', (e) => {
            e.preventDefault();

            let elem = document.getElementById('toggle-mute');

            if (myStream.getAudioTracks()[0].enabled) {
                e.target.classList.remove('fa-microphone-alt');
                e.target.classList.add('fa-microphone-alt-slash');
                elem.setAttribute('title', 'Unmute');

                myStream.getAudioTracks()[0].enabled = false;
            } else {
                e.target.classList.remove('fa-microphone-alt-slash');
                e.target.classList.add('fa-microphone-alt');
                elem.setAttribute('title', 'Mute');

                myStream.getAudioTracks()[0].enabled = true;
            }

            broadcastNewTracks(myStream, 'audio');
        });


        document.getElementById('share-screen').addEventListener('click', (e) => {
            e.preventDefault();

            if (screen && screen.getVideoTracks().length && screen.getVideoTracks()[0].readyState != 'ended') {
                stopSharingScreen();
            } else {
                shareScreen();
            }
        });



        document.getElementById('record').addEventListener('click', (e) => {
            if (!mediaRecorder || mediaRecorder.state == 'inactive') {
                h.toggleModal('recording-options-modal', true);
            } else if (mediaRecorder.state == 'paused') {
                mediaRecorder.resume();
            } else if (mediaRecorder.state == 'recording') {
                mediaRecorder.stop();
            }
        });



        document.getElementById('record-screen').addEventListener('click', () => {
            h.toggleModal('recording-options-modal', false);

            if (screen && screen.getVideoTracks().length) {
                startRecording(screen);
            } else {
                h.shareScreen().then((screenStream) => {
                    startRecording(screenStream);
                }).catch(() => {});
            }
        });



        document.getElementById('record-video').addEventListener('click', () => {
            h.toggleModal('recording-options-modal', false);

            if (myStream && myStream.getTracks().length) {
                startRecording(myStream);
            } else {
                h.getUserFullMedia().then((videoStream) => {
                    startRecording(videoStream);
                }).catch(() => {});
            }
        });
    }
});