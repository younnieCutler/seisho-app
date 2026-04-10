# PRD: Seisho App — UI & 로고 비주얼 랭귀지 정의서

> **문서 목적:** 앱의 모든 화면, 컴포넌트, 아이콘, 로고에 필요한 시각 요소를 마이크로 단위까지 명세한다.
> 디자이너/개발자가 이 문서 하나만으로 픽셀 수준의 의사결정을 내릴 수 있어야 한다.

---

## 1. Summary

Seisho App의 시각 언어를 **"Bonbon Drop"** 시스템으로 통일한다.  
ボンボンドロップシール(봉봉 드롭 씰) — 일본식 반투명 광택 스티커에서 영감을 받은 이 텍스처는,  
앱의 "Digital Sanctuary" 철학(고요함, 아늑함, 영적 집중)과 결합하여  
"성경 말씀이 이슬처럼 마음에 맺히는" 시각적 은유를 만든다.

적용 범위: 앱 아이콘, 스플래시, 탭바, 배지, 버튼, 카드, GrassGraph, 노트 패널, 온보딩, 그룹 피드.

---

## 2. Contacts

| 이름 | 역할 | 비고 |
|------|------|------|
| 앱 오너 | 기획/최종 결정 | 본 PRD 승인자 |
| 개발자 | React Native 구현 | `src/utils/theme.ts` 기준으로 토큰화 |

---

## 3. Background

### 현재 상태

앱은 기능적으로 완성도가 높다 (P0~P5 완료). 그러나 UI는 아직 **토큰 기반 스타일링** 수준에 머물러 있다:
- 탭 아이콘: Unicode 특수문자 (✦ ⊛ ⊘ ⊕)
- 배지: 단색 원형
- 카드: 플랫 White + 그림자
- 앱 아이콘: 미정

### 왜 지금인가

P6 소그룹 기능 이후 TestFlight 베타 배포를 앞두고 있다.  
앱스토어 제출 시 **앱 아이콘, 스플래시, 스크린샷**이 필요하다.  
또한 소그룹 기능은 다른 사람에게 보여지는 첫 번째 공개 화면이라  
브랜드 인상이 중요해졌다.

### 텍스처 영감: ボンボンドロップシール

봉봉 드롭 씰의 시각적 특성:
- **반투명 베이스**: 색상이 있지만 깊이가 느껴지는 투명감
- **상단 하이라이트**: 요소 상단 30~40%에 흰색 광택 그라디언트 오버레이
- **내부 글로우**: 중심에서 바깥으로 퍼지는 부드러운 빛
- **형태**: 완전한 라운드 (pill 또는 원형)
- **엣지**: 미세한 명도 차이로 입체감 표현 (하드 보더 없음)
- **은유**: 이슬방울, 물방울 사탕, 비눗방울 — 가볍고 맑고 순수함

---

## 4. Objective

### 목표

앱의 모든 시각 요소가 **하나의 일관된 감각 언어**로 통일되어,  
사용자가 앱을 열었을 때 "이 공간은 내 영적 일상을 위한 특별한 곳"이라고 느끼게 한다.

### 핵심 결과 (KR)

- KR1: 앱 아이콘~온보딩~홈까지 텍스처 연속성 100% (모든 배지/버튼에 Bonbon 처리)
- KR2: 디자이너가 이 문서만으로 Figma 컴포넌트를 만들 수 있어야 함 (구현 질문 0개)
- KR3: TestFlight 제출 시 필요한 모든 에셋 명세 완료 (아이콘 9종 + 스플래시 3종)

---

## 5. Market Segment

**주 사용자:** 한국 기독교인 20~50대, 성경 읽기를 습관화하고 싶은 사람  
**시각 제약:** 
- 작은 텍스트에 익숙하지 않은 40~50대 포함 → 최소 터치 영역 44×44pt 필수
- 다크모드 필수 지원 (야간 기도 시간 사용자)
- 저사양 기기 고려 → blur/shadow 효과는 `shadowOpacity < 0.12` 수준 유지

---

## 6. Value Proposition

