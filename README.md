# Mind Map

AI 기반 마인드맵 앱입니다. React Native(Expo)로 제작되어 웹, iOS, Android에서 모두 사용 가능합니다. 마인드맵을 만들고, 여러 주제를 탭으로 관리하며, AI가 기존 노드들을 분석하여 창의적인 아이디어를 추천해줍니다.

## 주요 기능

- **마인드맵 캔버스** — 드래그 앤 드롭 노드 + 베지어 커브 연결선
- **멀티 탭** — 주제별로 별도의 탭에서 관리
- **노드 편집** — 추가, 수정, 삭제, 색상 변경
- **자동 배치** — 원클릭 트리 레이아웃 알고리즘
- **접기/펼치기** — 하위 트리를 숨겨서 핵심에 집중
- **AI 합성** — Claude 또는 OpenAI가 마인드맵을 분석하여 창의적 아이디어 추천
- **반응형** — 데스크톱에서는 오른쪽, 모바일에서는 하단에 AI 패널 배치
- **로컬 저장** — AsyncStorage로 모든 데이터를 기기에 저장
- **크로스 플랫폼** — 하나의 코드로 웹, iOS, Android 지원

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Expo SDK 54 + React Native |
| 언어 | TypeScript |
| 라우팅 | Expo Router v6 |
| 상태 관리 | Zustand |
| 저장소 | AsyncStorage |
| 렌더링 | react-native-svg + react-native-reanimated |
| 제스처 | react-native-gesture-handler |
| AI | Claude API / OpenAI API (사용자 API 키 입력 방식) |

## 시작하기

### 사전 요구사항

- Node.js 18+
- npm 또는 yarn

### 설치

```bash
npm install
```

### 실행

```bash
# 웹
npx expo start --web

# 모바일 (Expo Go)
npx expo start
```

### 웹 빌드

```bash
npx expo export --platform web
```

## 프로젝트 구조

```
app/                    # Expo Router 화면
  _layout.tsx           # 루트 레이아웃 (GestureHandlerRootView)
  index.tsx             # 메인 화면 (탭 + 캔버스 + AI 패널)
  settings.tsx          # 설정 화면 (API 키 입력)
src/
  components/
    mindmap/            # 캔버스, 노드, 연결선, 노드 편집기
    tabs/               # 탭바, 탭 아이템
    ai/                 # AI 합성 패널, AI 결과 카드
    common/             # 색상 선택기, 확인 다이얼로그
  store/                # Zustand 스토어 (마인드맵, 설정)
  services/
    ai/                 # Claude/OpenAI 클라이언트, 프롬프트 빌더
    storage/            # AsyncStorage 래퍼
  hooks/                # useDragNode, useLayout, useAISynthesis
  utils/                # 트리 레이아웃, 기하학 연산, 상수
  theme/                # 디자인 토큰
```

## AI 아이디어 합성 사용법

1. **설정** 화면에서 API 키를 입력합니다 (Claude 또는 OpenAI)
2. 마인드맵에 노드와 가지를 추가합니다
3. AI 패널에서 **Generate Ideas** 버튼을 클릭합니다
4. AI가 모든 노드를 분석하여 서로 다른 가지를 연결하는 창의적인 아이디어 3개를 제안합니다
5. **+ Add to Mind Map** 을 클릭하면 해당 아이디어가 새 노드로 추가됩니다

> **참고:** Claude API는 웹과 모바일 모두에서 사용 가능합니다. OpenAI API는 웹에서 CORS로 차단될 수 있으므로, 웹에서는 Claude를, 모바일에서는 OpenAI도 사용할 수 있습니다.

## 라이선스

MIT
