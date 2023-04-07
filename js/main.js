const ONE_DAY = 86400000;

class ParseError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
function parseParams() {
    const paramsList = ["room", "refdate", "names", "tasks", "duration"];
    const params = new URLSearchParams(window.location.search);
    const version = parseInt(params.get("v"));
    if (version != 1) {
        throw new ParseError(`You are living in the future, or in a glitch. Invalid/Unsupported version string '${version}'`);
    }
    for (const param of paramsList) {
        if (!params.has(param)) {
            throw new ParseError(`You look incomplete. Missing parameter '${param}' in URL.`)
        }
    }
    return {
        "version": version,
        "roomName": params.get("room"),
        "startDate": new Date(params.get("refdate")),
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

class ChoreAssigner {
    constructor(data) {
        this.startDate = data.startDate;
        this.tasks = data.tasks;
        this.users = data.users;
        this.cycleDuration = data.duration * ONE_DAY;
    }

    getCycleIndex(date) {
        if (date < this.startDate) {
            throw new ParseError("Shouldn't be calculating indices from the past. Something wrong with dates.");
        }
        return Math.floor( (date - this.startDate) / this.cycleDuration);
    }
    getAssignmentForDate(date) {
        const cycleIndex = this.getCycleIndex(date);
        let tasksList = [], usersList = [];
        for (let index = 0; index < this.tasks.length; index++) {
            const task = this.tasks[index];
            const user = this.users[(cycleIndex+index) % this.users.length];
            tasksList.push(task);
            usersList.push(user);
        }
        return {
            "tasks": tasksList,
            "users": usersList
        };
    }
    getDaysLeft(date) {
        const startDay = this.startDate.getDay();
        const currentDay = date.getDay();
        const daysLeft = startDay > currentDay ? startDay-currentDay-1 : startDay+6-currentDay;
        return daysLeft;
    }
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
function updateTasksContainer(date, assigner, container) {
    const assignment = assigner.getAssignmentForDate(date);
    container.innerHTML = '';
    const tasks = assignment.tasks;
    const users = assignment.users;
    for (let index = 0; index < tasks.length; index++) {
        container.innerHTML += generateTaskHTML(tasks[index], users[index]);
    }
}

function updateDaysLeft(daysLeft, container) {
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
