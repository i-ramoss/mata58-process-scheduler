export const ramMemory = new Array(50).fill(null); // RAM com 50 slots
export const diskMemory = new Array(100).fill(null); // Disco com 100 slots

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
});

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
    }
    renderMemory();
}

// Garantir que todas as páginas do processo estejam na memória RAM para que ele possa ser executado
export function ensureProcessPagesInRAM(process, currentTime) {
    const updatedCurrentTime = loadProcessPagesToRAM(process, currentTime);

    // Atualiza os blocos de memória
    renderMemory();

    return updatedCurrentTime;
}

// Carrega as páginas do processo na memória RAM (se não estiverem lá) e retorna o tempo atualizado (em caso de page fault)
export function loadProcessPagesToRAM(processList, currentProcess, currentTime) {
    let hasPageFault = false;

    currentProcess.pageTable.forEach(processPage => {
        // Adiciona a página na memória RAM, caso já não esteja
        if (!processPage.inRAM) {
            hasPageFault = true;

            const freeFrameIndex = ramMemory.findIndex(frame => frame === null);

            if (freeFrameIndex !== -1) {
                // Remove a página do disco
                removePageFromDisk(currentProcess.id, processPage.pageNumber);

                ramMemory[freeFrameIndex] = {
                    processId: currentProcess.id,
                    processPageNumber: processPage.pageNumber,
                    arrivalTime: currentTime,
                    lastUsedTime: currentTime,
                };

                processPage.inRAM = true;
                processPage.memoryFrameIndex = freeFrameIndex;
            } else {
                // Não encontrou espaço vazio na memória RAM - Aplicar substituição
                handlePageReplacement(processList, currentProcess.id, processPage.pageNumber, currentTime);
            }
        }
    });
    // Atualiza os blocos de memória
    renderMemory();

    return hasPageFault ? DEFAULT_PAGE_FAULT_TIME : 0;
}

function movePageToDisk(processId, pageNumber) {
    const pageIsAlreadyInDisk = diskMemory.find(
        frame => frame && frame.processId === processId && frame.pageNumber === pageNumber
    );

    if (pageIsAlreadyInDisk) return;

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

function handlePageReplacement(processList, processId, pageNumber, currentTime) {
    const pageReplacementAlgorithm = document.getElementById("pageReplacementAlgorithm").value;

    if (pageReplacementAlgorithm === "FIFO") {
        replacePageByFIFO(processList, processId, pageNumber, currentTime);
    } else if (pageReplacementAlgorithm === "LRU") {
        replacePageByLRU(processList, processId, pageNumber, currentTime);
    }
}

// Implementação do LRU
function replacePageByLRU(processList, processId, pageNumber, currentTime) {
    let lruPage = null;
    let lruIndex = -1;

    // Encontre a página LRU mais antiga na RAM
    ramMemory.forEach((frame, index) => {
        if (frame && (!lruPage || frame.lastUsedTime < lruPage.lastUsedTime)) {
            lruPage = frame;
            lruIndex = index;
        }
    });

    // Se encontramos uma página LRU, substituímos
    if (lruPage !== null && lruIndex !== -1) {
        console.log(`Substituindo página de processo ${processId} (página ${lruPage.processPageNumber})`);

        // Primeiro, move a página LRU para o disco
        movePageToDisk(lruPage.processId, lruPage.processPageNumber);

        // Remove a página da RAM
        ramMemory[lruIndex] = null;

        // Coloca a nova página na RAM
        ramMemory[lruIndex] = {
            processId: processId,
            processPageNumber: pageNumber,
            arrivalTime: currentTime,
            lastUsedTime: currentTime, // Atualiza o tempo de uso da página
        };

        // Atualiza o pageTable do processo
        const processToUpdate = processList.find(p => p.id === processId);
        const pageToUpdate = processToUpdate?.pageTable.find(p => p.pageNumber === pageNumber);
        pageToUpdate.inRAM = true;
        pageToUpdate.memoryFrameIndex = lruIndex;
    } else {
        console.error("Não foi possível encontrar a página LRU para substituir.");
    }
}

// Implementação do FIFO
function replacePageByFIFO(processList, processId, pageNumber, currentTime) {
    // Verifica se há páginas na RAM
    if (ramMemory.length === 0) {
        console.error("Erro: Memória RAM vazia.");
        return;
    }

    // Encontra a página mais antiga (FIFO)
    let oldestPageIndex = 0;
    let oldestTime = ramMemory[0].arrivalTime;

    for (let i = 1; i < ramMemory.length; i++) {
        if (ramMemory[i].arrivalTime < oldestTime) {
            oldestTime = ramMemory[i].arrivalTime;
            oldestPageIndex = i;
        }
    }

    // Pega a página que será removida da RAM
    const removedPage = ramMemory[oldestPageIndex];

    // Atualiza a tabela de páginas do processo removido RAM -> Disco
    const selectedProcess = processList.find(process => process.id === removedPage.processId);
    if (selectedProcess) {
        const selectedProcessPage = selectedProcess.pageTable.find(
            page => page.pageNumber === removedPage.processPageNumber
        );

        if (selectedProcessPage) {
            selectedProcessPage.inRAM = false;
            selectedProcessPage.memoryFrameIndex = null;
        }
    }

    // Move a página removida para o disco
    movePageToDisk(removedPage.processId, removedPage.processPageNumber);

    // Substitui pela nova página do processo
    ramMemory[oldestPageIndex] = {
        processId: processId,
        processPageNumber: pageNumber,
        arrivalTime: currentTime,
        lastUsedTime: currentTime,
    };

    // Atualiza a tabela de páginas do processo substituído Disco -> RAM
    const replacedProcess = processList.find(process => process.id === processId);
    if (replacedProcess) {
        const replacedProcessPage = replacedProcess.pageTable.find(page => page.pageNumber === pageNumber);
        if (replacedProcessPage) {
            replacedProcessPage.inRAM = true;
            replacedProcessPage.memoryFrameIndex = oldestPageIndex;
        }
    }

    // Remove a página substituída do disco
    removePageFromDisk(processId, pageNumber);

    renderMemory();
}

renderMemory();
