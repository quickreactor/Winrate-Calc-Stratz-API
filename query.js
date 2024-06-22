//HTML SETUP STUFF
var heroes = "Abaddon,Alchemist,Ancient Apparition,Anti-Mage,Arc Warden,Axe,Bane,Batrider,Beastmaster,Bloodseeker,Bounty Hunter,Brewmaster,Bristleback,Broodmother,Centaur Warrunner,Chaos Knight,Chen,Clinkz,Clockwerk,Crystal Maiden,Dark Seer,Dark Willow,Dawnbreaker,Dazzle,Death Prophet,Disruptor,Doom,Dragon Knight,Drow Ranger,Earth Spirit,Earthshaker,Elder Titan,Ember Spirit,Enchantress,Enigma,Faceless Void,Grimstroke,Gyrocopter,Hoodwink,Huskar,Invoker,Io,Jakiro,Juggernaut,Keeper of the Light,Kunkka,Legion Commander,Leshrac,Lich,Lifestealer,Lina,Lion,Lone Druid,Luna,Lycan,Magnus,Marci,Mars,Medusa,Meepo,Mirana,Monkey King,Morphling,Naga Siren,Nature's Prophet,Necrophos,Night Stalker,Nyx Assassin,Ogre Magi,Omniknight,Oracle,Outworld Destroyer,Pangolier,Phantom Assassin,Phantom Lancer,Phoenix,Primal Beast,Puck,Pudge,Pugna,Queen of Pain,Razor,Riki,Rubick,Sand King,Shadow Demon,Shadow Fiend,Shadow Shaman,Silencer,Skywrath Mage,Slardar,Slark,Snapfire,Sniper,Spectre,Spirit Breaker,Storm Spirit,Sven,Techies,Templar Assassin,Terrorblade,Tidehunter,Timbersaw,Tinker,Tiny,Treant Protector,Troll Warlord,Tusk,Underlord,Undying,Ursa,Vengeful Spirit,Venomancer,Viper,Visage,Void Spirit,Warlock,Weaver,Windranger,Winter Wyvern,Witch Doctor,Wraith King,Zeus";
var heroesArr = heroes.split(',');
var hero = '';
var teammate = '';
var person = '';
var heroDropdown = document.getElementById("hero-select");
var personDropdown = document.getElementById("person-select");
var teammateDropdown = document.getElementById("teammate-select");
heroDropdown.addEventListener("change", (event) => {
  hero = event.target.value;
  console.log(hero);
  localStorage.setItem('hero', hero.replaceAll("_", " "));
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
    json.sort((a, b) => a.steamAccount.name.localeCompare(b.steamAccount.name));
    json.forEach(e => {
      personDropdown.innerHTML += `<option value=${e.steamAccount.id} ${e.steamAccount.id === savedPerson ? 'selected' : ''}>${e.steamAccount.name}</option>`;
      teammateDropdown.innerHTML += `<option value=${e.steamAccount.id} ${e.steamAccount.id === savedTeammate ? 'selected' : ''}>${e.steamAccount.name}</option>`;
    })
  });

var savedHero = localStorage.getItem('hero');
heroesArr.forEach(e => heroDropdown.innerHTML += `<option value=${e.replaceAll(" ", "_")} ${e === savedHero ? 'selected' : ''}>${e}</option>`);

let myAPI_KEY = "";
if (local_API_KEY) {
  myAPI_KEY = local_API_KEY;
} else {
  myAPI_KEY = API_KEY;
}

// FETCH GRAPH QL
async function fetchGraphQL(operationsDoc, operationName, variables) {
  const result = await fetch(
    `https://api.stratz.com/graphql?jwt=${myAPI_KEY}`,
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

// GraphQL actual query
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
    { "person": parseInt(personDropdown.value), "teammate": parseInt(teammateDropdown.value) }
  );
}

async function startFetchMyQuery() {
  const { errors, data } = await fetchMyQuery();

  if (errors) {
    // handle those errors like a pro
    console.error(errors);
  }

  // do something great with this precious data
  var heroName = heroDropdown.value.replaceAll("_", " ");
  // getWinRatewithHero(data, heroName, 100,)
  listHeroesAndWinrates(data);
  console.log(data);
  return data;
}

var savedData = "";

