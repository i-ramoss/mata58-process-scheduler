import { initializeProcessPageTable, ensureProcessPagesInRAM, renderMemory } from "./memory.js";

// Estrutura de dados para armazenar os processos
//const processes = [];
// Estrutura de dados para armazenar os processos
const processes = [
    {
        id: "P1",
        executionTime: 5,
        pages: 10,
        deadline: 10,
        arrival: 0,
        pageTable: [
            {
                pageNumber: 0,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 1,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 2,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 3,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 4,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 5,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 6,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 7,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 8,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 9,
                inRAM: false,
                memoryFrameIndex: null,
            },
        ],
    },
    {
        id: "P2",
        executionTime: 4,
        pages: 10,
        deadline: 7,
        arrival: 2,
        pageTable: [
            {
                pageNumber: 0,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 1,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 2,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 3,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 4,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 5,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 6,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 7,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 8,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 9,
                inRAM: false,
                memoryFrameIndex: null,
            },
        ],
    },
    {
        id: "P3",
        executionTime: 4,
        pages: 10,
        deadline: 3,
        arrival: 2,
        pageTable: [
            {
                pageNumber: 0,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 1,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 2,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 3,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 4,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 5,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 6,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 7,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 8,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 9,
                inRAM: false,
                memoryFrameIndex: null,
            },
        ],
    },
    {
        id: "P4",
        executionTime: 2,
        pages: 10,
        deadline: 4,
        arrival: 5,
        pageTable: [
            {
                pageNumber: 0,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 1,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 2,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 3,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 4,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 5,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 6,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 7,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 8,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 9,
                inRAM: false,
                memoryFrameIndex: null,
            },
        ],
    },
    {
        id: "P5",
        executionTime: 5,
        pages: 10,
        deadline: 20,
        arrival: 0,
        pageTable: [
            {
                pageNumber: 0,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 1,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 2,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 3,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 4,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 5,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 6,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 7,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 8,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 9,
                inRAM: false,
                memoryFrameIndex: null,
            },
        ],
    },
    {
        id: "P6",
        executionTime: 5,
        pages: 10,
        deadline: 20,
        arrival: 0,
        pageTable: [
            {
                pageNumber: 0,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 1,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 2,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 3,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 4,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 5,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 6,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 7,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 8,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 9,
                inRAM: false,
                memoryFrameIndex: null,
            },
        ],
    },
    {
        id: "P7",
        executionTime: 5,
        pages: 10,
        deadline: 20,
        arrival: 0,
        pageTable: [
            {
                pageNumber: 0,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 1,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 2,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 3,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 4,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 5,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 6,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 7,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 8,
                inRAM: false,
                memoryFrameIndex: null,
            },
            {
                pageNumber: 9,
                inRAM: false,
                memoryFrameIndex: null,
            },
        ],
    },
];

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

// Div que exibe o gráfico de Gantt com a execução dos processos
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
        alert("Adicione ao menos um processo!"); // Alerta se não houver processos
        return;
    }

    runScheduling(); // Inicia a execução dos processos
});

// Função para simular um atraso na execução de um processo (usada para a animação)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para renderizar a lista de processos na interface
function renderProcessTable() {
    let html =
        "<table border='1' cellpadding='5'><tr><th>ID</th><th>Tempo de execução</th><th>Páginas</th><th>Deadline</th><th>Chegada</th></tr>";

    // Cria a tabela de processos com os dados preenchidos
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
    }
    // TODO: adicionar else if para page fault

    // Nunca estava sendo acessado de fato
    // Marca o bloco como "deadline-exceeded" caso o processo ultrapasse o prazo, exceto para FIFO ou SJF
    // if ((algorithm !== "FIFO" && algorithm !== "SJF") && type === "execution") {
    //     block.classList.add("deadline-exceeded");
    // }

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
function getNextProcessSJF(processList, currentTime) {
    // Filtra os processos que chegaram e ainda não terminaram
    const readyProcesses = processList.filter(p => p.arrival <= currentTime && p.remainingTime > 0);

    if (readyProcesses.length === 0) return null; // Retorna null se não houver processos prontos

    // Retorna o processo com o menor tempo de execução
    return readyProcesses.reduce((shortest, process) =>
        process.executionTime < shortest.executionTime ? process : shortest
    );
}