| 사용자 니즈 | 현재 (Before) | Bonbon Drop 이후 (After) |
|------------|---------------|--------------------------|
| "매일 여는 앱이 아름다웠으면" | 단색 플랫 UI | 이슬처럼 빛나는 배지와 버튼 |
| "말씀이 소중하게 느껴졌으면" | 텍스트만 강조 | Serif 본문 + 광택 프레임의 조화 |
| "소그룹 피드가 SNS 같지 않았으면" | 미구현 | 차분한 카드 + 부드러운 아바타 |
| "아이콘부터 다른 앱과 달랐으면" | 미정 | Bonbon Drop 앱 아이콘 |

---

## 7. Solution

---

### 7.0 디자인 토큰 (전역 변수)

모든 수치는 이 섹션에서 정의하며 컴포넌트는 이를 참조한다.

#### 7.0.1 색상 토큰 (theme.ts 확장)

```typescript
// 현재 theme.ts의 Colors 객체에 아래 추가
export const BonbonTokens = {
  // 하이라이트 오버레이 (Bonbon 광택 레이어)
  highlightTop: 'rgba(255, 255, 255, 0.55)',   // 상단 광택
  highlightBottom: 'rgba(255, 255, 255, 0.00)', // 하단 투명

  // Primary Bonbon (Sage Green 계열)
  bonbonPrimaryBase: '#6B8E7B',
  bonbonPrimaryGlow: 'rgba(107, 142, 123, 0.25)',
  bonbonPrimarySheen: 'rgba(107, 142, 123, 0.08)',

  // Season Bonbons
  bonbonAdvent:    { base: '#5D6D7E', glow: 'rgba(93,109,126,0.20)' },
  bonbonChristmas: { base: '#A66B6B', glow: 'rgba(166,107,107,0.20)' },
  bonbonEpiphany:  { base: '#C8960A', glow: 'rgba(200,150,10,0.20)' },
  bonbonLent:      { base: '#7D6B91', glow: 'rgba(125,107,145,0.20)' },
  bonbonHolyWeek:  { base: '#5D666D', glow: 'rgba(93,102,109,0.20)' },
  bonbonEaster:    { base: '#B8924A', glow: 'rgba(184,146,74,0.20)' },
  bonbonPentecost: { base: '#B36B6B', glow: 'rgba(179,107,107,0.20)' },
  bonbonOrdinary:  { base: '#6B8E7B', glow: 'rgba(107,142,123,0.20)' },
}
```

#### 7.0.2 간격 토큰

```typescript
export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
}
```

#### 7.0.3 반경 토큰

```typescript
export const Radius = {
  sm:   10,  // 배지 내부 태그
  md:   16,  // 소그룹 메시지 버블
  lg:   20,  // 버튼, 노트 패널
  xl:   28,  // 카드
  full: 999, // 원형 배지, pill
}
```

#### 7.0.4 그림자 토큰

```typescript
export const Shadows = {
  // Whisper (카드 기본)
  whisper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  // Bonbon Glow (배지, 활성 요소)
  bonbonGlow: {
    shadowColor: '#6B8E7B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 4,
  },
  // 시즌별 glow는 해당 season 색상을 shadowColor로 교체
}
```

---

### 7.1 앱 아이콘 (App Icon)

#### 개념

"이슬에 젖은 나뭇잎 위의 물방울" — 앱을 열기 전부터 영적 고요함을 전달한다.

#### 형태 명세

| 속성 | 값 |
|------|-----|
| 배경 | Deep Sage: `#3D6654` (light) / `#121612` (dark) |
| 형태 | 정원 (iOS는 자동 마스킹, Android는 Adaptive Icon) |
| 중심 요소 | 십자가를 형상화한 단순 기호 — `✦` 의 4각 별 모티프를 벡터화 |
| 텍스처 | Bonbon Drop: 상단 40%에 흰 광택 그라디언트 (55%→0% opacity) |
| 내부 글로우 | 중앙에서 바깥으로 퍼지는 Sage Green 발광 (`rgba(107,142,123,0.35)`) |
| 엣지 | 아이콘 외곽에 2px 두께의 반투명 흰 테두리 (`rgba(255,255,255,0.15)`) |

#### 에셋 목록 (iOS)

