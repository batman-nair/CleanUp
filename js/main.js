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
    const validators = {
        startDate: (val) => val <= Date.now(),
        users: (val) => val.length > 1,
        tasks: (val) => val.length > 1,
        duration: (val) => val > 0
    };
    for (const [paramName, validator] of Object.entries(validators)) {
        if (!validator(params[paramName])) {
            throw new ParseError(`What did you pass through as parameters? ${paramName} seems wrong. Got ${params[paramName]}`);
        }
    }
}

class ChoreAssigner {
    constructor(data) {
        this.startDate = data.startDate;
        this.tasks = data.tasks;
        this.users = data.users;
        this.cycleDuration = data.duration; // In days
    }

    getCycleIndex(date) {
        if (date < this.startDate) {
            throw new ParseError(`Shouldn't be calculating indices from the past. Something wrong with dates. Date:${date} StartDate:${this.startDate}`);
        }
        return Math.floor( (date - this.startDate) / (this.cycleDuration * ONE_DAY) );
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
        const daysBetween = Math.floor((date - this.startDate) / ONE_DAY);
        // const startDay = this.startDate.getDay();
        // const currentDay = date.getDay();
        // const daysLeft = startDay > currentDay ? startDay-currentDay-1 : startDay+6-currentDay;
        return this.cycleDuration - (daysBetween % this.cycleDuration);
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
    if (date < assigner.startDate) {
        container.innerHTML = "<p>Nothing assigned.</p>";
        return;
    }
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
    if (1 < daysLeft && daysLeft <= 4) {
        container.classList.add("bg-warning");
        container.classList.add("text-dark");
    }
    else if (daysLeft <= 1) {
        container.classList.add("bg-danger");
    }
}