// Função para obter o próximo processo a ser executado usando o algoritmo RR (Round Robin)
function getNextProcessRR(processList, currentTime, quantum, lastProcess) {
    // Filtra os processos prontos para execução
    const readyProcesses = processList.filter(p => p.arrival <= currentTime && p.remainingTime > 0);

    if (readyProcesses.length === 0) return null; // Retorna null se não houver processos prontos

    // Encontra o índice do último processo executado
    const lastIndex = processList.findIndex(p => p.id === (lastProcess ? lastProcess.id : null));

    // Inicia a busca pelo próximo processo após o último executado
    let nextIndex = (lastIndex + 1) % processList.length;

    // Procura o próximo processo pronto para execução
    for (let i = 0; i < processList.length; i++) {
        const process = processList[nextIndex];
        if (process.arrival <= currentTime && process.remainingTime > 0) {
            return process; // Retorna o próximo processo pronto
        }
        nextIndex = (nextIndex + 1) % processList.length; // Avança para o próximo processo na lista
    }

    return null; // Retorna null se não houver processos para executar
}

// Função para obter o próximo processo usando o algoritmo EDF (Earliest Deadline First)
function getNextProcessEDF(processList, currentTime, quantum) {
    // Filtra os processos que já chegaram e ainda não foram concluídos
    const readyProcesses = processList.filter(p => p.arrival <= currentTime && p.remainingTime > 0);

    if (readyProcesses.length === 0) return null; // Nenhum processo disponível no momento

    // Ordena os processos pela menor deadline absoluta
    const sortedProcesses = readyProcesses.sort((a, b) => a.deadline - b.deadline);

    const nextProcess = sortedProcesses[0]; // Pega o processo com o menor deadline

    // Verifica se o tempo de execução do próximo processo não ultrapassa o quantum
    if (nextProcess.remainingTime > quantum) {
        nextProcess.remainingTime = quantum;
    }

    return nextProcess;
}