| 용도 | 크기 |
|------|------|
| iPhone Notification | 20×20, 40×40, 60×60 pt |
| iPhone Settings | 29×29, 58×58, 87×87 pt |
| iPhone Spotlight | 40×40, 80×80, 120×120 pt |
| iPhone App | 60×60, 120×120, 180×180 pt |
| iPad | 76×76, 83.5×83.5, 152×152, 167×167 pt |
| App Store | 1024×1024 px (no alpha) |

#### 에셋 목록 (Android)

| 용도 | 크기 |
|------|------|
| mipmap-mdpi | 48×48 px |
| mipmap-hdpi | 72×72 px |
| mipmap-xhdpi | 96×96 px |
| mipmap-xxhdpi | 144×144 px |
| mipmap-xxxhdpi | 192×192 px |
| Adaptive foreground | 108×108 px (safe zone: 72×72 중앙) |

---

### 7.2 스플래시 스크린 (Splash Screen)

| 속성 | Light | Dark |
|------|-------|------|
| 배경색 | `#F9FAF9` (Muted Mist) | `#121612` (Deep Obsidian) |
| 중앙 요소 | 앱 아이콘 120×120pt + Bonbon Drop 텍스처 |  |
| 로고 아래 텍스트 | "성서" — NotoSerifKR 400, 18pt, `#6B8E7B` |  |
| 텍스트 아래 | "· · ·" 점 세 개 로딩 인디케이터 (`#8C9BA5`, 8pt) |  |
| 애니메이션 | 아이콘 scale 0.85→1.00, easing: ease-out, 600ms |  |

---

### 7.3 온보딩 화면 (OnboardingScreen)

> 현재 구현: 단색 버튼, 시스템 폰트. 개선 필요.

#### 레이아웃

```
[상단 여백: safe area top + 80pt]
[로고/아이콘: 72×72pt, Bonbon Drop]
[앱명: "성서" — NotoSerifKR, 28pt, primary]
[부제: "묵상을 이어가는 가장 쉬운 방법" — Inter 500, 14pt, textSecondary]
[여백: 48pt]
[안내: "연령대를 선택해주세요" — Inter 500, 13pt, textMuted]
[여백: 16pt]
[선택지 버튼 × 5]
[여백: 40pt]
[CTA 버튼: "시작하기"]
[여백: safe area bottom + 32pt]
```

#### 선택지 버튼 (연령대 옵션)

| 상태 | 배경 | 테두리 | 텍스트 |
|------|------|---------|--------|
| 기본 | `colors.surface` | 1px `colors.border` | `colors.text`, Inter 500 |
| 선택됨 | `bonbonPrimarySheen` (`rgba(107,142,123,0.08)`) | 1.5px `colors.primary` | `colors.primary`, Inter 600 |
| 선택됨 + Bonbon | 상단에 4pt 높이 흰 광택 오버레이 추가 | — | — |

- height: 56pt
- borderRadius: `Radius.lg` (20)
- 터치 영역: 전체 너비, 최소 44pt 높이

#### CTA 버튼 "시작하기"

→ 7.8 Primary Button 명세 참조

---

### 7.4 탭 바 (Tab Bar)

> 현재: Unicode 기호 (✦ ⊛ ⊘ ⊕). 최종적으로 커스텀 아이콘으로 교체할 것을 권장하나,  
> 단기적으로는 아래 Bonbon Pill 처리로 퀄리티를 높인다.

#### 탭 바 컨테이너

| 속성 | 값 |
|------|-----|
| 배경 | `colors.surface` |
| 상단 테두리 | 1px `colors.border` |
| 높이 (iOS) | 60 + safeArea.bottom |
| 높이 (Android) | 68pt |
| 상하 패딩 | 상: 8pt, 하: safeArea.bottom or 8pt |

#### 탭 아이콘 — 활성 상태 (Bonbon Pill)

| 속성 | 값 |
|------|-----|
| 컨테이너 형태 | Pill: `paddingH: 20, paddingV: 6, borderRadius: 20` |
| 배경 | `colors.primary` |
| **Bonbon 레이어** | 컨테이너 상단 50%에 LinearGradient: `rgba(255,255,255,0.35)→rgba(255,255,255,0)` |
| **Bonbon Glow** | boxShadow: `0 2 12 rgba(107,142,123,0.40)` |
| 아이콘 색 | `#FFFFFF` |
| 아이콘 크기 | 18pt |
| 레이블 색 | `colors.text`, Inter 600 |

