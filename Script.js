const bootMessages = [
"INITIALIZING...",
"CONNECTING AI NODES...",
"CONNECTING BLOCKCHAINS...",
"ESTABLISHING SUPPORT LAYER...",
"SYNCHRONIZING COMMUNITY...",
"ACTIVATING INTELLIGENCE NETWORK...",
"WELCOME TO TEC5UPORT DIMENSION"
];

let index = 0;

const bootText =
document.getElementById("boot-text");

function nextMessage(){

if(index < bootMessages.length){

bootText.innerHTML =
bootMessages[index];

index++;

setTimeout(nextMessage,700);

}else{

setTimeout(()=>{

document
.getElementById("boot-screen")
.classList
.add("boot-hidden");

},1200);

}

}

window.onload = ()=>{
nextMessage();
};
