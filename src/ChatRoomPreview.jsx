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
  in_progress: ["游戏", "第二杯", "心境漂流瓶"],
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
      id: "progress-situation",
      type: "feature_card",
      variant: "situation",
      eyebrow: "局势提示",
      title: "这局已经热起来了，适合来一轮互动",
      description: "现在更适合把话头抛给彼此，而不是继续低头点单。",
      actions: ["知道了", "换一条"],
    },
    {
      id: "progress-starter",
      type: "feature_card",
      variant: "starter",
      eyebrow: "开场 / 续场引导",
      title: "来，给今晚找个值得碰杯的理由",
      description: "这一轮别只说自己，把话头递给桌上的另一个人。",
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
      id: "progress-result-cup",
      type: "result_card",
      eyebrow: "互动结果",
      name: "第二杯推荐结果",
      content: "本轮大家给阿青推荐最多的第二杯是：白桃气泡酒。理由是它最适合把这局往轻松、好接话的方向带。",
    },
    {
      id: "progress-result-tag",
      type: "result_card",
      eyebrow: "互动结果",
      name: "本局标签倾向",
      content: "这一桌刚刚选出的局标签倾向：意外好聊局。",
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

const members = [
  { name: "我", persona: "慢热微醺派" },
  { name: "小 R", persona: "碰杯气氛组" },
  { name: "阿青", persona: "安静续命派" },
];

const gameCategories = [
  {
    label: "轻开场",
    items: [
      { name: "第一杯命名", desc: "给彼此的第一杯起个今晚限定名字", people: "3人", vibe: "刚热起来", duration: "5分钟", summary: "每个人用一句话给别人的第一杯重新命名。" },
      { name: "酒感接龙", desc: "顺着上一位的话接一个更像今晚的酒感", people: "3-5人", vibe: "轻松接话", duration: "6分钟", summary: "从一个酒感词开始，轮流把今晚的气氛往下接。" },
      { name: "三词形容今晚这局", desc: "用三个词快速给这桌定调", people: "不限", vibe: "开口破冰", duration: "4分钟", summary: "每个人说三个词，最后选一个最像今晚的。" },
    ],
  },
  {
    label: "升温局",
    items: [
      { name: "第二杯法官", desc: "轮流替别人判今晚更适合哪一杯", people: "3-4人", vibe: "已经聊开", duration: "8分钟", summary: "每轮选一人，其余人都给他推荐第二杯并说理由。" },
      { name: "酒局拍卖会", desc: "把今晚的瞬间拿出来拍一拍", people: "3-6人", vibe: "热一点", duration: "10分钟", summary: "轮流拿一个今晚瞬间出来，大家用一句话竞拍它的酒感价值。" },
      { name: "谁最像……", desc: "轻轻把观察说出口", people: "3-5人", vibe: "熟起来之后", duration: "7分钟", summary: "每轮一个题干，大家指向最像的人并说一句原因。" },
    ],
  },
  {
    label: "推理局",
    items: [
      { name: "谁是卧底·酒局版", desc: "用酒感而不是词库来找卧底", people: "4-6人", vibe: "想再热一点", duration: "12分钟", summary: "每个人用一句酒感描述自己的词，找出最不像的那位。" },
      { name: "真假一杯", desc: "说一个真心话，一个假酒感", people: "3-5人", vibe: "轻推理", duration: "8分钟", summary: "每人说两句，大家猜哪一句更像他真实的今晚。" },
      { name: "轻阿瓦隆·酒桌版", desc: "只保留最轻量的怀疑与站队", people: "4-6人", vibe: "想玩一点脑子", duration: "15分钟", summary: "不做复杂身份，只保留桌边站队和判断。" },
    ],
  },
  {
    label: "收尾局",
    items: [
      { name: "今晚最值得碰杯的一刻", desc: "把今晚的高光说出来", people: "不限", vibe: "准备往回收", duration: "5分钟", summary: "每人说一个瞬间，最后选最值得再碰一杯的那个。" },
      { name: "如果今晚这局是一首歌", desc: "给这局一个余味", people: "不限", vibe: "微醺收束", duration: "6分钟", summary: "轮流用歌名或者旋律形容今晚。" },
      { name: "给这局贴标签", desc: "替今晚留下一个共同的称呼", people: "不限", vibe: "好收尾", duration: "4分钟", summary: "从几个标签里选一个，再补一句原因。" },
    ],
  },
];

const secondCupModes = [
  { title: "给别人推荐第二杯", desc: "别只给自己点，替桌上的另一个人判断下一杯。" },
  { title: "全桌选本局下一杯方向", desc: "这一轮更适合轻快、回魂，还是继续碰杯。" },
  { title: "第二杯法官", desc: "选一个人，让全桌都给他开第二杯判词。" },
  { title: "本局第二杯签", desc: "抽一张签，看看今晚第二杯该往哪里走。" },
];

const secondCupSuggestions = [
  { name: "白桃气泡酒", reason: "更轻快，能把这桌往松弛和好接话的方向带。", fit: "更适合阿青 / 当前这局中段" },
  { name: "梅子 Highball", reason: "不抢戏，适合让聊天继续往下走。", fit: "更适合全桌 / 正在升温的阶段" },
  { name: "柚香金汤力", reason: "有一点提神感，适合让桌上重新亮起来。", fit: "更适合小 R / 需要续场的时候" },
];

const bottlePrompts = [
  "如果你现在这杯酒会说话，它会替你给 @小 R 提一个什么建议？",
  "这桌里谁的第一杯最像“我其实有点累了”？大家说说为什么。",
  "借 @阿青 的酒，说一句他今晚不会先开口的话。",
];

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

function BottomDrawer({ open, title, subtitle, onClose, children }) {
  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 20, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          maxHeight: "78vh",
          overflow: "auto",
          background: SURFACE,
          borderRadius: "20px 20px 0 0",
          border: `0.5px solid ${GLASS_BORDER}`,
          borderBottom: "none",
          padding: "18px 16px 22px",
          boxShadow: "0 -20px 50px rgba(0,0,0,0.28)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 15, color: "#fff", fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500 }}>{title}</p>
            <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, marginTop: 4, fontFamily: "'Noto Sans SC', sans-serif" }}>{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: MUTED, fontSize: 20, cursor: "pointer", padding: 0 }}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SimpleCard({ title, desc, action, onClick }) {
  return (
    <div style={{ background: GLASS, border: `0.5px solid ${GLASS_BORDER}`, borderRadius: 16, padding: "14px 14px 13px", marginBottom: 10, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
      <p style={{ fontSize: 14, color: "#fff", fontWeight: 500, marginBottom: 6, fontFamily: "'Noto Sans SC', sans-serif" }}>{title}</p>
      <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.65, marginBottom: 12, fontFamily: "'Noto Sans SC', sans-serif" }}>{desc}</p>
      <button type="button" onClick={onClick} style={{ borderRadius: 999, border: `0.5px solid ${GOLD_DIM}`, background: "transparent", color: GOLD, padding: "7px 12px", fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", cursor: "pointer" }}>
        {action}
      </button>
    </div>
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
  const [feedItems, setFeedItems] = useState([]);
  const [drawer, setDrawer] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [bottleIndex, setBottleIndex] = useState(0);
  const roomInfo = roomInfoProp || createDefaultRoomInfo();

  useEffect(() => {
    setStage(initialStage);
  }, [initialStage]);

  useEffect(() => {
    setFeedItems([...baseMessages, ...introMessages, ...(stageCards[stage] || [])]);
  }, [introMessages, stage]);

  useEffect(() => {
    document.title = "局聊天室";
  }, []);

  const quickActions = quickActionsByStage[stage];

  const startGameRound = () => {
    if (!selectedGame) return;
    setFeedItems((prev) => [
      ...prev,
      {
        id: `game-start-${Date.now()}`,
        type: "system_hint",
        text: `本轮游戏开始：${selectedGame.name}。大家放下手机，用桌上的眼神和话头把这一轮玩起来。`,
        time: "刚刚",
      },
    ]);
    setDrawer(null);
    setSelectedGame(null);
  };

  const startSecondCupRound = (title) => {
    setFeedItems((prev) => [
      ...prev,
      {
        id: `second-cup-${Date.now()}`,
        type: "system_hint",
        text: `第二杯互动开始：${title}。这一轮别急着给自己点，先替桌上的另一个人说一句理由。`,
        time: "刚刚",
      },
    ]);
    setDrawer(null);
  };

  const throwBottle = () => {
    setFeedItems((prev) => [
      ...prev,
      {
        id: `bottle-${Date.now()}`,
        type: "system_hint",
        text: `漂流瓶已投出：${bottlePrompts[bottleIndex]} 把答案留在线下说。`,
        time: "刚刚",
      },
    ]);
    setDrawer(null);
  };

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
          {feedItems.map((item) => renderFeedItem(item))}
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
            {quickActions.map((action, index) => (
              <button
                key={action}
                type="button"
                onClick={() => {
                  if (stage !== "in_progress") return;
                  if (action === "游戏") setDrawer("game");
                  if (action === "第二杯") setDrawer("second-cup");
                  if (action === "心境漂流瓶") setDrawer("bottle");
                }}
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

      <BottomDrawer
        open={drawer === "game"}
        title="来一轮小游戏"
        subtitle="选一个更适合现在这局气氛的。手机只负责发起，真正好玩的部分留在桌上。"
        onClose={() => {
          setDrawer(null);
          setSelectedGame(null);
        }}
      >
        {!selectedGame ? (
          <>
            <CardShell eyebrow="系统推荐" title="适合现在这局：第二杯法官" description="这局已经有来有回了，现在最适合让大家替别人开第二杯判词。">
              <p style={{ fontSize: 12, color: MUTED, fontFamily: "'Noto Sans SC', sans-serif" }}>如果想热一点：谁是卧底·酒局版</p>
            </CardShell>
            {gameCategories.map((category) => (
              <div key={category.label} style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: GOLD_DIM, letterSpacing: 1.2, marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>{category.label}</p>
                {category.items.map((game) => (
                  <SimpleCard key={game.name} title={game.name} desc={game.desc} action="查看玩法" onClick={() => setSelectedGame(game)} />
                ))}
              </div>
            ))}
          </>
        ) : (
          <CardShell eyebrow="游戏详情" title={selectedGame.name} description={selectedGame.summary}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: GOLD, background: GOLD_GLOW, border: `0.5px solid ${GOLD_DIM}`, borderRadius: 999, padding: "4px 10px" }}>{selectedGame.people}</span>
              <span style={{ fontSize: 11, color: SOFT, background: "rgba(255,255,255,0.04)", border: `0.5px solid ${GLASS_BORDER}`, borderRadius: 999, padding: "4px 10px" }}>{selectedGame.vibe}</span>
              <span style={{ fontSize: 11, color: SOFT, background: "rgba(255,255,255,0.04)", border: `0.5px solid ${GLASS_BORDER}`, borderRadius: 999, padding: "4px 10px" }}>{selectedGame.duration}</span>
            </div>
            <button type="button" onClick={startGameRound} style={{ width: "100%", borderRadius: 12, background: GOLD, color: DEEP, border: "none", padding: "12px 0", fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif", cursor: "pointer" }}>
              开这一轮
            </button>
          </CardShell>
        )}
      </BottomDrawer>

      <BottomDrawer
        open={drawer === "second-cup"}
        title="第二杯"
        subtitle="基于这局里大家现在的状态，看看下一杯该怎么走。"
        onClose={() => setDrawer(null)}
      >
        <CardShell eyebrow="当前局势判断" title="这局已经适合来一杯更轻快的第二杯" description="现在不太适合继续加烈，更适合来一杯能让聊天继续往下走的第二杯。" />
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 12, color: GOLD_DIM, letterSpacing: 1.2, marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>第二杯玩法</p>
          {secondCupModes.map((mode) => (
            <SimpleCard key={mode.title} title={mode.title} desc={mode.desc} action="开始这轮" onClick={() => startSecondCupRound(mode.title)} />
          ))}
        </div>
        <div>
          <p style={{ fontSize: 12, color: GOLD_DIM, letterSpacing: 1.2, marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>第二杯建议</p>
          {secondCupSuggestions.map((item) => (
            <CardShell key={item.name} title={item.name} description={item.reason}>
              <p style={{ fontSize: 12, color: SOFT, fontFamily: "'Noto Sans SC', sans-serif" }}>{item.fit}</p>
            </CardShell>
          ))}
        </div>
      </BottomDrawer>

      <BottomDrawer
        open={drawer === "bottle"}
        title="心境漂流瓶"
        subtitle="让这杯酒替你开口。更偏高质量对话，不是游戏，也不是任务。"
        onClose={() => setDrawer(null)}
      >
        <CardShell eyebrow="在场成员" title={`${members.map((m) => m.name).join(" / ")}`} description={members.map((m) => `${m.name}·${m.persona}`).join("  ·  ")} />
        <CardShell eyebrow="定制话题签" title={bottlePrompts[bottleIndex]} description="这张签更适合在桌上慢慢说，不急着在手机里回答。">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {["就聊这个", "换一张", "轻一点", "深一点"].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (label === "换一张") setBottleIndex((prev) => (prev + 1) % bottlePrompts.length);
                }}
                style={{ borderRadius: 999, border: `0.5px solid ${label === "就聊这个" ? GOLD_DIM : GLASS_BORDER}`, background: label === "就聊这个" ? GOLD_GLOW : "transparent", color: label === "就聊这个" ? GOLD : SOFT, padding: "7px 12px", fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", cursor: "pointer" }}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" onClick={throwBottle} style={{ width: "100%", borderRadius: 12, background: GOLD, color: DEEP, border: "none", padding: "12px 0", fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif", cursor: "pointer" }}>
            就聊这个
          </button>
        </CardShell>
      </BottomDrawer>
    </div>
  );
}