// Função principal que executa o escalonamento dos processos
async function runScheduling() {
    // Cria uma cópia da lista de processos, adicionando dados necessários para execução
    let listOfProcessToBeExecuted = processes.map(currentProcess => ({
        ...currentProcess,
        remainingTime: currentProcess.executionTime,
        finishTime: 0,
        individualDeadline: currentProcess.arrival + currentProcess.deadline,
    }));

    // Cria as linhas do gráfico para cada processo
    const processRows = createGanttRowsForProcesses(listOfProcessToBeExecuted);

    // Variáveis de controle do tempo e do último processo executado
    const overheadTime = parseInt(overheadInput.value, 10) || 0;
    const schedulingAlgorithm = schedulingAlgorithmSelected.value;
    const quantum = 2; // Definido para 2 por padrão

    let currentTime = 0;
    let lastProcess = null;

    // Loop que simula a execução do escalonamento dos processos
    while (!allDone(listOfProcessToBeExecuted)) {
        let currentProcess = null;

        // Determina qual algoritmo de escalonamento será usado
        switch (schedulingAlgorithm) {
            case "SJF":
                currentProcess = getNextProcessSJF(listOfProcessToBeExecuted, currentTime);
                break;
            case "FIFO":
                currentProcess = getNextProcessFIFO(listOfProcessToBeExecuted, currentTime);
                break;
            case "RR":
                currentProcess = getNextProcessRR(listOfProcessToBeExecuted, currentTime, quantum, lastProcess);
                break;
            case "EDF":
                currentProcess = getNextProcessEDF(listOfProcessToBeExecuted, currentTime, quantum);
                break;
            default:
                alert("Algoritmo não implementado");
                return; // Interrompe a execução caso o algoritmo não esteja implementado
        }

        if (currentProcess) {
            // TODO: atualizar currentTime com o retorno da função (adicionando ou não page faults)
            ensureProcessPagesInRAM(currentProcess, currentTime);
            // currentTime = ensureProcessPagesInRAM(currentProcess, currentTime);
        } else {
            console.log(`🔥 não tem processo para ser executado no tempo: ${currentTime}`);

            // Se não há processo para executar no momento, adiciona blocos de waiting/noArrived
            listOfProcessToBeExecuted.forEach(process => {
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

            // Incrementa o tempo atual e aguarda para a visualização
            currentTime++;
            await sleep(speedRange.value);
            continue;
        }

        // Adiciona blocos de overhead caso haja troca de processo (apenas RR e EDF)
        if (
            lastProcess &&
            lastProcess !== currentProcess &&
            overheadTime > 0 &&
            (schedulingAlgorithm == "RR" || schedulingAlgorithm == "EDF")
        ) {
            console.log("lastProcess", lastProcess);

            for (let i = 0; i < overheadTime; i++) {
                const overheadBlock = createGanttBlock("overhead");
                processRows[lastProcess.id].appendChild(overheadBlock);

                listOfProcessToBeExecuted.forEach(process => {
                    if (process.id !== lastProcess.id && process.remainingTime > 0) {
                        if (process.arrival <= currentTime) {
                            const waitingBlock = createGanttBlock("waiting");
                            processRows[process.id].appendChild(waitingBlock);
                        } else {
                            const noArrivedBlock = createGanttBlock("noArrived");
                            processRows[process.id].appendChild(noArrivedBlock);
                        }
                    }
                });

                currentTime++;
                await sleep(speedRange.value);
            }
        }

        // Atualiza os blocos de waiting para os processos que não estão sendo executados
        listOfProcessToBeExecuted.forEach(process => {
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

        // Cria o bloco de execução para o processo atual
        const executionBlock = createGanttBlock("execution");

        // Verifica a previsão de término e se o deadline foi ultrapassado
        const willFinishTime = currentTime + 1;
        if (
            !(schedulingAlgorithm === "FIFO" || schedulingAlgorithm === "SJF") &&
            willFinishTime > currentProcess.individualDeadline
        ) {
            executionBlock.classList.add("deadline-exceeded");
        }

        // Adiciona o bloco de execução no gráfico de Gantt
        processRows[currentProcess.id].appendChild(executionBlock);

        // Atualiza o tempo e a quantidade restante do processo
        currentTime++;
        currentProcess.remainingTime--;

        // Marca o processo como concluído quando o tempo restante for zero
        if (currentProcess.remainingTime <= 0) {
            currentProcess.finishTime = currentTime;
        }

        // Aguarda antes de passar para o próximo ciclo
        await sleep(speedRange.value);

        lastProcess = currentProcess;
    }

    // Após a execução, calcula o turnaround de cada processo
    listOfProcessToBeExecuted.forEach(process => {
        process.turnaroundTime = process.finishTime - process.arrival;
    });

    // Calcula o turnaround médio
    const totalTurnaroundTime = listOfProcessToBeExecuted.reduce((sum, process) => {
        return sum + process.turnaroundTime;
    }, 0);

    const averageTurnaroundTime = totalTurnaroundTime / listOfProcessToBeExecuted.length;

    // Exibe o turnaround médio na interface
    document.getElementById("averageTurnaround").textContent = `Turnaround Médio: ${averageTurnaroundTime.toFixed(2)}`;
}

// Temporário (usado para processos já instanciados em código)
processes.forEach(initializeProcessPageTable);

// Renderiza a tabela vazia de processos
renderProcessTable();