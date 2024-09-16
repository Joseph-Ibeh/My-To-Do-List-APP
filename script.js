document.addEventListener("DOMContentLoaded", loadTasks);

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

taskForm.addEventListener("submit", addTask);

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach((task) => renderTask(task));
}

function addTask(event) {
  event.preventDefault();

  const taskInput = document.getElementById("taskInput").value.trim();
  const taskDate = document.getElementById("taskDate").value;
  const taskTime = document.getElementById("taskTime").value;
  const taskPriority = document.getElementById("taskPriority").value;

  if (!taskInput || !taskDate || !taskTime || !taskPriority) {
    alert("Please fill all fields");
    return;
  }

  if (Notification.permission !== "granted") {
    Notification.requestPermission().then((permission) => {
      if (permission === "denied") {
        console.log("Notifications denied by the user.");
      }
    });
  }

  const taskDateTimeLocal = new Date(`${taskDate}T${taskTime}`);
  const taskDateTimeUTC = taskDateTimeLocal.toISOString();

  if (isNaN(taskDateTimeLocal.getTime())) {
    alert("Invalid date or time");
    return;
  }

  const task = {
    id: Date.now(),
    text: taskInput,
    dateTimeUTC: taskDateTimeUTC,
    priority: taskPriority,
    done: false,
  };

  saveTask(task);
  renderTask(task);
  taskForm.reset();
}

function renderTask(task) {
  const li = document.createElement("li");
  li.classList.add(`${task.priority}-priority`);
  li.setAttribute("data-id", task.id);
  //Loal time to UTC//
  const taskDateTimeLocal = new Date(task.dateTimeUTC);
  const taskDate = taskDateTimeLocal.toLocaleDateString();
  const taskTime = taskDateTimeLocal.toLocaleTimeString();

  li.innerHTML = `
    <span>${task.text} - ${taskDate} at ${taskTime}</span>
    <button class="completeBtn" onclick="markAsCompleted(this)">Complete</button>
    <button class="deleteBtn">Delete</button>
  `;

  taskList.appendChild(li);

  li.querySelector(".deleteBtn").addEventListener("click", () => {
    li.remove();
    deleteTask(task.id);
  });

  checkForAlarm(task);
}
//save task-Local storage//
function saveTask(task) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function deleteTask(taskId) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.filter((task) => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
//Alarm//
function checkForAlarm(task) {
  const now = new Date();
  const taskDateTime = new Date(task.dateTimeUTC);

  const timeUntilAlarm = taskDateTime - now;

  if (timeUntilAlarm > 0) {
    setTimeout(() => {
      showNotification(task);
    }, timeUntilAlarm);
  } else {
    console.log(`Task "${task.text}" is scheduled for a past time.`);
  }
}
//show Not...//
function showNotification(task) {
  if (Notification.permission === "granted") {
    const taskDateTimeLocal = new Date(task.dateTimeUTC);
    new Notification(`Reminder for task: ${task.text}`, {
      body: `It's time to complete your task scheduled for ${taskDateTimeLocal.toLocaleTimeString()}.`,
      icon: "https://media.istockphoto.com/id/1138248910/vector/checklist-on-a-clipboard-vector-illustration.jpg?s=1024x1024&w=is&k=20&c=6DTfcjp6n35ocwZVdVVzrpbk4ktbJclc97pKDt9b9Wk=",
    });
  }
}
//Mark completed//
function markAsCompleted(button) {
  const listItem = button.parentElement;

  listItem.classList.toggle("completed");

  if (listItem.classList.contains("completed")) {
    alert("Congratulations! 🎉 Task marked as completed.");
  }
}
