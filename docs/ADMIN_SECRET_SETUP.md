# 관리자 비밀키(ADMIN_SECRET) 설정 방법

관리자 페이지(`/admin`)에 로그인하려면 **ADMIN_SECRET** 환경 변수에 설정한 비밀키를 입력해야 합니다.

---

## 1. 로컬 개발 환경에서 설정하기

### 1단계: 환경 변수 파일 만들기

프로젝트 **맨 바깥 폴더**(`package.json`이 있는 곳)에 아래 파일을 만듭니다.

- **파일 이름**: `.env.local`
- **위치 예시**: `dmc/.env.local`

> `.env.local`은 Git에 올라가지 않도록 이미 `.gitignore`에 포함되어 있습니다. 비밀키가 저장소에 노출되지 않습니다.

### 2단계: 비밀키 적기

`.env.local` 파일을 열고 다음 한 줄을 넣습니다.

```env
ADMIN_SECRET=사용할_비밀키_문자열
```

**예시:**

```env
ADMIN_SECRET=mySecretKey2024
```

또는 더 긴 문장으로:

```env
ADMIN_SECRET=DmcAdmin!Secure#Key2024
```

- **규칙**
  - `=` 앞뒤에 공백 없이 작성합니다.
  - 비밀키 문자열에는 따옴표를 붙이지 않습니다.
  - 영문, 숫자, 특수문자를 섞어 쓰면 더 안전합니다.

### 3단계: 서버 다시 실행

환경 변수는 **프로젝트를 실행할 때** 읽습니다. 수정 후에는 반드시 개발 서버를 다시 켜야 합니다.

1. 터미널에서 실행 중인 서버가 있다면 `Ctrl + C`로 종료합니다.
2. 다시 실행합니다.
   ```bash
   npm run dev
   ```
3. 브라우저에서 `http://localhost:3000/admin` 으로 접속합니다.
4. 로그인 화면에 **2단계에서 정한 비밀키**를 그대로 입력하고 **확인**을 누릅니다.

---

## 2. 배포(서버/호스팅) 환경에서 설정하기

배포한 사이트에서도 같은 이름의 환경 변수를 설정해야 합니다. 방식은 사용하는 서비스마다 다릅니다.

### Vercel

1. [Vercel 대시보드](https://vercel.com) → 해당 프로젝트 선택
2. **Settings** → **Environment Variables**
3. **Name**: `ADMIN_SECRET`
4. **Value**: 사용할 비밀키 입력
5. **Save** 후 재배포(또는 다음 배포 시 자동 반영)

### Netlify

1. Netlify 대시보드 → 해당 사이트 → **Site configuration** → **Environment variables**
2. **Add a variable** → **Add a single variable**
3. **Key**: `ADMIN_SECRET`, **Value**: 비밀키 입력
4. 저장 후 재배포

### 일반 서버(PM2, systemd 등)

서버를 실행하기 전에 환경 변수가 들어가도록 설정합니다.

**방법 A: 같은 폴더에 `.env.local` 두기**

- 프로젝트 루트에 `.env.local`을 만들고 `ADMIN_SECRET=비밀키` 를 넣은 뒤,
- Next.js를 실행하는 명령이 그 디렉터리에서 실행되도록 합니다.
- Next.js는 자동으로 `.env.local`을 읽습니다.

**방법 B: 실행 시 지정**

```bash
ADMIN_SECRET=비밀키 npm start
```

**방법 C: systemd 사용 시**

서비스 파일에 다음을 추가합니다.

```ini
[Service]
Environment="ADMIN_SECRET=비밀키"
```

---

## 3. 동작 방식 요약

| 구분 | 설명 |
|------|------|
| **환경 변수** | `ADMIN_SECRET` (서버에서 읽음) |
| **로그인 시 입력** | 관리자 페이지에서 입력하는 값이 위 비밀키와 **완전히 같아야** 인증됨 |
| **저장 위치** | 브라우저 `sessionStorage` (탭/창을 닫으면 사라짐) |
| **ADMIN_SECRET 미설정** | 개발 시에는 비밀키 없이 접근 가능하도록 되어 있을 수 있음 (코드에 따라 다름) |

---

## 4. 문제 해결

- **「Unauthorized」 또는 로그인이 안 됨**
  - `.env.local`에 `ADMIN_SECRET=...` 이 정확히 들어가 있는지 확인합니다.
  - 서버를 다시 시작한 뒤, **브라우저에서 입력하는 값**이 `ADMIN_SECRET` 값과 **완전히 동일**한지 확인합니다(대소문자, 공백 주의).
- **변경했는데 반영이 안 됨**
  - 환경 변수는 **프로세스 시작 시**만 읽습니다. `.env.local` 수정 후에는 `npm run dev` 또는 `npm start`를 다시 실행해야 합니다.

이 파일은 참고용입니다. 실제 비밀키는 `.env.local`이나 호스팅 서비스의 환경 변수 설정에만 넣고, 코드나 문서에는 실제 값을 적지 마세요.