#### 탭 아이콘 — 비활성 상태

| 속성 | 값 |
|------|-----|
| 컨테이너 배경 | transparent |
| 아이콘 색 | `colors.textMuted` |
| 레이블 색 | `colors.textMuted`, Inter 500 |
| 레이블 크기 | 10pt |

#### 최종 아이콘 (단기 Unicode → 중기 SVG 대체)

| 탭 | Unicode (현재) | SVG 아이콘 (목표) |
|----|---------------|-----------------|
| 오늘 | ✦ | 햇살 or 십자 별 (4각, 8pt stroke) |
| 읽기 | ⊛ | 펼친 성경책 (outline) |
| 기록 | ⊘ | 풀잎 / 씨앗 (habit 은유) |
| 나눔 | ⊕ | 두 사람 (소그룹 은유) |

SVG 크기: 24×24pt viewBox, stroke: 1.5pt, fill: none (outline 스타일)

---

### 7.5 홈 화면 (HomeScreen)

#### 7.5.1 시즌 배지 (Season Badge) — Bonbon Drop

이것이 Bonbon 텍스처가 가장 선명하게 드러나는 요소다.

```
[Pill 형태]
  └ 배경: 시즌 색상 base + 10% opacity (이미 구현됨: `${SEASON_COLOR[season]}22`)
  └ 상단 30% LinearGradient: rgba(255,255,255,0.45)→rgba(255,255,255,0)
  └ 테두리: 0.5px rgba(255,255,255,0.6) (inner glow 효과)
  └ 그림자: bonbonGlow (해당 season 색으로 교체)
  └ 텍스트: Inter 600, 11pt, 시즌 색상 base
  └ paddingH: 12, paddingV: 5
  └ borderRadius: Radius.full (999)
```

**8개 시즌별 명세:**

| 시즌 | 베이스 | Glow 색 | 배지 배경 |
|------|--------|---------|---------|
| 대림절 (ADVENT) | `#5D6D7E` | `rgba(93,109,126,0.30)` | `#5D6D7E` + 13% opacity |
| 성탄절 (CHRISTMAS) | `#A66B6B` | `rgba(166,107,107,0.30)` | `#A66B6B` + 13% opacity |
| 주현절 (EPIPHANY) | `#C8960A` | `rgba(200,150,10,0.30)` | `#C8960A` + 13% opacity |
| 사순절 (LENT) | `#7D6B91` | `rgba(125,107,145,0.30)` | `#7D6B91` + 13% opacity |
| 고난주간 (HOLY_WEEK) | `#5D666D` | `rgba(93,102,109,0.30)` | `#5D666D` + 13% opacity |
| 부활절 (EASTER) | `#B8924A` | `rgba(184,146,74,0.30)` | `#B8924A` + 13% opacity |
| 성령강림절 (PENTECOST) | `#B36B6B` | `rgba(179,107,107,0.30)` | `#B36B6B` + 13% opacity |
| 일반 주간 (ORDINARY) | `#6B8E7B` | `rgba(107,142,123,0.30)` | `#6B8E7B` + 13% opacity |

#### 7.5.2 말씀 카드

| 속성 | 값 |
|------|-----|
| 배경 | `colors.surface` |
| borderRadius | 32pt (`Radius.xl` + 4) |
| padding | 32pt |
| 그림자 | `Shadows.whisper` |
| **Bonbon 미세 처리** | 카드 상단 내부에 LinearGradient: `rgba(255,255,255,0.6)→rgba(255,255,255,0)`, 높이 80pt |

**카드 내부 요소 계층:**

```
[시즌 배지]              ← Bonbon Drop pill
[여백: 24pt]
[성경 위치: reference]   ← Inter 500, 14pt, textMuted
[여백: 12pt]
[말씀 본문: verse]       ← NotoSerifKR 400, 20pt, lineHeight 38, text
[여백: 32pt]
[구분선: 1pt border]
[여백: 24pt]
[streak 행]
  ├ [레이블: "지속 가능한 묵상"] ← Inter 500, 12pt, textSecondary
  ├ [일수: "{n}일째 이어가는 중"] ← Inter 600, 16pt, text
  └ [Streak Badge]             ← Bonbon Drop 원형 배지 (7.5.3)
```

