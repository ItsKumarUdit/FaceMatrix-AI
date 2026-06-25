// ═══════════════════════════════════════════════════════════════════
//  analyticsController.js
//  All analytics computed from real MongoDB Atlas data.
//  Active session is auto-detected; filters (className, section,
//  month) narrow results inside that session.
// ═══════════════════════════════════════════════════════════════════

const User       = require("../models/User");
const Attendance = require("../models/Attendance");
const Session    = require("../models/Session");
const Holiday    = require("../models/Holiday");

// ─── helper: "d/m/yyyy" → Date ──────────────────────────────────────
const parseDate = (str) => {
    if (!str) return null;
    const parts = str.split("/");
    if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return new Date(str);
};

// ─── helper: Date → "yyyy-mm-dd" ────────────────────────────────────
const toISO = (d) => {
    const y  = d.getFullYear();
    const m  = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
};

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_NAMES = ["january","february","march","april","may","june","july","august","september","october","november","december"];
const SECTION_COLORS = ["#3b82f6","#6366f1","#a855f7","#22c55e","#16a34a","#84cc16","#f59e0b","#ef4444","#06b6d4","#ec4899","#f43f5e","#0ea5e9"];
const BADGES = ["🏆","🥇","🥇","🥈","🥈","🥉","🥉"];

