var curPlayer = {
		playerName : "Player",
		money : {current:0, total:0},
		life : {current:100, max:100},
		perSec : 0,
		overTime : 0
		}



function increment(amount){
	curPlayer.perSec += amount;
	document.getElementById('perSec').innerHTML = curPlayer.perSec;
}
function decrement(amount){
	curPlayer.perSec -= amount;
	document.getElementById('perSec').innerHTML = curPlayer.perSec;
}

window.setInterval(function(){
	
	curPlayer.overTime += curPlayer.perSec;
	console.log(curPlayer.overTime);
	document.getElementById('overTime').innerHTML = curPlayer.overTime;


}, 1000);