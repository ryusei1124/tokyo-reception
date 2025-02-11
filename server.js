const { google } = require("googleapis");
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const DATA_FILE = path.join(__dirname, "data.json");

// **Google スプレッドシート API 設定**
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const CREDENTIALS = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));


const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

// **Google スプレッドシートの ID を設定**
const SPREADSHEET_ID = "1M6kH7DdFTOB99ovCygUzIkdQh-Q28YtCX-CTIyCYA-U";

async function ensureSheetExists() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const sheetName = `${year}年${month}月`;

  try {
    // スプレッドシートのシート一覧を取得
    const sheetList = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    // シートが既に存在するかチェック
    const sheetExists = sheetList.data.sheets.some(sheet => sheet.properties.title === sheetName);

    if (!sheetExists) {
      console.log(`シート「${sheetName}」が存在しないため、作成します`);
      await duplicateSheet();
      await new Promise(resolve => setTimeout(resolve, 3000)); //シート作成後に再度確認（API反映の遅延対策）
    }
  } catch (error) {
    console.error("シート存在確認エラー:", error);
  }
}

// **シートを複製する関数**
async function duplicateSheet() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const sheetName = `${year}年${month}月`;

  try {
    // ✅ 「テンプレ」シートを複製
    const response = await sheets.spreadsheets.sheets.copyTo({
      spreadsheetId: SPREADSHEET_ID,
      sheetId: 760381622, // 「テンプレ」シートの ID
      requestBody: { destinationSpreadsheetId: SPREADSHEET_ID },
    });

    const newSheetId = response.data.sheetId;
    console.log(`新しいシートが作成されました: ID=${newSheetId}`);

    // ✅ シート名を変更
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: { sheetId: newSheetId, title: sheetName },
              fields: "title",
            },
          },
        ],
      },
    });

    console.log(`シート名を「${sheetName}」に変更しました！`);

    // ✅ シートを一番左（最前列）に移動
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: { sheetId: newSheetId, index: 0 }, // 一番左に移動
              fields: "index",
            },
          },
        ],
      },
    });

    console.log(`シート「${sheetName}」を最前列（左端）に移動しました！`);
    return sheetName;
  } catch (error) {
    console.error("シート複製エラー:", error);
    return null;
  }
}


// **データをスプレッドシートに反映する関数**
async function appendDataToSheet() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const sheetName = `${year}年${month}月`;

  if (!fs.existsSync(DATA_FILE)) return;

  const existingData = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

  const formattedData = existingData.map((entry) => {
    const date = new Date();
    const day = `${date.getMonth() + 1}/${date.getDate()}(${["日", "月", "火", "水", "木", "金", "土"][date.getDay()]})`;
    return [day, entry.enterTime, entry.exitTime || "", entry.memberID, entry.name, entry.nonMemberCount, entry.purpose];
  });

  try {
    // **既存のデータを削除してから書き込む**
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A2:G`, // A2 以降のデータを全削除
    });

    // **新しいデータを追加**
    if (formattedData.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A2`,
        valueInputOption: "RAW",
        requestBody: { values: formattedData },
      });
      console.log("Googleスプレッドシートに全データを同期しました！");
    }
  } catch (error) {
    console.error("Googleスプレッドシートへのデータ同期エラー:", error);
  }
}

// **APIエンドポイント**
app.post("/sync-to-sheet", async (req, res) => {
  try {
    const sheetName = await duplicateSheet();
    if (!sheetName) {
      return res.status(500).json({ success: false, message: "シート複製に失敗" });
    }

    await appendDataToSheet();
    res.json({ success: true, message: "データをスプレッドシートに同期しました" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "エラーが発生しました" });
  }
});

// データ保存用API
app.post("/save-entry", async (req, res) => {
  const newData = req.body;

  const DATA_FILE = path.join(__dirname, 'data.json');
  let existingData = [];

  if (fs.existsSync(DATA_FILE)) {
    existingData = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  }

  existingData.push(newData);
  fs.writeFileSync(DATA_FILE, JSON.stringify(existingData, null, 2));

  try {
    await ensureSheetExists(); // シートがなければ作成
    await appendDataToSheet(); // 月の全データを同期
    res.json({ success: true, message: "データを保存し、Googleスプレッドシートに反映しました。" });
  } catch (error) {
    console.error("データ保存エラー:", error);
    res.status(500).json({ success: false, message: "Googleスプレッドシートへの反映に失敗しました。" });
  }
});

app.get('/get-entries', (req, res) => {
  const DATA_FILE = path.join(__dirname, 'data.json');

  if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, 'utf-8');
      res.json(JSON.parse(fileData));
  } else {
      res.json([]);
  }
});


// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
