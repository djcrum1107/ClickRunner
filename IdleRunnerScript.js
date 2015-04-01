/*
David Crum aka Dr. Rogue
Idle Runner Javascript section
*/

//Upgrades
var curUpgrades = {
		//General Upgrades
		startJogging : {available:false, unlocked:false},
		startRunning : {available:false, unlocked:false},
		
		//Stamina Upgrades
		trainRight : {available:false, unlocked:false},
		
		//Speed Upgrades
		large_stride : {available:false, unlocked:false},
		
		//Precision Upgrades
		
		//Run Over Time Upgrades
		runTeam : {available:false, unlocked:false}
		
		//Charity Upgrades
		}

//Hold the current player's stats including name, money, and running stats.
var curPlayer = {
		//Basic player information and stats
		playerName : "Player",
		money : {current:0, total:0},
		life : {current:100, max:100},
		distance : {current:0, total:0, totalWalking:0, totalJogging:0, totalRunning:0},
		stamina : {current:10, max:10},
		overrunLifeAmt : 10,
		
		//Movement stats including stride lengths, type booleans, and run times
		walkStride : 1,
		jogStride : 2,
		runStride : 5,
		moving : false,
		walking : false,
		jogging : false,
		running : false,
		movingTime : 0,
		walkTime : 0,
		jogTime: 0,
		runTime : 0,
		
		//Miscellaneous variables 
		sponserLevel : 0,
		lifeTime : 0
		}

//Hold's the current charity's stats such as player's position, money, and research
var curCharity = {
		charityPrefix : "Walkathon",
		charityName : "Charity",
		charityDesc : "",
		playerPosition : "",
		money : {current:0, total:0},
		researchTime : 0,
		researchAmt : 3,
		researchMoneyAmt : 30,
		staminaResearch : {amount:0, level:0},
		speedResearch : {amount:0, level:0},
		precisionResearch : {amount:0, level:0},
		totalResearch : 0,
		researchFocus : "none"
		}
		
//Running done over time by different people and groups
var roTs = {
		friends : {amount:0, cost:10},
		trackRunner : {amount:0, cost:100},
		fiveK : {amount:0, cost:1000},
		tenK : {amount:0, cost:10000},
		halfMarathon : {amount:0, cost:100000},
		marathon : {amount:0, cost:1000000}
		}
		
//Variables meant to carry through regardless of updates to hold information such as game time
var curGame = {
		totalGameTime : 0,
		totalResearchMoney : 0
}

//Variables that do not get saved and are just initialized once
var step = 0;
var addRunnerAmount = 1;
var amt = 0;
var cost = 0;
var runnerCharityMoney = 0;







//This section of code runs every second
window.setInterval(function(){
	curPlayer.lifeTime += 1;
	curGame.totalGameTime += 1;
	
	
	charityRunners();
	updateMoney();
	checkMovement();

	updateStats();
	updateResearch();
	
	
	
	document.getElementById('notEnoughMoney').style.display = "none";


}, 1000);


//JQuery ready functions and listeners
$(document).ready(function () {


	//JQuery to change the add runner amount
	$("input[name=runnerAmount]:radio").change(function() {
	   addRunnerAmount = parseInt($('input[name=runnerAmount]:checked').val());
	   console.log(addRunnerAmount);
	});
	
		$("#tabs").tabs();
	$(function() {
	});
	
});



//Everything related to the player's movement actions that happens every second such as what type of movement is going on and recovery if not moving. Used to set limits with 
function checkMovement(){
	//What happens if the player is walking each second
	if(curPlayer.walking){
		curPlayer.walkTime += 1;
		curPlayer.walking = false;
	}
	//What happens if the player is jogging each second
	if(curPlayer.jogging){
		curPlayer.jogTime += 1;
		curPlayer.jogging = false;
	}
	//What happens if the player is running each second
	if(curPlayer.running){
		curPlayer.runTime += 1;
		curPlayer.running = false;
	}
	//What happens if the player is moving at all each second. If not moving at all recovers.
	if(curPlayer.moving){
		curPlayer.moveingTime += 1;
		curPlayer.moving = false;
	}else{
		endRun();
		recoverStamina();
		recoverLife();
	}
}

