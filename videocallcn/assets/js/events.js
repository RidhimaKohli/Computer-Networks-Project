import funcss from './func.js';

window.addEventListener('load', () => {
    document.querySelector('#toggle-chat-pane').addEventListener('click', (e) => {
        let chatElem = document.querySelector('#chat-pane');
        let mainSecElem = document.querySelector('#main-section');

        if (chatElem.classList.contains('chat-opened')) {
            chatElem.setAttribute('hidden', true);
            mainSecElem.classList.remove('col-md-9');
            mainSecElem.classList.add('col-md-12');
            chatElem.classList.remove('chat-opened');
        } else {
            chatElem.attributes.removeNamedItem('hidden');
            mainSecElem.classList.remove('col-md-12');
            mainSecElem.classList.add('col-md-9');
            chatElem.classList.add('chat-opened');
        }


        setTimeout(() => {
            if (document.querySelector('#chat-pane').classList.contains('chat-opened')) {
                funcss.toggleChatNotificationBadge();
            }
        }, 300);
    });



    document.getElementById('local').addEventListener('click', () => {
        if (!document.pictureInPictureElement) {
            document.getElementById('local').requestPictureInPicture()
                .catch(error => {

                    console.error(error);
                });
        } else {
            document.exitPictureInPicture()
                .catch(error => {

                    console.error(error);
                });
        }
    });

    // document.getElementById('remote').addEventListener('click', () => {
    document.getElementById('create-room').addEventListener('click', (e) => {
        e.preventDefault();

        let roomName = document.querySelector('#room-name').value;
        let yourName = document.querySelector('#your-name').value;

        if (roomName && yourName) {

            document.querySelector('#err-msg').innerHTML = "";


            sessionStorage.setItem('username', yourName);


            let roomLink = `${ location.origin }?room=${ roomName.trim().replace( ' ', '_' ) }_${ funcss.generateRandomString() }`;

            document.querySelector('#room-created').innerHTML = `Room successfully created. Click <a href='${ roomLink }'>here</a> to enter room. 
                Share the room link with your partners.`;

            document.querySelector('#room-name').value = '';
            document.querySelector('#your-name').value = '';
        } else {
            document.querySelector('#err-msg').innerHTML = "All fields are required";
        }
    });


    document.getElementById('enter-room').addEventListener('click', (e) => {
        e.preventDefault();

        let name = document.querySelector('#username').value;

        if (name) {

            document.querySelector('#err-msg-username').innerHTML = "";


            sessionStorage.setItem('username', name);

            location.reload();
        } else {
            document.querySelector('#err-msg-username').innerHTML = "Please input your name";
        }
    });


    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('expand-remote-video')) {
            funcss.maximiseStream(e);
        } else if (e.target && e.target.classList.contains('mute-remote-mic')) {
            funcss.singleStreamToggleMute(e);
        }
    });


    document.getElementById('closeModal').addEventListener('click', () => {
        funcss.toggleModal('recording-options-modal', false);
    });
});



//js documentation check: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener


//fixed the file , working fine acccording to me