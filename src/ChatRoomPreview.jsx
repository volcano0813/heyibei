import { useEffect, useMemo, useRef, useState } from "react";

const GOLD = "#C9A96E";
const GOLD_DIM = "rgba(201,169,110,0.35)";
const GOLD_GLOW = "rgba(201,169,110,0.12)";
const DEEP = "#0D0D1A";
const SURFACE = "#14142B";
const SURFACE2 = "#1A1A2E";
const SURFACE3 = "#242444";
const MUTED = "rgba(255,255,255,0.45)";
const SOFT = "rgba(255,255,255,0.74)";
const VIOLET = "rgba(139,92,246,0.45)";
const VIOLET_SOLID = "#7C5CDB";
const GLASS = "rgba(30,30,60,0.55)";
const GLASS_BORDER = "rgba(201,169,110,0.15)";

const STAGES = [
  { id: "waiting_room", label: "候车空间" },
  { id: "grouped", label: "组局成功" },
  { id: "arriving", label: "到店中" },
  { id: "in_progress", label: "局中进行时" },
  { id: "wrap_up", label: "局后收尾" },
];

const ROOM_INFO = {
  title: "梅子酒安静慢喝局",
  bar: "FLASK Speakeasy",
  time: "今晚 20:30 - 22:00",
  headCount: "2/3 人",
};

const quickActionsByStage = {
  waiting_room: ["邀人上车", "调整这局", "发一句话"],
  grouped: ["发我的酒感自介", "回答这一问", "摇个题"],
  arriving: ["我已到店", "我看到位置了", "扫码入局"],
  in_progress: ["摇个题", "今夜任务", "给别人推荐一杯", "贴个标签"],
  wrap_up: ["留一句", "贴标签", "回流心境墙", "结束这局"],
};

const inputPlaceholderByStage = {
  waiting_room: "说一句让后来的人更想上车",
  grouped: "聊聊今晚这杯酒像你最近的什么状态",
  arriving: "说一句你到哪了，方便大家碰头",
  in_progress: "轻发一句，更多话留在线下慢慢聊",
  wrap_up: "给今晚留一句收尾的话",
};

const baseMessages = [
  {
    id: "msg-1",
    type: "system_hint",
    text: "今晚这局已经成立，聊天室会随着进度自然解锁不同互动。",
    time: "20:08",
  },
  {
    id: "msg-2",
    type: "message",
    side: "left",
    name: "小 R",
    text: "我先来占个位置，今晚想慢慢喝，不想赶场。",
    time: "20:09",
    avatarMode: "named",
  },
  {
    id: "msg-3",
    type: "message",
    side: "right",
    name: "我",
    text: "收到，我可能会提前十分钟到，先跟你们碰个杯。",
    time: "20:10",
    avatarMode: "me",
  },
  {
    id: "msg-4",
    type: "message",
    side: "left",
    name: "阿青",
    text: "我今天就想找个地方坐会儿，别太吵就行。",
    time: "20:11",
    avatarMode: "named",
  },
];

