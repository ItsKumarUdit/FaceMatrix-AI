import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import {
    ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
    BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
const heatColor = (v) => {
    if (v === null) return "#1e293b";
    if (v >= 95)   return "#22c55e";
    if (v >= 85)   return "#3b82f6";
    if (v >= 75)   return "#f59e0b";
    return "#ef4444";
};
const riskColor   = (r) => r >= 70 ? "#ef4444" : r >= 45 ? "#f59e0b" : "#22c55e";
const changeColor = (c) => String(c).startsWith("+") ? "#22c55e" : String(c).startsWith("-") ? "#ef4444" : "#94a3b8";

/* ══════════════════════════════════════════════
   STYLE TOKENS
══════════════════════════════════════════════ */
const S = {
    page: {
        background: "linear-gradient(160deg,#060d1f 0%,#0b1630 55%,#060d1f 100%)",
        minHeight: "100vh",
        padding: "44px 36px",
        fontFamily: "'Segoe UI',system-ui,sans-serif",
        color: "#e2e8f0",
    },
    hero: { textAlign: "center", marginBottom: "40px", borderBottom: "1px solid #1a3356", paddingBottom: "28px" },
    heroTitle: {
        fontSize: "clamp(34px,4.5vw,56px)", fontWeight: 900, letterSpacing: "-1.5px",
        background: "linear-gradient(100deg,#60a5fa 0%,#a78bfa 50%,#34d399 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: 0,
    },
    heroSub: { color: "#475569", marginTop: "8px", fontSize: "13px", letterSpacing: "3px", textTransform: "uppercase" },
    sessionBadge: {
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "5px 14px", borderRadius: "999px", marginTop: "12px",
        background: "#22c55e18", border: "1px solid #22c55e44", color: "#34d399",
        fontSize: "13px", fontWeight: 700, letterSpacing: "1px",
    },
    sectionHeader: { textAlign: "center", marginBottom: "24px" },
    sectionTitle: {
        fontSize: "13px", fontWeight: 800, color: "#475569",
        textTransform: "uppercase", letterSpacing: "3px",
        display: "inline-flex", alignItems: "center", gap: "8px",
    },
    card: {
        background: "linear-gradient(145deg,#0e1e3a 0%,#0d1829 100%)",
        border: "1px solid #1a3356", borderRadius: "18px", padding: "26px",
        position: "relative", overflow: "hidden",
    },
    statCard: (accent) => ({
        background: "linear-gradient(145deg,#0e1e3a 0%,#0d1829 100%)",
        border: `1px solid ${accent}33`, borderRadius: "18px", padding: "26px 18px",
        textAlign: "center", boxShadow: `0 0 22px ${accent}12`,
    }),
    badge: (color) => ({
        display: "inline-block", padding: "3px 10px", borderRadius: "999px",
        fontSize: "11px", fontWeight: 700, background: `${color}22`, color, border: `1px solid ${color}44`,
    }),
    table: { width: "100%", borderCollapse: "collapse" },
    th: { padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #1a2a44" },
    td: { padding: "12px 14px", fontSize: "14px", borderBottom: "1px solid #0d1829", color: "#94a3b8" },
    filterBar: {
        display: "flex", flexWrap: "wrap", gap: "12px", padding: "20px 24px",
        background: "#0b1630", borderRadius: "14px", border: "1px solid #1a3356",
        marginBottom: "44px", alignItems: "center", justifyContent: "center",
    },
    select: {
        background: "#08111f", border: "1px solid #1a3356", borderRadius: "8px",
        color: "#64748b", padding: "9px 16px", fontSize: "14px", outline: "none", cursor: "pointer",
    },
    applyBtn: {
        background: "linear-gradient(135deg,#3b82f6,#6366f1)", border: "none",
        borderRadius: "8px", color: "#fff", padding: "9px 22px", fontWeight: 700, cursor: "pointer", fontSize: "14px",
    },
    resetBtn: {
        background: "transparent", border: "1px solid #1a3356",
        borderRadius: "8px", color: "#475569", padding: "9px 18px", fontWeight: 600, cursor: "pointer", fontSize: "14px",
    },
    grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(440px,1fr))", gap: "24px" },
    grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "20px" },
    grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "18px" },
    grid5: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "18px" },
    divider: { height: "1px", background: "linear-gradient(90deg,transparent,#1a3356,transparent)", margin: "52px 0" },
    progressWrap: { width: "100%", height: "8px", background: "#1a2a44", borderRadius: "999px", overflow: "hidden" },
    skeleton: { background: "linear-gradient(90deg,#0e1e3a,#1a2a44,#0e1e3a)", backgroundSize: "200% 100%", borderRadius: "8px", animation: "shimmer 1.4s infinite" },
};

