// Inicializa os arrays de ram e disco com posições nulas
const ramMemory = new Array(50).fill(null);
const diskMemory = new Array(100).fill(null);

function renderMemory() {
    const ramGrid = document.getElementById("ramGrid");
    const diskGrid = document.getElementById("diskGrid");

    ramGrid.innerHTML = "";
    diskGrid.innerHTML = "";

    // Cria os blocos de memória RAM
    ramMemory.forEach((frame, index) => {
        const block = document.createElement("div");
        block.classList.add("memory-block");

        if (frame) {
            block.classList.add("ram-block");
            block.innerHTML = `<span>${frame.processId}</span>`;
        } else {
            block.classList.add("empty-block");
            block.innerHTML = `<span>-</span>`;
        }

        // Cria label que indica a posição da memória
        const positionLabel = document.createElement("div");
        positionLabel.classList.add("memory-position");
        positionLabel.textContent = index;
        block.appendChild(positionLabel);

        ramGrid.appendChild(block);
    });

    // Cria os blocos de memória do disco
    diskMemory.forEach((frame, index) => {
        const block = document.createElement("div");
        block.classList.add("memory-block");

        if (frame) {
            block.classList.add("disk-block");
            block.innerHTML = `<span>${frame.processId}</span>`;
        } else {
            block.classList.add("empty-block");
            block.innerHTML = `<span>-</span>`;
        }

        // Cria label que indica a posição da memória
        const positionLabel = document.createElement("div");
        positionLabel.classList.add("memory-position");
        positionLabel.textContent = index;
        block.appendChild(positionLabel);

        diskGrid.appendChild(block);
    });
}

renderMemory();
