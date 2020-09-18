let points = {
  battingPoints: {
    runs: 1,
    four: 1,
    six: 2,
    30: 5,
    50: 10,
    75: 15,
    100: 25,
    130: 30,
    150: 35,
    175: 40,
    200: 50,
  },
  bowlingPoints: {
    dotball: 1,
    wicket: 20,
    maiden: 15,
    2: 10,
    3: 15,
    4: 20,
    5: 25,
    6: 30,
  },
};
let battingData = [];
let bowlingData = [];
let feldingData = [];
let csvBatting =
  "Name,Runs,Balls,Fours,Sixers,StrikeRate,Team,runspoint,fourpoints,sixpoints,milestonePoints,strikeratePoints,TotalPoints\n";
let csvBowling =
  "Name,Overs,Maidens,Runs,Wickets,Economy,Dotballs,Fours,Sixers,Wides,NoBalls,Team,dotballPoints,wicketsPoint,maidenPoints,milestonePoints,EconomyPoints,TotalPoints\n";
let csvFelding = "Name,catchPoints,StumpingPoints,RunoutPoints,TotalPoints\n";
const fetchData = (team1, team2) => {
  $(".batsman").each(function (index) {
    $(this)
      .find("tbody tr")
      .each(function () {
        if ($(this).find("td.batsman-cell a").length) {
          battingData.push([
            $(this).find("td.batsman-cell a").text(),
            $(this).find("td:nth-child(3)").text(),
            $(this).find("td:nth-child(4)").text(),
            $(this).find("td:nth-child(6)").text(),
            $(this).find("td:nth-child(7)").text(),
            $(this).find("td:nth-child(8)").text(),
            index ? team2 : team1,
          ]);
        }
      });
  });

  const checkKepper = (data) => {
    if (data.includes("†")) {
      return data.split("†")[1];
    } else {
      return data;
    }
  };

  $(".bowler").each(function (index) {
    $(this)
      .find("tbody tr")
      .each(function () {
        bowlingData.push([
          $(this).find("td:nth-child(1)").text(),
          $(this).find("td:nth-child(2)").text(),
          $(this).find("td:nth-child(3)").text(),
          $(this).find("td:nth-child(4)").text(),
          $(this).find("td:nth-child(5)").text(),
          $(this).find("td:nth-child(6)").text(),
          $(this).find("td:nth-child(7)").text(),
          $(this).find("td:nth-child(8)").text(),
          $(this).find("td:nth-child(9)").text(),
          $(this).find("td:nth-child(10)").text(),
          $(this).find("td:nth-child(11)").text(),
          index ? team1 : team2,
        ]);
      });
  });

  let feildingText = [];
  let feildingObject = {};
  $(".batsman").each(function () {
    $(this)
      .find("tbody tr")
      .each(function () {
        $(this).find(".wicket-details span span").text()
          ? feildingText.push($(this).find(".wicket-details span span").text())
          : null;
      });
  });

  feildingText.map((item) => {
    if (item.includes("st")) {
      let sname = item.split("†")[1].split(" b")[0];
      if (feildingObject[sname] && feildingObject[sname]["stumping"]) {
        feildingObject[sname]["stumping"] =
          feildingObject[sname]["stumping"] + 15;
      } else {
        feildingObject[sname] = Object.assign(
          feildingObject[sname] ? feildingObject[sname] : {},
          {
            stumping: 15,
          }
        );
      }
    } else if (item.includes("run out")) {
      if (item.includes("/")) {
        let rname = checkKepper(item.split("(")[1].split("/")[0]);
        let r2name = checkKepper(
          item.split("(")[1].split("/")[1].split(")")[0]
        );
        if (feildingObject[rname] && feildingObject[rname]["run"]) {
          feildingObject[rname]["run"] = feildingObject[rname]["run"] + 10;
        } else {
          feildingObject[rname] = Object.assign(
            feildingObject[rname] ? feildingObject[rname] : {},
            {
              run: 10,
            }
          );
        }
        if (feildingObject[r2name] && feildingObject[r2name]["run"]) {
          feildingObject[r2name]["run"] = feildingObject[r2name]["run"] + 10;
        } else {
          feildingObject[r2name] = Object.assign(
            feildingObject[r2name] ? feildingObject[r2name] : {},
            {
              run: 10,
            }
          );
        }
      } else {
        let rname = checkKepper(item.split("(")[1].split(")")[0]);
        if (feildingObject[rname] && feildingObject[rname]["run"]) {
          feildingObject[rname]["run"] = feildingObject[rname]["run"] + 15;
        } else {
          feildingObject[rname] = Object.assign(
            feildingObject[rname] ? feildingObject[rname] : {},
            {
              run: 15,
            }
          );
        }
      }
    } else if (item.includes("c")) {
      if (item.includes("c & b")) {
        let cname = item.split("c & b ")[1];
        if (feildingObject[cname] && feildingObject[cname]["catch"]) {
          feildingObject[cname]["catch"] = feildingObject[cname]["catch"] + 10;
        } else {
          feildingObject[cname] = Object.assign(
            feildingObject[cname] ? feildingObject[cname] : {},
            {
              catch: 10,
            }
          );
        }
      } else if (item.includes("c ")) {
        let cname = checkKepper(item.split("c ")[1].split(" b")[0]);
        if (feildingObject[cname] && feildingObject[cname]["catch"]) {
          feildingObject[cname]["catch"] = feildingObject[cname]["catch"] + 10;
        } else {
          feildingObject[cname] = Object.assign(
            feildingObject[cname] ? feildingObject[cname] : {},
            {
              catch: 10,
            }
          );
        }
      }
    }
  });
  pointCal(battingData, "Batting", team1, team2);
  pointCal(bowlingData, "Bowling", team1, team2);
  pointCal(feildingObject, "Felding", team1, team2);
};
const pointCal = async (data, type, team1, team2) => {
  if (type == "Batting") {
    data.map((item) => {
      let Totalpoints = 0;
      let runs = JSON.parse(item[1]);
      let runspoint = runs * points.battingPoints.runs;
      let fourpoints = JSON.parse(item[3]) * points.battingPoints.four;
      let sixpoints = JSON.parse(item[4]) * points.battingPoints.six;
      let milestonePoints = 0;
      let strikeratePoints = 0;
      if (runs >= 30 && runs < 50) {
        milestonePoints = points.battingPoints[30];
      } else if (runs >= 50 && runs < 75) {
        milestonePoints = points.battingPoints[50];
      } else if (runs >= 75 && runs < 100) {
        milestonePoints = points.battingPoints[75];
      } else if (runs >= 100 && runs < 130) {
        milestonePoints = points.battingPoints[100];
      } else if (runs >= 130 && runs < 150) {
        milestonePoints = points.battingPoints[130];
      } else if (runs >= 150 && runs < 175) {
        milestonePoints = points.battingPoints[150];
      } else if (runs >= 175 && runs < 200) {
        milestonePoints = points.battingPoints[175];
      } else if (runs >= 200) {
        milestonePoints = points.battingPoints[200];
      }
      let stvalue = runs - JSON.parse(item[2]);
      if (stvalue > 0) {
        strikeratePoints = stvalue;
      } else if (stvalue < 0) {
        strikeratePoints = stvalue * 2;
      }
      Totalpoints += runspoint;
      Totalpoints += fourpoints;
      Totalpoints += sixpoints;
      Totalpoints += milestonePoints;
      Totalpoints += strikeratePoints;

      item.push(runspoint);
      item.push(fourpoints);
      item.push(sixpoints);
      item.push(milestonePoints);
      item.push(strikeratePoints);
      item.push(Totalpoints);
    });
    csvGenerator(battingData, csvBatting, team1 + "vs" + team2 + "Batting");
  } else if (type == "Bowling") {
    data.map((item) => {
      let Totalpoints = 0;
      let wickets = JSON.parse(item[4]);
      let runs = JSON.parse(item[3]);
      let overs = item[1];
      let oversSplit = overs.split(".");
      let balls =
        oversSplit.length > 1
          ? JSON.parse(oversSplit[0]) * 6 + JSON.parse(oversSplit[1])
          : JSON.parse(overs) * 6;
      let dotballPoints = JSON.parse(item[6]) * points.bowlingPoints.dotball;
      let wicketsPoint = wickets * points.bowlingPoints.wicket;
      let maidenPoints = JSON.parse(item[2]) * points.bowlingPoints.maiden;
      let milestonePoints = 0;
      let EconomyPoints = 0;
      if (wickets >= 2) {
        milestonePoints += wickets * 5;
      }
      let difball = 1.5 * balls - runs;
      if (difball > 0) {
        EconomyPoints = difball;
      } else if (difball < 0) {
        EconomyPoints = difball * 2;
      }
      Totalpoints += dotballPoints;
      Totalpoints += wicketsPoint;
      Totalpoints += maidenPoints;
      Totalpoints += milestonePoints;
      Totalpoints += EconomyPoints;

      item.push(dotballPoints);
      item.push(wicketsPoint);
      item.push(maidenPoints);
      item.push(milestonePoints);
      item.push(EconomyPoints);
      item.push(Totalpoints);
    });
    csvGenerator(bowlingData, csvBowling, team1 + "vs" + team2 + "Bowling");
  } else {
    Object.keys(data).map((item) => {
      let TotalPoints = 0;
      let catchPoints = 0;
      let stumpingPoints = 0;
      let runPoints = 0;
      if (data[item].catch) {
        TotalPoints += data[item].catch;
        catchPoints += data[item].catch;
      }
      if (data[item].stumping) {
        TotalPoints += data[item].stumping;
        stumpingPoints += data[item].stumping;
      }
      if (data[item].run) {
        TotalPoints += data[item].run;
        runPoints += data[item].run;
      }
      feldingData.push([
        item,
        catchPoints,
        stumpingPoints,
        runPoints,
        TotalPoints,
      ]);
    });
    csvGenerator(feldingData, csvFelding, team1 + "vs" + team2 + "Felding");
  }
};
const csvGenerator = (data, csvhead, name) => {
  data.forEach(function (row) {
    csvhead += row.join(",");
    csvhead += "\n";
  });
  var hiddenElement = document.createElement("a");
  hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csvhead);
  hiddenElement.target = "_blank";
  hiddenElement.download = name + ".csv";
  hiddenElement.click();
};
