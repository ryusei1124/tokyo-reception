// 日付を更新する関数
function updateDate() {
  const now = new Date();
  document.querySelector(".reception__year").textContent = now.getFullYear();
  document.querySelector(".reception__month").textContent = String(now.getMonth() + 1).padStart(2, '0');
  document.querySelector(".reception__day").textContent = String(now.getDate()).padStart(2, '0');
  document.querySelector(".reception__week").textContent = ['日', '月', '火', '水', '木', '金', '土'][now.getDay()];
}

// ページ読み込み時に日付を更新
document.addEventListener('DOMContentLoaded', () => {
  updateDate();
  const now = new Date();
  const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;

  setTimeout(() => {
    updateDate();
    setInterval(updateDate, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
});

const enterSubmit = document.getElementById("enter__submit");
const editSubmit = document.getElementById("edit__submit");
const exitSubmit = document.getElementById("exit__submit");
const enterBtn = document.getElementById("enter-btn");
const editBtn = document.querySelector(".edit-btn");
const exitBtn = document.querySelector(".exit-btn");
const receptionModal = document.getElementById("receptionModal");
const modalMask = document.getElementById("modalMask");
const modalClose = document.getElementById("modalClose");
const otherPurposeCheckbox = document.getElementById("otherPurposeCheckbox");
const otherPurposeInput = document.getElementById("otherPurposeInput");
const bijihabuBtn = document.getElementById("bijihabuBtn");
const bijihabuContent = document.getElementById("bijihabuContent");
const bijihabu = document.getElementById("bijihabu");
const purposeCheckboxes = document.querySelectorAll('input[name="purpose-choices[]"]');
const entryForm = document.getElementById("entryForm");
const dataTable = document.getElementById("dataTable").querySelector("tbody");
const exitConfirmation = document.getElementById("exit-confirmation");

// 全てのsubmitボタンを非表示にする関数
function hideAllSubmitButtons() {
  enterSubmit.style.display = "none";
  editSubmit.style.display = "none";
  exitSubmit.style.display = "none";
}

// モーダルを表示する関数
function showModal(buttonToShow, showBijihabu = true) {
  receptionModal.style.display = "block"; //
  modalMask.style.display = "block";
  hideAllSubmitButtons(); // 全てのsubmitボタンを非表示
  buttonToShow.style.display = "block"; // 指定されたボタンを表示

  if (showBijihabu) {
    bijihabu.style.display = "block";
  } else {
    bijihabu.style.display = "none";
  }
}

otherPurposeCheckbox.addEventListener("change", function () {
  if (this.checked) {
    // チェックが入った場合、入力欄を表示して必須にする
    otherPurposeInput.style.display = "block";
    otherPurposeInput.setAttribute("required", "required");
    otherPurposeInput.focus();
  } else {
    // チェックが外れた場合、入力欄を非表示にして必須属性を解除
    otherPurposeInput.style.display = "none";
    otherPurposeInput.removeAttribute("required");
  }
});

enterBtn.addEventListener("click", function () {
  resetForm(); // フォームを初期化
  showModal(enterSubmit, true); // enter__submitを表示
});

function resetForm() {
  // 各フォームの値を空にする
  const memberIDInput = document.getElementById("memberID");
  const nameInput = document.getElementById("name");
  const nonMemberCountInput = document.getElementById("nonMemberCount");
  const otherPurposeInput = document.getElementById("otherPurposeInput");
  const otherPurposeCheckbox = document.getElementById("otherPurposeCheckbox");

  memberIDInput.value = "";
  nameInput.value = "";
  nonMemberCountInput.value = "";
  otherPurposeInput.value = "";
  otherPurposeCheckbox.checked = false;

  // 「その他」入力欄を非表示にして必須属性を解除
  otherPurposeInput.style.display = "none";
  otherPurposeInput.removeAttribute("required");

  // 利用目的のチェックボックスをリセット
  purposeCheckboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
}

// モーダルマスクまたは閉じるボタンをクリックしたときにモーダルを非表示
modalMask.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);

bijihabuBtn.addEventListener("click", function () {
  if (bijihabuContent.classList.contains("open")) {
    bijihabuContent.style.maxHeight = "0px";
    setTimeout(() => {
      bijihabuContent.classList.remove("open");
      bijihabuBtn.classList.remove("open");
      bijihabuContent.style.display = "none";
    }, 500); // アニメーション終了後に非表示
  } else {
    bijihabuContent.style.display = "block";
    setTimeout(() => {
      bijihabuContent.classList.add("open");
      bijihabuBtn.classList.add("open");
      bijihabuContent.style.maxHeight = "1300px"; // 適切な高さに調整
    }, 10);
  }
});


// 現在の日付を取得する関数（フォーマット: YYYY-MM-DD）
function getTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// ローカルストレージのキー
const LOCAL_STORAGE_KEY = "dataTableData";
const LOCAL_STORAGE_DATE_KEY = "dataTableDate";

// テーブルをリセットする関数
function resetTable() {
  dataTable.innerHTML = ""; // テーブルをクリア
  localStorage.removeItem(LOCAL_STORAGE_KEY); // 保存データを削除
}

// ローカルストレージからデータをロードしてテーブルに反映
function loadTableData() {
  const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedData) {
    const rows = JSON.parse(savedData);
    rows.forEach(rowHTML => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = rowHTML;
      dataTable.appendChild(newRow);
    });
  }
}

