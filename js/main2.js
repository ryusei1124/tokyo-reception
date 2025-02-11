/*--------要素を取得--------*/ 
const modal = document.getElementById("receptionModal");
const modalMask = document.getElementById("modalMask");
const closeModalElements = [document.getElementById("modalClose"), modalMask];
const enterBtn = document.getElementById("enter-btn");
const enterSubmit = document.getElementById("enter__submit");
const editSubmit = document.getElementById("edit__submit");
const exitSubmit = document.getElementById("exit__submit");
const bijihabu = document.getElementById("bijihabu");
const exitConfirmation = document.getElementById("exit-confirmation");

// 入力フィールドを取得
const memberIDInput = document.getElementById("memberID");
const nameInput = document.getElementById("name");
const nonMemberCountInput = document.getElementById("nonMemberCount");
const otherPurposeInput = document.getElementById("otherPurposeInput");
const otherPurposeCheckbox = document.getElementById("otherPurposeCheckbox");
const purposeCheckboxes = document.querySelectorAll('input[name="purpose-choices[]"]');

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
  setInterval(updateDate, 24 * 60 * 60 * 1000);

  document.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && event.target.tagName !== "TEXTAREA") {
      event.preventDefault();
    }
  });
});

// スリープ解除時にページをリロード
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    location.reload();
  }
});

// モバイルのスリープ復帰を検知（Cordova や一部の環境で有効）
document.addEventListener("resume", function () {
  location.reload();
}, false);


function showModal(submitButton) {
  [enterSubmit, editSubmit, exitSubmit].forEach((btn) => btn.style.display = "none");

  if (submitButton) submitButton.style.display = "block";

  modal.style.display = "block";
  modalMask.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
  modalMask.style.display = "none";
  bijihabuContent.style.display = 'none';
  bijihabuContent.classList.remove("open");
  bijihabuBtn.classList.remove("open");
  bijihabuContent.style.maxHeight = "0px";
  bijihabu.style.display = "none";
  exitConfirmation.style.display = "none";

  // 入力フィールドの `disabled` を解除
  memberIDInput.disabled = false;
  nameInput.disabled = false;
  nonMemberCountInput.disabled = false;
  otherPurposeInput.disabled = false;
  purposeCheckboxes.forEach(cb => cb.disabled = false);

  // 文字色を元に戻す（クラスを削除）
  memberIDInput.classList.remove("disabled-text");
  nameInput.classList.remove("disabled-text");
  nonMemberCountInput.classList.remove("disabled-text");
  otherPurposeInput.classList.remove("disabled-text");

  otherPurposeInput.style.display = "none";
  
  [enterSubmit, editSubmit, exitSubmit].forEach((btn) => btn.style.display = "none");
  resetForm();
}

// モーダルを閉じる処理
closeModalElements.forEach((el) => el.addEventListener("click", closeModal));

const bijihabuBtn = document.getElementById("bijihabuBtn");
const bijihabuContent = document.getElementById("bijihabuContent");

bijihabuBtn.addEventListener("click", function () {
  if (bijihabuContent.classList.contains("open")) {
    bijihabuContent.style.maxHeight = "0px";
    setTimeout(() => {
      bijihabuContent.classList.remove("open");
      bijihabuBtn.classList.remove("open");
      bijihabuContent.style.display = "none";
    }, 500);
  } else {
    bijihabuContent.style.display = "block";
    setTimeout(() => {
      bijihabuContent.classList.add("open");
      bijihabuBtn.classList.add("open");
      bijihabuContent.style.maxHeight = "1200px"; // 適切な高さに調整
    }, 10);
  }
});

otherPurposeCheckbox.addEventListener("change", function () {
  if (this.checked) {
    otherPurposeInput.style.display = "block";
    otherPurposeInput.setAttribute("required", "required");
    otherPurposeInput.focus();
  } else {
    otherPurposeInput.style.display = "none";
    otherPurposeInput.removeAttribute("required");
  }
});

