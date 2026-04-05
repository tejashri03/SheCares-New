import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Heart,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users
} from "lucide-react";
import axios from "axios";
import { addDays, differenceInDays, format, parseISO } from "date-fns";
import { useAuth } from "../components/AuthContext";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const Dashboard = () => {
  const { user, addActivity } = useAuth();
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(true);
  const [periodData, setPeriodData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [cycleLength, setCycleLength] = useState(28);

  useEffect(() => {
    addActivity({
      type: "dashboard_visit",
      description: "Viewed health dashboard",
      timestamp: new Date().toISOString(),
      metadata: { timeRange }
    });
  }, [timeRange]);

  useEffect(() => {
    const localPeriods = JSON.parse(localStorage.getItem("periodData") || "[]");
    const latestStoredPrediction = JSON.parse(localStorage.getItem("shecares_latest_prediction") || "null");
    const localWater = Number(localStorage.getItem("shecares_water_glasses") || 0);
    const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");

    setPeriodData(localPeriods);
    setLatestPrediction(latestStoredPrediction);
    setWaterGlasses(localWater);
    setCycleLength(Number(profile.cycleLength) || 28);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [usersResponse, predictionsResponse] = await Promise.all([
          axios.get("http://127.0.0.1:5000/users"),
          axios.get("http://127.0.0.1:5000/predictions")
        ]);

        if (usersResponse.data?.success) {
          setTotalUsers(usersResponse.data.total || 0);
        }

        if (predictionsResponse.data?.success && Array.isArray(predictionsResponse.data.predictions)) {
          const userPredictions = predictionsResponse.data.predictions.filter((pred) => pred[1] === user?.id);
          setPredictionData(userPredictions);

          if (!latestPrediction && userPredictions.length > 0) {
            const mostRecent = userPredictions[0];
            const hydratedPrediction = {
              prediction_id: mostRecent[0],
              user_id: mostRecent[1],
              age: mostRecent[2],
              bmi: mostRecent[3],
              prediction: mostRecent[4],
              probability: Number(mostRecent[5] || 0),
              risk_level: mostRecent[6],
              saved_at: mostRecent[7]
            };
            setLatestPrediction(hydratedPrediction);
            localStorage.setItem("shecares_latest_prediction", JSON.stringify(hydratedPrediction));
          }
        }
      } catch (error) {
        console.error("Dashboard data fetch failed", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const periodEntries = useMemo(
    () => periodData.filter((entry) => entry.type === "period"),
    [periodData]
  );

  const sortedPeriods = useMemo(
    () => [...periodEntries].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [periodEntries]
  );

  const lastPeriodDate = sortedPeriods.length > 0 ? new Date(sortedPeriods[sortedPeriods.length - 1].date) : null;
  const nextExpectedDate = lastPeriodDate ? addDays(lastPeriodDate, cycleLength) : null;
  const daysUntilNext = nextExpectedDate ? differenceInDays(nextExpectedDate, new Date()) : null;

  const cycleRegularity = useMemo(() => {
    if (sortedPeriods.length < 3) return 72;

    const intervals = [];
    for (let i = 1; i < sortedPeriods.length; i += 1) {
      const prev = new Date(sortedPeriods[i - 1].date);
      const next = new Date(sortedPeriods[i].date);
      const diffDays = Math.round((next - prev) / (1000 * 60 * 60 * 24));
      if (!Number.isNaN(diffDays) && diffDays > 0) intervals.push(diffDays);
    }

    if (intervals.length === 0) return 72;

    const avg = intervals.reduce((sum, x) => sum + x, 0) / intervals.length;
    const deviation = intervals.reduce((sum, x) => sum + Math.abs(x - avg), 0) / intervals.length;
    return Math.round(clamp(100 - deviation * 5, 45, 99));
  }, [sortedPeriods]);

  const symptomTracking = useMemo(() => {
    if (periodEntries.length === 0) return 0;
    const tracked = periodEntries.filter(
      (entry) => entry.notes?.trim() || (entry.symptoms && Object.keys(entry.symptoms).length > 0)
    ).length;
    return Math.round((tracked / periodEntries.length) * 100);
  }, [periodEntries]);

  const riskScore = useMemo(() => {
    const level = latestPrediction?.risk_level;
    if (level === "Low Risk") return 88;
    if (level === "Moderate Risk") return 64;
    if (level === "High Risk") return 42;
    return 60;
  }, [latestPrediction]);

  const healthScore = useMemo(() => {
    const hydrationScore = clamp((waterGlasses / 8) * 100, 0, 100);
    const raw = cycleRegularity * 0.35 + symptomTracking * 0.2 + riskScore * 0.35 + hydrationScore * 0.1;
    return Math.round(clamp(raw, 0, 100));
  }, [cycleRegularity, symptomTracking, riskScore, waterGlasses]);

  const activityFeed = user?.profile?.activities?.slice(0, 8) || [];

  const activityByDay = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = new Map(days.map((d) => [d, 0]));

    activityFeed.forEach((item) => {
      const date = new Date(item.timestamp || Date.now());
      const day = format(date, "EEE");
      if (counts.has(day)) counts.set(day, counts.get(day) + 1);
    });

    return days.map((day) => ({ day, count: counts.get(day) }));
  }, [activityFeed]);

  const riskTrend = useMemo(() => {
    const selected = predictionData.slice(0, 6).reverse();
    return selected.map((pred) => ({
      id: pred[0],
      label: format(new Date(pred[7]), "dd MMM"),
      probability: Math.round(Number(pred[5] || 0) * 100)
    }));
  }, [predictionData]);

  const predictionExplanation = useMemo(() => {
    if (!latestPrediction) return [];

    const reasons = [];
    const bmi = Number(latestPrediction.bmi || 0);

    if (bmi <= 24.9) {
      reasons.push("BMI is in a lower-risk range");
    } else if (bmi <= 29.9) {
      reasons.push("BMI indicates moderate metabolic risk");
    } else {
      reasons.push("Higher BMI contributes strongly to risk scoring");
    }

    if (cycleRegularity >= 80) {
      reasons.push("Cycle consistency supports lower risk");
    } else {
      reasons.push("Irregular cycle pattern increases prediction risk");
    }

    if (symptomTracking >= 70) {
      reasons.push("Consistent symptom tracking improves confidence");
    }

    return reasons;
  }, [latestPrediction, cycleRegularity, symptomTracking]);

  const insights = useMemo(() => {
    const output = [];

    if (latestPrediction?.risk_level === "Low Risk") {
      output.push("Your latest symptoms indicate a lower immediate PCOS risk profile.");
    } else if (latestPrediction?.risk_level === "Moderate Risk") {
      output.push("A moderate risk pattern is detected. Keep tracking for early intervention.");
    } else if (latestPrediction?.risk_level === "High Risk") {
      output.push("Risk is high in recent assessment. Medical consultation is recommended.");
    }

    if (daysUntilNext !== null && daysUntilNext <= 3 && daysUntilNext >= -2) {
      output.push("Your next expected cycle is close. This is a good time to log symptoms.");
    }

    if (waterGlasses < 6) {
      output.push("Hydration is below your target. Increase water intake to support hormonal balance.");
    }

    if (output.length === 0) {
      output.push("Keep logging cycle and symptom data to unlock deeper pattern insights.");
    }

    return output;
  }, [latestPrediction, daysUntilNext, waterGlasses]);

  const notifications = useMemo(() => {
    const items = [];

    if (lastPeriodDate) {
      const daysSince = differenceInDays(new Date(), lastPeriodDate);
      if (daysSince > 20) {
        items.push(`It has been ${daysSince} days since your last period log.`);
      }
    } else {
      items.push("Log your first period entry to start personalized predictions.");
    }

    if (daysUntilNext !== null) {
      if (daysUntilNext > 0) {
        items.push(`Next expected cycle in ${daysUntilNext} day(s).`);
      } else {
        items.push("Cycle window is due. Please update your period tracker.");
      }
    }

    if (!latestPrediction) {
      items.push("Run a PCOS check to generate your personalized risk explanation.");
    }

    return items;
  }, [lastPeriodDate, daysUntilNext, latestPrediction]);

  const quickActions = [
    {
      id: "period",
      title: "Log Period",
      description: "Track menstrual cycle history",
      context: lastPeriodDate
        ? `Last logged: ${format(lastPeriodDate, "dd MMM")}`
        : "No period logs yet",
      link: "/period-tracker",
      color: "from-pink-500 to-rose-500"
    },
    {
      id: "pcos",
      title: "Run PCOS Check",
      description: "Generate risk + recommendations",
      context: latestPrediction
        ? `Last result: ${latestPrediction.risk_level}`
        : "No assessment run yet",
      link: "/pcos",
      color: "from-indigo-500 to-blue-500"
    },
    {
      id: "nutrition",
      title: "Open Nutrition",
      description: "Dynamic meal and hydration plan",
      context: `Water today: ${waterGlasses} glass(es)`,
      link: "/nutrition",
      color: "from-emerald-500 to-teal-500"
    },
    {
      id: "awareness",
      title: "Health Learning",
      description: "Evidence-based tips and reading",
      context: `${notifications.length} active reminder(s)`,
      link: "/awareness",
      color: "from-amber-500 to-orange-500"
    }
  ];

  const healthMetrics = [
    {
      id: "cycle",
      title: "Cycle Regularity",
      value: `${cycleRegularity}%`,
      sub: cycleRegularity >= 80
        ? "Improved due to consistent cycle logging"
        : "Needs more consistent cycle tracking",
      icon: Calendar
    },
    {
      id: "tracking",
      title: "Symptom Tracking",
      value: `${symptomTracking}%`,
      sub: `${periodEntries.length} logs used for this score`,
      icon: Activity
    },
    {
      id: "risk",
      title: "PCOS Risk",
      value: latestPrediction?.risk_level || "Pending",
      sub: latestPrediction
        ? `Confidence ${(Number(latestPrediction.probability || 0) * 100).toFixed(1)}% probability`
        : "Run assessment for personalized prediction",
      icon: Shield
    },
    {
      id: "score",
      title: "SheCares Health Score",
      value: `${healthScore}/100`,
      sub: "Cycle + symptoms + hydration + risk model",
      icon: Heart
    }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_8%_10%,#ffe6f4_0%,#fff5dc_40%,#e8f6ff_80%)] p-4">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-3xl bg-white/85 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">Welcome back, {user?.name || "User"}</h1>
              <p className="mt-2 text-slate-600">Personalized insights generated from your real tracking and prediction history.</p>
            </div>
            <div className="relative flex items-center gap-3">
              <div className="rounded-xl bg-white p-1 shadow-md">
                {["week", "month"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      timeRange === range
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative rounded-xl bg-white p-2 shadow-md"
              >
                <Bell className="text-slate-600" size={20} />
                <span className="absolute right-1 top-1 min-w-4 rounded-full bg-pink-500 px-1 text-center text-[10px] font-bold text-white">
                  {notifications.length}
                </span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-14 z-20 w-80 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl">
                  <h3 className="mb-3 text-sm font-bold text-slate-800">Smart Reminders</h3>
                  <ul className="space-y-2">
                    {notifications.map((note) => (
                      <li key={note} className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {healthMetrics.map((metric, idx) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="rounded-2xl bg-white p-4 shadow-lg"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-xl bg-slate-50 p-2">
                  <metric.icon className="text-slate-700" size={20} />
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">Live</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{metric.value}</p>
              <p className="text-sm font-medium text-slate-700">{metric.title}</p>
              <p className="mt-1 text-xs text-slate-500">{metric.sub}</p>
            </motion.div>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <section className="rounded-3xl bg-white p-6 shadow-xl">
              <h2 className="mb-5 flex items-center text-2xl font-bold text-slate-800">
                <Target className="mr-2 text-pink-500" />
                Quick Actions
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {quickActions.map((action) => (
                  <Link key={action.id} to={action.link}>
                    <div className="group rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-lg">
                      <div className={`mb-4 h-12 w-12 rounded-xl bg-gradient-to-r ${action.color}`} />
                      <h3 className="text-lg font-semibold text-slate-800">{action.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{action.description}</p>
                      <p className="mt-2 text-xs font-medium text-slate-500">{action.context}</p>
                      <div className="mt-4 flex items-center text-sm font-semibold text-pink-600">
                        Open
                        <ChevronRight className="ml-1" size={16} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-xl">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-800">
                  <BarChart3 className="mr-2 text-sky-500" size={20} />
                  Activity Trend ({timeRange})
                </h3>
                <div className="space-y-3">
                  {activityByDay.map((entry) => (
                    <div key={entry.day} className="flex items-center gap-3">
                      <span className="w-8 text-xs text-slate-500">{entry.day}</span>
                      <div className="h-2 flex-1 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                          style={{ width: `${clamp(entry.count * 25, 4, 100)}%` }}
                        />
                      </div>
                      <span className="w-5 text-right text-xs font-semibold text-slate-600">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-xl">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-800">
                  <TrendingUp className="mr-2 text-violet-500" size={20} />
                  PCOS Risk Trend
                </h3>
                {riskTrend.length > 0 ? (
                  <div className="space-y-3">
                    {riskTrend.map((point) => (
                      <div key={point.id} className="flex items-center gap-3">
                        <span className="w-14 text-xs text-slate-500">{point.label}</span>
                        <div className="h-2 flex-1 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                            style={{ width: `${clamp(point.probability, 5, 100)}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-xs font-semibold text-slate-600">{point.probability}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">No trend data yet. Complete multiple assessments.</p>
                )}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-xl">
              <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-800">
                <Sparkles className="mr-2 text-indigo-500" size={20} />
                Health Insights
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {insights.map((insight) => (
                  <div key={insight} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                    {insight}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <section className="rounded-3xl bg-white p-6 shadow-xl">
              <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-800">
                <Shield className="mr-2 text-blue-500" size={20} />
                Prediction Explanation
              </h3>
              {latestPrediction ? (
                <>
                  <div className="mb-3 rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800">
                    {latestPrediction.risk_level} based on current symptom and cycle profile
                  </div>
                  <ul className="space-y-2">
                    {predictionExplanation.map((line) => (
                      <li key={line} className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">Run a PCOS check to see factor-level explanation.</p>
              )}
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-xl">
              <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-800">
                <Clock className="mr-2 text-pink-500" size={20} />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {activityFeed.length > 0 ? (
                  activityFeed.map((activity) => (
                    <div key={activity.id} className="rounded-xl bg-slate-50 p-3">
                      <p className="text-sm text-slate-800">{activity.description}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {activity.timestamp ? format(parseISO(activity.timestamp), "MMM dd, hh:mm a") : "Recent"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No recent activities yet.</p>
                )}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-xl">
              <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-800">
                <Users className="mr-2 text-indigo-500" size={20} />
                Platform Snapshot
              </h3>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span>Total Registered Users</span>
                  <span className="font-semibold">{totalUsers}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span>Last Period Log</span>
                  <span className="font-semibold">{lastPeriodDate ? format(lastPeriodDate, "dd MMM") : "None"}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span>Next Expected Cycle</span>
                  <span className="font-semibold">
                    {nextExpectedDate ? format(nextExpectedDate, "dd MMM") : "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span>Dashboard Status</span>
                  <span className={`font-semibold ${loading ? "text-amber-600" : "text-emerald-600"}`}>
                    {loading ? "Syncing" : "Live"}
                  </span>
                </div>
              </div>
            </section>

            <Link
              to="/nutrition"
              className="block rounded-3xl border border-slate-800 bg-slate-900 p-5 text-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              <p className="text-xs uppercase tracking-wide text-cyan-300">Next Best Action</p>
              <h4 className="mt-2 text-xl font-bold text-white">Open Nutrition Dashboard</h4>
              <p className="mt-1 text-sm text-slate-200">Review your latest meal plan and hydration goals.</p>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