//Actions caused by walking, set to be slow gains but with little risk to stamina and none to health. Eventually able to be done continuously
function walkClick(){
	if(!$('#walkButton').is(':animated')){
		step = 0;
		$('#walkButton').animate({opacity : '0'}, 1);
		$('#walkButton').animate({opacity : '0.5'}, 800);
		$('#walkButton').animate({opacity : '1'}, 1);
		if(curPlayer.stamina.current > 0){
			step = curPlayer.walkStride;
		}else{
			step = curPlayer.walkStride / 2;
		}
		if($('#jogButton').hasClass('hidden')){
			console.log("hidden");
			$('#jogButton').fadeIn('slow');
			$('#jogButton').removeClass('hidden');
		}
		curPlayer.distance.current += step;
		curPlayer.moving = true;
		curPlayer.walking = true;
		curPlayer.jogging = false;
		curPlayer.running = false;
		updateStats();
	}
}

//Actions caused by jogging, set to be faster than walking and carries more risk with stamina and a little with health.
function jogClick(){
	step = 0;
	if(curPlayer.stamina.current > 0){
		step = curPlayer.jogStride;
	}else{
		step = curPlayer.walkStride;
	}
	if($('#runButton').hasClass('hidden')){
		$('#runButton').fadeIn('slow');
		$('#runButton').removeClass('hidden');
	}
	curPlayer.distance.current += step;
	curPlayer.moving = true;
	curPlayer.walking = false;
	curPlayer.jogging = true;
	curPlayer.running = false;
	updateStats();
}

//Actions caused by running, set to be the fastest with possible the exception of sprinting if implemented. Uses much stamina and can be a risk to health if pushed enough.
function runClick(){
	step = 0;
	if(curPlayer.life.current > curPlayer.overrunLifeAmt){
		if(curPlayer.stamina.current > 0){
			step = curPlayer.runStride;
			curPlayer.stamina.current -= 1;
		}else{
			step = curPlayer.runStride / 5;
			curPlayer.life.current -= curPlayer.overrunLifeAmt;
			curPlayer.stamina.max += 1;
		}
		curPlayer.distance.current += step;
		console.log(curPlayer.runStride)
		curPlayer.moving = true;
		curPlayer.walking = false;
		curPlayer.jogging = false;
		curPlayer.running = true;
		updateStats();
	}
}

//Updates the stats, usually done during movement but also upgrades every second
function updateStats(){
	document.getElementById('currentHealth').innerHTML = makePretty(curPlayer.life.current);
	document.getElementById('currentStamina').innerHTML = makePretty(curPlayer.stamina.current);
	document.getElementById('maxStamina').innerHTML = makePretty(curPlayer.stamina.max);
	document.getElementById('currentRun').innerHTML = makePretty(curPlayer.distance.current);
	
	document.getElementById('totalGameTime').innerHTML = makeTime(curGame.totalGameTime);
	document.getElementById('totalPersonalMoney').innerHTML = makePretty(curPlayer.money.total);
	document.getElementById('totalCharityMoney').innerHTML = makePretty(curCharity.money.total);
	document.getElementById('totalResearchMoney').innerHTML = makePretty(curGame.totalResearchMoney);
	
}

//What happens at the end of a run, however long. Longer runs can allow for greater bonuses
function endRun(){
	var dist = curPlayer.distance.current;
	curPlayer.distance.current = 0;
	document.getElementById('currentRun').innerHTML = curPlayer.distance.current;
	curPlayer.money.current +=  dist * .1;
	curPlayer.runTime = 0;
	updateMoney();
}