// ────────────────────────────────────────────────────────────────────
//  getAnalytics   GET /api/analytics?className=7&section=A&month=June
// ────────────────────────────────────────────────────────────────────
const getAnalytics = async (req, res) => {
    try {
        const { className, section, month } = req.query;

        // ── 1. Active session ────────────────────────────────────────
        const activeSession = await Session.findOne({ isActive: true });
        if (!activeSession) {
            return res.status(404).json({ message: "No active session found." });
        }
        const sessionName = activeSession.sessionName;

        // ── 2. Filters ───────────────────────────────────────────────
        const attFilter  = { session: sessionName };
        const userFilter = { session: sessionName };
        if (className) { attFilter.className  = String(className); userFilter.className = String(className); }
        if (section)   { attFilter.section    = section;           userFilter.section   = section;  }

        // ── 3. Month window ──────────────────────────────────────────
        let monthIndex = null;
        if (month) monthIndex = MONTH_NAMES.indexOf(month.toLowerCase());

        const now        = new Date();
        const curMonth   = (monthIndex !== null && monthIndex >= 0) ? monthIndex : now.getMonth();
        const curYear    = now.getFullYear();

        // ── 4. Pull data ─────────────────────────────────────────────
        let allAttendance = await Attendance.find(attFilter).lean();
        const allStudents = await User.find(userFilter).lean();

        // Filter by month if requested
        const attInMonth = monthIndex !== null && monthIndex >= 0
            ? allAttendance.filter(a => { const d = parseDate(a.date); return d && d.getMonth() === monthIndex; })
            : allAttendance;

        // ── 5. Today ─────────────────────────────────────────────────
        const todayDay = now.getDate(), todayMon = now.getMonth() + 1, todayYear = now.getFullYear();
        const todayStr = `${todayDay}/${todayMon}/${todayYear}`;
        const todayRecs   = allAttendance.filter(a => a.date === todayStr);
        const todayPres   = todayRecs.filter(a => a.status === "Present").length;
        const todayAbs    = todayRecs.filter(a => a.status === "Absent").length;
        const todayTotal  = todayPres + todayAbs;

        const todayByClassMap = {};
        todayRecs.forEach(a => {
            const k = `Class ${a.className}`;
            if (!todayByClassMap[k]) todayByClassMap[k] = { present: 0, total: 0 };
            todayByClassMap[k].total++;
            if (a.status === "Present") todayByClassMap[k].present++;
        });
        const todayByClass = Object.entries(todayByClassMap)
            .map(([cls, v]) => ({ class: cls, present: v.present, total: v.total }))
            .sort((a, b) => (parseInt(a.class.replace("Class ","")) || 0) - (parseInt(b.class.replace("Class ","")) || 0));

        // ── 6. Per-student enrichment ────────────────────────────────
        const studentAtt = {};
        attInMonth.forEach(a => {
            const sid = String(a.studentId);
            if (!studentAtt[sid]) studentAtt[sid] = { present: 0, total: 0, dates: [] };
            studentAtt[sid].total++;
            if (a.status === "Present") { studentAtt[sid].present++; studentAtt[sid].dates.push(a.date); }
        });

        const enriched = allStudents.map(s => {
            const d   = studentAtt[String(s._id)] || { present: 0, total: 0, dates: [] };
            const pct = d.total > 0 ? Math.round(d.present / d.total * 100) : 0;
            return { ...s, present: d.present, totalDays: d.total, attendance: pct, dates: d.dates };
        }).filter(s => s.totalDays > 0);

        // ── 7. KPIs ──────────────────────────────────────────────────
        const avgAttendance = enriched.length
            ? Math.round(enriched.reduce((a, s) => a + s.attendance, 0) / enriched.length)
            : 0;

        // ── 8. Monthly trend ─────────────────────────────────────────
        const monthMap = {};
        allAttendance.forEach(a => {
            const d = parseDate(a.date);
            if (!d) return;
            const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
            if (!monthMap[key]) monthMap[key] = { present:0, total:0, month: MONTH_SHORT[d.getMonth()] };
            monthMap[key].total++;
            if (a.status === "Present") monthMap[key].present++;
        });
        const trendData = Object.entries(monthMap)
            .sort(([a],[b]) => a.localeCompare(b)).slice(-8)
            .map(([,v]) => ({ month: v.month, attendance: v.total > 0 ? Math.round(v.present/v.total*100) : 0 }));

        // ── 9. Weekly (current/filtered month) ──────────────────────
        const wk = { "Week 1":{p:0,t:0}, "Week 2":{p:0,t:0}, "Week 3":{p:0,t:0}, "Week 4":{p:0,t:0} };
        attInMonth.forEach(a => {
            const d = parseDate(a.date);
            if (!d) return;
            const w = d.getDate() <= 7 ? "Week 1" : d.getDate() <= 14 ? "Week 2" : d.getDate() <= 21 ? "Week 3" : "Week 4";
            wk[w].t++;
            if (a.status === "Present") wk[w].p++;
        });
        const weeklyData = Object.entries(wk).map(([week,v]) => ({
            week, attendance: v.t > 0 ? Math.round(v.p/v.t*100) : 0
        }));

        // ── 10. Class performance ────────────────────────────────────
        const clsMap = {};
        attInMonth.forEach(a => {
            const k = a.className;
            if (!clsMap[k]) clsMap[k] = { p:0, t:0 };
            clsMap[k].t++;
            if (a.status === "Present") clsMap[k].p++;
        });
        const classData = Object.entries(clsMap)
            .map(([cls,v]) => ({ class:`Class ${cls}`, attendance: v.t>0 ? Math.round(v.p/v.t*100):0, num: parseInt(cls)||0 }))
            .sort((a,b) => a.num - b.num);

        // ── 11. Class ranking with change vs prev month ───────────────
        const buildScore = (recs, mIdx) => {
            const m = {};
            recs.forEach(a => {
                const d = parseDate(a.date);
                if (!d || d.getMonth() !== mIdx) return;
                const k = a.className;
                if (!m[k]) m[k] = {p:0,t:0};
                m[k].t++; if (a.status==="Present") m[k].p++;
            });
            return m;
        };
        const rankAll   = await Attendance.find({ session: sessionName }).lean();
        const prevMon   = curMonth === 0 ? 11 : curMonth - 1;
        const curScores = buildScore(rankAll, curMonth);
        const prvScores = buildScore(rankAll, prevMon);
        const classRankingData = Object.entries(curScores)
            .map(([cls,v]) => {
                const score = v.t>0 ? Math.round(v.p/v.t*100):0;
                const pp    = prvScores[cls];
                const prev  = pp?.t>0 ? Math.round(pp.p/pp.t*100) : score;
                const diff  = score - prev;
                return { class:`Class ${cls}`, score, change: diff>0?`+${diff}`:diff<0?`${diff}`:"0", num: parseInt(cls)||0 };
            })
            .sort((a,b) => b.score - a.score);

        // ── 12. Section distribution ─────────────────────────────────
        const secCount = {};
        allStudents.forEach(s => {
            const k = `Class ${s.className} - ${s.section}`;
            if (!secCount[k]) secCount[k] = { count:0, num: parseInt(s.className)||0, sec: s.section };
            secCount[k].count++;
        });
        const sectionDistData = Object.entries(secCount)
            .sort((a,b) => a[1].num - b[1].num || a[1].sec.localeCompare(b[1].sec))
            .map(([label,v],i) => ({ label, value: v.count, color: SECTION_COLORS[i % SECTION_COLORS.length] }));

        // ── 13. Distribution buckets ─────────────────────────────────
        const bkt = { e:0, g:0, a:0, p:0 };
        enriched.forEach(s => {
            if      (s.attendance >= 90) bkt.e++;
            else if (s.attendance >= 75) bkt.g++;
            else if (s.attendance >= 60) bkt.a++;
            else                         bkt.p++;
        });
        const distributionData = [
            { name:"Excellent (≥90%)", value:bkt.e, color:"#22c55e" },
            { name:"Good (75–89%)",    value:bkt.g, color:"#3b82f6" },
            { name:"Average (60–74%)", value:bkt.a, color:"#f59e0b" },
            { name:"Poor (<60%)",      value:bkt.p, color:"#ef4444" },
        ];

        // ── 14. Heatmap ──────────────────────────────────────────────
        const daysInMonth = new Date(curYear, curMonth+1, 0).getDate();
        const dayAttMap   = {};
        attInMonth.forEach(a => {
            const d = parseDate(a.date);
            if (!d || d.getMonth() !== curMonth || d.getFullYear() !== curYear) return;
            if (!dayAttMap[a.date]) dayAttMap[a.date] = { p:0, t:0 };
            dayAttMap[a.date].t++;
            if (a.status === "Present") dayAttMap[a.date].p++;
        });
        const holidays = await Holiday.find().lean();
        const checkHoliday = (iso) => holidays.some(h =>
            iso >= h.startDate && iso <= h.endDate &&
            (h.scope==="all" ||
             (h.scope==="class"   && (!className || String(h.className)===String(className))) ||
             (h.scope==="section" && (!className || String(h.className)===String(className)) && (!section || h.section===section)))
        );
        const heatmap = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(curYear, curMonth, d);
            const dow     = dateObj.getDay();
            const iso     = toISO(dateObj);
            const dStr    = `${d}/${curMonth+1}/${curYear}`;
            const holiday = checkHoliday(iso);
            const weekend = dow === 0 || dow === 6;
            const data    = dayAttMap[dStr];
            heatmap.push({
                day: d, dow,
                value:   (holiday || weekend) ? null : (data?.t > 0 ? Math.round(data.p/data.t*100) : null),
                label:   `${MONTH_SHORT[curMonth]} ${d}`,
                holiday, weekend,
            });
        }

        // ── 15. Top students ─────────────────────────────────────────
        const topStudents = [...enriched]
            .sort((a,b) => b.attendance - a.attendance).slice(0,5)
            .map((s,i) => ({ rank:i+1, name:s.name, class:`${s.className}-${s.section}`, att:s.attendance }));

        // ── 16. Low attendance ───────────────────────────────────────
        const lowAttendance = enriched
            .filter(s => s.attendance < 75)
            .sort((a,b) => a.attendance - b.attendance).slice(0,10)
            .map(s => ({ name:s.name, class:`${s.className}-${s.section}`, attendance:s.attendance, status: s.attendance<60?"Critical":"Warning" }));

        // ── 17. Streak hall of fame ──────────────────────────────────
        const allDates = (await Attendance.find({session:sessionName}).distinct("date"));
        const schoolDays = allDates
            .map(d => parseDate(d)).filter(Boolean)
            .sort((a,b) => b-a);  // most recent first
        const regularStudents = enriched
            .filter(s => s.attendance >= 75)
            .map(s => {
                const set = new Set(s.dates);
                let streak = 0;
                for (const sd of schoolDays) {
                    const key = `${sd.getDate()}/${sd.getMonth()+1}/${sd.getFullYear()}`;
                    if (set.has(key)) streak++;
                    else break;
                }
                return { ...s, streak };
            })
            .sort((a,b) => b.streak - a.streak).slice(0,6)
            .map((s,i) => ({ name:s.name, class:`${s.className}-${s.section}`, streak:s.streak, badge: BADGES[i]||"⭐" }));

        // ── 18. At-risk prediction ───────────────────────────────────
        const defaulterPredictions = enriched
            .filter(s => s.attendance < 75)
            .sort((a,b) => a.attendance - b.attendance).slice(0,7)
            .map(s => ({
                name:       s.name,
                class:      `${s.className}-${s.section}`,
                risk:       Math.min(99, Math.round(100 - s.attendance)),
                attendance: s.attendance,
                trend:      s.attendance < 50 ? "↓↓" : s.attendance < 65 ? "↓" : "→",
            }));

        // ── 19. AI recognition stats ─────────────────────────────────
        const recognizedFaces    = allAttendance.filter(a => a.status==="Present" && a.attendanceImages?.length>0).length;
        const failedFaces        = allAttendance.filter(a => a.status==="Present" && (!a.attendanceImages || a.attendanceImages.length===0)).length;
        const totalProcessed     = recognizedFaces + failedFaces;
        const recognitionAcc     = totalProcessed > 0 ? Math.round(recognizedFaces/totalProcessed*1000)/10 : 0;
        const facesProcessedToday = todayRecs.filter(a => a.status==="Present" && a.attendanceImages?.length>0).length;

        // ── 20. Best class / section ─────────────────────────────────
        const bestClassEntry = classData.reduce((b,c) => (!b||c.attendance>b.attendance)?c:b, null);
        const secAttMap2 = {};
        attInMonth.forEach(a => {
            const k = `${a.className}-${a.section}`;
            if (!secAttMap2[k]) secAttMap2[k] = {p:0,t:0};
            secAttMap2[k].t++; if (a.status==="Present") secAttMap2[k].p++;
        });
        const bestSecEntry = Object.entries(secAttMap2)
            .map(([k,v]) => ({ label:k, pct: v.t>0 ? Math.round(v.p/v.t*100):0 }))
            .sort((a,b)=>b.pct-a.pct)[0];

        // ── 21. Auto-generated insights ──────────────────────────────
        const insights = [];
        if (trendData.length >= 2) {
            const last = trendData[trendData.length-1], prev = trendData[trendData.length-2];
            const diff = last.attendance - prev.attendance;
            if (diff < 0) insights.push({ icon:"📉", color:"#ef4444", text:`Attendance dropped ${Math.abs(diff)}% in ${last.month} vs ${prev.month}. ${bestClassEntry?`${bestClassEntry.class} still leads at ${bestClassEntry.attendance}%.`:""}` });
            else if (diff > 0) insights.push({ icon:"📈", color:"#22c55e", text:`Attendance improved ${diff}% in ${last.month} vs ${prev.month}. Great progress!` });
        }
        const critCount = lowAttendance.filter(s=>s.status==="Critical").length;
        if (critCount > 0) insights.push({ icon:"⚠️", color:"#f59e0b", text:`${critCount} student${critCount>1?"s are":" is"} critically below 60% attendance. Notify parents immediately.` });
        if (bestClassEntry?.attendance >= 90) insights.push({ icon:"🏆", color:"#22c55e", text:`${bestClassEntry.class} leads with ${bestClassEntry.attendance}% attendance — outstanding performance!` });
        if (todayTotal > 0) insights.push({ icon:"📋", color:"#3b82f6", text:`Today: ${todayPres}/${todayTotal} students present (${Math.round(todayPres/todayTotal*100)}%).` });
        if (recognitionAcc > 0) insights.push({ icon:"🤖", color:"#a855f7", text:`AI recognition accuracy: ${recognitionAcc}% across ${totalProcessed.toLocaleString()} processed faces.` });
        if (!insights.length) insights.push({ icon:"ℹ️", color:"#3b82f6", text:"Not enough data to generate insights yet. Mark attendance for more students." });

        // ── 22. Filter options ───────────────────────────────────────
        const availableClasses  = [...new Set(await User.find({session:sessionName}).distinct("className"))].sort((a,b)=>parseInt(a)-parseInt(b));
        const availableSections = [...new Set(await User.find({session:sessionName}).distinct("section"))].sort();

        // ── RESPONSE ─────────────────────────────────────────────────
        res.json({
            activeSession: { name: activeSession.sessionName, startDate: activeSession.startDate, endDate: activeSession.endDate },
            totalStudents: allStudents.length,
            avgAttendance,
            bestClass:        bestClassEntry?.class        || "—",
            bestClassScore:   bestClassEntry?.attendance   || 0,
            bestSection:      bestSecEntry?.label          || "—",
            bestSectionScore: bestSecEntry?.pct            || 0,
            recognitionAcc,
            trendData,
            weeklyData,
            classData,
            classRankingData,
            sectionDistData,
            distributionData,
            heatmap,
            heatmapLabel: `${MONTH_SHORT[curMonth]} ${curYear}`,
            topStudents,
            lowAttendance,
            regularStudents,
            defaulterPredictions,
            today: { date: todayStr, present: todayPres, absent: todayAbs, total: todayTotal, percentage: todayTotal>0 ? Math.round(todayPres/todayTotal*1000)/10 : 0, byClass: todayByClass },
            aiStats: { recognizedFaces, failedFaces, recognitionAcc, facesProcessedToday, totalAIProcessed: totalProcessed },
            insights,
            availableClasses,
            availableSections,
        });

    } catch (err) {
        console.error("Analytics Error:", err);
        res.status(500).json({ message: "Analytics Error", error: err.message });
    }
};

module.exports = { getAnalytics };