#### 7.5.3 Streak Badge — Bonbon Drop

앱에서 가장 핵심적인 Bonbon 요소.

```
[원형: width 44, height 44, borderRadius 22]
  └ 배경: colors.primary (#6B8E7B)
  └ Bonbon 레이어 1 (상단 광택):
      LinearGradient (상→하, 0%→50%):
        rgba(255,255,255,0.55) → rgba(255,255,255,0)
  └ Bonbon 레이어 2 (내부 글로우):
      RadialGradient (중심→바깥):
        rgba(255,255,255,0.20) → rgba(255,255,255,0)
  └ 그림자: shadowColor '#6B8E7B', opacity 0.45, radius 12, offset y:3
  └ 아이콘: ✦, 20pt, '#FFFFFF'
```

> 구현 시: `expo-linear-gradient`의 `LinearGradient`를 `View` 위에 absolute position으로 overlay.

---

### 7.6 읽기 화면 (ReadingScreen)

#### 7.6.1 헤더 바

```
[배경: colors.background (반투명 blur 권장)]
[safe area top + 12pt]
[성경 위치: "창세기 1장" — Inter 600, 16pt, text]
[부제: 시즌명 — Inter 500, 12pt, textSecondary]
```

#### 7.6.2 성경 본문 리스트

| 속성 | 값 |
|------|-----|
| 폰트 | NotoSerifKR 400 |
| 크기 | 18pt |
| 줄 간격 | 30pt (lineHeight) |
| 절 번호 | Inter 500, 11pt, textMuted, `paddingRight: 12` |
| 하이라이트 절 | 배경 `bonbonPrimarySheen`, 좌측 3pt 세로 바 `colors.primary` |
| 항목 간격 | `paddingVertical: 12` |

#### 7.6.3 Footer 영역

**묵상 노트 패널 (noteVisible = true)**

```
[notePanel: borderRadius 20, padding 16, border 1pt colors.border]
  └ 배경: colors.surface
  └ **Bonbon 레이어**: 상단 LinearGradient rgba(255,255,255,0.5)→rgba(255,255,255,0), height 40pt
  └ [레이블] "오늘 묵상을 짧게 기록해보세요" — Inter 500, 12pt, textSecondary
  └ [여백: 10pt]
  └ [TextInput]
      배경: colors.background
      border: 1pt colors.border (포커스 시: 1.5pt colors.primary)
      borderRadius: 12pt
      padding: 12pt
      폰트: NotoSerifKR 400, 16pt, lineHeight 24
      placeholderColor: textMuted
      minHeight: 80pt / maxHeight: 140pt
      textAlignVertical: 'top'
  └ [여백: 12pt]
  └ [Actions 행: justifyContent flex-end, gap 12]
      └ [건너뛰기 버튼] paddingH 16, paddingV 8, Inter 500, 14pt, textMuted
      └ [저장 버튼] → Bonbon Secondary Button (7.8.2)
```

**"묵상 완료" / "✦ 오늘 읽기 완료" 버튼**

→ 7.8 Primary Button 명세 참조

---

### 7.7 기록 화면 (RecordScreen)

#### 7.7.1 헤더

```
[paddingTop: safeArea.top + 16pt, paddingH: 32pt]
[타이틀: "나의 성과" — Inter 600, 20pt, text]
[부제: "꾸준함이 영성을 만듭니다" — Inter 500, 14pt, textSecondary]
```

#### 7.7.2 Streak 카드

```
[Card: marginH 24, padding 32, borderRadius 32, Shadows.whisper]
  └ [streakInfo: alignItems center]
      ├ 숫자: Inter 600, 64pt, primary (현재 streak)
      └ 레이블: "Days Streak" — Inter 500, 11pt, textMuted, uppercase, letterSpacing 1
  └ [divider: height 1, colors.border]
  └ [섹션 타이틀: "활동 기록" — Inter 600, 11pt, textSecondary, uppercase]
  └ [GrassGraph] ← 7.7.3
```

