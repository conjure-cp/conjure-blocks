/**
 * Stores the prebuilt elements for the solution options.
 * @author JamieASM
 */

// this is the parent panel for any and all solutions
const outputPanel = document.getElementById('output');

// json object that stores status information
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


/**
 * Creates and inserts HTML objects that display a default solution. 'default' solutions are summaries of the json object.
 * @param json The json object returned from the server.
 */
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

/**
 * Creates and inserts a HTML object that just displays the pretty printed JSON solution.
 * @param json The json object to display.
 */
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

/**
 * Checks to see if there are any elements with the class 'default-outcome'
 * @returns {boolean} true indicates that the default solution is currently being displayed, false otherwise.
 */
export function isDefaultSolution() {
    return document.getElementsByClassName("default-outcome").length !== 0;
}

/**
 * Checks to see if there is an element with the id 'json'.
 * @returns {boolean} true indicates that the json solution is currently being displayed, false otherwise.
 */
export function isJSONSolution() {
    return document.getElementById("json") !== null;
}

/**
 * Makes the panel for a default 'success' solution.
 * @param solution The array of solutions.
 */
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

/**
 * Makes the panel for a default 'terminated' solution.
 * @param errors The array of all errors.
 * @param exitCode The termination exit code.
 */
function failure(errors, exitCode) {
    // first we insert the header
    insertHeader(STATUS.FAILED);

    // insert the status code
    insertItem(STATUS.FAILED, `Exit code: ${exitCode}`);

    // then we insert the errors
    errors.forEach(error => {
        insertItem(STATUS.FAILED, error);
    });
}

/**
 * Creates the header panel for the default solution. Either will display 'Ran Successfully' or 'Run Failed'.
 * @param status The json status object.
 */
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

/**
 * Inserts a panel that will display either a solution or an error.
 * @param status The JSON status object.
 * @param text Any extra text that should be inserted.
 */
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