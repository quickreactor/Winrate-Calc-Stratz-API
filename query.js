/*
This is an example snippet - you should consider tailoring it
to your service.
*/

var heroes = "Abaddon,Alchemist,Ancient Apparition,Anti-Mage,Arc Warden,Axe,Bane,Batrider,Beastmaster,Bloodseeker,Bounty Hunter,Brewmaster,Bristleback,Broodmother,Centaur Warrunner,Chaos Knight,Chen,Clinkz,Clockwerk,Crystal Maiden,Dark Seer,Dark Willow,Dawnbreaker,Dazzle,Death Prophet,Disruptor,Doom,Dragon Knight,Drow Ranger,Earth Spirit,Earthshaker,Elder Titan,Ember Spirit,Enchantress,Enigma,Faceless Void,Grimstroke,Gyrocopter,Hoodwink,Huskar,Invoker,Io,Jakiro,Juggernaut,Keeper of the Light,Kunkka,Legion Commander,Leshrac,Lich,Lifestealer,Lina,Lion,Lone Druid,Luna,Lycan,Magnus,Marci,Mars,Medusa,Meepo,Mirana,Monkey King,Morphling,Naga Siren,Nature's Prophet,Necrophos,Night Stalker,Nyx Assassin,Ogre Magi,Omniknight,Oracle,Outworld Destroyer,Pangolier,Phantom Assassin,Phantom Lancer,Phoenix,Primal Beast,Puck,Pudge,Pugna,Queen of Pain,Razor,Riki,Rubick,Sand King,Shadow Demon,Shadow Fiend,Shadow Shaman,Silencer,Skywrath Mage,Slardar,Slark,Snapfire,Sniper,Spectre,Spirit Breaker,Storm Spirit,Sven,Techies,Templar Assassin,Terrorblade,Tidehunter,Timbersaw,Tinker,Tiny,Treant Protector,Troll Warlord,Tusk,Underlord,Undying,Ursa,Vengeful Spirit,Venomancer,Viper,Visage,Void Spirit,Warlock,Weaver,Windranger,Winter Wyvern,Witch Doctor,Wraith King,Zeus";
var heroesArr = heroes.split(',');
var hero = '';
var teammate = '';
var person ='';
var heroDropdown = document.getElementById("hero-select");
var personDropdown = document.getElementById("person-select");
var teammateDropdown = document.getElementById("teammate-select");
heroDropdown.addEventListener("change", (event) => {
    hero = event.target.value;
    localStorage.setItem('hero', hero.replace("_", " "));
});
personDropdown.addEventListener("change", (event) => {
    person = event.target.value;
    localStorage.setItem('person', person);
});
teammateDropdown.addEventListener("change", (event) => {
    teammate = event.target.value;
    localStorage.setItem('teammate', teammate);
});
fetch("members.json")
  .then(response => response.json())
  .then(json => {
    var savedPerson = parseInt(localStorage.getItem('person'));
    var savedTeammate = parseInt(localStorage.getItem('teammate'));
    json.forEach(e => {
    personDropdown.innerHTML += `<option value=${e.steamAccount.id} ${e.steamAccount.id === savedPerson ? 'selected' : ''}>${e.steamAccount.name}</option>`;
    teammateDropdown.innerHTML += `<option value=${e.steamAccount.id} ${e.steamAccount.id === savedTeammate ? 'selected' : ''}>${e.steamAccount.name}</option>`;
  })});

var savedHero = localStorage.getItem('hero');
heroesArr.forEach(e => heroDropdown.innerHTML += `<option value=${e.replace(" ", "_")} ${e === savedHero ? 'selected' : ''}>${e}</option>`);







