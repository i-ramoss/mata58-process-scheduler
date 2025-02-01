// Inicializa os arrays de ram e disco com posições nulas
const ramMemory = new Array(50).fill(null);
const diskMemory = new Array(100).fill(null);

export function renderMemory() {
    const ramGrid = document.getElementById("ramGrid");
    const diskGrid = document.getElementById("diskGrid");

    // Reseta o conteúdo do grid
    ramGrid.innerHTML = "";
    diskGrid.innerHTML = "";

    // Cria os blocos de memória RAM
    ramMemory.forEach((page, index) => {
        const block = document.createElement("div");
        block.classList.add("memory-block");

        if (page) {
            block.classList.add("ram-block");
            block.innerHTML = `<span>${page.processId}</span>`;
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
    diskMemory.forEach((page, index) => {
        const block = document.createElement("div");
        block.classList.add("memory-block");

        if (page) {
            block.classList.add("disk-block");
            block.innerHTML = `<span>${page.processId}</span>`;
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

export function initializeProcessPageTable(process) {
    for (let pageNumber = 0; pageNumber < process.pages; pageNumber++) {
        process.pageTable.push({
            pageNumber: pageNumber,
            inRAM: false,
            memoryFrameIndex: null,
        });

        movePageToDisk(process.id, pageNumber);
        renderMemory(); // TODO: it's not necessary later
    }
}
}

function movePageToDisk(processId, pageNumber) {
    let freeFrameIndex = diskMemory.findIndex(frame => frame === null);

    if (freeFrameIndex !== -1) {
        diskMemory[freeFrameIndex] = {
            processId: processId,
            pageNumber: pageNumber,
        };
    } else {
        console.error("Disco cheio");
    }
}

renderMemory();
