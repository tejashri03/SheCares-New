import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../components/AuthContext";

const predictionStorageKey = (userId) => `shecares_latest_prediction_${userId}`;
const waterStorageKey = (userId) => `shecares_water_glasses_${userId}`;
const hydrationStorageKey = (userId) => `shecares_hydration_daily_${userId}`;

const todayKey = () => new Date().toISOString().slice(0, 10);

const generatePersonalizedMealPlan = (riskLevel, calorieTarget, dietType) => {
	const plans = {
		vegetarian: {
			"High Risk": {
				breakfast: ["Greek yogurt with chia seeds and berries", "Whole grain toast with almond butter", "Green tea"],
				lunch: ["Quinoa Buddha bowl with chickpeas", "Roasted vegetables (broccoli, bell pepper, carrot)", "Tahini dressing"],
				dinner: ["Lentil curry with turmeric", "Brown rice (1/2 cup)", "Spinach salad with lemon vinaigrette"],
				snacks: ["Handful of almonds (1 oz)", "Apple with peanut butter", "Carrot sticks with hummus"]
			},
			"Moderate Risk": {
				breakfast: ["Oatmeal with walnuts and blueberries", "Whole wheat toast", "Herbal tea"],
				lunch: ["Vegetable stir-fry with tofu", "Quinoa", "Mixed greens salad"],
				dinner: ["Baked paneer with herbs", "Sweet potato", "Steamed broccoli"],
				snacks: ["Greek yogurt", "Orange", "Mixed nuts"]
			},
			"Low Risk": {
				breakfast: ["Whole grain cereal with milk", "Banana", "Green tea"],
				lunch: ["Vegetable soup", "Whole wheat bread", "Side salad"],
				dinner: ["Vegetable curry", "Basmati rice", "Raita"],
				snacks: ["Yogurt", "Berries", "Whole grain crackers"]
			}
		},
		nonVegetarian: {
			"High Risk": {
				breakfast: ["Scrambled eggs (2) with spinach", "Whole grain toast", "Green tea"],
				lunch: ["Grilled chicken breast (150g)", "Quinoa", "Roasted vegetables"],
				dinner: ["Baked salmon (120g) with omega-3s", "Brown rice", "Steamed asparagus"],
				snacks: ["Almonds", "Green apple", "Boiled egg"]
			},
			"Moderate Risk": {
				breakfast: ["Egg white omelet with vegetables", "Whole wheat toast", "Herbal tea"],
				lunch: ["Grilled chicken with herbs", "Sweet potato", "Steamed vegetables"],
				dinner: ["Baked fish with lemon", "Rice (1/2 cup)", "Roasted broccoli"],
				snacks: ["Grilled chicken breast", "Orange", "Mixed nuts"]
			},
			"Low Risk": {
				breakfast: ["Chicken and vegetable sandwich", "Apple", "Coffee"],
				lunch: ["Turkey wrap with vegetables", "Fruit", "Water"],
				dinner: ["Lean meat with pasta", "Salad", "Whole grain bread"],
				snacks: ["Chicken strips", "Berries", "Cheese"]
			}
		}
	};

	const selectedPlan = plans[dietType]?.[riskLevel] || plans.vegetarian["Moderate Risk"];
	return selectedPlan;
};

