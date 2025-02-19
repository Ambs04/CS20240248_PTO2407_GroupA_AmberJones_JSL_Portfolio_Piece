// TASK: import helper functions from utils
import "./utils/taskFunctions.js";
// TASK: import initialData
import { initialData } from "./initialData.js";
import { deleteTask } from "./utils/taskFunctions.js";

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}

// TASK: Get elements from the DOM
const elements = {
  sideBarDiv: document.getElementById("side-bar-div"),
  sideBarBottom: document.getElementsByClassName("side-bar-bottom"),
  toggleDiv: document.getElementById("toggle-div"),
  hideSideBarDiv: document.getElementById("hide-side-bar-div"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeSwitch: document.getElementById("label-checkbox-theme"),
  header: document.getElementById("header"),
  headerBoardName: document.getElementById("header-board-name"),
  dropDownBtn: document.getElementById("dropdownbtn"),
  addNewTaskBtn: document.getElementById("add-new-task-btn"),
  editBoardBtn: document.getElementById("edit-board-btn"),
  editBoardDiv: document.getElementById("editBoardDiv"),
  deleteBoardBtn: document.getElementById("deleteBoardBtn"),
  todoHeadDiv: document.getElementById("todo-head-div"),
  toDoText: document.getElementById("toDoText"),
  tasksContainers: document.getElementsByClassName("tasks-container"),
  //newTaskModalWindow: document.getElementById("new-task-modal-window"),
  titleInput: document.getElementById("title-input"),
  descInput: document.getElementById("desc-input"),
  selectStatus: document.getElementById("select-status"),
  createTaskBtn: document.getElementById("create-task-btn"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
  editTaskModalWindow: document.querySelector(".edit-task-modal-window"),
  editTaskForm: document.getElementById("edit-task-form"),
  editTaskTitleInput: document.getElementById("edit-task-title-input"),
  editTaskDescInput: document.getElementById("edit-task-desc-input"),
  editSelectStatus: document.getElementById("edit-select-status"),
  saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"),
  filterDiv: document.getElementById("filterDiv"),
  modalWindow: document.getElementById("new-task-modal-window"),
  //taskTitle: document.getElementById("title-input"),
  //taskDesc: document.getElementById("desc-input"),
  columnDivs: document.querySelectorAll(".column-div"),
  headlineSidepanel: document.getElementById("headline-sidepanel"),
  //addNewTaskBtn: document.getElementById("add-new-task-btn"),
};

console.log(initialData);
let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks"));
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    filterAndDisplayTasksByBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ""; // Clears the container
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = JSON.parse(localStorage.getItem("tasks")); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter((task) => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach((column) => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks
      .filter((task) => task.status === status)
      .forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute("data-task-id", task.id);

        // Listen for a click event on each task and open a modal
        taskElement.addEventListener("click", () => {
          openEditTaskModal(task);
        });

        tasksContainer.appendChild(taskElement);
      });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").forEach((btn) => {
    if (btn.textContent === boardName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(
    `.column-div[data-status="${task.status}"]`
  );
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`
    );
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.innerHTML = `${task.title}`; // Modify as needed
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild(taskElement);
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.addEventListener("click", () => {
    toggleModal(false, elements.editTaskModal);
  });

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => {
    toggleSidebar(false);
    elements.sideBarDiv.style.display = "none";
    elements.showSideBarBtn.style.display = "block";
  });
  elements.showSideBarBtn.addEventListener("click", () => {
    toggleSidebar(true);
    elements.sideBarDiv.style.display = "block";
  });

  // Theme switch event listener
  elements.themeSwitch.addEventListener("change", () => {
    toggleTheme();
  });

  // Show Add New Task Modal event listener
  elements.addNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener("submit", function (event) {
    addTask(event);
    elements.modalWindow.style.display = "none";
    console.log(initialData);
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? "block" : "none";
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();
  const tasks = JSON.parse(localStorage.getItem("tasks"));
  const nextId = tasks.reduce((max, task) => Math.max(max, task.id), 0);

  console.log(nextId);
  //Assign user input to the task object
  const newTask = {
    id: nextId,
    title: elements.titleInput.value,
    description: elements.descInput.value,
    status: elements.selectStatus.value,
    board: activeBoard,
  };

  if (newTask) {
    addTaskToUI(newTask);
    tasks.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    //console.log(tasks);
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}

function toggleSidebar(show) {}

let activeTheme = localStorage.getItem("theme");

function toggleTheme() {
  if (activeTheme === "dark") {
    activeTheme = "dark";
  } else {
    activeTheme = "light";
  }
  localStorage.setItem("theme", activeTheme);
  applyTheme();
  console.log(activeTheme);
}

function applyTheme() {
  if (activeTheme === "light") {
    document.body.classList.add("light-theme");
  } else {
    document.body.classList.remove("light-theme");
  }
}

function openEditTaskModal(task) {
  // Set task details in modal inputs
  //const tasks = JSON.parse(localStorage.getItem("tasks"));
  // console.log(tasks);
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;

  // Get button elements from the task modal
  elements.cancelEditBtn.addEventListener("click", () => {
    elements.editTaskModalWindow.style.display = "none";
  });
  // Call saveTaskChanges upon click of Save Changes button
  elements.saveTaskChangesBtn.addEventListener("click", () => {
    patchTask(task.id);
  });
  // Delete task using a helper function and close the task modal
  elements.deleteTaskBtn.addEventListener("click", () => {
    deleteTask(task.id);
    elements.editTaskModalWindow.style.display = "none";
    console.log(initialData);
    //refreshTasksUI;
  });

  toggleModal(true, elements.editTaskModalWindow); // Show the edit task modal
}

function patchTask(taskId) {
  const tasks = JSON.parse(localStorage.getItem("tasks"));

  let editTask = tasks.find((task) => task.id === taskId);

  let updatedTask = {
    title: elements.editTaskTitleInput.value,
    description: elements.editTaskDescInput.value,
    status: elements.editSelectStatus.value,
  };

  editTask.title = updatedTask.title || editTask.title;
  editTask.description = updatedTask.description || editTask.description;
  editTask.status = updatedTask.status || editTask.status;

  saveTaskChanges(tasks);
}

function saveTaskChanges(taskId) {
  // Get new user inputs

  localStorage.setItem("tasks", JSON.stringify(updatedTask));

  // const title = elements.editTaskTitleInput.value;
  // const description = elements.editTaskDescInput.value;
  // const status = elements.editSelectStatus.value;

  // Create an object with the updated task details

  // Update task using a helper functoin
  //patchTask(tasks.id, updatedTask);
  // Close the modal and refresh the UI to reflect the changes
  elements.editTaskModalWindow.style.display = "none";
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener("DOMContentLoaded", function () {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  // const isLightTheme = localStorage.getItem("light-theme") === "enabled";
  // document.body.classList.toggle("light-theme", isLightTheme);
  applyTheme();
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
