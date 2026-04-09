import { useEffect, useMemo, useState } from "react";
import { Activity, Dumbbell, Flame, Target, Sparkles, TimerReset, HeartPulse, Repeat } from "lucide-react";
import { useAuth } from "../components/AuthContext";

const predictionStorageKey = (userId) => `shecares_latest_prediction_${userId}`;
const fitnessLogKey = (userId) => `shecares_fitness_log_${userId}`;
const fitnessDayGoalsKey = (userId) => `shecares_fitness_day_goals_${userId}`;

const genericPlans = {
  "High Risk": {
    goal: "Improve insulin sensitivity and support hormone balance",
    intensity: "Low to moderate",
    weekly_schedule: {
      Monday: "30 min brisk walk + 10 min breathing",
      Tuesday: "40 min yoga (mobility + core)",
      Wednesday: "30 min cycling or treadmill",
      Thursday: "20 min bodyweight strength",
      Friday: "40 min low-impact cardio",
      Saturday: "45 min outdoor walk",
      Sunday: "Recovery and stretching"
    }
  },
  "Moderate Risk": {
    goal: "Build consistency and manage stress",
    intensity: "Moderate",
    weekly_schedule: {
      Monday: "35 min jog/walk intervals",
      Tuesday: "30 min strength training",
      Wednesday: "40 min yoga or pilates",
      Thursday: "30 min cycling",
      Friday: "35 min cardio + core",
      Saturday: "45 min dance/aerobics",
      Sunday: "Active recovery"
    }
  },
  "Low Risk": {
    goal: "Maintain fitness and overall wellness",
    intensity: "Moderate to high",
    weekly_schedule: {
      Monday: "40 min cardio",
      Tuesday: "30 min strength session",
      Wednesday: "30 min mobility and stretching",
      Thursday: "40 min cardio intervals",
      Friday: "35 min strength + core",
      Saturday: "Sports/outdoor activity",
      Sunday: "Light recovery walk"
    }
  }
};