function NutritionPage() {
	const { user } = useAuth();
	const [latestPrediction, setLatestPrediction] = useState(null);
	const [serverPredictionCount, setServerPredictionCount] = useState(0);
	const [waterGlasses, setWaterGlasses] = useState(0);
	const [waterTarget, setWaterTarget] = useState(8);
	const [dietPreference, setDietPreference] = useState("vegetarian");
	const [initialPreferenceSet, setInitialPreferenceSet] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);

	const downloadNutritionReport = async () => {
		if (!user?.id) return;
		setIsDownloading(true);
		try {
			const response = await axios.get(`http://127.0.0.1:5000/download-report/${user.id}`, {
				responseType: 'blob'
			});
			const blob = new Blob([response.data], { type: 'application/pdf' });
			const downloadUrl = window.URL.createObjectURL(blob);
			const anchor = document.createElement('a');
			anchor.href = downloadUrl;
			anchor.setAttribute('download', `SheCares_Nutrition_Report_${user.name || 'User'}.pdf`);
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			window.URL.revokeObjectURL(downloadUrl);
		} catch (error) {
			console.error('Nutrition report download failed', error);
			alert('Unable to download the nutrition report. Please try again.');
		} finally {
			setIsDownloading(false);
		}
	};

	useEffect(() => {
		if (!user?.id) {
			setWaterGlasses(0);
			setWaterTarget(8);
			return;
		}

		const defaultTarget = 8;
		const dailyStored = localStorage.getItem(hydrationStorageKey(user.id));

		if (dailyStored) {
			try {
				const parsed = JSON.parse(dailyStored);
				const isToday = parsed.date === todayKey();
				const nextTarget = Math.max(1, Number(parsed.target) || defaultTarget);
				setWaterTarget(nextTarget);
				setWaterGlasses(isToday ? Math.max(0, Number(parsed.glasses) || 0) : 0);
				return;
			} catch {
				// Fall back to legacy counter if hydration object is malformed.
			}
		}

		const storedWater = Number(localStorage.getItem(waterStorageKey(user.id)) || 0);
		setWaterGlasses(Math.max(0, storedWater));
		setWaterTarget(defaultTarget);
	}, [user?.id]);

	useEffect(() => {
		if (!user?.id) {
			setLatestPrediction(null);
			return;
		}

		const storageKey = predictionStorageKey(user.id);
		const storedPrediction = localStorage.getItem(storageKey);
		if (storedPrediction) {
			try {
				setLatestPrediction(JSON.parse(storedPrediction));
			} catch {
				localStorage.removeItem(storageKey);
				setLatestPrediction(null);
			}
		} else {
			setLatestPrediction(null);
		}
	}, [user?.id]);

	useEffect(() => {
		if (!latestPrediction || initialPreferenceSet) return;
		const dietType = latestPrediction.input_snapshot?.diet_type;
		if (dietType) {
			if (dietType === 'vegetarian' || dietType === 'vegan') {
				setDietPreference('vegetarian');
			} else {
				setDietPreference('nonVegetarian');
			}
		}
		setInitialPreferenceSet(true);
	}, [latestPrediction, initialPreferenceSet]);

	useEffect(() => {
		if (!user?.id) return;
		localStorage.setItem(waterStorageKey(user.id), String(waterGlasses));
		localStorage.setItem(
			hydrationStorageKey(user.id),
			JSON.stringify({
				date: todayKey(),
				glasses: waterGlasses,
				target: waterTarget
			})
		);
	}, [waterGlasses, waterTarget, user?.id]);

	useEffect(() => {
		if (!user) return;

		const fetchPredictionCount = async () => {
			try {
				const response = await axios.get("http://127.0.0.1:5000/predictions", {
					params: { user_id: user.id }
				});
				if (response.data.success && Array.isArray(response.data.predictions)) {
					setServerPredictionCount(response.data.total || response.data.predictions.length || 0);
				}
			} catch {
				setServerPredictionCount(0);
			}
		};

		fetchPredictionCount();
	}, [user]);

	const personalizedMealPlan = useMemo(() => {
		if (!latestPrediction) return null;
		const riskLevel = latestPrediction.risk_level || "Moderate Risk";
		return generatePersonalizedMealPlan(riskLevel, latestPrediction.nutrition_plan?.daily_calories || 1800, dietPreference);
	}, [latestPrediction, dietPreference]);

	const mealPlanEntries = useMemo(() => {
		if (!personalizedMealPlan) return [];
		return Object.entries(personalizedMealPlan);
	}, [personalizedMealPlan]);

	const macros = latestPrediction?.nutrition_plan?.macros || {};
	const avoidFoods = latestPrediction?.nutrition_plan?.foods_to_avoid || [];
	const supplements = latestPrediction?.nutrition_plan?.supplements || [];
	const medicalRecommendations = latestPrediction?.medical_recommendations || [];
	const hasNutritionData = Boolean(latestPrediction?.nutrition_plan?.meal_plan);
	const hydrationPercent = Math.min(100, Math.round((waterGlasses / Math.max(1, waterTarget)) * 100));
	const hydrationRemaining = Math.max(0, waterTarget - waterGlasses);
	const hydrationStatus =
		waterGlasses >= waterTarget
			? "Great job! You have reached your hydration goal today."
			: `${hydrationRemaining} glass(es) left to hit your target.`;

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#ffe3ec_0%,#fff8e7_38%,#e7f8ff_78%)] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
			<div className="mx-auto max-w-[1440px] space-y-8">
				<section className="rounded-3xl border border-orange-100 bg-white/80 p-7 shadow-xl backdrop-blur-sm lg:p-8">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div>
							<h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Dynamic Nutrition Dashboard</h1>
							<p className="mt-2 text-slate-600">
								Powered by your latest assessment response, without static diet cards.
							</p>
						</div>
					<div className="flex flex-col items-start gap-3 sm:items-end">
						<div className="rounded-2xl bg-gradient-to-r from-orange-400 to-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-lg">
							Assessments on server: {serverPredictionCount}
						</div>
						<button
							type="button"
							onClick={downloadNutritionReport}
							disabled={!latestPrediction || !hasNutritionData || isDownloading}
							className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
						>
							{isDownloading ? 'Preparing PDF...' : 'Download Nutrition Report'}
						</button>
					</div>
				</div>
			</section>

			{!latestPrediction && (
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
						<section className="grid gap-5 md:grid-cols-4">
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

					<section className="rounded-3xl bg-white p-7 shadow-xl lg:p-8">
						<div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
							<div>
								<h2 className="text-xl font-bold text-slate-800">Personalized Meal Plan</h2>
								<p className="text-sm text-slate-600">Tailored to your PCOS risk level and dietary preference</p>
							</div>
							<div className="flex items-center gap-3">
								<label className="text-sm font-semibold text-slate-700">Diet Type:</label>
								<select
									value={dietPreference}
									onChange={(e) => setDietPreference(e.target.value)}
									className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
								>
									<option value="vegetarian">🌱 Vegetarian</option>
									<option value="nonVegetarian">🍗 Non-Vegetarian</option>
								</select>
							</div>
						</div>

						<div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-5 mb-6">
							<p className="text-sm text-slate-700">
								<span className="font-semibold text-slate-800">Risk Level:</span> {latestPrediction?.risk_level || "Unknown"} • 
								<span className="ml-2 font-semibold text-slate-800">Daily Calories:</span> {latestPrediction?.nutrition_plan?.daily_calories || 1800} kcal
							</p>
						</div>

						<div className="grid gap-5 md:grid-cols-2">
									{mealPlanEntries.map(([mealName, items]) => (
										<div key={mealName} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
											<h3 className="font-semibold capitalize text-slate-700">{mealName}</h3>
											<ul className="mt-2 list-disc pl-6 text-sm text-slate-600">
												{items.map((item) => (
													<li key={`${mealName}-${item}`}>{item}</li>
												))}
											</ul>
										</div>
									))}
								</div>
					</section>

					<section className="space-y-6">
								<div className="rounded-3xl bg-white p-7 shadow-xl lg:p-8">
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

								<div className="rounded-3xl bg-white p-7 shadow-xl lg:p-8">
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
							</section>

							<section className="grid gap-8 lg:grid-cols-2">
								<div className="rounded-3xl bg-white p-7 shadow-xl lg:p-8">
									<h2 className="text-xl font-bold text-slate-800">Medical Recommendations</h2>
								<ul className="mt-4 space-y-2 text-sm text-slate-700">
									{medicalRecommendations.map((item) => (
										<li key={item} className="rounded-xl bg-slate-50 p-3">
											{item}
										</li>
									))}
								</ul>
							</div>

							<div className="rounded-3xl bg-white p-7 shadow-xl lg:p-8">							<h2 className="text-xl font-bold text-slate-800">Diet Recommendations</h2>
							<div className="mt-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-4">
								<p className="text-sm font-semibold text-slate-800 mb-3">{dietPreference === 'vegetarian' ? '🌱 Vegetarian Plan' : '🍗 Non-Vegetarian Plan'}</p>
								<ul className="space-y-2 text-sm text-slate-700">
									<li className="flex items-start gap-2">
										<span className="text-emerald-600 font-bold">✓</span>
										<span>Customize meals above based on your dietary preference</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-emerald-600 font-bold">✓</span>
										<span>Switch between vegetarian and non-vegetarian options anytime</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-emerald-600 font-bold">✓</span>
										<span>All meals are personalized for your {latestPrediction?.risk_level || 'Moderate'} risk level</span>
									</li>
								</ul>
							</div>
						</div>

						<div className="rounded-3xl bg-white p-7 shadow-xl lg:p-8">								<h2 className="text-xl font-bold text-slate-800">Hydration Tracker</h2>
								<p className="mt-2 text-sm text-slate-600">Track and adjust your daily hydration goal</p>

								<div className="mt-4 flex items-end justify-between gap-4">
									<div>
										<p className="text-4xl font-extrabold text-cyan-600">{waterGlasses} / {waterTarget}</p>
										<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Glasses Today</p>
									</div>
									<div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 px-3 py-2 text-right">
										<p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Progress</p>
										<p className="text-xl font-bold text-cyan-700">{hydrationPercent}%</p>
									</div>
								</div>

								<div className="mt-4 h-3 w-full rounded-full bg-cyan-100">
									<div
										className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
										style={{ width: `${hydrationPercent}%` }}
									/>
								</div>

								<p className="mt-3 text-sm font-medium text-slate-700">{hydrationStatus}</p>

								<div className="mt-4 flex flex-wrap items-center gap-2">
									<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Target</span>
									<button
										type="button"
										onClick={() => setWaterTarget((prev) => Math.max(1, prev - 1))}
										className="rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
									>
										-1
									</button>
									<span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
										{waterTarget} glasses
									</span>
									<button
										type="button"
										onClick={() => setWaterTarget((prev) => prev + 1)}
										className="rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
									>
										+1
									</button>
								</div>

								<div className="mt-4 flex flex-wrap gap-3">
									<button
										type="button"
										onClick={() => setWaterGlasses((prev) => prev + 1)}
										className="rounded-full bg-cyan-500 px-4 py-2 font-semibold text-white transition hover:bg-cyan-600"
									>
										+1 Glass
									</button>
									<button
										type="button"
										onClick={() => setWaterGlasses((prev) => prev + 2)}
										className="rounded-full bg-sky-500 px-4 py-2 font-semibold text-white transition hover:bg-sky-600"
									>
										+2 Glasses
									</button>
									<button
										type="button"
										onClick={() => setWaterGlasses((prev) => Math.max(0, prev - 1))}
										className="rounded-full bg-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-300"
									>
										-1 Glass
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