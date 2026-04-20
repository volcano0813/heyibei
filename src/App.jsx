import { useState, useEffect, useRef } from "react";
import ChatRoomPreview from "./ChatRoomPreview.jsx";

const GOLD = "#C9A96E";
const GOLD_DIM = "rgba(201,169,110,0.35)";
const GOLD_GLOW = "rgba(201,169,110,0.12)";
const DEEP = "#0D0D1A";
const SURFACE = "#14142B";
const SURFACE2 = "#1A1A2E";
const SURFACE3 = "#242444";
const MUTED = "rgba(255,255,255,0.45)";
const SOFT = "rgba(255,255,255,0.7)";
const VIOLET = "rgba(139,92,246,0.5)";
const VIOLET_SOLID = "#7C5CDB";
const GLASS = "rgba(30,30,60,0.55)";
const GLASS_BORDER = "rgba(201,169,110,0.15)";

const placeholders = [
  "今晚的你，是什么颜色的？",
  "想喝点苦的、烈的、还是甜的？",
  "也可以直接说出一家店的名字",
];

const tarotCards = [
  {
    name: "Old Fashioned",
    tarot: "隐士 The Hermit",
    desc: "在独处中找到平静，琥珀色的沉默比任何言语都温柔。",
    price: "¥68",
    color: "#D4A574",
    symbol: "IX",
  },
  {
    name: "Negroni",
    tarot: "力量 Strength",
    desc: "苦与甜的角力，最终都化作你唇边那一抹从容。",
    price: "¥72",
    color: "#C2410C",
    symbol: "VIII",
  },
  {
    name: "Espresso Martini",
    tarot: "星星 The Star",
    desc: "黑夜里需要一颗不熄灭的星，咖啡因是你今晚的信仰。",
    price: "¥78",
    color: "#7C5CDB",
    symbol: "XVII",
  },
];

const bars = [
  { name: "FLASK Speakeasy", dist: "380m", price: "¥68", msgs: 7, crews: 2, img: "🥃" },
  { name: "The Alchemist", dist: "1.2km", price: "¥72", msgs: 3, crews: 1, img: "⚗️" },
  { name: "Moonlit Bar", dist: "2.1km", price: "¥65", msgs: 12, crews: 3, img: "🌙" },
];

const messages = [
  { id: 1, name: "路过的客人", anon: true, symbol: "☽", text: "这周第三次来了，这杯 Negroni 救我", drink: "Negroni", time: "2小时前", tarot: "力量" },
  { id: 2, name: "深海的鱼", anon: false, symbol: null, text: "有点累但不想睡，今晚的风很好", drink: "Old Fashioned", time: "3小时前", tarot: "隐士" },
  { id: 3, name: "路过的客人", anon: true, symbol: "✦", text: "第一次一个人来酒吧，比想象中自在", drink: null, time: "5小时前", tarot: null },
  { id: 4, name: "晚安巴黎", anon: false, symbol: null, text: "想被陌生人逗笑，结果自己先笑了", drink: "Espresso Martini", time: "6小时前", tarot: "星星" },
  { id: 5, name: "路过的客人", anon: true, symbol: "◇", text: "雨天配威士忌，谁定的规矩？但确实很配", drink: "Old Fashioned", time: "8小时前", tarot: "隐士" },
];

const defaultCrewsByBar = {
  "FLASK Speakeasy": [
    {
      id: "crew-flask-1",
      sortKey: 1,
      leaderLabel: "路过的客人",
      leaderAnon: true,
      leaderSymbol: "☽",
      timeLabel: "今晚 21:30",
      total: 4,
      filled: 2,
      genderRule: "不限",
      pitch: "想被陌生人逗笑，凑一桌慢慢喝。",
      drinkWant: "Negroni",
      aiMatch: true,
      members: [
        { anon: true, symbol: "☽" },
        { anon: false, name: "深海的鱼" },
      ],
    },
    {
      id: "crew-flask-2",
      sortKey: 2,
      leaderLabel: "阿树",
      leaderAnon: false,
      leaderSymbol: null,
      timeLabel: "今晚 23:00",
      total: 3,
      filled: 3,
      genderRule: "仅女",
      pitch: "周五放松局，聊什么都行。",
      drinkWant: "Old Fashioned",
      aiMatch: false,
      members: [
        { anon: false, name: "阿树" },
        { anon: true, symbol: "✦" },
        { anon: true, symbol: "◇" },
      ],
    },
    {
      id: "crew-flask-3",
      sortKey: 0,
      leaderLabel: "晚安巴黎",
      leaderAnon: false,
      leaderSymbol: null,
      timeLabel: "今晚 20:15",
      total: 5,
      filled: 1,
      genderRule: "不限",
      pitch: "加班后需要咖啡因与酒，星星局。",
      drinkWant: "Espresso Martini",
      aiMatch: true,
      members: [{ anon: false, name: "晚安巴黎" }],
    },
  ],
};

function getCrewsForBar(barName) {
  const source = defaultCrewsByBar[barName] || defaultCrewsByBar["FLASK Speakeasy"];
  return source.map((c) => ({
    ...c,
    members: (c.members || []).map((member) => ({ ...member })),
  }));
}

function buildChatMessages(crew, drinkName) {
  return [
    {
      id: `${crew.id}-chat-1`,
      sender: "system",
      text: `你已加入 ${crew.timeLabel} 的车队，人数达到 ${crew.filled}/${crew.total}，聊天已开启。`,
      time: "刚刚",
    },
    {
      id: `${crew.id}-chat-2`,
      sender: "other",
      name: crew.leaderAnon ? "路过的客人" : crew.leaderLabel,
      text: `终于凑到两个人了，先在这里碰个杯。${drinkName ? `今晚我想先点 ${drinkName}。` : ""}`,
      time: "刚刚",
      anon: crew.leaderAnon,
      symbol: crew.leaderSymbol || "☽",
    },
    {
      id: `${crew.id}-chat-3`,
      sender: "me",
      name: "我",
      text: "收到，我已经在路上了。到了以后我们认手里的那杯酒。",
      time: "刚刚",
    },
  ];
}