**Streak 숫자 Bonbon 처리:**  
숫자 뒤에 RadialGradient 배경: `rgba(107,142,123,0.08)` 원형, 지름 120pt, blur 처리.  
(숫자가 빛나는 것처럼 보이게)

#### 7.7.3 GrassGraph 셀 — Bonbon Drop

각 셀이 작은 봉봉 드롭 씰처럼 보여야 한다.

| 상태 | 크기 | 배경 | Bonbon 처리 |
|------|------|------|------------|
| 읽은 날 | 12×12pt | `colors.primary` | 상단 35% 흰 광택, borderRadius 4, glow shadow |
| 읽지 않은 날 | 12×12pt | `colors.border` | borderRadius 4, glow 없음 |
| 오늘 (읽음) | 12×12pt | `colors.primary` + 테두리 2pt `rgba(255,255,255,0.8)` | Bonbon 최대 적용 |
| 오늘 (미읽음) | 12×12pt | `colors.border` + 점선 테두리 1pt primary | 강조 표시 |

셀 간격: 3pt (gap)  
행 간격: 4pt  
12주 × 7일 = 84셀

**읽은 날 셀 Bonbon 상세:**
```
[View: 12×12, borderRadius 4, backgroundColor primary]
  └ [LinearGradient overlay: absolute, top 0, height 5]
      rgba(255,255,255,0.6) → rgba(255,255,255,0)
  └ shadowColor: colors.primary, opacity 0.4, radius 3, offset y:1
```

#### 7.7.4 묵상 노트 카드

```
[Card: marginH 24, marginTop 16, padding 24-32, borderRadius 32, Shadows.whisper]
  └ [섹션 타이틀: "묵상 노트" — Inter 600, 11pt, textSecondary, uppercase]
  └ [여백: 16pt]
  └ [빈 상태] or [노트 목록]
```

**노트 아이템:**
```
[noteItem: paddingV 16, borderBottom 1pt colors.border]
  └ [날짜: "2026-04-11" — Inter 500, 11pt, textMuted]
  └ [여백: 6pt]
  └ [내용: NotoSerifKR 400, 16pt, lineHeight 24, text]
```

---

### 7.8 버튼 시스템

#### 7.8.1 Primary Button (Bonbon CTA)

"오늘의 말씀 읽기", "시작하기", "묵상 완료" 등 주요 CTA.

```
[Container]
  높이: 최소 56pt
  width: 일반적으로 full-width (marginH 24)
  borderRadius: Radius.lg (20)
  배경: colors.primary (#6B8E7B)
  padding: 20pt vertical

[Bonbon 레이어 (absolute overlay)]
  position: absolute, top 0, left 0, right 0
  height: 40% (약 22pt)
  LinearGradient: rgba(255,255,255,0.40) → rgba(255,255,255,0)
  borderRadius: Radius.lg top only

[그림자]
  shadowColor: colors.primary
  shadowOpacity: 0.35
  shadowRadius: 16
  shadowOffset: { width: 0, height: 4 }
  elevation: 6

[텍스트]
  Inter 600, 16pt, '#FFFFFF'

[비활성 상태]
  배경: colors.border
  그림자: 없음
  텍스트: colors.textMuted
```

#### 7.8.2 Secondary Button (Bonbon Outline)

"저장" (노트 패널), 소그룹 관련 보조 버튼.

```
[Container]
  paddingH: 20, paddingV: 8
  borderRadius: Radius.full (999) → pill 형태
  배경: colors.primary
  그림자: bonbonGlow (작은 버전)

[Bonbon 레이어]
  LinearGradient: rgba(255,255,255,0.35) → rgba(255,255,255,0)
  높이의 40%

[텍스트]
  Inter 600, 14pt, '#FFFFFF'
```

#### 7.8.3 Ghost Button

"건너뛰기", 소그룹 코드 재생성 등 낮은 우선순위 액션.

```
배경: transparent
테두리: 없음
텍스트: Inter 500, 14pt, colors.textMuted
터치 시: opacity 0.6
```

