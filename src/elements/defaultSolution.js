/**
 * Stores the prebuilt elements for the default solution option
 */

const outputPanel = document.getElementById('output');

const STATUS = {
    SUCCESS: {
        title: 'Ran Successfully!',
        id: 'success',
    },
    FAILED: {
        title: 'Run Failed',
        id: 'failure',
    },
}

export function insertDefaultSolution(json) {
    if (isJSONSolution()) {
        document.getElementById("json").remove();
    }

    // get the status
    const resStatus = json.status;

    if (resStatus.includes("terminated")) {
        const errors = json.logs;
        const exitCode = resStatus.replace(/\D/g, ""); // get only the number

        failure(errors, exitCode);
    } else {
        const solution = json.solution;

        success(solution);
    }
}

export function insertJSONSolution(json) {
    // if we are currently displaying the default solution, remove it
    if (isDefaultSolution()) {
        Array.from(document.getElementsByClassName('default-outcome')).forEach(el => el.remove());
    }

    const jsonSolution = () => {
        if (isJSONSolution()) {
            return document.getElementById('json');
        }

        const res = document.createElement('pre');
        res.setAttribute('id', 'json');
        outputPanel.appendChild(res);
        return res;
    };

    jsonSolution().innerText = JSON.stringify(json, null, 2);
}

export function isDefaultSolution() {
    return document.getElementsByClassName("default-outcome").length !== 0;
}

export function isJSONSolution() {
    return document.getElementById("json") !== null;
}

function success(solution) {
    // first we insert the header
    insertHeader(STATUS.SUCCESS);

    // then we insert the solution
    solution.forEach(sol => {
        const text = Object.entries(sol)
            .map(([k, v]) => {
                if (v === undefined || v === null) return `${k} = null`;
                if (typeof v === 'object') return `${k} = ${JSON.stringify(v)}`;
                return `${k} = ${v}`;
            })
            .join(', ');
        insertItem(STATUS.SUCCESS, text);
    });
}

function failure(errors, exitCode) {
    // first we insert the header
    insertHeader(STATUS.FAILED);

    // insert the status code
    insertItem(STATUS.FAILED, `Exit code: ${exitCode}`);
    // outputPanel.appendChild(document.createElement('hr'));

    // then we insert the errors
    errors.forEach(error => {
        insertItem(STATUS.FAILED, error);
    });
}

function insertHeader(status) {
    // Remove any existing outcome elements
    const oldHeader = document.getElementById('outcomeHeader');
    if (oldHeader !== null) {
        oldHeader.remove();
    }

    // Remove any leftover solution items
    Array.from(document.getElementsByClassName('default-outcome')).forEach(el => el.remove());

    // Build fresh header
    const header = document.createElement('div');
    const title = document.createElement('h3');

    header.classList.add('default-outcome', status.id);
    header.id = 'outcomeHeader';

    title.innerText = status.title;

    header.appendChild(title);
    outputPanel.appendChild(header);
}

function insertItem(status, text) {
    const item = document.createElement('div');
    const description = document.createElement('pre');

    item.classList.add('default-outcome', 'outcome-solution');

    description.innerText = status === STATUS.SUCCESS
    ? `Solution: ${text.length === 0 ? "NONE" : text}`
    : text;

    item.appendChild(description);

    outputPanel.appendChild(item);
}