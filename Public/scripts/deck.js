async function renameDeck(setId) {
  const newTitle = prompt("New deck name:");
  if (!newTitle) return;

  const res = await fetch(`/decks/${setId}/rename`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newTitle }),
  });

  const data = await res.json().catch(() => ({ success: false }));
  if (!data.success) {
    alert("Rename failed");
    return;
  }

  location.reload();
}

const deckHeaderEl = document.querySelector(".deck-header[data-color]");
if (deckHeaderEl) {
  deckHeaderEl.style.background = deckHeaderEl.dataset.color || "";
}

async function toggleDeckNameEdit(buttonEl) {
  const deckTitleText = document.getElementById("deckTitleText");
  const deckTitleInput = document.getElementById("deckTitleInput");
  const setId = Number(buttonEl.dataset.setId);
  const isEditing = buttonEl.dataset.editing === "true";

  if (!deckTitleText || !deckTitleInput || !setId) return;

  if (!isEditing) {
    deckTitleInput.value = deckTitleText.textContent.trim();
    deckTitleText.classList.add("is-hidden");
    deckTitleInput.classList.remove("is-hidden");
    deckTitleInput.focus();
    buttonEl.textContent = "Confirm";
    buttonEl.dataset.editing = "true";
    return;
  }

  const nextTitle = deckTitleInput.value.trim();
  if (!nextTitle) {
    alert("Deck name cannot be empty.");
    return;
  }

  const res = await fetch(`/decks/${setId}/rename`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: nextTitle }),
  });

  const data = await res.json().catch(() => ({ success: false }));
  if (!data.success) {
    alert("Rename failed");
    return;
  }

  deckTitleText.textContent = nextTitle;
  deckTitleInput.classList.add("is-hidden");
  deckTitleText.classList.remove("is-hidden");
  buttonEl.textContent = "Rename";
  buttonEl.dataset.editing = "false";
}

async function editCard(setId, cardId, currentFront, currentBack) {
  const MAX_CHARS = 120;
  const front = prompt("Front:", currentFront);
  if (front === null) return;
  const back = prompt("Back:", currentBack);
  if (back === null) return;
  if (!front.trim() || !back.trim()) {
    alert("Front and back cannot be empty.");
    return;
  }
  if (front.trim().length > MAX_CHARS || back.trim().length > MAX_CHARS) {
    alert("Each side must be 120 characters or less.");
    return;
  }

  const res = await fetch(`/decks/${setId}/flashcards/${cardId}/edit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ front: front.trim(), back: back.trim() }),
  });

  const data = await res.json().catch(() => ({ success: false }));
  if (!data.success) {
    alert("Update failed");
    return;
  }

  location.reload();
}

async function toggleCardEdit(buttonEl) {
  const setId = Number(buttonEl.dataset.setId);
  const cardId = Number(buttonEl.dataset.cardId);
  const isEditing = buttonEl.dataset.editing === "true";
  const cardRow = buttonEl.closest(".card-row");
  if (!cardRow || !setId || !cardId) return;

  const frontTextEl = cardRow.querySelector(".card-front");
  const backTextEl = cardRow.querySelector(".card-back");
  const frontInputEl = cardRow.querySelector(".card-front-input");
  const backInputEl = cardRow.querySelector(".card-back-input");
  if (!frontTextEl || !backTextEl || !frontInputEl || !backInputEl) return;

  if (!isEditing) {
    frontInputEl.value = frontTextEl.textContent;
    backInputEl.value = backTextEl.textContent;
    frontTextEl.classList.add("is-hidden");
    backTextEl.classList.add("is-hidden");
    frontInputEl.classList.remove("is-hidden");
    backInputEl.classList.remove("is-hidden");
    frontInputEl.focus();
    buttonEl.textContent = "Confirm";
    buttonEl.dataset.editing = "true";
    return;
  }

  const front = frontInputEl.value.trim();
  const back = backInputEl.value.trim();
  const MAX_CHARS = 120;
  if (!front || !back) {
    alert("Front and back cannot be empty.");
    return;
  }
  if (front.length > MAX_CHARS || back.length > MAX_CHARS) {
    alert("Each side must be 120 characters or less.");
    return;
  }

  const res = await fetch(`/decks/${setId}/flashcards/${cardId}/edit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ front, back }),
  });

  const data = await res.json().catch(() => ({ success: false }));
  if (!data.success) {
    alert("Update failed");
    return;
  }

  frontTextEl.textContent = front;
  backTextEl.textContent = back;
  frontInputEl.classList.add("is-hidden");
  backInputEl.classList.add("is-hidden");
  frontTextEl.classList.remove("is-hidden");
  backTextEl.classList.remove("is-hidden");
  buttonEl.innerHTML = '<img src="/images/Edit%204.svg" alt="" class="card-action-icon" aria-hidden="true">';
  buttonEl.dataset.editing = "false";
}