// データをローカルストレージに保存
function saveTableData() {
  const rows = Array.from(dataTable.querySelectorAll("tr")).map(row => row.outerHTML);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rows));
}

// 日付をチェックしてリセットする
function checkAndResetTable() {
  const today = getTodayDate();
  const savedDate = localStorage.getItem(LOCAL_STORAGE_DATE_KEY);

  if (savedDate !== today) {
    resetTable(); // データをリセット
    localStorage.setItem(LOCAL_STORAGE_DATE_KEY, today); // 今日の日付を保存
  }
}

// 初期化処理
document.addEventListener("DOMContentLoaded", function () {
  checkAndResetTable(); // 日付をチェックしてリセット
  loadTableData(); // テーブルデータをロード

  // 日付が変わるタイミングでリセットする
  // const now = new Date();
  // const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;
  // setTimeout(() => {
  //   resetTable();
  //   localStorage.setItem(LOCAL_STORAGE_DATE_KEY, getTodayDate()); // 日付を更新
  // }, msUntilMidnight);
});

// フォームで Enter キーを押したときに新規行が追加されるのを防ぐ
entryForm.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Enter キーのデフォルト動作（フォーム送信）を防ぐ
  }
});

// フォーム送信成功後のアラート表示処理
function showExitAlert() {
  const exitAlert = document.getElementById("exit-alert");
  const exitAlertClose = document.getElementById("exit-alert-close");

  exitAlert.style.display = "block"; // アラートを表示

  // 10秒後に非表示
  const timeoutId = setTimeout(() => {
    exitAlert.style.display = "none";
  }, 10000);

  // 閉じるボタンを押したら非表示
  exitAlertClose.addEventListener("click", function () {
    exitAlert.style.display = "none";
    clearTimeout(timeoutId); // タイマーをクリア
  });
}


