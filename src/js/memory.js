// Inicializa os arrays de ram e disco com posições nulas
const ramMemory = new Array(50).fill(null);
const diskMemory = new Array(100).fill(null);

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");


const DEFAULT_PAGE_FAULT_TIME = 2;

resetBtn.addEventListener("click", () => {
    const ramGrid = document.getElementById("ramGrid");
    const diskGrid = document.getElementById("diskGrid");

    // Reseta o conteúdo do grid
    ramMemory.fill(null);
    diskMemory.fill(null);

    renderMemory();
})
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

// Garantir que todas as páginas do processo estejam na memória RAM para que ele possa ser executado
export function ensureProcessPagesInRAM(process, currentTime) {
    // console.log("🚀 ~ currentTime:", currentTime);
    const updatedCurrentTime = loadProcessPagesToRAM(process, currentTime);
    // console.log("🚀 ~ updatedCurrentTime:", updatedCurrentTime);

    // Atualiza os blocos de memória
    renderMemory();

    return updatedCurrentTime;
}

// Carrega as páginas do processo na memória RAM (se não estiverem lá) e retorna o tempo atualizado (em caso de page fault)
export function loadProcessPagesToRAM(process, currentTime) {
    let pageFaultTime = 0;

    process.pageTable.forEach(processPage => {
        // Adiciona a página na memória RAM, caso já não esteja
        if (!processPage.inRAM) {
            // Tempo extra de acesso ao disco
            pageFaultTime += DEFAULT_PAGE_FAULT_TIME;

            // Tentativa de encontrar um espaço vazio
            const freeFrameIndex = ramMemory.findIndex(frame => frame === null);

            // Encontrou espaço vazio (page === null)
            if (freeFrameIndex !== -1) {
                // Remove a página do disco
                removePageFromDisk(process.id, processPage.pageNumber);

                // Carrega página na RAM
                ramMemory[freeFrameIndex] = {
                    processId: process.id,
                    processPageNumber: processPage.pageNumber,
                    arrivalTime: currentTime, // Tempo de chegada na memória
                    lastUsedTime: currentTime, // Último acesso à essa página
                };

                processPage.inRAM = true;
                processPage.memoryFrameIndex = freeFrameIndex;
            } else {
                // Não encontrou espaço vazio na memória RAM - Aplicar substituição
                console.log("✅ Não encontrou espaço vazio na memória RAM - Aplicar substituição");
                handlePageReplacement(process.id, processPage.pageNumber, currentTime);
            }
        }
    });

    // Atualiza os blocos de memória
    renderMemory();

    return currentTime + pageFaultTime;
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

function removePageFromDisk(processId, pageNumber) {
    const filledFrameIndex = diskMemory.findIndex(
        frame => frame && frame.processId === processId && frame.pageNumber === pageNumber
    );

    if (filledFrameIndex !== -1) {
        diskMemory[filledFrameIndex] = null;
    } else {
        console.error("Página não encontrada no disco");
    }
}

function replacePageByFIFO(processId, pageNumber, currentTime) {
    const freeFrameIndex = ramMemory.findIndex(frame => frame === null);    

    if (freeFrameIndex !== -1) {
        ramMemory[freeFrameIndex] = {
            processId: processId,
            processPageNumber: pageNumber,
            arrivalTime: currentTime, // Tempo de chegada na memória
            lastUsedTime: currentTime, // Último acesso à essa página
        };                  
    }

    removePageFromDisk(processId, pageNumber);
}




function handlePageReplacement(processId, pageNumber, currentTime) {
    const pageReplacementAlgorithm = document.getElementById("pageReplacementAlgorithm").value;

    if (pageReplacementAlgorithm === "FIFO") {
        replacePageByFIFO(processId, pageNumber, currentTime);
    } else if (pageReplacementAlgorithm === "LRU") {
        replacePageByLRU(processId, pageNumber, currentTime);
    }
}



function replacePageByLRU(processId, pageNumber, currentTime) {
    return;
}

renderMemory();
