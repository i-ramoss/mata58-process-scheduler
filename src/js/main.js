import {
    initializeProcessPageTable,
    ensureProcessPagesInRAM,
    renderMemory,
    ramMemory,
    diskMemory,
    resetMemories,
} from "./memory.js";

// Estrutura de dados para armazenar os processos
const processes = [
    {
        id: "P1",
        executionTime: 4,
        pages: 5,
        deadline: 7,
        arrival: 0,
        pageTable: [],
    },
    {
        id: "P2",
        executionTime: 2,
        pages: 5,
        deadline: 5,
        arrival: 2,
        pageTable: [],
    },
    {
        id: "P3",
        executionTime: 1,
        pages: 5,
        deadline: 2,
        arrival: 4,
        pageTable: [],
    },
    {
        id: "P4",
        executionTime: 3,
        pages: 5,
        deadline: 10,
        arrival: 6,
        pageTable: [],
    },
];
const roundRobinReadyQueue = [];

// Referências aos elementos HTML que interagem com os dados dos processos
const executionTimeInput = document.getElementById("executionTime");
const pagesInput = document.getElementById("pages");
const deadlineInput = document.getElementById("deadline");
const arrivalTimeInput = document.getElementById("arrivalTime");
const addProcessBtn = document.getElementById("addProcessBtn");

// Tabela onde os processos serão exibidos na interface
const processTableDiv = document.getElementById("processTable");

// Inputs adicionais para parâmetros de execução do escalonamento
const quantumInput = document.getElementById("quantum");
const overheadInput = document.getElementById("overhead");
const speedRange = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");
const schedulingAlgorithmSelected = document.getElementById("schedulingAlgorithm");

// Botões de ação para interagir com o escalonador
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

// Div que exsibe o gráfico de Gantt com a execução dos processos
const ganttChart = document.getElementById("ganttChart");

// Evento disparado ao clicar para adicionar um novo processo
addProcessBtn.addEventListener("click", () => {
    const id = processes.length + 1;

    // Cria um novo processo a partir dos dados fornecidos nos campos de input
    const newProcess = {
        id: "P" + id,
        executionTime: parseInt(executionTimeInput.value, 10),
        pages: parseInt(pagesInput.value, 10),
        deadline: parseInt(deadlineInput.value, 10),
        arrival: parseInt(arrivalTimeInput.value, 10),
        pageTable: [],
    };

    initializeProcessPageTable(newProcess);

    processes.push(newProcess);
    renderProcessTable();
    renderMemory();
});

// Atualiza o valor exibido da velocidade com base no input do usuário
speedRange.addEventListener("input", () => {
    speedValue.textContent = speedRange.value + " ms";
});

// Evento disparado ao clicar no botão "Iniciar Execução"
startBtn.addEventListener("click", () => {
    if (processes.length === 0) {
        alert("Adicione ao menos um processo!");
        return;
    }

    // Desabilita o botão de iniciar para evitar múltiplas exec
    startBtn.disabled = true;

    // Limpa a memória e a tabela de página de todos os processos
    ramMemory.fill(null);
    diskMemory.fill(null);

    processes.forEach(process => {
        process.pageTable = [];
        initializeProcessPageTable(process);
    });

    renderMemory(); // Atualiza a interface da memória
    runScheduling(); // Inicia a execução dos processos
});

resetBtn.addEventListener("click", () => {
    startBtn.disabled = false; // Habilita o botão de iniciar
    // Limpa a lista de processos
    // processes.length = 0;

    // Remove a tabela de processos da interface
    // processTableDiv.innerHTML = "";

    // Limpa o gráfico de Gantt
    ganttChart.innerHTML = "";

    // Limpa a memória
    resetMemories();

    // Reseta o Turnaround Médio
    document.getElementById("averageTurnaround").textContent = "Turnaround Médio: -";
});

// Função para simular um atraso na execução de um processo (usada para a animação)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para renderizar a lista de processos na interface
function renderProcessTable() {
    let html =
        "<table border='1' cellpadding='5'><tr><th>ID</th><th>Chegada</th><th>Tempo de execução</th><th>Deadline</th><th>Páginas</th></tr>";

    // Cria a tabela de processos com os dados preenchidos
    processes.forEach(proc => {
        html += `<tr>
          <td>${proc.id}</td>
          <td>${proc.arrival}</td>
          <td>${proc.executionTime}</td>
          <td>${proc.deadline}</td>
          <td>${proc.pages}</td>
        </tr>`;
    });

    html += "</table>"; // Fecha a tabela
    processTableDiv.innerHTML = html; // Exibe a tabela no HTML
}

