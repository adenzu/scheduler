const width = 7;
let intervalSize = 1;
let intervals = 0;

let totals = {};
let watcheds = {};
let plannedCounts = {};

let tempTotals = {};
let tempWatcheds = {};

let debugLimit = 100;

document.addEventListener("DOMContentLoaded", () => {
    addInterval(intervalSize);
    addGhostInterval(intervalSize);

    const resetButton = document.getElementById("reset-button");
    resetButton.addEventListener("click", () => {
        reset();
        resetGhosts();
    });

    const increaseButton = document.getElementById("increase-button");
    increaseButton.addEventListener("click", () => {
        increaseIntervalSize();
        resetGhosts();
    });

    const decreaseButton = document.getElementById("decrease-button");
    decreaseButton.addEventListener("click", () => {
        decreaseIntervalSize();
        resetGhosts();
    });
});

function increaseIntervalSize() {
    const container = document.getElementById("original-container");
    addRow(container.children[0], intervalSize);
    intervalSize++;
}

function decreaseIntervalSize() {
    if (intervalSize > 1) {
        intervalSize--;
        popLastRow();
    }
}

function reset() {
    const container = document.getElementById("original-container");
    container.innerHTML = "";
    intervals = 0;
    intervalSize = 1;
    totals = {};
    watcheds = {};
    plannedCounts = {};
    localStorage.clear();
    addInterval(intervalSize);
};

function popLastRow() {
    const container = document.getElementById("original-container");
    const grid = container.children[0];
    const rows = grid.children;

    for (let i = 0; i < 9; i++) {
        if (rows[rows.length - 1]) {
            if (rows[rows.length - 1].classList.contains("box")) {
                const backgroundImage = rows[rows.length - 1].style.backgroundImage;
                const plannedCountKey = `${backgroundImage}-${rows[rows.length - 1].dataset.week}-${rows[rows.length - 1].dataset.index}`;

                if (plannedCounts[plannedCountKey]) {
                    const plannedCount = plannedCounts[plannedCountKey];
                    watcheds[backgroundImage] = watcheds[backgroundImage] - plannedCount;
                    delete plannedCounts[plannedCountKey];
                }
            }
            grid.removeChild(rows[rows.length - 1]);
        }
    }
}

function addInterval(size) {
    const container = document.getElementById("original-container");

    const grid = document.createElement("grid");
    grid.classList.add("grid");
    container.appendChild(grid);

    addRow(grid, 0).innerText = `${intervals + 1}`;
    for (let i = 1; i < size; i++) {
        addRow(grid, i);
    }

    intervals++;
}

function addRow(element, index) {
    const preHeader = document.createElement("h1");
    element.appendChild(preHeader);

    for (let i = 0; i < width; i++) {
        element.appendChild(addBox(i, index));
    }

    const postHeader = document.createElement("h1");
    element.appendChild(postHeader);

    return preHeader;
}

function addBox(index, week) {
    const box = document.createElement("div");
    box.classList.add("box");
    box.innerHTML = "<span>+</span>";
    box.dataset.index = index;
    box.dataset.week = week;
    box.onclick = () => addImage(box);
    return box;
}

function resetGhosts() {
    const container = document.getElementById("ghost-container");
    container.innerHTML = "";
    intervals = 1;
    tempTotals = JSON.parse(JSON.stringify(totals));
    tempWatcheds = JSON.parse(JSON.stringify(watcheds));

    console.log("tempTotals", tempTotals);
    console.log("tempWatcheds", tempWatcheds);
    console.log("totals", totals);
    console.log("watcheds", watcheds);
    console.log("plannedCounts", plannedCounts);
    console.log("intervalSize", intervalSize);

    while (addGhostInterval(intervalSize));
}

function addGhostInterval(size) {
    if (debugLimit-- <= 0) {
        return false;
    }

    const shouldContinue = tempTotals && Object.keys(tempTotals).length > 0;
    const container = document.getElementById("ghost-container");

    const grid = document.createElement("grid");
    grid.classList.add("grid");
    container.appendChild(grid);

    addGhostRow(grid, 0).innerText = `${intervals + 1}`;
    for (let i = 1; i < size; i++) {
        addGhostRow(grid, i);
    }

    intervals++;
    return shouldContinue;
}