//Donate money to charity, negative inputs will donate all
function donate(amt){
	if(amt < 0){
		curCharity.money.current += curPlayer.money.current;
		curCharity.money.total += curPlayer.money.current;
		curPlayer.money.current = 0;
	}else{
		amt = parseFloat(document.getElementById("donationAmount").value);
		if(isNaN(amt)){
			console.log("Not correct donation format");
			document.getElementById("donationAmount").value = "Incorrect format";
		}
		else if(curPlayer.money.current >= amt){
			curCharity.money.current += amt;
			curCharity.money.total += amt;
			curPlayer.money.current -= amt;
		}else{
			document.getElementById("donationAmount").value = curPlayer.money.current;
			document.getElementById('notEnoughMoney').style.display = "inline"
		}
	}
	updateMoney();
}

//Adds the money from runners to the charity
function charityRunners(){
	runnerCharityMoney = 0;
	runnerCharityMoney += roTs.friends.amount * .2;
	
	
	curCharity.money.current += runnerCharityMoney;
	curCharity.money.total += runnerCharityMoney;
}

//Adding a friend to run for the charity
function addRunner(runnerType){
	//amt = roTs[runnerType].amount;
	//cost = roTs[runnerType].cost;
	for(i = 0; i < addRunnerAmount; i++){
		if(curPlayer.money.current >= roTs[runnerType].cost){
		roTs[runnerType].amount++;
		curPlayer.money.current -= roTs[runnerType].cost;
		roTs[runnerType].cost = 10 + Math.pow(1.1, roTs[runnerType].amount);
		}else{
			document.getElementById('notEnoughMoney').style.display = "inline";
			break;
		}
	}
	document.getElementById('currentFriends').innerHTML = roTs.friends.amount;
	document.getElementById('currentFriendsCost').innerHTML = makePretty(roTs.friends.cost);
	updateMoney();
}

//Adding a track runner to run for the charity
function addTrackRunner(){
	amt = roTs.trackRunner.amt;
	cost = roTs.trackRunner.cost * addRunnerAmount + Math.pow(amt, 1.2);
	if(curPlayer.money.current >= roTs.trackRunner.cost){
		roTs.trackRunner.amount += 1;
		curPlayer.money.current -= roTs.trackRunner.cost;
		roTs.trackRunner.cost = Math.floor(Math.pow(roTs.trackRunner.cost, 1.05));
	}else{
		document.getElementById('notEnoughMoney').style.display = "inline";
	}
	document.getElementById('currentTrackRunner').innerHTML = roTs.trackRunner.amount;
	document.getElementById('currentTrackRunnerCost').innerHTML = makePretty(roTs.trackRunner.cost);
	updateMoney();
}

//Adding a 5K runner to run for the charity
function add5KRunner(){
	amt = roTs.fiveK.amt;
	cost = roTs.fiveK.cost * addRunnerAmount + Math.pow(amt, 1.2);
	if(curPlayer.money.current >= roTs.fiveK.cost){
		roTs.fiveK.amount += 1;
		curPlayer.money.current -= roTs.fiveK.cost;
		roTs.fiveK.cost = Math.floor(Math.pow(roTs.fiveK.cost, 1.05));
	}else{
		document.getElementById('notEnoughMoney').style.display = "inline";
	}
	document.getElementById('current5KRunners').innerHTML = roTs.fiveK.amount;
	document.getElementById('current5KRunnerCost').innerHTML = makePretty(roTs.fiveK.cost);
	updateMoney();
}

//Adding a 10K runner to run for the charity
function add10KRunner(){
	amt = roTs.tenK.amt;
	cost = roTs.tenK.cost * addRunnerAmount + Math.pow(amt, 1.2);
	if(curPlayer.money.current >= roTs.tenK.cost){
		roTs.tenK.amount += 1;
		curPlayer.money.current -= roTs.tenK.cost;
		roTs.tenK.cost = Math.floor(Math.pow(roTs.tenK.cost, 1.05));
	}else{
		document.getElementById('notEnoughMoney').style.display = "inline";
	}
	document.getElementById('current10KRunners').innerHTML = roTs.tenK.amount;
	document.getElementById('current10KRunnerCost').innerHTML = makePretty(roTs.tenK.cost);
	updateMoney();
}