function getCrewChatState(crew) {
  return {
    crewId: crew.id,
    messages: buildChatMessages(crew, crew.drinkWant),
  };
}

function mapCrewMessagesToRoomFeed(messages = []) {
  return messages.map((msg) => {
    if (msg.sender === "system") {
      return {
        id: `room-${msg.id}`,
        type: "system_hint",
        text: msg.text,
        time: msg.time,
      };
    }

    return {
      id: `room-${msg.id}`,
      type: "message",
      side: msg.sender === "me" ? "right" : "left",
      name: msg.name || "路过的客人",
      text: msg.text,
      time: msg.time,
      avatarMode: msg.sender === "me" ? "me" : msg.anon ? "anonymous" : "named",
    };
  });
}

function getJoinStatusLabel(status, crew) {
  if (status === "approved") {
    return crew.filled >= 2 ? "进入聊天" : "已上车";
  }
  if (status === "pending") return "等待车主同意";
  if (crew.total - crew.filled <= 0) return "已满";
  return "申请上车";
}

function MemberAvatarStack({ members, maxVisible = 5 }) {
  const list = members || [];
  const shown = list.slice(0, maxVisible);
  const overflow = list.length - shown.length;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {shown.map((m, i) => (
        <div
          key={i}
          title={m.anon ? "路过的客人" : m.name}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            marginLeft: i === 0 ? 0 : -8,
            border: `2px solid ${DEEP}`,
            background: m.anon ? SURFACE3 : VIOLET_SOLID,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: m.anon ? 11 : 10,
            color: m.anon ? GOLD_DIM : "#fff",
            fontWeight: 500,
            fontFamily: m.anon ? "'Cormorant Garamond', serif" : "'Noto Sans SC', sans-serif",
            flexShrink: 0,
          }}
        >
          {m.anon ? m.symbol : (m.name && m.name[0]) || "?"}
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{
            marginLeft: -8,
            minWidth: 28,
            height: 28,
            borderRadius: "50%",
            border: `2px solid ${DEEP}`,
            background: SURFACE2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            color: MUTED,
            fontFamily: "'Noto Sans SC', sans-serif",
            padding: "0 6px",
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

function TarotLine({ color = GOLD, width = 120 }) {
  return (
    <svg width={width} height="2" style={{ display: "block", margin: "0 auto" }}>
      <line x1="0" y1="1" x2={width} y2="1" stroke={color} strokeWidth="0.5" strokeDasharray="1 4" />
    </svg>
  );
}

function TarotSymbol({ symbol, size = 28, color = GOLD }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="none" stroke={color} strokeWidth="0.5" />
      <text x="20" y="22" textAnchor="middle" dominantBaseline="central" fill={color} fontSize="13" fontFamily="'Cormorant Garamond', serif">{symbol}</text>
    </svg>
  );
}

function StarField() {
  const stars = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.2 + 0.3,
      delay: Math.random() * 4,
      dur: Math.random() * 3 + 2,
    }))
  );
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {stars.current.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: GOLD,
            opacity: 0,
            animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

function HomePage({ onSubmit }) {
  const [text, setText] = useState("");
  const [phIdx, setPhIdx] = useState(0);
  const [phVisible, setPhVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setPhVisible(false);
      setTimeout(() => {
        setPhIdx((p) => (p + 1) % placeholders.length);
        setPhVisible(true);
      }, 400);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <StarField />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 32px", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 12 }}>
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="22" fill="none" stroke={GOLD} strokeWidth="0.5" />
            <circle cx="24" cy="24" r="16" fill="none" stroke={GOLD_DIM} strokeWidth="0.5" />
            <text x="24" y="26" textAnchor="middle" dominantBaseline="central" fill={GOLD} fontSize="16" fontFamily="'Cormorant Garamond', serif">杯</text>
          </svg>
        </div>

        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: "#fff", letterSpacing: 6, marginBottom: 4 }}>
          喝一杯
        </h1>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 12, color: GOLD_DIM, letterSpacing: 4, marginBottom: 48, textTransform: "uppercase" }}>
          DRINK UP
        </p>

        <div
          style={{
            width: "100%",
            background: GLASS,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `0.5px solid ${GLASS_BORDER}`,
            borderRadius: 16,
            padding: "16px 20px",
            position: "relative",
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: 15,
              fontFamily: "'Noto Sans SC', sans-serif",
              lineHeight: 1.6,
              resize: "none",
              caretColor: GOLD,
            }}
          />
          {!text && (
            <div
              style={{
                position: "absolute",
                top: 16,
                left: 20,
                right: 20,
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 15,
                color: MUTED,
                pointerEvents: "none",
                opacity: phVisible ? 1 : 0,
                transition: "opacity 0.4s",
                lineHeight: 1.6,
              }}
            >
              {placeholders[phIdx]}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button
              onClick={() => text.trim() && onSubmit(text)}
              style={{
                background: text.trim() ? GOLD : "transparent",
                color: text.trim() ? DEEP : MUTED,
                border: `0.5px solid ${text.trim() ? GOLD : GLASS_BORDER}`,
                borderRadius: 24,
                padding: "8px 24px",
                fontSize: 13,
                fontFamily: "'Noto Sans SC', sans-serif",
                cursor: text.trim() ? "pointer" : "default",
                transition: "all 0.3s",
                letterSpacing: 1,
              }}
            >
              开始
            </button>
          </div>
        </div>

        <p style={{ fontSize: 11, color: MUTED, marginTop: 24, textAlign: "center", lineHeight: 1.8, fontFamily: "'Noto Sans SC', sans-serif" }}>
          聊聊心情 · 说出口味 · 或找一家店
        </p>
      </div>

      <div style={{ padding: "0 0 40px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <TarotLine width={60} />
      </div>
    </div>
  );
}

function RecommendPage({ mood, onSelect, onBack }) {
  const [revealed, setRevealed] = useState([false, false, false]);

  useEffect(() => {
    tarotCards.forEach((_, i) => {
      setTimeout(() => setRevealed((p) => { const n = [...p]; n[i] = true; return n; }), 300 + i * 250);
    });
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <StarField />
      <div style={{ padding: "52px 24px 12px", position: "relative", zIndex: 1 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: MUTED, fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 16 }}>‹</span> 重新输入
        </button>
      </div>
      <div style={{ padding: "0 24px 8px", position: "relative", zIndex: 1 }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: GOLD_DIM, letterSpacing: 2, marginBottom: 4 }}>YOUR READING</p>
        <p style={{ fontSize: 14, color: SOFT, fontFamily: "'Noto Sans SC', sans-serif", lineHeight: 1.6 }}>
          "{mood}"
        </p>
        <TarotLine width={200} />
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "8px 24px 32px", position: "relative", zIndex: 1 }}>
        {tarotCards.map((card, i) => (
          <div
            key={i}
            onClick={() => onSelect(card)}
            style={{
              background: GLASS,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: `0.5px solid ${GLASS_BORDER}`,
              borderRadius: 16,
              padding: "20px",
              marginBottom: 16,
              cursor: "pointer",
              opacity: revealed[i] ? 1 : 0,
              transform: revealed[i] ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 12, right: 16, fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "rgba(201,169,110,0.08)", fontWeight: 300 }}>{card.symbol}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, color: card.color, letterSpacing: 2, marginBottom: 4, textTransform: "uppercase" }}>{card.tarot}</p>
                <p style={{ fontSize: 18, color: "#fff", fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500 }}>{card.name}</p>
              </div>
              <TarotSymbol symbol={card.symbol} size={36} color={card.color} />
            </div>
            <p style={{ fontSize: 13, color: MUTED, fontFamily: "'Noto Sans SC', sans-serif", lineHeight: 1.8, marginBottom: 12 }}>{card.desc}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: GOLD_DIM, fontFamily: "'Cormorant Garamond', serif", letterSpacing: 1 }}>查看附近的店 →</span>
              <span style={{ fontSize: 15, color: card.color, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500 }}>{card.price} 起</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarListPage({ drink, onSelect, onBack }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <StarField />
      <div style={{ padding: "52px 24px 12px", position: "relative", zIndex: 1 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: MUTED, fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 16 }}>‹</span> 换一杯
        </button>
      </div>
      <div style={{ padding: "0 24px 16px", position: "relative", zIndex: 1 }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: GOLD_DIM, letterSpacing: 2, marginBottom: 4 }}>NEARBY</p>
        <p style={{ fontSize: 16, color: "#fff", fontFamily: "'Noto Sans SC', sans-serif" }}>
          供应 {drink.name} 的店
        </p>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "0 24px 32px", position: "relative", zIndex: 1 }}>
        {bars.map((bar, i) => (
          <div
            key={i}
            onClick={() => onSelect(bar)}
            style={{
              background: GLASS,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: `0.5px solid ${GLASS_BORDER}`,
              borderRadius: 16,
              padding: "16px 20px",
              marginBottom: 12,
              cursor: "pointer",
              display: "flex",
              gap: 16,
              alignItems: "center",
              opacity: 0,
              animation: `fadeSlideUp 0.5s ${i * 0.12}s forwards`,
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 12, background: SURFACE2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
              {bar.img}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15, color: "#fff", fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, marginBottom: 4 }}>{bar.name}</p>
              <div style={{ display: "flex", gap: 12, fontSize: 12, color: MUTED, fontFamily: "'Noto Sans SC', sans-serif" }}>
                <span>{bar.dist}</span>
                <span>·</span>
                <span>{bar.msgs} 条留言</span>
                {bar.crews > 0 && <><span>·</span><span style={{ color: VIOLET_SOLID }}>{bar.crews} 辆车</span></>}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: 16, color: GOLD, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500 }}>{bar.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageBoardPage({ bar, drink, mood, onBack, onGoToCrew }) {
  const [showCompose, setShowCompose] = useState(false);
  const [draft, setDraft] = useState(mood || "");
  const [attachDrink, setAttachDrink] = useState(true);
  const [identity, setIdentity] = useState("anon");
  const [localMsgs, setLocalMsgs] = useState(messages);
  const [crewCount] = useState(bar?.crews || 2);

  const handlePublish = () => {
    const newMsg = {
      id: Date.now(),
      name: identity === "anon" ? "路过的客人" : "我",
      anon: identity === "anon",
      symbol: identity === "anon" ? "✧" : null,
      text: draft,
      drink: attachDrink ? drink?.name : null,
      time: "刚刚",
      tarot: drink?.tarot?.split(" ")[0],
    };
    setLocalMsgs([newMsg, ...localMsgs]);
    setShowCompose(false);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <StarField />
      {/* Header */}
      <div style={{ padding: "52px 24px 0", position: "relative", zIndex: 2 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: MUTED, fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>‹</span> 返回
        </button>
      </div>

      {/* Bar info (collapsible) */}
      <div style={{ padding: "0 24px 16px", position: "relative", zIndex: 2, borderBottom: `0.5px solid ${GLASS_BORDER}` }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: SURFACE2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
            {bar?.img || "🥃"}
          </div>
          <div>
            <p style={{ fontSize: 16, color: "#fff", fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500 }}>{bar?.name || "FLASK Speakeasy"}</p>
            <p style={{ fontSize: 12, color: MUTED, fontFamily: "'Noto Sans SC', sans-serif" }}>
              {bar?.dist || "380m"} · 营业至 02:00
            </p>
          </div>
          <button style={{ marginLeft: "auto", background: "transparent", border: `0.5px solid ${GOLD_DIM}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, color: GOLD, fontFamily: "'Noto Sans SC', sans-serif", cursor: "pointer" }}>
            导航
          </button>
        </div>
      </div>

      {/* Message board */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px 24px 100px", position: "relative", zIndex: 1 }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, color: GOLD_DIM, letterSpacing: 2, marginBottom: 16 }}>24H MESSAGES</p>

        {localMsgs.map((msg, i) => (
          <div
            key={msg.id}
            style={{
              background: GLASS,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: `0.5px solid ${GLASS_BORDER}`,
              borderRadius: 14,
              padding: "14px 16px",
              marginBottom: 10,
              opacity: 0,
              animation: `fadeSlideUp 0.4s ${i * 0.06}s forwards`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {msg.anon ? (
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: SURFACE3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: GOLD_DIM }}>{msg.symbol}</div>
                ) : (
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: VIOLET_SOLID, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 500 }}>{msg.name[0]}</div>
                )}
                <span style={{ fontSize: 13, color: msg.anon ? MUTED : SOFT, fontFamily: "'Noto Sans SC', sans-serif" }}>{msg.name}</span>
                {msg.tarot && (
                  <span style={{ fontSize: 10, color: GOLD_DIM, fontFamily: "'Cormorant Garamond', serif", border: `0.5px solid ${GLASS_BORDER}`, borderRadius: 4, padding: "1px 6px" }}>
                    由{msg.tarot}而来
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, color: MUTED, fontFamily: "'Noto Sans SC', sans-serif" }}>{msg.time}</span>
            </div>
            <p style={{ fontSize: 14, color: "#fff", fontFamily: "'Noto Sans SC', sans-serif", lineHeight: 1.7, margin: 0 }}>{msg.text}</p>
            {msg.drink && (
              <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
                <span style={{ fontSize: 11, color: GOLD, fontFamily: "'Noto Sans SC', sans-serif", background: GOLD_GLOW, borderRadius: 20, padding: "3px 10px", border: `0.5px solid ${GOLD_DIM}` }}>
                  🥃 {msg.drink}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Compose overlay */}
      {showCompose && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 10, display: "flex", alignItems: "flex-end" }}>
          <div
            style={{
              width: "100%",
              background: SURFACE,
              borderRadius: "20px 20px 0 0",
              padding: "24px",
              border: `0.5px solid ${GLASS_BORDER}`,
              borderBottom: "none",
              animation: "slideUp 0.3s ease-out",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: GOLD, letterSpacing: 1 }}>LEAVE A MESSAGE</p>
              <button onClick={() => setShowCompose(false)} style={{ background: "none", border: "none", color: MUTED, fontSize: 18, cursor: "pointer" }}>×</button>
            </div>

            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                background: SURFACE2,
                border: `0.5px solid ${GLASS_BORDER}`,
                borderRadius: 12,
                padding: "12px 16px",
                color: "#fff",
                fontSize: 14,
                fontFamily: "'Noto Sans SC', sans-serif",
                lineHeight: 1.6,
                resize: "none",
                outline: "none",
                caretColor: GOLD,
                marginBottom: 12,
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              {drink && (
                <div
                  onClick={() => setAttachDrink(!attachDrink)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                    opacity: attachDrink ? 1 : 0.4, transition: "opacity 0.2s",
                    fontSize: 12, color: GOLD, fontFamily: "'Noto Sans SC', sans-serif",
                    background: GOLD_GLOW, borderRadius: 20, padding: "4px 12px",
                    border: `0.5px solid ${attachDrink ? GOLD_DIM : "transparent"}`,
                  }}
                >
                  🥃 {drink.name} {attachDrink ? "" : "(已取消)"}
                  {attachDrink && <span style={{ fontSize: 14, marginLeft: 4 }}>×</span>}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {["anon", "nick"].map((id) => (
                <button
                  key={id}
                  onClick={() => setIdentity(id)}
                  style={{
                    flex: 1,
                    background: identity === id ? SURFACE3 : "transparent",
                    border: `0.5px solid ${identity === id ? GOLD_DIM : GLASS_BORDER}`,
                    borderRadius: 10,
                    padding: "8px 0",
                    fontSize: 13,
                    color: identity === id ? GOLD : MUTED,
                    fontFamily: "'Noto Sans SC', sans-serif",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {id === "anon" ? "匿名发布" : "昵称发布"}
                </button>
              ))}
            </div>

            <button
              onClick={handlePublish}
              disabled={!draft.trim()}
              style={{
                width: "100%",
                background: draft.trim() ? GOLD : SURFACE3,
                color: draft.trim() ? DEEP : MUTED,
                border: "none",
                borderRadius: 12,
                padding: "14px 0",
                fontSize: 15,
                fontFamily: "'Noto Sans SC', sans-serif",
                fontWeight: 500,
                cursor: draft.trim() ? "pointer" : "default",
                transition: "all 0.3s",
              }}
            >
              确认发布
            </button>
          </div>
        </div>
      )}

      {/* Bottom: 留言条 + 留言板 FAB + 车队 FAB */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 24px 36px", background: `linear-gradient(transparent, ${DEEP} 40%)`, zIndex: 3, display: "flex", gap: 10, alignItems: "center" }}>
        <button
          type="button"
          onClick={() => setShowCompose(true)}
          style={{
            flex: 1,
            background: GLASS,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `0.5px solid ${GLASS_BORDER}`,
            borderRadius: 24,
            padding: "12px 20px",
            textAlign: "left",
            fontSize: 14,
            color: MUTED,
            fontFamily: "'Noto Sans SC', sans-serif",
            cursor: "pointer",
          }}
        >
          留下一句话...
        </button>
        <button
          type="button"
          onClick={() => setShowCompose(true)}
          aria-label="写留言"
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: GOLD,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 20px ${GOLD_DIM}`,
            flexShrink: 0,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 4h16v12H7l-3 3V4z" stroke={DEEP} strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M8 9h8M8 12.5h5" stroke={DEEP} strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            type="button"
            onClick={onGoToCrew}
            aria-label="车队"
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: VIOLET_SOLID,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 18px ${VIOLET}`,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="9" cy="10" r="3" stroke="#fff" strokeWidth="1.3" />
              <circle cx="16" cy="9" r="2.5" stroke="#fff" strokeWidth="1.3" />
              <path d="M4 19c0-2.5 2.5-4.5 5-4.5s3 1 4 2" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M14 16c1.2 1 2.8 2 4 2 1.2 0 2-.3 2.8-.8" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
          {crewCount > 0 && (
            <div
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                background: GOLD,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: DEEP,
                fontWeight: 600,
                fontFamily: "'Noto Sans SC', sans-serif",
                border: `2px solid ${DEEP}`,
              }}
            >
              {crewCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CrewPage({ bar, drink, mood, crews, myJoinStatuses, onBack, onCreateCrew, onJoinCrew, onEnterChat }) {
  const barName = bar?.name || "FLASK Speakeasy";
  const [showCreate, setShowCreate] = useState(false);
  const [timeInput, setTimeInput] = useState("今晚 22:00");
  const [totalSeats, setTotalSeats] = useState(4);
  const [genderRule, setGenderRule] = useState("不限");
  const [pitch, setPitch] = useState(mood || "");
  const [wantDrink, setWantDrink] = useState(drink?.name || "");
  const [aiMatch, setAiMatch] = useState(true);

  const openCreate = () => {
    setPitch(mood || "");
    setWantDrink(drink?.name || "");
    setAiMatch(true);
    setShowCreate(true);
  };

  const handleCreateCrew = () => {
    const newCrew = {
      id: `crew-${Date.now()}`,
      sortKey: crews.length ? Math.min(...crews.map((c) => c.sortKey)) - 1 : 0,
      leaderLabel: "我",
      leaderAnon: false,
      leaderSymbol: null,
      timeLabel: timeInput.trim() || "时间待定",
      total: Math.max(2, totalSeats),
      filled: 1,
      genderRule,
      pitch: pitch.trim() || "一起喝一杯。",
      drinkWant: wantDrink.trim() || drink?.name || "店内特调",
      aiMatch,
      members: [{ anon: false, name: "我" }],
    };
    onCreateCrew(newCrew);
    setShowCreate(false);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <StarField />
      <div style={{ padding: "52px 24px 12px", position: "relative", zIndex: 2 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: MUTED,
            fontSize: 13,
            fontFamily: "'Noto Sans SC', sans-serif",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 16 }}>‹</span> 返回留言板
        </button>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: GOLD_DIM, letterSpacing: 2, marginBottom: 4 }}>CREWS</p>
        <p style={{ fontSize: 18, color: "#fff", fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500 }}>{barName}</p>
        <TarotLine width={180} />
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "8px 24px 120px", position: "relative", zIndex: 1 }}>
        {crews.map((c, i) => (
          (() => {
            const joinStatus = myJoinStatuses[c.id] || (c.leaderLabel === "我" ? "approved" : "none");
            const canEnterChat = joinStatus === "approved" && c.filled >= 2;
            const isPending = joinStatus === "pending";
            const isApproved = joinStatus === "approved";
            const isFull = c.total - c.filled <= 0;
            const actionLabel = getJoinStatusLabel(joinStatus, c);
            const helperText = isPending
              ? "已提交申请，等车主点头后你才会正式上车。"
              : isApproved
                ? canEnterChat
                  ? "车主已同意，你现在可以和同车的人聊天。"
                  : "车主已同意，等车队凑满两人后自动开放聊天。"
                : isFull
                  ? "这辆车已经满员了。"
                  : "先申请，车主同意后才能进入聊天。";

            return (
          <div
            key={c.id}
            style={{
              background: GLASS,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: `0.5px solid ${GLASS_BORDER}`,
              borderRadius: 16,
              padding: "16px 16px 14px",
              marginBottom: 12,
              opacity: 0,
              animation: `fadeSlideUp 0.45s ${i * 0.08}s forwards`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, color: GOLD_DIM, fontFamily: "'Cormorant Garamond', serif", letterSpacing: 1, marginBottom: 4 }}>
                  {c.timeLabel}
                  <span style={{ marginLeft: 8, color: MUTED, fontFamily: "'Noto Sans SC', sans-serif", letterSpacing: 0 }}>
                    余 {Math.max(0, c.total - c.filled)}/{c.total} 席 · {c.genderRule}
                  </span>
                </p>
                <p style={{ fontSize: 15, color: "#fff", fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, marginBottom: 6 }}>
                  发起人 ·{" "}
                  {c.leaderAnon ? (
                    <span style={{ color: MUTED }}>路过的客人</span>
                  ) : (
                    c.leaderLabel
                  )}
                  {c.leaderAnon && c.leaderSymbol && (
                    <span style={{ marginLeft: 6, fontFamily: "'Cormorant Garamond', serif", color: GOLD_DIM }}>{c.leaderSymbol}</span>
                  )}
                </p>
                <p style={{ fontSize: 13, color: MUTED, fontFamily: "'Noto Sans SC', sans-serif", lineHeight: 1.7, marginBottom: 8 }}>{c.pitch}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: GOLD, fontFamily: "'Noto Sans SC', sans-serif", background: GOLD_GLOW, borderRadius: 20, padding: "3px 10px", border: `0.5px solid ${GOLD_DIM}` }}>
                    🥃 {c.drinkWant}
                  </span>
                  {isPending && (
                    <span style={{ fontSize: 10, color: GOLD, border: `0.5px solid ${GOLD_DIM}`, borderRadius: 20, padding: "2px 8px", fontFamily: "'Noto Sans SC', sans-serif" }}>
                      待车主确认
                    </span>
                  )}
                  {isApproved && c.leaderLabel !== "我" && (
                    <span style={{ fontSize: 10, color: "#CFE8D7", border: "0.5px solid rgba(132, 204, 156, 0.35)", borderRadius: 20, padding: "2px 8px", fontFamily: "'Noto Sans SC', sans-serif" }}>
                      已获同意
                    </span>
                  )}
                  {c.aiMatch && (
                    <span style={{ fontSize: 10, color: VIOLET_SOLID, border: `0.5px solid ${VIOLET}`, borderRadius: 20, padding: "2px 8px", fontFamily: "'Noto Sans SC', sans-serif" }}>
                      AI 匹配
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: MUTED, fontFamily: "'Noto Sans SC', sans-serif", lineHeight: 1.6, marginTop: 10 }}>
                  {helperText}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 12, paddingTop: 10, borderTop: `0.5px solid ${GLASS_BORDER}` }}>
              <MemberAvatarStack members={c.members} />
              <button
                type="button"
                onClick={() => {
                  if (canEnterChat) {
                    onEnterChat(c);
                    return;
                  }
                  if (!isPending && !isApproved && !isFull) {
                    onJoinCrew(c);
                  }
                }}
                style={{
                  background: isPending || (isFull && !isApproved) ? SURFACE3 : "transparent",
                  border: `0.5px solid ${isPending || (isFull && !isApproved) ? GLASS_BORDER : GOLD_DIM}`,
                  borderRadius: 20,
                  padding: "8px 16px",
                  fontSize: 13,
                  color: isPending || (isFull && !isApproved) ? MUTED : GOLD,
                  fontFamily: "'Noto Sans SC', sans-serif",
                  cursor: canEnterChat || (!isPending && !isApproved && !isFull) ? "pointer" : "default",
                  flexShrink: 0,
                }}
                disabled={!canEnterChat && (isPending || isApproved || isFull)}
              >
                {actionLabel}
              </button>
            </div>
          </div>
            );
          })()
        ))}
      </div>

      <button
        type="button"
        onClick={openCreate}
        aria-label="发车"
        style={{
          position: "absolute",
          right: 24,
          bottom: 36,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: GOLD,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 24px ${GOLD_DIM}`,
          zIndex: 4,
        }}
      >
        <span style={{ fontSize: 28, color: DEEP, fontWeight: 300, lineHeight: 1 }}>+</span>
      </button>

      {showCreate && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 10, display: "flex", alignItems: "flex-end" }}>
          <div
            style={{
              width: "100%",
              maxHeight: "88%",
              overflow: "auto",
              background: SURFACE,
              borderRadius: "20px 20px 0 0",
              padding: "24px",
              border: `0.5px solid ${GLASS_BORDER}`,
              borderBottom: "none",
              animation: "slideUp 0.3s ease-out",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: GOLD, letterSpacing: 1 }}>发起车队</p>
              <button type="button" onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", color: MUTED, fontSize: 18, cursor: "pointer" }}>
                ×
              </button>
            </div>

            <label style={{ display: "block", fontSize: 12, color: MUTED, marginBottom: 6, fontFamily: "'Noto Sans SC', sans-serif" }}>集合时间</label>
            <input
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              style={{
                width: "100%",
                background: SURFACE2,
                border: `0.5px solid ${GLASS_BORDER}`,
                borderRadius: 12,
                padding: "12px 14px",
                color: "#fff",
                fontSize: 14,
                marginBottom: 14,
                outline: "none",
                fontFamily: "'Noto Sans SC', sans-serif",
              }}
            />

            <label style={{ display: "block", fontSize: 12, color: MUTED, marginBottom: 6, fontFamily: "'Noto Sans SC', sans-serif" }}>总人数（含自己）</label>
            <input
              type="number"
              min={2}
              max={20}
              value={totalSeats}
              onChange={(e) => setTotalSeats(Number(e.target.value) || 2)}
              style={{
                width: "100%",
                background: SURFACE2,
                border: `0.5px solid ${GLASS_BORDER}`,
                borderRadius: 12,
                padding: "12px 14px",
                color: "#fff",
                fontSize: 14,
                marginBottom: 14,
                outline: "none",
                fontFamily: "'Noto Sans SC', sans-serif",
              }}
            />

            <label style={{ display: "block", fontSize: 12, color: MUTED, marginBottom: 6, fontFamily: "'Noto Sans SC', sans-serif" }}>性别约束</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {["不限", "仅男", "仅女"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenderRule(g)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: `0.5px solid ${genderRule === g ? GOLD_DIM : GLASS_BORDER}`,
                    background: genderRule === g ? SURFACE3 : "transparent",
                    color: genderRule === g ? GOLD : MUTED,
                    fontSize: 13,
                    fontFamily: "'Noto Sans SC', sans-serif",
                    cursor: "pointer",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>

            <label style={{ display: "block", fontSize: 12, color: MUTED, marginBottom: 6, fontFamily: "'Noto Sans SC', sans-serif" }}>招募语</label>
            <textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              rows={2}
              style={{
                width: "100%",
                background: SURFACE2,
                border: `0.5px solid ${GLASS_BORDER}`,
                borderRadius: 12,
                padding: "12px 14px",
                color: "#fff",
                fontSize: 14,
                marginBottom: 14,
                resize: "none",
                outline: "none",
                fontFamily: "'Noto Sans SC', sans-serif",
                lineHeight: 1.6,
              }}
            />

            <label style={{ display: "block", fontSize: 12, color: MUTED, marginBottom: 6, fontFamily: "'Noto Sans SC', sans-serif" }}>想喝什么</label>
            <input
              value={wantDrink}
              onChange={(e) => setWantDrink(e.target.value)}
              style={{
                width: "100%",
                background: SURFACE2,
                border: `0.5px solid ${GLASS_BORDER}`,
                borderRadius: 12,
                padding: "12px 14px",
                color: "#fff",
                fontSize: 14,
                marginBottom: 16,
                outline: "none",
                fontFamily: "'Noto Sans SC', sans-serif",
              }}
            />

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
                cursor: "pointer",
                fontSize: 14,
                color: SOFT,
                fontFamily: "'Noto Sans SC', sans-serif",
              }}
            >
              <input type="checkbox" checked={aiMatch} onChange={(e) => setAiMatch(e.target.checked)} style={{ width: 18, height: 18, accentColor: VIOLET_SOLID }} />
              开启 AI 匹配（Agent 私邀合适的人）
            </label>

            <button
              type="button"
              onClick={handleCreateCrew}
              style={{
                width: "100%",
                background: GOLD,
                color: DEEP,
                border: "none",
                borderRadius: 12,
                padding: "14px 0",
                fontSize: 15,
                fontFamily: "'Noto Sans SC', sans-serif",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              发起车队
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatPage({ bar, crew, chatState, onBack }) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(chatState?.messages || []);

  useEffect(() => {
    setMessages(chatState?.messages || []);
  }, [chatState]);

  const handleSend = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `chat-${Date.now()}`,
        sender: "me",
        name: "我",
        text: draft.trim(),
        time: "刚刚",
      },
    ]);
    setDraft("");
  };

  const otherMembers = (crew?.members || []).filter((member) => member.name !== "我");

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <StarField />
      <div style={{ padding: "52px 24px 14px", position: "relative", zIndex: 2, borderBottom: `0.5px solid ${GLASS_BORDER}` }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: MUTED,
            fontSize: 13,
            fontFamily: "'Noto Sans SC', sans-serif",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 16 }}>‹</span> 返回车队
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "linear-gradient(135deg, rgba(201,169,110,0.18), rgba(124,92,219,0.22))",
              border: `0.5px solid ${GLASS_BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: GOLD,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 18,
            }}
          >
            聊
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 12, color: GOLD_DIM, letterSpacing: 2, marginBottom: 4 }}>
              CREW CHAT
            </p>
            <p style={{ fontSize: 16, color: "#fff", fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500 }}>
              {bar?.name || "FLASK Speakeasy"} · {crew?.timeLabel || "今晚"}
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            background: GLASS,
            border: `0.5px solid ${GLASS_BORDER}`,
            borderRadius: 16,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, color: SOFT, fontFamily: "'Noto Sans SC', sans-serif", marginBottom: 4 }}>
              已上车 {crew?.filled || 0}/{crew?.total || 0}
            </p>
            <p style={{ fontSize: 12, color: MUTED, fontFamily: "'Noto Sans SC', sans-serif", lineHeight: 1.6 }}>
              {crew?.pitch || "一起喝一杯。"}
            </p>
          </div>
          <MemberAvatarStack members={crew?.members || []} />
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 24px 110px", position: "relative", zIndex: 1 }}>
        {messages.map((msg, index) => {
          if (msg.sender === "system") {
            return (
              <div key={msg.id} style={{ display: "flex", justifyContent: "center", marginBottom: 14, opacity: 0, animation: `fadeSlideUp 0.4s ${index * 0.05}s forwards` }}>
                <div
                  style={{
                    fontSize: 11,
                    color: GOLD_DIM,
                    fontFamily: "'Noto Sans SC', sans-serif",
                    background: "rgba(201,169,110,0.08)",
                    border: `0.5px solid ${GLASS_BORDER}`,
                    borderRadius: 999,
                    padding: "6px 12px",
                    textAlign: "center",
                    maxWidth: "100%",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          }

          const mine = msg.sender === "me";
          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: mine ? "flex-end" : "flex-start",
                marginBottom: 12,
                opacity: 0,
                animation: `fadeSlideUp 0.4s ${index * 0.05}s forwards`,
              }}
            >
              <div style={{ maxWidth: "82%" }}>
                {!mine && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, paddingLeft: 4 }}>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: msg.anon ? SURFACE3 : VIOLET_SOLID,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        color: msg.anon ? GOLD_DIM : "#fff",
                        fontFamily: msg.anon ? "'Cormorant Garamond', serif" : "'Noto Sans SC', sans-serif",
                      }}
                    >
                      {msg.anon ? msg.symbol : (msg.name && msg.name[0]) || "?"}
                    </div>
                    <span style={{ fontSize: 12, color: MUTED, fontFamily: "'Noto Sans SC', sans-serif" }}>{msg.name}</span>
                  </div>
                )}
                <div
                  style={{
                    background: mine ? "linear-gradient(135deg, rgba(201,169,110,0.95), rgba(231,201,147,0.88))" : GLASS,
                    color: mine ? DEEP : "#fff",
                    border: `0.5px solid ${mine ? "transparent" : GLASS_BORDER}`,
                    borderRadius: mine ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
                    padding: "12px 14px",
                    boxShadow: mine ? `0 10px 26px rgba(201,169,110,0.18)` : "none",
                    backdropFilter: mine ? "none" : "blur(12px)",
                    WebkitBackdropFilter: mine ? "none" : "blur(12px)",
                  }}
                >
                  <p style={{ fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif", lineHeight: 1.7, margin: 0 }}>{msg.text}</p>
                </div>
                <p
                  style={{
                    fontSize: 10,
                    color: MUTED,
                    fontFamily: "'Noto Sans SC', sans-serif",
                    marginTop: 6,
                    textAlign: mine ? "right" : "left",
                    padding: "0 4px",
                  }}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 24px 34px",
          background: `linear-gradient(transparent, ${DEEP} 34%)`,
          zIndex: 3,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            background: GLASS,
            border: `0.5px solid ${GLASS_BORDER}`,
            borderRadius: 22,
            padding: "10px 10px 10px 16px",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, color: GOLD_DIM, fontFamily: "'Cormorant Garamond', serif", letterSpacing: 1, marginBottom: 4 }}>
              今晚同行的人
            </p>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={otherMembers.length ? `和 ${otherMembers.length} 位同车人打个招呼` : "说点什么"}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: 14,
                fontFamily: "'Noto Sans SC', sans-serif",
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim()}
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: draft.trim() ? GOLD : SURFACE3,
              color: draft.trim() ? DEEP : MUTED,
              border: "none",
              cursor: draft.trim() ? "pointer" : "default",
              fontSize: 13,
              fontFamily: "'Noto Sans SC', sans-serif",
              flexShrink: 0,
            }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  if (typeof window !== "undefined" && window.location.pathname === "/preview/chat-room") {
    return <ChatRoomPreview />;
  }

  const [screen, setScreen] = useState("home");
  const [mood, setMood] = useState("");
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [selectedBar, setSelectedBar] = useState(null);
  const [crewsByBar, setCrewsByBar] = useState(() => {
    const seed = {};
    Object.keys(defaultCrewsByBar).forEach((barName) => {
      seed[barName] = getCrewsForBar(barName).sort((a, b) => a.sortKey - b.sortKey);
    });
    return seed;
  });
  const [activeCrewId, setActiveCrewId] = useState(null);
  const [chatByCrewId, setChatByCrewId] = useState({});
  const [myJoinStatuses, setMyJoinStatuses] = useState({});

  const selectedBarName = selectedBar?.name || "FLASK Speakeasy";
  const currentCrews = crewsByBar[selectedBarName] || getCrewsForBar(selectedBarName).sort((a, b) => a.sortKey - b.sortKey);
  const activeCrew = currentCrews.find((crew) => crew.id === activeCrewId) || null;
  const activeRoomInfo = activeCrew
    ? {
        title: `${activeCrew.drinkWant || selectedDrink?.name || "今晚"}慢喝局`,
        bar: selectedBar?.name || bars[0].name,
        time: activeCrew.timeLabel || "今晚 20:30",
        headCount: `${activeCrew.filled}/${activeCrew.total} 人`,
      }
    : null;
  const activeRoomIntro = activeCrew
    ? mapCrewMessagesToRoomFeed((chatByCrewId[activeCrew.id] || getCrewChatState(activeCrew)).messages)
    : [];

  const updateBarCrews = (barName, updater) => {
    setCrewsByBar((prev) => {
      const current = prev[barName] || getCrewsForBar(barName).sort((a, b) => a.sortKey - b.sortKey);
      return {
        ...prev,
        [barName]: updater(current),
      };
    });
  };

  const ensureCrewChat = (crew) => {
    setChatByCrewId((prev) => {
      if (prev[crew.id]) return prev;
      return { ...prev, [crew.id]: getCrewChatState(crew) };
    });
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        height: "100%",
        background: DEEP,
        fontFamily: "'Noto Sans SC', sans-serif",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500&family=Noto+Sans+SC:wght@300;400;500&display=swap');
        @keyframes twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.6; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes breathe {
          0%, 100% { box-shadow: 0 0 20px rgba(201,169,110,0.25); }
          50% { box-shadow: 0 0 30px rgba(201,169,110,0.45); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea::-webkit-scrollbar { display: none; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        {screen === "home" && (
          <HomePage
            onSubmit={(text) => {
              setMood(text);
              setScreen("recommend");
            }}
          />
        )}
        {screen === "recommend" && (
          <RecommendPage
            mood={mood || "有点累但不想睡"}
            onSelect={(drink) => {
              setSelectedDrink(drink);
              setScreen("barlist");
            }}
            onBack={() => setScreen("home")}
          />
        )}
        {screen === "barlist" && (
          <BarListPage
            drink={selectedDrink || tarotCards[0]}
            onSelect={(bar) => {
              setSelectedBar(bar);
              setScreen("board");
            }}
            onBack={() => setScreen("recommend")}
          />
        )}
        {screen === "board" && (
          <MessageBoardPage
            bar={selectedBar || bars[0]}
            drink={selectedDrink || tarotCards[0]}
            mood={mood || "有点累但不想睡"}
            onBack={() => setScreen("barlist")}
            onGoToCrew={() => setScreen("crew")}
          />
        )}
        {screen === "crew" && (
          <CrewPage
            bar={selectedBar || bars[0]}
            drink={selectedDrink || tarotCards[0]}
            mood={mood || "有点累但不想睡"}
            crews={currentCrews}
            myJoinStatuses={myJoinStatuses}
            onBack={() => setScreen("board")}
            onCreateCrew={(newCrew) => {
              updateBarCrews(selectedBarName, (existing) => [newCrew, ...existing].sort((a, b) => a.sortKey - b.sortKey));
              setMyJoinStatuses((prev) => ({ ...prev, [newCrew.id]: "approved" }));
            }}
            onJoinCrew={(crew) => {
              setMyJoinStatuses((prev) => ({ ...prev, [crew.id]: "pending" }));

              window.setTimeout(() => {
                let approvedCrew = null;
                setMyJoinStatuses((prev) => {
                  if (prev[crew.id] !== "pending") return prev;
                  return { ...prev, [crew.id]: "approved" };
                });
                updateBarCrews(selectedBarName, (existing) =>
                  existing.map((item) => {
                    if (item.id !== crew.id || item.total - item.filled <= 0) return item;
                    const hasMe = (item.members || []).some((member) => member.name === "我");
                    approvedCrew = {
                      ...item,
                      filled: hasMe ? item.filled : Math.min(item.total, item.filled + 1),
                      members: hasMe ? item.members : [...(item.members || []), { anon: false, name: "我" }],
                    };
                    return approvedCrew;
                  })
                );
                if (approvedCrew && approvedCrew.filled >= 2) {
                  setActiveCrewId(approvedCrew.id);
                  ensureCrewChat(approvedCrew);
                  setScreen("chat");
                }
              }, 1800);
            }}
            onEnterChat={(crew) => {
              setActiveCrewId(crew.id);
              ensureCrewChat(crew);
              setScreen("chat");
            }}
          />
        )}
        {screen === "chat" && (
          <ChatRoomPreview
            initialStage="grouped"
            roomInfo={activeRoomInfo || undefined}
            introMessages={activeRoomIntro}
            onBack={() => setScreen("crew")}
            allowStageSwitcher={false}
          />
        )}
      </div>
    </div>
  );
}
