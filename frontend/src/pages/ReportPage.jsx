import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Download, FileText, Sparkles } from "lucide-react";
import { useAuth } from "../components/AuthContext";

function ReportPage() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://127.0.0.1:5000/predictions", {
          params: { user_id: user.id, limit: 10 }
        });

        if (response.data.success && Array.isArray(response.data.predictions)) {
          setPredictions(response.data.predictions);
        }
      } catch (error) {
        console.error("Report data fetch failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [user?.id]);

  const latestPrediction = useMemo(() => predictions[0] || null, [predictions]);

  const downloadReport = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(`http://127.0.0.1:5000/download-report/${user.id}`, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `SheCares_Health_Report_${user.name || "User"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Report download failed", error);
    }
  };

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col gap-5 rounded-3xl bg-white p-7 shadow-xl md:flex-row md:items-center md:justify-between lg:p-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Health Report</h1>
          <p className="mt-2 text-slate-600">
            Your saved PCOS assessments, explanations, and recommendation history live here.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadReport}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          <Download size={18} />
          Download PDF
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <p className="text-slate-600">Loading report data...</p>
        </div>
      ) : !latestPrediction ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-900 shadow-lg">
          <h2 className="text-2xl font-bold">No report data yet</h2>
          <p className="mt-2 text-amber-800">
            Run a PCOS assessment first so the report can be generated from your saved history.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-3xl bg-white p-7 shadow-xl lg:p-8">
              <h2 className="flex items-center text-xl font-bold text-slate-800">
                <Sparkles className="mr-2 text-indigo-500" size={20} />
                Latest Assessment
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase text-slate-500">Risk Level</p>
                  <p className="mt-2 text-lg font-bold text-slate-800">{latestPrediction.risk_level || "Unknown"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">Probability</p>
                  <p className="mt-2 text-lg font-bold text-slate-800">
                    {Math.round(Number(latestPrediction.probability || 0) * 100)}%
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">Confidence</p>
                  <p className="mt-2 text-lg font-bold text-slate-800">
                    {Math.round(Number(latestPrediction.confidence || 0) * 100)}%
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {latestPrediction.analysis_summary || "This assessment is stored in your account history."}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-xl lg:p-8">
              <h2 className="flex items-center text-xl font-bold text-slate-800">
                <FileText className="mr-2 text-emerald-500" size={20} />
                Prediction History
              </h2>
              <div className="mt-4 space-y-3">
                {predictions.map((prediction) => (
                  <div key={prediction.prediction_id} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800">{prediction.risk_level || "Unknown"}</p>
                      <span className="text-xs font-medium text-slate-500">
                        {prediction.created_at ? new Date(prediction.created_at).toLocaleDateString() : "Recent"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      Probability: {Math.round(Number(prediction.probability || 0) * 100)}%
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {prediction.analysis_summary || "Prediction stored in history."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-7 shadow-xl lg:p-8">
              <h3 className="text-lg font-bold text-slate-800">Report Snapshot</h3>
              <p className="mt-2 text-sm text-slate-600">
                Download the PDF report for sharing with your clinician or keeping a personal record.
              </p>
              <button
                type="button"
                onClick={downloadReport}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                <Download size={18} />
                Download Again
              </button>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

export default ReportPage;
