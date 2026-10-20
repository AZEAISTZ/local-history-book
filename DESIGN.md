# Design — ท้องถิ่นเล่าเรื่องประวัติศาสตร์ ประวัติศาสตร์ของท้องถิ่น

Locked design system (Hallmark). เฟส 5–6 ทุกรอบอ่านไฟล์นี้คู่กับ BUILD-SPEC.md ก่อนเขียนโค้ด
ทุกหน้าใช้ระบบเดียวกัน แก้ไฟล์นี้อย่างตั้งใจ — ไม่ใช่ override เฉพาะหน้า

> อัปเดต 2026-10-20: พาเลตสีและฟอนต์ถูกแทนที่ทั้งหมดตาม design_spec ของเจ้าของงาน
> (ดู BUILD-SPEC.md) — พาเลต Hotel De Bombay แทน Almanac, ฟอนต์ตระกูล IBM Plex Sans Thai
> แทน Noto Serif Thai/Sarabun โครงหน้า (macrostructure), nav และ footer จาก hallmark
> ยังใช้ต่อตามเดิม
>
> อัปเดต 2026-10-20 (ก่อน 5B): เปลี่ยนพาเลตจาก Hotel De Bombay เป็น **Noona Pickup** (Pantone)
> ตาม design_spec ใหม่ของเจ้าของงาน — โครงหน้า ฟอนต์ และ motion เดิมไม่เปลี่ยน

## System
- Genre · editorial (เนื้อหาวิชาการ/คลังเอกสาร ไม่ใช่ landing page ขายของ)
- Theme · catalog base: **Almanac** macrostructure/nav/footer เท่านั้น —
  พาเลตสีและตัวอักษร override ทั้งหมดด้วยสเปกเฉพาะโครงการ (Noona Pickup + IBM Plex)
  ไม่ใช้โทนสี/ฟอนต์เดิมของ Almanac (oxblood serif)
- Axes · paper-band: light (พื้นกระดาษผสมขึ้นเอง) · display-style: **sans editorial** (ไม่ใช่
  roman-serif แบบ Almanac เดิม) · accent-hue: navy (Poseidon) + orange CTA (Pureed Pumpkin)
- 2 macrostructures ตามประเภทหน้า (ไม่ใช่ 1 หน้า 1 ระบบแบบปกติของ Hallmark เพราะเว็บนี้มี 2 โครงหน้า):
  - **หน้าหลัก (`index.html`)** → macrostructure **Index-First** — หน้าคือรายการ 11 บท ไม่มี hero/การตลาด
  - **หน้าบท (`chapter.html`)** → macrostructure **Long Document** — เนื้อหาต่อเนื่องแบบบทความ ไม่มี CTA/การตลาด
- Nav · N3 Side-rail (รายการ 11 บทติดด้านข้างให้สลับบทได้ตลอดเวลาที่อ่าน — เข้ากับทั้งสองหน้า)
- Footer · Ft3 Index columns (คลังเอกสารมีสิทธิ์ใช้ footer แบบ index เพราะเว็บนี้คือ hub จริง ๆ)