/* ══════════════════════════════════════════════
   MICRO COMPONENTS
══════════════════════════════════════════════ */
const SectionHead = ({ icon, label }) => (
    <div style={S.sectionHeader}>
        <span style={S.sectionTitle}><span style={{ fontSize: "18px" }}>{icon}</span>{label}</span>
        <div style={{ width: "60px", height: "2px", background: "linear-gradient(90deg,#3b82f6,#a78bfa)", borderRadius: "2px", margin: "10px auto 0" }} />
    </div>
);

const CTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "#0b1630", border: "1px solid #1a3356", borderRadius: "10px", padding: "10px 16px", fontSize: "13px" }}>
            <div style={{ color: "#475569", marginBottom: "4px" }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color || "#60a5fa", fontWeight: 700 }}>
                    {p.name}: {p.value}{typeof p.value === "number" ? "%" : ""}
                </div>
            ))}
        </div>
    );
};

const ProgressBar = ({ pct, color }) => (
    <div style={S.progressWrap}>
        <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: `linear-gradient(90deg,${color},${color}99)`, borderRadius: "999px", transition: "width 1s ease" }} />
    </div>
);

const Skeleton = ({ h = "40px", w = "100%" }) => (
    <div style={{ ...S.skeleton, height: h, width: w }} />
);

const EmptyState = ({ msg = "No data available." }) => (
    <div style={{ textAlign: "center", padding: "36px", color: "#334155", fontSize: "14px" }}>
        <div style={{ fontSize: "32px", marginBottom: "10px" }}>📭</div>
        {msg}
    </div>
);