#### 7.8.4 Chip/Tag Button (선택지)

온보딩 연령대 버튼, 필터 등.

```
[기본]
  배경: colors.surface
  테두리: 1pt colors.border
  borderRadius: Radius.md (16)
  height: 56pt
  텍스트: Inter 500, 16pt, colors.text

[선택됨 Bonbon]
  배경: rgba(107,142,123,0.08)
  테두리: 1.5pt colors.primary
  Bonbon 레이어: 상단 30% 흰 광택
  텍스트: Inter 600, 16pt, colors.primary
```

---

### 7.9 소그룹 피드 (GroupFeedScreen)

#### 7.9.1 그룹 코드 배지

```
[Container: alignSelf center, paddingH 20, paddingV 8]
  borderRadius: Radius.full
  배경: colors.surface
  테두리: 1pt colors.border

[내용]
  상단: "그룹 코드" — Inter 500, 11pt, textMuted
  하단: "ABC123" — Inter 600, 20pt, letterSpacing 4, text

[Bonbon 처리]
  배경 내부 상단 LinearGradient: rgba(255,255,255,0.5)→rgba(255,255,255,0)
  그림자: Shadows.whisper
```

#### 7.9.2 피드 메시지 버블

| 타입 | 배경 | 정렬 | 테두리 |
|------|------|------|--------|
| 내 메시지 | `colors.primary` | 우측 | 없음 |
| 상대 메시지 | `colors.surface` | 좌측 | 0.5pt colors.border |
| 시스템 메시지 | transparent | 중앙 | 없음 |

```
내 메시지 Bonbon:
  배경: colors.primary
  LinearGradient 상단 40%: rgba(255,255,255,0.30)→rgba(255,255,255,0)
  borderRadius: 16 (좌하: 4pt — 꼬리 방향)
  텍스트: NotoSerifKR 400, 15pt, '#FFFFFF', lineHeight 22

상대 메시지:
  배경: colors.surface
  borderRadius: 16 (우하: 4pt)
  텍스트: NotoSerifKR 400, 15pt, colors.text

닉네임:
  Inter 600, 11pt, textSecondary
  marginBottom: 4pt
```

#### 7.9.3 아바타 (닉네임 이니셜)

```
[원형: 32×32pt, borderRadius 16]
  배경: 닉네임 해시 기반 BonbonTokens.bonbon* 계열 중 선택
  Bonbon 레이어: 상단 40% 광택
  그림자: bonbonGlow
  텍스트: Inter 600, 13pt, '#FFFFFF'
  (이니셜 1~2자)
```

#### 7.9.4 입력창 (TextInput)

```
[Container: 배경 colors.surface, borderTop 1pt colors.border]
  paddingH: 16, paddingV: 12

[TextInput]
  배경: colors.background
  borderRadius: 20pt (pill)
  paddingH: 16, paddingV: 10
  폰트: Inter 500, 15pt
  placeholder: colors.textMuted
  border: none (배경 대비로만 구분)

[포커스 상태]
  테두리: 1.5pt colors.primary
  내부 Bonbon 상단 glow: rgba(107,142,123,0.06)

[전송 버튼]
  → Primary Button 축소형 (40×40pt 원형 Bonbon)
  비활성: colors.border (텍스트 없을 때)
  활성: colors.primary + Bonbon glow
```

---

### 7.10 닉네임 설정 화면 (NicknameSetup)

```
[레이아웃: 중앙 정렬, paddingH 32]
타이틀: "닉네임을 만들어주세요" — Inter 600, 22pt, text
부제: "소그룹에서 불릴 이름이에요" — Inter 500, 14pt, textSecondary
[여백: 40pt]

[TextInput]
  배경: colors.surface
  borderRadius: 16pt
  padding: 16pt
  폰트: Inter 500, 18pt, text
  border: 1pt colors.border (포커스: 1.5pt primary + 하단 glow)
  maxLength: 12

[글자수 카운터]
  우측 하단: Inter 500, 11pt, textMuted
  "{n}/12"

[여백: 32pt]
[CTA: "확인" → Primary Button]
```

---

### 7.11 빈 상태 / 로딩 상태

#### 빈 상태 (Empty State)

