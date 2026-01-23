exports.getAthleteProgress = (req, res) => {
  const { athleteId } = req.params;

  if (!fs.existsSync(logsPath)) {
    return res.json({ e1rm: {}, fatigue: [] });
  }

  const logs = JSON.parse(fs.readFileSync(logsPath, "utf-8"))
    .filter(l => l.athlete_id === athleteId);

  const e1rm = {
    squat: [],
    bench: [],
    deadlift: []
  };

  const fatigue = [];

  logs.forEach(log => {
    let sessionRPE = 0;
    let hardSets = 0;

    const bestSet = {
      squat: 0,
      bench: 0,
      deadlift: 0
    };

    log.main_lifts.forEach(lift => {
      lift.performed.forEach(set => {
        const e = estimateE1RM(set.load, set.reps, set.rpe);

        if (e > bestSet[lift.lift.toLowerCase()]) {
          bestSet[lift.lift.toLowerCase()] = e;
        }

        if (set.rpe && set.rpe >= 7) {
          sessionRPE += Number(set.rpe);
          hardSets++;
        }
      });
    });

    Object.keys(bestSet).forEach(lift => {
      if (bestSet[lift] > 0) {
        e1rm[lift].push({
          date: log.date,
          value: bestSet[lift]
        });
      }
    });

    fatigue.push({
      date: log.date,
      value: hardSets
        ? +(sessionRPE / hardSets).toFixed(2)
        : 0
    });
  });

  res.json({ e1rm, fatigue });
};