## Tokens (canonical · ใช้ตรงใน `assets/css/style.css`)
```css
:root {
  /* Noona Pickup palette (Pantone) */
  --color-paper:      #F7F2EA; /* พื้นหลังกระดาษ — ผสมขึ้นเอง ไม่ใช่สี Pantone */
  --color-paper-2:    #EFE9DD; /* surface: การ์ด/footer/รายการ nav ที่เลือก — ไล่เฉดจาก paper */
  --color-rail-bg:    #DCEEF5; /* Norse Blue จาง — พื้นแถบสารบัญด้านข้าง (side-rail) เท่านั้น */
  --color-ink:        #1B2430; /* เนื้อความ, contrast 14:1 บน paper */
  --color-rule:       #4CA5C7; /* Norse Blue — เส้นคั่น/เส้นวาดใน hero เท่านั้น
                                   contrast กับ paper 2.5:1 ห้ามใช้เป็นสีตัวอักษรเด็ดขาด */
  --color-accent:      #123955; /* Poseidon — หัวเรื่อง, ลิงก์, เมนู, metadata, contrast 10.8:1 */
  --color-accent-ink:  #F7F2EA; /* ตัวอักษรบนพื้น accent */
  --color-cta:         #C34121; /* Pureed Pumpkin — ปุ่มหลัก, ชิปที่เลือก, เลขบท, ป้ายเลขหน้า,
                                   contrast กับ paper 4.6:1 */
  --color-cta-ink:     #FFFFFF; /* ตัวอักษรขาวบนพื้น cta, contrast 5.1:1 */
  --color-focus:       #2B6CB0; /* focus ring — น้ำเงิน แยกจากพาเลตชัดเจน เพื่อมองเห็นง่ายที่สุด */

  --font-display: "IBM Plex Sans Thai", "IBM Plex Sans", sans-serif;       /* ไม่มีหัว (loopless) */
  --font-body:    "IBM Plex Sans Thai Looped", "IBM Plex Sans", sans-serif; /* มีหัว (looped) */
  --font-mono:    "IBM Plex Mono", ui-monospace, monospace; /* เฉพาะ ISBN/เลขอ้างอิง */

  /* spacing 4pt scale: --space-3xs(2px) … --space-4xl(96px) */
  /* type scale 1.25 (major third): --text-xs … --text-display */
  --text-body: 18px;
  --leading-body: 1.8;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-fast: 180ms; --dur-base: 240ms; --dur-slow: 320ms; /* ช่วง motion ของ Anime.js: 300–600ms */

  --radius-card: 2px;   /* เกือบเหลี่ยม — โทนเอกสาร/ทะเบียน ไม่ใช่ซอฟต์แวร์ */
  --radius-pill: 999px; /* ใช้เฉพาะ tag/ป้ายเลขบท เลขหน้า */
  --radius-input: 2px;

  --tap-target-min: 44px; /* ปุ่ม/ลิงก์กดได้ขั้นต่ำ */
}
```

### Contrast (ตรวจ WCAG จริงด้วยสูตร relative luminance)
| คู่สี | Ratio | ใช้กับ |
|---|---|---|
| `--color-ink` #1B2430 บน `--color-paper` #F7F2EA | ~14:1 | เนื้อความทุกขนาด (ผ่าน AAA) |
| `--color-accent` #123955 บน `--color-paper` #F7F2EA | ~10.8:1 | หัวเรื่อง ลิงก์ เมนู metadata (ผ่าน AAA) |
| `--color-accent-ink` #F7F2EA บน `--color-accent` #123955 | ~10.8:1 | ตัวอักษรบนพื้น accent |
| `--color-cta` #C34121 บน `--color-paper` #F7F2EA | ~4.6:1 | เลขบท/ป้ายเลขหน้า (ตัวอักษร ≥ 24px ผ่าน AA) |
| `--color-cta-ink` #FFFFFF บน `--color-cta` #C34121 | ~5.1:1 | ตัวอักษรบนปุ่มหลัก/ชิปที่เลือก (ผ่าน AA) |
| `--color-rule` #4CA5C7 บน `--color-paper` #F7F2EA | ~2.5:1 | **เฉพาะ** เส้นคั่น/เส้นวาดใน hero/พื้นจาง `--color-rail-bg` ห้ามใช้เป็นสีตัวอักษรเด็ดขาด |

ห้ามใช้ `--color-rule` กับตัวอักษรไม่ว่าขนาดใดเด็ดขาด — metadata/คำอธิบายรองทั้งหมดใช้
`--color-accent` แทน (ไม่มี ink-2 แยกต่างหากอีกต่อไป เพื่อลดจำนวนตัวแปรสีที่ไม่จำเป็น)

## ฟอนต์ไทย+อังกฤษ — ตระกูล IBM Plex (Google Fonts, `&display=swap`)
- Display/UI (ไม่มีหัว, loopless): **IBM Plex Sans Thai** weight 500–700 —
  หัวเรื่องทุกระดับ, เลขบท, เมนู/nav, ปุ่ม, ช่องค้นหา, ป้ายเลขหน้า (น. X),
  ข้อมูลผู้เขียนและช่วงหน้าบนการ์ด
- Body (มีหัว, looped): **IBM Plex Sans Thai Looped** weight 400/500 —
  เนื้อความบทสรุปทุกพารากราฟ, คำโปรยบนการ์ด, ข้อความยาวทุกส่วน
