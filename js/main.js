const startDate = new Date(2023, 2, 6);
const tasks = ["Kitchen", "Bathroom", "Floor"];
const users = ["Arjun", "Akil", "Anand"];
const ONE_WEEK = 604800000;

function parseParams() {
    const params = new URLSearchParams(window.location.search);
    const version = parseInt(params.get("v"));
    if (version != 1) {
        throw new Error("Invalid/Unsupported version string");
    }
    return {
        "version": version,
        "roomName": params.get("room"),
        "startDate": new Date(params.get("reftime")),
        "users": params.get("names").split(","),
        "tasks": params.get("tasks").split(","),
        "duration": parseInt(params.get("duration"))
    };
}
function validateParams(params) {
    return (
        params.startDate < Date.now() &&
        params.users.length > 0 &&
        params.tasks.length > 0 &&
        params.duration > 0
    );
}

function weeksBetween(date1, date2) {
    const duration = date1 > date2? date1 - date2 : date2 - date1;
    return Math.floor( duration / ONE_WEEK);
}

function generateTaskHTML(task, user) {
    const content = `
    <div class="col">
        <h5>${task}</h5>
        <p>${user}</p>
    </div>
    `;
    return content;
}
function updateTasksContainer(date, container) {
    const numWeeks = weeksBetween(date, startDate);
    container.innerHTML = '';

    for (let index = 0; index < tasks.length; index++) {
        const task = tasks[index];
        const user = users[(numWeeks+index) % users.length];
        container.innerHTML += generateTaskHTML(task, user);
    }
}

function getDaysLeft(date) {
   const startDay = startDate.getDay();
   const currentDay = date.getDay();
   const daysLeft = startDay > currentDay ? startDay-currentDay-1 : startDay+6-currentDay;
   return daysLeft;
}
function updateDaysLeft(date, container) {
    const daysLeft = getDaysLeft(date);
    if (daysLeft == 1) {
        container.innerHTML = `1 day left`;
    } else {
        container.innerHTML = `${daysLeft} days left`;
    }
    if (1 <= daysLeft && daysLeft < 4) {
        container.classList.add("bg-warning");
        container.classList.add("text-dark");
    }
    if (daysLeft < 1) {
        container.classList.add("bg-danger");
    }
}

updateTasksContainer(Date.now(), document.getElementById("current-tasks"));
updateTasksContainer(Date.now()-ONE_WEEK, document.getElementById("previous-tasks"));
updateTasksContainer(Date.now()+ONE_WEEK, document.getElementById("next-tasks"));
updateDaysLeft(new Date(), document.getElementById("days-left"));