function getWinRatewithHero(data, dHero, numGames,) {
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


  listHeroesAndWinrates(games, protagonist, deuteragonist);

  //console.log(qualGames.length);
  // winningGames = qualifyingGames.filter(gruntyWasRadiant === didRadiantWin)
  var winningGames = getWins(qualGames, deuteragonist);
  //console.log(winningGames);
  var totalWinRate = Math.floor((getWins(games, deuteragonist).length / games.length) * 100);
  var heroWinRate = Math.floor((winningGames.length / qualGames.length) * 100);
  var resultsDiv = document.querySelector(".results");
  var teammateName = teammateDropdown.options[teammateDropdown.selectedIndex].text;
  var heroWinRateText = `You have a ${heroWinRate}% win-rate when ${teammateName} played ${dHero} over ${qualGames.length} games.`;
  var totalWinRateText = `Win rate overall with ${teammateName}: ${totalWinRate}%.`;
  var difference = heroWinRate - totalWinRate;
  var differenceText = `You are ${difference > 0 ? difference : (difference * - 1)}% ${difference > 0 ? 'more' : 'less'} likely to win when ${teammateName} picks ${dHero}.`
  if (qualGames.length === 0) {
    resultsDiv.innerText = `
      You havent played any games where ${teammateName} has played ${dHero} in your last 100 games together.`;
  } else {
    // resultsDiv.innerText = `
    // ${heroWinRateText}
    // ${totalWinRateText}
    // ${differenceText}
    // `;
  }

  //console.log()
}

function listHeroesAndWinrates(data) {

  var user = parseInt(personDropdown.value);
  var teammate = parseInt(teammateDropdown.value);
  var userName = personDropdown.options[personDropdown.selectedIndex].text;
  var teammateName = teammateDropdown.options[teammateDropdown.selectedIndex].text;
  var games = data.player.matches;

  // Initialize variables
  let winCount = 0;
  const heroesData = {}; // Object to store data for each hero

  games.forEach(game => {
    
    // Identify Players
    var teammatePlayer = game.players.find(player => player.steamAccount.id === teammate);
    var userPlayer = game.players.find(player => player.steamAccount.id === user);
    var wonGame = teammatePlayer.isRadiant === game.didRadiantWin;

    // Identify Heroes
    var teammateHeroName = teammatePlayer.hero.displayName;
    var userHeroName = userPlayer.hero.displayName;

    // Add game to heroes obj
    if (!heroesData[teammateHeroName]) {
      heroesData[teammateHeroName] = { games: 0, winCount: 0 };
      // heroesData[teammateHeroName] = { games: [], winCount: 0 };
    }
    heroesData[teammateHeroName].games++;

    // Update wins
    if (wonGame) {
      winCount++;
      heroesData[teammateHeroName].winCount++;
    }
  });

  let winRate = Math.round((winCount / games.length) * 100);
  console.log(`${winRate}%`);
  
  const entries = Object.entries(heroesData);
  const sortedEntries = entries.sort((a, b) => b[1].games - a[1].games);
  resultArr = sortedEntries.map(e => {
    return `
    <div class="newRes">
    <div class="resCol hero">${e[0]}:</div>
    <div class="resCol games">${e[1].games} ${e[1].games > 1 ? 'games': 'game'}.</div>
    <div class="resCol winrate">${Math.floor((e[1].winCount / e[1].games) * 100)}% winrate.</div>
    </div>
    `
  });
  console.log(resultArr);

  var oWinRateDiv = document.querySelector(".overall-winrate");
  oWinRateDiv.innerHTML = `${userName} winrate with ${teammateName} over the last ${games.length} games: ${winRate}%`
  var resultsDiv = document.querySelector(".results");
  resultsDiv.innerHTML = resultArr.join("\n");
}

function gruntStats(data) {

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

function countOccurrences(arr) {
  // Object to store the counts
  var counts = {};

  // Iterate through the array
  for (var i = 0; i < arr.length; i++) {
    var num = arr[i];
    // If the number is not already a property in counts, initialize it to 1
    if (!counts[num]) {
      counts[num] = 1;
    } else {
      // If the number is already a property in counts, increment its count
      counts[num]++;
    }
  }

  // Convert counts object to array of [key, value] pairs
  var countsArray = Object.entries(counts);

  // Sort the array by counts in descending order
  countsArray.sort((a, b) => b[1] - a[1]);

  // Return the sorted array
  return countsArray;
}

// loop only once through the 100 games
// each game is assessed for if you won and for the hero the teammate played (and the hero you played?)
// maye we add a youWon: true/false property for each game
// if true, increment a winCount variable and then push the game to the array for the hero in question, and increment a win counter in that object/array too?