function resetForm() {
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

function addRowToTable(data) {
  const table = document.getElementById("dataTable");
  const newRow = document.createElement("tr");

  newRow.innerHTML = `
    <td><button class="edit-btn">編集</button></td>
    <td class="enter-time">${data.enterTime}</td>
    <td class="exit-time"><button class="exit-btn">退室する</button></td>
    <td class="memberID">${data.memberID}</td>
    <td class="name">${data.name}</td>
    <td class="nonMemberCount">${data.nonMemberCount}</td>
    <td class="purpose">${data.purpose}</td>
  `;

  table.appendChild(newRow);
}

async function loadExistingData() {
  try {
    const response = await fetch("http://localhost:3000/get-entries");
    const data = await response.json();

    data.forEach(addRowToTable);
  } catch (error) {
    console.error("データの取得に失敗しました:", error);
  }
}

// ページ読み込み時にデータを取得
document.addEventListener("DOMContentLoaded", loadExistingData);


/*---------新規----------*/ 
enterBtn.addEventListener("click", function () {
  showModal(enterSubmit);
  bijihabu.style.display = "block";
  resetForm();
});

enterSubmit.addEventListener("click", async function (event) {
  event.preventDefault();

  const memberID = memberIDInput.value.trim();
  const name = nameInput.value.trim();
  const nonMemberCount = nonMemberCountInput.value.trim() || "0";
  const otherPurpose = otherPurposeInput.value.trim();
  let selectedPurposes = Array.from(purposeCheckboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);

  if (selectedPurposes.includes("その他") && otherPurpose) {
    selectedPurposes = selectedPurposes.filter(purpose => purpose !== "その他");
    selectedPurposes.push(otherPurpose);
  }

  if (selectedPurposes.includes("その他") && !otherPurpose) {
    alert("その他の目的を入力してください。");
    return;
  }
  
  if (!memberID || !name || selectedPurposes.length === 0) {
    alert("すべての必須項目を入力してください");
    return;
  }

  /*------送信成功時------*/ 

  const now = new Date();
  const enterTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const requestData = {
    enterTime,
    exitTime: "",
    memberID,
    name,
    nonMemberCount,
    purpose: selectedPurposes.join(", ")
  };

  try {
    closeModal();
    const response = await fetch("http://localhost:3000/save-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    });
    const result = await response.json();
    if (result.success) {
      addRowToTable(requestData); // テーブルに追加
    }
  } catch (error) {
    console.error("エラー:", error);
  }
});

/*---------編集----------*/ 
document.addEventListener("click", async function (event) {
  if (event.target.classList.contains("edit-btn")) {
    const row = event.target.closest("tr");
    
    memberIDInput.value = row.querySelector(".memberID").textContent;
    nameInput.value = row.querySelector(".name").textContent;
    nonMemberCountInput.value = row.querySelector(".nonMemberCount").textContent;
    
    const purposes = row.querySelector(".purpose").textContent.split(", ");
    purposeCheckboxes.forEach(cb => cb.checked = purposes.includes(cb.value));

    const predefinedPurposes = Array.from(purposeCheckboxes).map(cb => cb.value);
    const otherValues = purposes.filter(p => !predefinedPurposes.includes(p));

    if (otherValues.length > 0) {
      otherPurposeCheckbox.checked = true;
      otherPurposeInput.style.display = "block";
      otherPurposeInput.value = otherValues.join(", "); // 「その他」の値を表示
    } else {
      otherPurposeCheckbox.checked = false;
      otherPurposeInput.style.display = "none";
      otherPurposeInput.value = "";
    }

    showModal(editSubmit);
  }
});

editSubmit.addEventListener("click", async function (event) {
  event.preventDefault();

  const updatedMemberID = memberIDInput.value.trim();
  const updatedName = nameInput.value.trim();
  const updatedNonMemberCount = nonMemberCountInput.value.trim() || "0";
  const updatedOtherPurpose = otherPurposeInput.value.trim();
  let updatedPurposes = Array.from(purposeCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  // 「その他」がチェックされている場合、テキストフィールドの値を追加
  if (otherPurposeCheckbox.checked && updatedOtherPurpose) {
    updatedPurposes = updatedPurposes.filter(p => p !== "その他"); // 「その他」のプレースホルダーを削除
    updatedPurposes.push(updatedOtherPurpose); // 入力された値を追加
  }

  updateTableRow(editDocId, {
    memberID: updatedMemberID,
    name: updatedName,
    nonMemberCount: updatedNonMemberCount,
    purpose: updatedPurposes.join(", ")
  });

  closeModal();
});

/*---------退室----------*/ 

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("exit-btn")) {
    const row = event.target.closest("tr");
    exitConfirmation.style.display = "block";

    // 退室モーダルのフォームにデータをセット
    memberIDInput.value = row.querySelector(".memberID").textContent;
    nameInput.value = row.querySelector(".name").textContent;
    nonMemberCountInput.value = row.querySelector(".nonMemberCount").textContent;

    // チェックボックスの選択状態をリセット
    purposeCheckboxes.forEach(cb => cb.checked = false);
    otherPurposeCheckbox.checked = false;
    otherPurposeInput.style.display = "none";

    // 利用目的をセット（チェックボックスに反映）
    const purposes = row.querySelector(".purpose").textContent.split(", ");
    const predefinedPurposes = Array.from(purposeCheckboxes).map(cb => cb.value);

    purposes.forEach(purpose => {
      if (predefinedPurposes.includes(purpose)) {
        document.querySelector(`input[value="${purpose}"]`).checked = true;
      } else {
        otherPurposeCheckbox.checked = true;
        otherPurposeInput.style.display = "block";
        otherPurposeInput.value = purpose;
      }
    });

    // 入力フィールドを `disabled` にする
    memberIDInput.disabled = true;
    nameInput.disabled = true;
    nonMemberCountInput.disabled = true;
    otherPurposeInput.disabled = true;
    purposeCheckboxes.forEach(cb => cb.disabled = true);

    // 文字色を薄くする（CSS適用）
    memberIDInput.classList.add("disabled-text");
    nameInput.classList.add("disabled-text");
    nonMemberCountInput.classList.add("disabled-text");
    otherPurposeInput.classList.add("disabled-text");

    showModal(exitSubmit);
  }
});


exitSubmit.addEventListener("click", async function (event) {
  event.preventDefault();

  const now = new Date();
  const exitTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  closeModal();
});


/*----------データ削除------------*/ 