//Adding a half marathon runner to run for the charity
function addHalfMarathon(){
	amt = roTs.halfMarathon.amt;
	cost = roTs.halfMarathon.cost * addRunnerAmount + Math.pow(amt, 1.2);
	if(curPlayer.money.current >= roTs.halfMarathon.cost){
		roTs.halfMarathon.amount += 1;
		curPlayer.money.current -= roTs.halfMarathon.cost;
		roTs.halfMarathon.cost = Math.floor(Math.pow(roTs.halfMarathon.cost, 1.05));
	}else{
		document.getElementById('notEnoughMoney').style.display = "inline";
	}
	document.getElementById('currentHalfRunners').innerHTML = roTs.halfMarathon.amount;
	document.getElementById('currentHalfRunnerCost').innerHTML = makePretty(roTs.halfMarathon.cost);
	updateMoney();
}

//Adding a full marathon runner to run for the charity
function addMarathon(){
	amt = roTs.marathon.amt;
	cost = roTs.marathon.cost * addRunnerAmount + Math.pow(amt, 1.2);
	if(curPlayer.money.current >= roTs.marathon.cost){
		roTs.marathon.amount += 1;
		curPlayer.money.current -= roTs.marathon.cost;
		roTs.marathon.cost = Math.floor(Math.pow(roTs.marathon.cost, 1.05));
	}else{
		document.getElementById('notEnoughMoney').style.display = "inline";
	}
	document.getElementById('currentMarathonRunners').innerHTML = roTs.marathon.amount;
	document.getElementById('currentMarathonRunnerCost').innerHTML = makePretty(roTs.marathon.cost);
	updateMoney();
}

//Working whatever the current job the player has
function workJob(){
	if(!$('#workJob').is(':animated')){
		console.log("working");
		$('#workJob').animate({opacity : '0'}, 1);
		$('#workJob').animate({opacity : '0.8'}, 8000);
		$('#workJob').animate({opacity : '1'}, 1);
		curPlayer.money.current += 500000;
		curPlayer.money.total += 500000;
	}
	updateMoney();
}

//Updates the research that is going on. Every ten seconds if there is enough money for research it gets removed from charity and divided among research areas. Once an amount is hit the research grows a level and starts over.
function updateResearch(){
	curCharity.researchTime += 1;
	if(curCharity.researchTime >= 10){
		curCharity.researchTime = 0;
		if(curCharity.money.current > curCharity.researchMoneyAmt){
			curCharity.money.current -= curCharity.researchMoneyAmt;
			curGame.totalResearchMoney += curCharity.researchMoneyAmt;
			//console.log(curGame.totalResearchMoney);
			curCharity.staminaResearch.amount += curCharity.researchAmt / 3;
			curCharity.speedResearch.amount += curCharity.researchAmt / 3;
			curCharity.precisionResearch.amount += curCharity.researchAmt / 3;
		}
		if(curCharity.staminaResearch.amount > Math.pow(2, curCharity.staminaResearch.level)){
			curCharity.staminaResearch.level += 1;
			curCharity.staminaResearch.amount = 0;
			document.getElementById('staminaResearchLevel').innerHTML = curCharity.staminaResearch.level;
		}
		if(curCharity.speedResearch.amount > Math.pow(2, curCharity.speedResearch.level)){
			curCharity.speedResearch.level += 1;
			curCharity.speedResearch.amount = 0;
			document.getElementById('speedResearchLevel').innerHTML = curCharity.speedResearch.level;
		}
		if(curCharity.precisionResearch.amount > Math.pow(2, curCharity.precisionResearch.level)){
			curCharity.precisionResearch.level += 1;
			curCharity.precisionResearch.amount = 0;
			document.getElementById('precisionResearchLevel').innerHTML = curCharity.precisionResearch.level;
		}
		document.getElementById("staminaResearchLevelProgress").value = curCharity.staminaResearch.amount;
		document.getElementById("staminaResearchLevelProgress").max = parseInt(Math.pow(2, curCharity.staminaResearch.level) + 1);
		document.getElementById("speedResearchLevelProgress").value = curCharity.speedResearch.amount;
		document.getElementById("speedResearchLevelProgress").max = parseInt(Math.pow(2, curCharity.speedResearch.level) + 1);
		document.getElementById("precisionResearchLevelProgress").value = curCharity.precisionResearch.amount;
		document.getElementById("precisionResearchLevelProgress").max = parseInt(Math.pow(2, curCharity.precisionResearch.level) + 1);
		
	}
	document.getElementById("researchTime").value = curCharity.researchTime * 10;
	updateUpgrades();
	updateMoney();
}

