import { useState } from "react";

export default function CompetitionDayUI({ currentDay, athlete }) {
  const lifts = currentDay.main_lifts;

  const [weighIn, setWeighIn] = useState(false);
  const [bodyweight, setBodyweight] = useState("");
  const [attemptResults, setAttemptResults] = useState({});
  const [completed, setCompleted] = useState(false);

  const generateWarmups = (opener) => {
    if (!opener) return [];
    return [
      Math.round(opener * 0.4),
      Math.round(opener * 0.6),
      Math.round(opener * 0.75),
      Math.round(opener * 0.85),
      Math.round(opener * 0.9),
    ];
  };

  const handleResult = (liftName, attemptLabel, result) => {
    setAttemptResults((prev) => ({
      ...prev,
      [`${liftName}_${attemptLabel}`]: result,
    }));
  };

  const suggestAdjustment = (lift) => {
    const missSecond =
      attemptResults[`${lift.lift}_Second`] === "miss";
    const missOpener =
      attemptResults[`${lift.lift}_Opener`] === "miss";

    if (missOpener) {
      return `⚠ Reduce next attempt by 5%`;
    }

    if (missSecond) {
      return `⚠ Reduce third attempt by 2–3%`;
    }

    return `Proceed as planned`;
  };

  return (
    <div className="relative space-y-12 animate-in zoom-in-95 duration-700">

      {/* HEADER */}
      <div className="border-b-4 border-red-600 pb-6">
        <h2 className="text-7xl font-[1000] italic text-white uppercase tracking-tighter">
          COMPETITION<span className="text-red-600">_DAY</span>
        </h2>
        <p className="font-mono text-xs text-zinc-500 mt-2 uppercase tracking-widest">
          Phase: Competition Mode Activated
        </p>
      </div>

      {/* WEIGH-IN PANEL */}
      <div className="bg-black/60 border border-white/10 p-6 space-y-4">
        <h3 className="text-xl font-black text-orange-500 uppercase">
          Weigh-In Control
        </h3>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setWeighIn(!weighIn)}
            className={`px-6 py-2 font-black uppercase ${
              weighIn ? "bg-green-600 text-black" : "bg-red-600 text-black"
            }`}
          >
            {weighIn ? "WEIGH-IN COMPLETE" : "MARK WEIGH-IN"}
          </button>

          <input
            type="number"
            placeholder="Bodyweight (kg)"
            value={bodyweight}
            onChange={(e) => setBodyweight(e.target.value)}
            className="bg-black border border-white/10 p-3 font-mono text-white"
          />
        </div>
      </div>

      {/* ATTEMPT SECTION */}
      <div className="space-y-12">
        {lifts.map((lift, i) => {
          const opener = lift.attempt_plan?.opener;
          const warmups = generateWarmups(opener);

          return (
            <div key={i} className="bg-zinc-950 border border-white/10 p-8 space-y-6">

              <h3 className="text-3xl font-black text-red-600 uppercase italic">
                {lift.lift}
              </h3>

              {/* WARMUP */}
              <div>
                <p className="text-xs font-mono text-zinc-500 uppercase mb-2">
                  Warm-Up Sequence
                </p>
                <div className="flex flex-wrap gap-3">
                  {warmups.map((w, idx) => (
                    <div key={idx} className="bg-white/5 px-4 py-2 text-white font-black">
                      {w} KG
                    </div>
                  ))}
                </div>
              </div>

              {/* ATTEMPTS */}
              <div className="grid grid-cols-3 gap-6">
                {["Opener", "Second", "Third"].map((label, idx) => {
                  const val = lift.attempt_plan?.[
                    label.toLowerCase()
                  ];

                  return (
                    <div key={idx} className="bg-white/[0.02] border border-white/10 p-6 space-y-3">
                      <p className="text-xs font-mono uppercase text-zinc-500">
                        {label}
                      </p>

                      <p className="text-4xl font-black text-white">
                        {val} KG
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResult(lift.lift, label, "good")}
                          className="flex-1 bg-green-600 text-black py-2 font-black"
                        >
                          GOOD
                        </button>
                        <button
                          onClick={() => handleResult(lift.lift, label, "miss")}
                          className="flex-1 bg-red-600 text-black py-2 font-black"
                        >
                          MISS
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SUGGESTION ENGINE */}
              <div className="border-t border-white/10 pt-4 text-orange-500 font-mono text-xs uppercase">
                Coach Suggestion: {suggestAdjustment(lift)}
              </div>
            </div>
          );
        })}
      </div>

      {/* EQUIPMENT CHECKLIST */}
      <div className="bg-red-600 p-6 text-black space-y-4">
        <h3 className="font-black uppercase text-xl">
          Equipment Checklist
        </h3>
        <div className="grid grid-cols-2 gap-4 font-mono text-sm uppercase">
          {[
            "Singlet",
            "Belt",
            "Wrist Wraps",
            "Knee Sleeves",
            "Deadlift Socks",
            "ID Card",
          ].map((item) => (
            <label key={item} className="flex items-center gap-2">
              <input type="checkbox" />
              {item}
            </label>
          ))}
        </div>
      </div>

      {/* NUTRITION REMINDER */}
      <div className="bg-black border border-white/10 p-6 space-y-3">
        <h3 className="text-yellow-400 font-black uppercase">
          Meet Day Fuel Strategy
        </h3>
        <ul className="text-zinc-400 font-mono text-sm space-y-1">
          <li>• High Carb Pre-Meet Meal</li>
          <li>• Electrolytes + Sodium</li>
          <li>• Intra-Lift Simple Sugars</li>
          <li>• Avoid Fatigue-Inducing Foods</li>
        </ul>
      </div>

      {/* FINAL BUTTON */}
      <div className="text-center">
        <button
          onClick={() => setCompleted(true)}
          className="px-16 py-6 bg-white text-black font-black uppercase italic text-2xl hover:bg-red-600"
        >
          LOCK COMPETITION DAY
        </button>
      </div>

      {completed && (
        <div className="text-center text-red-600 font-black text-4xl italic mt-6">
          Competition Logged.
        </div>
      )}
    </div>
  );
}