// Função para criar as linhas do gráfico de Gantt para cada processo
function createGanttRowsForProcesses(processList) {
    // Limpa o gráfico de Gantt antes de adicionar novos processos
    ganttChart.innerHTML = "";

    const processRows = {};

    processList.forEach(currentProcess => {
        // Cria um container para a linha de cada processo no gráfico
        const rowContainer = document.createElement("div");
        rowContainer.classList.add("gantt-row");

        // Cria um label para identificar o processo ao lado da linha
        const label = document.createElement("div");
        label.classList.add("gantt-label");
        label.textContent = currentProcess.id + " : ";
        rowContainer.appendChild(label);

        // Cria um container para armazenar os blocos do gráfico de Gantt
        const blocksContainer = document.createElement("div");
        blocksContainer.classList.add("gantt-blocks-container");
        rowContainer.appendChild(blocksContainer);

        // Adiciona essa linha no gráfico de Gantt
        ganttChart.appendChild(rowContainer);

        // Armazena a referência dessa linha para atualizações futuras
        processRows[currentProcess.id] = blocksContainer;
    });

    return processRows;
}

// Função para criar um bloco no gráfico de Gantt
function createGanttBlock(type) {
    const block = document.createElement("div");
    block.classList.add("gantt-block");

    // Adiciona classes específicas para cada tipo de bloco (waiting, execution, etc)
    if (type === "waiting") {
        block.classList.add("waiting");
    } else if (type === "execution") {
        block.classList.add("execution");
    } else if (type === "overhead") {
        block.classList.add("overhead");
    } else if (type === "noArrived") {
        block.classList.add("no-arrived");
    } else if (type === "pageFault") {
        block.classList.add("page-fault");
    }

    return block;
}

// Função que verifica se todos os processos foram executados
function allDone(listOfProcessToBeExecuted) {
    return listOfProcessToBeExecuted.every(process => process.remainingTime <= 0);
}

// Função para obter o próximo processo a ser executado usando FIFO
function getNextProcessFIFO(processList, currentTime) {
    // Filtra e ordena os processos pela ordem de chegada
    const sortedProcesses = processList
        .filter(p => p.arrival <= currentTime && p.remainingTime > 0)
        .sort((a, b) => a.arrival - b.arrival);

    return sortedProcesses.length > 0 ? sortedProcesses[0] : null; // Retorna o primeiro processo da lista
}

// Função para obter o próximo processo a ser executado usando o algoritmo SJF
function getNextProcessSJF(processList, currentTime, currentProcess) {
    // Filtra os processos que chegaram e ainda não terminaram
    const readyProcesses = processList.filter(p => p.arrival <= currentTime && p.remainingTime > 0);

    if (readyProcesses.length === 0) return null; // Retorna null se não houver processos prontos

    // Se já existe um processo em execução e ele ainda não terminou, retorna ele
    if (currentProcess && currentProcess.remainingTime > 0) {
        return currentProcess;
    }

    // Retorna o processo com o menor tempo de execução
    // Se houver empate, retorna o processo que chegou primeiro
    return readyProcesses.reduce((shortest, process) => {
        if (process.executionTime < shortest.executionTime) return process;
        else if (process.executionTime === shortest.executionTime)
            return process.arrival < shortest.arrival ? process : shortest;
        else return shortest;
    });
}

function updateRoundRobinReadyQueue(processList, currentTime, currentProcess) {
    processList.forEach(process => {
        if (
            process.arrival <= currentTime &&
            process.remainingTime > 0 &&
            process !== currentProcess &&
            !roundRobinReadyQueue.includes(process)
        ) {
            roundRobinReadyQueue.push(process);
        }
    });
}