// フォーム送信時の処理
entryForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  let isPurposeChecked = false;

  // 「ご利用目的」のチェックボックスを確認
  purposeCheckboxes.forEach(function (checkbox) {
    if (checkbox.checked) {
      if (checkbox === otherPurposeCheckbox && otherPurposeInput.value.trim() === "") {
        // 「その他」がチェックされていて入力欄が空の場合はエラー
        alert("「その他」の詳細を入力してください。");
        event.preventDefault(); // 送信をキャンセル
        otherPurposeInput.focus(); // 入力欄にフォーカス
        return;
      }
      isPurposeChecked = true; // チェックされている場合は有効
    }
  });

  if (!isPurposeChecked) {
    alert("ご利用目的を1つ以上選択してください。");
    event.preventDefault(); // 送信をキャンセル
    return;
  }

  const memberID = document.getElementById("memberID").value;
  const name = document.getElementById("name").value;
  const nonMemberCount = document.getElementById("nonMemberCount").value || 0;
  // 選択された「ご利用目的」の値を取得
  let selectedPurposes = Array.from(document.querySelectorAll("input[name='purpose-choices[]']:checked"))
    .map(checkbox => checkbox.value);

  if (otherPurposeCheckbox.checked && otherPurposeInput.value.trim() !== "") {
    selectedPurposes = selectedPurposes.filter(purpose => purpose !== "その他");
    selectedPurposes.push(otherPurposeInput.value.trim());
  }

  const purposeText = selectedPurposes.join(", ");
  const enterTime = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
        <td><button class="edit-btn">編集</button></td>
        <td class="enter-time">${enterTime}</td>
        <td class="exit-time"><button class="exit-btn">退室する</button></td>
        <td class="memberID">${memberID}</td>
        <td class="name">${name}</td>
        <td class="nonMemberCount">${nonMemberCount}</td>
        <td class="purpose">${purposeText}</td>
    `;
  dataTable.appendChild(newRow);

  receptionModal.style.display = "none";
  modalMask.style.display = "none";
  otherPurposeInput.style.display = "none";
  bijihabuContent.style.display = 'none';
  bijihabuBtn.classList.remove("open");
  bijihabuContent.classList.remove("open");
  bijihabuContent.style.maxHeight = "0px";

  const formData = new FormData(entryForm);
  formData.append("会員ID", memberID);
  formData.append("お名前", name);
  formData.append("非会員様の人数", nonMemberCount);
  formData.append("ご利用目的", purposeText);
  formData.append("入室時間", enterTime);

  // 既存データの編集か新規追加かを判定
  const rowIndex = entryForm.getAttribute("data-row-index") || null;
  if (rowIndex) {
    formData.append("行番号", rowIndex); // 既存データの行番号を追加
  }

  const scriptURL = "https://script.google.com/macros/s/AKfycbxbVF2oqX3d3Nga-5GOnxo_3YZEA33CAMXJtW6GTYNkQtyw9bK5cNd-A05mjt7K8nGa/exec"; // 取得したウェブアプリのURLを入れる
  
  showExitAlert();
  try {
    await fetch(scriptURL, {
      method: "POST",
      body: formData
    });
  
    entryForm.reset();
    entryForm.removeAttribute("data-row-index");
    saveTableData();
  } catch (error) {
    console.error("送信エラー:", error);
  }
  saveTableData();
});


// 編集ボタンのクリックイベントを処理
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("edit-btn")) {
    const row = event.target.closest("tr");
    const rowIndex = row.getAttribute("data-row-index"); // 保存された行番号を取得
    // const rowIndex = Array.from(row.parentElement.children).indexOf(row) + 2;

    const memberID = row.querySelector(".memberID").textContent;
    const name = row.querySelector(".name").textContent;
    const nonMemberCount = row.querySelector(".nonMemberCount").textContent;
    const purpose = row.querySelector(".purpose").textContent.split(", ");

    // フォームに現在の値をセット
    document.getElementById("memberID").value = memberID;
    document.getElementById("name").value = name;
    document.getElementById("nonMemberCount").value = nonMemberCount;

    // 利用目的チェックボックスをリセットして再設定
    purposeCheckboxes.forEach(checkbox => {
      checkbox.checked = purpose.includes(checkbox.value);
    });

    // その他目的が含まれる場合の処理
    const otherPurpose = purpose.find(p => !Array.from(purposeCheckboxes).map(cb => cb.value).includes(p));
    if (otherPurpose) {
      document.getElementById("otherPurposeCheckbox").checked = true;
      document.getElementById("otherPurposeInput").value = otherPurpose;
      document.getElementById("otherPurposeInput").style.display = "block";
      document.getElementById("otherPurposeInput").setAttribute("required", "required");
    } else {
      document.getElementById("otherPurposeCheckbox").checked = false;
      document.getElementById("otherPurposeInput").style.display = "none";
      document.getElementById("otherPurposeInput").removeAttribute("required");
    }

    // 編集モーダルを表示
    showModal(editSubmit, false);

    // 編集フォームの送信処理を設定
    editSubmit.onclick = async function (e) {
      e.preventDefault();

      // フォームの値を取得
      const updatedMemberID = document.getElementById("memberID").value.trim();
      const updatedName = document.getElementById("name").value.trim();
      const updatedNonMemberCount = document.getElementById("nonMemberCount").value || 0;
      let updatedPurposes = Array.from(document.querySelectorAll("input[name='purpose-choices[]']:checked"))
        .map(cb => cb.value);

      const otherPurposeChecked = document.getElementById("otherPurposeCheckbox").checked;
      const otherPurposeInput = document.getElementById("otherPurposeInput").value.trim();

      // バリデーション
      if (!/^[a-zA-Z0-9]{8,9}$/.test(updatedMemberID)) {
        alert("会員IDは8〜9文字の英数字で入力してください。");
        document.getElementById("memberID").focus();
        return;
      }

      if (!updatedName) {
        alert("お名前を入力してください。");
        document.getElementById("name").focus();
        return;
      }

      if (otherPurposeChecked && !otherPurposeInput) {
        alert("「その他」の詳細を入力してください。");
        document.getElementById("otherPurposeInput").focus();
        return;
      }

      if (updatedPurposes.length === 0) {
        alert("ご利用目的を1つ以上選択してください。");
        return;
      }

      // 利用目的の「その他」が入力されている場合の処理
      if (otherPurposeChecked && otherPurposeInput) {
        updatedPurposes = updatedPurposes.filter(p => p !== "その他");
        updatedPurposes.push(otherPurposeInput);
      }

      // 行の値を更新
      row.querySelector(".memberID").textContent = updatedMemberID;
      row.querySelector(".name").textContent = updatedName;
      row.querySelector(".nonMemberCount").textContent = updatedNonMemberCount;
      row.querySelector(".purpose").textContent = updatedPurposes.join(", ");

      saveTableData(); // ローカルストレージに保存
      closeModal(); // モーダルを閉じる
      
      // Google Apps Scriptに送信
      const formData = new FormData();
      formData.append("行番号", rowIndex);
      formData.append("会員ID", updatedMemberID);
      formData.append("お名前", updatedName);
      formData.append("非会員様の人数", updatedNonMemberCount);
      formData.append("ご利用目的", updatedPurposes.join(", "));

      const scriptURL = "https://script.google.com/macros/s/AKfycbxbVF2oqX3d3Nga-5GOnxo_3YZEA33CAMXJtW6GTYNkQtyw9bK5cNd-A05mjt7K8nGa/exec";

      try {
        await fetch(scriptURL, {
          method: "POST",
          body: formData
        });
        console.log("データを更新しました:", updatedName);
      } catch (error) {
        console.error("送信エラー:", error);
      }
    };
    saveTableData(); // ローカルストレージに保存
  }
});

// 退室ボタンのクリックイベントを処理
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("exit-btn")) {
    const row = event.target.closest("tr");
    const rowIndex = row.getAttribute("data-row-index");

    // 該当行の情報を取得
    const memberID = row.querySelector(".memberID").textContent;
    const name = row.querySelector(".name").textContent;
    const nonMemberCount = row.querySelector(".nonMemberCount").textContent;
    const purpose = row.querySelector(".purpose").textContent.split(", ");

    // フォームに現在の値をセット（読み取り専用に設定）
    const memberIDInput = document.getElementById("memberID");
    const nameInput = document.getElementById("name");
    const nonMemberCountInput = document.getElementById("nonMemberCount");

    entryForm.classList.add("invalid");
    exitConfirmation.style.display = "block";

    memberIDInput.value = memberID;
    memberIDInput.setAttribute("readonly", "readonly");
    nameInput.value = name;
    nameInput.setAttribute("readonly", "readonly");
    nonMemberCountInput.value = nonMemberCount;
    nonMemberCountInput.setAttribute("readonly", "readonly");

    // 利用目的チェックボックスをリセットして再設定（読み取り専用に設定）
    purposeCheckboxes.forEach(checkbox => {
      checkbox.checked = purpose.includes(checkbox.value);
      checkbox.setAttribute("disabled", "disabled"); // チェックボックスを無効化
    });

    // 「その他」の目的が含まれる場合の処理
    const otherPurposeInput = document.getElementById("otherPurposeInput");
    const otherPurposeCheckbox = document.getElementById("otherPurposeCheckbox");

    const otherPurpose = purpose.find(p => !Array.from(purposeCheckboxes).map(cb => cb.value).includes(p));
    if (otherPurpose) {
      otherPurposeCheckbox.checked = true;
      otherPurposeCheckbox.setAttribute("disabled", "disabled");
      otherPurposeInput.value = otherPurpose;
      otherPurposeInput.style.display = "block";
      otherPurposeInput.setAttribute("readonly", "readonly");
    } else {
      otherPurposeCheckbox.checked = false;
      otherPurposeCheckbox.setAttribute("disabled", "disabled");
      otherPurposeInput.value = "";
      otherPurposeInput.style.display = "none";
    }

    // モーダルを表示して退室ボタンの送信処理を設定
    showModal(exitSubmit, false);

    exitSubmit.onclick = async function (e) {
      e.preventDefault();

      // 現在の時間を取得して退室時間を更新
      const exitTime = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
      const exitBtnCell = row.querySelector(".exit-time");
      exitBtnCell.textContent = exitTime;
      entryForm.classList.remove("invalid");

      saveTableData(); // ローカルストレージに保存
      closeModal();

      // Google スプレッドシートへ送信
      // const rowIndex = Array.from(row.parentElement.children).indexOf(row) + 2; // スプレッドシートの行番号 (1行目がヘッダー)

      const formData = new FormData();
      formData.append("行番号", rowIndex);
      formData.append("退室時間", exitTime);

      const scriptURL = "https://script.google.com/macros/s/AKfycbxbVF2oqX3d3Nga-5GOnxo_3YZEA33CAMXJtW6GTYNkQtyw9bK5cNd-A05mjt7K8nGa/exec"; 

      // **送信成功後に編集ボタンを非表示**
      const editBtn = row.querySelector(".edit-btn");
      if (editBtn) {
        editBtn.style.display = "none";
      }

      // 退室ボタンを無効化
      const exitBtn = row.querySelector(".exit-btn");
      if (exitBtn) {
        exitBtn.disabled = true;
        exitBtn.textContent = "退室済";
      }
      
      try {
        const response = await fetch(scriptURL, {
          method: "POST",
          body: formData
        });

        const result = await response.text();
        console.log("退室時間を更新:", result);
      } catch (error) {
        console.error("退室時間の送信エラー:", error);
      }
    };
  }
});

// モーダルを非表示にする関数を拡張して、読み取り専用設定を解除
function closeModal() {
  receptionModal.style.display = "none";
  modalMask.style.display = "none";
  hideAllSubmitButtons(); // 全てのsubmitボタンを非表示
  bijihabuContent.style.display = 'none';
  bijihabuBtn.classList.remove("open");
  bijihabuContent.classList.remove("open");
  bijihabuContent.style.maxHeight = "0px";
  entryForm.classList.remove("invalid");
  exitConfirmation.style.display = "none";

  // フォームの読み取り専用設定を解除
  const memberIDInput = document.getElementById("memberID");
  const nameInput = document.getElementById("name");
  const nonMemberCountInput = document.getElementById("nonMemberCount");
  const otherPurposeInput = document.getElementById("otherPurposeInput");
  const otherPurposeCheckbox = document.getElementById("otherPurposeCheckbox");

  memberIDInput.removeAttribute("readonly");
  nameInput.removeAttribute("readonly");
  nonMemberCountInput.removeAttribute("readonly");
  otherPurposeInput.removeAttribute("readonly");
  otherPurposeCheckbox.removeAttribute("disabled");

  // チェックボックスの無効化を解除
  purposeCheckboxes.forEach(checkbox => {
    checkbox.removeAttribute("disabled");
  });

  saveTableData(); // ローカルストレージに保存
}


document.getElementById("resetTableBtn").addEventListener("click", function () {
  if (confirm("本当に表をリセットしますか？この操作は元に戻せません。")) {
    dataTable.innerHTML = ""; // 表の内容をクリア
    localStorage.removeItem("dataTableData"); // ローカルストレージもクリア
  }
});



document.addEventListener("DOMContentLoaded", function () {
  const resetRowBtn = document.createElement("button");
  resetRowBtn.id = "resetRowMemoryBtn";
  resetRowBtn.textContent = "行数の記憶をリセット";
  resetRowBtn.style.margin = "10px";
  document.body.insertBefore(resetRowBtn, document.body.firstChild);

  resetRowBtn.addEventListener("click", async function () {
    if (confirm("スプレッドシートの行数の記憶をリセットしますか？")) {
      const scriptURL = "https://script.google.com/macros/s/AKfycbxbVF2oqX3d3Nga-5GOnxo_3YZEA33CAMXJtW6GTYNkQtyw9bK5cNd-A05mjt7K8nGa/exec";

      try {
        const response = await fetch(scriptURL, {
          method: "POST",
          body: new URLSearchParams({ resetLastRow: "true" })
        });

        if (response.ok) {
          alert("行数の記憶をリセットしました！");
        } else {
          alert("リセットに失敗しました");
        }
      } catch (error) {
        console.error("リセットエラー:", error);
      }
    }
  });
});
