// Estrutura de dados para armazenar os processos
const processes = [];

// Referências aos elementos do HTML
const executionTimeInput = document.getElementById("executionTime");
const pagesInput = document.getElementById("pages");
const deadlineInput = document.getElementById("deadline");
const arrivalTimeInput = document.getElementById("arrivalTime");
const addProcessBtn = document.getElementById("addProcessBtn");
const processTableDiv = document.getElementById("processTable");
const quantumInput = document.getElementById("quantum");
const overheadInput = document.getElementById("overhead");
const speedRange = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");
const schedulingSelect = document.getElementById("schedulingAlgorithm");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const ganttChart = document.getElementById("ganttChart");

// Adiciona processo à lista (sem apagar dados)
addProcessBtn.addEventListener("click", () => {
    const id = processes.length + 1;

    const newProcess = {
        id: "P" + id,
        executionTime: parseInt(executionTimeInput.value, 10),
        pages: parseInt(pagesInput.value, 10),
        deadline: parseInt(deadlineInput.value, 10),
        arrival: parseInt(arrivalTimeInput.value, 10),
    };

    processes.push(newProcess);
    console.log("processes", processes);
    renderProcessTable();
});

// Atualiza valor exibido da velocidade
speedRange.addEventListener("input", () => {
    speedValue.textContent = speedRange.value + " ms";
});

// Renderiza a tabela de processos
function renderProcessTable() {
    let html = "<table border='1' cellpadding='5'><tr><th>ID</th><th>Tempo de execução</th><th>Páginas</th><th>Deadline</th><th>Chegada</th></tr>";

    processes.forEach(proc => {
        html += `<tr>
          <td>${proc.id}</td>
          <td>${proc.executionTime}</td>
          <td>${proc.pages}</td>
          <td>${proc.deadline}</td>
          <td>${proc.arrival}</td>
        </tr>`;
    });

    html += "</table>"; // Fecha a tabela
    processTableDiv.innerHTML = html;
}

// Cria uma linha no gráfico de Gantt para cada processo
function createGanttRowsForProcesses(processList) {
    ganttChart.innerHTML = "";

    const processRows = {};

    processList.forEach(currentProcess => {
        const rowContainer = document.createElement("div");
        rowContainer.classList.add("gantt-row");

        const label = document.createElement("div");
        label.classList.add("gantt-label");
        label.textContent = currentProcess.id + " : ";
        rowContainer.appendChild(label);

        const blocksContainer = document.createElement("div");
        blocksContainer.classList.add("gantt-blocks-container");
        rowContainer.appendChild(blocksContainer);

        ganttChart.appendChild(rowContainer);

        processRows[currentProcess.id] = blocksContainer;
    });

    return processRows;
}

// Cria um bloco para as linhas dos processos no gráfico
function createGanttBlock(type, text, deadlineExceeded = false) {
    const block = document.createElement("div");
    block.classList.add("gantt-block");

    if (type === "waiting") {
        block.classList.add("waiting");
    } else if (type === "execution") {
        block.classList.add("execution");
    } else if (type === "overhead") {
        block.classList.add("overhead");
    } else if (type === "noArrived") {
        block.classList.add("no-arrived");
    }

    if (deadlineExceeded) {
        block.classList.add("deadline-exceeded");
    }

    return block;
}

// Checa se todos os processos já foram executados
function allDone(listOfProcessToBeExecuted) {
    return listOfProcessToBeExecuted.every(process => process.remainingTime <= 0);
}

// Função principal de execução do escalonamento
async function runScheduling() {
    const selectedAlgorithm = schedulingSelect.value; // Obtém o algoritmo selecionado
    
    if (selectedAlgorithm === "FIFO") {
        await runFIFO();
    } else if (selectedAlgorithm === "EDF") {
        await runEDF();
    } else {
        alert("Algoritmo não implementado.");
    }
}

