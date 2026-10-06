import { Activity, BarChart3, Dumbbell, MessageCircle, Salad, Trophy } from "lucide-react";

export const TRACKS = {
  pl: {
    name: "Powerlifting",
    head: "Add kilos to your total.",
    sub: "e1RM-based programming, peaking blocks and meet attempts that adapt to every set you log.",
    lift: "Squat",
    target: "140 × 5 @ 7.5",
    w: 140,
    r: 5
  },
  bb: {
    name: "Bodybuilding",
    head: "Build the physique, muscle by muscle.",
    sub: "Weekly volume per muscle, mesocycles, progress photos and nutrition that adjusts to your trend.",
    lift: "Incline DB Press",
    target: "32 × 10 · 2 RIR",
    w: 32,
    r: 10
  },
};

export const STEPS = [
  ["Tell us about you", "Track, experience, equipment, injuries, goals."],
  ["Get your program", "Built for your schedule and recovery, with the reason behind every choice."],
  ["Log every set", "Two taps per set, works offline, rest timer and plate maths built in."],
  ["It adapts", "Next week changes from what you actually lifted. Your coach sees it too."]
];

export const FEATURES = [
  [Dumbbell, "Fast set logging", "Big steppers, RPE/RIR chips, 'as prescribed' in one tap."],
  [Activity, "Autoregulation", "Loads and volume adjust to your performance and readiness."],
  [BarChart3, "Progress that makes sense", "e1RM, volume, adherence and bodyweight trends with PR markers."],
  [Trophy, "Meet & contest tools", "Attempt planner, warm-up timing, prep phases."],
  [Salad, "Nutrition that fits you", "Targets from your trend; Indian food and budget aware."],
  [MessageCircle, "Real coach, optional", "Check-ins, video form review and program edits."]
];

export const FAQ = [
  ["Is it for beginners?", "Yes. Beginner programs are simple and conservative; advanced options unlock as you progress."],
  ["Do I need a full gym?", "No. Tell us your equipment and we build around it."],
  ["Is the AI safe?", "Every program passes fixed safety rules (load jumps, volume caps, pain handling) before you see it. It is training guidance, not medical advice."],
  ["Can I switch between tracks?", "Yes. Your history carries over; you get a fresh program for the new track."],
  ["Is my data private?", "Your data is yours. You choose what a coach can see, and you can export or delete it."],
  ["Can I cancel anytime?", "Yes."]
];

export const PLANS = [
  ["Free", "Core logging, a starter program, basic analytics.", false],
  ["Pro", "Full AI programming, autoregulation, advanced analytics.", true],
  ["Coaching", "A verified coach plus everything in Pro.", false]
];