/* ══════════════════════════════════════════════
   HEATMAP
══════════════════════════════════════════════ */
const AttendanceHeatmap = ({ heatmap, label }) => {
    if (!heatmap?.length) return <div style={S.card}><Skeleton h="220px" /></div>;
    const DOW = ["Su","Mo","Tu","We","Th","Fr","Sa"];
    const weeks = [];
    let week = [];
    for (let i = 0; i < heatmap[0].dow; i++) week.push(null);
    heatmap.forEach(d => {
        week.push(d);
        if (week.length === 7) { weeks.push(week); week = []; }
    });
    if (week.length) { while (week.length < 7) week.push(null); weeks.push(week); }

    return (
        <div style={S.card}>
            <div style={{ textAlign: "center", fontWeight: 700, color: "#94a3b8", marginBottom: "18px", fontSize: "15px" }}>
                📅 Attendance Heatmap — {label}
            </div>
            <div style={{ overflowX: "auto" }}>
                <div style={{ display: "flex", gap: "5px", marginBottom: "6px", minWidth: "280px" }}>
                    {DOW.map(d => <div key={d} style={{ width: "34px", textAlign: "center", fontSize: "11px", color: "#334155", fontWeight: 700 }}>{d}</div>)}
                </div>
                {weeks.map((wk, wi) => (
                    <div key={wi} style={{ display: "flex", gap: "5px", marginBottom: "5px" }}>
                        {wk.map((d, di) => (
                            <div key={di}
                                title={d ? (d.holiday ? `${d.label}: Holiday` : d.weekend ? `${d.label}: Weekend` : d.value !== null ? `${d.label}: ${d.value}%` : `${d.label}: No data`) : ""}
                                style={{
                                    width: "34px", height: "34px", borderRadius: "6px",
                                    background: d ? (d.holiday ? "#2d1b69" : heatColor(d.value)) : "#060d1f",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "11px", fontWeight: 700, color: d?.value !== null ? "#fff" : "#334155",
                                    opacity: d ? 1 : 0.15, cursor: d ? "pointer" : "default",
                                    transition: "transform .15s",
                                    border: d?.holiday ? "1px solid #7c3aed55" : "none",
                                }}
                                onMouseEnter={e => { if (d) e.currentTarget.style.transform = "scale(1.18)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                            >
                                {d?.day || ""}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", gap: "16px", marginTop: "18px", flexWrap: "wrap", justifyContent: "center" }}>
                {[["≥95%","#22c55e"],["85–94%","#3b82f6"],["75–84%","#f59e0b"],["<75%","#ef4444"],["Holiday","#2d1b69"],["No Data","#1e293b"]].map(([l,c]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#475569" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: c }} />{l}
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════
   AT-RISK PREDICTION
══════════════════════════════════════════════ */
const DefaulterPrediction = ({ data, loading }) => (
    <div style={S.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "10px" }}>
            <span style={{ fontSize: "20px" }}>🚨</span>
            <span style={{ fontWeight: 800, color: "#f87171", fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px" }}>At-Risk Student Prediction</span>
            <span style={{ ...S.badge("#ef4444"), fontSize: "10px" }}>LIVE DATA</span>
        </div>
        <p style={{ color: "#334155", fontSize: "12px", marginBottom: "20px", textAlign: "center" }}>
            Students with &lt;75% attendance, ranked by risk. Data from MongoDB Atlas.
        </p>
        {loading ? <Skeleton h="180px" /> : !data?.length ? <EmptyState msg="No at-risk students. All attendance looks good! 🎉" /> : (
            <div style={{ overflowX: "auto" }}>
                <table style={S.table}>
                    <thead>
                        <tr>{["Student","Class","Current Att.","Risk Score","Trend","Action"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                        {data.map((s, i) => (
                            <tr key={i}>
                                <td style={{ ...S.td, color: "#e2e8f0", fontWeight: 600 }}>{s.name}</td>
                                <td style={S.td}><span style={S.badge("#3b82f6")}>{s.class}</span></td>
                                <td style={{ ...S.td, color: "#ef4444", fontWeight: 800 }}>{s.attendance}%</td>
                                <td style={S.td}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{ flex: 1 }}><ProgressBar pct={s.risk} color={riskColor(s.risk)} /></div>
                                        <span style={{ color: riskColor(s.risk), fontWeight: 800, fontSize: "13px", minWidth: "38px" }}>{s.risk}%</span>
                                    </div>
                                </td>
                                <td style={{ ...S.td, color: "#ef4444", fontWeight: 900, fontSize: "20px" }}>{s.trend}</td>
                                <td style={S.td}>
                                    <button
                                        style={{ background: "#ef444420", border: "1px solid #ef444440", color: "#ef4444", borderRadius: "6px", padding: "5px 12px", fontSize: "11px", cursor: "pointer", fontWeight: 700 }}
                                        onClick={() => alert(`Notify action for ${s.name} — connect to notification API.`)}>
                                        Notify
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

/* ══════════════════════════════════════════════
   TODAY SUMMARY
══════════════════════════════════════════════ */
const TodaySummary = ({ today, loading }) => {
    if (loading) return <div style={{ ...S.card }}><Skeleton h="240px" /></div>;
    if (!today) return <div style={S.card}><EmptyState msg="No attendance data for today yet." /></div>;
    return (
        <div style={{ background: "linear-gradient(145deg,#071a0e,#0b1630)", border: "1px solid #22c55e22", borderRadius: "18px", padding: "30px", boxShadow: "0 0 40px #22c55e0a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "26px", alignItems: "center" }}>
                <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ color: "#34d399", fontWeight: 800, fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px" }}>📋 Today's Attendance</div>
                    <div style={{ color: "#334155", fontSize: "13px", marginTop: "4px" }}>{today.date}</div>
                </div>
                <div style={{ fontSize: "52px", fontWeight: 900, color: today.percentage >= 90 ? "#34d399" : today.percentage >= 75 ? "#f59e0b" : "#ef4444", lineHeight: 1, textAlign: "center" }}>
                    {today.percentage}%
                </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: "14px", marginBottom: "26px" }}>
                {[["Total",today.total,"#60a5fa"],["Present",today.present,"#34d399"],["Absent",today.absent,"#f87171"]].map(([l,v,c]) => (
                    <div key={l} style={{ textAlign: "center", padding: "16px 8px", background: "#060d1f55", borderRadius: "12px", border: `1px solid ${c}22` }}>
                        <div style={{ fontSize: "28px", fontWeight: 900, color: c }}>{v}</div>
                        <div style={{ fontSize: "11px", color: "#334155", marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>{l}</div>
                    </div>
                ))}
            </div>
            {today.byClass?.length > 0 && (
                <>
                    <div style={{ fontSize: "11px", color: "#334155", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "14px", textAlign: "center" }}>Class-wise Breakdown</div>
                    {today.byClass.map((c, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                            <div style={{ width: "72px", color: "#64748b", fontSize: "13px", fontWeight: 700 }}>{c.class}</div>
                            <div style={{ flex: 1 }}><ProgressBar pct={c.total > 0 ? Math.round(c.present/c.total*100) : 0} color="#22c55e" /></div>
                            <div style={{ width: "52px", textAlign: "right", fontSize: "13px", color: "#475569" }}>{c.present}/{c.total}</div>
                            <div style={{ width: "46px", textAlign: "right", fontSize: "13px", fontWeight: 800, color: "#34d399" }}>{c.total > 0 ? Math.round(c.present/c.total*100) : 0}%</div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
function Analytics() {
    const [className, setClassName] = useState("");
    const [section,   setSection]   = useState("");
    const [month,     setMonth]     = useState("");
    const [data,      setData]      = useState({});
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState(null);
    const [fadeIn,    setFadeIn]    = useState(false);

    const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (className) params.append("className", className);
            if (section)   params.append("section",   section);
            if (month)     params.append("month",     month);
            const res = await API.get(`/analytics?${params.toString()}`);
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load analytics.");
        } finally {
            setLoading(false);
        }
    }, [className, section, month]);

    useEffect(() => { setFadeIn(true); fetchAnalytics(); }, [fetchAnalytics]);

    const d = data;

    // Dynamic filter options from backend
    const classes  = d.availableClasses  || [];
    const sections = d.availableSections || [];

    if (error) {
        return (
            <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
                <div style={{ fontSize: "48px" }}>⚠️</div>
                <div style={{ color: "#ef4444", fontWeight: 700, fontSize: "18px" }}>{error}</div>
                <button style={S.applyBtn} onClick={fetchAnalytics}>Retry</button>
            </div>
        );
    }

    return (
        <div id="analytics-root" style={{ ...S.page, opacity: fadeIn ? 1 : 0, transition: "opacity .7s ease" }}>

            {/* ── HERO ── */}
            <div style={S.hero}>
                <h1 style={S.heroTitle}>AI Analytics Center</h1>
                <p style={S.heroSub}>FaceMatrix-AI · Academic Intelligence Dashboard</p>
                {d.activeSession && (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <span style={S.sessionBadge}>🎓 Session: {d.activeSession.name}</span>
                    </div>
                )}
            </div>

            {/* ── FILTERS ── */}
            <div style={S.filterBar}>
                <select style={S.select} value={className} onChange={e => setClassName(e.target.value)}>
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
                <select style={S.select} value={section} onChange={e => setSection(e.target.value)}>
                    <option value="">All Sections</option>
                    {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>
                <select style={S.select} value={month} onChange={e => setMonth(e.target.value)}>
                    <option value="">All Months</option>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <button style={S.applyBtn} onClick={fetchAnalytics}>Apply Filters</button>
                <button style={S.resetBtn} onClick={() => { setClassName(""); setSection(""); setMonth(""); }}>Reset</button>
            </div>

            {/* ════════════════════════════════════════
                SECTION 1 — KPI CARDS
            ════════════════════════════════════════ */}
            <SectionHead icon="📊" label="Overview KPIs" />
            <div style={S.grid4}>
                {[
                    { label: "Average Attendance",   value: loading ? "—" : `${d.avgAttendance ?? 0}%`,                    color: "#3b82f6", icon: "📈" },
                    { label: "Recognition Accuracy", value: loading ? "—" : `${d.recognitionAcc ?? 0}%`,                   color: "#22c55e", icon: "🎯" },
                    { label: "Best Class",           value: loading ? "—" : (d.bestClass || "—"),                           color: "#a855f7", icon: "🏆" },
                    { label: "Best Section",         value: loading ? "—" : (d.bestSection || "—"),                         color: "#f59e0b", icon: "⭐" },
                    { label: "Total Students",       value: loading ? "—" : (d.totalStudents ?? 0),                         color: "#84cc16", icon: "👥" },
                    { label: "Today Present",        value: loading ? "—" : (d.today?.present ?? 0),                        color: "#34d399", icon: "✅" },
                    { label: "Today Absent",         value: loading ? "—" : (d.today?.absent  ?? 0),                        color: "#f87171", icon: "❌" },
                    { label: "Faces Processed Today",value: loading ? "—" : (d.aiStats?.facesProcessedToday ?? 0),          color: "#f59e0b", icon: "📷" },
                ].map((k, i) => (
                    <div key={i} style={S.statCard(k.color)}>
                        <div style={{ fontSize: "30px" }}>{k.icon}</div>
                        <div style={{ fontSize: "11px", color: "#334155", textTransform: "uppercase", letterSpacing: "1px", margin: "10px 0 4px", fontWeight: 700 }}>{k.label}</div>
                        {loading
                            ? <div style={{ marginTop: "8px" }}><Skeleton h="30px" w="80px" /></div>
                            : <div style={{ fontSize: "28px", fontWeight: 900, color: k.color }}>{k.value}</div>
                        }
                    </div>
                ))}
            </div>

            <div style={S.divider} />

            {/* ════════════════════════════════════════
                SECTION 2 — TODAY'S SUMMARY
            ════════════════════════════════════════ */}
            <SectionHead icon="📋" label="Today's Attendance Summary" />
            <TodaySummary today={d.today} loading={loading} />

            <div style={S.divider} />

            {/* ════════════════════════════════════════
                SECTION 3 — AI INSIGHTS
            ════════════════════════════════════════ */}
            <SectionHead icon="🤖" label="AI Insights" />
            <div style={{ background: "linear-gradient(145deg,#14063a,#0b1630)", border: "1px solid #7c3aed33", borderRadius: "18px", padding: "30px", boxShadow: "0 0 48px #7c3aed0e" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px", justifyContent: "center" }}>
                    <span style={{ fontSize: "22px" }}>🤖</span>
                    <span style={{ color: "#c084fc", fontWeight: 800, fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px" }}>Auto-Generated from Atlas Data</span>
                    <span style={{ ...S.badge("#a855f7"), fontSize: "10px" }}>LIVE</span>
                </div>
                {loading ? <Skeleton h="180px" /> : (d.insights || []).length === 0 ? (
                    <EmptyState msg="Insights will appear once attendance data is available." />
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {(d.insights || []).map((ins, i) => (
                            <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "16px", background: "#060d1f77", borderRadius: "12px", border: `1px solid ${ins.color}22` }}>
                                <span style={{ fontSize: "20px", flexShrink: 0 }}>{ins.icon}</span>
                                <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8", lineHeight: "1.65" }}>{ins.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={S.divider} />

            {/* ════════════════════════════════════════
                SECTION 4 — HEATMAP
            ════════════════════════════════════════ */}
            <SectionHead icon="🗓️" label="Attendance Heatmap Calendar" />
            <AttendanceHeatmap heatmap={d.heatmap} label={d.heatmapLabel || ""} />

            <div style={S.divider} />

            {/* ════════════════════════════════════════
                SECTION 5 — TRENDS
            ════════════════════════════════════════ */}
            <SectionHead icon="📈" label="Attendance Trends" />
            <div style={S.grid2}>
                <div style={S.card}>
                    <div style={{ textAlign: "center", fontWeight: 700, color: "#94a3b8", marginBottom: "18px", fontSize: "15px" }}>Monthly Attendance Trend</div>
                    {loading ? <Skeleton h="280px" /> : !d.trendData?.length ? <EmptyState /> : (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={d.trendData}>
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="#1a2a44" />
                                <XAxis dataKey="month"     stroke="#334155" tick={{ fill: "#475569", fontSize: 12 }} />
                                <YAxis domain={[0, 100]}   stroke="#334155" tick={{ fill: "#475569", fontSize: 12 }} />
                                <Tooltip content={<CTooltip />} />
                                <Area type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={3} fill="url(#areaGrad)" dot={{ r: 5, fill: "#3b82f6" }} name="Attendance" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div style={S.card}>
                    <div style={{ textAlign: "center", fontWeight: 700, color: "#94a3b8", marginBottom: "18px", fontSize: "15px" }}>Weekly Attendance ({month || "Current Month"})</div>
                    {loading ? <Skeleton h="280px" /> : !d.weeklyData?.some(w => w.attendance > 0) ? <EmptyState msg="No weekly data for this period." /> : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={d.weeklyData}>
                                <CartesianGrid stroke="#1a2a44" />
                                <XAxis dataKey="week"      stroke="#334155" tick={{ fill: "#475569", fontSize: 12 }} />
                                <YAxis domain={[0, 100]}   stroke="#334155" tick={{ fill: "#475569", fontSize: 12 }} />
                                <Tooltip content={<CTooltip />} />
                                <Bar dataKey="attendance" fill="#6366f1" radius={[7,7,0,0]} name="Attendance">
                                    {(d.weeklyData || []).map((w, i) => (
                                        <Cell key={i} fill={w.attendance >= 90 ? "#22c55e" : w.attendance >= 75 ? "#3b82f6" : w.attendance >= 60 ? "#f59e0b" : "#ef4444"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div style={S.divider} />

            {/* ════════════════════════════════════════
                SECTION 6 — CLASS & DISTRIBUTION
            ════════════════════════════════════════ */}
            <SectionHead icon="🏫" label="Class & Distribution Analysis" />
            <div style={S.grid2}>
                <div style={S.card}>
                    <div style={{ textAlign: "center", fontWeight: 700, color: "#94a3b8", marginBottom: "18px", fontSize: "15px" }}>Class Performance</div>
                    {loading ? <Skeleton h="300px" /> : !d.classData?.length ? <EmptyState /> : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={d.classData}>
                                <CartesianGrid stroke="#1a2a44" />
                                <XAxis dataKey="class"   stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} />
                                <YAxis domain={[0, 100]} stroke="#334155" tick={{ fill: "#475569", fontSize: 12 }} />
                                <Tooltip content={<CTooltip />} />
                                <Bar dataKey="attendance" radius={[6,6,0,0]} name="Attendance">
                                    {(d.classData || []).map((c, i) => (
                                        <Cell key={i} fill={c.attendance >= 90 ? "#22c55e" : c.attendance >= 75 ? "#3b82f6" : c.attendance >= 60 ? "#f59e0b" : "#ef4444"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div style={S.card}>
                    <div style={{ textAlign: "center", fontWeight: 700, color: "#94a3b8", marginBottom: "18px", fontSize: "15px" }}>Student Attendance Distribution</div>
                    {loading ? <Skeleton h="220px" /> : !d.distributionData?.some(v => v.value > 0) ? <EmptyState /> : (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={d.distributionData} dataKey="value" nameKey="name" outerRadius={85} innerRadius={48} paddingAngle={5}
                                        label={({ value }) => value > 0 ? `${value}` : ""} labelLine={false}>
                                        {(d.distributionData || []).map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(v, n) => [`${v} students`, n]} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", marginTop: "14px" }}>
                                {(d.distributionData || []).map((e, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64748b" }}>
                                        <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: e.color }} />
                                        {e.name}: {e.value}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div style={S.divider} />

            {/* ════════════════════════════════════════
                SECTION 7 — SECTION DISTRIBUTION
            ════════════════════════════════════════ */}
            <SectionHead icon="🍰" label="Section Distribution by Class" />
            <div style={S.grid2}>
                <div style={{ ...S.card, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ textAlign: "center", fontWeight: 700, color: "#94a3b8", marginBottom: "18px", fontSize: "15px" }}>Section-wise Student Count</div>
                    {loading ? <Skeleton h="280px" /> : !d.sectionDistData?.length ? <EmptyState /> : (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={d.sectionDistData} dataKey="value" nameKey="label" outerRadius={110} innerRadius={55} paddingAngle={4}
                                    label={({ label, value }) => `${label}: ${value}`} labelLine>
                                    {(d.sectionDistData || []).map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip formatter={(v, n) => [`${v} students`, n]} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div style={S.card}>
                    <div style={{ textAlign: "center", fontWeight: 700, color: "#94a3b8", marginBottom: "18px", fontSize: "15px" }}>Students per Section</div>
                    {loading ? <Skeleton h="280px" /> : !d.sectionDistData?.length ? <EmptyState /> : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {(d.sectionDistData || []).map((s, i) => {
                                const maxVal = Math.max(...(d.sectionDistData || []).map(x => x.value), 1);
                                return (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{ width: "120px", fontSize: "12px", color: "#64748b", fontWeight: 600 }}>{s.label}</div>
                                        <div style={{ flex: 1 }}><ProgressBar pct={Math.round(s.value / maxVal * 100)} color={s.color} /></div>
                                        <div style={{ width: "32px", textAlign: "right", fontWeight: 800, fontSize: "14px", color: s.color }}>{s.value}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div style={S.divider} />

            {/* ════════════════════════════════════════
                SECTION 8 — CLASS RANKING LEADERBOARD
            ════════════════════════════════════════ */}
            <SectionHead icon="🏆" label="Class-wise Ranking Leaderboard" />
            <div style={S.card}>
                {loading ? <Skeleton h="160px" /> : !d.classRankingData?.length ? <EmptyState /> : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "14px" }}>
                        {(d.classRankingData || []).map((c, i) => (
                            <div key={i} style={{
                                padding: "18px 12px", borderRadius: "14px", textAlign: "center",
                                background: i===0 ? "linear-gradient(135deg,#f59e0b20,#060d1f)" : i===1 ? "linear-gradient(135deg,#94a3b820,#060d1f)" : i===2 ? "linear-gradient(135deg,#b4530920,#060d1f)" : "#060d1f55",
                                border: `1px solid ${i===0?"#f59e0b44":i===1?"#94a3b844":i===2?"#b4530944":"#1a2a44"}`,
                            }}>
                                <div style={{ fontSize: "22px", marginBottom: "6px" }}>
                                    {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                                </div>
                                <div style={{ fontWeight: 800, color: "#e2e8f0", fontSize: "14px" }}>{c.class}</div>
                                <div style={{ fontSize: "28px", fontWeight: 900, color: i<3?["#f59e0b","#94a3b8","#cd7f32"][i]:"#3b82f6", margin: "4px 0" }}>{c.score}%</div>
                                <div style={{ fontSize: "11px", color: changeColor(c.change), fontWeight: 700 }}>{c.change}% vs last month</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={S.divider} />

            {/* ════════════════════════════════════════
                SECTION 9 — STUDENT PERFORMANCE
            ════════════════════════════════════════ */}
            <SectionHead icon="👥" label="Student Performance" />
            <div style={S.grid2}>
                <div style={S.card}>
                    <div style={{ textAlign: "center", fontWeight: 700, color: "#94a3b8", marginBottom: "18px", fontSize: "15px" }}>🏆 Top Attendance Students</div>
                    {loading ? <Skeleton h="200px" /> : !d.topStudents?.length ? <EmptyState msg="No student data yet." /> : (
                        <table style={S.table}>
                            <thead><tr>{["Rank","Name","Class","Attendance"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                            <tbody>
                                {(d.topStudents || []).map((s, i) => (
                                    <tr key={i}>
                                        <td style={S.td}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":s.rank}</td>
                                        <td style={{ ...S.td, color: "#e2e8f0", fontWeight: 600 }}>{s.name}</td>
                                        <td style={S.td}><span style={S.badge("#3b82f6")}>{s.class}</span></td>
                                        <td style={{ ...S.td, color: "#22c55e", fontWeight: 800 }}>{s.att}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div style={S.card}>
                    <div style={{ textAlign: "center", fontWeight: 700, color: "#94a3b8", marginBottom: "18px", fontSize: "15px" }}>⚠️ Low Attendance Alerts (&lt;75%)</div>
                    {loading ? <Skeleton h="200px" /> : d.lowAttendance?.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "30px", color: "#22c55e", fontWeight: 700 }}>✅ No low attendance students!</div>
                    ) : (
                        <table style={S.table}>
                            <thead><tr>{["Name","Class","Attendance","Status"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                            <tbody>
                                {(d.lowAttendance || []).map((s, i) => (
                                    <tr key={i}>
                                        <td style={{ ...S.td, color: "#e2e8f0", fontWeight: 600 }}>{s.name}</td>
                                        <td style={S.td}><span style={S.badge("#f59e0b")}>{s.class}</span></td>
                                        <td style={{ ...S.td, color: "#ef4444", fontWeight: 800 }}>{s.attendance}%</td>
                                        <td style={S.td}><span style={S.badge(s.status==="Critical"?"#ef4444":"#f59e0b")}>{s.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div style={S.divider} />

            {/* ════════════════════════════════════════
                SECTION 10 — STREAK HALL OF FAME
            ════════════════════════════════════════ */}
            <SectionHead icon="🔥" label="Most Regular Students — Streak Hall of Fame" />
            {loading ? (
                <div style={S.grid3}>{[1,2,3].map(i => <div key={i} style={S.card}><Skeleton h="180px" /></div>)}</div>
            ) : !(d.regularStudents || []).length ? (
                <div style={{ ...S.card, textAlign: "center", padding: "40px", color: "#475569" }}>No streak data available yet.</div>
            ) : (
                <div style={S.grid3}>
                    {(d.regularStudents || []).map((s, i) => (
                        <div key={i} style={{ ...S.card, textAlign: "center", padding: "30px 20px" }}>
                            <div style={{ fontSize: "38px" }}>{s.badge}</div>
                            <div style={{ fontWeight: 800, color: "#e2e8f0", fontSize: "16px", marginTop: "12px" }}>{s.name}</div>
                            <div style={{ marginTop: "8px" }}><span style={S.badge("#3b82f6")}>{s.class}</span></div>
                            <div style={{ fontSize: "40px", fontWeight: 900, color: "#f59e0b", lineHeight: 1, marginTop: "16px" }}>{s.streak}</div>
                            <div style={{ fontSize: "11px", color: "#334155", marginTop: "6px", textTransform: "uppercase", letterSpacing: "1.5px" }}>Consecutive Days</div>
                            <div style={{ marginTop: "14px" }}><ProgressBar pct={Math.min(s.streak / 90 * 100, 100)} color="#f59e0b" /></div>
                        </div>
                    ))}
                </div>
            )}

            <div style={S.divider} />

            {/* ════════════════════════════════════════
                SECTION 11 — AT-RISK PREDICTION
            ════════════════════════════════════════ */}
            <SectionHead icon="🚨" label="At-Risk Student Prediction" />
            <DefaulterPrediction data={d.defaulterPredictions} loading={loading} />

            <div style={S.divider} />

            {/* ════════════════════════════════════════
                SECTION 12 — AI RECOGNITION STATS
            ════════════════════════════════════════ */}
            <SectionHead icon="🤖" label="AI Recognition Statistics" />
            <div style={S.grid5}>
                {[
                    { title: "Recognized Faces",     value: d.aiStats?.recognizedFaces    ?? "—", icon: "✅", color: "#22c55e" },
                    { title: "Failed Recognition",   value: d.aiStats?.failedFaces         ?? "—", icon: "❌", color: "#ef4444" },
                    { title: "Recognition Accuracy", value: d.aiStats?.recognitionAcc      ? `${d.aiStats.recognitionAcc}%` : "—", icon: "🎯", color: "#3b82f6" },
                    { title: "Processed Today",      value: d.aiStats?.facesProcessedToday ?? "—", icon: "📷", color: "#f59e0b" },
                    { title: "Total Processed",      value: d.aiStats?.totalAIProcessed    ?? "—", icon: "⚡", color: "#a855f7" },
                ].map((item, i) => (
                    <div key={i} style={S.statCard(item.color)}>
                        <div style={{ fontSize: "36px" }}>{item.icon}</div>
                        <div style={{ fontSize: "11px", color: "#334155", textTransform: "uppercase", letterSpacing: "1px", margin: "10px 0 4px", fontWeight: 700 }}>{item.title}</div>
                        {loading
                            ? <div style={{ marginTop: "8px" }}><Skeleton h="32px" w="70px" /></div>
                            : <div style={{ fontSize: "30px", fontWeight: 900, color: item.color }}>{item.value}</div>
                        }
                    </div>
                ))}
            </div>

            <div style={{ height: "64px" }} />

            <style>{`
                @keyframes shimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position:  200% 0; }
                }
            `}</style>
        </div>
    );
}

export default Analytics;