// Lógica de escalonamento FIFO
async function runFIFO() {
    let listOfProcessToBeExecuted = processes.map(currentProcess => ({
        ...currentProcess,
        remainingTime: currentProcess.executionTime,
        finishTime: 0,
        individualDeadline: currentProcess.arrival + currentProcess.deadline,
    }));

    const processRows = createGanttRowsForProcesses(listOfProcessToBeExecuted);

    const overheadTime = parseInt(overheadInput.value, 10) || 0;
    let currentTime = 0;
    let lastProcess = null;
   // Ordena os processos pela chegada
    listOfProcessToBeExecuted.sort((a, b) => a.arrival - b.arrival);
    
    while (!allDone(listOfProcessToBeExecuted)) {
        const readyProcesses = listOfProcessToBeExecuted.filter(process => process.arrival <= currentTime && process.remainingTime > 0);

        if (readyProcesses.length === 0) {
            listOfProcessToBeExecuted.forEach(process => {
                if (process.remainingTime > 0) {
                    if (process.arrival <= currentTime) {
                        const waitingBlock = createGanttBlock("waiting", "");
                        processRows[process.id].appendChild(waitingBlock);
                    } else {
                        const noArrivedBlock = createGanttBlock("noArrived", "");
                        processRows[process.id].appendChild(noArrivedBlock);
                    }
                }
            });
            currentTime++;
            await sleep(speedRange.value);
            continue;
        }

        const currentProcess = readyProcesses[0];

        if (lastProcess && lastProcess !== currentProcess && overheadTime > 0) {
            for (let i = 0; i < overheadTime; i++) {
                const overheadBlock = createGanttBlock("overhead", "");
                processRows[lastProcess.id].appendChild(overheadBlock);

                listOfProcessToBeExecuted.forEach(process => {
                    if (process.id !== lastProcess.id && process.remainingTime > 0) {
                        if (process.arrival <= currentTime) {
                            const waitingBlock = createGanttBlock("waiting", "");
                            processRows[process.id].appendChild(waitingBlock);
                        } else {
                            const noArrivedBlock = createGanttBlock("noArrived", "");
                            processRows[process.id].appendChild(noArrivedBlock);
                        }
                    }
                });

                currentTime++;
                await sleep(speedRange.value);
            }
        }

        listOfProcessToBeExecuted.forEach(process => {
            if (process.id !== currentProcess.id && process.remainingTime > 0) {
                if (process.arrival <= currentTime) {
                    const waitingBlock = createGanttBlock("waiting", "");
                    processRows[process.id].appendChild(waitingBlock);
                } else {
                    const noArrivedBlock = createGanttBlock("noArrived", "");
                    processRows[process.id].appendChild(noArrivedBlock);
                }
            }
        });

        const executionBlock = createGanttBlock("execution", currentProcess.id);

        const willFinishTime = currentTime + 1;
        if (willFinishTime > currentProcess.individualDeadline) {
            executionBlock.classList.add("deadline-exceeded");
        }

        processRows[currentProcess.id].appendChild(executionBlock);

        currentTime++;
        currentProcess.remainingTime--;

        if (currentProcess.remainingTime <= 0) {
            currentProcess.finishTime = currentTime;
        }

        await sleep(speedRange.value);

        lastProcess = currentProcess;
    }
}

// Lógica de escalonamento EDF (Earliest Deadline First)
async function runEDF() {
    let listOfProcessToBeExecuted = processes.map(currentProcess => ({
        ...currentProcess,
        remainingTime: currentProcess.executionTime,
        finishTime: 0,
        individualDeadline: currentProcess.arrival + currentProcess.deadline,
    }));

    const processRows = createGanttRowsForProcesses(listOfProcessToBeExecuted);

    const overheadTime = parseInt(overheadInput.value, 10) || 0;
    let currentTime = 0;
    let lastProcess = null;

    while (!allDone(listOfProcessToBeExecuted)) {
        const readyProcesses = listOfProcessToBeExecuted.filter(process => process.arrival <= currentTime && process.remainingTime > 0);

        if (readyProcesses.length === 0) {
            listOfProcessToBeExecuted.forEach(process => {
                if (process.remainingTime > 0) {
                    if (process.arrival <= currentTime) {
                        const waitingBlock = createGanttBlock("waiting", "");
                        processRows[process.id].appendChild(waitingBlock);
                    } else {
                        const noArrivedBlock = createGanttBlock("noArrived", "");
                        processRows[process.id].appendChild(noArrivedBlock);
                    }
                }
            });
            currentTime++;
            await sleep(speedRange.value);
            continue;
        }

        // EDF: ordena os processos prontos pela deadline mais próxima
        const currentProcess = readyProcesses.sort((a, b) => a.deadline - b.deadline)[0];

        if (lastProcess && lastProcess !== currentProcess && overheadTime > 0) {
            for (let i = 0; i < overheadTime; i++) {
                const overheadBlock = createGanttBlock("overhead", "");
                processRows[lastProcess.id].appendChild(overheadBlock);

                listOfProcessToBeExecuted.forEach(process => {
                    if (process.id !== lastProcess.id && process.remainingTime > 0) {
                        if (process.arrival <= currentTime) {
                            const waitingBlock = createGanttBlock("waiting", "");
                            processRows[process.id].appendChild(waitingBlock);
                        } else {
                            const noArrivedBlock = createGanttBlock("noArrived", "");
                            processRows[process.id].appendChild(noArrivedBlock);
                        }
                    }
                });

                currentTime++;
                await sleep(speedRange.value);
            }
        }

        listOfProcessToBeExecuted.forEach(process => {
            if (process.id !== currentProcess.id && process.remainingTime > 0) {
                if (process.arrival <= currentTime) {
                    const waitingBlock = createGanttBlock("waiting", "");
                    processRows[process.id].appendChild(waitingBlock);
                } else {
                    const noArrivedBlock = createGanttBlock("noArrived", "");
                    processRows[process.id].appendChild(noArrivedBlock);
                }
            }
        });

        const executionBlock = createGanttBlock("execution", currentProcess.id);

        const willFinishTime = currentTime + 1;
        if (willFinishTime > currentProcess.individualDeadline) {
            executionBlock.classList.add("deadline-exceeded");
        }

        processRows[currentProcess.id].appendChild(executionBlock);

        currentTime++;
        currentProcess.remainingTime--;

        if (currentProcess.remainingTime <= 0) {
            currentProcess.finishTime = currentTime;
        }

        await sleep(speedRange.value);

        lastProcess = currentProcess;
    }
}

// Função de simulação de atraso de execução de um processo
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Event listener para iniciar a execução
startBtn.addEventListener("click", () => {
    if (processes.length === 0) {
        alert("Adicione ao menos um processo!");
        return;
    }
    runScheduling();
});

// Função para renderizar a tabela vazia de processos
renderProcessTable();