// Função para obter o próximo processo a ser executado usando o algoritmo RR (Round Robin)
function getNextProcessRR(processList, currentTime, currentProcess, quantum) {
    // Atualiza a fila com os processos que acabaram de chegar
    updateRoundRobinReadyQueue(processList, currentTime, currentProcess);

    // Se o processo atual ainda tem quantum restante, continua executando-o
    if (currentProcess && currentProcess.remainingTime > 0 && currentProcess.quantumCounter < quantum) {
        return currentProcess;
    } else {
        // Se o processo atual foi preemptado e ainda precisa ser executado, insere-o no final da fila
        if (currentProcess && currentProcess.remainingTime > 0 && currentProcess.quantumCounter >= quantum) {
            currentProcess.quantumCounter = 0;
            roundRobinReadyQueue.push(currentProcess);
        }
    }

    if (roundRobinReadyQueue.length > 0) {
        return roundRobinReadyQueue.shift();
    } else {
        // Garantir que nenhum processo será perdido (caso algum processo chegue durante o overhead)
        updateRoundRobinReadyQueue(processList, currentTime, currentProcess);
        return roundRobinReadyQueue.shift() || null;
    }
}

// Função para obter o próximo processo usando o algoritmo EDF (Earliest Deadline First)
function getNextProcessEDF(processList, currentTime) {
    // Filtra os processos que já chegaram e ainda não foram concluídos
    const readyProcesses = processList.filter(p => p.arrival <= currentTime && p.remainingTime > 0);

    if (readyProcesses.length === 0) return null; // Nenhum processo disponível no momento

    // Ordena os processos pela menor deadline absoluta
    readyProcesses.sort((a, b) => a.individualDeadline - b.individualDeadline);

    return readyProcesses[0]; // Retorna o processo com o menor deadline
}

// Determina qual algoritmo de escalonamento será usado
function handleNextProcess(schedulingAlgorithm, processList, currentTime, quantum, currentProcess) {
    switch (schedulingAlgorithm) {
        case "SJF":
            return getNextProcessSJF(processList, currentTime, currentProcess);
        case "FIFO":
            return getNextProcessFIFO(processList, currentTime);
        case "RR":
            return getNextProcessRR(processList, currentTime, currentProcess, quantum);
        case "EDF":
            return getNextProcessEDF(processList, currentTime);
        default:
            alert("Algoritmo não implementado");
    }
}

function drawBlocksWhenCpuIsIdle(processList, processRows, currentTime) {
    processList.forEach(process => {
        if (process.remainingTime > 0) {
            if (process.arrival <= currentTime) {
                const waitingBlock = createGanttBlock("waiting");
                processRows[process.id].appendChild(waitingBlock);
            } else {
                const noArrivedBlock = createGanttBlock("noArrived");
                processRows[process.id].appendChild(noArrivedBlock);
            }
        }
    });
}

function drawWaitingOrNoArrivedBlocks(processList, currentProcess, processRows, currentTime) {
    processList.forEach(process => {
        if (process.id !== currentProcess.id && process.remainingTime > 0) {
            if (process.arrival <= currentTime) {
                const waitingBlock = createGanttBlock("waiting");
                processRows[process.id].appendChild(waitingBlock);
            } else {
                const noArrivedBlock = createGanttBlock("noArrived");
                processRows[process.id].appendChild(noArrivedBlock);
            }
        }
    });
}

function calculateAverageTurnaroundTime(processList) {
    // Calcula o turnaround médio
    const totalTurnaroundTime = processList.reduce((sum, process) => {
        return sum + (process.finishTime - process.arrival);
    }, 0);

    const averageTurnaroundTime = totalTurnaroundTime / processList.length;

    // Exibe o turnaround médio na interface
    document.getElementById("averageTurnaround").textContent = `Turnaround Médio: ${averageTurnaroundTime.toFixed(2)}`;
}

