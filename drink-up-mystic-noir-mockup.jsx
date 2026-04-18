import { useState, useEffect, useRef } from "react";

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

function PhoneFrame({ children }) {
  return (
    <div
      style={{
        width: 375,
        height: 812,
        borderRadius: 44,
        background: DEEP,
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${GLASS_BORDER}`,
        boxShadow: `0 0 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.03)`,
        flexShrink: 0,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 150, height: 28, background: DEEP, borderRadius: "0 0 20px 20px", zIndex: 20 }} />
      <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 80, height: 6, background: "#222", borderRadius: 3, zIndex: 21 }} />
      {children}
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

function MessageBoardPage({ bar, drink, mood, onBack }) {
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

      {/* Bottom: compose + crew FAB */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 24px 36px", background: `linear-gradient(transparent, ${DEEP} 40%)`, zIndex: 3, display: "flex", gap: 12, alignItems: "center" }}>
        <button
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
        <div style={{ position: "relative" }}>
          <button
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
              animation: "breathe 3s ease-in-out infinite",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M17 8C17 5.24 14.76 3 12 3S7 5.24 7 8c0 3.53 5 9 5 9s5-5.47 5-9z" fill={DEEP} />
              <circle cx="12" cy="8" r="2" fill={GOLD} />
              <path d="M4 21c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke={DEEP} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          {crewCount > 0 && (
            <div style={{
              position: "absolute", top: -4, right: -4,
              minWidth: 20, height: 20, borderRadius: 10,
              background: VIOLET_SOLID, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: "#fff", fontWeight: 500,
              fontFamily: "'Noto Sans SC', sans-serif",
              border: `2px solid ${DEEP}`,
            }}>
              {crewCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [mood, setMood] = useState("");
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [selectedBar, setSelectedBar] = useState(null);

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", gap: 32, padding: "32px 16px", flexWrap: "wrap", fontFamily: "'Noto Sans SC', sans-serif" }}>
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

      {/* Screen labels */}
      <div style={{ width: "100%", textAlign: "center", marginBottom: -16 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          {["home", "recommend", "barlist", "board"].map((s) => (
            <button
              key={s}
              onClick={() => setScreen(s)}
              style={{
                background: screen === s ? SURFACE2 : "transparent",
                border: `0.5px solid ${screen === s ? GOLD_DIM : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8,
                padding: "6px 16px",
                fontSize: 12,
                color: screen === s ? GOLD : "rgba(255,255,255,0.4)",
                cursor: "pointer",
                fontFamily: "'Noto Sans SC', sans-serif",
              }}
            >
              {{ home: "首页", recommend: "推荐页", barlist: "酒吧列表", board: "留言板" }[s]}
            </button>
          ))}
        </div>
      </div>

      <PhoneFrame>
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
          />
        )}
      </PhoneFrame>
    </div>
  );
}
