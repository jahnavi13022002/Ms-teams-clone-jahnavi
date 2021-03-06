const socket=io('/')
const videoGrid=document.getElementById('video-grid')

const myPeer = new Peer();
   //ADDITIONAL CODE (showing different grids)
   var getUserMedia =
   navigator.getUserMedia ||
   navigator.webkitGetUserMedia ||
   navigator.mozGetUserMedia;

  const myVideo=document.createElement('video')
  myVideo.muted=true

  const peers={} //FOR KEEPING TRACK OF ALL PEERS
  
  //STREAMING OUR VIDEO 
  let myVideoStream
  navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
  }).then(stream =>{
    myVideoStream=stream
  addVideoStream(myVideo,stream)
  
  //CALLING OTHER USERS
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected',userId =>{
    console.log('user connected '+ userId)
     connectToNewUser(userId,stream)

  })

  // FOR CHATTING 

  let text = $("input");
//when press enter send message
$('html').keydown(function (e) {
  if (e.which == 13 && text.val().length !== 0) {
    socket.emit('message', text.val());
    text.val('')
  }
});
socket.on("createMessage", message => {
  $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
  scrollToBottom()
})

  })
  socket.on('user-disconnected',userId =>{
     if(peers[userId]) peers[userId].close()
    //console.log(userId)
   })

  myPeer.on('open',id =>{
    socket.emit('join-room',ROOM_ID,id)  
 })

 //two show different grids ADDITIONAL CODE 
 myPeer.on("call", function(call){
    getUserMedia({
          video:true,
          audio:true
    
      }, function(stream){
        call.answer(stream);
        const video = document.createElement("video");
        call.on("stream", function (remoteStream) {
          addVideoStream(video, remoteStream);
        });
      }, function(err){
          console.log(err);
      })
   })

   //CONNECTING TO A DIFFERENT USER

 function connectToNewUser(userId,stream){
    const call=myPeer.call(userId,stream)
    const video=document.createElement('video')
    call.on('stream',userVideoStream =>{
        addVideoStream(video,userVideoStream)
    })
    call.on('close', ()=>{
      video.remove()
    }) 
     peers[userId]=call
}

//STREAMING THE VIDEO
function addVideoStream(video,stream){
    video.srcObject=stream
    video.addEventListener('loadedmetadata',()=>{
        video.play()
    })
    videoGrid.append(video)
}

//mute
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
  const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main_mute_button').innerHTML = html;
  }
  
  const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main_mute_button').innerHTML = html;
  }

  //stopping vdo 
  const playStop = () => {
    
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  }

  const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main_video_button').innerHTML = html;
  }
  
  const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main_video_button').innerHTML = html;
  }

  //MAKING CHAT WINDOW SCROLLABLE
 const scrollToBottom =()=>{
   var d=$('.main_chat_window');
   d.scrollTop(d.prop("scrollHeight"));
 }
