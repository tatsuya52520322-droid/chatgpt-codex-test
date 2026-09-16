"use strict";

(() => {
  const STORAGE_KEY = "chatgpt-codex-test.todos.v1";
  const form = document.querySelector("#task-form");
  const input = document.querySelector("#task-input");
  const inputError = document.querySelector("#input-error");
  const list = document.querySelector("#task-list");
  const count = document.querySelector("#task-count");
  const emptyMessage = document.querySelector("#empty-message");
  const storageMessage = document.querySelector("#storage-message");

  function showStorageMessage(message) {
    storageMessage.textContent = message;
    storageMessage.hidden = !message;
  }

  function loadTasks() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === null) return [];

      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || !parsed.every((task) =>
        task !== null && typeof task === "object" &&
        typeof task.text === "string" && task.text.trim() !== "" &&
        typeof task.completed === "boolean"
      )) {
        throw new Error("Invalid saved tasks");
      }

      return parsed.map((task) => ({ text: task.text, completed: task.completed }));
    } catch {
      showStorageMessage("保存したタスクを読み込めませんでした。ブラウザの保存設定をご確認ください。");
      return [];
    }
  }

  let tasks = loadTasks();

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      showStorageMessage("");
    } catch {
      showStorageMessage("変更を保存できませんでした。再読み込みすると今回の変更が失われます。ブラウザの保存設定や空き容量をご確認ください。");
    }
  }

  function updateSummary() {
    const completed = tasks.filter((task) => task.completed).length;
    count.textContent = `${tasks.length}件中 ${completed}件完了`;
    emptyMessage.hidden = tasks.length > 0;
  }

  function renderTasks() {
    list.replaceChildren();

    tasks.forEach((task) => {
      const item = document.createElement("li");
      item.className = "task-item";
      item.classList.toggle("is-completed", task.completed);

      const label = document.createElement("label");
      label.className = "task-label";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox";
      checkbox.checked = task.completed;
      const text = document.createElement("span");
      text.className = "task-text";
      // Treat task input as plain text, including strings that look like HTML.
      text.textContent = task.text;
      label.append(checkbox, text);

      checkbox.addEventListener("change", () => {
        task.completed = checkbox.checked;
        item.classList.toggle("is-completed", task.completed);
        saveTasks();
        updateSummary();
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "delete-button";
      deleteButton.textContent = "削除";
      deleteButton.setAttribute("aria-label", `${task.text}を削除`);
      deleteButton.addEventListener("click", () => {
        const nextFocus = item.nextElementSibling?.querySelector("button")
          || item.previousElementSibling?.querySelector("button") || input;
        tasks = tasks.filter((entry) => entry !== task);
        item.remove();
        saveTasks();
        updateSummary();
        nextFocus.focus();
      });

      item.append(label, deleteButton);
      list.append(item);
    });

    updateSummary();
  }

  input.addEventListener("input", () => {
    input.removeAttribute("aria-invalid");
    inputError.hidden = true;
    inputError.textContent = "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      input.setAttribute("aria-invalid", "true");
      inputError.textContent = "タスクを入力してください。空白だけでは追加できません。";
      inputError.hidden = false;
      input.focus();
      return;
    }

    tasks.push({ text, completed: false });
    saveTasks();
    renderTasks();
    input.value = "";
    input.focus();
  });

  renderTasks();
})();
