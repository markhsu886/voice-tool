# 語音輸入工具

語音轉文字 + AI 自動潤稿，支援中英文混合。

## 部署到 Vercel

### 1. 上傳到 GitHub
1. 在 GitHub 建立新 repo（例如 `voice-tool`）
2. 上傳這個資料夾的所有檔案

### 2. 部署到 Vercel
1. 前往 https://vercel.com，用 GitHub 帳號登入
2. 點 "Add New Project"，選擇剛才的 repo
3. Framework Preset 選 **Next.js**
4. 點 "Deploy"

### 3. 設定 API Key（重要）
部署完成後：
1. 進入 Vercel 專案 → Settings → Environment Variables
2. 新增一個變數：
   - Name: `ANTHROPIC_API_KEY`
   - Value: 你的 Anthropic API Key
3. 儲存後點 **Redeploy**

## 本機測試
```bash
npm install
# 建立 .env.local 並加入：ANTHROPIC_API_KEY=你的key
npm run dev
```
