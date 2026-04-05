import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../components/AuthContext";

function NutritionPage() {
	const { user } = useAuth();
	const [latestPrediction, setLatestPrediction] = useState(null);
	const [serverPredictionCount, setServerPredictionCount] = useState(0);
	const [waterGlasses, setWaterGlasses] = useState(0);

	useEffect(() => {
		const storedPrediction = localStorage.getItem("shecares_latest_prediction");
		if (storedPrediction) {
			try {
				setLatestPrediction(JSON.parse(storedPrediction));
			} catch {
				localStorage.removeItem("shecares_latest_prediction");
			}
		}

		const storedWater = Number(localStorage.getItem("shecares_water_glasses") || 0);
		setWaterGlasses(storedWater);
	}, []);

	useEffect(() => {
		localStorage.setItem("shecares_water_glasses", String(waterGlasses));
	}, [waterGlasses]);

	useEffect(() => {
		if (!user) return;

		const fetchPredictionCount = async () => {
			try {
				const response = await axios.get("http://127.0.0.1:5000/predictions");
				if (response.data.success && Array.isArray(response.data.predictions)) {
					const count = response.data.predictions.filter((item) => item[1] === user.id).length;
					setServerPredictionCount(count);
				}
			} catch {
				setServerPredictionCount(0);
			}
		};

		fetchPredictionCount();
	}, [user]);

	const mealPlanEntries = useMemo(() => {
		if (!latestPrediction?.nutrition_plan?.meal_plan) return [];
		return Object.entries(latestPrediction.nutrition_plan.meal_plan);
	}, [latestPrediction]);

	const macros = latestPrediction?.nutrition_plan?.macros || {};
	const avoidFoods = latestPrediction?.nutrition_plan?.foods_to_avoid || [];
	const supplements = latestPrediction?.nutrition_plan?.supplements || [];
	const medicalRecommendations = latestPrediction?.medical_recommendations || [];
	const hasNutritionData = Boolean(latestPrediction?.nutrition_plan?.meal_plan);

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#ffe3ec_0%,#fff8e7_38%,#e7f8ff_78%)] px-4 py-8">
			<div className="mx-auto max-w-6xl space-y-6">
				<section className="rounded-3xl border border-orange-100 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div>
							<h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Dynamic Nutrition Dashboard</h1>
							<p className="mt-2 text-slate-600">
								Powered by your latest assessment response, without static diet cards.
							</p>
						</div>
						<div className="rounded-2xl bg-gradient-to-r from-orange-400 to-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-lg">
							Assessments on server: {serverPredictionCount}
						</div>
					</div>
				</section>

				{!latestPrediction && (
					<section className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center shadow-lg">
						<h2 className="text-2xl font-bold text-amber-900">No dynamic nutrition data yet</h2>
						<p className="mt-2 text-amber-800">
							Complete a PCOS assessment first. This page only renders nutrition data returned from your prediction API.
						</p>
						<Link
							to="/pcos"
							className="mt-5 inline-block rounded-full bg-amber-500 px-6 py-3 font-semibold text-white transition hover:bg-amber-600"
						>
							Run Assessment Now
						</Link>
					</section>
				)}

				{latestPrediction && !hasNutritionData && (
					<section className="rounded-3xl border border-sky-200 bg-sky-50 p-8 text-center shadow-lg">
						<h2 className="text-2xl font-bold text-sky-900">Prediction found, but nutrition plan is missing</h2>
						<p className="mt-2 text-sky-800">
							Run a new PCOS assessment to generate full nutrition recommendations and meal breakdown.
						</p>
						<Link
							to="/pcos"
							className="mt-5 inline-block rounded-full bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700"
						>
							Generate Fresh Nutrition Plan
						</Link>
					</section>
				)}

				{latestPrediction && hasNutritionData && (
					<>
						<section className="grid gap-4 md:grid-cols-4">
							<StatCard title="Risk Level" value={latestPrediction.risk_level || "Unknown"} tone="rose" />
							<StatCard
								title="Probability"
								value={`${((latestPrediction.probability || 0) * 100).toFixed(1)}%`}
								tone="sky"
							/>
							<StatCard
								title="Daily Calories"
								value={`${latestPrediction.nutrition_plan?.daily_calories || "-"} kcal`}
								tone="emerald"
							/>
							<StatCard
								title="Plan Goal"
								value={latestPrediction.nutrition_plan?.goal || "Not available"}
								tone="amber"
							/>
						</section>

						<section className="grid gap-6 lg:grid-cols-2">
							<div className="rounded-3xl bg-white p-6 shadow-xl">
								<h2 className="text-xl font-bold text-slate-800">Meal Plan</h2>
								<p className="mb-4 text-sm text-slate-600">Generated from your latest prediction response</p>
								<div className="space-y-4">
									{mealPlanEntries.map(([mealName, items]) => (
										<div key={mealName} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
											<h3 className="font-semibold capitalize text-slate-700">{mealName}</h3>
											<ul className="mt-2 list-disc pl-6 text-sm text-slate-600">
												{items.map((item) => (
													<li key={`${mealName}-${item}`}>{item}</li>
												))}
											</ul>
										</div>
									))}
								</div>
							</div>

							<div className="space-y-6">
								<div className="rounded-3xl bg-white p-6 shadow-xl">
									<h2 className="text-xl font-bold text-slate-800">Macro Distribution</h2>
									<div className="mt-4 grid grid-cols-3 gap-3">
										{Object.entries(macros).map(([macro, value]) => (
											<div key={macro} className="rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 p-3 text-center">
												<p className="text-xs font-semibold uppercase text-slate-500">{macro}</p>
												<p className="mt-1 text-lg font-bold text-slate-800">{value}</p>
											</div>
										))}
									</div>
								</div>

								<div className="rounded-3xl bg-white p-6 shadow-xl">
									<h2 className="text-xl font-bold text-slate-800">Foods To Avoid</h2>
									<div className="mt-4 flex flex-wrap gap-2">
										{avoidFoods.map((food) => (
											<span key={food} className="rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700">
												{food}
											</span>
										))}
									</div>
								</div>

								<div className="rounded-3xl bg-white p-6 shadow-xl">
									<h2 className="text-xl font-bold text-slate-800">Supplements</h2>
									<div className="mt-4 flex flex-wrap gap-2">
										{supplements.map((item) => (
											<span key={item} className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
												{item}
											</span>
										))}
									</div>
								</div>
							</div>
						</section>

						<section className="grid gap-6 lg:grid-cols-2">
							<div className="rounded-3xl bg-white p-6 shadow-xl">
								<h2 className="text-xl font-bold text-slate-800">Medical Recommendations</h2>
								<ul className="mt-4 space-y-2 text-sm text-slate-700">
									{medicalRecommendations.map((item) => (
										<li key={item} className="rounded-xl bg-slate-50 p-3">
											{item}
										</li>
									))}
								</ul>
							</div>

							<div className="rounded-3xl bg-white p-6 shadow-xl">
								<h2 className="text-xl font-bold text-slate-800">Hydration Tracker</h2>
								<p className="mt-2 text-sm text-slate-600">Track your water intake for today</p>
								<p className="mt-3 text-4xl font-extrabold text-cyan-600">{waterGlasses} glasses</p>
								<div className="mt-4 flex gap-3">
									<button
										type="button"
										onClick={() => setWaterGlasses((prev) => prev + 1)}
										className="rounded-full bg-cyan-500 px-4 py-2 font-semibold text-white transition hover:bg-cyan-600"
									>
										+ Add Glass
									</button>
									<button
										type="button"
										onClick={() => setWaterGlasses(0)}
										className="rounded-full bg-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-300"
									>
										Reset
									</button>
								</div>
							</div>
						</section>
					</>
				)}
			</div>
		</div>
	);
}

function StatCard({ title, value, tone }) {
	const toneMap = {
		rose: "from-rose-500 to-orange-500",
		sky: "from-sky-500 to-cyan-500",
		emerald: "from-emerald-500 to-teal-500",
		amber: "from-amber-500 to-orange-500"
	};

	return (
		<div className={`rounded-3xl bg-gradient-to-r ${toneMap[tone]} p-[1px] shadow-lg`}>
			<div className="rounded-3xl bg-white p-4">
				<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
				<p className="mt-2 text-lg font-bold text-slate-800">{value}</p>
			</div>
		</div>
	);
}

export default NutritionPage;