let socket = io();

// All Elements Needed
let $form = document.querySelector('#form-data');
let $messageInput = $form.elements.messageInput;
let $messageBtn = $form.elements.btn;
let $locationBtn = document.querySelector('#location');
let $messageContainer = document.querySelector('#message-container');
let $sidebarContainer = document.querySelector('#sidebar');

// All Templates
let messageTemplate = document.querySelector('#message-template').innerHTML;
let locationTemplate = document.querySelector('#location-template').innerHTML;
let sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;


const autoscroll = ()=>{
    // Get the height of the newly added element with margins
    let newAddedElement = $messageContainer.children[$messageContainer.children.length - 1];
    let marginBottomOfElement = parseInt(getComputedStyle(newAddedElement).marginBottom);
    let newMessageHeight = newAddedElement.offsetHeight + marginBottomOfElement;

    //height what you see
    let visibleHeight = $messageContainer.offsetHeight;

    //height of te message container
    let heightOfContainer = $messageContainer.scrollHeight;

    //height where the user is currently before adding new element
    let scrolledTillNow = $messageContainer.scrollTop + visibleHeight;

    //scroll only if user is at the bottom of the chat window
    if(!(heightOfContainer > (scrolledTillNow + newMessageHeight))){
        $messageContainer.scrollTop = $messageContainer.scrollHeight;
    }
}

//Options
let  { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.on('locationMessage', ({ url, createdAt, username })=>{
    let html = Mustache.render(locationTemplate, {
        link: url,
        createdAt: moment(createdAt).format('h:MMA'),
        username
    });
    $messageContainer.innerHTML += html;
    autoscroll();
});

socket.on('message', ({message, createdAt, username })=>{

    let html = Mustache.render(messageTemplate, {
        message,
        createdAt: moment(createdAt).format('h:mma'),
        username
    });
    $messageContainer.innerHTML += html;
    autoscroll();
});


$messageBtn.addEventListener('click', (e)=>{
    e.preventDefault();

    $messageBtn.disabled = true;
    let value = $messageInput.value;
    socket.emit('sendMessage', value, ()=>{
        $messageBtn.disabled = false;
        $messageInput.value = '';
        $messageInput.focus();
        autoscroll();
    });
});

$locationBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    $locationBtn.disabled = true;
    if(!navigator.geolocation){
        console.log('Location not available');
    }

    navigator.geolocation.getCurrentPosition((position)=>{
        let { latitude, longitude } = position.coords;

        socket.emit('sendLocation', { latitude, longitude }, (message)=>{
            $locationBtn.disabled = false;
            autoscroll();
        });
    });
});

socket.emit('join', { username, room }, (error)=>{
    if(error){
        alert(error);
        location.href = '/';
        return;
    }
});

socket.on('userData', ({ room, users })=>{
    let html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    $sidebarContainer.innerHTML = html;
})