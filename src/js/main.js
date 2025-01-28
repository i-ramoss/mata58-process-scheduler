// Estrutura de dados para armazenar os processos
const processes = [];

// Referências aos elementos do HTML
// Inputs dos dados do processo
const executionTimeInput = document.getElementById('executionTime');
const pagesInput = document.getElementById('pages');
const deadlineInput = document.getElementById('deadline');
const arrivalTimeInput = document.getElementById('arrivalTime');
const addProcessBtn = document.getElementById('addProcessBtn');

// Tabela de processos
const processTableDiv = document.getElementById('processTable');

// Adiciona processo à lista (sem apagar dados)
addProcessBtn.addEventListener('click', () => {
    const id = processes.length + 1;

    const newProcess = {
        id: 'P' + id,
        executionTime: parseInt(executionTimeInput.value, 10),
        pages: parseInt(pagesInput.value, 10),
        deadline: parseInt(deadlineInput.value, 10),
        arrival: parseInt(arrivalTimeInput.value, 10),
    };
    processes.push(newProcess);
    console.log('processes', processes);
    renderProcessTable();
});

// Função para renderizar a lista de processos criados
function renderProcessTable() {
    let html =
        "<table border='1' cellpadding='5'><tr><th>ID</th><th>Tempo de execução</th><th>Páginas</th><th>Deadline</th><th>Chegada</th></tr>";

    processes.forEach((proc) => {
        html += `<tr>
          <td>${proc.id}</td>
          <td>${proc.executionTime}</td>
          <td>${proc.pages}</td>
          <td>${proc.deadline}</td>
          <td>${proc.arrival}</td>
        </tr>`;
    });

    html += '</table>'; // Fecha a tabela
    processTableDiv.innerHTML = html;
}

// Renderiza a tabela vazia de processos
// TODO: da para já deixar no HTML e só preencher os valores com JS
renderProcessTable();

// TODO: Implementar a lógica do escalonador