const stageCards = {
  waiting_room: [
    {
      id: "waiting-welcome",
      type: "feature_card",
      variant: "welcome",
      eyebrow: "候车空间",
      title: "你们已经进入同一个车队聊天室",
      description: "再上来 1 位，这局会更完整。现在先在这里打个照面，别急着一直盯着屏幕。",
      actions: ["知道了", "看看这局"],
    },
    {
      id: "waiting-suggest",
      type: "feature_card",
      variant: "suggest",
      eyebrow: "候车建议",
      title: "系统觉得这局已经很接近成局",
      bullets: ["改成 2 人局会更容易成", "当前时间更适合快速喝一杯", "这家店现在正处在心境活跃时段"],
      actions: ["改成 2 人局", "保持当前设置"],
    },
    {
      id: "waiting-preview",
      type: "feature_card",
      variant: "preview",
      eyebrow: "玩法预告",
      title: "后面会自然解锁这些轻互动",
      bullets: ["酒感自我介绍", "到店落座锚点", "轻互动 / 圆桌派", "局后回响"],
      actions: ["先等人来", "发一句话"],
    },
  ],
  grouped: [
    {
      id: "grouped-intro",
      type: "feature_card",
      variant: "intro",
      eyebrow: "酒感自我介绍",
      title: "先用一杯酒介绍一下今晚的你",
      description: "选一杯你现在最想点的酒，再用一句话说它像你最近的什么状态。",
      chips: ["梅子 Highball", "Negroni", "Gin & Tonic", "Whisky Sour"],
      actions: ["发我的酒感自介", "先看看别人怎么说"],
    },
    {
      id: "grouped-result-1",
      type: "result_card",
      eyebrow: "自我介绍",
      name: "小 R",
      content: "我今晚最想点梅子 Highball，这杯像我最近表面轻松、其实有点累的状态。",
    },
    {
      id: "grouped-result-2",
      type: "result_card",
      eyebrow: "自我介绍",
      name: "阿青",
      content: "我想点一杯偏苦一点的 Negroni，像这周看起来没事，其实心里有很多话没说。",
    },
    {
      id: "grouped-roundtable",
      type: "feature_card",
      variant: "roundtable",
      eyebrow: "圆桌派第一问",
      title: "你来这局，是想放松、碰杯，还是想找人坐会儿？",
      description: "这一问更适合大家各说一句，不用认真作答，开个口就好。",
      actions: ["回答这一问", "换一题"],
    },
  ],
  arriving: [
    {
      id: "arriving-status",
      type: "system_hint",
      text: "小 R 已到店，阿青 正在路上，第一位成员已创建落座锚点。",
      time: "20:26",
    },
    {
      id: "arriving-anchor",
      type: "arrival_card",
      eyebrow: "落座锚点",
      title: "已有 1 人到店",
      locationTag: "靠窗",
      description: "靠窗第二排，桌上有暖黄灯，旁边有一株很高的绿植。",
      actions: ["我看到啦", "我也到了"],
    },
    {
      id: "arriving-scan",
      type: "feature_card",
      variant: "scan",
      eyebrow: "扫码入局",
      title: "到店后扫码，解锁今晚这局的互动包",
      description: "扫码不是为了让大家一直玩手机，而是用一个轻动作把线上关系接到线下。",
      actions: ["扫码入局"],
    },
  ],
  in_progress: [
    {
      id: "progress-starter",
      type: "feature_card",
      variant: "starter",
      eyebrow: "线下对话引子",
      title: "今天有什么值得碰杯一下的瞬间？",
      description: "把这个问题留给桌上的人面对面聊，手机只负责轻轻起个头。",
      actions: ["我们线下聊这个", "下一题"],
    },
    {
      id: "progress-action",
      type: "feature_card",
      variant: "action",
      eyebrow: "轻动作互动",
      title: "给你左手边的人推荐下一杯",
      description: "不用发长消息，每个人轮流一句就够了，真正好玩的部分发生在桌上。",
      actions: ["开始这一轮", "换一个互动"],
    },
    {
      id: "progress-task",
      type: "feature_card",
      variant: "task",
      eyebrow: "今夜任务",
      title: "给今晚这局贴一个只属于你们的标签",
      bullets: ["给局里某个人推荐一杯酒", "参与一次圆桌派问题", "给今晚这局贴一个标签"],
      actions: ["看任务", "换一个任务"],
    },
    {
      id: "progress-mini-game",
      type: "feature_card",
      variant: "mini",
      eyebrow: "轻量入口",
      title: "摇个题，三十秒开个新话头",
      description: "更像一个桌边引子，不是复杂小游戏。",
      actions: ["摇个题", "轻桌游"],
    },
  ],
  wrap_up: [
    {
      id: "wrap-line",
      type: "feature_card",
      variant: "echo",
      eyebrow: "留一句话",
      title: "给今晚留一句话",
      description: "这局最后像什么味道？你会怎么记住今晚这杯酒？",
      actions: ["留一句", "稍后再说"],
    },
    {
      id: "wrap-tags",
      type: "feature_card",
      variant: "tags",
      eyebrow: "贴标签",
      title: "替今晚这局选一个标签",
      chips: ["回魂局", "碰杯局", "意外好聊局", "散心局", "续命局"],
      actions: ["贴标签"],
    },
    {
      id: "wrap-wall",
      type: "echo_card",
      eyebrow: "回流心境墙",
      title: "把今晚这句留回店铺心境墙",
      description: "勾上之后，这句会以轻匿名方式回到这家店的 24H 心境墙。",
      toggleLabel: "把今晚这句留回店铺心境墙",
      actions: ["回流心境墙"],
    },
    {
      id: "wrap-contact",
      type: "feature_card",
      variant: "contact",
      eyebrow: "保持联系",
      title: "这一局可以停在今晚，也可以给彼此留个再见的余味",
      description: "这里只做轻展示，不强推任何重运营动作。",
      actions: ["知道了", "结束这局"],
    },
  ],
};