function FitnessPage() {
  const { user } = useAuth();
  const [prediction, setPrediction] = useState(null);
  const [log, setLog] = useState({});
  const [dayGoals, setDayGoals] = useState({});

  useEffect(() => {
    if (!user?.id) {
      setPrediction(null);
      setLog({});
      setDayGoals({});
      return;
    }

    const storedPrediction = localStorage.getItem(predictionStorageKey(user.id));
    if (storedPrediction) {
      try {
        setPrediction(JSON.parse(storedPrediction));
      } catch {
        setPrediction(null);
      }
    } else {
      setPrediction(null);
    }

    const storedLog = localStorage.getItem(fitnessLogKey(user.id));
    if (storedLog) {
      try {
        setLog(JSON.parse(storedLog));
      } catch {
        setLog({});
      }
    } else {
      setLog({});
    }

    const storedDayGoals = localStorage.getItem(fitnessDayGoalsKey(user.id));
    if (storedDayGoals) {
      try {
        setDayGoals(JSON.parse(storedDayGoals));
      } catch {
        setDayGoals({});
      }
    } else {
      setDayGoals({});
    }
  }, [user?.id]);

  const plan = useMemo(() => {
    if (prediction?.exercise_plan?.weekly_schedule) {
      return prediction.exercise_plan;
    }
    const level = prediction?.risk_level || "Moderate Risk";
    return genericPlans[level] || genericPlans["Moderate Risk"];
  }, [prediction]);

  const scheduleEntries = Object.entries(plan.weekly_schedule || {});

  const completedCount = useMemo(
    () => scheduleEntries.filter(([day]) => Boolean(log[day])).length,
    [scheduleEntries, log]
  );

  const toggleDayDone = (day) => {
    const updated = { ...log, [day]: !log[day] };
    setLog(updated);
    if (user?.id) {
      localStorage.setItem(fitnessLogKey(user.id), JSON.stringify(updated));
    }
  };

  const progress = scheduleEntries.length > 0
    ? Math.round((completedCount / scheduleEntries.length) * 100)
    : 0;

  const updateDayGoal = (day, value) => {
    const updated = { ...dayGoals, [day]: value };
    setDayGoals(updated);
    if (user?.id) {
      localStorage.setItem(fitnessDayGoalsKey(user.id), JSON.stringify(updated));
    }
  };

  const exerciseTips = [
    "Start with a 5-10 minute warm-up and end with a cool-down stretch.",
    "Choose low-impact cardio like walking or cycling on low-energy days.",
    "Strength sessions support insulin sensitivity and body composition.",
    "Recovery, sleep, and hydration are part of training, not extras.",
    "Consistency beats intensity when you're building a routine."
  ];

  const fitnessIdeas = [
    { title: "Walking", detail: "Brisk walking 20-40 minutes for easy daily movement and recovery." },
    { title: "Yoga", detail: "Gentle yoga for mobility, stress reduction, and cycle comfort." },
    { title: "Strength Training", detail: "Bodyweight or light weights to build strength safely." },
    { title: "Cycling", detail: "Low-impact cardio that supports endurance without joint stress." },
    { title: "Dance", detail: "Fun cardio to improve motivation and keep movement enjoyable." },
    { title: "Pilates", detail: "Core control and posture work for balanced fitness." }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_10%,#fff0f5_0%,#f8fbff_45%,#eefbf7_100%)] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-[1440px] space-y-8">
        <section className="rounded-3xl bg-white p-7 shadow-xl lg:p-8">
          <h1 className="flex items-center gap-2 text-3xl font-extrabold text-slate-800">
            <Dumbbell className="text-orange-500" />
            Fitness and Exercise
          </h1>
          <p className="mt-2 text-slate-600">
            Personalized movement plan with progress tracking. Mark each day after completion.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <MetricCard title="Risk Level" value={prediction?.risk_level || "Not Assessed"} icon={Target} />
          <MetricCard title="Plan Intensity" value={plan.intensity || "Moderate"} icon={Activity} />
          <MetricCard title="Weekly Progress" value={`${progress}%`} icon={Flame} />
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-7 shadow-xl lg:col-span-2 lg:p-8">
            <div className="mb-4 flex items-center gap-2 text-slate-800">
              <Sparkles className="text-pink-500" />
              <h2 className="text-xl font-bold">Day-wise Goal Planner</h2>
            </div>
            <p className="text-sm text-slate-600">
              Set and edit your goal for each day based on your schedule and convenience.
            </p>
            <div className="mt-5 rounded-2xl border border-dashed border-pink-200 bg-pink-50/70 p-5 text-sm text-slate-700">
              Your goals are saved automatically per day. Edit any day below in the weekly planner.
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-rose-600 p-7 text-white shadow-xl lg:p-8">
            <div className="flex items-center gap-2">
              <TimerReset />
              <h3 className="text-xl font-bold">Workout Focus</h3>
            </div>
            <p className="mt-3 text-sm text-white/90">
              Follow the weekly schedule and use the guidance below to choose the right intensity.
            </p>
            <div className="mt-4 space-y-3 text-sm text-white/95">
              <div className="rounded-2xl bg-white/15 p-3">Warm-up: 5-10 min</div>
              <div className="rounded-2xl bg-white/15 p-3">Main workout: 20-40 min</div>
              <div className="rounded-2xl bg-white/15 p-3">Cool-down: 5 min stretch</div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-7 shadow-xl lg:p-8">
          <h2 className="text-xl font-bold text-slate-800">Current Weekly Goals</h2>
          <p className="mt-2 text-slate-600">
            Base focus: {plan.goal || "Build a consistent weekly routine."}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {scheduleEntries.map(([day, workout]) => {
              const done = Boolean(log[day]);
              const currentDayGoal = dayGoals[day] || workout;
              return (
                <div key={day} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800">{day}</p>
                    <button
                      type="button"
                      onClick={() => toggleDayDone(day)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        done
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      {done ? "Completed" : "Mark Done"}
                    </button>
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Your Day Goal</p>
                  <textarea
                    rows={2}
                    value={currentDayGoal}
                    onChange={(e) => updateDayGoal(day, e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                    placeholder={`Set ${day} goal`}
                  />
                  <p className="mt-3 text-xs text-slate-500">
                    Suggested plan: {workout}
                  </p>
                </div>
              );
            })}
          </div>

          {scheduleEntries.length === 0 && (
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
              No exercise plan found yet. Complete a PCOS assessment to generate a personalized plan.
            </p>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-7 shadow-xl lg:p-8">
            <div className="mb-4 flex items-center gap-2 text-slate-800">
              <HeartPulse className="text-rose-500" />
              <h2 className="text-xl font-bold">Exercises You Can Do</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {fitnessIdeas.map((item) => (
                <div key={item.title} className="rounded-2xl bg-slate-50 p-5">
                  <h3 className="font-semibold text-slate-800">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-7 shadow-xl lg:p-8">
            <div className="mb-4 flex items-center gap-2 text-slate-800">
              <Repeat className="text-teal-500" />
              <h2 className="text-xl font-bold">Exercise Information</h2>
            </div>
            <ul className="space-y-4 text-sm text-slate-600">
              {exerciseTips.map((tip) => (
                <li key={tip} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 leading-6">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        <Icon className="h-5 w-5 text-slate-500" />
      </div>
      <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

export default FitnessPage;