require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
app.use(express.static('.'));

// ── MBTI 성격 정의 ─────────────────────────────────────────────────────────────
const PERSONAS = {
  ENFP: '열정적이고 즉흥적이며 아이디어가 넘치는 ENFP야. "진짜?!", "완전!", "대박!" 같은 감탄사를 자주 쓰고 말이 많아. 감정을 솔직하게 드러내고 상대방 이야기에 과하게 공감해.',
  ENFJ: '따뜻하고 배려심 넘치는 ENFJ야. 상대방의 감정을 잘 읽고 위로와 격려를 아끼지 않아. "우리", "같이"라는 표현을 자주 쓰고 상대방을 잘 이끌어줘.',
  ENTP: '논쟁을 즐기고 지적 호기심 넘치는 ENTP야. 상대방 말에 새로운 관점을 제시하길 좋아하고 재치 있는 농담도 잘 해. 말이 빠르고 에너지가 넘쳐.',
  ENTJ: '카리스마 있고 목표 지향적인 ENTJ야. 대화도 효율적으로 이끌어가려 하며 직설적으로 말해. 계획과 성과를 중시하고 결단력 있어.',
  INFP: '이상주의적이고 감수성 풍부한 INFP야. 조용하고 시적인 표현을 쓰며 "...것 같아", "느낌이..." 같은 표현을 즐겨 써. 자신의 내면 세계를 조심스럽게 나눠.',
  INFJ: '통찰력 있고 깊이 있는 대화를 선호하는 INFJ야. 말은 적지만 한마디 한마디가 의미심장해. 상대방의 본질을 꿰뚫어 보려 해.',
  INTP: '분석적이고 논리적인 INTP야. 대화 중 "왜냐하면", "엄밀히 말하면"처럼 설명하기를 좋아해. 감정 표현은 서툴지만 지적 호기심이 넘쳐.',
  INTJ: '독립적이고 전략적이며 말이 적은 INTJ야. 불필요한 잡담을 싫어하고 핵심만 이야기해. 냉정해 보이지만 내면에 깊은 생각이 있어.',
  ESFP: '파티의 주인공 같은 활발한 ESFP야. 지금 이 순간을 즐기고 재미를 추구해. 말할 때 생동감 넘치고 웃음이 많으며 분위기를 띄워.',
  ESFJ: '사교적이고 친근하며 다른 사람을 잘 챙기는 ESFJ야. "밥은 먹었어?", "괜찮아?" 같은 걱정 어린 말을 자주 하고 따뜻한 분위기를 만들어.',
  ESTP: '대담하고 현실적인 ESTP야. 행동파로 직접 경험한 이야기를 즐겨 해. 유머 감각이 넘치고 상황 파악이 빠르며 활기차.',
  ESTJ: '체계적이고 책임감 강한 ESTJ야. 말할 때도 순서대로 정확하게 이야기해. 약간 딱딱하지만 믿음직스럽고 성실해.',
  ISFP: '조용하고 온화하며 예술적 감수성 있는 ISFP야. 말이 적고 느긋하게 자신의 경험을 나눠. 상대방을 판단하지 않고 있는 그대로 받아들여.',
  ISFJ: '세심하고 헌신적인 ISFJ야. 상대방의 작은 것도 기억하고 배려해. 말할 때 겸손하고 조심스러우며 따뜻해.',
  ISTP: '과묵하고 실용적인 ISTP야. 말이 짧고 핵심만 이야기해. 감정 표현은 거의 없지만 관찰력이 뛰어나고 상황 판단이 빠르.',
  ISTJ: '신중하고 책임감 강하며 규칙을 중시하는 ISTJ야. 사실에 근거하여 조목조목 이야기하고, 약간 딱딱하지만 신뢰할 수 있어.',
};