// Função principal que executa o escalonamento dos processos
async function runScheduling() {
    let listOfProcessToBeExecuted = processes.map(process => ({
        ...process,
        remainingTime: process.executionTime,
        finishTime: 0,
        individualDeadline: process.arrival + process.deadline,
        quantumCounter: 0,
    }));

    // Cria as linhas do gráfico para cada processo
    const processRows = createGanttRowsForProcesses(listOfProcessToBeExecuted);

    // Variáveis de controle do tempo e do último processo executado
    const overheadTime = parseInt(overheadInput.value, 10) || 1;
    const schedulingAlgorithm = schedulingAlgorithmSelected.value;
    const quantum = parseInt(quantumInput.value, 10) || 2;

    let currentTime = 0;
    let currentProcess = null;

    // Loop que simula a execução do escalonamento dos processos
    while (!allDone(listOfProcessToBeExecuted)) {
        const newProcess = handleNextProcess(
            schedulingAlgorithm,
            listOfProcessToBeExecuted,
            currentTime,
            quantum,
            currentProcess
        );

        if (!newProcess) {
            drawBlocksWhenCpuIsIdle(listOfProcessToBeExecuted, processRows, currentTime);

            currentTime++;
            await sleep(speedRange.value);
            continue;
        }

        // Verifica preempção por deadline:
        if (
            schedulingAlgorithm === "EDF" &&
            currentProcess &&
            currentProcess.id !== newProcess.id &&
            currentProcess.remainingTime > 0
        ) {
            console.log(`💡 Preempção por deadline: ${currentProcess.id} → ${newProcess.id} em t=${currentTime}`);

            for (let i = 0; i < overheadTime; i++) {
                processRows[currentProcess.id].appendChild(createGanttBlock("overhead"));

                drawWaitingOrNoArrivedBlocks(listOfProcessToBeExecuted, currentProcess, processRows, currentTime);

                currentTime++;
                // await sleep(speedRange.value);
            }
            currentProcess.quantumCounter = 0;
        }

        // Atualiza o processo em execução para o novo processo que foi escolhido
        currentProcess = newProcess;

        const pageFault = ensureProcessPagesInRAM(listOfProcessToBeExecuted, currentProcess, currentTime);

        if (pageFault !== 0) {
            for (let i = 0; i < pageFault; i++) {
                processRows[currentProcess.id].appendChild(createGanttBlock("pageFault"));

                drawWaitingOrNoArrivedBlocks(listOfProcessToBeExecuted, currentProcess, processRows, currentTime);

                currentTime++;
                updateRoundRobinReadyQueue(listOfProcessToBeExecuted, currentTime, currentProcess);
                // await sleep(speedRange.value);
            }
        }

        // Atualiza os blocos de waiting para os processos que não estão sendo executados
        drawWaitingOrNoArrivedBlocks(listOfProcessToBeExecuted, currentProcess, processRows, currentTime);

        // Cria o bloco de execução para o processo atual
        const executionBlock = createGanttBlock("execution");

        // Verifica a previsão de término e se o deadline foi ultrapassado
        const willFinishTime = currentTime + 1;
        if (
            (schedulingAlgorithm === "RR" || schedulingAlgorithm === "EDF") &&
            willFinishTime > currentProcess.individualDeadline
        ) {
            executionBlock.classList.add("deadline-exceeded");
        }

        // Adiciona o bloco de execução no gráfico de Gantt
        processRows[currentProcess.id].appendChild(executionBlock);

        currentTime++;
        currentProcess.remainingTime--;

        if (currentProcess.remainingTime <= 0) {
            currentProcess.finishTime = currentTime;
            currentProcess.quantumCounter = 0;
        } else if (schedulingAlgorithm === "RR" || schedulingAlgorithm === "EDF") {
            // Se preemptivo e o processo ainda não terminou, gerencia o contador de quantum APENAS APÓS A EXECUÇÃO
            currentProcess.quantumCounter++;

            if (currentProcess.quantumCounter >= quantum) {
                console.log(
                    `🚀 Preempção por quantum: ${currentProcess.id} → ${currentProcess.id} em t=${currentTime}`
                );

                for (let i = 0; i < overheadTime; i++) {
                    processRows[currentProcess.id].appendChild(createGanttBlock("overhead"));

                    drawWaitingOrNoArrivedBlocks(listOfProcessToBeExecuted, currentProcess, processRows, currentTime);

                    currentTime++;
                    // await sleep(speedRange.value);

                    // Atualiza a lista de processos do RR (caso algum processo já tenha chegado durante o overhead)
                    updateRoundRobinReadyQueue(listOfProcessToBeExecuted, currentTime, currentProcess);
                }
                // Zera o contador e força a seleção de um novo processo na próxima iteração
                currentProcess.quantumCounter = 0;
                currentProcess = null;
            }
        }

        await sleep(speedRange.value);
    }

    // Calcula o turnaround médio
    calculateAverageTurnaroundTime(listOfProcessToBeExecuted);
    // Habilita o botão de iniciar após finalizar a execução
    startBtn.disabled = false;
}

// Temporário (usado para processos já instanciados em código)
processes.forEach(initializeProcessPageTable);

// Renderiza a tabela vazia de processos
renderProcessTable();