async function fetchGraphQL(operationsDoc, operationName, variables) {
    const result = await fetch(
      "https://api.stratz.com/graphql?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJodHRwczovL3N0ZWFtY29tbXVuaXR5LmNvbS9vcGVuaWQvaWQvNzY1NjExOTgwMjUxMTgwOTIiLCJ1bmlxdWVfbmFtZSI6IktJTkdTIE9GIE1ZS09OT1MiLCJTdWJqZWN0IjoiYjJhY2UzZjctYmY5NS00MDU3LWFkMjMtNWUyYTJjZjYxMmQ4IiwiU3RlYW1JZCI6IjY0ODUyMzY0IiwibmJmIjoxNjYwNzE2NjQxLCJleHAiOjE2OTIyNTI2NDEsImlhdCI6MTY2MDcxNjY0MSwiaXNzIjoiaHR0cHM6Ly9hcGkuc3RyYXR6LmNvbSJ9.bbyyTZu8IhOMPLJtv1hxsewbkelugLO5BERoq4nysdo",
      {
        method: "POST",
        body: JSON.stringify({
          query: operationsDoc,
          variables: variables,
          operationName: operationName
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  
    return await result.json();
  }
  
  var operationsDoc = `
    query MyQuery ($person: Long!, $teammate: [Long]){
      player(steamAccountId: $person) {
        names(take: 1) {
          name
        }
        matches(request: {withFriendSteamAccountIds: $teammate, take: 100}) {
          didRadiantWin
          players {
            steamAccount {
              id
              name
            }
            hero {
              displayName
            }
            isRadiant
          }
        }
      }
    }`;
  
  function fetchMyQuery() {
    return fetchGraphQL(
      operationsDoc,
      "MyQuery",
      { "person" : parseInt(personDropdown.value) , "teammate" : parseInt(teammateDropdown.value)}
    );
  }
  
  async function startFetchMyQuery() {
    const { errors, data } = await fetchMyQuery();
  
    if (errors) {
      // handle those errors like a pro
      console.error(errors);
    }
  
    // do something great with this precious data
    var heroName = heroDropdown.value.replace("_", " ");
    getWinRatewithHero(data,heroName,100)
    return data;
  }
  
  var savedData = "";
  
  function getWinRatewithHero(data, dHero, numGames) {
    // qualifyingGames = games.filter(grunty.hero = dHero)
    var protagonist = parseInt(personDropdown.value);
    var deuteragonist = parseInt(teammateDropdown.value);

    var games = data.player.matches;
    var qualGames = games.filter(e => {
        var players = e.players;
        //console.log(players);
        var dPlayer = players.find(e => e.steamAccount.id === deuteragonist);
        //console.log(dPlayer.hero.displayName);
        return dPlayer.hero.displayName === dHero;
    });
    console.log(qualGames.length);
    // winningGames = qualifyingGames.filter(gruntyWasRadiant === didRadiantWin)
    var winningGames = getWins(qualGames, deuteragonist);
    //console.log(winningGames);
    var totalWinRate = Math.floor((getWins(games, deuteragonist).length / games.length) * 100);
    var heroWinRate = Math.floor((winningGames.length / qualGames.length) * 100);
    var resultsDiv = document.querySelector(".results");
    var teammateName = teammateDropdown.options[teammateDropdown.selectedIndex].text;
    var heroWinRateText = `You have a ${heroWinRate}% win-rate when ${teammateName} played ${dHero} over ${qualGames.length} games`;
    var totalWinRateText = `Win rate overall with ${teammateName}: ${totalWinRate}%`;
    var difference = heroWinRate - totalWinRate;
    var differenceText = `You are ${difference}% ${difference > 0 ? 'more': 'less'} likely to win when ${teammateName} picks ${dHero}.`
    if (qualGames.length === 0) {
      resultsDiv.innerText = `
      You havent played any games where ${teammateName} has played ${dHero} in your last 100 games together.`;
    } else {
      resultsDiv.innerText = `
      ${heroWinRateText}
      ${totalWinRateText}
      ${differenceText}
      `;
    }
  
    //console.log()
  }

  function getWins(gamesArr, deuteragonist) {
    var winningGamesArr = gamesArr.filter(e => {
        var players = e.players;
        //console.log(players);
        var dPlayer = players.find(e => e.steamAccount.id === deuteragonist);
        return (dPlayer.isRadiant === e.didRadiantWin);
    });
    return winningGamesArr
  }

  function getStats() {
    savedData = startFetchMyQuery();
  }