- ขนาดเนื้อความ 18px / line-height 1.8 (`--text-body`, `--leading-body`)
- ภาษาไทย: ห้าม `letter-spacing` และห้ามจัด `text-align: justify`
- ห้ามใช้ Kanit, Prompt, Inter ทั้งเว็บ
- ห้าม italic บนหัวข้อ — italic ใช้ได้เฉพาะคำพูดอ้างอิงตรงในเนื้อสรุป (ตามกฎเหล็กข้อ 2 ของโครงการ)

## CTA voice
- Primary (ลิงก์ "อ่านฉบับเต็มบน AnyFlip", "บทต่อไป"): Filled · พื้น/border `--color-cta`
  · ตัวอักษร `--color-cta-ink` · radius `--radius-card` · padding `--space-sm --space-md`
  · ขนาดกดได้ ≥ `--tap-target-min` · hover: `filter: brightness(0.9)`
- Secondary (ลิงก์ในสารบัญ/side-rail): ข้อความล้วนสี `--color-accent` + ขีดเส้นใต้โผล่เป็น
  `--color-rule` เมื่อ hover/active (ใช้ได้เพราะเป็นเส้นไม่ใช่ตัวอักษร)
- ชิปกรองหมวดที่เลือก (`.chip[aria-pressed="true"]`): พื้น/border `--color-cta`
  · ตัวอักษร `--color-cta-ink`; ชิปที่ไม่เลือกยังเป็น outline `--color-accent`
- ป้ายเลขหน้า (น. X) และเลขบท (`.chapter-card-num`): พื้น/ตัวอักษร `--color-cta`/`--color-cta-ink`
  ฟอนต์ display, radius `--radius-pill`

## Motion stance — Anime.js v4 (CDN ES module)
- hero: วาดเส้นลายประดับ/เส้นคั่นครั้งเดียวตอนโหลดด้วย `svg.createDrawable`
- การ์ดสารบัญ (index): ค่อย ๆ ปรากฏเมื่อเลื่อนถึงด้วย `onScroll` + stagger
- ระยะเวลา 300–600ms (`--dur-base`/`--dur-slow`) ease-out (`--ease-out`)
- ไม่ใช้ parallax และไม่ใช้ Three.js
- Reduced-motion: `prefers-reduced-motion` ปิดแอนิเมชันทั้งหมด (ข้าม `createDrawable`/`onScroll`,
  แสดงผลลัพธ์สุดท้ายทันที)

## Pages (ไม่ใช่ 1 หน้า = 1 ระบบปกติของ Hallmark — โน้ตไว้ให้เฟส 5 เห็นชัด)
- **index.html** — Index-First: hero สั้น ๆ แสดงข้อมูลหนังสือ/เครดิต/ลิงก์ AnyFlip
  (เส้นประดับ Anime.js วาดครั้งเดียว) + ช่องค้นหา/กรองบท + รายการบทจัดกลุ่มตามหมวดแบบ card เบา ๆ
  (เลขบท, ชื่อ, ผู้เขียน, ช่วงหน้า, ใจความ 1 บรรทัด) ไม่มี hero image ไม่มี CTA การตลาด
- **chapter.html** — Long Document: title + metadata ผู้เขียน/เลขหน้า → แถบความคืบหน้าการอ่าน
  → สารบัญย่อยหัวข้อในบท → เนื้อสรุป (65–75ch measure) → ประเด็นสำคัญ (bullet) → แหล่งอ้างอิง
  → ปุ่มบทก่อนหน้า/ถัดไป + ปุ่ม "กลับสู่สารบัญ" (บนและล่าง) + ลิงก์ "อ่านต้นฉบับ"
  เลขหน้า (น. X) แสดงเป็นป้ายเล็กตามสเปก CTA voice ด้านบน
  Side-rail (N3) แสดงรายการ 11 บท ย่อเป็นปุ่มเมนูที่จอเล็ก (mobile)

## กฎที่ห้ามใช้ (จาก design_spec)
gradient ม่วง-ฟ้า, ฟอนต์ Inter/Kanit/Prompt, emoji แทนไอคอน, glassmorphism,
การ์ดซ้อนการ์ด, ตัวอักษรเทาบนพื้นสี

## Exports
`assets/css/style.css` เป็น source of truth เดียว (ไม่มี build step จึงไม่แยก `tokens.css`
เพิ่มอีกไฟล์ — ใส่ token block ไว้บนสุดของ `style.css` แทน)