```
[중앙 정렬]
[아이콘: 48×48pt Bonbon Drop 원형, colors.border 배경, textMuted 이모지/기호]
[여백: 16pt]
[타이틀: Inter 600, 16pt, text]
[부제: Inter 500, 13pt, textMuted, lineHeight 20, 최대 2줄]
[여백: 24pt]
[액션 버튼] (있을 경우) → Primary or Ghost Button
```

예시:
- 읽기 기록 없음: 🌱 "아직 기록이 없어요" / "오늘 첫 말씀을 읽어보세요"
- 묵상 노트 없음: ✦ "아직 묵상 노트가 없습니다" / "읽기를 완료하고 첫 기록을 남겨보세요"
- 소그룹 없음: ○ "아직 소그룹에 속해있지 않아요" / "코드로 참여하거나 새 그룹을 만들어보세요"

#### 로딩 상태

```
ActivityIndicator
  size: 'small'
  color: colors.primary
  배경 컨테이너: flex 1, center
```

---

### 7.12 마이크로 인터랙션

| 요소 | 인터랙션 | 수치 |
|------|----------|------|
| 모든 TouchableOpacity | scale down on press | `activeOpacity: 0.80` |
| Primary Button | scale 1.00→0.97, 150ms ease-out | `Animated.spring` |
| Streak Badge | tap → scale 1.00→1.12→1.00, 300ms | 완료 애니메이션 |
| GrassGraph 셀 | tap → opacity pulse (1.0→0.6→1.0) | 100ms |
| Tab Pill | Bonbon 배경 fade in, 200ms | `Animated.timing` |
| 노트 패널 | 아래에서 위로 slide in + opacity, 250ms | `Animated.spring` |
| Season Badge | 앱 시작 시 scale 0→1, bounce, 400ms | 최초 로드만 |

---

### 7.13 접근성 (Accessibility)

| 요소 | 최소 터치 영역 |
|------|--------------|
| 모든 버튼 | 44×44pt |
| 탭 아이콘 | 44×44pt |
| GrassGraph 셀 | 개별 탭 불필요 (정보 표시 전용) |
| 소그룹 좋아요/반응 | 44×44pt |
| 닉네임 입력 | 전체 너비 |

---

### 7.14 다크모드 대응

| 요소 | Light | Dark |
|------|-------|------|
| Bonbon 상단 광택 | `rgba(255,255,255,0.55)` | `rgba(255,255,255,0.35)` |
| 카드 상단 내부 glow | `rgba(255,255,255,0.60)` | `rgba(255,255,255,0.08)` |
| Streak Badge glow | `shadowOpacity 0.35` | `shadowOpacity 0.60` (더 선명하게) |
| Season Badge | 베이스 동일, glow intensity +20% | |
| Button Bonbon 광택 | `rgba(255,255,255,0.40)` | `rgba(255,255,255,0.25)` |

---

## 8. Release

### Phase 1 (즉시 적용 가능, 코드 변경)
- 7.5.3 Streak Badge Bonbon (LinearGradient overlay 추가)
- 7.7.3 GrassGraph 셀 Bonbon (LinearGradient overlay 추가)
- 7.8 버튼 시스템 — Primary Button Bonbon 레이어
- 7.5.1 Season Badge glow shadow

### Phase 2 (디자인 에셋 필요)
- 7.1 앱 아이콘 (1024×1024 포함 전 사이즈)
- 7.2 스플래시 스크린
- 7.4 탭 아이콘 SVG

### Phase 3 (추가 구현 필요)
- 7.12 마이크로 인터랙션 Animated API
- 7.9 소그룹 아바타 색상 해시
- 7.11 빈 상태 아이콘

### 에셋 우선순위

```
P0 (앱스토어 필수): 앱 아이콘 × 9사이즈, 스플래시
P1 (퀄리티 핵심): Streak Badge Bonbon, Season Badge Bonbon
P2 (완성도): 탭 SVG 아이콘, Button Bonbon
P3 (디테일): 마이크로 인터랙션, GrassGraph 셀 Bonbon
```

---

*문서 버전: 1.0 / 작성일: 2026-04-11 / 다음 업데이트: Phase 1 구현 후*