//Updates what upgrades are available. When it becomes shown and when it becomes unlocked (bought) where it is shown changes
function updateUpgrades(){
	if(curUpgrades.trainRight.available){
	console.log("working");
		$('#trainRightButton').removeClass('hidden');
	}
}

//Updates money. To be expanded to separate personal and charity
function updateMoney(){
	document.getElementById('currentMoney').innerHTML = curPlayer.money.current.toFixed(2);
	document.getElementById('charityMoney').innerHTML = curCharity.money.current.toFixed(2);
}

//Takes an input number and rounds it to prevent long decimals
function makePretty(num, places){
	if(places == undefined)
		places = 2;
	return Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
}

//Takes an input in the number of seconds and makes it easier to look at in a hour/min/sec format
function makeTime(seconds){
	if(seconds < 60)
		return seconds + " s";
	if(seconds < 3600)
		return Math.floor(seconds / 60) + " m " + seconds%60 + " s";
	if(seconds < 216000)
		return Math.floor(seconds / 3600) + " h " + Math.floor(seconds / 60)%60 + " m " + seconds%60 + " s";
}

//Recovers the stamina stat
function recoverStamina(){
	if(curPlayer.stamina.current < curPlayer.stamina.max){
		curPlayer.stamina.current += 1;
		document.getElementById('currentStamina').innerHTML = makePretty(curPlayer.stamina.current);
	}
}

//Recovers the life stat
function recoverLife(){
	if(curPlayer.life.current < curPlayer.life.max){
		curPlayer.life.current += .1;
		if(curPlayer.life.current > curPlayer.life.max){
			curPlayer.life.current = curPlayer.life.max;
		}
		document.getElementById('currentHealth').innerHTML = makePretty(curPlayer.life.current);
	}
}

//Takes an upgrade input from a button and sets that upgrade to true as well as put that upgrade into effect
function addUpgrade(upgrade){
	switch(upgrade){
		case "trainRight":
			if(!curUpgrades.trainRight.unlocked){
				curUpgrades.trainRight.unlocked = true;
				curPlayer.runStride += 1;
				$('#trainRightButton').hide();
			}
			break;
		
		default:
			break;
	}
}

//Save function locally saves all important information for the player
function save(){
	var save = {
		curPlayer: curPlayer,
		curGame: curGame,
		curCharity: curCharity,
		curUpgrades: curUpgrades,
		roTs: roTs
	}
	localStorage.setItem("save", JSON.stringify(save));
}

//Load function that is called when the page is loaded in as well as when the player wants to load in a previous save file
function load(){
	var savegame = JSON.parse(localStorage.getItem("save"));
	curPlayer = savegame.curPlayer;
	curGame = savegame.curGame;
	curCharity = savegame.curCharity;
	curUpgrades = savegame.curUpgrades;
	roTs = savegame.roTs;
}