function addGhostRow(element, index) {
    const interval = document.getElementById("original-container").children[0];
    const preHeader = document.createElement("h1");

    element.appendChild(preHeader);
    for (let i = 0; i < width; i++) {
        const backgroundImage = interval.children[index * (width + 2) + 1 + i].style.backgroundImage;
        const plannedCountKey = `${backgroundImage}-${index}-${i}`;

        if (plannedCounts[plannedCountKey] && tempTotals[backgroundImage]) {
            const plannedCount = plannedCounts[plannedCountKey];
            tempWatcheds[backgroundImage] = tempWatcheds[backgroundImage] + plannedCount;

            if (tempWatcheds[backgroundImage] > tempTotals[backgroundImage]) {
                element.appendChild(addGhostBox());
                tempWatcheds[backgroundImage] = tempTotals[backgroundImage];
            }
            else {
                element.appendChild(addGhostBox(backgroundImage));
            }

            if (tempWatcheds[backgroundImage] == tempTotals[backgroundImage]) {
                delete tempTotals[backgroundImage];
                delete tempWatcheds[backgroundImage];
            }
        }
        else {
            element.appendChild(addGhostBox());
        }
    }

    const postHeader = document.createElement("h1");
    element.appendChild(postHeader);

    return preHeader;
}

function addGhostBox(backgroundImage) {
    const box = document.createElement("div");
    box.classList.add("ghost-box");
    box.style.backgroundImage = backgroundImage;
    box.style.backgroundSize = "cover";
    box.style.backgroundPosition = "center";
    return box;
}

function getbackgroundImage(url) {
    return `url("${url}")`;
}

function addImage(element) {
    const imageUrl = prompt("Enter image URL:");

    let total = totals[getbackgroundImage(imageUrl)];
    let watched = watcheds[getbackgroundImage(imageUrl)];

    if (!total || !watched) {
        total = prompt("Enter total episodes:");
        watched = prompt("Enter watched episode:");
    }

    let plannedCount = prompt("Enter planned episode:");

    if (imageUrl && total && watched && plannedCount) {
        total = parseInt(total);
        watched = parseInt(watched);
        plannedCount = parseInt(plannedCount);

        if (isNaN(total) || isNaN(watched) || isNaN(plannedCount)) {
            alert("Please enter valid numbers for total, watched, and planned episodes.");
            return;
        }

        if (total < 0 || watched < 0 || plannedCount <= 0) {
            alert("Please enter non-negative numbers for total, watched, and planned episodes.");
            return;
        }

        element.style.backgroundImage = getbackgroundImage(imageUrl);
        element.style.backgroundSize = "cover";
        element.style.backgroundPosition = "center";
        element.innerHTML = "";

        watched += plannedCount;
        if (watched > total) {
            watched = total;
        }

        totals[element.style.backgroundImage] = total;
        watcheds[element.style.backgroundImage] = watched;
        plannedCounts[`${element.style.backgroundImage}-${element.dataset.week}-${element.dataset.index}`] = plannedCount;

        element.onclick = () => popImage(element);

        resetGhosts();
    }
    else {
        alert("Please enter a valid image URL and episode numbers.");
    }
}

function popImage(element) {
    const backgroundImage = element.style.backgroundImage;
    const plannedCountKey = `${backgroundImage}-${element.dataset.week}-${element.dataset.index}`;

    if (plannedCounts[plannedCountKey]) {
        const plannedCount = plannedCounts[plannedCountKey];
        watcheds[backgroundImage] = watcheds[backgroundImage] - plannedCount;
        delete plannedCounts[plannedCountKey];
    }

    // Remove when all lanned counts are removed

    element.style.backgroundImage = "none";
    element.innerHTML = "<span>+</span>";
    element.onclick = () => addImage(element);

    resetGhosts();
}