function createDefaultRoomInfo() {
  return ROOM_INFO;
}

function StarField() {
  const stars = useRef(
    Array.from({ length: 26 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.3 + 0.4,
      delay: Math.random() * 5,
      dur: Math.random() * 3 + 2,
    }))
  );

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {stars.current.map((star, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: "50%",
            background: GOLD,
            opacity: 0,
            animation: `twinkle ${star.dur}s ${star.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

function DevStageSwitcher({ stage, onChange, visible = true }) {
  if (!import.meta.env.DEV || !visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 18,
        right: 14,
        zIndex: 30,
        background: "rgba(10,10,20,0.78)",
        border: `0.5px solid ${GLASS_BORDER}`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: 16,
        padding: "10px 10px 8px",
        width: 122,
        boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
      }}
    >
      <p style={{ fontSize: 10, color: GOLD_DIM, letterSpacing: 1.4, fontFamily: "'Cormorant Garamond', serif", marginBottom: 8 }}>
        DEV STAGE
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {STAGES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            style={{
              background: stage === item.id ? SURFACE3 : "transparent",
              border: `0.5px solid ${stage === item.id ? GOLD_DIM : GLASS_BORDER}`,
              color: stage === item.id ? GOLD : MUTED,
              borderRadius: 10,
              padding: "7px 8px",
              fontSize: 11,
              textAlign: "left",
              fontFamily: "'Noto Sans SC', sans-serif",
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProgressRail({ stage, onSelect }) {
  const currentIndex = STAGES.findIndex((item) => item.id === stage);

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, alignItems: "start" }}>
        {STAGES.map((item, index) => {
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;
          const dotColor = isCurrent || isPast ? GOLD : "rgba(255,255,255,0.16)";
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect?.(item.id)}
              style={{
                minWidth: 0,
                background: "transparent",
                border: "none",
                padding: 0,
                textAlign: "left",
                cursor: onSelect ? "pointer" : "default",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: dotColor,
                    boxShadow: isCurrent ? `0 0 12px ${GOLD_DIM}` : "none",
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    height: 1,
                    flex: 1,
                    background: index === STAGES.length - 1 ? "transparent" : isPast ? GOLD_DIM : "rgba(255,255,255,0.12)",
                    marginRight: index === STAGES.length - 1 ? 0 : -4,
                  }}
                />
              </div>
              <p
                style={{
                  marginTop: 8,
                  fontSize: 10,
                  lineHeight: 1.35,
                  color: isCurrent ? SOFT : isPast ? "rgba(255,255,255,0.58)" : MUTED,
                  fontFamily: "'Noto Sans SC', sans-serif",
                  maxWidth: 56,
                }}
              >
                  {item.label}
                </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MessageBubble({ item }) {
  const isRight = item.side === "right";
  const bubbleBackground = isRight
    ? "linear-gradient(135deg, rgba(201,169,110,0.96), rgba(231,201,147,0.9))"
    : GLASS;

  return (
    <div style={{ display: "flex", justifyContent: isRight ? "flex-end" : "flex-start", marginBottom: 12 }}>
      <div style={{ maxWidth: "82%" }}>
        {!isRight && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, paddingLeft: 4 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: item.avatarMode === "anonymous" ? SURFACE3 : VIOLET_SOLID,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: item.avatarMode === "anonymous" ? GOLD_DIM : "#fff",
                fontSize: 11,
                fontFamily: item.avatarMode === "anonymous" ? "'Cormorant Garamond', serif" : "'Noto Sans SC', sans-serif",
              }}
            >
              {item.avatarMode === "anonymous" ? "☽" : item.name[0]}
            </div>
            <span style={{ fontSize: 12, color: MUTED, fontFamily: "'Noto Sans SC', sans-serif" }}>{item.name}</span>
          </div>
        )}
        <div
          style={{
            background: bubbleBackground,
            border: `0.5px solid ${isRight ? "transparent" : GLASS_BORDER}`,
            color: isRight ? DEEP : "#fff",
            borderRadius: isRight ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
            padding: "12px 14px",
            boxShadow: isRight ? "0 10px 24px rgba(201,169,110,0.18)" : "none",
            backdropFilter: isRight ? "none" : "blur(12px)",
            WebkitBackdropFilter: isRight ? "none" : "blur(12px)",
          }}
        >
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, fontFamily: "'Noto Sans SC', sans-serif" }}>{item.text}</p>
        </div>
        <p style={{ marginTop: 6, padding: "0 4px", fontSize: 10, color: MUTED, textAlign: isRight ? "right" : "left", fontFamily: "'Noto Sans SC', sans-serif" }}>
          {item.time}
        </p>
      </div>
    </div>
  );
}

function SystemHint({ item }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
      <div
        style={{
          maxWidth: "94%",
          fontSize: 11,
          lineHeight: 1.5,
          color: GOLD_DIM,
          padding: "7px 12px",
          borderRadius: 999,
          border: `0.5px solid ${GLASS_BORDER}`,
          background: "rgba(201,169,110,0.08)",
          textAlign: "center",
          fontFamily: "'Noto Sans SC', sans-serif",
        }}
      >
        {item.text}
      </div>
    </div>
  );
}

function CardShell({ eyebrow, title, description, children, footer }) {
  return (
    <div
      style={{
        background: GLASS,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `0.5px solid ${GLASS_BORDER}`,
        borderRadius: 18,
        padding: "16px 16px 14px",
        marginBottom: 14,
        boxShadow: "0 16px 36px rgba(0,0,0,0.14)",
      }}
    >
      {eyebrow && (
        <p style={{ fontSize: 11, color: GOLD_DIM, letterSpacing: 1.6, fontFamily: "'Cormorant Garamond', serif", marginBottom: 6 }}>
          {eyebrow}
        </p>
      )}
      {title && (
        <p style={{ fontSize: 16, color: "#fff", fontWeight: 500, lineHeight: 1.45, marginBottom: description || children ? 8 : 0, fontFamily: "'Noto Sans SC', sans-serif" }}>
          {title}
        </p>
      )}
      {description && (
        <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.75, marginBottom: children || footer ? 12 : 0, fontFamily: "'Noto Sans SC', sans-serif" }}>
          {description}
        </p>
      )}
      {children}
      {footer}
    </div>
  );
}

function ActionButtons({ actions }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
      {actions.map((action, index) => (
        <button
          key={`${action}-${index}`}
          type="button"
          style={{
            borderRadius: 999,
            border: `0.5px solid ${index === 0 ? GOLD_DIM : GLASS_BORDER}`,
            background: index === 0 ? GOLD_GLOW : "transparent",
            color: index === 0 ? GOLD : SOFT,
            fontSize: 12,
            padding: "7px 12px",
            fontFamily: "'Noto Sans SC', sans-serif",
            cursor: "pointer",
          }}
        >
          {action}
        </button>
      ))}
    </div>
  );
}

function FeatureCard({ item }) {
  return (
    <CardShell
      eyebrow={item.eyebrow}
      title={item.title}
      description={item.description}
      footer={item.actions ? <ActionButtons actions={item.actions} /> : null}
    >
      {item.bullets && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {item.bullets.map((bullet) => (
            <div key={bullet} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ color: GOLD, fontSize: 12, lineHeight: "20px" }}>•</span>
              <span style={{ fontSize: 13, color: SOFT, lineHeight: 1.65, fontFamily: "'Noto Sans SC', sans-serif" }}>{bullet}</span>
            </div>
          ))}
        </div>
      )}
      {item.chips && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
          {item.chips.map((chip) => (
            <span
              key={chip}
              style={{
                fontSize: 12,
                color: item.variant === "tags" ? SOFT : GOLD,
                background: item.variant === "tags" ? "rgba(124,92,219,0.16)" : GOLD_GLOW,
                border: `0.5px solid ${item.variant === "tags" ? VIOLET : GOLD_DIM}`,
                borderRadius: 999,
                padding: "6px 10px",
                fontFamily: "'Noto Sans SC', sans-serif",
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      )}
    </CardShell>
  );
}

function ResultCard({ item }) {
  return (
    <CardShell eyebrow={item.eyebrow} title={item.name}>
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `0.5px solid ${GLASS_BORDER}`,
          borderRadius: 14,
          padding: "12px 14px",
        }}
      >
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: SOFT, fontFamily: "'Noto Sans SC', sans-serif" }}>{item.content}</p>
      </div>
    </CardShell>
  );
}

function ArrivalCard({ item }) {
  return (
    <CardShell eyebrow={item.eyebrow} title={item.title}>
      <div
        style={{
          borderRadius: 14,
          overflow: "hidden",
          border: `0.5px solid ${GLASS_BORDER}`,
          background: "linear-gradient(135deg, rgba(201,169,110,0.12), rgba(124,92,219,0.18), rgba(255,255,255,0.04))",
          padding: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            height: 110,
            borderRadius: 12,
            background: "radial-gradient(circle at 65% 35%, rgba(255,214,153,0.22), transparent 18%), linear-gradient(180deg, rgba(255,204,128,0.16), rgba(18,18,35,0.2)), linear-gradient(135deg, rgba(47,37,20,0.6), rgba(25,25,44,0.85))",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", left: 12, top: 14, width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", left: 74, top: 22, width: 122, height: 16, borderRadius: 999, background: "rgba(255,220,160,0.14)" }} />
          <div style={{ position: "absolute", left: 86, top: 54, width: 94, height: 12, borderRadius: 999, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", right: 16, bottom: 14, width: 72, height: 72, borderRadius: 18, border: "1px solid rgba(255,255,255,0.1)" }} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span
          style={{
            fontSize: 11,
            color: GOLD,
            background: GOLD_GLOW,
            border: `0.5px solid ${GOLD_DIM}`,
            borderRadius: 999,
            padding: "4px 10px",
            fontFamily: "'Noto Sans SC', sans-serif",
          }}
        >
          {item.locationTag}
        </span>
        <span style={{ fontSize: 12, color: MUTED, fontFamily: "'Noto Sans SC', sans-serif" }}>暖黄灯位</span>
      </div>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.72, color: SOFT, fontFamily: "'Noto Sans SC', sans-serif" }}>{item.description}</p>
      <ActionButtons actions={item.actions} />
    </CardShell>
  );
}

function EchoCard({ item }) {
  const [checked, setChecked] = useState(true);

  return (
    <CardShell eyebrow={item.eyebrow} title={item.title} description={item.description}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 12px",
          borderRadius: 14,
          background: "rgba(255,255,255,0.04)",
          border: `0.5px solid ${GLASS_BORDER}`,
          fontSize: 13,
          color: SOFT,
          fontFamily: "'Noto Sans SC', sans-serif",
        }}
      >
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} style={{ width: 16, height: 16, accentColor: VIOLET_SOLID }} />
        {item.toggleLabel}
      </label>
      <ActionButtons actions={item.actions} />
    </CardShell>
  );
}

function renderFeedItem(item) {
  if (item.type === "message") return <MessageBubble key={item.id} item={item} />;
  if (item.type === "system_hint") return <SystemHint key={item.id} item={item} />;
  if (item.type === "feature_card") return <FeatureCard key={item.id} item={item} />;
  if (item.type === "result_card") return <ResultCard key={item.id} item={item} />;
  if (item.type === "arrival_card") return <ArrivalCard key={item.id} item={item} />;
  if (item.type === "echo_card") return <EchoCard key={item.id} item={item} />;
  return null;
}

export default function ChatRoomPreview({
  initialStage = "waiting_room",
  roomInfo: roomInfoProp,
  introMessages = [],
  onBack,
  allowStageSwitcher = true,
}) {
  const [stage, setStage] = useState(initialStage);
  const [input, setInput] = useState("");
  const roomInfo = roomInfoProp || createDefaultRoomInfo();

  useEffect(() => {
    setStage(initialStage);
  }, [initialStage]);

  const feed = useMemo(() => [...baseMessages, ...introMessages, ...(stageCards[stage] || [])], [introMessages, stage]);

  useEffect(() => {
    document.title = "局聊天室";
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: DEEP,
        color: "#fff",
        fontFamily: "'Noto Sans SC', sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500&family=Noto+Sans+SC:wght@300;400;500&display=swap');
        @keyframes twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.62; }
        }
        * { box-sizing: border-box; }
        input::placeholder { color: ${MUTED}; }
      `}</style>

      <StarField />
      <DevStageSwitcher stage={stage} onChange={setStage} visible={allowStageSwitcher} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480, margin: "0 auto", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 5,
            padding: "12px 16px 10px",
            background: "linear-gradient(180deg, rgba(13,13,26,0.96) 0%, rgba(13,13,26,0.88) 72%, rgba(13,13,26,0.58) 100%)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            borderBottom: `0.5px solid ${GLASS_BORDER}`,
          }}
        >
          <div
            style={{
              padding: "10px 12px 11px",
              borderRadius: 16,
              background: GLASS,
              border: `0.5px solid ${GLASS_BORDER}`,
              boxShadow: "0 14px 34px rgba(0,0,0,0.16)",
            }}
          >
            {onBack && (
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
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 16 }}>‹</span> 返回车队
              </button>
            )}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(201,169,110,0.18), rgba(124,92,219,0.24))",
                  border: `0.5px solid ${GLASS_BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Cormorant Garamond', serif",
                  color: GOLD,
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                局
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.35, marginBottom: 4 }}>{roomInfo.title}</p>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
                  {roomInfo.bar} · {roomInfo.time}
                </p>
                <p style={{ fontSize: 11, color: GOLD_DIM, marginTop: 2 }}>{roomInfo.headCount}</p>
              </div>
            </div>
            <ProgressRail stage={stage} onSelect={setStage} />
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "10px 16px 190px", position: "relative" }}>
          {feed.map((item) => renderFeedItem(item))}
        </div>

        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: 0,
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 480,
            zIndex: 6,
            padding: "10px 16px 22px",
            background: "linear-gradient(180deg, rgba(13,13,26,0) 0%, rgba(13,13,26,0.88) 26%, rgba(13,13,26,0.96) 100%)",
          }}
        >
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "none" }}>
            {quickActionsByStage[stage].map((action, index) => (
              <button
                key={action}
                type="button"
                style={{
                  flexShrink: 0,
                  borderRadius: 999,
                  border: `0.5px solid ${index === 0 ? GOLD_DIM : GLASS_BORDER}`,
                  background: index === 0 ? GOLD_GLOW : GLASS,
                  color: index === 0 ? GOLD : SOFT,
                  padding: "9px 12px",
                  fontSize: 12,
                  fontFamily: "'Noto Sans SC', sans-serif",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  cursor: "pointer",
                }}
              >
                {action}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: GLASS,
              border: `0.5px solid ${GLASS_BORDER}`,
              borderRadius: 24,
              padding: "10px 10px 10px 14px",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={inputPlaceholderByStage[stage]}
              style={{
                flex: 1,
                minWidth: 0,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: 14,
                fontFamily: "'Noto Sans SC', sans-serif",
              }}
            />
            <button
              type="button"
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: "none",
                background: input.trim() ? GOLD : SURFACE3,
                color: input.trim() ? DEEP : MUTED,
                cursor: input.trim() ? "pointer" : "default",
                fontSize: 12,
                fontFamily: "'Noto Sans SC', sans-serif",
                flexShrink: 0,
              }}
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
