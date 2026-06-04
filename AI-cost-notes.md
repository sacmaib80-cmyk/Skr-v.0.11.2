# SakuraQ — AI Cost Notes

## Stack ปัจจุบัน
- **Model**: Gemini 1.5 Flash (Google AI Studio)
- **Proxy**: Cloudflare Worker (`twilight-sea-1ac8.sacmaib80.workers.dev`)
- **Key**: ซ่อนอยู่ใน Cloudflare Worker (Environment Variable: `GEMINI_KEY`)

---

## Free Tier Limits

| Service | ฟรี | Reset |
|---|---|---|
| Gemini 1.5 Flash | 1,500 req/วัน | ทุกเที่ยงคืน UTC |
| Cloudflare Worker | 100,000 req/วัน | ทุกเที่ยงคืน UTC |

**ตัวคอขวด = Gemini (1,500/วัน)**

---

## Usage ประมาณการ

```
1 quest submit = 1 AI request ≈ 250 tokens
1,500 req/วัน ÷ 50 quests/วัน = พอใช้ 30 วัน (คนเดียว)
```

---

## Cost เมื่อ Scale

### Gemini Pricing
- Input:  $0.075 / 1M tokens
- Output: $0.30  / 1M tokens (ประมาณ)
- 1 request ≈ 200 input + 50 output tokens

### Cloudflare Worker Pricing
- Free:  100,000 req/วัน
- Paid:  $5/เดือน + $0.30/1M req

### ตารางคำนวณ (สมมติ active 30%, 5 quests/วัน)

| Users | DAU | Req/วัน | Gemini/เดือน | Cloudflare/เดือน | รวม/เดือน |
|---|---|---|---|---|---|
| 1 | 1 | 5 | $0 (free) | $0 (free) | **$0** |
| 100 | 30 | 150 | $0 (free) | $0 (free) | **$0** |
| 1,000 | 300 | 1,500 | ~$0.34 | $0 (free) | **~$0.34** |
| 10,000 | 3,000 | 15,000 | ~$3.38 | $5 | **~$8.38** |
| 100,000 | 30,000 | 150,000 | ~$84 | ~$6 | **~$90** |
| 1,000,000 | 300,000 | 1,500,000 | ~$844 | ~$56 | **~$900** |

---

## เมื่อถึงเวลา Scale

### ตัวเลือก Gemini Upgrade
- **Pay-as-you-go**: จ่ายตามใช้จริง ไม่มีขั้นต่ำ
- ไม่ต้องเปลี่ยน code เลย แค่ enable billing ใน Google Cloud

### ถ้า user เยอะมาก → ให้ user เอา key เอง
```
user ไป aistudio.google.com → สมัครฟรี → copy key → ใส่ใน SakuraQ settings
แต่ละคนใช้ free quota ของตัวเอง → ไม่มีค่าใช้จ่ายจากเจ้าของแอพเลย
```

---

## Revenue vs Cost (100,000 users)

```
Revenue (สมมติ $1/เดือน):   $100,000/เดือน
AI Cost:                        $90/เดือน
AI Cost คิดเป็น:               0.09% ของ revenue
```

---

## Links สำคัญ
- Gemini API Key: https://aistudio.google.com/apikey
- Cloudflare Worker: https://dash.cloudflare.com → Compute → Workers & Pages → twilight-sea-1ac8
- Gemini Pricing: https://ai.google.dev/pricing
- Cloudflare Pricing: https://developers.cloudflare.com/workers/platform/pricing/