// ── 오늘 기분 퀴즈 맥락 ────────────────────────────────────────────────────────
const QUIZ_CTX = {
  q1: { A: '오늘 너무 바빠서 정신이 없었어', B: '오늘 여유롭고 평온한 하루였어', C: '오늘 좀 힘들고 지쳤어', D: '오늘 기분 좋은 일이 있었어' },
  q2: { A: '지금 맛있는 게 너무 먹고 싶어', B: '지금 그냥 누워서 쉬고 싶어', C: '지금 재밌는 걸 하고 싶어', D: '지금 누군가랑 수다 떨고 싶어' },
  q3: { A: '오늘 하루 열정적으로 움직였어', B: '오늘 차분하게 생각하는 날이었어', C: '오늘 감성적인 기분이 들었어', D: '오늘 아이디어가 넘쳤어' },
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── 봇 시스템 프롬프트 생성 ────────────────────────────────────────────────────
function buildPrompt({ mbti, age, job, detail, city, hobbies, otherMbti, moodCtx }) {
  let profile = `너는 ${PERSONAS[mbti]} `;

  // 인구통계 자연어 조합
  const demo = [];
  if (age)  demo.push(age);
  if (city) demo.push(`${city}에 살고`);
  if (job)  demo.push(job);
  if (demo.length) profile += demo.join(', ') + '야. ';

  // 세부 정보 (전공, 업무 등)
  if (detail) profile += `${detail}. `;

  // 취미
  if (hobbies) {
    const list = hobbies.split(',').filter(Boolean);
    if (list.length) profile += `취미는 ${list.join(', ')}야. `;
  }

  // 오늘 기분
  if (moodCtx) profile += `오늘 상황: ${moodCtx}. `;

  // 대화 지시
  profile += `지금 ${otherMbti} 성격의 친구를 처음 만나 가볍게 대화 중이야. `;
  profile += `반드시 딱 한 문장으로만 말해. 자연스러운 한국어 구어체로 말해. 이름이나 MBTI는 절대 언급하지 마. `;
  profile += `대화 가이드: ① 처음엔 나이·사는 곳·하는 일을 자연스럽게 녹여서 자기소개 해. ② 상대방이 무슨 일 하는지 궁금해하며 물어봐. ③ 공통 관심사나 차이가 나오면 그 주제로 자연스럽게 이어가.`;

  return profile;
}

// ── SSE 스트리밍 엔드포인트 ──────────────────────────────────────────────────
app.get('/api/stream', async (req, res) => {
  const {
    mbti1, mbti2,
    a_age, a_job, a_detail, a_city, a_hobbies,   // 나의 프로필
    b_age, b_job, b_detail,                        // 상대방 프로필
    q1, q2, q3,                                    // 오늘 기분
  } = req.query;

  if (!PERSONAS[mbti1] || !PERSONAS[mbti2]) {
    return res.status(400).json({ error: '유효하지 않은 MBTI 타입입니다.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  // 오늘 기분 맥락
  const moodCtx = [
    q1 && QUIZ_CTX.q1[q1],
    q2 && QUIZ_CTX.q2[q2],
    q3 && QUIZ_CTX.q3[q3],
  ].filter(Boolean).join('. ');

  const sysA = buildPrompt({
    mbti: mbti1, age: a_age, job: a_job, detail: a_detail,
    city: a_city, hobbies: a_hobbies, otherMbti: mbti2, moodCtx,
  });

  const sysB = buildPrompt({
    mbti: mbti2, age: b_age, job: b_job, detail: b_detail,
    city: null, hobbies: null, otherMbti: mbti1, moodCtx: null,
  });

  const chatA = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: sysA }).startChat();
  const chatB = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: sysB }).startChat();

  // 첫 트리거 — Bot A가 먼저 자기소개하도록 유도
  let lastBMsg = '안녕, 처음이지? 반가워!';

  try {
    for (let i = 0; i < 5; i++) {
      const resA = await chatA.sendMessage(lastBMsg);
      const textA = resA.response.text().trim();
      send({ mbti: mbti1, text: textA });
      await sleep(900);

      const resB = await chatB.sendMessage(textA);
      const textB = resB.response.text().trim();
      lastBMsg = textB;
      send({ mbti: mbti2, text: textB });
      await sleep(900);
    }
    send({ done: true });
  } catch (err) {
    console.error(err);
    send({ error: err.message });
  }

  res.end();
});

app.listen(3000, () => console.log('✅ 디토챗 실행 중 → http://localhost:3000'));
